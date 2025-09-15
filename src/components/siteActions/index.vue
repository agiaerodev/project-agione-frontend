<template>
  <div id="siteActionscomponent">
    <div :class="`row q-gutter-${gutter}`">
      <!--Actions-->
      <template v-for="(btn, keyAction) in actions.buttons">
        <q-btn
          v-if="btn?.vIf != undefined ? btn.vIf : true"
          :key="keyAction"
          v-bind="{...defaultButtonProps, ...btn.props}"
          @click="btn.action != undefined ? btn.action() : null"
        >
          <q-icon v-if="btn.props.rightIcon" :name="btn.props.rightIcon" class="q-ml-xs" size="12px" color="blue-grey"/>
          <q-menu v-if="btn.menu" fit>
            <div class="q-py-sm q-px-md">
              <div class="text-subtitle1 text-primary">{{ btn.label }}</div>
              <!--Separator-->
              <q-separator class="q-my-sm" />
              <!-- Description -->
              <div class="text-caption text-blue-grey" v-if="btn.desc">{{ btn.desc }}.</div>
              <!--Actions-->
              <q-list separator class="no-shadow" style="min-width: 260px">
                <q-item v-for="(act, keyAction) in btn.menu.actions" :key="keyAction" clickable v-ripple
                        v-close-popup @click="act.action != undefined ? act.action() : null">
                  <q-item-section class="text-blue-grey">
                    <div>
                      <q-icon :name="act?.icon" class="q-mr-sm" color="primary" size="xs" />
                      {{ act.label }}
                    </div>
                  </q-item-section>
                  <q-item-section side>
                    <q-icon :name="act?.rightIcon" size="12px"/>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </q-menu>
          <!-- Tooltip -->
          <q-tooltip>{{ btn.label }}</q-tooltip>
          <!-- Badge -->
          <q-badge
            v-if="btn.badgeLabel || btn.badge"
            :color="btn.badgeColor || 'orange'"
            rounded floating
          >
            {{ btn.badgeLabel }}
          </q-badge>
        </q-btn>
      </template>
      <!--Auth section-->
      <q-btn v-if="quserState.authenticated && (configMode == 'iadmin')" id="profileButton" rounded no-caps
             padding="2px 8px" color="white" unelevated>
        <div id="profileImage" class="img-as-bg"
             :style="`background-image: url('${profileImage.smallThumb}')`"></div>
        <div class="q-ml-xs q-mr-sm text-blue-grey">{{ quserState.userData.firstName }}</div>
        <q-icon name="fas fa-chevron-down" size="14px" color="blue-grey" />
        <!--Menu-->
        <q-menu
          anchor="bottom right"
          self="top right"
          :offset="[0, 18]"
          class="
            tw-rounded-2xl
            tw-shadow-none
            tw-top-3
            tw-border-2
            tw-border-gray-100
            tw-py-5
          "
        >
          <div
            class="tw-mb-5 tw-mx-5"
            :class="{ 'tw-text-center': profileImage.mediumThumb }"
          >
            <q-avatar v-if="profileImage.mediumThumb" size="84px" class="tw-mb-2.5">
              <img :src="profileImage.mediumThumb">
            </q-avatar>
            <div class="tw-font-bold tw-text-base">
              {{ quserState.userData.fullName }}
            </div>
            <div class="ellipsis text-caption tw-text-gray-500">
              {{ quserState.userData.roles.map(role => role.name).join(', ') }}
            </div>
          </div>
          <div class="column">
            <template v-for="(btn, keyAction) in actions.menu">
              <q-btn
                :key="keyAction"
                class="tw-px-5"
                v-bind="{...defaultButtonProps, ...btn.props}"
                v-if="btn?.vIf != undefined ? btn.vIf : true"
                v-close-popup
                @click="btn.action != undefined ? btn.action() : null"
              />
            </template>
          </div>
        </q-menu>
      </q-btn>
    </div>
  </div>
</template>
<script lang="ts">
import {defineComponent} from 'vue'
import controller from './controller'

export default defineComponent({
  name: 'siteActionsComponent',
  props: {
    gutter: { type: String, default: 'sm' },
    size: { type: String, default: 'small' },
    replaceActions: { type: Object, default: () => ({}) }
  },
  components: {},
  setup(props) {
    return controller(props)
  }
})
</script>
<style lang="scss">
#siteActionscomponent
#profileImage {
  height: 25px;
  width: 25px;
  border-radius: 50%;
}
</style>
