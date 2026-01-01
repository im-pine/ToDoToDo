'use client'

import { useEffect } from 'react'

export default function BodyAttrSniffer() {
  useEffect(() => {
    // hydration 직후 body attribute 덤프
    const attrs = document.body.getAttributeNames().sort()
    const suspicious = attrs.filter(
      (n) => n.startsWith('__') || n.includes('processed') || n.includes('inject') || n.includes('cz-') // 예: ColorZilla 케이스처럼 확장 attribute가 흔함
    )

    // 콘솔에 남겨서 범인 attribute 확인
    console.log('[BodyAttrSniffer] body attrs:', attrs)
    console.log('[BodyAttrSniffer] suspicious:', suspicious)

    // 누가 언제 추가하는지 추적 (MutationObserver)
    const prev = new Set(attrs)
    const obs = new MutationObserver(() => {
      const now = document.body.getAttributeNames()
      for (const a of now) {
        if (!prev.has(a)) {
          console.warn('[BodyAttrSniffer] NEW body attr detected:', a, document.body.getAttribute(a))
          prev.add(a)
        }
      }
    })

    obs.observe(document.body, { attributes: true })
    return () => obs.disconnect()
  }, [])

  return null
}
