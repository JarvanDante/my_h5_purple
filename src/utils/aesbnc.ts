/** 对齐公司 AesUtil::decryptRaw: AES-128-ECB + PKCS7。默认与后端 image_aes.key 相同。 */
const DEFAULT_KEY = 'dafb787c76b5ce8a'

function resolveKey() {
  const raw = (import.meta.env.VITE_AES_BNC_KEY || DEFAULT_KEY).trim()
  return raw.length === 16 ? raw : DEFAULT_KEY
}

const SBOX = new Uint8Array([
  99, 124, 119, 123, 242, 107, 111, 197, 48, 1, 103, 43, 254, 215, 171, 118, 202, 130, 201, 125, 250, 89, 71, 240, 173, 212, 162, 175, 156, 164, 114, 192, 183, 253, 147, 38, 54, 63, 247, 204, 52, 165, 229, 241, 113, 216, 49, 21, 4, 199, 35, 195, 24, 150, 5, 154, 7, 18, 128, 226, 235, 39, 178, 117, 9, 131, 44, 26, 27, 110, 90, 160, 82, 59, 214, 179, 41, 227, 47, 132, 83, 209, 0, 237, 32, 252, 177, 91, 106, 203, 190, 57, 74, 76, 88, 207, 208, 239, 170, 251, 67, 77, 51, 133, 69, 249, 2, 127, 80, 60, 159, 168, 81, 163, 64, 143, 146, 157, 56, 245, 188, 182, 218, 33, 16, 255, 243, 210, 205, 12, 19, 236, 95, 151, 68, 23, 196, 167, 126, 61, 100, 93, 25, 115, 96, 129, 79, 220, 34, 42, 144, 136, 70, 238, 184, 20, 222, 94, 11, 219, 224, 50, 58, 10, 73, 6, 36, 92, 194, 211, 172, 98, 145, 149, 228, 121, 231, 200, 55, 109, 141, 213, 78, 169, 108, 86, 244, 234, 101, 122, 174, 8, 186, 120, 37, 46, 28, 166, 180, 198, 232, 221, 116, 31, 75, 189, 139, 138, 112, 62, 181, 102, 72, 3, 246, 14, 97, 53, 87, 185, 134, 193, 29, 158, 225, 248, 152, 17, 105, 217, 142, 148, 155, 30, 135, 233, 206, 85, 40, 223, 140, 161, 137, 13, 191, 230, 66, 104, 65, 153, 45, 15, 176, 84, 187, 22,
])

const INV_SBOX = new Uint8Array(256)
const MUL2 = new Uint8Array(256)
const MUL3 = new Uint8Array(256)
const MUL9 = new Uint8Array(256)
const MUL11 = new Uint8Array(256)
const MUL13 = new Uint8Array(256)
const MUL14 = new Uint8Array(256)

function xtime(a: number) {
  return ((a << 1) ^ ((a & 0x80) ? 0x1b : 0)) & 0xff
}

for (let i = 0; i < 256; i++) {
  INV_SBOX[SBOX[i]] = i
  MUL2[i] = xtime(i)
  MUL3[i] = MUL2[i] ^ i
  const x2 = MUL2[i]
  const x4 = xtime(x2)
  const x8 = xtime(x4)
  MUL9[i] = x8 ^ i
  MUL11[i] = x8 ^ x2 ^ i
  MUL13[i] = x8 ^ x4 ^ i
  MUL14[i] = x8 ^ x4 ^ x2
}

const RCON = [0x00, 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36]

function expandKey(key: Uint8Array) {
  const w = new Uint8Array(176)
  w.set(key)
  for (let i = 16, r = 1; i < 176; i += 4) {
    let t0 = w[i - 4], t1 = w[i - 3], t2 = w[i - 2], t3 = w[i - 1]
    if (i % 16 === 0) {
      const k0 = t0
      t0 = SBOX[t1] ^ RCON[r++]
      t1 = SBOX[t2]
      t2 = SBOX[t3]
      t3 = SBOX[k0]
    }
    w[i] = w[i - 16] ^ t0
    w[i + 1] = w[i - 15] ^ t1
    w[i + 2] = w[i - 14] ^ t2
    w[i + 3] = w[i - 13] ^ t3
  }
  return w
}

let roundKey: Uint8Array | null = null

function getRoundKey() {
  if (!roundKey) {
    roundKey = expandKey(new TextEncoder().encode(resolveKey()))
  }
  return roundKey
}

function addRoundKey(s: Uint8Array, off: number) {
  const rk = getRoundKey()
  for (let i = 0; i < 16; i++) s[i] ^= rk[off + i]
}

function subBytes(s: Uint8Array, box: Uint8Array) {
  for (let i = 0; i < 16; i++) s[i] = box[s[i]]
}

function shiftRows(s: Uint8Array) {
  let t = s[1]; s[1] = s[5]; s[5] = s[9]; s[9] = s[13]; s[13] = t
  t = s[2]; s[2] = s[10]; s[10] = t
  t = s[6]; s[6] = s[14]; s[14] = t
  t = s[15]; s[15] = s[11]; s[11] = s[7]; s[7] = s[3]; s[3] = t
}

