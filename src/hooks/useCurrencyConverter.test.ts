import { renderHook, act } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { useCurrencyConverter } from './useCurrencyConverter'

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeResponse(data: unknown, ok = true): Response {
  return {
    ok,
    status: ok ? 200 : 500,
    json: () => Promise.resolve(data),
  } as Response
}

function makeRateResponse(from: string, to: string, rate: number) {
  return makeResponse({ date: '2024-01-01', [from.toLowerCase()]: { [to.toLowerCase()]: rate } })
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useCurrencyConverter', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  // Estado inicial
  describe('estado inicial', () => {
    it('começa em idle com result e error nulos', () => {
      const { result } = renderHook(() => useCurrencyConverter())
      expect(result.current.status).toBe('idle')
      expect(result.current.result).toBeNull()
      expect(result.current.error).toBeNull()
    })
  })

  // Mesma moeda
  describe('conversão com mesma moeda', () => {
    it('retorna taxa 1 sem chamar fetch', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch')
      const { result } = renderHook(() => useCurrencyConverter())

      await act(async () => {
        await result.current.convert(100, 'USD', 'USD')
      })

      expect(result.current.status).toBe('success')
      expect(result.current.result?.rate).toBe(1)
      expect(result.current.result?.convertedAmount).toBe(100)
      expect(fetchSpy).not.toHaveBeenCalled()
    })

    it('funciona com qualquer moeda igual', async () => {
      vi.spyOn(globalThis, 'fetch')
      const { result } = renderHook(() => useCurrencyConverter())

      await act(async () => {
        await result.current.convert(250, 'BRL', 'BRL')
      })

      expect(result.current.result?.convertedAmount).toBe(250)
    })
  })

  // Sucesso com CDN
  describe('conversão bem-sucedida via CDN', () => {
    it('busca cotação e calcula valor convertido', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(makeRateResponse('usd', 'brl', 5.25))
      const { result } = renderHook(() => useCurrencyConverter())

      await act(async () => {
        await result.current.convert(100, 'USD', 'BRL')
      })

      expect(result.current.status).toBe('success')
      expect(result.current.result?.rate).toBe(5.25)
      expect(result.current.result?.convertedAmount).toBe(525)
    })

    it('resultado inclui um timestamp do tipo Date', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(makeRateResponse('usd', 'brl', 5.0))
      const { result } = renderHook(() => useCurrencyConverter())

      await act(async () => {
        await result.current.convert(1, 'USD', 'BRL')
      })

      expect(result.current.result?.timestamp).toBeInstanceOf(Date)
    })

    it('chama a URL do CDN com o código da moeda em minúsculas', async () => {
      const fetchSpy = vi
        .spyOn(global, 'fetch')
        .mockResolvedValue(makeRateResponse('eur', 'gbp', 0.86))
      const { result } = renderHook(() => useCurrencyConverter())

      await act(async () => {
        await result.current.convert(1, 'EUR', 'GBP')
      })

      expect(fetchSpy.mock.calls[0][0]).toContain('/eur.json')
    })
  })

  // Fallback CDN → Cloudflare
  describe('fallback para Cloudflare quando CDN falha', () => {
    it('tenta CDN primeiro, depois Cloudflare', async () => {
      const fetchSpy = vi
        .spyOn(global, 'fetch')
        .mockRejectedValueOnce(new Error('CDN offline'))
        .mockResolvedValueOnce(makeRateResponse('usd', 'brl', 5.30))
      const { result } = renderHook(() => useCurrencyConverter())

      await act(async () => {
        await result.current.convert(1, 'USD', 'BRL')
      })

      expect(result.current.status).toBe('success')
      expect(result.current.result?.rate).toBe(5.30)
      expect(fetchSpy).toHaveBeenCalledTimes(2)
      expect(String(fetchSpy.mock.calls[0][0])).toContain('jsdelivr')
      expect(String(fetchSpy.mock.calls[1][0])).toContain('currency-api.pages.dev')
    })
  })

  // Erro
  describe('tratamento de erro', () => {
    it('define status error quando CDN retorna status não-ok', async () => {
      vi.spyOn(globalThis, 'fetch')
        .mockRejectedValueOnce(new Error('offline'))
        .mockResolvedValueOnce(makeResponse({}, false))
      const { result } = renderHook(() => useCurrencyConverter())

      await act(async () => {
        await result.current.convert(1, 'USD', 'BRL')
      })

      expect(result.current.status).toBe('error')
      expect(result.current.error).toBeTruthy()
    })

    it('não define error para AbortError (requisição cancelada)', async () => {
      const abortError = new DOMException('Aborted', 'AbortError')
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(abortError)
      const { result } = renderHook(() => useCurrencyConverter())

      await act(async () => {
        await result.current.convert(1, 'USD', 'BRL')
      })

      // AbortError é silenciado — estado não muda para error
      expect(result.current.status).not.toBe('error')
    })
  })

  // Estado de loading
  describe('estado de loading', () => {
    it('fica em loading enquanto a requisição está em andamento', async () => {
      let resolveFetch!: (r: Response) => void
      vi.spyOn(globalThis, 'fetch').mockReturnValue(
        new Promise<Response>((resolve) => {
          resolveFetch = resolve
        }),
      )
      const { result } = renderHook(() => useCurrencyConverter())

      act(() => {
        result.current.convert(100, 'USD', 'BRL')
      })

      expect(result.current.status).toBe('loading')

      await act(async () => {
        resolveFetch(makeRateResponse('usd', 'brl', 5.0))
      })

      expect(result.current.status).toBe('success')
    })
  })

  // Reset
  describe('reset', () => {
    it('limpa result, error e volta para idle', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(makeRateResponse('usd', 'brl', 5.0))
      const { result } = renderHook(() => useCurrencyConverter())

      await act(async () => {
        await result.current.convert(100, 'USD', 'BRL')
      })
      expect(result.current.status).toBe('success')

      act(() => {
        result.current.reset()
      })

      expect(result.current.status).toBe('idle')
      expect(result.current.result).toBeNull()
      expect(result.current.error).toBeNull()
    })

    it('cancela requisição em andamento ao resetar', () => {
      let resolveFetch!: (r: Response) => void
      vi.spyOn(globalThis, 'fetch').mockReturnValue(
        new Promise<Response>((resolve) => {
          resolveFetch = resolve
        }),
      )
      const { result } = renderHook(() => useCurrencyConverter())

      act(() => {
        result.current.convert(100, 'USD', 'BRL')
      })

      act(() => {
        result.current.reset()
      })

      expect(result.current.status).toBe('idle')
      // Resolve the promise after reset — should not change state
      resolveFetch(makeRateResponse('usd', 'brl', 5.0))
    })
  })
})
