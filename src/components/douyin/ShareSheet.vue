<template>
  <Teleport to="body">
    <div v-if="open" class="mask" @click="close">
      <div class="sheet" @click.stop>
        <div ref="cardEl" class="card">
          <div class="brand">
            <i class="logo">{{ logoText }}</i>
            <div>
              <strong>{{ appName }}</strong>
              <p>{{ slogan }}</p>
            </div>
          </div>

          <div class="cover">
            <EncryptedImage v-if="cover" :src="cover" alt="" />
            <span v-else class="hold">{{ title }}</span>
          </div>

          <div class="invite">
            <div class="qr">
              <img v-if="qrSrc" :src="qrSrc" alt="邀请二维码" />
            </div>
            <div class="meta">
              <span>邀请码</span>
              <b>{{ code || '------' }}</b>
              <em>官方网址: {{ officialHost }}</em>
            </div>
          </div>
        </div>

        <div class="actions">
          <button type="button" class="ghost" :disabled="busy" @click="copyLink">复制链接</button>
          <button type="button" class="solid" :disabled="busy" @click="savePoster">保存图片</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { showToast } from 'vant'
import EncryptedImage from '@/components/EncryptedImage.vue'
import { fetchShareInfo, reportShare } from '@/api/user'
import type { DouyinItem } from '@/api/douyin'
import { useConfigStore } from '@/stores/config'
import { useUserStore } from '@/stores/user'
import { encodeId, videoPath } from '@/utils/idcrypt'
import { mediaUrl, toastError } from '@/utils/request'

const props = defineProps<{
  open: boolean
  item: DouyinItem | null
}>()

const emit = defineEmits<{
  close: []
}>()

const userStore = useUserStore()
const configStore = useConfigStore()
const busy = ref(false)
const cardEl = ref<HTMLElement | null>(null)
const shareCode = ref('')

const appName = computed(() => configStore.appName || '漫隐')
const slogan = computed(() => {
  const raw = String(configStore.configs.share_slogan || configStore.configs.slogan || '').trim()
  return raw || '邀请好友 一起看'
})
const logoText = computed(() => (appName.value.replace(/\s+/g, '')[0] || '漫').slice(0, 1))
const title = computed(() => props.item?.title || appName.value)
const cover = computed(() => mediaUrl(props.item?.cover_url))

const code = computed(() => shareCode.value || encodeId(userStore.user?.id) || '')

const shareBase = computed(() => {
  const conf = String(configStore.shareUrl || '').trim().replace(/\/$/, '')
  if (conf && !/example\.com/i.test(conf)) return conf
  return location.origin.replace(/\/$/, '')
})

const officialHost = computed(() => {
  try {
    return new URL(shareBase.value).host
  } catch {
    return location.host
  }
})

const link = computed(() => {
  const path = props.item?.id ? `${location.origin}${videoPath(props.item.id)}` : shareBase.value
  if (!code.value) return path
  try {
    const url = new URL(path)
    url.searchParams.set('code', code.value)
    return url.toString()
  } catch {
    return `${path}${path.includes('?') ? '&' : '?'}code=${encodeURIComponent(code.value)}`
  }
})

