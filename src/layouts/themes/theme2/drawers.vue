<template>
  <div id="masterDrawers2">
    <!-- MENU -->
    <q-drawer id="menuMaster2" class="no-shadow" v-model="drawer.menu" ref="menuMaster"
              :mini="miniState" @click.capture="miniState ? eventBus.emit('toggleMasterDrawer','menu') : null">
      <!--Logo-->
      <div v-show="!miniState" id="logoSite2" class="relative-position">
        <q-img fit="contain" :src="logo" style="height: 80px; min-height: 80px"/>
      </div>
      <div v-if="miniState" id="miniLogoSite">
        <q-img fit="contain" :src="minilogo"/>
      </div>
      <!--List iadmin-->
      <q-scroll-area
        id="adminMenu"
        :style="`height: calc(100vh - 146px)`"
        :thumb-style="{ width: '3px' }"
      >
        <!--Menu-->
        <menu-list ref="menuList" group :translatable="menuTranslatable" :menu="menuSelect"
                   :with-tooltip="miniState" :tooltip-props="{anchor:'center right'}"/>
      </q-scroll-area>
    </q-drawer>

    <!-- Config -->
    <q-drawer bordered id="configMaster" overlay v-model="drawer.config" side="right">
      <config-list/>
    </q-drawer>

    <!-- Chat -->
    <q-drawer bordered id="chatMaster" overlay v-model="drawer.chat" side="right"
              v-if="$hasAccess('ichat.conversations.index')">
      <chat-list/>
    </q-drawer>

    <!--Recommendation-->
    <q-drawer id="drawerRecommendationMaster" v-model="drawer.recommendation" side="right" :overlay="false"
              v-if="routeSubHeader.recommendations ? true : false">
      <master-recommendation/>
    </q-drawer>

    <!--Notification-->
    <master-notifications :is-open="drawer.notification" :isMobile="this.windowSize == 'mobile' ? true : false"/>

    <!--Offline-->
    <q-drawer
      class="tw-bg-gray-100"
      id="drawerOfflineMaster"
      v-model="drawer.offline"
      side="right"
      overlay
      v-if="offlineDrawer"
    >
      <offline/>
    </q-drawer>
    <q-drawer
      v-model="drawer.askAgi"
      side="right"
      bordered
      :width="500"
      class="no-shadow"
    >
      <div class="tw-relative tw-w-full tw-h-full">
        <q-btn
          flat
          round
          dense
          icon="fa-light fa-xmark"
          @click="closeAskAgi"
          class="tw-absolute tw-top-2.5 tw-right-2.5 tw-z-50 tw-bg-black/20 hover:tw-bg-black/40 tw-text-white"
        />

        <iframe
          ref="askAgiIframe"
          src="https://copilotstudio.microsoft.com/environments/Default-7e761206-66fa-448b-a3e6-6c0660e38ed5/bots/crbba_AskAGIOne/webchat?__version__=2"
          frameborder="0"
          allow="microphone; clipboard-write"
          class="tw-w-full tw-h-full tw-border-none"
        />
      </div>
    </q-drawer>
  </div>
</template>
<script>
//mixins
import sidebarMixins from 'layouts/themes/_mixins/sidebar'
//Components
import configList from 'modules/qsite/_components/master/configList'
import chatList from 'modules/qchat/_components/drawerChatList'
import menuList from 'modules/qsite/_components/master/recursiveItem'
import masterRecommendation from 'modules/qsite/_components/master/masterRecommendations'
import masterNotifications from 'modules/qnotification/_components/drawerNotifications'
import offline from 'modules/qoffline/_components/drawerOffline'
import { eventBus } from 'src/plugins/utils'

