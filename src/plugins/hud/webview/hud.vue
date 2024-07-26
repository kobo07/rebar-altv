<template>
  <div>
    <div class="hud">
      <div class="top-bar">
        <div class="info">
          <span><i class="fas fa-id-badge"></i> ID: {{ player.id }}</span>
          <span><i class="fas fa-briefcase"></i> 职业: {{ player.job }}</span>
          <span><i class="fas fa-clock"></i> 状态: {{ player.status }}</span>
          <span><i class="fas fa-clock"></i> 时间: {{ time }}</span>
          <span><i class="fas fa-heart"></i> 健康: {{ player.healthStatus }}</span>
          <span><i class="fas fa-map-marker-alt"></i> 位置: {{ street }}</span>
          <span><i class="fas fa-sync"></i> 刷新率: {{ fps }}</span>
          <span><i class="fas fa-network-wired"></i> 延迟: {{ ping }}</span>

        </div>
      </div>
      <div class="status-bars">
        <StatusBar label="血量" :value="Math.floor(health-100)" color="linear-gradient(90deg, rgba(255,0,0,1) 0%, rgba(255,154,0,1) 100%)" icon="fa-heart" />
        <StatusBar label="耐力" :value="Math.floor(stamina)" color="linear-gradient(90deg, rgba(0,255,0,1) 0%, rgba(0,128,0,1) 100%)" icon="fa-running" />
        <StatusBar label="饱食度" :value="player.hunger" color="linear-gradient(90deg, rgba(255,165,0,1) 0%, rgba(255,69,0,1) 100%)" icon="fa-utensils" />
        <StatusBar label="饥渴度" :value="player.thirst" color="linear-gradient(90deg, rgba(0,0,255,1) 0%, rgba(0,191,255,1) 100%)" icon="fa-tint" />
        <StatusBar label="护甲值" :value="player.armor" color="linear-gradient(90deg, rgba(169,169,169,1) 0%, rgba(128,128,128,1) 100%)" icon="fa-shield-alt" />
      </div>
    </div>
    <VehicleHUD v-if="!inVehicle" :vehicle="vehicle" class="vehicle-hud" />
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted,watch } from 'vue';
import StatusBar from './components/StatusBar.vue';
import VehicleHUD from './components/VehicleHUD.vue';
import { usePlayerStats } from '@Composables/usePlayerStats.js';
import { useSyncedMeta } from '../../../../webview/composables/useSyncedMeta.js';
import { useEvents } from '@Composables/useEvents.js';

const syncedMeta = useSyncedMeta();
const character = syncedMeta.getCharacter();
const vehicles = syncedMeta.getVehicle();



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
  isdead:false,
  isTalking: false,
});

const vehicle = ref({
  gear: 0,
  speed: 60,
  headlights: true,
  engineOn: true,
  locked: false,
});

const time = ref(new Date().toLocaleTimeString());

onMounted(() => {

  setInterval(() => {
    time.value = new Date().toLocaleTimeString();
  }, 1000);

  player.value.health = ((health.value - 100) / 100) * 100;
  player.value.stamina = stamina.value
  player.value.armor = (armour.value/200)*100;
  player.value.isTalking = isTalking.value;
  player.value.position = street.value;

  player.value.hunger = character.value.food;
  player.value.thirst = character.value.water;
  
  vehicle.value.gear = gear.value;
  vehicle.value.speed = speed.value;
  vehicle.value.headlights = headlights.value
  vehicle.value.engineOn = engineOn.value;
  vehicle.value.locked = locked.value;
});









</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');

.hud {
  position: absolute;
  bottom: 20%;
  left: 1%;
  width: 18vw;
  padding: 1vw;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  font-family: Arial, sans-serif;
  border-radius: 1vw;
  box-shadow: 0 0 1vw rgba(0, 0, 0, 0.5);
}

.top-bar {
  margin-bottom: 1vw;
  border-bottom: 0.1vw solid rgba(255, 255, 255, 0.2);
  padding-bottom: 1vw;
}

.info {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5vw;
}

.info span {
  margin: 0.2vw;
  display: flex;
  align-items: center;
}

.info span i {
  margin-right: 0.5vw;
}

.status-bars {
  display: flex;
  flex-direction: column;
  gap: 0.5vw;
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
