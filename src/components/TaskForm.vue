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
          <label>Images</label>
          <div class="image-upload-area">
            <input 
              type="file"
              ref="fileInput"
              @change="handleImageUpload"
              accept="image/*"
              multiple
              class="hidden"
            >
            <div class="upload-button" @click="$refs.fileInput.click()">
              <span class="plus">+</span>
              <span>Add Images</span>
            </div>
            <div class="image-preview-container" v-if="taskData.images.length > 0">
              <div v-for="(image, index) in taskData.images" 
                   :key="index" 
                   class="image-preview">
                <img :src="image.url" :alt="image.name">
                <button class="remove-image" @click.prevent="removeImage(index)">×</button>
              </div>
            </div>
          </div>
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
        tags: [],
        images: []
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
      tags: [],
      images: []
    })
    const newTag = ref('')
    const fileInput = ref(null)

    watch(() => props.task, (newTask) => {
      if (newTask && props.isEdit) {
        taskData.value = { ...newTask }
      } else {
        taskData.value = {
          title: '',
          description: '',
          priority: 'medium',
          tags: [],
          images: []
        }
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

    const handleImageUpload = (event) => {
      const files = Array.from(event.target.files)
      
      files.forEach(file => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader()
          
          reader.onload = (e) => {
            taskData.value.images.push({
              url: e.target.result,
              name: file.name,
              file: file
            })
          }
          
          reader.readAsDataURL(file)
        }
      })
      
      event.target.value = ''
    }

    const removeImage = (index) => {
      taskData.value.images.splice(index, 1)
    }

    const submitForm = () => {
      if (!taskData.value.title.trim()) {
        console.log('Empty title')
        return
      }
      
      const formData = {
        ...taskData.value,
        title: taskData.value.title.trim(),
        description: taskData.value.description.trim(),
        priority: taskData.value.priority || 'medium',
        tags: taskData.value.tags || [],
        images: taskData.value.images || []
      }
      
      console.log('Emitting submit with data:', formData)
      emit('submit', formData)
      emit('close')
    }

    const close = () => {
      taskData.value = {
        title: '',
        description: '',
        priority: 'medium',
        tags: [],
        images: []
      }
      emit('close')
    }

    return {
      taskData,
      newTag,
      addTag,
      removeTag,
      fileInput,
      handleImageUpload,
      removeImage,
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

.image-upload-area {
  margin-top: 0.5rem;
}

.hidden {
  display: none;
}

.upload-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.upload-button:hover {
  background-color: #f1f5f9;
  border-color: #5e6ad2;
  color: #5e6ad2;
}

.plus {
  font-size: 1.2rem;
  font-weight: 300;
}

.image-preview-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1rem;
}

.image-preview {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 6px;
  overflow: hidden;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-image {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  line-height: 1;
  transition: all 0.2s;
}

.remove-image:hover {
  background-color: rgba(0, 0, 0, 0.7);
}
</style> 