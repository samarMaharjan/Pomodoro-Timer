<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Icon } from "@iconify/vue";
const pomodoroCount = ref(1);
const showModal = ref(false);
const showDelete = ref(false);
const completed = ref(false);
const title = ref('');
const note = ref('');
const tasks = ref(JSON.parse(localStorage.getItem('tasks')) || []);
const deleteTitle = ref('');

const addTask = () => {
    if (title.value.trim() === '') {
        alert('Title cannot be empty');
        return;
    }
    const newTask = {
        id: Date.now(),
        title: title.value,
        pomodoroCount: pomodoroCount.value,
        note: note.value,
        completed: false
    };
    tasks.value.push(newTask);
    localStorage.setItem('tasks', JSON.stringify(tasks.value));
    title.value = '';
    pomodoroCount.value = 1;
    note.value = '';
    alert('Task Added Successfully');
    closeModal();
}


const openModal = () => {
    showModal.value = true;
};
const closeModal = () => {
    showModal.value = false;
};

const askDelete = (title) => {
    showDelete.value = true;
    deleteTitle.value = title;
};

const confirmDelete = () => {
    const deletedTask = tasks.value.filter(u => u.title !== deleteTitle.value);
    tasks.value = deletedTask;
    localStorage.setItem('tasks', JSON.stringify(deletedTask));
    showDelete.value = false;
};

const cancelDelete = () => {
    showDelete.value = false;
};

const addCount = () => {
    pomodoroCount.value += 1;
};

const subtractCount = () => {
    if (pomodoroCount.value > 1) {
        pomodoroCount.value -= 1;
    }
};

const updateCompleted = (index) => {
    const task = tasks.value.find(t => t.id === index);
    console.log(task);

    // toggle completed
    task.completed = !task.completed;

    // if just completed → move to end
    if (task.completed) {
        const index = tasks.value.findIndex(t => t.id === task.id);
        tasks.value.splice(index, 1); 
        tasks.value.push(task);       
    }

    localStorage.setItem('tasks', JSON.stringify(tasks.value));
    console.log(localStorage.getItem('tasks'));
    reloadTasks();
};

const reloadTasks = () => {
    tasks.value = JSON.parse(localStorage.getItem('tasks')) || [];
};

const noPomodoro = () => {
    alert("No Pomodoro Left");
};

onMounted(() => {
    window.addEventListener('tasks-updated', reloadTasks);
});

onUnmounted(() => {
    window.removeEventListener('tasks-updated', reloadTasks);
});

</script>
<template>
    <div class="task-section">
        <div class="header">
            <h2>Task List</h2>
        </div>
        <div class="todo-tasks" v-for="(task, index) in tasks" :key="task.id">
            <label class="checkbox-wrapper">
                <input type="checkbox" @change="updateCompleted(task.id)" :checked="task.completed" />
                <span class="checkmark"></span>
            </label>
            <div class="type">
                <div class="title">

                    <div class="task-title">
                        <h3>{{ task.title }}</h3>

                    </div>
                    <div class="pomodoro">
                        <p v-if="task.pomodoroCount == 0">No Pomodoro Left</p>
                        <p v-else>Pomodoro-Left <span>{{ task.pomodoroCount }}</span></p>
                    </div>
                </div>
                <div class="detail">
                    <p>{{ task.note }}</p>
                    <Icon @click="askDelete(task.title)" class="delete" icon="material-symbols:delete-rounded"
                        width="24" height="24" />
                </div>
            </div>
        </div>
        <div class="add-note" @click="openModal">
            <p>+ Add New Task</p>
        </div>

    </div>
    <div class="form">
        <div v-if="showModal" class="modal-overlay">
            <div class="modal">
                <h2>Add New Task</h2>
                <form @submit.prevent="addTask">
                    <input v-model="title" type="text" id="task-title" name="task-title" placeholder="Title" />

                    <div class="count-note">
                        <div class="pomodoro-edit">
                            <input v-model="pomodoroCount" class="pomodoro-input" type="text" id="pomodoro-count"
                                name="pomodoro-count" min="1" />
                            <div class="pomodoro-count">
                                <button @click.prevent="addCount">+</button>
                                <button class="subtract" @click.prevent="subtractCount">-</button>
                            </div>
                        </div>
                        <div class="note">
                            <input v-model="note" class="note-input" type="text" placeholder="Enter note">
                        </div>
                    </div>

                    <button type="submit">Add Task</button>
                </form>
            </div>
        </div>

        <div v-if="showDelete" class="modal-overlay">
            <div class="modal">
                <h2>Confirm Delete</h2>
                <p>Are you sure you want to delete this task?</p>
                <button class="delete-task" @click="confirmDelete">Yes, Delete</button>
                <button class="cancel" @click="cancelDelete">Cancel</button>
            </div>
        </div>
    </div>