const qrSrc = computed(() => {
  if (!link.value) return ''
  return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=8&data=${encodeURIComponent(link.value)}`
})

const close = () => emit('close')

const load = async () => {
  try {
    await userStore.ensureLogin()
    if (!configStore.loaded) await configStore.load().catch(() => undefined)
    const info = await fetchShareInfo().catch(() => null)
    shareCode.value = info?.share_code || encodeId(userStore.user?.id) || ''
  } catch (err) {
    toastError(err)
  }
}

const copyLink = async () => {
  if (!link.value) return
  busy.value = true
  try {
    await navigator.clipboard.writeText(link.value)
    await reportShare('link', 'douyin').catch(() => undefined)
    showToast('链接已复制')
  } catch {
    showToast(link.value)
  } finally {
    busy.value = false
  }
}

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    if (!src.startsWith('blob:')) img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('img'))
    img.src = src
  })

const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

const savePoster = async () => {
  busy.value = true
  try {
    const w = 750
    const h = 1120
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('canvas')

    ctx.fillStyle = '#2a2a30'
    ctx.fillRect(0, 0, w, h)

    ctx.fillStyle = '#1c1c22'
    roundRect(ctx, 40, 40, 670, 120, 20)
    ctx.fill()
    const logo = ctx.createLinearGradient(64, 58, 156, 150)
    logo.addColorStop(0, '#7b4dff')
    logo.addColorStop(1, '#ff3d7f')
    ctx.fillStyle = logo
    roundRect(ctx, 64, 58, 84, 84, 18)
    ctx.fill()
    ctx.fillStyle = '#fff'
    ctx.font = '800 42px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(logoText.value, 106, 116)
    ctx.textAlign = 'left'
    ctx.font = '800 36px sans-serif'
    ctx.fillText(appName.value, 170, 94)
    ctx.fillStyle = 'rgba(255,255,255,0.55)'
    ctx.font = '400 22px sans-serif'
    ctx.fillText(slogan.value, 170, 132)

    const coverX = 120
    const coverY = 188
    const coverW = 510
    const coverH = 680
    ctx.fillStyle = '#16161c'
    roundRect(ctx, coverX, coverY, coverW, coverH, 22)
    ctx.fill()
    ctx.save()
    roundRect(ctx, coverX, coverY, coverW, coverH, 22)
    ctx.clip()
    const coverEl = cardEl.value?.querySelector('.cover img') as HTMLImageElement | null
    try {
      const src = coverEl?.src || ''
      if (src) {
        const img = await loadImage(src)
        const scale = Math.max(coverW / img.width, coverH / img.height)
        const dw = img.width * scale
        const dh = img.height * scale
        ctx.drawImage(img, coverX + (coverW - dw) / 2, coverY + (coverH - dh) / 2, dw, dh)
      }
    } catch {
      ctx.fillStyle = '#fff'
      ctx.font = '600 28px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(title.value.slice(0, 12), coverX + coverW / 2, coverY + coverH / 2)
      ctx.textAlign = 'left'
    }
    ctx.restore()

    ctx.fillStyle = '#1c1c22'
    roundRect(ctx, 40, 896, 670, 180, 20)
    ctx.fill()
    ctx.fillStyle = '#fff'
    roundRect(ctx, 64, 918, 136, 136, 12)
    ctx.fill()
    try {
      const qr = await loadImage(qrSrc.value)
      ctx.drawImage(qr, 72, 926, 120, 120)
    } catch {
      ctx.fillStyle = '#111'
      ctx.font = '20px sans-serif'
      ctx.fillText('扫码打开', 84, 996)
    }
    ctx.fillStyle = 'rgba(255,255,255,0.55)'
    ctx.font = '400 22px sans-serif'
    ctx.fillText('邀请码', 230, 956)
    ctx.fillStyle = '#fff'
    ctx.font = '800 40px sans-serif'
    ctx.fillText(code.value || '------', 230, 1008)
    ctx.fillStyle = 'rgba(255,255,255,0.45)'
    ctx.font = '400 22px sans-serif'
    ctx.fillText(`官方网址: ${officialHost.value}`, 230, 1050)

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
    if (!blob) throw new Error('blob')
    const file = new File([blob], 'share.png', { type: 'image/png' })
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: title.value })
    } else {
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = 'share.png'
      a.click()
      URL.revokeObjectURL(a.href)
      showToast('海报已保存')
    }
    await reportShare('poster', 'douyin').catch(() => undefined)
  } catch (err) {
    toastError(err)
  } finally {
    busy.value = false
  }
}

watch(
  () => [props.open, props.item?.id] as const,
  ([show]) => {
    if (!show) return
    shareCode.value = ''
    load()
  },
)
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.mask {
  position: fixed;
  inset: 0;
  z-index: 130;
  background: rgba(6, 6, 10, 0.58);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 22px;
}

.sheet {
  width: min(100%, 360px);
}

.card {
  padding: 14px;
  border-radius: 18px;
  background: #2a2a30;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.35);
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  background: #1c1c22;

  strong {
    display: block;
    font-size: 15px;
    font-weight: 800;
    color: #fff;
  }

  p {
    margin: 3px 0 0;
    font-size: 11px;
    color: rgba(255, 255, 255, 0.48);
  }
}

.logo {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  font-style: normal;
  font-size: 18px;
  font-weight: 800;
  color: #fff;
  background: linear-gradient(135deg, #7b4dff, #ff3d7f);
}

.cover {
  margin: 12px auto 0;
  width: 68%;
  aspect-ratio: 3 / 4;
  border-radius: 14px;
  overflow: hidden;
  background: #16161c;

  :deep(img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.hold {
  display: grid;
  place-items: center;
  height: 100%;
  padding: 16px;
  color: #c8c8d0;
  font-size: 13px;
  text-align: center;
}

.invite {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
  padding: 10px 12px;
  border-radius: 12px;
  background: #1c1c22;
}

.qr {
  width: 72px;
  height: 72px;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    display: block;
  }
}

.meta {
  min-width: 0;

  span {
    display: block;
    font-size: 11px;
    color: rgba(255, 255, 255, 0.5);
  }

  b {
    display: block;
    margin-top: 4px;
    font-size: 18px;
    font-weight: 800;
    letter-spacing: 0.04em;
    color: #fff;
  }

  em {
    display: block;
    margin-top: 4px;
    font-style: normal;
    font-size: 11px;
    color: rgba(255, 255, 255, 0.42);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 14px;
}

.ghost,
.solid {
  height: 44px;
  border: 0;
  border-radius: 22px;
  font-size: 14px;
  font-weight: 800;
  color: #fff;
}

.ghost {
  background: #3a3a44;
}

.solid {
  background: linear-gradient(90deg, #5b7cff, #8a4dff);
}

@media (min-width: $desktop-preview-min) {
  .mask {
    left: 50%;
    width: 100%;
    max-width: $phone-max-width;
    transform: translateX(-50%);
  }
}
</style>
