<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { useEvents } from '@Composables/useEvents.js';

const event = useEvents();

interface MenuItem {
  icon: string;
  label: string;
  description: string;
  action: (player: any, entity: any) => void; // 直接存储操作函数
}

const menuItems = ref<MenuItem[]>([]);
const selectedIndex = ref<number | null>(null);
let selectedEntityId: number | null = null;

// 处理客户端传来的实体信息和选项
event.on('selectedEntity', ({ entityType, entityId, options }) => {
  selectedEntityId = entityId;
  menuItems.value = options;
});

function selectItem(index: number) {
  selectedIndex.value = index;
  const action = menuItems.value[index].action;

  if (typeof action === 'function') {
    // 向客户端发送事件以执行相应操作
    event.emitClient('executeAction', { action, entityId: selectedEntityId });
  }
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

onMounted(() => {
  if (menuItems.value.length === 0) {
    menuItems.value= [{
    icon: '🔓',
    label: 'Unlock',
    description: 'Unlock the vehicle',
    action: () => alert('Unlocking vehicle...'),
  },
  {
    icon: '🔧',
    label: 'Start Engine',
    description: 'Start the vehicle engine',
    action: () => alert('Starting engine...'),
  },
  {
    icon: '📦',
    label: 'Open Trunk',
    description: 'Open the trunk',
    action: () => alert('Opening trunk...'),
  },
  {
    icon: '🔔',
    label: 'Horn',
    description: 'Honk the horn',
    action: () => alert('Honking horn...'),
  },
  {
    icon: '💡',
    label: 'Lights',
    description: 'Turn on the lights',
    action: () => alert('Turning on lights...'),
  },
  {
    icon: '🛠️',
    label: 'Repair',
    description: 'Repair the vehicle',
    action: () => alert('Repairing...'),
  },
  {
    icon: '🔒',
    label: 'Lock',
    description: 'Lock the vehicle',
    action: () => alert('Locking...'),
  },
  {
    icon: '🛢️',
    label: 'Refuel',
    description: 'Refuel the vehicle',
    action: () => alert('Refueling...'),
  },
  {
    icon: '🧼',
    label: 'Wash',
    description: 'Wash the vehicle',
    action: () => alert('Washing...'),
  },
  {
    icon: '🎶',
    label: 'Radio',
    description: 'Turn on the radio',
    action: () => alert('Turning on radio...'),
  },
  {
    icon: '📱',
    label: 'Call',
    description: 'Make a call',
    action: () => alert('Calling...'),
  },
  {
    icon: '🗺️',
    label: 'Navigate',
    description: 'Navigate to a location',
    action: () => alert('Navigating...'),
  },
]
  }
    });



</script>

<template>
  <div
    class="radial-menu"
    :style="{ width: menuSize + 'px', height: menuSize + 'px' }"
  >
    <div class="center" :class="{ 'with-description': selectedIndex !== null }">
      <div>Target</div>
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
  position: relative;
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
  width: 80px;
  height: 80px;
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
  width: 120px;
  height: 120px;
}
.description {
  margin-top: 10px;
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
  font-size: 24px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8), -1px -1px 2px rgba(0, 0, 0, 0.8),
    1px -1px 2px rgba(0, 0, 0, 0.8), -1px 1px 2px rgba(0, 0, 0, 0.8);
}
.label {
  font-size: 12px;
  color: white;
  text-align: center;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}
</style>
