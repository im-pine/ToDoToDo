import TodoModalCore from '@/components/todoModal/_core'

describe('TodoModalCore - 초기 상태', () => {
  test('스택이 비어 있으면 닫힌 상태다', () => {
    const nav = new TodoModalCore()

    expect(nav.opened).toBe(false)
    expect(nav.currentId).toBeNull()
    expect(nav.canGoBack).toBe(false)
    expect(nav.canGoForward).toBe(false)
  })
})

describe('TodoModalCore - depth 탐색', () => {
  test('reset으로 열면 depth 1, 뒤로갈 곳이 없다', () => {
    const nav = new TodoModalCore().reset(1)

    expect(nav.opened).toBe(true)
    expect(nav.currentId).toBe(1)
    expect(nav.depth).toBe(1)
    expect(nav.canGoBack).toBe(false)
  })

  test('하위로 들어가면 depth가 쌓이고 뒤로가기가 열린다', () => {
    const nav = new TodoModalCore().reset(1).push(2).push(3)

    expect(nav.currentId).toBe(3)
    expect(nav.depth).toBe(3)
    expect(nav.canGoBack).toBe(true)
  })

  test('뒤로가기는 타고 들어온 경로를 그대로 되짚는다', () => {
    const nav = new TodoModalCore().reset(1).push(2).push(3).pop()

    expect(nav.currentId).toBe(2)
    expect(nav.pop().currentId).toBe(1)
  })

  test('최상위에서는 더 이상 뒤로 가지 않는다', () => {
    const nav = new TodoModalCore().reset(1).pop()

    expect(nav.currentId).toBe(1)
    expect(nav.depth).toBe(1)
  })

  test('같은 id를 다시 눌러도 스택이 쌓이지 않는다', () => {
    const nav = new TodoModalCore().reset(1).push(1)

    expect(nav.depth).toBe(1)
  })

  test('reset은 기존 스택을 버린다', () => {
    const nav = new TodoModalCore().reset(1).push(2).push(3).reset(9)

    expect(nav.currentId).toBe(9)
    expect(nav.depth).toBe(1)
    expect(nav.canGoBack).toBe(false)
  })

  test('clear는 모달을 닫는다', () => {
    const nav = new TodoModalCore().reset(1).push(2).clear()

    expect(nav.opened).toBe(false)
    expect(nav.currentId).toBeNull()
  })
})

describe('TodoModalCore - 앞으로가기', () => {
  test('뒤로 간 뒤에는 앞으로 갈 수 있다', () => {
    const nav = new TodoModalCore().reset(1).push(2).pop()

    expect(nav.canGoForward).toBe(true)
    expect(nav.forward().currentId).toBe(2)
  })

  test('새 경로로 진입하면 앞으로가기 기록이 사라진다', () => {
    const nav = new TodoModalCore().reset(1).push(2).pop().push(3)

    expect(nav.canGoForward).toBe(false)
  })

  test('여러 단계를 되짚어 올라갔다가 그대로 돌아올 수 있다', () => {
    const nav = new TodoModalCore().reset(1).push(2).push(3).pop().pop()

    expect(nav.currentId).toBe(1)
    expect(nav.forward().currentId).toBe(2)
    expect(nav.forward().forward().currentId).toBe(3)
  })
})

describe('TodoModalCore - 불변성', () => {
  test('조작은 원본을 바꾸지 않고 새 인스턴스를 돌려준다', () => {
    const nav = new TodoModalCore().reset(1)
    const next = nav.push(2)

    expect(nav.currentId).toBe(1)
    expect(next.currentId).toBe(2)
    expect(next).not.toBe(nav)
  })
})
