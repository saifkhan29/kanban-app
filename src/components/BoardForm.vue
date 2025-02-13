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
          >
        </div>
        
        <div class="form-actions">
          <button type="button" class="cancel-btn" @click="close">Cancel</button>
          <button type="submit" class="submit-btn">Create Board</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'BoardForm',
  setup(props, { emit }) {
    const boardData = ref({
      title: ''
    })

    const submitForm = () => {
      emit('submit', { ...boardData.value })
      close()
    }

    const close = () => {
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

/* Rest of the styles same as TaskForm */
</style> 