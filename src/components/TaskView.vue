<template>
  <div class="task-view-overlay" @click.self="close">
    <div class="task-view">
      <div class="task-view-header">
        <h2>{{ task.title }}</h2>
        <button class="close-btn" @click="close" title="Close">×</button>
      </div>
      
      <div class="task-view-content">
        <div class="description">
          <h3>Description</h3>
          <p>{{ task.description || 'No description provided' }}</p>
        </div>

        <div v-if="task.images?.length" class="images-section">
          <h3>Images</h3>
          <div class="images-grid">
            <div v-for="(image, index) in task.images" 
                 :key="index" 
                 class="image-container">
              <img :src="image.url" :alt="image.name">
            </div>
          </div>
        </div>

        <div class="task-metadata">
          <div class="priority-badge" :class="task.priority">
            Priority: {{ task.priority }}
          </div>
          
          <div v-if="task.tags?.length" class="tags-section">
            <h3>Tags</h3>
            <div class="tags-container">
              <span v-for="(tag, index) in task.tags" 
                    :key="index" 
                    class="tag">
                {{ tag }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TaskView',
  props: {
    task: {
      type: Object,
      required: true
    },
    column: {
      type: Object,
      required: true
    }
  },
  setup(props, { emit }) {
    const close = () => {
      emit('close')
    }

    return {
      close
    }
  }
}
</script>

<style scoped>
.task-view-overlay {
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

.task-view {
  background-color: white;
  border-radius: 12px;
  width: 600px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.task-view-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e4ea;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  position: sticky;
  top: 0;
  background: white;
  z-index: 1;
}

.task-view-header h2 {
  margin: 0;
  font-size: 1.25rem;
  line-height: 1.4;
  word-break: break-word;
}

.close-btn {
  background: none;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  color: #666;
  font-size: 1.5rem;
}

.close-btn:hover {
  background-color: #f1f2f7;
}

.task-view-content {
  padding: 1.5rem;
}

.description, .images-section, .tags-section {
  margin-bottom: 1.5rem;
}

h3 {
  margin: 0 0 0.75rem 0;
  font-size: 1rem;
  color: #666;
}

.description p {
  margin: 0;
  line-height: 1.6;
  color: #333;
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}

.image-container {
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
}

.image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.task-metadata {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.priority-badge {
  display: inline-flex;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.9rem;
}

.priority-badge.high {
  background-color: #ffe2e2;
  color: #ff4d4d;
}

.priority-badge.medium {
  background-color: #fff4e2;
  color: #ffa64d;
}

.priority-badge.low {
  background-color: #e2ffe2;
  color: #4caf50;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  background-color: #e2e4ea;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
}
</style> 