<template>
  <div class="main-content">
    <div class="backpack-container">
      <div class="backpack">
        <div class="header">
          <h1>背包</h1>
          <div class="sort-options">
            <button @click="sortInventory('name')" class="sort-button">按名称整理</button>
            <button @click="sortInventory('weight')" class="sort-button">按重量整理</button>
          </div>
        </div>

        <div class="tabs">
          <button v-for="category in categories" :key="category" @click="selectCategory(category)" :class="{'active': selectedCategory === category}">
            {{ category }}
          </button>
          <input type="text" v-model="searchQuery" placeholder="搜索物品..." />
        </div>

        <div class="inventory">
          <Draggable
            v-for="slot in filteredSlots"
            :key="slot"
            :id="`slot-${slot}`"
            @onDrag="handleDrag"
            @onDrop="handleDrop"
            @onLeftClick="handleClick"
            @onDblClick="handleDoubleClick"
            @onMiddleClick="handleMiddleClick"
            @onRightClick="handleRightClick"
          >
            <div class="inventory-item" :class="{'highlight': isHighlighted(slot)}">
              <template v-if="characterInventory[slot]">
                <img :src="getIconPath(characterInventory[slot].icon)" :alt="characterInventory[slot].name" class="item-icon" />
                <div class="item-details">
                  <h3>{{ characterInventory[slot].name }}</h3>
                  <p class="quantity">数量: {{ characterInventory[slot].quantity }}</p>
                </div>
              </template>
            </div>
          </Draggable>
        </div>

        <div class="pagination">
          <button @click="prevPage" :disabled="currentPage === 1">上一页</button>
          <span>{{ currentPage }} / {{ totalPages }}</span>
          <button @click="nextPage" :disabled="currentPage === totalPages">下一页</button>
        </div>

        <div class="footer">
          <p>总重量: {{ totalWeight }} / 250</p>
          <div class="capacity-bar">
            <div class="capacity-fill" :style="{ width: `${capacityPercentage}%` }"></div>
          </div>
        </div>

        <div v-if="selectedItem" class="item-popup">
          <div class="item-popup-content">
            <span class="close" @click="selectedItem = null">&times;</span>
            <img :src="getIconPath(selectedItem.icon)" :alt="selectedItem.name" class="popup-item-icon" />
            <h2>{{ selectedItem.name }}</h2>
            <p>{{ selectedItem.desc }}</p>
            <p>类型: {{ selectedItem.type }}</p>
            <p>重量: {{ selectedItem.weight }}</p>
            <p>数量: {{ selectedItem.quantity }}</p>
            <button @click="useItem(selectedItem)" class="use-button">使用</button>
            <button @click="craftItem" class="craft-button">合成</button>
          </div>
        </div>

        <div v-if="message" class="message-popup">
          <div class="message-popup-content">
            <p>{{ message }}</p>
            <button @click="message = null">确定</button>
          </div>
        </div>

        <audio ref="interactionSound" src="interaction.mp3"></audio>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useSyncedMeta } from '../../../../webview/composables/useSyncedMeta.js';
import { findIcon } from './findicon.js'; // 调整路径
import { BagItem } from '../server/index.js';
import Draggable from '../../../../webview/src/components/Draggable.vue';

const syncedMeta = useSyncedMeta();
const character = syncedMeta.getCharacter();

const characterInventory = ref<BagItem[]>([]);
const backpackSlots = ref<number[]>([]);
const selectedCategory = ref('全部');
const selectedItem = ref<BagItem | null>(null);
const searchQuery = ref('');
const draggedItem = ref<number | null>(null);
const highlightedSlot = ref<number | null>(null);
const message = ref<string | null>(null);

const categories = ['全部', '武器', '防具', '工具', '消耗品'];
const itemsPerPage = 20;
const currentPage = ref(1);

onMounted(() => {
  if (character.value && character.value.inventory) {
    characterInventory.value = character.value.inventory;
  } else {
    characterInventory.value = [
      { icon: 'sword.png', name: '剑', quantity: 1, weight: 1, slot: 0, type: '武器', desc: '剑是一把拥有强大力量的武器。', maxStack: 1 },
      { icon: 'rubik.png', name: '魔方', quantity: 1, weight: 1, slot: 1, type: '工具', desc: '魔方是一个复杂的益智玩具。', maxStack: 1 },
    ]
  }

  // 假设背包有40个槽位
  const totalSlots = 40;
  backpackSlots.value = Array.from({ length: totalSlots }, (_, index) => index);
});

watch(characterInventory, () => {
  // 强制刷新界面
}, { deep: true });

const getIconPath = (iconName: string) => {
  return findIcon(iconName);
};

const totalWeight = computed(() => {
  return characterInventory.value.reduce((sum, item) => sum + item.weight * item.quantity, 0);
});

const capacityPercentage = computed(() => {
  return (totalWeight.value / 250) * 100;
});

const selectCategory = (category: string) => {
  selectedCategory.value = category;
  currentPage.value = 1;
};

