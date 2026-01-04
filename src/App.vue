<script setup>
  import Navbar from './components/Navbar.vue';
  import Timer from './components/Timer.vue';
  import Task from './components/Task.vue';
</script>

<template>
  <div class="navbar">
    <Navbar />
  </div>
  <div class="timer-section">
    <Timer />
    <Task />
  
  </div>
</template>

<style >
  @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@200..700&family=Roboto+Condensed:ital,wght@0,100..900;1,100..900&display=swap');
#app {
  font-family: Roboto Condensed;
}
.navbar {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60px;
  background-color: #553737;
  border: 1px none #ddd;
  margin: 0px;
}
.timer-section {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  height: calc(100vh - 60px);
  background-color: #f5f5f5;
}
.task {
  margin: 10px;
  border: 2px solid #8e4343;
  background-color: red;
  display: flex;
  flex-direction: column;
  height: 90vh;
  width: 30%;
  background-color: #f4e1e1;
  border-radius: 15px;
  align-items: center;
}
</style>
