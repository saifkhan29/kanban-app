<template>
  <div id="app">
    <div class="navbar">
      <div class="nav-left">
        <h1>Kanban Board</h1>
        <div class="board-selector" v-if="boards.length > 0">
          <div 
            class="custom-select" 
            :class="{ 'active': isDropdownOpen }"
            @click="toggleDropdown"
            ref="dropdown"
          >
            <div class="selected-option">
              <span>{{ currentBoard?.title || 'Select Board' }}</span>
              <svg 
                class="chevron-icon"
                :class="{ 'rotate': isDropdownOpen }"
                width="12" 
                height="8" 
                viewBox="0 0 12 8" 
                fill="none"
              >
                <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
            <div class="options-list" v-show="isDropdownOpen">
              <div 
                v-for="board in boards" 
                :key="board.id"
                class="option"
                :class="{ 'selected': board.id === currentBoardId }"
                @click="selectBoard(board.id)"
              >
                {{ board.title }}
              </div>
            </div>
          </div>
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
            <div class="title-wrapper">
              <h2>{{ column.title }}</h2>
              <button 
                class="edit-column-btn" 
                @click.stop="openEditColumnForm(column)"
                title="Edit Column Name"
              >
                <span>✎</span>
              </button>
            </div>
            <span class="task-count">{{ column.tasks.length }}</span>
          </div>
          <button class="add-task-icon" @click="openTaskForm(column)" title="Add Task">
            <span>+</span>
          </button>
        </div>
        
        <div class="tasks-container">
          <div
            v-for="(task, index) in column.tasks"
            :key="task.id"
            class="task-card"
            draggable="true"
            @dragstart="handleDragStart($event, { taskId: task.id, columnId: column.id, index })"
            @dragover.prevent
            @drop.stop="handleTaskDrop($event, column.id, index)"
            @click="openEditTaskForm(task, column)"
          >
            <h3>{{ task.title }}</h3>
            <p>{{ task.description }}</p>
            
            <div v-if="task.images && task.images.length > 0" class="task-images">
              <div v-for="(image, index) in task.images" 
                   :key="index" 
                   class="task-image">
                <img :src="image.url" :alt="image.name">
              </div>
            </div>
            
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
      :column="editingColumn"
      :is-edit="!!editingColumn"
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

    <!-- Add this temporarily to debug -->
    <div style="display: none">
      Debug: 
      Current Board ID: {{ currentBoardId }}
      Columns: {{ currentBoard?.columns?.length }}
      Selected Column: {{ selectedColumn?.id }}
    </div>
  </div>
</template>

<script>
import { computed, ref, onMounted } from 'vue'
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
    const isDropdownOpen = ref(false)
    const dropdown = ref(null)

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
    const editingColumn = computed(() => store.state.editingColumn)

    const handleTaskSubmit = (taskData) => {
      console.log('handleTaskSubmit called with:', taskData)
      console.log('Current selectedColumn:', selectedColumn.value)

      if (!selectedColumn.value) {
        console.error('No selected column')
        return
      }

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
      
      if (editingColumn.value) {
        store.dispatch('updateColumn', {
          columnId: editingColumn.value.id,
          title: columnData.title
        })
      } else {
        store.dispatch('addColumn', columnData)
      }
      store.dispatch('closeColumnForm')
    }

    const handleDragStart = (event, { taskId, columnId, index }) => {
      draggedTask.value = { taskId, columnId, index }
      event.dataTransfer.effectAllowed = 'move'
    }

    const handleDrop = (event, toColumnId) => {
      if (!draggedTask.value) return
      
      store.dispatch('moveTask', {
        fromColumnId: draggedTask.value.columnId,
        toColumnId,
        taskId: draggedTask.value.taskId,
        toIndex: -1 // Append to end of column
      })
      
      draggedTask.value = null
    }

    const handleTaskDrop = (event, toColumnId, toIndex) => {
      event.stopPropagation()
      if (!draggedTask.value) return

      store.dispatch('moveTask', {
        fromColumnId: draggedTask.value.columnId,
        toColumnId,
        taskId: draggedTask.value.taskId,
        fromIndex: draggedTask.value.index,
        toIndex
      })
      
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

    const openEditColumnForm = (column) => {
      if (!column) return
      store.dispatch('openEditColumnForm', column)
    }

    const toggleDropdown = () => {
      isDropdownOpen.value = !isDropdownOpen.value
    }

    const selectBoard = (boardId) => {
      store.dispatch('setCurrentBoard', boardId)
      isDropdownOpen.value = false
    }

    // Add click outside handler to close dropdown
    onMounted(() => {
      document.addEventListener('click', (e) => {
        if (dropdown.value && !dropdown.value.contains(e.target)) {
          isDropdownOpen.value = false
        }
      })
    })

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
      editingColumn,
      handleTaskSubmit,
      handleBoardSubmit,
      handleColumnSubmit,
      handleDragStart,
      handleDrop,
      handleTaskDrop,
      openTaskForm,
      openEditTaskForm,
      openBoardForm: () => store.dispatch('openBoardForm'),
      openColumnForm: () => store.dispatch('openColumnForm'),
      closeTaskForm: () => store.dispatch('closeTaskForm'),
      closeBoardForm: () => store.dispatch('closeBoardForm'),
      closeColumnForm: () => store.dispatch('closeColumnForm'),
      openEditBoardForm,
      openEditColumnForm,
      isDropdownOpen,
      dropdown,
      toggleDropdown,
      selectBoard
    }
  }
}
</script>

