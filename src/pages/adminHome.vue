<template>
  <div id="indexMasterPage" class="relative-position">
    <!--Page Actions-->
    <div class="q-mb-md">
      <page-actions 
        :title="$tr($route.meta.title)" 
        :tour-name="tourName"
        :excludeActions="excludeActions" 
        @toggleDynamicFilterModal="toggleDynamicFilterModal"
        :dynamicFilter="filtersModel"
        :dynamicFilterValues="getDynamicFilterValues"
        :dynamicFilterSummary="dynamicFilterSummary"
        :help="helpText"
      />
    </div>
    <dynamicFilter
      v-if="showDynamicFilters && dashboardPermissions"
      :systemName="systemName"
      :modelValue="showDynamicFilterModal"
      :filters="filtersModel"
      @showModal="showDynamicFilterModal = true"
      @hideModal="showDynamicFilterModal = false"
      @update:modelValue="filters => updateDynamicFilterValues(filters)"
      @update:summary="summary => dynamicFilterSummary = summary"
    />

    <dashboardRenderer
      v-if="showDashboard && dashboardPermissions"
      :dynamicFilterValues="getDynamicFilterValues"
      :configName="configName"
    />

    <!--Activities-->
    <div id="adminHomeActivities" class="col-12 q-mb-md">
      <activities system-name="admin_home_actions" @loaded="loading = false" view="cardImage" />
    </div>

    <!--Quick cards-->
    <div v-if="quickCards.list1 && quickCards.list1.length">
      <div class="row q-col-gutter-x-md">
        <!-- QuickCards -->
        <div id="quickCardsContent" class="col-12">
          <div class="row q-col-gutter-md">
            <div v-for="(groupQuickCard, key) in quickCards" :key="key" class="col-12 col-lg-6">
              <div class="row q-col-gutter-y-md full-width">
                <div v-for="(item, keyItem) in groupQuickCard" :key="keyItem" class="col-12">
                  <component :is="item.component" :key="`component${keyItem}`" v-bind="item.props || {}" />
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
import dynamicFilter from 'src/modules/qsite/_components/master/dynamicFilter'
import dashboardRenderer from 'src/modules/qsite/_components/master/dashboardRenderer'
import service from 'src/modules/qsite/_components/master/dashboardRenderer/services.ts'
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
    this.$nextTick(async function() {
      if (this.dashboardPermissions) {
        await this.getFilters();
        this.excludeActions = []
      }
      this.token = await helper.getToken()
      setTimeout(() => {
        this.loading = false;
        this.setQuickCards();
        this.$tour.start(this.tourName);
      }, 1000);
    });
  },
  data() {
    return {
      showDashboard: false,
      excludeActions: ['refresh', 'filter'],
      configName: `ramp.config.dashboard.quickCards`,
      testSchedule: false,
      loading: false,
      quickCards: {},
      tourName: this.$q.platform.is.desktop ? 'admin_home_tour' : 'admin_home_tour_mobile',
      dynamicFilterValues: {},
      dynamicFilterSummary: {},
      filtersModel: {},
      systemName: 'ramp.passenger-work-orders',
      showDynamicFilterModal: false,
      token: ''
    };
  },
  computed: {
    getDynamicFilterValues() {
      return this.dynamicFilterValues;
    },
    showDynamicFilters() {
      return Object.keys(this.filtersModel).length;
    },
    dashboardPermissions() {
      return this.$hasAccess('isite.dashboard.index');
    },
    helpText() {
      return {
        title: 'Dashboard',
        description: `
          Need help? Check the documentation for more information about the Dashboard.
          ${helper.documentationLink(
            '/docs/agione/dashboard',
            this.token
          )}
        `
      }
    }
  },
  methods: {
    async setQuickCards() {
      //Get quick cards
      let quickCards = [];
      let mainConfigs = Object.values(config('main')).map(item => item.quickCards || []);
      mainConfigs.forEach(item => quickCards = quickCards.concat(item));
      //Validate Permissions
      let quickCardsToShow = [];
      for (const card of quickCards) {
        if (!card.permission || this.$hasAccess(card.permission)) {
          let qcComponent = card?.component
          if(typeof qcComponent == 'function') qcComponent = await qcComponent();
          card.component = markRaw(qcComponent.default || qcComponent);
          quickCardsToShow.push(card);
        }
      }

      //Divide quick cards
      let response = {
        list1: (quickCardsToShow.length >= 2) ? quickCardsToShow.slice(0, (quickCardsToShow.length / 2)) : quickCardsToShow,
        list2: (quickCardsToShow.length >= 2) ? quickCardsToShow.slice((quickCardsToShow.length / 2), quickCardsToShow.length) : []
      };
      //Response
      this.quickCards = response;
    },
    toggleDynamicFilterModal() {
      this.showDynamicFilterModal = !this.showDynamicFilterModal;
    },
    updateDynamicFilterValues(filters) {
      this.dynamicFilterValues = filters;
    },
    async getFilters() {
      try {
        const configName = `config.filters`;
        const filters = await service.getConfig(configName, true);
        if (filters?.Isite) this.filtersModel = filters.Isite
      } catch (error) {
        console.error('Error getting filters', error);
      } finally {
        setTimeout(() => {
          if (this.dynamicFilterValues) this.showDashboard = true;
        }, 900);
      }
    }
  }
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