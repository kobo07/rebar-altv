<template>
    <div class="status-bar">
      <i :class="`fas ${icon}`"></i>
      <span class="label">{{ label }}</span>
      <div class="bar">
        <div
          class="fill"
          :style="{ width: value + '%', background: color }"
        ></div>
      </div>
      <span class="value">{{ value }}%</span>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      label: {
        type: String,
        required: true,
      },
      value: {
        type: Number,
        required: true,
      },
      color: {
        type: String,
        required: true,
      },
      icon: {
        type: String,
        required: true,
      },
    },
  };
  </script>
  
  <style>
  .status-bar {
    display: flex;
    align-items: center;
    font-size: 16px;
  }
  
  .status-bar i {
    margin-right: 10px;
    font-size: 20px;
  }
  
  .label {
    width: 80px;
  }
  
  .bar {
    flex-grow: 1;
    height: 25px;
    background-color: rgba(255, 255, 255, 0.2);
    margin: 0 10px;
    border-radius: 5px;
    overflow: hidden;
    position: relative;
    box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.5);
  }
  
  .fill {
    height: 100%;
    border-radius: 5px;
    transition: width 0.5s ease-in-out;
  }
  
  .value {
    width: 50px;
    text-align: right;
  }
  </style>
  