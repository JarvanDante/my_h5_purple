import { request } from '@/utils/request'

export type UploadResult = { url: string; object_key: string }

type InitRes = {
  id: string
  upload_url: string
  method?: string
}

type ConfirmRes = {
  id: string
  url: string
  object_key: string
}

/** 帖子封面/视频：走统一存储 PaaS，直传 MinIO 桶 my-storage。 */
export async function uploadPostMedia(
  file: File,
  purpose: 'image' | 'video',
  onProgress?: (percent: number) => void,
): Promise<UploadResult> {
  const init = await request<InitRes>('/media/storage/init', {
    method: 'POST',
    body: JSON.stringify({
      filename: file.name || (purpose === 'video' ? 'video.mp4' : 'image.jpg'),
      purpose,
      content_type: file.type || '',
      size: file.size,
    }),
  })
  await putToPresign(init.upload_url, file, onProgress)
  const done = await request<ConfirmRes>('/media/storage/confirm', {
    method: 'POST',
    body: JSON.stringify({ id: init.id }),
  })
  return { url: done.url, object_key: done.object_key || init.id }
}

function putToPresign(url: string, file: File, onProgress?: (percent: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', url)
    xhr.upload.onprogress = (ev) => {
      if (!ev.lengthComputable || !onProgress) return
      onProgress(Math.min(99, Math.round((ev.loaded / ev.total) * 100)))
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(100)
        resolve()
        return
      }
      reject(new Error(`直传失败(${xhr.status})`))
    }
    xhr.onerror = () => reject(new Error('直传失败，请检查对象存储跨域'))
    xhr.send(file)
  })
}
