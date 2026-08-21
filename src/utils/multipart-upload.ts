import { ApiError, getToken, request } from '@/utils/request'

const BASE = import.meta.env.VITE_API_BASE || '/front/v1'

export type UploadResult = { url: string; object_key: string }

type InitSession = {
  upload_id: string
  part_size: number
  part_count: number
}

type PartsRes = {
  list?: { part_number: number; etag: string }[]
}

/** 视频分片上传; 同文件未完成会话会复用, 已传分片自动跳过。 */
export async function uploadVideoResumable(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<UploadResult> {
  const init = await request<InitSession>('/media/multipart/init', {
    method: 'POST',
    body: JSON.stringify({
      filename: file.name || 'video.mp4',
      purpose: 'video',
      content_type: file.type || 'video/mp4',
      size: file.size,
    }),
  })

  const existed = await request<PartsRes>(
    `/media/multipart/parts?upload_id=${encodeURIComponent(init.upload_id)}`,
  )
  const done = new Set((existed.list || []).map((p) => p.part_number))
  const total = Math.max(init.part_count, 1)
  const report = () => {
    onProgress?.(Math.min(100, Math.round((done.size / total) * 100)))
  }
  report()

  for (let n = 1; n <= init.part_count; n++) {
    if (done.has(n)) continue
    const start = (n - 1) * init.part_size
    const blob = file.slice(start, start + init.part_size)
    await uploadPart(init.upload_id, n, blob)
    done.add(n)
    report()
  }

  return request<UploadResult>('/media/multipart/complete', {
    method: 'POST',
    body: JSON.stringify({ upload_id: init.upload_id }),
  })
}

async function uploadPart(uploadId: string, partNumber: number, blob: Blob) {
  let lastErr: unknown
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await uploadPartOnce(uploadId, partNumber, blob)
      return
    } catch (err) {
      lastErr = err
    }
  }
  throw lastErr
}

async function uploadPartOnce(uploadId: string, partNumber: number, blob: Blob) {
  const headers = new Headers()
  const token = getToken()
  if (token) headers.set('Authorization', token)
  const body = new FormData()
  body.append('upload_id', uploadId)
  body.append('part_number', String(partNumber))
  body.append('file', blob, `part-${partNumber}`)
  const res = await fetch(`${BASE}/media/multipart/part`, { method: 'POST', headers, body })
  const text = await res.text()
  let json: { code: number; message?: string }
  try {
    json = JSON.parse(text) as { code: number; message?: string }
  } catch {
    throw new ApiError(-1, '分片上传失败，请重试')
  }
  if (json.code !== 0) {
    throw new ApiError(json.code, json.message || '分片上传失败')
  }
}
