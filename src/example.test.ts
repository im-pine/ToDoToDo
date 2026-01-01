describe('Jest 기본 동작 확인', () => {
  it('1 + 2 = 3', () => {
    expect(1 + 2).toBe(3)
  })

  it('문자열 포함 여부 확인', () => {
    expect('Next.js 15 with Jest').toContain('Jest')
  })
})