const filteredSlots = computed(() => {
  const filteredByCategory = selectedCategory.value === '全部'
    ? backpackSlots.value
    : backpackSlots.value.filter(slot => characterInventory.value[slot]?.type === selectedCategory.value);

  const filteredBySearch = searchQuery.value.trim() === ''
    ? filteredByCategory
    : filteredByCategory.filter(slot => characterInventory.value[slot]?.name.includes(searchQuery.value.trim()));

  return filteredBySearch.slice((currentPage.value - 1) * itemsPerPage, currentPage.value * itemsPerPage);
});

const totalPages = computed(() => {
  const filteredByCategory = selectedCategory.value === '全部'
    ? backpackSlots.value
    : backpackSlots.value.filter(slot => characterInventory.value[slot]?.type === selectedCategory.value);

  const filteredBySearch = searchQuery.value.trim() === ''
    ? filteredByCategory
    : filteredByCategory.filter(slot => characterInventory.value[slot]?.name.includes(searchQuery.value.trim()));

  return Math.ceil(filteredBySearch.length / itemsPerPage);
});

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const showItemDetails = (item: BagItem | null) => {
  console.log('Showing details for item:', item);  // 调试日志
  selectedItem.value = item;
};

const handleDrag = (from_id: string, to_id: string) => {
  console.log(`Drag from ${from_id} to ${to_id}`);  // 调试日志
  const fromSlot = parseInt(from_id.replace('slot-', ''));
  const toSlot = parseInt(to_id.replace('slot-', ''));
  if (fromSlot !== toSlot && !isNaN(fromSlot) && !isNaN(toSlot)) {
    draggedItem.value = fromSlot;
    highlightedSlot.value = toSlot;
  }
};

const handleDrop = (from_id: string, to_id: string) => {
  console.log(`Drop from ${from_id} to ${to_id}`);  // 调试日志
  const fromSlot = parseInt(from_id.replace('slot-', ''));
  const toSlot = parseInt(to_id.replace('slot-', ''));
  if (fromSlot !== toSlot && !isNaN(fromSlot) && !isNaN(toSlot)) {
    const temp = characterInventory.value[toSlot];
    characterInventory.value[toSlot] = characterInventory.value[fromSlot];
    characterInventory.value[fromSlot] = temp;
    draggedItem.value = null;
    highlightedSlot.value = null;
    // 强制刷新界面
    characterInventory.value = [...characterInventory.value];
    console.log('Inventory after drop:', characterInventory.value);  // 调试日志
  }
};

const handleClick = (id: string) => {
  const slot = parseInt(id.replace('slot-', ''));
  console.log('Click on slot:', slot);  // 调试日志
  showItemDetails(characterInventory.value[slot]);
};

const handleDoubleClick = (id: string) => {
  const slot = parseInt(id.replace('slot-', ''));
  console.log('Double click on slot:', slot);  // 调试日志
  if (characterInventory.value[slot]) {
    useItem(characterInventory.value[slot]);
  }
};

const handleMiddleClick = (id: string) => {
  console.log('Middle click on:', id);  // 调试日志
  // 中键点击的处理逻辑
};

const handleRightClick = (id: string) => {
  console.log('Right click on:', id);  // 调试日志
  // 右键点击的处理逻辑
};

const isHighlighted = (slot: number) => {
  return highlightedSlot.value === slot;
};

const playSound = () => {
  const sound = document.querySelector('audio');
  if (sound) {
    sound.play();
  }
};

const useItem = (item: BagItem) => {
  // 添加物品使用逻辑
  console.log('Using item:', item);  // 调试日志
  message.value = `使用了 ${item.name}`;
  selectedItem.value = null;
};

const craftItem = () => {
  // 添加物品合成逻辑
  message.value = '合成物品功能尚未实现';
};

const sortInventory = (criterion: string) => {
  if (criterion === 'name') {
    characterInventory.value.sort((a, b) => a.name.localeCompare(b.name));
  } else if (criterion === 'weight') {
    characterInventory.value.sort((a, b) => a.weight - b.weight);
  }
  message.value = '背包已整理';
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');

.main-content {
  font-family: 'Share Tech Mono', monospace;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 40vw;
  position: relative;
  left: 30vw;
  top: 0vh;
}

.backpack-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 90%;
  height: 90%;
}

.backpack {
  width: 80%;
  max-width: 800px;
  border: 2px solid #ccc; /* Modern GTA风格边框 */
  padding: 20px;
  background-color: rgba(60, 60, 60, 0.9); /* 半透明背景 */
  color: #fff; /* Modern字体颜色 */
  box-shadow: 0 0 20px #000; /* Modern阴影 */
  position: relative;
  overflow: hidden;
  border-radius: 15px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  position: relative;
}

.header h1 {
  font-size: 24px;
  color: #fff; /* Modern字体颜色 */
  margin: 0;
  padding: 0;
}

.sort-options {
  display: flex;
  gap: 10px;
}

