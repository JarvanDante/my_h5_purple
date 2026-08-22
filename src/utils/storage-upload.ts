import { request, uploadMedia } from '@/utils/request'

export type UploadResult = { url: string; object_key: string }
export type StoragePurpose = 'image' | 'video' | 'avatar' | 'cover' | 'ad' | 'post' | 'post_video'

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

function defaultName(purpose: StoragePurpose) {
  if (purpose === 'video' || purpose === 'post_video') return 'video.mp4'
  return 'image.jpg'
}

/** 图片走服务端加密成 .bnc；视频预签名直传。都写入 my-storage。 */
export async function uploadToStorage(
  file: File,
  purpose: StoragePurpose,
  onProgress?: (percent: number) => void,
): Promise<UploadResult> {
  if (purpose !== 'video' && purpose !== 'post_video') {
    const data = await uploadMedia(file, purpose === 'cover' || purpose === 'avatar' || purpose === 'ad' || purpose === 'post' ? purpose : 'image')
    return { url: data.url, object_key: data.object_key }
  }
  const init = await request<InitRes>('/media/storage/init', {
    method: 'POST',
    body: JSON.stringify({
      filename: file.name || defaultName(purpose),
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

export function uploadPostMedia(
  file: File,
  purpose: 'image' | 'video',
  onProgress?: (percent: number) => void,
) {
  return uploadToStorage(file, purpose === 'video' ? 'post_video' : 'post', onProgress)
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
