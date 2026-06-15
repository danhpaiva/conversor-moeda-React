export type CurrencyCode = 'USD' | 'BRL' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD' | 'CHF'

export interface CurrencyOption {
  code: CurrencyCode
  name: string
  symbol: string
  flag: string
}

export const CURRENCIES: CurrencyOption[] = [
  { code: 'BRL', name: 'Real Brasileiro', symbol: 'R$', flag: '🇧🇷' },
  { code: 'USD', name: 'Dólar Americano', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'GBP', name: 'Libra Esterlina', symbol: '£', flag: '🇬🇧' },
  { code: 'JPY', name: 'Iene Japonês', symbol: '¥', flag: '🇯🇵' },
  { code: 'CAD', name: 'Dólar Canadense', symbol: 'C$', flag: '🇨🇦' },
  { code: 'AUD', name: 'Dólar Australiano', symbol: 'A$', flag: '🇦🇺' },
  { code: 'CHF', name: 'Franco Suíço', symbol: 'Fr', flag: '🇨🇭' },
]

export interface ConversionResult {
  rate: number
  convertedAmount: number
  timestamp: Date
}

export type ConversionStatus = 'idle' | 'loading' | 'success' | 'error'
