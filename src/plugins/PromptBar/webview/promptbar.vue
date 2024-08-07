<template>
  <transition name="fade">
    <div v-if="isPromptVisible" class="prompt-bar">
      <span class="key">{{ message }}</span>
    </div>
  </transition>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useEvents } from '@Composables/useEvents.js';

const isPromptVisible = ref(false);
const message = ref('按E打开ATM');
const events = useEvents();

events.on('showpromptbar', (message1: string) => {
  isPromptVisible.value = true;
  message.value = message1;
});

events.on('hidepromptbar', () => {
  isPromptVisible.value = false;
});
</script>

<style scoped>
.prompt-bar {
  position: fixed;
  bottom: 33vh;
  right: 33vw;
  background: rgba(255, 255, 255, 0.1); /* 更亮的半透明白色背景 */
  border: 1px solid rgba(255, 255, 255, 0.3); /* 半透明白色边框 */
  border-radius: 8px; /* 圆角 */
  padding: 10px 20px; /* 内边距 */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5); /* 更明显的阴影效果 */
}

.key {
  color: #ffffff; /* 纯白色字体 */
  font-size: 18px; /* 字体大小 */
  font-weight: 600; /* 字体粗细 */
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; /* 现代化字体 */
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8); /* 黑色描边，增加对比度 */
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s, transform 0.5s;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
