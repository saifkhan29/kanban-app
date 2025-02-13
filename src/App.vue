<template>
  <div id="app">
    <div class="navbar">
      <div class="nav-left">
        <h1>Kanban Board</h1>
        <div class="board-selector" v-if="boards.length > 0">
          <select 
            v-model="currentBoardId" 
            class="board-select"
          >
            <option v-for="board in boards" :key="board.id" :value="board.id">
              {{ board.title }}
            </option>
          </select>
          <button 
            class="edit-board-btn" 
            @click="openEditBoardForm(currentBoard)"
            title="Edit Board Name"
          >
            <span>✎</span>
          </button>
        </div>
      </div>
      <div class="nav-actions">
        <button @click="openBoardForm" class="action-btn primary">
          + New Board
        </button>
      </div>
    </div>
    
    <div class="board-container">
      <div 
        v-for="column in currentBoard?.columns" 
        :key="column.id" 
        class="column"
        @dragover.prevent
        @drop="handleDrop($event, column.id)"
      >
        <div class="column-header">
          <div class="column-title">
            <h2>{{ column.title }}</h2>
            <span class="task-count">{{ column.tasks.length }}</span>
          </div>
          <button class="add-task-icon" @click="openTaskForm(column)" title="Add Task">
            <span>+</span>
          </button>
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
      </div>

      <!-- New Add Column Button -->
      <div class="column add-column" @click="openColumnForm">
        <div class="add-column-content">
          <span class="plus-icon">+</span>
          <span>Add Column</span>
        </div>
      </div>
    </div>

    <BoardForm 
      v-if="showBoardForm"
      :board="editingBoard"
      :is-edit="!!editingBoard"
      @submit="handleBoardSubmit"
      @close="closeBoardForm"
    />

    <ColumnForm 
      v-if="showColumnForm"
      @submit="handleColumnSubmit"
      @close="closeColumnForm"
    />

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
import BoardForm from './components/BoardForm.vue'
import ColumnForm from './components/ColumnForm.vue'

export default {
  name: 'App',
  components: {
    TaskForm,
    BoardForm,
    ColumnForm
  },
  setup() {
    const store = useStore()
    const draggedTask = ref(null)

    const boards = computed(() => store.state.boards)
    const currentBoard = computed(() => store.getters.currentBoard)
    const currentBoardId = computed({
      get: () => store.state.currentBoardId,
      set: (value) => {
        if (value) {
          store.dispatch('setCurrentBoard', value)
        }
      }
    })
    const showTaskForm = computed(() => store.state.showTaskForm)
    const showBoardForm = computed(() => store.state.showBoardForm)
    const showColumnForm = computed(() => store.state.showColumnForm)
    const editingTask = computed(() => store.state.editingTask)
    const selectedColumn = computed(() => store.state.selectedColumn)
    const editingBoard = computed(() => store.state.editingBoard)

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

    const handleBoardSubmit = (boardData) => {
      if (editingBoard.value) {
        store.dispatch('updateBoard', {
          boardId: editingBoard.value.id,
          title: boardData.title
        })
      } else {
        store.dispatch('addBoard', boardData)
      }
      store.dispatch('closeBoardForm')
    }

    const handleColumnSubmit = (columnData) => {
      if (!columnData || !columnData.title || !columnData.title.trim()) return
      store.dispatch('addColumn', columnData)
      store.dispatch('closeColumnForm')
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

    const openEditBoardForm = (board) => {
      if (!board) return
      store.dispatch('openEditBoardForm', board)
    }

    return {
      boards,
      currentBoard,
      currentBoardId,
      showTaskForm,
      showBoardForm,
      showColumnForm,
      editingTask,
      selectedColumn,
      editingBoard,
      handleTaskSubmit,
      handleBoardSubmit,
      handleColumnSubmit,
      handleDragStart,
      handleDrop,
      openTaskForm,
      openEditTaskForm,
      openBoardForm: () => store.dispatch('openBoardForm'),
      openColumnForm: () => store.dispatch('openColumnForm'),
      closeTaskForm: () => store.dispatch('closeTaskForm'),
      closeBoardForm: () => store.dispatch('closeBoardForm'),
      closeColumnForm: () => store.dispatch('closeColumnForm'),
      openEditBoardForm
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

.nav-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-actions {
  display: flex;
  gap: 1rem;
}

.board-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.board-select {
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid #e2e4ea;
  font-size: 1rem;
  min-width: 200px;
}

.action-btn {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: 1px solid #e2e4ea;
  background-color: white;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.action-btn:hover {
  background-color: #f8f9fc;
  border-color: #5e6ad2;
  color: #5e6ad2;
}

.action-btn.primary {
  background-color: #5e6ad2;
  color: white;
  border: none;
}

.action-btn.primary:hover {
  background-color: #4f58b8;
  color: white;
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
  min-height: 200px;
  display: flex;
  flex-direction: column;
}

.column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.column-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.task-count {
  background-color: #e2e4ea;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.9rem;
}

.tasks-container {
  flex: 1;
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

.add-task-icon {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: none;
  background-color: transparent;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  line-height: 1;
  transition: all 0.2s;
}

.add-task-icon:hover {
  background-color: rgba(94, 106, 210, 0.1);
  color: #5e6ad2;
}

.add-column {
  background-color: rgba(241, 242, 247, 0.6);
  border: 2px dashed #e2e4ea;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.add-column:hover {
  background-color: rgba(241, 242, 247, 0.9);
  border-color: #5e6ad2;
}

.add-column-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: #666;
}

.add-column:hover .add-column-content {
  color: #5e6ad2;
}

.plus-icon {
  font-size: 2rem;
  font-weight: 300;
  line-height: 1;
}

.edit-board-btn {
  background: transparent;
  border: none;
  color: #666;
  cursor: pointer;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.edit-board-btn:hover {
  background-color: rgba(94, 106, 210, 0.1);
  color: #5e6ad2;
}
</style>
