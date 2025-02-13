<template>
  <div class="task-form-overlay" @click.self="close">
    <div class="task-form">
      <h2>{{ isEdit ? 'Edit Task' : 'New Task' }}</h2>
      <form @submit.prevent="submitForm">
        <div class="form-group">
          <label>Title</label>
          <input 
            v-model="taskData.title" 
            type="text" 
            required 
            placeholder="Enter task title"
          >
        </div>
        
        <div class="form-group">
          <label>Description</label>
          <textarea 
            v-model="taskData.description" 
            placeholder="Enter task description"
          ></textarea>
        </div>
        
        <div class="form-group">
          <label>Priority</label>
          <select v-model="taskData.priority">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        
        <div class="form-group">
          <label>Tags</label>
          <div class="tags-input">
            <input 
              v-model="newTag"
              @keyup.enter="addTag"
              type="text"
              placeholder="Add tag and press Enter"
            >
            <div class="tags-container">
              <span 
                v-for="(tag, index) in taskData.tags" 
                :key="index"
                class="tag"
              >
                {{ tag }}
                <button @click.prevent="removeTag(index)" class="remove-tag">×</button>
              </span>
            </div>
          </div>
        </div>
        
        <div class="form-actions">
          <button type="button" class="cancel-btn" @click="close">Cancel</button>
          <button type="submit" class="submit-btn">
            {{ isEdit ? 'Update' : 'Create' }} Task
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue'

export default {
  name: 'TaskForm',
  props: {
    task: {
      type: Object,
      default: () => ({
        title: '',
        description: '',
        priority: 'medium',
        tags: []
      })
    },
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  setup(props, { emit }) {
    const taskData = ref({
      title: '',
      description: '',
      priority: 'medium',
      tags: []
    })
    const newTag = ref('')

    watch(() => props.isEdit, (newVal) => {
      if (newVal) {
        taskData.value = { ...props.task }
      }
    }, { immediate: true })

    const addTag = () => {
      if (newTag.value.trim() && !taskData.value.tags.includes(newTag.value.trim())) {
        taskData.value.tags.push(newTag.value.trim())
      }
      newTag.value = ''
    }

    const removeTag = (index) => {
      taskData.value.tags.splice(index, 1)
    }

    const submitForm = () => {
      emit('submit', { ...taskData.value })
      close()
    }

    const close = () => {
      emit('close')
    }

    return {
      taskData,
      newTag,
      addTag,
      removeTag,
      submitForm,
      close
    }
  }
}
</script>

<style scoped>
.task-form-overlay {
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

.task-form {
  background-color: white;
  border-radius: 12px;
  padding: 2rem;
  width: 500px;
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

input[type="text"],
textarea,
select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e4ea;
  border-radius: 6px;
  font-size: 1rem;
}

textarea {
  min-height: 100px;
  resize: vertical;
}

.tags-input {
  margin-top: 0.5rem;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.tag {
  background-color: #e2e4ea;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.remove-tag {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 0 0.25rem;
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
</style> 