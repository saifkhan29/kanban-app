import { createStore } from 'vuex'

export default createStore({
  state() {
    return {
      columns: [
        {
          id: 1,
          title: 'To Do',
          tasks: []
        },
        {
          id: 2,
          title: 'In Progress',
          tasks: []
        },
        {
          id: 3,
          title: 'Done',
          tasks: []
        }
      ],
      showTaskForm: false,
      editingTask: null,
      selectedColumn: null
    }
  },

  mutations: {
    ADD_TASK(state, { columnId, task }) {
      const column = state.columns.find(col => col.id === columnId)
      if (column) {
        task.id = Date.now() // Simple way to generate unique ID
        column.tasks.push(task)
      }
    },

    UPDATE_TASK(state, { columnId, taskId, updatedTask }) {
      const column = state.columns.find(col => col.id === columnId)
      if (column) {
        const taskIndex = column.tasks.findIndex(task => task.id === taskId)
        if (taskIndex !== -1) {
          column.tasks.splice(taskIndex, 1, { ...updatedTask, id: taskId })
        }
      }
    },

    DELETE_TASK(state, { columnId, taskId }) {
      const column = state.columns.find(col => col.id === columnId)
      if (column) {
        column.tasks = column.tasks.filter(task => task.id !== taskId)
      }
    },

    MOVE_TASK(state, { fromColumnId, toColumnId, taskId }) {
      const fromColumn = state.columns.find(col => col.id === fromColumnId)
      const toColumn = state.columns.find(col => col.id === toColumnId)
      
      if (fromColumn && toColumn) {
        const taskIndex = fromColumn.tasks.findIndex(task => task.id === taskId)
        if (taskIndex !== -1) {
          const task = fromColumn.tasks[taskIndex]
          fromColumn.tasks.splice(taskIndex, 1)
          toColumn.tasks.push(task)
        }
      }
    },

    SET_SHOW_TASK_FORM(state, value) {
      state.showTaskForm = value
    },

    SET_EDITING_TASK(state, task) {
      state.editingTask = task
    },

    SET_SELECTED_COLUMN(state, column) {
      state.selectedColumn = column
    }
  },

  actions: {
    addTask({ commit }, { columnId, task }) {
      if (!columnId || !task) return
      commit('ADD_TASK', { columnId, task })
    },

    updateTask({ commit }, { columnId, taskId, updatedTask }) {
      if (!columnId || !taskId || !updatedTask) return
      commit('UPDATE_TASK', { columnId, taskId, updatedTask })
    },

    deleteTask({ commit }, { columnId, taskId }) {
      if (!columnId || !taskId) return
      commit('DELETE_TASK', { columnId, taskId })
    },

    moveTask({ commit }, { fromColumnId, toColumnId, taskId }) {
      if (!fromColumnId || !toColumnId || !taskId) return
      commit('MOVE_TASK', { fromColumnId, toColumnId, taskId })
    },

    openTaskForm({ commit }, column) {
      if (!column) return
      commit('SET_SELECTED_COLUMN', column)
      commit('SET_EDITING_TASK', null)
      commit('SET_SHOW_TASK_FORM', true)
    },

    openEditTaskForm({ commit }, { task, column }) {
      if (!task || !column) return
      commit('SET_SELECTED_COLUMN', column)
      commit('SET_EDITING_TASK', task)
      commit('SET_SHOW_TASK_FORM', true)
    },

    closeTaskForm({ commit }) {
      commit('SET_SHOW_TASK_FORM', false)
      commit('SET_EDITING_TASK', null)
      commit('SET_SELECTED_COLUMN', null)
    }
  },

  getters: {
    getColumnById: (state) => (id) => {
      return state.columns.find(column => column.id === id)
    }
  }
}) 