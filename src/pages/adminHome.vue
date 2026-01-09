<template>
  <div id="indexMasterPage" class="relative-position">
    <div>
      <q-tabs
        v-model="tab"
        dense
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="left"
        no-caps
        narrow-indicator
        style="align-items: center"
      >
        <q-tab v-for="(dashboard, index) in dashboards" :key="index" :name="dashboard.name"  :label="dashboard.title" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="tab" v-if="dashboardPermissions" :animated="false" >
        
        <q-tab-panel
          v-for="(dashboard, index) in dashboards"
          :name="dashboard.name"
          v-if="dashboardPermissions"
        >
          <div class="text-h6">{{ dashboard.title }}</div>
          <!--Page Actions-->
          <keep-alive>
            <div class="q-mb-md">
              <page-actions
                :title="$tr($route.meta.title)"
                :tour-name="tourName"
                :excludeActions="excludeActions"
                @toggleDynamicFilterModal="toggleDynamicFilterModal(dashboard.name)"
                :dynamicFilter="dashboard?.filters || []"
                :dynamicFilterValues="getDynamicFilterValues(dashboard.name)"
                :dynamicFilterSummary="dynamicFilterSummary[dashboard.name]"
                @updateDynamicFilterValues="(filters) => updateDynamicFilterValues(dashboard.name, filters)"
                :help="helpText"
              />
            </div>
          </keep-alive>

          <dashboardRenderer
            v-if="showDashboard"
            :key="`dashboard_${dashboard.name}`"
            :dynamicFilterValues="getDynamicFilterValues(dashboard.name)"
            :quickCards="dashboard.quickCards"
          />
        </q-tab-panel>
        
      </q-tab-panels>
    </div>


    



    <!--Activities-->
    <div id="adminHomeActivities" class="col-12 q-mb-md">
      <activities
        system-name="admin_home_actions"
        @loaded="loading = false"
        view="cardImage"
      />
    </div>

    <!--Quick cards-->
    <div v-if="quickCards.list1 && quickCards.list1.length">
      <div class="row q-col-gutter-x-md">
        <!-- QuickCards -->
        <div id="quickCardsContent" class="col-12">
          <div class="row q-col-gutter-md">
            <div
              v-for="(groupQuickCard, key) in quickCards"
              :key="key"
              class="col-12 col-lg-6"
            >
              <div class="row q-col-gutter-y-md full-width">
                <div
                  v-for="(item, keyItem) in groupQuickCard"
                  :key="keyItem"
                  class="col-12"
                >
                  <component
                    :is="item.component"
                    :key="`component${keyItem}`"
                    v-bind="item.props || {}"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!--inner-loading-->
    <inner-loading :visible="loading" />
  </div>
</template>
<script>
import { markRaw } from 'vue';
import dynamicFilter from 'src/modules/qsite/_components/master/dynamicFilter';
import dashboardRenderer from 'src/modules/qsite/_components/master/dashboardRenderer';
import service from 'src/modules/qsite/_components/master/dashboardRenderer/services.ts';
import { helper } from 'src/plugins/utils';

export default {
  created() {
    this.loading = true;
  },
  components: {
    dynamicFilter,
    dashboardRenderer,
  },
  mounted() {
    this.$nextTick(async function () {
      if (this.dashboardPermissions) {
        await this.getDashboardByModule();
        this.excludeActions = [];
      }

      this.token = await helper.getToken();
      this.loading = false;
      this.setQuickCards();
      this.$tour.start(this.tourName);
    });
  },
  data() {
    return {
      showDashboard: false,
      excludeActions: ['refresh', 'filter'],
      configName: `config.dashboard.quickCards`,
      testSchedule: false,
      loading: false,
      quickCards: {},
      tourName: this.$q.platform.is.desktop
        ? 'admin_home_tour'
        : 'admin_home_tour_mobile',
      dynamicFilterValues: [],
      dynamicFilterSummary: [],
      dashboards: {},
      filters: {},
      tab: 'main',
      systemName: 'ramp.passenger-work-orders',
      showDynamicFilterModal: [],
      token: ''
    };
  },
  computed: {
    dashboardPermissions() {
      return this.$hasAccess('isite.dashboard.index');
    },
    helpText() {
      return {
        title: 'Dashboard',
        description: `
          Need help? Check the documentation for more information about the Dashboard.
          ${helper.documentationLink('/docs/agione/dashboard', this.token)}
        `,
      };
    },
  },
  methods: {
    getDynamicFilterValues(key) {
      return this.dynamicFilterValues[key];
    },
    async setQuickCards() {
      //Get quick cards
      let quickCards = [];
      let mainConfigs = Object.values(config('main')).map(
        (item) => item.quickCards || []
      );
      mainConfigs.forEach((item) => (quickCards = quickCards.concat(item)));
      //Validate Permissions
      let quickCardsToShow = [];
      for (const card of quickCards) {
        if (!card.permission || this.$hasAccess(card.permission)) {
          let qcComponent = card?.component;
          if (typeof qcComponent == 'function')
            qcComponent = await qcComponent();
          card.component = markRaw(qcComponent.default || qcComponent);
          quickCardsToShow.push(card);
        }
      }

      //Divide quick cards
      let response = {
        list1:
          quickCardsToShow.length >= 2
            ? quickCardsToShow.slice(0, quickCardsToShow.length / 2)
            : quickCardsToShow,
        list2:
          quickCardsToShow.length >= 2
            ? quickCardsToShow.slice(
                quickCardsToShow.length / 2,
                quickCardsToShow.length
              )
            : [],
      };
      //Response
      this.quickCards = response;
    },
    toggleDynamicFilterModal(key) {
      if(!this.showDynamicFilterModal[key]) return
      this.showDynamicFilterModal[key] = !this.showDynamicFilterModal[key];
    },
    updateDynamicFilterValues(key, filters) {
      this.dynamicFilterValues[key] = filters;
      this.showDashboard = true;
    },
    async getDashboardByModule() {
      try {
        const configName = `config.dashboard`;
        const dashboards = await service.getConfig(configName, true);
        if (dashboards) {
          this.dashboards = dashboards;
          await this.setDashboardFilters();
        }

      } catch (error) {
        console.error('Error getting filters', error);
      }
    },
    async setDashboardFilters(){
      Object.keys(this.dashboards).forEach((dashboard) => {
        this.dynamicFilterValues[dashboard.name] = dashboard?.filters || {};
        this.showDynamicFilterModal[dashboard.name] = false;
      })
    }
  },
};
</script>
<style lang="scss">
.flex-break {
  flex: 1 0 100% !important;
  height: 0 !important;
}

.example-container {
  .example-cell {
    margin: 1px;
    padding: 4px 8px;
    box-shadow: inset 0 0 0 2px $grey-6;
  }
}

#indexMasterPage {
  #logoContent {
    min-height: calc(100vh - 200px);
  }
}
</style>
