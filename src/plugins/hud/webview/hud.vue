<template>
  <div>
    <div class="info">
      <span><i class="fas fa-id-badge"></i> ID: {{ id }}</span>
      <span><i class="fas fa-briefcase"></i> 职业: {{ player.job }}</span>
      <span><i class="fas fa-clock"></i> 状态: {{ player.status }}</span>
      <span><i class="fas fa-clock"></i> 时间: {{ time }}</span>
      <span><i class="fas fa-heart"></i> 健康: {{ player.healthStatus }}</span>
      <span><i class="fas fa-network-wired"></i> 延迟: {{ ping }}</span>
    </div>

    <div class="flex grow items-center gap-1 bg-gradient-to-r from-gray-500/70 to-transparent pl-2 text-white ">
    <div class="pos" >
      <span ><i class="fas fa-map-marker-alt "></i> {{ street }}</span>
    </div>
    </div>

    <div class="status-bars">

      <StatusBar label="血量" :value="Math.max(Math.floor(health - 99), 0)" color="linear-gradient(90deg, rgba(139,0,0,1) 0%, rgba(255,69,0,1) 100%)" :icon="healthIcon()"  />
      <StatusBar label="耐力" :value="Math.floor(stamina)" color="linear-gradient(90deg, rgba(0,100,0,1) 0%, rgba(50,205,50,1) 100%)" :icon="staminaIcon()" />
      <transition name="fade-scale">
        <StatusBar v-show="armour !== 0" label="护甲" :value="armour" color="linear-gradient(90deg, rgba(105,105,105,1) 0%, rgba(211,211,211,1) 100%)" icon="fa-shield-alt"  />
      </transition>
      <StatusBar label="食物" :value="food" color="linear-gradient(90deg, rgba(255,140,0,1) 0%, rgba(255,215,0,1) 100%)" :icon="foodicon()"  />
      <StatusBar label="饮水" :value="water" color="linear-gradient(90deg, rgba(0,0,139,1) 0%, rgba(65,105,225,1) 100%)" :icon="watericon()" />
      <StatusBar label="便意" :value="shit" color="linear-gradient(90deg, rgba(139,69,19,1) 0%, rgba(210,105,30,1) 100%)" :icon="pooicon()"  />
    </div> 

    <transition name="fade-scale">
      <VehicleHUD v-show="inVehicle" :vehicle="vehicleData"   class="vehicle-hud" />
    </transition>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch, computed } from 'vue';
import StatusBar from './components/StatusBar.vue';
import VehicleHUD from './components/VehicleHUD.vue';
import { usePlayerStats } from '@Composables/usePlayerStats.js';
import { useSyncedMeta } from '../../../../webview/composables/useSyncedMeta.js';
import { useEvents } from '@Composables/useEvents.js';
import { usePlayerStatsEx } from './stats.js';
import { useMinimap } from '@Composables/useMinimap.js';

const syncedMeta = useSyncedMeta();
const character = syncedMeta.getCharacter();
const vehicles = syncedMeta.getVehicle();
const { minimap } = useMinimap();

const getStylePosition = computed(() => {
  if (!minimap.value) {
    return ``;
  }

  return [`left: ${minimap.value.left + minimap.value.width}px`, `top: ${minimap.value.top}px`];
});

const {
  armour,
  engineOn,
  fps,
  gear,
  headlights,
  health,
  highbeams,
  indicatorLights,
  inVehicle,
  inWater,
  isAiming,
  isFlying,
  isTalking,
  locked,
  maxGear,
  ping,
  speed,
  stamina,
  street,
  vehicleHealth,
  weapon,
  weather,
  zone,
} = usePlayerStats();

const {
  id,
  food,
  shit,
  water,
  isSprint,
  isRunning,
  isHurt,
  isdead,
} = usePlayerStatsEx();

const player = ref({
  id: '12345',
  job: '警察',
  status: '上班',
  healthStatus: '健康',
  position: '地铁站',
  health: 80,
  stamina: 70,
  hunger: 60,
  shit: 0,
  thirst: 50,
  armor: 30,
  isdead: false,
  isTalking: false,
});

const vehicleData = computed(() => ({
  gear: gear.value,
  speed: speed.value,
  headlights: headlights.value,
  engineOn: engineOn.value,
  locked: locked.value,
}));


