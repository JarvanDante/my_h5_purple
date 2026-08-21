import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePostDraftStore = defineStore('postDraft', () => {
  const title = ref('')
  const content = ref('')
  const topics = ref<string[]>([])
  const pics = ref<string[]>([])
  const videoUrl = ref('')

  const reset = () => {
    title.value = ''
    content.value = ''
    topics.value = []
    pics.value = []
    videoUrl.value = ''
  }

  return { title, content, topics, pics, videoUrl, reset }
})
