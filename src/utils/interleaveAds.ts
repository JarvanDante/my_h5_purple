/** 每三行的中间一行（第 2 行）末格放 1 条广告，位置固定。 */
export function interleaveAds<T>(items: T[], ads: T[], cols: number): T[] {
  if (!items.length || cols < 2) return items
  const out: T[] = []
  let i = 0
  let a = 0
  let row = 0
  while (i < items.length) {
    const adRow = row % 3 === 1
    for (let col = 0; col < cols; col++) {
      if (adRow && col === cols - 1 && ads.length) {
        out.push(ads[a % ads.length])
        a += 1
        continue
      }
      if (i >= items.length) break
      out.push(items[i])
      i += 1
    }
    row += 1
  }
  return out
}

export function makeEmptyAds(count: number) {
  return Array.from({ length: Math.max(count, 0) }, (_, i) => ({
    id: `slot-${i}`,
    title: '',
    cover: '',
    isAd: true as const,
    mosaic: false as const,
    tone: 0,
  }))
}

/** 每 3C-1 条内容对应 1 条广告位。 */
export function estimateAdCount(itemCount: number, cols: number): number {
  if (itemCount <= cols || cols < 2) return 0
  return Math.ceil(itemCount / (cols * 3 - 1))
}