const time = ref(new Date().toLocaleTimeString());

onMounted(() => {
  setInterval(() => {
    time.value = new Date().toLocaleTimeString();
  }, 1000);
});

function healthIcon(): string {
  if (isdead.value) {
    return 'fa-skull';
  } else if (isHurt.value) {
    return 'fa-heart-broken';
  } else {
    return 'fa-heart';
  }
}

function staminaIcon(): string {
  if (inWater.value) {
    return 'fa-swimmer';
  } else if (isRunning.value || isSprint.value) {
    return 'fa-running';
  } else if (isFlying.value) {
    return 'fa-wheelchair';
  } else if (inVehicle.value) {
    return 'fa-wheelchair';
  } else {
    return 'fa-walking';
  }
}

function foodicon(): string {
  return 'fa-utensils';
}

function watericon(): string {
  return 'fa-tint';
}

function pooicon(): string {
  if (shit.value < 60) {
    return 'fa-poop';
  } else {
    return 'fa-poo';
  }
}



</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');

.info {
  position: absolute;
  right: 0vw;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 0.5vw;
  width: 20vw;
  
}

.info span {
  margin: 0.2vw;
  display: flex;
  align-items: center;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; /* 现代化字体 */
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8); /* 黑色描边，增加对比度 */
  font-size: 0.9vw;

  --tw-text-opacity: 1;
  color: rgb(203 213 225 / var(--tw-text-opacity)) /* #cbd5e1 */;
  font-weight: 700;



}

.info span i {
  margin-right: 0.5vw;
}

.pos {
  position: absolute;
  left: 16vw;
  bottom: 20vh;
  padding: 1vh;
  height: 4.2vh;
  width: 10vw;
  color: #ffffff; /* 纯白色字体 */
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; /* 现代化字体 */
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8); /* 黑色描边，增加对比度 */
  font-size:0.9vw;
  border-radius:1vw ;

  display: flex;
  flex-grow: 1;
  align-items: center;
  gap: 0.25rem /* 4px */;
  background-image: linear-gradient(to right, var(--tw-gradient-stops));
  --tw-gradient-from: rgb(107 114 128 / 0.7) var(--tw-gradient-from-position);
  --tw-gradient-to: rgb(107 114 128 / 0) var(--tw-gradient-to-position);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
  --tw-gradient-to: transparent var(--tw-gradient-to-position);
  --tw-text-opacity: 1;
  color: rgb(255 255 255 / var(--tw-text-opacity)) /* #ffffff */;
}



.status-bars {
  display: flex;
  flex-direction: column;
  position: absolute;
  padding: 1vw;
  width: 12vw;
  left: 16vw;
  bottom: 0vh;
  gap: 0.3vw;

  border-radius: 1vw;



 
  background-image: linear-gradient(to right, var(--tw-gradient-stops));
  --tw-gradient-from: rgb(107 114 128 / 0.7) var(--tw-gradient-from-position);
  --tw-gradient-to: rgb(107 114 128 / 0) var(--tw-gradient-to-position);
  --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);
  --tw-gradient-to: transparent var(--tw-gradient-to-position);
  --tw-text-opacity: 1;
  color: rgb(255 255 255 / var(--tw-text-opacity)) /* #ffffff */;
}

.vehicle-hud {
  position: absolute;
  bottom: 1%;
  right: 1%;
  width: 30vw;
  padding: 1vw;
  background-color: rgba(50, 50, 50, 0.5);
  border-radius: 1vw;
  box-shadow: 0 0 1vw rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.fade-scale-enter-active, .fade-scale-leave-active {
  transition: opacity 0.5s, transform 0.5s;
}

.fade-scale-enter-from {
  opacity: 0;
  transform: scale(0.9);
}

.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

@media (max-width: 768px) {
  .hud {
    width: 25vw;
    padding: 1.5vw;
  }

  .status-bars {
    gap: 1.5vw;
  }

  .vehicle-hud {
    width: 40vw;
    padding: 1.5vw;
  }
}

@media (max-width: 480px) {
  .hud {
    width: 35vw;
    padding: 2vw;
  }

  .status-bars {
    gap: 2vw;
  }

  .vehicle-hud {
    width: 50vw;
    padding: 2vw;
  }
}
</style>
