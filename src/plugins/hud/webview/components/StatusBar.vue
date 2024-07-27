<template>
  <div class="status-bar">
    <i :class="`fas ${icon}`"></i>
   <!--  <span class="label">{{ label }}</span>  -->
    <div class="bar">
      <div class="fill" :style="{ width: value + '%', background: color }"></div>
    </div>
   <!--  <span  class="value">{{ value }}%</span> -->
  </div>
</template>

<script lang="ts" setup>
import { defineProps } from 'vue';

const props = defineProps<{
  label: string;
  value: number;
  color: string;
  icon: string;
}>();
</script>

<style scoped>
.status-bar {
  display: flex;
  align-items: center;
  font-size: 1vw;
}

.status-bar i {
  width: 2vw;
  margin-right: 0.5vw;
  font-size: 1.5vw;
  text-align: center;
}

.label {
  width: 4vw;
}

.bar {
  flex-grow: 1;
  height: 1vw;
  background-color: rgba(255, 255, 255, 0.2);
  margin: 0 0.5vw;
  border-radius: 0.5vw;
  overflow: hidden;
  position: relative;
  box-shadow: inset 0 0 0.2vw rgba(0, 0, 0, 0.5);
}

.fill {
  height: 100%;
  border-radius: 0.5vw;
  transition: width 0.5s ease-in-out;
}

.value {
  width: 2vw;
  text-align: right;
  font-size: 0.9vw;
}
</style>