function invShiftRows(s: Uint8Array) {
  let t = s[13]; s[13] = s[9]; s[9] = s[5]; s[5] = s[1]; s[1] = t
  t = s[2]; s[2] = s[10]; s[10] = t
  t = s[6]; s[6] = s[14]; s[14] = t
  t = s[3]; s[3] = s[7]; s[7] = s[11]; s[11] = s[15]; s[15] = t
}

function mixColumns(s: Uint8Array) {
  for (let i = 0; i < 16; i += 4) {
    const a = s[i], b = s[i + 1], c = s[i + 2], d = s[i + 3]
    s[i] = MUL2[a] ^ MUL3[b] ^ c ^ d
    s[i + 1] = a ^ MUL2[b] ^ MUL3[c] ^ d
    s[i + 2] = a ^ b ^ MUL2[c] ^ MUL3[d]
    s[i + 3] = MUL3[a] ^ b ^ c ^ MUL2[d]
  }
}

function invMixColumns(s: Uint8Array) {
  for (let i = 0; i < 16; i += 4) {
    const a = s[i], b = s[i + 1], c = s[i + 2], d = s[i + 3]
    s[i] = MUL14[a] ^ MUL11[b] ^ MUL13[c] ^ MUL9[d]
    s[i + 1] = MUL9[a] ^ MUL14[b] ^ MUL11[c] ^ MUL13[d]
    s[i + 2] = MUL13[a] ^ MUL9[b] ^ MUL14[c] ^ MUL11[d]
    s[i + 3] = MUL11[a] ^ MUL13[b] ^ MUL9[c] ^ MUL14[d]
  }
}

function decryptBlock(input: Uint8Array, out: Uint8Array, pos: number) {
  const s = input.subarray(pos, pos + 16).slice()
  addRoundKey(s, 160)
  for (let r = 9; r >= 1; r--) {
    invShiftRows(s)
    subBytes(s, INV_SBOX)
    addRoundKey(s, r * 16)
    invMixColumns(s)
  }
  invShiftRows(s)
  subBytes(s, INV_SBOX)
  addRoundKey(s, 0)
  out.set(s, pos)
}

export function isEncryptedMedia(url?: string) {
  if (!url) return false
  const path = url.split(/[?#]/)[0].toLowerCase()
  // 统一存储会把「照片.bnc」洗成对象名 bnc（没有点），也要当密文解。
  return path.endsWith('.bnc') || path.endsWith('.ceb') || /(?:^|\/)(?:bnc|ceb)$/.test(path)
}

function looksLikePlainImage(url?: string) {
  if (!url) return false
  return /\.(jpe?g|png|gif|webp)(\?|$)/i.test(url)
}

function isMinioObjectUrl(url: string) {
  return /:19000\//.test(url) ||
    url.includes('host.docker.internal') ||
    url.includes('/my-media/') ||
    url.includes('/my-storage/')
}

export function fetchMediaUrl(url: string) {
  if (isMinioObjectUrl(url) && isEncryptedMedia(url)) {
    return `/front/v1/media/object?u=${encodeURIComponent(url)}`
  }
  return url
}

function sniffType(b: Uint8Array) {
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8) return 'image/jpeg'
  if (b.length >= 4 && b[0] === 0x89 && b[1] === 0x50) return 'image/png'
  if (b.length >= 3 && b[0] === 0x47 && b[1] === 0x49) return 'image/gif'
  if (b.length >= 12 && b[0] === 0x52 && b[8] === 0x57) return 'image/webp'
  return 'image/jpeg'
}

export function decryptBnc(buf: ArrayBuffer) {
  const src = new Uint8Array(buf)
  if (src.length === 0 || src.length % 16 !== 0) {
    throw new Error('密文长度无效')
  }
  const out = new Uint8Array(src.length)
  for (let i = 0; i < src.length; i += 16) {
    decryptBlock(src, out, i)
  }
  const pad = out[out.length - 1]
  if (pad === 0 || pad > 16 || pad > out.length) {
    throw new Error('填充无效')
  }
  for (let i = out.length - pad; i < out.length; i++) {
    if (out[i] !== pad) throw new Error('填充无效')
  }
  return out.subarray(0, out.length - pad)
}

const blobCache = new Map<string, string>()

export async function resolveMediaSrc(url?: string) {
  if (!url) return ''
  if (url.startsWith('blob:') || url.startsWith('data:')) return url
  if (looksLikePlainImage(url) && !isEncryptedMedia(url)) return url
  if (!isEncryptedMedia(url)) return url
  const hit = blobCache.get(url)
  if (hit) return hit
  const res = await fetch(fetchMediaUrl(url))
  if (!res.ok) throw new Error('图片加载失败')
  const plain = decryptBnc(await res.arrayBuffer())
  const blob = new Blob([plain], { type: sniffType(plain) })
  const obj = URL.createObjectURL(blob)
  blobCache.set(url, obj)
  return obj
}