<style>
/* Update these styles */

/* Add this to ensure proper box-sizing */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* Add this to ensure html and body take full height */
html, body {
  height: 100%;
  margin: 0;
  padding: 0;
}

#app {
  font-family: 'Inter', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f6fa;
  overflow: hidden; /* Prevent double scrollbars */
}

.navbar {
  background-color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  flex-shrink: 0;
  z-index: 10;
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

.custom-select {
  position: relative;
  min-width: 200px;
  cursor: pointer;
  user-select: none;
}

.selected-option {
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.95rem;
  color: #2d3748;
  transition: all 0.2s;
}

.custom-select:hover .selected-option {
  border-color: #5e6ad2;
}

.custom-select.active .selected-option {
  border-color: #5e6ad2;
  box-shadow: 0 0 0 3px rgba(94, 106, 210, 0.1);
}

.chevron-icon {
  transition: transform 0.2s;
}

.chevron-icon.rotate {
  transform: rotate(180deg);
}

.options-list {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08);
  max-height: 250px;
  overflow-y: auto;
  z-index: 100;
  animation: slideDown 0.2s ease-out;
}

.option {
  padding: 0.75rem 1rem;
  transition: all 0.2s;
}

.option:hover {
  background-color: #f7fafc;
  color: #5e6ad2;
}

.option.selected {
  background-color: #f1f5f9;
  color: #5e6ad2;
  font-weight: 500;
}

@keyframes slideDown {
  from {
    transform: translateY(-10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Custom scrollbar for the options list */
.options-list::-webkit-scrollbar {
  width: 4px;
}

.options-list::-webkit-scrollbar-track {
  background: transparent;
}

.options-list::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
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
  overflow-y: hidden; /* Prevent vertical scroll on container */
  flex: 1;
  height: calc(100% - 2rem); /* Account for padding */
}

.column {
  background-color: #f1f2f7;
  border-radius: 10px;
  min-width: 300px;
  width: 300px; /* Fixed width for columns */
  padding: 1rem;
  display: flex;
  flex-direction: column;
  max-height: 100%;
}

.column-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.column-title {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.title-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  flex: 1; /* Take up available space */
}

.title-wrapper h2 {
  margin: 0;
  line-height: 1.4;
  font-size: 1rem;
  word-break: break-word;
  flex: 1; /* Take up available space */
}

.task-count {
  background-color: #e2e4ea;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.9rem;
  white-space: nowrap; /* Prevent wrapping */
  align-self: flex-start; /* Align with first line */
}

.tasks-container {
  flex: 1;
  overflow-y: auto;
  margin-right: -0.5rem; /* Offset the padding for scrollbar */
  padding-right: 0.5rem;
  margin-bottom: 0.5rem; /* Add some space at the bottom */
}

.tasks-container::-webkit-scrollbar {
  width: 4px;
}

.tasks-container::-webkit-scrollbar-track {
  background: transparent;
}

.tasks-container::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
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
  align-self: flex-start;
  margin-top: 0.25rem;
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
  width: 300px; /* Match other columns width */
  min-width: 300px;
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

.edit-column-btn {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: none;
  background-color: transparent;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  line-height: 1;
  transition: all 0.2s;
  opacity: 0.8;
}

.title-wrapper:hover .edit-column-btn {
  opacity: 1;
  color: #475569;
}

.edit-column-btn:hover {
  background-color: rgba(94, 106, 210, 0.1);
  color: #5e6ad2;
}

/* Add these new styles */
.task-images {
  display: flex;
  gap: 0.5rem;
  margin: 0.5rem 0;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.task-image {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
}

.task-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
