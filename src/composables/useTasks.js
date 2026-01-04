import { ref } from 'vue';

const tasks = ref(JSON.parse(localStorage.getItem('tasks')) || []);

const saveTasks = () => {
    localStorage.setItem('tasks', JSON.stringify(tasks.value));
    window.dispatchEvent(new Event('tasks-updated'));
};

const decrementPomodoro = (index) => {
    if (tasks.value[index].pomodoroCount > 0) {
        if(tasks.value[index].completed) return;
        tasks.value[index].pomodoroCount -= 1;
        saveTasks();
    }
};

export function useTasks() {
    return {
        tasks,
        saveTasks,
        decrementPomodoro
    };
}
