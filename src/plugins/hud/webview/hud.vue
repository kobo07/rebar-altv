<template>
  <div class="hud">
    <div class="top-bar">
      <div class="info">
        <span><i class="fas fa-id-badge"></i> ID: {{ player.id }}</span>
        <span><i class="fas fa-briefcase"></i> 职业: {{ player.job }}</span>
        <span><i class="fas fa-clock"></i> 状态: {{ player.status }}</span>
        <span><i class="fas fa-clock"></i> 时间: {{ time }}</span>
        <span><i class="fas fa-heart"></i> 健康: {{ player.healthStatus }}</span>
      </div>
    </div>
    <div class="status-bars">
      <StatusBar label="血量" :value="player.health" color="rgba(255, 0, 0, 1)" icon="fa-heart" />
      <StatusBar label="耐力" :value="player.stamina" color="rgba(0, 255, 0, 1)" icon="fa-running" />
      <StatusBar label="饱食度" :value="player.hunger" color="rgba(255, 165, 0, 1)" icon="fa-utensils" />
      <StatusBar label="饥渴度" :value="player.thirst" color="rgba(0, 0, 255, 1)" icon="fa-tint" />
      <StatusBar label="肺活量" :value="player.lungCapacity" color="rgba(0, 255, 255, 1)" icon="fa-lungs" />
      <StatusBar label="护甲值" :value="player.armor" color="rgba(169, 169, 169, 1)" icon="fa-shield-alt" />
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import StatusBar from './components/StatusBar.vue';
import VehicleHUD from './components/VehicleHUD.vue';

export default {
  components: {
    StatusBar,
    VehicleHUD,
  },
  setup() {
    const player = ref({
      id: '12345',
      job: '警察',
      status: '上班',
      healthStatus: '健康',
      health: 80,
      stamina: 70,
      hunger: 60,
      thirst: 50,
      lungCapacity: 40,
      armor: 30,
    });

    const vehicle = ref({
      gear: 'D',
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
    });

    return {
      player,
      vehicle,
      time,
    };
  },
};
</script>

<style>
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
