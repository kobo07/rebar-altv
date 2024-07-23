<template>
    <div class="vehicle-hud">
      <div class="vehicle-status">
        <div class="status-item">
          <i class="fas fa-tachometer-alt"></i> 时速: {{ vehicle.speed }} km/h
        </div>
        <div class="status-item">
          <i class="fas fa-car-side"></i> 挡位: {{ vehicle.gear }}
        </div>
        <div class="status-item">
          <i class="fas" :class="vehicle.headlights ? 'fa-lightbulb' : 'fa-lightbulb-slash'"></i> 车灯: {{ vehicle.headlights ? '开' : '关' }}
        </div>
        <div class="status-item">
          <i class="fas fa-car" :class="vehicle.engineOn ? 'fa-car-side' : 'fa-power-off'"></i> 引擎: {{ vehicle.engineOn ? '开' : '关' }}
        </div>
        <div class="status-item">
          <i class="fas" :class="vehicle.locked ? 'fa-lock' : 'fa-unlock'"></i> 车辆: {{ vehicle.locked ? '锁' : '解锁' }}
        </div>
      </div>
    </div>
    </template>
    
    <script>
    export default {
    props: {
      vehicle: {
        type: Object,
        required: true,
      },
    },
    };
    </script>
    
    <style>
    .vehicle-hud {
    padding: 10px;
    background-color: rgba(50, 50, 50, 0.75);
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    color: white;
    font-family: Arial, sans-serif;
    }
    
    .vehicle-status {
    display: flex;
    flex-direction: column;
    gap: 10px;
    }
    
    .status-item {
    display: flex;
    align-items: center;
    }
    
    .status-item i {
    margin-right: 10px;
    font-size: 20px;
    }
    </style>
    