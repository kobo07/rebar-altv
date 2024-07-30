<template>
  <div class="inventory">
    <div v-for="slot in backpackSlots" :key="slot" class="inventory-item">
      <Draggable
        @onDrag="handleDrag"
        @onLeftClick="handleClick"
        @onDblClick="handleDoubleClick"
        @onMiddleClick="handleMiddleClick"
        @onRightClick="(id) => handleRightClick(id)"
      >
        <div :id="`slot-${slot}`" class="item-box">
          <template v-if="getInventoryItem(slot)">
            <img :src="getIconPath(getInventoryItem(slot).icon)" :alt="getInventoryItem(slot).name" class="item-icon" />
            <div class="item-details">
              <p>{{ getInventoryItem(slot).name }}</p>
              <p class="quantity">数量: {{ getInventoryItem(slot).quantity }}</p>
              <p class="weight">重量: {{ getInventoryItem(slot).weight }}</p>
            </div>
          </template> 
        </div>
      </Draggable>
    </div>
  </div>

  <div v-if="isContextMenuVisible" :style="contextMenuStyle" class="context-menu">
    <ul>
      <li @click="useItem">使用</li>
      <li @click="splitItem">分割</li>
      <li @click="discardItem">丢弃</li>
      <li @click="cancel">取消</li>
      <li @click="handleCustomOption">自定义选项</li>
    </ul>
  </div>

  <p>{{ mes }}</p>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed, onBeforeUnmount } from 'vue';
import { useEvents } from '@Composables/useEvents.js';
import { useSyncedMeta } from '../../../../webview/composables/useSyncedMeta.js';
import { findIcon } from './findicon.js'; // 调整路径
import { BagItem } from '../server/index.js';
import Draggable from '../../../../webview/src/components/Draggable.vue';

const mes = ref('');

const syncedMeta = useSyncedMeta();
const character = syncedMeta.getCharacter();

const characterInventory = computed(() => character.value.inventory || []);
const backpackSlots = ref<number[]>([]);

const isContextMenuVisible = ref(false);
const contextMenuPosition = ref({ x: 0, y: 0 });
const selectedSlot = ref<number | null>(null);

const contextMenuStyle = computed(() => ({
  left: `${contextMenuPosition.value.x}px`,
  top: `${contextMenuPosition.value.y}px`,
}));



function handleDrag(from_id: string, to_id: string) {
  console.log(`drag: `, from_id, to_id);
  //交换item位置
  const fromSlot = parseInt(from_id.replace('slot-', ''), 10);
  const toSlot = parseInt(to_id.replace('slot-', ''), 10);

  /* if (isNaN(fromSlot) || isNaN(toSlot)) return;

  const temp = characterInventory.value[fromSlot];
  characterInventory.value[fromSlot] = characterInventory.value[toSlot];
  characterInventory.value[toSlot] = temp;

  updateinventory();*/

  changeitemslot(fromSlot, toSlot);

  mes.value = `drag: ${from_id} to ${to_id}`;

}

function handleClick(id: string) {
  console.log('left-click: ', id);
  mes.value = `left-click: ${id}`;
}

function handleDoubleClick(id: string) {
  console.log('dbl-click: ', id);
  mes.value = `dbl-click: ${id}`;
}

function handleMiddleClick(id: string) {
  console.log('middle-click: ', id);
  mes.value = `middle-click: ${id}`;
}

function handleRightClick(id: string) {
  console.log('right-click: ', id);
  mes.value = `right-click: ${id}`;
  selectedSlot.value = parseInt(id.replace('slot-', ''), 10);
  const item = characterInventory.value.find(item => item.slot === selectedSlot.value);
  if (!item) { 
    return;
  }
  isContextMenuVisible.value = true;
  setContextMenuPosition();
}

function setContextMenuPosition() {
  const slotElement = document.getElementById(`slot-${selectedSlot.value}`);
  if (slotElement) {
    const rect = slotElement.getBoundingClientRect();
    contextMenuPosition.value = {
      x: rect.right + window.scrollX,
      y: rect.bottom + window.scrollY,
    };
  }
}

function useItem() {
  console.log('use item');
  isContextMenuVisible.value = false;
}

function splitItem() {
  console.log('split item');
  isContextMenuVisible.value = false;
}

function discardItem() {
  console.log('discard item');
  isContextMenuVisible.value = false;
}

function handleCustomOption() {
  console.log('custom option');
  isContextMenuVisible.value = false;
}

function cancel() {
  console.log('cancel');
  isContextMenuVisible.value = false;
}

function updateinventory(){
  useEvents().emitServer('UpdateInventory', character.value.inventory);
}

function changeitemslot(fromSlot: number, toSlot: number) {
  useEvents().emitServer('changeitemslot', fromSlot, toSlot);
}



function getInventoryItem(slot: number) {
  return characterInventory.value.find(item => item.slot === slot) || null;
}

onMounted(() => {
  if (character.value && character.value.inventory) {
    
  } else {
    character.value.inventory = 
     [
      { icon: 'sword.png', name: '剑', quantity: 1, weight: 1, slot: 0, type: '武器', desc: '剑是一把拥有强大力量的武器。', maxStack: 1 },
      { icon: 'rubik.png', name: '魔方', quantity: 1, weight: 1, slot: 1, type: '武器', desc: '头盔是用来保护头部的装备。', maxStack: 1 },
      { icon: 'iron-ore.png', name: '铁矿', quantity: 1, weight: 1, slot: 2, type: '武器', desc: '头盔是用来保护头部的装备。', maxStack: 1 },
    ];
  }

  // 假设背包有50个槽位
  const totalSlots = 50;
  backpackSlots.value = Array.from({ length: totalSlots }, (_, index) => index);
});

const getIconPath = (iconName: string) => {
  return findIcon(iconName);
};
</script>

<style scoped>
.inventory {
  width: 32vw;
  height: 70vh;
  border: 1px solid rgba(0, 0, 0, 0.5);
  margin-left: 30vw;
  margin-top: 10vh;
  overflow: scroll;
  scrollbar-width: none;
  background-color: rgba(255, 255, 255, 0.1);
}

.inventory-item {
  width: 80px;
  height: 100px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  margin: 10px;
  display: inline-block;
  background-color: rgba(0, 0, 0, 0.5);
  transition: border 0.3s, background-color 0.3s;
}

.inventory-item:hover {
  border: 2px solid rgba(21, 102, 153, 0.8);
  background-color: rgba(0, 0, 0, 0.7);
}

.item-box {
  width: 70px;
  height: 90px;
  overflow: hidden;
}

.item-icon {
  width: 50px;
  height: 50px;
  margin: 10px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  pointer-events: none;
  transition: border 0.3s;
}

.item-icon:hover {
  border: 1px solid rgba(21, 102, 153, 0.8);
}

.item-details {
  border: 1px solid rgba(255, 255, 255, 0.3);
  font-size: smaller;
  text-align: center;
  color: rgba(255, 255, 255, 0.9);
  pointer-events: none;
  padding: 2px;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 5px;
  transition: border 0.3s, background-color 0.3s;
}

.item-details p {
  margin: 2px 0;
}

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