.sort-button {
  background: none;
  border: 2px solid #ccc;
  color: #ccc;
  padding: 10px 20px;
  cursor: pointer;
  font-family: 'Share Tech Mono', monospace;
  transition: background-color 0.3s, color 0.3s;
}

.sort-button:hover {
  background-color: #ccc;
  color: #333;
}

.tabs {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.tabs button {
  background: none;
  border: 2px solid #ccc;
  color: #ccc;
  padding: 10px 20px;
  margin: 0 5px;
  cursor: pointer;
  font-family: 'Share Tech Mono', monospace;
  transition: background-color 0.3s, color 0.3s;
}

.tabs button.active,
.tabs button:hover {
  background-color: #ccc;
  color: #333;
}

.tabs input {
  padding: 10px;
  margin-left: 10px;
  border: 2px solid #ccc;
  background: none;
  color: #ccc;
  font-family: 'Share Tech Mono', monospace;
}

.inventory {
  display: grid;
  grid-template-columns: repeat(5, 1fr); /* 调整为5列布局 */
  gap: 10px;
  flex-grow: 1;
}

.inventory-item {
  border: 1px solid #ccc; /* Modern边框 */
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #3e3e3e; /* 深色背景 */
  transition: background-color 0.3s, transform 0.3s;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  height: 80px; /* 无物品时高度 */
}

.inventory-item > .item-details {
  height: 120px; /* 有物品时高度 */
  width: 100%;
  padding: 10px;
}

.inventory-item.highlight {
  border-color: #ff0; /* 高亮边框颜色 */
  box-shadow: 0 0 10px #ff0; /* 高亮阴影 */
}

.inventory-item.dragging {
  opacity: 0.5;
  transform: scale(1.1);
}

.inventory-item:hover {
  background-color: #5e5e5e;
  transform: scale(1.05);
  z-index: 1;
}

.item-icon {
  width: 64px;
  height: 64px;
  margin-bottom: 10px;
  filter: drop-shadow(0 0 5px #fff);
}

.item-details {
  text-align: center;
  position: relative;
}

.item-details h3 {
  font-size: 18px;
  color: #fff; /* Modern字体颜色 */
  margin: 0;
}

.quantity {
  margin-top: 5px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}

.pagination button {
  background: none;
  border: 2px solid #ccc;
  color: #ccc;
  padding: 5px 10px;
  cursor: pointer;
  font-family: 'Share Tech Mono', monospace;
  transition: background-color 0.3s, color 0.3s;
}

.pagination button:disabled {
  border-color: #555;
  color: #555;
}

.pagination span {
  margin: 0 10px;
  color: #ccc;
}

.footer {
  text-align: center;
  margin-top: 20px;
  position: relative;
}

.footer p {
  font-size: 16px;
  color: #fff; /* Modern字体颜色 */
  margin: 0;
}

.capacity-bar {
  width: 100%;
  height: 20px;
  background-color: #3e3e3e;
  border: 2px solid #ccc;
  margin-top: 10px;
  position: relative;
}

.capacity-fill {
  height: 100%;
  background-color: #ccc;
  width: 0;
  transition: width 0.3s;
}

.item-popup {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.5s;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.item-popup-content {
  background-color: #2e2e2e;
  border: 2px solid #ccc;
  padding: 20px;
  width: 300px;
  text-align: center;
  position: relative;
  color: #fff; /* Modern字体颜色 */
  box-shadow: 0 0 20px #000; /* Modern阴影 */
  animation: popIn 0.5s;
}

@keyframes popIn {
  from { transform: scale(0.8); }
  to { transform: scale(1); }
}

.item-popup-content h2 {
  margin-top: 0;
}

.close {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 24px;
  cursor: pointer;
  color: #fff;
}

.popup-item-icon {
  width: 128px;
  height: 128px;
  margin-bottom: 10px;
  filter: drop-shadow(0 0 5px #fff);
}

.use-button, .craft-button {
  background: none;
  border: 2px solid #ccc;
  color: #ccc;
  padding: 10px 20px;
  cursor: pointer;
  font-family: 'Share Tech Mono', monospace;
  transition: background-color 0.3s, color 0.3s;
  margin: 10px 0;
}

.use-button:hover, .craft-button:hover {
  background-color: #ccc;
  color: #333;
}

.message-popup {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.5s;
}

.message-popup-content {
  background-color: #2e2e2e;
  border: 2px solid #ccc;
  padding: 20px;
  width: 300px;
  text-align: center;
  color: #fff;
  box-shadow: 0 0 20px #000; /* Modern阴影 */
}

.message-popup-content button {
  background: none;
  border: 2px solid #ccc;
  color: #ccc;
  padding: 10px 20px;
  cursor: pointer;
  font-family: 'Share Tech Mono', monospace;
  transition: background-color 0.3s, color 0.3s;
  margin-top: 10px;
}

.message-popup-content button:hover {
  background-color: #ccc;
  color: #333;
}
</style>
