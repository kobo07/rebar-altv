import { ref, computed } from 'vue';
import { Events } from '@Shared/events/index.js'
import { useEvents } from '../../../../webview/composables/useEvents.js'

//添加属性
export type PlayerStatsEx = {
    id: number;
    food: number;
    water: number;
    shit: number;
    isSprint: boolean;
    isRunning: boolean;
    isHurt: boolean;
    isdead: boolean
};

const events = useEvents();

// 玩家数据
const data = ref<PlayerStatsEx>({
    id: 0,
    food: 100,
    water: 100,
    shit: 0,
    isSprint:false,
    isRunning: false,
    isHurt: false,
    isdead: false
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
        id: computed(() => {
            return data.value.id;
        }),
        food: computed(() => {
            return data.value.food;
        }),
        water: computed(() => {
            return data.value.water;
        }),
        shit: computed(() => {
            return data.value.shit;
        }),
        isSprint: computed(() => {
            return data.value.isSprint;
        }),
        isRunning: computed(() => {
            return data.value.isRunning;
        }),
        isHurt: computed(() => {
            return data.value.isHurt;
        }),
        isdead: computed(() => {
            return data.value.isdead;
        })


    };
}