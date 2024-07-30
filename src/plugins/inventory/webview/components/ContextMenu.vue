<template>
  <div v-if="isVisible" :style="menuStyle" class="context-menu">
    <ul>
      <li @click="useItem">使用</li>
      <li @click="splitItem">分割</li>
      <li @click="discardItem">丢弃</li>
      <li @click="customOption">自定义选项</li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';

interface ContextMenuProps {
  isVisible: boolean;
  position: { x: number, y: number };
}

const props = defineProps<ContextMenuProps>();
const emit = defineEmits<{
  (e: 'use'): void;
  (e: 'split'): void;
  (e: 'discard'): void;
  (e: 'custom'): void;
}>();

const isVisible = ref(props.isVisible);
watch(() => props.isVisible, (newValue) => {
  isVisible.value = newValue;
});

const menuStyle = ref({
  left: `${props.position.x}px`,
  top: `${props.position.y}px`
});
watch(() => props.position, (newValue) => {
  menuStyle.value = {
    left: `${newValue.x}px`,
    top: `${newValue.y}px`
  };
});

const useItem = () => emit('use');
const splitItem = () => emit('split');
const discardItem = () => emit('discard');
const customOption = () => emit('custom');
</script>

<style scoped>
.context-menu {
  position: absolute;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  border-radius: 5px;
  padding: 10px;
  z-index: 1000;
}

.context-menu ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.context-menu li {
  padding: 5px 10px;
  cursor: pointer;
}

.context-menu li:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
