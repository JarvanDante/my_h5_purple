<template>
  <div class="page-shell sub-page invite-page">
    <PageHeader title="分享邀请" fallback="/me">
      <button type="button" class="logs-btn" @click="goLogs">我的分享</button>
    </PageHeader>

    <section class="poster">
      <p class="brand">{{ appName }}</p>
      <strong>邀请好友 一起看</strong>
      <p class="sub">分享给好友，双方都有福利</p>
      <div class="foot">
        <div class="qr">
          <img v-if="qrSrc" :src="qrSrc" alt="邀请二维码" />
        </div>
        <div class="meta">
          <b>邀请码 {{ code }}</b>
          <span>最新官方网址</span>
          <em>{{ officialHost }}</em>
        </div>
      </div>
    </section>

    <div class="actions">
      <button type="button" class="ghost" :disabled="busy" @click="savePoster">保存图片分享</button>
      <button type="button" class="solid" :disabled="busy" @click="copyLink">复制链接推广</button>
    </div>
    <p class="hint">分享给好友，有更多福利赠送哦</p>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import PageHeader from '@/components/PageHeader.vue'
import { fetchShareInfo, reportShare } from '@/api/user'
import { useConfigStore } from '@/stores/config'
import { useUserStore } from '@/stores/user'
import { encodeId } from '@/utils/idcrypt'
import { toastError } from '@/utils/request'

const router = useRouter()
const userStore = useUserStore()
const configStore = useConfigStore()
const busy = ref(false)
const appName = computed(() => configStore.appName || '漫隐')
const goLogs = () => router.push('/invite/logs')
const code = computed(() => encodeId(userStore.user?.id))

const shareBase = computed(() => {
  const conf = String(configStore.shareUrl || '').trim().replace(/\/$/, '')
  if (conf && !/example\.com/i.test(conf)) return conf
  return location.origin.replace(/\/$/, '')
})

const link = computed(() => {
  if (!code.value) return ''
  try {
    const url = new URL(shareBase.value)
    url.searchParams.set('code', code.value)
    return url.toString()
  } catch {
    return `${shareBase.value}?code=${encodeURIComponent(code.value)}`
  }
})

const officialHost = computed(() => {
  try {
    return new URL(shareBase.value).host
  } catch {
    return location.host
  }
})

const qrSrc = computed(() => {
  if (!link.value) return ''
  return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=8&data=${encodeURIComponent(link.value)}`
})

const load = async () => {
  try {
    await userStore.ensureLogin()
    if (!configStore.loaded) await configStore.load().catch(() => undefined)
    await fetchShareInfo().catch(() => undefined)
  } catch (err) {
    toastError(err)
  }
}

const copyLink = async () => {
  if (!link.value) return
  busy.value = true
  try {
    await navigator.clipboard.writeText(link.value)
    await reportShare('link', 'h5').catch(() => undefined)
    showToast('推广链接已复制')
  } catch {
    showToast(link.value)
  } finally {
    busy.value = false
  }
}

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('qr'))
    img.src = src
  })

const savePoster = async () => {
  if (!code.value) return
  busy.value = true
  try {
    const w = 750
    const h = 1200
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('canvas')
    const g = ctx.createLinearGradient(0, 0, w, h)
    g.addColorStop(0, '#2a0b1a')
    g.addColorStop(0.45, '#5a1238')
    g.addColorStop(1, '#ff3d7f')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = 'rgba(255,255,255,0.08)'
    ctx.beginPath()
    ctx.arc(620, 180, 220, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#fff'
    ctx.font = '600 28px sans-serif'
    ctx.fillText(appName.value, 56, 90)
    ctx.font = '800 64px sans-serif'
    ctx.fillText('邀请好友', 56, 200)
    ctx.fillText('一起看', 56, 280)
    ctx.globalAlpha = 0.85
    ctx.font = '400 28px sans-serif'
    ctx.fillText('分享给好友，双方都有福利', 56, 340)
    ctx.globalAlpha = 1
    ctx.fillStyle = 'rgba(13,13,18,0.55)'
    roundRect(ctx, 40, 820, 670, 320, 28)
    ctx.fill()
    ctx.fillStyle = '#fff'
    roundRect(ctx, 68, 848, 220, 220, 16)
    ctx.fill()
    try {
      const qr = await loadImage(qrSrc.value)
      ctx.drawImage(qr, 80, 860, 196, 196)
    } catch {
      ctx.fillStyle = '#111'
      ctx.font = '20px sans-serif'
      ctx.fillText('扫码打开', 120, 960)
    }
    ctx.fillStyle = '#fff'
    ctx.font = '700 34px sans-serif'
    ctx.fillText(`邀请码 ${code.value}`, 320, 920)
    ctx.font = '400 24px sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.72)'
    ctx.fillText('最新官方网址', 320, 980)
    ctx.fillStyle = '#ffb3cc'
    ctx.font = '700 26px sans-serif'
    ctx.fillText(officialHost.value, 320, 1030)

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
    if (!blob) throw new Error('blob')
    const file = new File([blob], 'invite.png', { type: 'image/png' })
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: '分享邀请' })
    } else {
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = 'invite.png'
      a.click()
      URL.revokeObjectURL(a.href)
      showToast('海报已保存')
    }
    await reportShare('poster', 'h5').catch(() => undefined)
  } catch (err) {
    toastError(err)
  } finally {
    busy.value = false
  }
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

onMounted(load)
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.invite-page {
  background: #0d0d12;
  color: #f5f5f8;
  min-height: 100%;
  padding-bottom: 24px;
}

.logs-btn {
  border: 0;
  background: transparent;
  color: #ff3d7f;
  font-size: 13px;
  font-weight: 700;
  padding: 0 8px;
}

.poster {
  margin: 16px;
  min-height: 460px;
  padding: 28px 22px 22px;
  border-radius: 18px;
  background:
    radial-gradient(circle at 86% 12%, rgba(255, 255, 255, 0.16), transparent 28%),
    linear-gradient(160deg, #2a0b1a 0%, #6a1542 52%, #ff3d7f 100%);
  color: #fff;
  display: flex;
  flex-direction: column;
}

.brand {
  font-size: 13px;
  letter-spacing: 2px;
  opacity: 0.8;
}

.poster strong {
  display: block;
  margin-top: 28px;
  font-size: 34px;
  font-weight: 800;
  line-height: 1.25;
}

.sub {
  margin-top: 10px;
  font-size: 14px;
  opacity: 0.82;
}

.foot {
  margin-top: auto;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px;
  border-radius: 14px;
  background: rgba(13, 13, 18, 0.42);
}

.qr {
  width: 92px;
  height: 92px;
  border-radius: 10px;
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

  b {
    display: block;
    font-size: 16px;
  }

  span {
    display: block;
    margin-top: 6px;
    font-size: 11px;
    opacity: 0.7;
  }

  em {
    display: block;
    margin-top: 4px;
    font-style: normal;
    font-size: 13px;
    font-weight: 700;
    color: #ffb3cc;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin: 0 16px;
}

.ghost,
.solid {
  height: 46px;
  border-radius: 23px;
  font-size: 14px;
  font-weight: 800;
}

.ghost {
  border: 1.5px solid #ff3d7f;
  background: transparent;
  color: #ff3d7f;
}

.solid {
  border: 0;
  background: #ff3d7f;
  color: #fff;
}

.hint {
  margin-top: 14px;
  text-align: center;
  font-size: 12px;
  color: #ff6699;
}
</style>
