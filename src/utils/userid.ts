import { encodeId } from '@/utils/idcrypt'

/** 与 dm-php UserService::ENCODE_STR / encodeUserId 一致（账号绑定兜底）。 */
const ENCODE_STR = 'SCUWDG3HE859QA4B1NOPIV67XLYFJ2RZTKM'

/** 数字 id → dm 风格短码。前台展示请用 encodeId / publicUid。 */
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

/** 展示/邀请用编号：加密串，不露数字主键。 */
export function publicUid(user?: { id?: number; username?: string } | null) {
  return encodeId(user?.id)
}
