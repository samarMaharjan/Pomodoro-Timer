<script setup>
import { Icon } from "@iconify/vue";
import { ref, onUnmounted, computed } from 'vue'
import alarm from '@/assests/alarm.mp3';
import { useTasks } from '@/composables/useTasks';
const { tasks, decrementPomodoro } = useTasks();
const showForm = ref(false);
const alarmSound = new Audio(alarm);
alarmSound.preload = 'auto';
const activeTab = ref('default')
const activeTime = ref('Pomodoro');
const time = ref(25 * 60);
const defaultTime = {
    Pomodoro: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60
};
const CustomTime = ref({
    Pomodoro: '',
    shortBreak: '',
    longBreak: ''
}); {

};
const pomodoro = ref(25 * 60);
const shortBreak = ref(5 * 60);
const longBreak = ref(15 * 60);
const start = ref(false);
const intervalId = ref(null);

const pomodoroCount = ref(0);

const optionAutoNext = ref(false);
const AutoNext = ref('false');


const formattedTime = computed(() => {
    const minutes = Math.floor(time.value / 60)
        .toString()
        .padStart(2, '0')

    const seconds = (time.value % 60)
        .toString()
        .padStart(2, '0')

    return `${minutes}:${seconds}`
})

const askTime = () => {
    showForm.value = true;
};

const saveCustomTime = () => {
    showForm.value = false;
    pomodoro.value = CustomTime.value.Pomodoro;
    shortBreak.value = CustomTime.value.shortBreak;
    longBreak.value = CustomTime.value.longBreak;
    time.value = pomodoro.value;
    activeTab.value = 'custom';
    activeTime.value = 'Pomodoro';
    showForm.value = false;
};

const toggleStart = () => {
    if (start.value) {
        start.value = false;
        pauseCountDown();
    } else {
        startCountDown();
        start.value = true;
    }
};

const defaultPomodoro = () => {
    activeTab.value = 'default';
    pomodoro.value = defaultTime.Pomodoro;
    shortBreak.value = defaultTime.shortBreak;
    longBreak.value = defaultTime.longBreak;
    time.value = pomodoro.value;
};

const startCountDown = () => {
    if (intervalId.value) return; // Prevent multiple intervals
    start.value = true;
    intervalId.value = setInterval(() => {
        if (time.value > 0) {
            time.value -= 1;
        } else {
            alarmSound.play();
            setTimeout(() => {
                alarmSound.pause()
                alarmSound.currentTime = 0
                autoNextCountdown();
            }, 5000)
            next();
            pauseCountDown();
        }
    }, 1000);
};

const pauseCountDown = () => {
    clearInterval(intervalId.value);
    intervalId.value = null;
    start.value = false;

};

const PomodoroTab = () => {
    pauseCountDown();
    activeTime.value = 'Pomodoro';
    time.value = pomodoro.value;
};

const shortBreakTab = () => {
    pauseCountDown();
    activeTime.value = 'Short Break';
    time.value = shortBreak.value;
};

const longBreakTab = () => {
    pauseCountDown();
    activeTime.value = 'Long Break';
    time.value = longBreak.value;
};

const resetTimer = () => {
    pauseCountDown();
    if (activeTime.value === 'Pomodoro') {
        time.value = pomodoro.value;
    } else if (activeTime.value === 'Short Break') {
        time.value = shortBreak.value;
    } else if (activeTime.value === 'Long Break') {
        time.value = longBreak.value;
    }
};

const next = () => {
    if (activeTime.value === 'Pomodoro') {
        pomodoroCount.value += 1;
        if (tasks.value.length > 0) {
            decrementPomodoro(0);
        }
        if (pomodoroCount.value % 4 === 0) {
            longBreakTab();
        } else {
            shortBreakTab();
        }
    } else {
        PomodoroTab();
    }
};

const showAutoNextOption = () => {
    optionAutoNext.value = true;
};

const cancelAutoNext = () => {
    optionAutoNext.value = false;
};

const autoNextCountdown = () => {
    if (AutoNext.value === 'true') {
        startCountDown();
    }
};

onUnmounted(() => {
    clearInterval(intervalId.value)
})


