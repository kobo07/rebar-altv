/*
import { ref, computed } from 'vue';
import { Events } from '@Shared/events/index.js'
import { useEvents } from '../../../../webview/composables/useEvents.js'
import { BagItem } from '../server/index.js';




const events = useEvents();

// 玩家数据
const data = ref<BagItem[]>([]);

// 初始化
let isInit = false;

// 绑定
export function useInventory() {
    if (!isInit) {
        events.on('sendinv', (stats: BagItem[]) => (data.value = stats));
        isInit = true;
    }

    return {
        inventory: computed(() => {
            return data.value;
        }),
    
    };
}
*/