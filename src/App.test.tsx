import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from './App.tsx'

describe('App', () => {
  it('renderiza o título principal', () => {
    render(<App />)
    expect(
      screen.getByRole('heading', { name: /conversor de moedas/i }),
    ).toBeInTheDocument()
  })

  it('renderiza o subtítulo', () => {
    render(<App />)
    expect(screen.getByText(/cotações diárias/i)).toBeInTheDocument()
  })

  it('renderiza exatamente 4 cards de conversão', () => {
    render(<App />)
    const cards = screen.getAllByRole('article')
    expect(cards).toHaveLength(4)
  })

  it('renderiza os pares de moeda padrão', () => {
    render(<App />)
    expect(screen.getByRole('article', { name: /USD para BRL/i })).toBeInTheDocument()
    expect(screen.getByRole('article', { name: /BRL para USD/i })).toBeInTheDocument()
    expect(screen.getByRole('article', { name: /EUR para BRL/i })).toBeInTheDocument()
    expect(screen.getByRole('article', { name: /BRL para EUR/i })).toBeInTheDocument()
  })

  it('renderiza o rodapé com link para a API', () => {
    render(<App />)
    const link = screen.getByRole('link', { name: /exchange api/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', 'https://github.com/fawazahmed0/exchange-api')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('link da API abre em nova aba', () => {
    render(<App />)
    expect(screen.getByRole('link', { name: /exchange api/i })).toHaveAttribute('target', '_blank')
  })
})