</script>
<template>
    <div class="page">

        <div class="autonext">
            <button @click="showAutoNextOption">Auto Next Option</button>
            <button @click="askTime">Add Another Clock</button>
        </div>
        <div class="timer-grid">
            <div class="timer">
                <div class="selection">
                    <p :class="{ active: activeTab === 'default' }" @click="defaultPomodoro">
                        Default
                    </p>


                </div>
                <div class="time">
                    <ul>
                        <li :class="{ active: activeTime === 'Pomodoro' }" @click="PomodoroTab()">
                            Pomodoro
                        </li>
                        <li :class="{ active: activeTime === 'Short Break' }" @click="shortBreakTab()">Short Break</li>
                        <li :class="{ active: activeTime === 'Long Break' }" @click="longBreakTab()">Long Break</li>
                    </ul>
                </div>
                <div class="time-value">
                    {{ formattedTime }}
                </div>
                <div class="options">
                    <div class="reset" @click="resetTimer">
                        <Icon icon="tabler:reload" width="24" height="24" />
                    </div>
                    <div class="start" @click="toggleStart">
                        <p v-if="!start">Start</p>
                        <p v-else>Pause</p>
                    </div>
                    <div class="next" @click="next">
                        <Icon icon="tabler:player-track-next-filled" width="24" height="24" />

                    </div>
                </div>
            </div>
        </div>
    </div>
    <div v-if="showForm" class="modal-overlay">
        <div class="modal">
            <form @submit.prevent="saveCustomTime">
                <input type="number" class="no-spinner" v-model="CustomTime.Pomodoro"
                    placeholder="Enter Pomodoro(minute)" />
                <input type="number" class="no-spinner" v-model="CustomTime.shortBreak"
                    placeholder="Enter Short Break(minute)" />
                <input type="number" class="no-spinner" v-model="CustomTime.longBreak"
                    placeholder="Enter Long Break(minute)" />
                <button type="submit">Save</button>
            </form>
        </div>
    </div>
    <div v-if="optionAutoNext" class="modal-overlay">
        <div class="modal">
            <form>
                <select name="autoNextOption" id="autoNextOption" v-model="AutoNext">
                    <option value="true">Enable Auto Next</option>
                    <option value="false">Disable Auto Next</option>
                </select>
                <div class="buttons">
                    <button class="auto-cancel" @click="cancelAutoNext">Close</button>
                </div>
            </form>
        </div>
    </div>
</template>

<style scoped>
    .page {
  min-height: 80vh;
  width: 100%;
  padding: 20px;
  background-color: #f6eded;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* AUTONEXT BUTTONS */
.autonext {
  width: 100%;
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.autonext button {
  flex: 1;
  margin: 0 10px;
  padding: 20px;
  font-size: 20px;
  background-color: #8e6969;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.autonext button:hover {
  background-color: #784949;
}

/* TIMER GRID */
.timer-grid {
  display: grid;
  gap: 24px;
  width: 100%;
  max-width: 1400px;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
}

/* SINGLE TIMER FULLSCREEN WHEN ONLY ONE */
.timer-grid:has(.timer:only-child) {
  grid-template-columns: 1fr;
}

.timer-grid:has(.timer:only-child) .timer {
  
  max-width: 900px;
  margin: auto;
}

/* TIMER CARD */
.timer {
  background-color: #f4e1e1;
  border: 2px solid #8e4343;
  border-radius: 15px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* TIME TABS */
.time ul {
  display: flex;
  list-style: none;
  gap: 20px;
  padding: 0;
}

.time ul li {
  cursor: pointer;
  padding: 10px 20px;
  border-radius: 8px;
  background-color: #e7caca;
}

.time ul li:hover {
  background-color: #d28e8e;
  color: white;
}

.time ul li.active {
  background-color: #8e4343;
  color: white;
}

/* TIME VALUE */
.time-value {
  font-size: 80px;
  margin: 40px 0;
  color: #3e2b2b;
}

/* OPTIONS */
.options {
  display: flex;
  align-items: center;
  gap: 20px;
}

.reset,
.start,
.next {
  padding: 10px 30px;
  background-color: #d28e8e;
  border-radius: 12px;
  cursor: pointer;
}

.reset:hover,
.start:hover,
.next:hover {
  background-color: #b76b6b;
  color: white;
}

/* MODALS */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 24px;
  border-radius: 12px;
  width: 400px;
}

/* ===== MODAL FORMS ===== */
.modal form {
  display: flex;
  flex-direction: column;
  gap: 15px;
  font-family: 'Roboto Condensed', sans-serif;
}

.modal input {
  padding: 12px 15px;
  font-size: 18px;
  border: 1px solid #ccc;
  border-radius: 8px;
  outline: none;
  transition: all 0.2s ease;
}

.modal input:focus {
  border-color: #8e4343;
  box-shadow: 0 0 5px rgba(142, 67, 67, 0.5);
}

/* Remove number input spinners */
.no-spinner::-webkit-inner-spin-button,
.no-spinner::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.modal select {
  padding: 12px 15px;
  font-size: 18px;
  border: 1px solid #ccc;
  border-radius: 8px;
  outline: none;
  transition: all 0.2s ease;
}

/* Submit button */
.modal button[type="submit"] {
  padding: 12px 20px;
  font-size: 18px;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  background-color: #8e4343;
  color: white;
  transition: 0.2s ease;
}

.modal button[type="submit"]:hover {
  background-color: #b76b6b;
}

/* Auto Next Close Button */
.modal .auto-cancel {
  padding: 12px 20px;
  font-size: 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  background-color: #ccc;
  color: #333;
  transition: 0.2s ease;
}

.modal .auto-cancel:hover {
  background-color: #999;
  color: white;
}


</style>