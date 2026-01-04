<script setup>
import { Icon } from "@iconify/vue";

</script>
<template>
    <nav>
        <div class="header">
            <img src="@/assests/pomodoro.png" alt="">
            <h1>Pomodoro Timer</h1>
        </div>
        <div class="links">
            <p>Home</p>
            <p>About</p>
            <p>Contact</p>
        </div>
        <div class="mode">
        <Icon icon="material-symbols:moon-stars-rounded" width="24" height="24" />
        </div>
    </nav>
</template>
<style scoped>
nav {
    width: 100%;
    height: 60px;
    background-color: #553737;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border: 1px none #ddd;
    margin: 0px;
}

.header {
    display: flex;
    align-items: center;
    gap: 10px;
}

.header img {
    height: 40px;
    width: 40px;
}

h1 {
    color: white;
    font-family: 'Oswald', sans-serif;
    font-weight: 500;
    font-size: 24px;
    margin: 0;
}

.links {
    display: flex;
    gap: 20px;

}

.links p {
    color: white;
    font-family: 'Roboto Condensed', sans-serif;
    font-weight: 400;
    font-size: 18px;
    margin: 0;
    cursor: pointer;
}

.links p:hover {
    text-decoration: underline;
    color: #d28e8e;
}

.mode {
    margin-right: 20px;
    color: white;
    cursor: pointer;
}
.mode:hover {
    color: #d28e8e;
}
</style>