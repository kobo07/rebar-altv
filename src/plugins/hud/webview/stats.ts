import { ref, computed } from 'vue';
import { Events } from '@Shared/events/index.js'
import { useEvents } from '../../../../webview/composables/useEvents.js'

//添加属性
export type PlayerStatsEx = {
    food: number;
    water: number;
    shit: number;
};

const events = useEvents();

// 玩家数据
const data = ref<PlayerStatsEx>({
    food: 100,
    water: 100,
    shit: 0
});

// 初始化
let isInit = false;

// 绑定
export function usePlayerStatsEx() {
    if (!isInit) {
        events.on('sendstatex', (stats: PlayerStatsEx) => (data.value = stats));
        isInit = true;
    }

    return {
        food: computed(() => {
            return data.value.food;
        }),
        water: computed(() => {
            return data.value.water;
        }),
        shit: computed(() => {
            return data.value.shit;
        }),

    };
}
