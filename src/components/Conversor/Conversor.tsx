import { useState, useId } from 'react'
import { useCurrencyConverter } from '../../hooks/useCurrencyConverter'
import { CURRENCIES } from '../../types/currency'
import type { CurrencyCode } from '../../types/currency'
import styles from './Conversor.module.css'

interface ConversorProps {
  defaultFrom?: CurrencyCode
  defaultTo?: CurrencyCode
}

const CURRENCY_MAP = Object.fromEntries(CURRENCIES.map((c) => [c.code, c])) as Record<
  CurrencyCode,
  (typeof CURRENCIES)[number]
>

function formatCurrency(amount: number, code: CurrencyCode): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: code,
    maximumFractionDigits: code === 'JPY' ? 0 : 2,
  }).format(amount)
}

export function Conversor({ defaultFrom = 'USD', defaultTo = 'BRL' }: ConversorProps) {
  const id = useId()
  const [amount, setAmount] = useState('')
  const [from, setFrom] = useState<CurrencyCode>(defaultFrom)
  const [to, setTo] = useState<CurrencyCode>(defaultTo)
  const { result, status, error, convert, reset } = useCurrencyConverter()

  const handleSwap = () => {
    setFrom(to)
    setTo(from)
    reset()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const parsed = parseFloat(amount.replace(',', '.'))
    if (isNaN(parsed) || parsed <= 0) return
    convert(parsed, from, to)
  }

  const fromCurrency = CURRENCY_MAP[from]
  const toCurrency = CURRENCY_MAP[to]

  return (
    <article className={styles.card} aria-label={`Conversor de ${from} para ${to}`}>
      <form onSubmit={handleSubmit} noValidate>
        {/* Amount input */}
        <div className={styles.field}>
          <label htmlFor={`${id}-amount`} className={styles.label}>
            Valor
          </label>
          <div className={styles.inputRow}>
            <span className={styles.symbol}>{fromCurrency.symbol}</span>
            <input
              id={`${id}-amount`}
              type="text"
              inputMode="decimal"
              className={styles.input}
              placeholder="0,00"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value)
                reset()
              }}
              aria-label={`Valor em ${fromCurrency.name}`}
            />
          </div>
        </div>

        {/* Currency selectors */}
        <div className={styles.selectors}>
          <div className={styles.field}>
            <label htmlFor={`${id}-from`} className={styles.label}>
              De
            </label>
            <div className={styles.selectWrapper}>
              <span className={styles.flag}>{fromCurrency.flag}</span>
              <select
                id={`${id}-from`}
                className={styles.select}
                value={from}
                onChange={(e) => {
                  setFrom(e.target.value as CurrencyCode)
                  reset()
                }}
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} — {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="button"
            className={styles.swapButton}
            onClick={handleSwap}
            aria-label="Inverter moedas"
            title="Inverter moedas"
          >
            ⇄
          </button>

          <div className={styles.field}>
            <label htmlFor={`${id}-to`} className={styles.label}>
              Para
            </label>
            <div className={styles.selectWrapper}>
              <span className={styles.flag}>{toCurrency.flag}</span>
              <select
                id={`${id}-to`}
                className={styles.select}
                value={to}
                onChange={(e) => {
                  setTo(e.target.value as CurrencyCode)
                  reset()
                }}
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} — {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className={styles.convertButton}
          disabled={status === 'loading' || !amount}
          aria-busy={status === 'loading'}
        >
          {status === 'loading' ? (
            <span className={styles.spinner} aria-label="Carregando" />
          ) : (
            'Converter'
          )}
        </button>
      </form>

      {/* Result */}
      {status === 'success' && result && (
        <div className={styles.result} role="status" aria-live="polite">
          <p className={styles.resultAmount}>{formatCurrency(result.convertedAmount, to)}</p>
          <p className={styles.resultRate}>
            1 {from} = {result.rate.toFixed(4)} {to}
          </p>
          <p className={styles.resultDate}>
            Cotação de {result.timestamp.toLocaleTimeString('pt-BR')}
          </p>
        </div>
      )}

      {status === 'error' && error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </article>
  )
}
