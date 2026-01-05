export async function fetcher<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init)
  if (!res.ok) {
    const err = await res.json().catch(() => null)
    throw new Error(err?.message ?? 'Request failed')
  }
  return res.json()
}
