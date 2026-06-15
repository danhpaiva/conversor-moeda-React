import { Conversor } from './components/Conversor/Conversor'
import styles from './App.module.css'

const PILLS = [
  { icon: '🌍', label: '8 moedas' },
  { icon: '⚡', label: 'Tempo real' },
  { icon: '🔒', label: 'Sem cadastro' },
  { icon: '🌙', label: 'Dark mode' },
]

export default function App() {
  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>Câmbio online</p>
          <h1 className={styles.title}>Conversor de Moedas</h1>
          <p className={styles.subtitle}>
            Cotações diárias via múltiplas fontes abertas,<br className={styles.br} />
            sem cadastro e sem limites.
          </p>
          <ul className={styles.pills} aria-label="Destaques">
            {PILLS.map(({ icon, label }) => (
              <li key={label} className={styles.pill}>
                <span aria-hidden="true">{icon}</span> {label}
              </li>
            ))}
          </ul>
        </header>

        <main className={styles.main}>
          <div className={styles.glow} aria-hidden="true" />
          <Conversor defaultFrom="USD" defaultTo="BRL" />
        </main>
      </div>

      <footer className={styles.footer}>
        <p>
          Dados fornecidos pela{' '}
          <a
            href="https://github.com/fawazahmed0/exchange-api"
            target="_blank"
            rel="noopener noreferrer"
          >
            Exchange API
          </a>{' '}
          · Gratuita · Sem cadastro
        </p>
      </footer>
    </div>
  )
}
