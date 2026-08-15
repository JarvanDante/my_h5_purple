/** 与 dm-php UserService::ENCODE_STR / encodeUserId 一致。 */
const ENCODE_STR = 'SCUWDG3HE859QA4B1NOPIV67XLYFJ2RZTKM'

/** 数字 id → 前台「编号」(不是数据库主键)。 */
export function encodeUserId(userId?: number) {
  if (!userId || userId <= 0) return ''
  const sLength = ENCODE_STR.length
  let num = Math.floor(userId)
  let code = ''
  while (num > 0) {
    const mod = num % sLength
    num = (num - mod) / sLength
    code = ENCODE_STR[mod] + code
  }
  if (code.length < 4) {
    code = code.padStart(4, '0')
  }
  return code
}

/** 展示用编号: 优先接口 username; 旧账号仍是 device_* 时本地按 id 编码。 */
export function publicUid(user?: { id?: number; username?: string } | null) {
  const name = (user?.username || '').trim()
  if (name && !name.startsWith('device_')) return name
  return encodeUserId(user?.id)
}
