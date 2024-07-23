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
        <StatusBar label="血量" :value="player.health" color="linear-gradient(90deg, rgba(255,0,0,1) 0%, rgba(255,154,0,1) 100%)" icon="fa-heart" />
        <StatusBar label="耐力" :value="player.stamina" color="linear-gradient(90deg, rgba(0,255,0,1) 0%, rgba(0,128,0,1) 100%)" icon="fa-running" />
        <StatusBar label="饱食度" :value="player.hunger" color="linear-gradient(90deg, rgba(255,165,0,1) 0%, rgba(255,69,0,1) 100%)" icon="fa-utensils" />
        <StatusBar label="饥渴度" :value="player.thirst" color="linear-gradient(90deg, rgba(0,0,255,1) 0%, rgba(0,191,255,1) 100%)" icon="fa-tint" />
        <StatusBar label="肺活量" :value="player.lungCapacity" color="linear-gradient(90deg, rgba(0,255,255,1) 0%, rgba(0,128,128,1) 100%)" icon="fa-lungs" />
        <StatusBar label="护甲值" :value="player.armor" color="linear-gradient(90deg, rgba(169,169,169,1) 0%, rgba(128,128,128,1) 100%)" icon="fa-shield-alt" />
      </div>
      <div class="vehicle-hud">
        <VehicleHUD :vehicle="vehicle" />
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
    width: 100%;
    padding: 10px;
    background-color: rgba(0, 0, 0, 0.75);
    color: white;
    font-family: Arial, sans-serif;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    }
    
    .top-bar {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 20px;
    }
    
    .info {
    display: flex;
    justify-content: space-between;
    width: 80%;
    }
    
    .info span {
    margin: 0 10px;
    display: flex;
    align-items: center;
    }
    
    .info span i {
    margin-right: 5px;
    }
    
    .status-bars {
    display: flex;
    flex-direction: column;
    gap: 15px;
    }
    
    .vehicle-hud {
    margin-top: 20px;
    }
    </style>
    