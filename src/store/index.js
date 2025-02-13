import { createStore } from 'vuex'

export default createStore({
  state() {
    return {
      boards: [
        {
          id: 1,
          title: 'Main Board',
          columns: []
        }
      ],
      currentBoardId: 1,
      showTaskForm: false,
      showBoardForm: false,
      showColumnForm: false,
      editingTask: null,
      selectedColumn: null
    }
  },

  mutations: {
    ADD_BOARD(state, board) {
      board.id = Date.now()
      board.columns = []
      state.boards.push(board)
      state.currentBoardId = board.id
    },

    SET_CURRENT_BOARD(state, boardId) {
      state.currentBoardId = boardId
    },

    ADD_COLUMN(state, { boardId, column }) {
      const board = state.boards.find(b => b.id === boardId)
      if (board) {
        column.id = Date.now()
        column.tasks = []
        if (!board.columns) {
          board.columns = []
        }
        board.columns.push(column)
      }
    },

    ADD_TASK(state, { boardId, columnId, task }) {
      const board = state.boards.find(b => b.id === boardId)
      if (board) {
        const column = board.columns.find(col => col.id === columnId)
        if (column) {
          task.id = Date.now()
          column.tasks.push(task)
        }
      }
    },

    UPDATE_TASK(state, { boardId, columnId, taskId, updatedTask }) {
      const board = state.boards.find(b => b.id === boardId)
      if (board) {
        const column = board.columns.find(col => col.id === columnId)
        if (column) {
          const taskIndex = column.tasks.findIndex(task => task.id === taskId)
          if (taskIndex !== -1) {
            column.tasks.splice(taskIndex, 1, { ...updatedTask, id: taskId })
          }
        }
      }
    },

    DELETE_TASK(state, { boardId, columnId, taskId }) {
      const board = state.boards.find(b => b.id === boardId)
      if (board) {
        const column = board.columns.find(col => col.id === columnId)
        if (column) {
          column.tasks = column.tasks.filter(task => task.id !== taskId)
        }
      }
    },

    MOVE_TASK(state, { boardId, fromColumnId, toColumnId, taskId }) {
      const board = state.boards.find(b => b.id === boardId)
      if (board) {
        const fromColumn = board.columns.find(col => col.id === fromColumnId)
        const toColumn = board.columns.find(col => col.id === toColumnId)
        
        if (fromColumn && toColumn) {
          const taskIndex = fromColumn.tasks.findIndex(task => task.id === taskId)
          if (taskIndex !== -1) {
            const task = fromColumn.tasks[taskIndex]
            fromColumn.tasks.splice(taskIndex, 1)
            toColumn.tasks.push(task)
          }
        }
      }
    },

    SET_SHOW_TASK_FORM: (state, value) => state.showTaskForm = value,
    SET_SHOW_BOARD_FORM: (state, value) => state.showBoardForm = value,
    SET_SHOW_COLUMN_FORM: (state, value) => state.showColumnForm = value,
    SET_EDITING_TASK: (state, task) => state.editingTask = task,
    SET_SELECTED_COLUMN: (state, column) => state.selectedColumn = column
  },

  actions: {
    addBoard({ commit }, board) {
      commit('ADD_BOARD', board)
    },

    setCurrentBoard({ commit }, boardId) {
      commit('SET_CURRENT_BOARD', boardId)
    },

    addColumn({ commit, state }, column) {
      if (!state.currentBoardId || !column) return
      commit('ADD_COLUMN', { 
        boardId: state.currentBoardId, 
        column: {
          title: column.title,
          tasks: []
        }
      })
    },

    addTask({ commit, state }, { columnId, task }) {
      if (!columnId || !task) return
      commit('ADD_TASK', { 
        boardId: state.currentBoardId,
        columnId, 
        task 
      })
    },

    updateTask({ commit, state }, { columnId, taskId, updatedTask }) {
      if (!columnId || !taskId || !updatedTask) return
      commit('UPDATE_TASK', { 
        boardId: state.currentBoardId,
        columnId, 
        taskId, 
        updatedTask 
      })
    },

    moveTask({ commit, state }, { fromColumnId, toColumnId, taskId }) {
      if (!fromColumnId || !toColumnId || !taskId) return
      commit('MOVE_TASK', { 
        boardId: state.currentBoardId,
        fromColumnId, 
        toColumnId, 
        taskId 
      })
    },

    openBoardForm({ commit }) {
      commit('SET_SHOW_BOARD_FORM', true)
    },

    closeBoardForm({ commit }) {
      commit('SET_SHOW_BOARD_FORM', false)
    },

    openColumnForm({ commit }) {
      commit('SET_SHOW_COLUMN_FORM', true)
    },

    closeColumnForm({ commit }) {
      commit('SET_SHOW_COLUMN_FORM', false)
    },

    openTaskForm({ commit }, column) {
      if (!column) return
      commit('SET_SELECTED_COLUMN', column)
      commit('SET_EDITING_TASK', null)
      commit('SET_SHOW_TASK_FORM', true)
    },

    closeTaskForm({ commit }) {
      commit('SET_SHOW_TASK_FORM', false)
      commit('SET_EDITING_TASK', null)
      commit('SET_SELECTED_COLUMN', null)
    }
  },

  getters: {
    currentBoard: (state) => {
      return state.boards.find(board => board.id === state.currentBoardId)
    }
  }
}) 