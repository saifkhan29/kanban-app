<template>
  <div class="form-overlay" @click.self="close">
    <div class="form">
      <h2>{{ isEdit ? 'Edit Board' : 'Create New Board' }}</h2>
      <form @submit.prevent="submitForm">
        <div class="form-group">
          <label>Board Title</label>
          <input 
            v-model="boardData.title" 
            type="text" 
            required 
            placeholder="Enter board title"
            class="form-input"
            autofocus
          >
        </div>
        
        <div class="form-actions">
          <button type="button" class="cancel-btn" @click="close">Cancel</button>
          <button 
            type="submit" 
            class="submit-btn"
            :disabled="!boardData.title.trim()"
          >
            {{ isEdit ? 'Update' : 'Create' }} Board
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { reactive, watch } from 'vue'

export default {
  name: 'BoardForm',
  props: {
    board: {
      type: Object,
      default: null
    },
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  setup(props, { emit }) {
    const boardData = reactive({
      title: ''
    })

    watch(() => props.board, (newBoard) => {
      if (newBoard) {
        boardData.title = newBoard.title
      }
    }, { immediate: true })

    const submitForm = () => {
      if (!boardData.title.trim()) return
      emit('submit', { title: boardData.title.trim() })
      boardData.title = ''
      close()
    }

    const close = () => {
      boardData.title = ''
      emit('close')
    }

    return {
      boardData,
      submitForm,
      close
    }
  }
}
</script>

<style scoped>
.form-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.form {
  background-color: white;
  border-radius: 12px;
  padding: 2rem;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08);
  animation: slideIn 0.2s ease-out;
}

h2 {
  margin: 0 0 1.5rem 0;
  color: #2c3e50;
  font-size: 1.5rem;
  font-weight: 600;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #4a5568;
  font-size: 0.95rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s;
  background-color: #f8fafc;
}

.form-input:focus {
  outline: none;
  border-color: #5e6ad2;
  background-color: white;
  box-shadow: 0 0 0 3px rgba(94, 106, 210, 0.1);
}

.form-input::placeholder {
  color: #a0aec0;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.cancel-btn,
.submit-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn {
  background-color: white;
  border: 1px solid #5e6ad2;
  color: #5e6ad2;
}

.cancel-btn:hover {
  background-color: rgba(94, 106, 210, 0.1);
  border-color: #4f58b8;
  color: #4f58b8;
}

.submit-btn {
  background-color: #5e6ad2;
  border: none;
  color: white;
}

.submit-btn:hover {
  background-color: #4f58b8;
}

.submit-btn:disabled {
  background-color: #cbd5e1;
  cursor: not-allowed;
}

.submit-btn:disabled:hover {
  background-color: #cbd5e1;
}

@keyframes slideIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style> 