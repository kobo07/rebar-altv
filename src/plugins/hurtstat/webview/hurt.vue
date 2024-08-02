<template>
  

</template>

<script lang="ts" setup>
import { ref, onMounted, computed, onBeforeUnmount } from 'vue';
import { useEvents } from '@Composables/useEvents.js';
import { useSyncedMeta } from '../../../../webview/composables/useSyncedMeta.js';

const events = useEvents();
const syncedMeta = useSyncedMeta();
const character = syncedMeta.getCharacter();

const hurt = computed(() => character.value.hurt || []);


</script>

<style scoped>

</style>
