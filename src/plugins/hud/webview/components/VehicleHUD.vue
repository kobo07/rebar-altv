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
        <i class="fas" :class="vehicle.engineOn ? 'fa-engine-warning' : 'fa-power-off'"></i> 引擎: {{ vehicle.engineOn ? '开' : '关' }}
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
  position: absolute;
  bottom: 1%;
  right: 1%;
  width: 25vw;
  padding: 1vw;
  background-color: rgba(50, 50, 50, 0.5);
  border-radius: 1vw;
  box-shadow: 0 0 1vw rgba(0, 0, 0, 0.5);
  color: white;
  font-family: Arial, sans-serif;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.vehicle-status {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.status-item {
  display: flex;
  align-items: center;
  margin: 0 0.2vw;
  font-size: 0.8vw;
}

.status-item i {
  margin-right: 0.2vw;
  font-size: 1.2vw;
}
</style>
