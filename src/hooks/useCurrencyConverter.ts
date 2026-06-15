import { useState, useCallback, useRef } from 'react'
import type { CurrencyCode, ConversionResult, ConversionStatus } from '../types/currency'

/**
 * fawazahmed0 Exchange API
 * - Free, no API key, no registration
 * - Hosted on jsDelivr CDN (primary) + Cloudflare Pages (fallback)
 * - Updated daily with data from multiple sources
 * - https://github.com/fawazahmed0/exchange-api
 *
 * Response shape: { date: "2024-01-01", usd: { brl: 5.12, eur: 0.91, ... } }
 */
const CDN_URL = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies'
const CF_URL = 'https://latest.currency-api.pages.dev/v1/currencies'

interface ApiResponse {
  date: string
  [currency: string]: Record<string, number> | string
}

async function fetchRate(
  from: CurrencyCode,
  to: CurrencyCode,
  signal: AbortSignal,
): Promise<number> {
  const fromLower = from.toLowerCase()
  const toLower = to.toLowerCase()

  // Try CDN first, fall back to Cloudflare Pages
  let res = await fetch(`${CDN_URL}/${fromLower}.json`, { signal }).catch(() => null)
  if (!res?.ok) {
    res = await fetch(`${CF_URL}/${fromLower}.json`, { signal })
  }

  if (!res.ok) throw new Error(`Erro na API: ${res.status}`)

  const data = (await res.json()) as ApiResponse
  const rates = data[fromLower] as Record<string, number> | undefined

  if (!rates) throw new Error('Formato de resposta inesperado')

  const rate = rates[toLower]
  if (rate === undefined) throw new Error(`Par ${from}/${to} não encontrado`)

  return rate
}

interface UseCurrencyConverterReturn {
  result: ConversionResult | null
  status: ConversionStatus
  error: string | null
  convert: (amount: number, from: CurrencyCode, to: CurrencyCode) => Promise<void>
  reset: () => void
}

export function useCurrencyConverter(): UseCurrencyConverterReturn {
  const [result, setResult] = useState<ConversionResult | null>(null)
  const [status, setStatus] = useState<ConversionStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const convert = useCallback(async (amount: number, from: CurrencyCode, to: CurrencyCode) => {
    if (from === to) {
      setResult({ rate: 1, convertedAmount: amount, timestamp: new Date() })
      setStatus('success')
      return
    }

    abortRef.current?.abort()
    abortRef.current = new AbortController()

    setStatus('loading')
    setError(null)

    try {
      const rate = await fetchRate(from, to, abortRef.current.signal)

      setResult({
        rate,
        convertedAmount: parseFloat((amount * rate).toFixed(10)),
        timestamp: new Date(),
      })
      setStatus('success')
    } catch (err) {
      if ((err as Error).name === 'AbortError') return
      setError('Não foi possível buscar a cotação. Tente novamente.')
      setStatus('error')
    }
  }, [])

  const reset = useCallback(() => {
    abortRef.current?.abort()
    setResult(null)
    setStatus('idle')
    setError(null)
  }, [])

  return { result, status, error, convert, reset }
}
