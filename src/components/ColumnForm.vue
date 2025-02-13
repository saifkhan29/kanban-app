<template>
  <div class="form-overlay" @click.self="close">
    <div class="form">
      <h2>Add New Column</h2>
      <form @submit.prevent="submitForm">
        <div class="form-group">
          <label>Column Title</label>
          <input 
            v-model="columnData.title" 
            type="text" 
            required 
            placeholder="Enter column title"
            class="form-input"
          >
        </div>
        
        <div class="form-actions">
          <button type="button" class="cancel-btn" @click="close">Cancel</button>
          <button 
            type="submit" 
            class="submit-btn"
            :disabled="!columnData.title.trim()"
          >
            Add Column
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { reactive } from 'vue'

export default {
  name: 'ColumnForm',
  setup(props, { emit }) {
    const columnData = reactive({
      title: ''
    })

    const submitForm = () => {
      if (!columnData.title.trim()) return
      emit('submit', { title: columnData.title.trim() })
      columnData.title = ''
      close()
    }

    const close = () => {
      columnData.title = ''
      emit('close')
    }

    return {
      columnData,
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

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e4ea;
  border-radius: 6px;
  font-size: 1rem;
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
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
}

.cancel-btn {
  background-color: #f1f2f7;
  border: none;
  color: #666;
}

.submit-btn {
  background-color: #5e6ad2;
  border: none;
  color: white;
}

.cancel-btn:hover {
  background-color: #e2e4ea;
}

.submit-btn:hover {
  background-color: #4f58b8;
}

.submit-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.submit-btn:disabled:hover {
  background-color: #cccccc;
}
</style> 