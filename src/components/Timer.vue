<script setup>
import { Icon } from "@iconify/vue";
import { ref, onUnmounted, computed } from 'vue'
import alarm from '@/assests/alarm.mp3';
import { useTasks } from '@/composables/useTasks';
const { tasks, decrementPomodoro } = useTasks();
const showForm = ref(false);
const alarmSound = new Audio(alarm);
alarmSound.preload = 'auto';
const activeTime = ref('Pomodoro');
const clocks = ref([]);
const defaultTime = {
    name: 'Default',
    Pomodoro: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
    activeTab: 'Pomodoro',
    start: false,
    intervalId: null,
    time: 25 * 60,
};
clocks.value.push(defaultTime);
const CustomTime = ref({
    name: '',
    Pomodoro: '',
    shortBreak: '',
    longBreak: '',

}); {

};

const pomodoroCount = ref(0);

const optionAutoNext = ref(false);
const AutoNext = ref('false');


const formattedTime = (time) => {
    const minutes = Math.floor(time / 60).toString().padStart(2, '0');
    const seconds = (time % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
};

const askTime = () => {
    showForm.value = true;
};

const saveCustomTime = () => {
    showForm.value = false;
    const newClock = {
        name: CustomTime.value.name,
        Pomodoro: CustomTime.value.Pomodoro * 60,
        shortBreak: CustomTime.value.shortBreak * 60,
        longBreak: CustomTime.value.longBreak * 60,
        activeTab: 'Pomodoro',
        start: false,
        intervalId: null,
        time: newClock.Pomodoro,
    }
    clocks.value.push(newClock);
    CustomTime.value.name = '';
    CustomTime.value.Pomodoro = '';
    CustomTime.value.shortBreak = '';
    CustomTime.value.longBreak = '';
};

const toggleStart = (clockName) => {
    clocks.value.forEach(clock => {
        if (clock.name === clockName) {
            if (clock.start) {
                clock.start = false;
                pauseCountDown(clockName);
            } else {
                startCountDown(clockName);
                clock.start = true;
            }
        }
    });
};



const startCountDown = (clockName) => {
    clocks.value.forEach(clock => {
        if (clock.name === clockName) {
            if (clock.activeTab === 'Pomodoro') {
                activeTime.value = 'Pomodoro';
                clock.time = clock.Pomodoro;
            } else if (clock.activeTab === 'shortBreak') {
                activeTime.value = 'shortBreak';
            } else if (clock.activeTab === 'longBreak') {
                activeTime.value = 'longBreak';
            }
            if (clock.intervalId) return;
            clock.start = true;
            clock.intervalId = setInterval(() => {
                if (time.value > 0) {
                    time.value -= 1;
                } else {
                    alarmSound.play();
                    setTimeout(() => {
                        alarmSound.pause()
                        alarmSound.currentTime = 0
                        autoNextCountdown(clockName);
                    }, 5000)
                    next();
                    pauseCountDown(clockName);
                }
            }, 1000);
        }
    });
};

const pauseCountDown = (clockName) => {
    clocks.value.forEach(clock => {
        if (clock.name === clockName) {
            clearInterval(clock.intervalId);
            clock.intervalId = null;
            clock.start = false;
        }
    });


};

const PomodoroTab = (clockName) => {
    clocks.value.forEach(clock => {
        if (clock.name === clockName) {
            pauseCountDown(clockName);
            clock.activeTab = 'Pomodoro';
            clock.time = clock.Pomodoro;
        }
    });
};

const shortBreakTab = (clockName) => {
    clocks.value.forEach(clock => {
        if (clock.name === clockName) {
            pauseCountDown(clockName);
            clock.activeTab = 'shortBreak';
            clock.time = clock.shortBreak;
        }
    });
};

const longBreakTab = (clockName) => {
    clocks.value.forEach(clock => {
        if (clock.name === clockName) {
            pauseCountDown(clockName);
            clock.activeTab = 'longBreak';
            clock.time = clock.longBreak;
        }
    });
};

const resetTimer = (clockName) => {
    clocks.value.forEach(clock => {
        if (clock.name === clockName) {
            pauseCountDown(clockName);
            if (clock.activeTab === 'Pomodoro') {
                time.value = clock.Pomodoro;
            } else if (clock.activeTab === 'shortBreak') {
                time.value = clock.shortBreak;
            } else if (clock.activeTab === 'longBreak') {
                time.value = clock.longBreak;
            }
        }
    });


    if (activeTime.value === 'Pomodoro') {
        time.value = pomodoro.value;
    } else if (activeTime.value === 'shortBreak') {
        time.value = shortBreak.value;
    } else if (activeTime.value === 'longBreak') {
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
    clocks.value.forEach(clock => {
        clearInterval(clock.intervalId)
    })
})


</script>
<template>
    <div class="page">

        <div class="autonext">
            <button @click="showAutoNextOption">Auto Next Option</button>
            <button @click="askTime">Add Another Clock</button>
        </div>
        <div class="timer-grid">
            <div class="timer" v-for="clock in clocks" :key="clock.name">
                <div class="selection">
                    <p>
                        {{ clock.name }}
                    </p>


                </div>
                <div class="time">
                    <ul>
                        <li :class="{ active: clock.activeTab === 'Pomodoro' }" @click="PomodoroTab(clock.name)">
                            Pomodoro
                        </li>
                        <li :class="{ active: clock.activeTab === 'shortBreak' }" @click="shortBreakTab(clock.name)">
                            shortBreak</li>
                        <li :class="{ active: clock.activeTab === 'longBreak' }" @click="longBreakTab(clock.name)">
                            longBreak</li>
                    </ul>
                </div>
                <div class="time-value">
                    {{ formattedTime(clock.time) }}     
                </div>
                <div class="options">
                    <div class="reset" @click="resetTimer(clock.name)">
                        <Icon icon="tabler:reload" width="24" height="24" />
                    </div>
                    <div class="start" @click="toggleStart(clock.name)">
                        <p v-if="!clock.start">Start</p>
                        <p v-else>Pause</p>
                    </div>
                    <div class="next" @click="next(clock.name)">
                        <Icon icon="tabler:player-track-next-filled" width="24" height="24" />

                    </div>
                </div>
            </div>
        </div>
    </div>
    <div v-if="showForm" class="modal-overlay">
        <div class="modal">
            <form @submit.prevent="saveCustomTime">
                <input type="text" v-model="CustomTime.name" placeholder="Enter Clock Name" />
                <input type="number" class="no-spinner" v-model="CustomTime.Pomodoro"
                    placeholder="Enter Pomodoro(minute)" />
                <input type="number" class="no-spinner" v-model="CustomTime.shortBreak"
                    placeholder="Enter shortBreak(minute)" />
                <input type="number" class="no-spinner" v-model="CustomTime.longBreak"
                    placeholder="Enter longBreak(minute)" />
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
    margin-top: 80px;
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
    gap: 5px;
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
    padding: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
}

/* TIME TABS */
.time ul {
    display: flex;
    list-style: none;
    gap: 10px;
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
    margin: 20px 0;
    color: #3e2b2b;
}

/* OPTIONS */
.options {
    display: flex;
    align-items: center;
    gap: 10px;
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
    background: rgba(0, 0, 0, 0.5);
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