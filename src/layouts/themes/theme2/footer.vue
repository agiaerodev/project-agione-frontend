<template>
  <div id="masterFooter">
    <!-- === FOOTER === -->
    <q-footer class="bg-primary shadow-2">
      <!--Footer admin-->
      <div id="footerContent" class="row q-md-hide items-center" v-if="appConfig.mode == 'iadmin'">
        <!-- Menu -->
        <div id="footerMobileMenu" class="item-footer col cursor-pointer"
             @click="eventBus.emit('toggleMasterDrawer','menu')">
          <q-icon class="item-icon" name="fas fa-bars"/>
          <div>Menu</div>
        </div>
        <!-- Profile -->
        <div id="footerMobileProfile" class="item-footer col cursor-pointer">
          <q-btn
            :to="{name: 'user.profile.me'}"
            flat
            no-caps
            v-if="quserState.authenticated"
            class="item-icon" padding="none"
          >
            <q-avatar v-if="quserState?.userData?.mainImage" size="20px">
              <img :src="quserState?.userData?.mainImage">
            </q-avatar>
            <i v-else class="fa-solid fa-user"></i>
          </q-btn>
          <div>{{ $tr('isite.cms.label.profile') }}</div>
        </div>
        <!-- Main -->
        <div id="footerMobileMain" class="col" @click="doMainAction()">
          <div id="item-main" :class="`cursor-pointer row items-center justify-center bg-white`">
            <q-icon class="item-icon" color="primary" :name="mainAction.icon"/>
          </div>
        </div>
        <!-- go to site -->
        <div
          class="item-footer col cursor-pointer"
          @click="$eventBus.emit('toggleMasterDrawer','config')"
        >
          <q-icon class="item-icon" name="fas fa-cog"/>
          <div>{{ $tr('isite.cms.label.setting') }}</div>
        </div>
        <!-- Others -->
        <div id="footerMobileOthers" class="item-footer col cursor-pointer" @click="modal.show = true">
          <q-icon class="item-icon" name="fas fa-ellipsis-h"/>
          <div>{{ $trp('isite.cms.label.other') }}</div>
        </div>
      </div>
    </q-footer>
    <!--Dialog other actions-->
    <q-dialog v-model="modal.show" position="bottom" v-if="appConfig.mode == 'iadmin' ? true : false">
      <q-card style="width: 350px">
        <!--Toolbar-->
        <q-toolbar>
          <q-icon class="item-icon" name="fas fa-ellipsis-v"/>
          <q-toolbar-title> {{ $trp('isite.cms.label.other') }}</q-toolbar-title>
          <!--Close bottom-->
          <q-btn flat round dense icon="fa fa-close" v-close-popup/>
        </q-toolbar>

        <!--Separator-->
        <q-separator/>

        <q-card-section class="row items-center no-wrap q-pa-none">
          <q-list separator class="full-width" v-close-popup>
            <!--Settings-->
            <q-item clickable v-ripple @click="eventBus.emit('toggleMasterDrawer','config')">
              <q-item-section avatar>
                <q-icon color="primary" name="fa-light fa-folder-gear"/>
              </q-item-section>
              <q-item-section class="ellipsis">{{ $tr('isite.cms.label.setting') }}</q-item-section>
            </q-item>
            <!--Offline-->
            <q-item clickable v-ripple @click="eventBus.emit('toggleMasterDrawer','offline')">
              <q-item-section avatar>
                <q-icon color="primary" name="fa-light fa-wifi-slash"/>
              </q-item-section>
              <q-item-section class="ellipsis">{{ $tr('isite.cms.label.offlineRequests') }}</q-item-section>
            </q-item>
            <!--Chat action-->
            <q-item clickable v-ripple v-if="$hasAccess('ichat.conversations.index')"
                    @click="eventBus.emit('toggleMasterDrawer','chat')">
              <q-item-section avatar>
                <q-icon color="primary" name="fa-light fa-message"/>
              </q-item-section>
              <q-item-section class="ellipsis">Chat</q-item-section>
            </q-item>
            <!--Checking action-->
            <q-item clickable v-ripple @click="eventBus.emit('toggleMasterDrawer','checkin')"
                    v-if="$hasAccess('icheckin.shifts.create')">
              <q-item-section avatar>
                <q-icon color="primary" name="fas fa-stopwatch"/>
              </q-item-section>
              <q-item-section class="ellipsis">{{ $tr('icheckin.cms.sidebar.checkin') }}</q-item-section>
            </q-item>
            <!--Recommendation action-->
            <q-item clickable v-ripple @click="eventBus.emit('toggleMasterDrawer','recommendation')"
                    v-if="params.recommendations ? true : false">
              <q-item-section avatar>
                <q-icon color="primary" name="fas fa-hat-wizard"/>
              </q-item-section>
              <q-item-section class="ellipsis">{{ $trp('isite.cms.label.recommendation') }}</q-item-section>
            </q-item>
            <!--Notification action-->
            <q-item clickable v-ripple @click="eventBus.emit('toggleMasterDrawer','notification')">
              <q-item-section avatar>
                <q-icon color="primary" name="fa-light fa-bell"/>
              </q-item-section>
              <q-item-section class="ellipsis">{{ $trp('isite.cms.label.notification') }}</q-item-section>
            </q-item>
            <!-- Logout -->
            <q-item clickable v-ripple @click="$router.push({name: 'auth.logout'})">
              <q-item-section avatar>
                <q-icon color="primary" name="fa-light fa-right-from-bracket"/>
              </q-item-section>
              <q-item-section class="ellipsis">{{ $tr('isite.cms.configList.signOut') }}</q-item-section>
            </q-item>
            <!---->
          </q-list>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>
