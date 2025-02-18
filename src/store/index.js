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
      selectedColumn: null,
      editingBoard: null,
      editingColumn: null,
    }
  },

  mutations: {
    ADD_BOARD(state, board) {
      const newBoard = {
        id: Date.now(),
        title: board.title,
        columns: []
      }
      state.boards.push(newBoard)
      state.currentBoardId = newBoard.id
    },

    SET_CURRENT_BOARD(state, boardId) {
      state.currentBoardId = boardId
    },

    ADD_COLUMN(state, { boardId, column }) {
      const board = state.boards.find(b => b.id === boardId)
      if (board) {
        const newColumn = {
          id: Date.now(),
          title: column.title,
          tasks: []
        }
        if (!board.columns) {
          board.columns = []
        }
        board.columns.push(newColumn)
        console.log('Added new column:', newColumn)
      }
    },

    ADD_TASK(state, { boardId, columnId, task }) {
      console.log('ADD_TASK mutation called with:', { boardId, columnId, task })
      
      const board = state.boards.find(b => b.id === boardId)
      if (!board) {
        console.error('Board not found:', boardId)
        return
      }

      const column = board.columns.find(col => col.id === columnId)
      if (!column) {
        console.error('Column not found:', columnId)
        return
      }

      const newTask = {
        id: Date.now(),
        title: task.title,
        description: task.description,
        priority: task.priority || 'medium',
        tags: task.tags || [],
        images: task.images || [],
        createdAt: new Date().toISOString()
      }

      console.log('Adding new task to column:', column.id, newTask)
      
      // Ensure column.tasks exists
      if (!column.tasks) {
        column.tasks = []
      }
      
      column.tasks.push(newTask)
      console.log('Updated column tasks:', column.tasks)
    },

    UPDATE_TASK(state, { boardId, columnId, taskId, updatedTask }) {
      const board = state.boards.find(b => b.id === boardId)
      if (board) {
        const column = board.columns.find(col => col.id === columnId)
        if (column) {
          const taskIndex = column.tasks.findIndex(task => task.id === taskId)
          if (taskIndex !== -1) {
            column.tasks[taskIndex] = {
              ...updatedTask,
              id: taskId,
              createdAt: column.tasks[taskIndex].createdAt
            }
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

    MOVE_TASK(state, { boardId, fromColumnId, toColumnId, taskId, toIndex }) {
      const board = state.boards.find(b => b.id === boardId)
      if (!board) return

      const fromColumn = board.columns.find(col => col.id === fromColumnId)
      const toColumn = board.columns.find(col => col.id === toColumnId)
      
      if (!fromColumn || !toColumn) return

      // Find and remove task from source
      const taskIndex = fromColumn.tasks.findIndex(task => task.id === taskId)
      if (taskIndex === -1) return
      const [task] = fromColumn.tasks.splice(taskIndex, 1)

      // Insert task at destination
      if (toIndex === -1 || toIndex >= toColumn.tasks.length) {
        // Append to end if toIndex is -1 or beyond array length
        toColumn.tasks.push(task)
      } else {
        // Insert at specific position
        toColumn.tasks.splice(toIndex, 0, task)
      }
    },

    SET_SHOW_TASK_FORM: (state, value) => state.showTaskForm = value,
    SET_SHOW_BOARD_FORM: (state, value) => state.showBoardForm = value,
    SET_SHOW_COLUMN_FORM: (state, value) => state.showColumnForm = value,
    SET_EDITING_TASK: (state, payload) => {
      if (payload === null) {
        state.editingTask = null
      } else {
        state.editingTask = payload.task
        state.selectedColumn = payload.column
      }
    },
    SET_SELECTED_COLUMN: (state, column) => {
      console.log('Setting selected column:', column?.id)
      state.selectedColumn = column
    },

    UPDATE_BOARD(state, { boardId, title }) {
      const board = state.boards.find(b => b.id === boardId)
      if (board) {
        board.title = title
      }
    },

    SET_EDITING_BOARD(state, board) {
      state.editingBoard = board
    },

    UPDATE_COLUMN(state, { boardId, columnId, title }) {
      const board = state.boards.find(b => b.id === boardId)
      if (board) {
        const column = board.columns.find(col => col.id === columnId)
        if (column) {
          column.title = title
        }
      }
    },

    SET_EDITING_COLUMN(state, column) {
      state.editingColumn = column
    },

    CLOSE_TASK_FORM: (state) => {
      state.showTaskForm = false
      state.editingTask = null
      state.selectedColumn = null
    }
  },

  actions: {
    addBoard({ commit }, board) {
      if (!board || !board.title) return
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
      console.log('addTask action:', { columnId, task, currentBoardId: state.currentBoardId })
      if (!columnId || !task || !task.title) {
        console.warn('Invalid task data:', { columnId, task })
        return
      }
      
      commit('ADD_TASK', { 
        boardId: state.currentBoardId,
        columnId, 
        task 
      })
    },

    updateTask({ commit, state }, { columnId, taskId, updatedTask }) {
      if (!columnId || !taskId || !updatedTask || !updatedTask.title) return
      
      commit('UPDATE_TASK', { 
        boardId: state.currentBoardId,
        columnId, 
        taskId, 
        updatedTask 
      })
    },

    moveTask({ commit, state }, { fromColumnId, toColumnId, taskId, toIndex }) {
      if (!fromColumnId || !toColumnId || !taskId) return
      commit('MOVE_TASK', { 
        boardId: state.currentBoardId,
        fromColumnId, 
        toColumnId, 
        taskId,
        toIndex
      })
    },

    openBoardForm({ commit }) {
      commit('SET_SHOW_BOARD_FORM', true)
    },

    closeBoardForm({ commit }) {
      commit('SET_SHOW_BOARD_FORM', false)
      commit('SET_EDITING_BOARD', null)
    },

    openColumnForm({ commit }) {
      commit('SET_SHOW_COLUMN_FORM', true)
    },

    closeColumnForm({ commit }) {
      commit('SET_SHOW_COLUMN_FORM', false)
      commit('SET_EDITING_COLUMN', null)
    },

    openTaskForm({ commit }, column) {
      if (!column) {
        console.warn('No column provided to openTaskForm')
        return
      }
      commit('SET_SELECTED_COLUMN', column)
      commit('SET_EDITING_TASK', null)
      commit('SET_SHOW_TASK_FORM', true)
      
      console.log('Opening task form with column:', column.id)
    },

    closeTaskForm({ commit }) {
      commit('CLOSE_TASK_FORM')
    },

    updateBoard({ commit }, { boardId, title }) {
      if (!boardId || !title) return
      commit('UPDATE_BOARD', { boardId, title })
    },

    openEditBoardForm({ commit }, board) {
      commit('SET_EDITING_BOARD', board)
      commit('SET_SHOW_BOARD_FORM', true)
    },

    updateColumn({ commit, state }, { columnId, title }) {
      if (!columnId || !title) return
      commit('UPDATE_COLUMN', { 
        boardId: state.currentBoardId,
        columnId, 
        title 
      })
    },

    openEditColumnForm({ commit }, column) {
      commit('SET_EDITING_COLUMN', column)
      commit('SET_SHOW_COLUMN_FORM', true)
    },

    openEditTaskForm({ commit }, { task, column }) {
      if (!task || !column) return
      commit('SET_EDITING_TASK', { task, column })
      commit('SET_SHOW_TASK_FORM', true)
    },
  },

  getters: {
    currentBoard: (state) => {
      return state.boards.find(board => board.id === state.currentBoardId)
    }
  }
}) 