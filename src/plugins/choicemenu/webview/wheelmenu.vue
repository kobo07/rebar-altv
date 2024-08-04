<script lang="ts" setup>
import { ref, computed } from 'vue';
import { useEvents } from '@Composables/useEvents.js';

const event = useEvents();

interface MenuItem {
  icon: string;
  label: string;
  description: string;
  action?: (player: any, entity: any) => void; // 可选操作函数
}

const menuItems = ref<MenuItem[]>([]);
const selectedIndex = ref<number | null>(null);
let selectedEntityId: number | null = null;
const targetLabel = ref<string>('Target'); // 新增

// 处理客户端传来的实体信息和选项
event.on('selectedEntity', ({ entityType, entityId, options, targetLabel: label }) => {
  selectedEntityId = entityId;
  menuItems.value = options;
  targetLabel.value = label; // 更新目标标签
});

function selectItem(index: number) {
  selectedIndex.value = index;

  // 向客户端发送事件以执行相应操作
  event.emitClient('executeAction', { actionIndex: index, entityId: selectedEntityId });
}

const menuSize = computed(() => {
  const baseSize = 300;
  return baseSize + menuItems.value.length * 10;
});

const menuItemSize = computed(() => {
  const baseSize = 50;
  return baseSize + menuItems.value.length * 2;
});

function getMenuItemStyle(index: number) {
  const angle = (360 / menuItems.value.length) * index;
  const radius = menuSize.value / 2 - menuItemSize.value;
  const x = radius * Math.cos((angle * Math.PI) / 180);
  const y = radius * Math.sin((angle * Math.PI) / 180);
  return {
    transform: `translate(${x}px, ${y}px)`,
    width: `${menuItemSize.value}px`,
    height: `${menuItemSize.value}px`,
  };
}
</script>

<template>
  <div
    class="radial-menu"
    :style="{ width: menuSize + 'px', height: menuSize + 'px' }"
  >
    <div class="center" :class="{ 'with-description': selectedIndex !== null }">
      <div>{{ targetLabel }}</div> <!-- 修改 -->
      <div v-if="selectedIndex !== null" class="description">
        {{ menuItems[selectedIndex].description }}
      </div>
    </div>
    <div
      v-for="(item, index) in menuItems"
      :key="index"
      class="menu-item"
      :class="{ selected: selectedIndex === index }"
      :style="getMenuItemStyle(index)"
      @click="selectItem(index)"
      @mouseover="selectedIndex = index"
      @mouseleave="selectedIndex = null"
    >
      <span class="icon">{{ item.icon }}</span>
      <span class="label">{{ item.label }}</span>
    </div>
  </div>
</template>

<style scoped>
.radial-menu {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(60, 60, 60, 0.85) 0%,
    rgba(30, 30, 30, 0.85) 100%
  );
  display: flex;
  justify-content: center;
  align-items: center;
  transition: width 0.3s, height 0.3s;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}
.center {
  position: absolute;
  width: 4.167vw;
  height: 7.407vh;
  border-radius: 50%;
  background-color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: black;
  font-weight: bold;
  text-align: center;
  transition: width 0.3s, height 0.3s;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}
.center.with-description {
  width: 6.25vw;
  height: 11.111vh;
}
.description {
  margin-top: 0.926vh;
  font-size: 12px;
  color: black;
}
.menu-item {
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: transform 0.29s, background-color 0.29s, box-shadow 0.29s,
    opacity 0.29s, width 0.29s, height 0.29s;
  border-radius: 50%;
}
.menu-item:hover,
.menu-item.selected {
  transform: scale(1.2);
  background-color: rgba(255, 255, 255, 0.5);
}
.menu-item:hover .icon,
.menu-item.selected .icon {
  transform: translateY(-5px) scale(1.1);
  color: #fff;
}
.menu-item:hover .label,
.menu-item.selected .label {
  transform: translateY(-2px);
  color: #fff;
}
.menu-item .icon,
.menu-item .label {
  transition: transform 0.29s, color 0.29s, opacity 0.29s;
}
.icon {
  font-size: 2.222vh;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8), -1px -1px 2px rgba(0, 0, 0, 0.8),
    1px -1px 2px rgba(0, 0, 0, 0.8), -1px 1px 2px rgba(0, 0, 0, 0.8);
}
.label {
  font-size: 1.111vh;
  color: white;
  text-align: center;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}
</style>