<script>
import { eventBus } from 'src/plugins/utils'

export default {
  name: 'masterAdminFooterTheme2',
  beforeUnmount() {
    eventBus.off('setMobileMainAction')
  },
  props: {},
  components: {},
  watch: {
    $route: {
      deep: true,
      handler: function () {
        this.mainAction = config('app.mobilMainAction')
      }
    },
  },
  mounted() {
    this.$nextTick(function () {
      this.init()
    })
  },
  data() {
    return {
      mainAction: config('app.mobilMainAction'),
      appConfig: config('app'),
      loadFooterIpanel: false,
      modal: {
        show: false
      },
      eventBus
    }
  },
  computed: {
    quserState() {
      return this.$store.state.quserAuth
    },
    routeSubHeader() {
      return this.$route.meta.subHeader || {}
    },
    currentRoute() {
      return this.$route
    },
    //Return params of subHeader
    params() {
      return this.currentRoute.meta.subHeader || {}
    },
  },
  methods: {
    init() {
      eventBus.on('setMobileMainAction', (data) => {
        this.mainAction = {...this.mainAction, ...data}
      })
    },
    //Do main action
    doMainAction() {
      //Do callback
      if (this.mainAction.callBack) this.mainAction.callBack()
      //Redirect
      else if (this.mainAction.route && (this.$route.name != this.mainAction.route)) {
        this.$router.push({name: this.mainAction.route})
      }
    }
  }
}
</script>
<style lang="scss">
#footerContent {
  background-color: $primary;
  color: white;

  .item-footer {
    text-align: center;
    font-size: 11px;
    padding: 10px 0;

    .item-icon {
      font-size: 20px;
      margin-bottom: 3px;
    }
  }

  #item-main {
    border-radius: 50%;
    width: 50px;
    height: 50px;
    margin: auto;
    font-size: 26px;
    color: white;
  }

  #footerMobileProfile {
    img {
      padding: 0;
    }
  }
}

#footerIpanel {
  background-color: transparent;
  border-top: 1px solid $grey-4;

  #webComponent {
    all: initial;
  }
}
</style>
