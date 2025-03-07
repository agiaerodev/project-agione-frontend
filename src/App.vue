<template>
  <router-view />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { eventBus } from 'src/plugins/utils';

export default defineComponent({
  name: 'App',
  mounted ()
  {
    this.$q.iconSet.arrow.dropdown = 'fa fa-caret-down';
    this.$q.iconSet.expansionItem.icon = 'fa fa-chevron-down';
    // Listen Service worker updates
    eventBus.on('service-worker.update.available', () =>
    {
      this.$router.push({ name: 'app.update.app' });
    });
    window.onerror = function (message, source, lineno, colno, error) {
      if (/Loading chunk/.test(error)) {
        console.warn("Error chunk", error);
        window.location.reload();
      }
      console.warn("Error en este componente:", message, error);
    };
  }
});
</script>