export default {
  name: 'masterAdminDrawerTheme2',
  beforeUnmount() {
    eventBus.off('toggleMasterDrawer')
    eventBus.off('openMasterDrawer')
  },
  mixins: [sidebarMixins],
  props: {},
  components: {
    menuList,
    configList,
    chatList,
    masterRecommendation,
    masterNotifications,
    offline
  },
  mounted() {
    this.$nextTick(function () {
      this.init()
      this.miniState = this.windowSize == 'mobile' ? false : true
    })
  },
  data() {
    return {
      windowHeight: window.innerHeight,
      windowWith: window.innerWidth,
      projectName: this.$getSetting('core::site-name'),
      logo: this.$store.state.qsiteApp.logo,
      miniState: false,
      isLoadingIframe: true,
      drawer: {
        menu: false,
        config: false,
        chat: false,
        checkin: false,
        recommendation: false,
        notification: false,
        offline: false,
        askAgi: false
      },
      appConfig: config('app'),
      eventBus
    }
  },
  watch: {
    routeSubHeader() {
      this.drawer.recommendation = false
    },
    'drawer.askAgi'(isOpen) {
      if (isOpen) {
        this.isLoadingIframe = true
      }
    }
  },
  computed: {
    offlineDrawer() {
      return this.$getSetting('isite::offline')
    },
    windowSize() {
      return this.windowWith >= '992' ? 'desktop' : 'mobile'
    },
    primaryContrast() {
      return this.$getSetting('isite::primaryContrast')
    },
    secondaryContrast() {
      return this.$getSetting('isite::secondaryContrast')
    },
    backgroundColorNav() {
      return this.$getSetting('isite::brandMasterMenuBackground')
    },
    minilogo() {
      return this.$getMediaSetting('isite::logoIadminSM')['path']
    },
    routeSubHeader() {
      return this.$route.meta.subHeader || {}
    },
    //Version app text
    versionText() {
      return 'v' + config('app.version')
    },
    openMenu: {
      get() {
        return this.drawer.menu
      },
      set(value) {
        this.drawer.menu = value;
      }
    },
  },
  methods: {
    //init
    init() {
      this.handlerEvent()
      this.contrast()
      //Watch window size
      window.addEventListener('resize', () => {
        this.windowHeight = window.innerHeight
        this.windowWith = window.innerWidth
      })
      this.openMenu = this.windowSize == 'mobile' ? false : true;
    },
    //contrast color alter
    contrast() {
      const master = document.querySelector('#masterDrawers2')
      if (!master) return '#000000';
      const bgColor = getComputedStyle(master).getPropertyValue('--q-primary')
      const contrast = this.$helper.pickTextColor(bgColor)
      const bgColor2 = getComputedStyle(master).getPropertyValue('--q-secondary')
      const contrast2 = this.$helper.pickTextColor(bgColor2)
      this.primaryContrast ? master.style.setProperty('--q-color-contrast', this.primaryContrast) : master.style.setProperty('--q-color-contrast', contrast)
      this.secondaryContrast ? master.style.setProperty('--q-color-contrast-two', this.secondaryContrast) : master.style.setProperty('--q-color-contrast-two', contrast2)
      this.secondaryContrast ? master.style.setProperty('--q-color-contrast-two', this.secondaryContrast) : master.style.setProperty('--q-color-contrast-two', contrast2)
      this.backgroundColorNav ? master.style.setProperty('--q-background-color-nav', this.backgroundColorNav) : master.style.setProperty('--q-background-color-nav', bgColor)
      return this.primaryContrast ? this.primaryContrast : contrast
    },
    handlerEvent() {
      //handler toggleMasterDrawer
      eventBus.on('toggleMasterDrawer', (drawerName) => this.toggleDrawer(drawerName))
      //handler openMasterDrawer
      eventBus.on('openMasterDrawer', (drawerName) => this.drawer[drawerName] = true)
    },
    //Show drawer specific
    toggleDrawer(drawerName) {
      //Hidden all drawers
      for (var drawer in this.drawer) {
        if (drawer != drawerName) {
          if ((drawer == 'menu') && (this.windowSize != 'mobile')) {
            this.miniState = true
          } else {
            this.drawer[drawer] = false
          }
        }
      }
      //Toogle drawer
      if (drawerName == 'menu') {
        if (this.windowSize == 'mobile') {
          this.miniState = false
          this.drawer.menu = !this.drawer.menu
        } else {
          this.drawer.menu = true
          this.miniState = !this.miniState
        }
      } else {
        this.drawer[drawerName] = !this.drawer[drawerName]
      }
    },
    closeAskAgi() {
      this.drawer.askAgi = false
    },
  }
}
</script>
<style lang="scss">
#masterDrawers2 {
  background-color: var(--q-background-color-nav);

  #menuMaster2 {
    background: var(--q-background-color-nav);
    z-index: 3000;
    #logoSite2 {
      padding: 20px 25px 26px 25px;
      height: 120px;
      background-color: #fff;
    }
    #miniLogoSite {
      padding: 30px 7px;
      height: 120px;
      background-color: #fff;
    }
    #versionContent {
      padding: 3px 15px;
      font-size: 13px;
    }
    .q-item {
      padding-left: 0;
      background-color: var(--q-background-color-nav);
      min-height: 50px;
      color: var(--q-color-contrast);
      .q-focus-helper {
        opacity: 0;
      }
      .q-item__section--avatar {
        padding: 0 18px !important;
        .q-icon {
          font-size: 20px;
        }
      }
      .q-item__section {
        font-weight: 600;
      }
      .q-item__section,
      .q-icon {
        color: var(--q-color-contrast);
      }
    }
    .content-item {
      & > .q-item {
        .q-item__section--main {
          font-size: 16px;
        }

        &:hover,
        &.item-is-active {
          background-color: $secondary;
          border-radius: 0 15px 15px 0;
          font-weight: 900;
        }
      }
      & > .q-expansion-item {
        background-color: var(--q-background-color-nav);
        .q-expansion-item__container {
          & > .q-item {
            .q-item__label {
              font-size: 15px;
            }

            &:hover,
            &.item-is-active {
              background-color: $secondary;
              border-radius: 0 15px 15px 0;
              font-weight: 900;
            }
          }
          & > .q-expansion-item__content {
            padding: 0 0 0 3px;
            border-left: 18px solid var(--q-background-color-nav);
            #listMenu {
              .content-item {
                border-left: 3px solid $secondary;
              }
            }
            .q-item {
              min-height: 40px;
              margin-left: -1px;
              .q-icon {
                display: none;
              }
              .q-item__section,
              .q-icon {
                color: var(--q-color-contrast);
                font-size: 14px;
                font-weight: 600;
              }

              &:hover,
              &.item-is-active {
                background-color: $secondary;
              }

              &:hover .q-item__section,
              &.item-is-active .q-item__section,
              &:hover .q-icon,
              &.item-is-active .q-icon {
                color: var(--q-color-contrast);
              }

            }
          }
        }
      }
    }
    .expansion-selected {
      background-color: var(--q-background-color-nav);
    }
    .q-drawer--mini {
      .q-item {
        border-radius: 0 !important;
      }
    }
  }
}
.ask-agi-enter-active,
.ask-agi-leave-active {
  transition: all .35s cubic-bezier(.19,1,.22,1);
}

.ask-agi-enter-from,
.ask-agi-leave-to {
  opacity: 0;
  transform: translateY(60px);
}

.ask-agi-enter-to,
.ask-agi-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>
