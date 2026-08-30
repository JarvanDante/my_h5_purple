import { showDialog } from 'vant'
import { formatFileSize, VIDEO_MAX_BYTES } from '@/utils/fileSize'

export const VIDEO_MAX_LABEL = '600M'

function probeVideoFile(file: File) {
  return new Promise<void>((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const el = document.createElement('video')
    el.preload = 'metadata'
    el.muted = true
    const finish = (ok: boolean, message?: string) => {
      window.clearTimeout(timer)
      el.removeAttribute('src')
      el.load()
      URL.revokeObjectURL(url)
      if (ok) resolve()
      else reject(new Error(message || '该视频无法播放'))
    }
    const timer = window.setTimeout(() => {
      finish(false, '视频读取超时，请换成更小的 MP4 后再上传')
    }, 12000)
    el.onloadedmetadata = () => {
      const sec = el.duration
      if (!Number.isFinite(sec) || sec <= 0) {
        finish(false, '无法读取视频时长，请换成 MP4（H.264）后再上传')
        return
      }
      finish(true)
    }
    el.onerror = () => {
      finish(false, '该视频无法播放。请导出为 MP4（H.264），不要用 iPhone 自带的 HEVC/MOV')
    }
    el.src = url
  })
}

/** 超限或当前浏览器播不了则弹窗并返回 true（调用方应中止上传）。 */
export async function rejectBadVideo(file: File) {
  if (file.size > VIDEO_MAX_BYTES) {
    await showDialog({
      title: '视频过大',
      message: `当前文件 ${formatFileSize(file.size)}，超过 ${VIDEO_MAX_LABEL} 上限，无法提交。请压缩后再上传。`,
      confirmButtonText: '知道了',
    }).catch(() => undefined)
    return true
  }
  try {
    await probeVideoFile(file)
  } catch (err) {
    await showDialog({
      title: '视频无法播放',
      message: err instanceof Error ? err.message : '该视频无法播放，请换成 MP4（H.264）后再上传',
      confirmButtonText: '知道了',
    }).catch(() => undefined)
    return true
  }
  return false
}
