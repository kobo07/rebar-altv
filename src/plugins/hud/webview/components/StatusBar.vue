<template>
  <div class="status-bar">
    <i :class="`fas ${icon}`"></i>
   <!--  <span class="label">{{ label }}</span> -->
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
  margin-right: -0.3vw;
  margin-left: -0.4vw;
  font-size: 1.5vw;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.fa-heart {
  color: red;
  position: relative;
  background: linear-gradient(135deg, #ff4e50 0%, #e52d27 50%, #ff4e50 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
  animation: heartbeat 2.5s infinite;
}

.fa-heart-broken {
  color: rgb(114, 22, 22);
  position: relative;
  background: linear-gradient(135deg, #4e0000 0%, #8b0000 50%, #4e0000 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
  animation: pulse 1s infinite;
}

.fa-skull {
  color: rgb(128, 128, 128);
  position: relative;
  background: linear-gradient(135deg, #9e9e9e 0%, #616161 50%, #9e9e9e 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 5px rgba(128, 128, 128, 0.5);
}
.fa-walking{
  color: rgb(0, 255, 8);
  position: relative;
  background: linear-gradient(135deg, #4CAF50 0%, #8BC34A 50%, #4CAF50 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 5px rgba(0, 255, 0, 0.5);
}

.fa-running{
  color: rgb(0, 255, 0);
  position: relative;
  background: linear-gradient(135deg, #76FF03 0%, #64DD17 50%, #76FF03 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 5px rgba(0, 255, 0, 0.5);
  animation: walk 1s infinite linear;
}

.fa-swimmer{
  color: rgb(0, 255, 255);
  position: relative;
  background: linear-gradient(135deg, #00BCD4 0%, #00ACC1 50%, #00BCD4 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.5);
  animation: swim 1s infinite linear;
}

.fa-shield-alt {
  color: rgb(0, 0, 255);
  position: relative;
  background: linear-gradient(135deg, #cfd9df 0%, #e2ebf0 40%, #cfd9df 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
}

.fa-utensils {
  color: rgb(255, 165, 0);
  position: relative;
  background: linear-gradient(135deg, #FFA500 0%, #FF8C00 50%, #FFA500 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 5px rgba(255, 165, 0, 0.5);
}

.fa-tint {
  color: rgb(0, 191, 255);
  position: relative;
  background: linear-gradient(135deg, #00BFFF 0%, #1E90FF 50%, #00BFFF 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 5px rgba(0, 191, 255, 0.5);
}

.fa-poop{
  color: rgb(129, 86, 0);
  position: relative;
  background: linear-gradient(135deg, #D2691E 0%, #8B4513 50%, #D2691E 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 5px rgba(129, 86, 0, 0.5);
}

.fa-poo{
  color: rgb(69, 46, 0);
  position: relative;
  background: linear-gradient(135deg, #8B4513 0%, #D2691E 50%, #8B4513 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 5px rgba(69, 46, 0, 0.5);
}


@keyframes heartbeat {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.7;
  }
}


@keyframes walk {
  0%, 100% {
    transform: translateY(0);
  }
  25% {
    transform: translateY(-0.2vh);
  }
  75% {
    transform: translateY(0.2vh);
  }
}



@keyframes swim {
      0%, 100% {
        transform:  translateY(0);
      }
      25% {
        transform: translateY(0.1vh);
      }
      50% {
        transform:translateY(0.17vh);
      }
      75% {
        transform:  translateY(0.1vh);
      }
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
