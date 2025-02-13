<template>
  <div id="app">
    <div class="navbar">
      <h1>Kanban Board</h1>
    </div>
    
    <div class="board-container">
      <div 
        v-for="column in columns" 
        :key="column.id" 
        class="column"
        @dragover.prevent
        @drop="handleDrop($event, column.id)"
      >
        <div class="column-header">
          <h2>{{ column.title }}</h2>
          <span class="task-count">{{ column.tasks.length }}</span>
        </div>
        
        <div class="tasks-container">
          <div
            v-for="task in column.tasks"
            :key="task.id"
            class="task-card"
            draggable="true"
            @dragstart="handleDragStart($event, { taskId: task.id, columnId: column.id })"
            @click="openEditTaskForm(task, column)"
          >
            <h3>{{ task.title }}</h3>
            <p>{{ task.description }}</p>
            <div class="task-footer">
              <div class="priority" :class="task.priority">
                {{ task.priority }}
              </div>
              <div class="task-tags">
                <span v-for="(tag, tagIndex) in task.tags" 
                      :key="tagIndex" 
                      class="tag">
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <button @click="openTaskForm(column)" class="add-task-btn">
          + Add Task
        </button>
      </div>
    </div>

    <TaskForm 
      v-if="showTaskForm"
      :task="editingTask"
      :is-edit="!!editingTask"
      @submit="handleTaskSubmit"
      @close="closeTaskForm"
    />
  </div>
</template>

<script>
import { computed, ref } from 'vue'
import { useStore } from 'vuex'
import TaskForm from './components/TaskForm.vue'

export default {
  name: 'App',
  components: {
    TaskForm
  },
  setup() {
    const store = useStore()
    const draggedTask = ref(null)

    const columns = computed(() => store.state.columns)
    const showTaskForm = computed(() => store.state.showTaskForm)
    const editingTask = computed(() => store.state.editingTask)
    const selectedColumn = computed(() => store.state.selectedColumn)

    const handleTaskSubmit = (taskData) => {
      if (!selectedColumn.value) return

      if (editingTask.value) {
        store.dispatch('updateTask', {
          columnId: selectedColumn.value.id,
          taskId: editingTask.value.id,
          updatedTask: taskData
        })
      } else {
        store.dispatch('addTask', {
          columnId: selectedColumn.value.id,
          task: taskData
        })
      }
      store.dispatch('closeTaskForm')
    }

    const handleDragStart = (event, { taskId, columnId }) => {
      draggedTask.value = { taskId, columnId }
      event.dataTransfer.effectAllowed = 'move'
    }

    const handleDrop = (event, toColumnId) => {
      if (draggedTask.value && draggedTask.value.columnId !== toColumnId) {
        store.dispatch('moveTask', {
          fromColumnId: draggedTask.value.columnId,
          toColumnId,
          taskId: draggedTask.value.taskId
        })
      }
      draggedTask.value = null
    }

    const openTaskForm = (column) => {
      if (!column) return
      store.dispatch('openTaskForm', column)
    }

    const openEditTaskForm = (task, column) => {
      if (!task || !column) return
      store.dispatch('openEditTaskForm', { task, column })
    }

    return {
      columns,
      showTaskForm,
      editingTask,
      selectedColumn,
      handleTaskSubmit,
      handleDragStart,
      handleDrop,
      openTaskForm,
      openEditTaskForm,
      closeTaskForm: () => store.dispatch('closeTaskForm')
    }
  }
}
</script>

<style>
#app {
  font-family: 'Inter', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  height: 100vh;
  background-color: #f5f6fa;
}

.navbar {
  background-color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.add-board-btn {
  background-color: #5e6ad2;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
}

.board-container {
  display: flex;
  gap: 2rem;
  padding: 2rem;
  overflow-x: auto;
  height: calc(100vh - 80px);
}

.column {
  background-color: #f1f2f7;
  border-radius: 10px;
  min-width: 300px;
  padding: 1rem;
}

.column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.task-count {
  background-color: #e2e4ea;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.9rem;
}

.tasks-container {
  min-height: 100px;
}

.task-card {
  background-color: white;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  cursor: pointer;
  transition: transform 0.2s;
}

.task-card:hover {
  transform: translateY(-2px);
}

.task-card h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
}

.task-card p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.task-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
}

.priority {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.priority.high {
  background-color: #ffe2e2;
  color: #ff4d4d;
}

.priority.medium {
  background-color: #fff4e2;
  color: #ffa64d;
}

.priority.low {
  background-color: #e2ffe2;
  color: #4caf50;
}

.task-tags {
  display: flex;
  gap: 0.5rem;
}

.tag {
  background-color: #e2e4ea;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
}

.add-task-btn {
  width: 100%;
  padding: 0.75rem;
  background-color: white;
  border: 2px dashed #e2e4ea;
  border-radius: 6px;
  color: #666;
  cursor: pointer;
  margin-top: 1rem;
  transition: all 0.2s;
}

.add-task-btn:hover {
  background-color: #f8f9fc;
  border-color: #5e6ad2;
  color: #5e6ad2;
}
</style>