</template>
<style scoped>
.task-section {
    margin: 10px;
    border: 2px solid #8e4343;
    display: flex;
    flex-direction: column;
    height: 90vh;
    width: 40%;
    background-color: #f4e1e1;
    border-radius: 15px;
    align-items: center;
}

.header {
    margin-top: 20px;
    border-bottom: 1px solid #8e4343;
    text-align: center;
    width: 90%;
    border-radius: 5px;
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
}

.todo-tasks {
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 80px;
    width: 90%;
    margin-top: 20px;
    padding: 10px;
    border-bottom: 1px solid #d28e8e;
}

.checkbox-wrapper {
    display: inline-flex;
    align-items: center;
    cursor: pointer;
    margin-right: 20px;
}

.checkbox-wrapper input {
    display: none;
}

.checkmark {
    width: 26px;
    height: 26px;
    border: 3px solid #8e4343;
    border-radius: 50%;
    position: relative;
}

/* checked state */
.checkbox-wrapper input:checked+.checkmark {
    background-color: #8e4343;
}

/* inner dot */
.checkbox-wrapper input:checked+.checkmark::after {
    content: '';
    width: 10px;
    height: 10px;
    background: white;
    border-radius: 50%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

.type {
    display: flex;
    flex-direction: column;
    width: 80%;
}

.title {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.task-title h3 {
    margin: 0;
    font-family: 'Roboto Condensed', sans-serif;
    font-size: 30px;
    color: #3e2b2b;
}

.pomodoro p {
    margin: 0;
    font-family: 'Roboto Condensed', sans-serif;
    font-size: 15px;
    color: #3e2b2b;
}

.pomodoro span {
    border: 1px solid #8e4343;
    padding: 2px 6px;
    font-weight: bold;
}

.detail {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 5px;
}

.detail .delete:hover {
    cursor: pointer;
    color: #d28e8e;

}

.detail p {
    font-family: 'Roboto Condensed', sans-serif;
    font-size: 18px;
    color: #3e2b2b;
    margin-top: 5px;
}

.add-note {
    margin-top: auto;
    margin-bottom: 20px;
    cursor: pointer;
}

.add-note:hover {
    text-decoration: underline;
    color: #d28e8e;
    background-color: #f4e1e1;
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal {
    background: white;
    padding: 20px;
    border-radius: 10px;
    width: 400px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    z-index: 1001;
}

.modal h2 {
    margin-top: 0;
    font-family: 'Roboto Condensed', sans-serif;
}

.modal form {
    display: flex;
    flex-direction: column;
}

.modal label {
    margin-top: 10px;
    font-family: 'Roboto Condensed', sans-serif;
}

.modal input {
    height: 30px;
    margin-top: 5px;
    padding: 8px;
    font-size: 20px;
    font-family: 'Roboto Condensed', sans-serif;
    border: 1px solid #ccc;
    border-radius: 5px;
}

.modal button {
    margin-top: 15px;
    padding: 10px;
    background-color: #8e4343;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}

.modal button:hover {
    background-color: #b76b6b;
}

.pomodoro-input {
    width: 30px;
    text-align: center;
}

.pomodoro-edit {
    display: flex;
    align-items: center;
}

.pomodoro-count button {
    margin-top: 3px;
    display: flex;
    flex-direction: column;
    margin-left: 2px;
    padding: 3px 6px;
    background-color: #cb9494;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}

.pomodoro-count .subtract {
    margin-top: 5px;
    padding: 3px 8px;
}

.count-note {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
}

.note-input {
    width: 300px;
}

.modal .delete-task {
    background-color: #e74c3c;
}

.modal .cancel {
    background-color: #95a5a6;
    margin-left: 5px;
}

.modal .cancel:hover {
    background-color: #464444;
}
</style>