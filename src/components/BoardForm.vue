<template>
  <div class="form-overlay" @click.self="close">
    <div class="form">
      <h2>Create New Board</h2>
      <form @submit.prevent="submitForm">
        <div class="form-group">
          <label>Board Title</label>
          <input 
            v-model="boardData.title" 
            type="text" 
            required 
            placeholder="Enter board title"
            class="form-input"
          >
        </div>
        
        <div class="form-actions">
          <button type="button" class="cancel-btn" @click="close">Cancel</button>
          <button 
            type="submit" 
            class="submit-btn"
            :disabled="!boardData.title.trim()"
          >
            Create Board
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { reactive } from 'vue'

export default {
  name: 'BoardForm',
  setup(props, { emit }) {
    const boardData = reactive({
      title: ''
    })

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
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e4ea;
  border-radius: 6px;
  font-size: 1rem;
}

.submit-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.submit-btn:disabled:hover {
  background-color: #cccccc;
}
</style> 