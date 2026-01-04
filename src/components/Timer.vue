<script setup>
import { Icon } from "@iconify/vue";
import { ref, onUnmounted } from "vue";
import alarm from "@/assests/alarm.mp3";
import { useTasks } from "@/composables/useTasks";

const { tasks, decrementPomodoro } = useTasks();

const alarmSound = new Audio(alarm);
alarmSound.preload = "auto";

const showForm = ref(false);
const optionAutoNext = ref(false);
const autoNextEnabled = ref(false); // true/false instead of string

// Each clock has its own independent state
const clocks = ref([
    {
        name: "Default",
        Pomodoro: 25 * 60,
        shortBreak: 5 * 60,
        longBreak: 15 * 60,
        activeTab: "Pomodoro",
        currentTime: 25 * 60, // current countdown time
        start: false,
        intervalId: null,
        pomodoroCount: 0, // tracks completed pomodoros for long break logic
    },
]);

const CustomTime = ref({
    name: "",
    Pomodoro: "",
    shortBreak: "",
    longBreak: "",
});

const formattedTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
        .toString()
        .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${minutes}:${secs}`;
};

const askTime = () => {
    showForm.value = true;
};

const saveCustomTime = () => {
    if (
        !CustomTime.value.name ||
        !CustomTime.value.Pomodoro ||
        !CustomTime.value.shortBreak ||
        !CustomTime.value.longBreak
    ) {
        alert("Please fill all fields");
        return;
    }

    const newClock = {
        name: CustomTime.value.name,
        Pomodoro: CustomTime.value.Pomodoro * 60,
        shortBreak: CustomTime.value.shortBreak * 60,
        longBreak: CustomTime.value.longBreak * 60,
        activeTab: "Pomodoro",
        currentTime: CustomTime.value.Pomodoro * 60,
        start: false,
        intervalId: null,
        pomodoroCount: 0,
    };

    clocks.value.push(newClock);
    showForm.value = false;

    // Reset form
    CustomTime.value = {
        name: "",
        Pomodoro: "",
        shortBreak: "",
        longBreak: "",
    };
};

// yesle for the specific clock sets the selected tab like when we click on tabs
const setTab = (clock, tab) => {
    if (clock.start) {
        clearInterval(clock.intervalId);
        clock.intervalId = null;
        clock.start = false;
    }
    clock.activeTab = tab;
    clock.currentTime = clock[tab];
};

// this starts the countdown for the specific clock
const startCountdown = (clock) => {
    if (clock.intervalId) return; // already running

    clock.start = true;
    clock.intervalId = setInterval(() => {
        if (clock.currentTime > 0) {
            clock.currentTime -= 1;
        } else {
            // Timer finished
            alarmSound.play();
            clearInterval(clock.intervalId);
            clock.intervalId = null;
            clock.start = false;

            setTimeout(() => {
                alarmSound.pause();
                alarmSound.currentTime = 0;
            }, 5000);

            nextPhase(clock);
        }
    }, 1000);
};

// this just toggles the start state of the clock,
// ani also clears hamro interval id
const toggleStart = (clock) => {
    if (clock.start) {
        clearInterval(clock.intervalId);
        clock.intervalId = null;
        clock.start = false;
    } else {
        startCountdown(clock);
    }
};

// resets the timer and clears the interval id
// sets the current time to the active tab's duration
const resetTimer = (clock) => {
    clearInterval(clock.intervalId);
    clock.intervalId = null;
    clock.start = false;
    clock.currentTime = clock[clock.activeTab];
};

// this  checks for the pomodoro count and then changes the tabs and or finishes the pomodoro timer
const nextPhase = (clock) => {
    if (clock.activeTab === "Pomodoro") {
        clock.pomodoroCount += 1;

        // Update task if exists
        if (tasks.value.length > 0) {
            decrementPomodoro(0);
        }

        // Every 4 pomodoros → long break, else short break
        if (clock.pomodoroCount % 4 === 0) {
            setTab(clock, "longBreak");
        } else {
            setTab(clock, "shortBreak");
        }
    } else {
        // From break → back to Pomodoro
        setTab(clock, "Pomodoro");
    }

    // Auto-start next phase if enabled
    if (autoNextEnabled.value) {
        startCountdown(clock);
    }
};

const showAutoNextOption = () => {
    optionAutoNext.value = true;
};


// Cleanup all intervals on component unmount
onUnmounted(() => {
    clocks.value.forEach((clock) => {
        if (clock.intervalId) clearInterval(clock.intervalId);
    });
});
</script>

<template>
    <div class="page">
        <div class="autonext">
            <button @click="showAutoNextOption">Auto Next Option</button>
            <button @click="askTime">Add Another Clock</button>
        </div>

        <div class="timer-grid">
            <div v-for="clock in clocks" :key="clock.name" class="timer">
                <div class="selection">
                    <p>{{ clock.name }}</p>
                </div>

                <div class="time">
                    <ul>
                        <li
                            :class="{ active: clock.activeTab === 'Pomodoro' }"
                            @click="setTab(clock, 'Pomodoro')"
                        >
                            Pomodoro
                        </li>
                        <li
                            :class="{
                                active: clock.activeTab === 'shortBreak',
                            }"
                            @click="setTab(clock, 'shortBreak')"
                        >
                            Short Break
                        </li>
                        <li
                            :class="{ active: clock.activeTab === 'longBreak' }"
                            @click="setTab(clock, 'longBreak')"
                        >
                            Long Break
                        </li>
                    </ul>
                </div>

                <div class="time-value">
                    {{ formattedTime(clock.currentTime) }}
                </div>

                <div class="options">
                    <div class="reset" @click="resetTimer(clock)">
                        <Icon icon="tabler:reload" width="24" height="24" />
                    </div>
                    <div class="start" @click="toggleStart(clock)">
                        <p>{{ clock.start ? "Pause" : "Start" }}</p>
                    </div>
                    <div class="next" @click="nextPhase(clock)">
                        <Icon
                            icon="tabler:player-track-next-filled"
                            width="24"
                            height="24"
                        />
                    </div>
                </div>
            </div>
        </div>

        <!-- Add Custom Clock Modal -->
        <div v-if="showForm" class="modal-overlay" @click="showForm = false">
            <div class="modal" @click.stop>
                <form @submit.prevent="saveCustomTime">
                    <input
                        type="text"
                        v-model="CustomTime.name"
                        placeholder="Enter Clock Name"
                        required
                    />
                    <input
                        type="number"
                        class="no-spinner"
                        v-model.number="CustomTime.Pomodoro"
                        placeholder="Pomodoro (minutes)"
                        min="1"
                        required
                    />
                    <input
                        type="number"
                        class="no-spinner"
                        v-model.number="CustomTime.shortBreak"
                        placeholder="Short Break (minutes)"
                        min="1"
                        required
                    />
                    <input
                        type="number"
                        class="no-spinner"
                        v-model.number="CustomTime.longBreak"
                        placeholder="Long Break (minutes)"
                        min="1"
                        required
                    />
                    <button type="submit">Save</button>
                </form>
            </div>
        </div>

        <!-- Auto Next Option Modal -->
        <div
            v-if="optionAutoNext"
            class="modal-overlay"
            @click="optionAutoNext = false"
        >
            <div class="modal" @click.stop>
                <form>
                    <select v-model="autoNextEnabled">
                        <option :value="true">Enable Auto Next</option>
                        <option :value="false">Disable Auto Next</option>
                    </select>
                    <div class="buttons">
                        <button
                            class="auto-cancel"
                            @click="optionAutoNext = false"
                        >
                            Close
                        </button>
                    </div>
                </form>
            </div>
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
    font-family: "Roboto Condensed", sans-serif;
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
