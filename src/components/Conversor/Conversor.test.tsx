import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { Conversor } from './Conversor'

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeRateResponse(from: string, to: string, rate: number): Response {
  return {
    ok: true,
    json: () =>
      Promise.resolve({ date: '2024-01-01', [from.toLowerCase()]: { [to.toLowerCase()]: rate } }),
  } as Response
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Conversor', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  // Renderização
  describe('renderização', () => {
    it('renderiza com props padrão USD → BRL', () => {
      render(<Conversor />)
      expect(screen.getByRole('article', { name: /USD para BRL/i })).toBeInTheDocument()
    })

    it('renderiza com props customizadas EUR → GBP', () => {
      render(<Conversor defaultFrom="EUR" defaultTo="GBP" />)
      expect(screen.getByRole('article', { name: /EUR para GBP/i })).toBeInTheDocument()
    })

    it('exibe o símbolo da moeda de origem no input', () => {
      render(<Conversor defaultFrom="USD" defaultTo="BRL" />)
      expect(screen.getByText('$')).toBeInTheDocument()
    })

    it('exibe o símbolo correto ao usar EUR', () => {
      render(<Conversor defaultFrom="EUR" defaultTo="BRL" />)
      expect(screen.getByText('€')).toBeInTheDocument()
    })

    it('renderiza o placeholder no campo de valor', () => {
      render(<Conversor />)
      expect(screen.getByPlaceholderText('0,00')).toBeInTheDocument()
    })

    it('exibe o botão Converter', () => {
      render(<Conversor />)
      expect(screen.getByRole('button', { name: /converter/i })).toBeInTheDocument()
    })

    it('exibe o botão de inverter moedas', () => {
      render(<Conversor />)
      expect(screen.getByRole('button', { name: /inverter moedas/i })).toBeInTheDocument()
    })
  })

  // Estado do botão Converter
  describe('botão Converter', () => {
    it('fica desabilitado quando o campo está vazio', () => {
      render(<Conversor />)
      expect(screen.getByRole('button', { name: /converter/i })).toBeDisabled()
    })

    it('fica habilitado ao digitar um valor', async () => {
      const user = userEvent.setup()
      render(<Conversor />)
      await user.type(screen.getByPlaceholderText('0,00'), '100')
      expect(screen.getByRole('button', { name: /converter/i })).toBeEnabled()
    })
  })

  // Botão de inverter
  describe('botão inverter (⇄)', () => {
    it('troca o par de moedas ao clicar', async () => {
      const user = userEvent.setup()
      render(<Conversor defaultFrom="USD" defaultTo="BRL" />)

      await user.click(screen.getByRole('button', { name: /inverter moedas/i }))

      expect(screen.getByRole('article', { name: /BRL para USD/i })).toBeInTheDocument()
    })

    it('troca o símbolo da moeda exibido no input', async () => {
      const user = userEvent.setup()
      render(<Conversor defaultFrom="USD" defaultTo="BRL" />)
      expect(screen.getByText('$')).toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: /inverter moedas/i }))

      expect(screen.getByText('R$')).toBeInTheDocument()
    })
  })

  // Loading state
  describe('estado de loading', () => {
    it('exibe spinner enquanto a requisição está em andamento', async () => {
      let resolveFetch!: (r: Response) => void
      vi.spyOn(global, 'fetch').mockReturnValue(
        new Promise<Response>((r) => {
          resolveFetch = r
        }),
      )

      const user = userEvent.setup()
      render(<Conversor defaultFrom="USD" defaultTo="BRL" />)

      await user.type(screen.getByPlaceholderText('0,00'), '100')
      await user.click(screen.getByRole('button', { name: /converter/i }))

      // While loading, the button's accessible name becomes "Carregando" (from the spinner's aria-label)
      const loadingBtn = screen.getByRole('button', { name: /carregando/i })
      expect(loadingBtn).toBeDisabled()
      expect(loadingBtn).toHaveAttribute('aria-busy', 'true')

      // Cleanup — resolve to avoid dangling promises
      resolveFetch({ ok: false, status: 500 } as Response)
    })
  })

  // Resultado bem-sucedido
  describe('resultado de conversão', () => {
    it('exibe o valor convertido após sucesso', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(makeRateResponse('usd', 'brl', 5.0))

      const user = userEvent.setup()
      render(<Conversor defaultFrom="USD" defaultTo="BRL" />)

      await user.type(screen.getByPlaceholderText('0,00'), '100')
      await user.click(screen.getByRole('button', { name: /converter/i }))

      await waitFor(() => {
        expect(screen.getByRole('status')).toBeInTheDocument()
      })
    })

    it('exibe a taxa unitária no formato correto', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(makeRateResponse('usd', 'brl', 5.25))

      const user = userEvent.setup()
      render(<Conversor defaultFrom="USD" defaultTo="BRL" />)

      await user.type(screen.getByPlaceholderText('0,00'), '1')
      await user.click(screen.getByRole('button', { name: /converter/i }))

      await waitFor(() => {
        expect(screen.getByText(/1 USD = 5\.2500 BRL/i)).toBeInTheDocument()
      })
    })

    it('exibe a hora da cotação', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(makeRateResponse('usd', 'brl', 5.0))

      const user = userEvent.setup()
      render(<Conversor defaultFrom="USD" defaultTo="BRL" />)

      await user.type(screen.getByPlaceholderText('0,00'), '1')
      await user.click(screen.getByRole('button', { name: /converter/i }))

      await waitFor(() => {
        expect(screen.getByText(/cotação de/i)).toBeInTheDocument()
      })
    })

    it('esconde o resultado ao digitar no campo novamente', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(makeRateResponse('usd', 'brl', 5.0))

      const user = userEvent.setup()
      render(<Conversor defaultFrom="USD" defaultTo="BRL" />)

      await user.type(screen.getByPlaceholderText('0,00'), '100')
      await user.click(screen.getByRole('button', { name: /converter/i }))

      await waitFor(() => {
        expect(screen.getByRole('status')).toBeInTheDocument()
      })

      // Digitando novamente deve limpar o resultado
      await user.type(screen.getByPlaceholderText('0,00'), '5')
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })
  })

  // Erro
  describe('estado de erro', () => {
    it('exibe mensagem de erro quando o fetch falha', async () => {
      vi.spyOn(global, 'fetch')
        .mockRejectedValueOnce(new Error('network'))
        .mockResolvedValueOnce({ ok: false, status: 500 } as Response)

      const user = userEvent.setup()
      render(<Conversor defaultFrom="USD" defaultTo="BRL" />)

      await user.type(screen.getByPlaceholderText('0,00'), '100')
      await user.click(screen.getByRole('button', { name: /converter/i }))

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
      })

      expect(screen.getByRole('alert')).toHaveTextContent(/não foi possível/i)
    })

    it('esconde o erro ao inverter as moedas', async () => {
      vi.spyOn(global, 'fetch')
        .mockRejectedValueOnce(new Error('network'))
        .mockResolvedValueOnce({ ok: false, status: 500 } as Response)

      const user = userEvent.setup()
      render(<Conversor defaultFrom="USD" defaultTo="BRL" />)

      await user.type(screen.getByPlaceholderText('0,00'), '100')
      await user.click(screen.getByRole('button', { name: /converter/i }))

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /inverter moedas/i }))

      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })

  // Validação de input
  describe('validação de input', () => {
    it('não chama fetch com valor negativo', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch')
      const user = userEvent.setup()
      render(<Conversor />)

      await user.type(screen.getByPlaceholderText('0,00'), '-50')
      const btn = screen.getByRole('button', { name: /converter/i })
      if (!btn.hasAttribute('disabled')) {
        await user.click(btn)
      }

      expect(fetchSpy).not.toHaveBeenCalled()
    })

    it('aceita vírgula como separador decimal', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(makeRateResponse('usd', 'brl', 5.0))

      const user = userEvent.setup()
      render(<Conversor defaultFrom="USD" defaultTo="BRL" />)

      await user.type(screen.getByPlaceholderText('0,00'), '1,5')
      await user.click(screen.getByRole('button', { name: /converter/i }))

      await waitFor(() => {
        expect(screen.getByRole('status')).toBeInTheDocument()
      })
    })
  })
})
