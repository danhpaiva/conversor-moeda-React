import { describe, it, expect } from 'vitest'
import { CURRENCIES } from './currency'
import type { CurrencyCode } from './currency'

describe('CURRENCIES', () => {
  it('tem exatamente 8 moedas', () => {
    expect(CURRENCIES).toHaveLength(8)
  })

  it('cada entrada possui os campos obrigatórios', () => {
    for (const currency of CURRENCIES) {
      expect(currency).toHaveProperty('code')
      expect(currency).toHaveProperty('name')
      expect(currency).toHaveProperty('symbol')
      expect(currency).toHaveProperty('flag')
      expect(currency.code).toBeTruthy()
      expect(currency.name).toBeTruthy()
      expect(currency.symbol).toBeTruthy()
      expect(currency.flag).toBeTruthy()
    }
  })

  it('todos os códigos são únicos', () => {
    const codes = CURRENCIES.map((c) => c.code)
    const unique = new Set(codes)
    expect(unique.size).toBe(codes.length)
  })

  it('contém os pares de moeda esperados', () => {
    const codes = CURRENCIES.map((c) => c.code) as CurrencyCode[]
    const expected: CurrencyCode[] = ['BRL', 'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF']
    for (const code of expected) {
      expect(codes).toContain(code)
    }
  })

  it('BRL possui metadados corretos', () => {
    const brl = CURRENCIES.find((c) => c.code === 'BRL')
    expect(brl).toBeDefined()
    expect(brl?.symbol).toBe('R$')
    expect(brl?.name).toBe('Real Brasileiro')
    expect(brl?.flag).toBe('🇧🇷')
  })

  it('USD possui metadados corretos', () => {
    const usd = CURRENCIES.find((c) => c.code === 'USD')
    expect(usd).toBeDefined()
    expect(usd?.symbol).toBe('$')
    expect(usd?.name).toBe('Dólar Americano')
  })

  it('EUR possui metadados corretos', () => {
    const eur = CURRENCIES.find((c) => c.code === 'EUR')
    expect(eur?.symbol).toBe('€')
  })

  it('JPY possui metadados corretos', () => {
    const jpy = CURRENCIES.find((c) => c.code === 'JPY')
    expect(jpy?.symbol).toBe('¥')
  })
})
