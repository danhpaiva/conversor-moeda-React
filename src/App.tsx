import { Conversor } from './components/Conversor/Conversor'
import styles from './App.module.css'

export default function App() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Conversor de Moedas</h1>
        <p className={styles.subtitle}>Cotações diárias via múltiplas fontes abertas</p>
      </header>

      <main className={styles.main}>
        <Conversor defaultFrom="USD" defaultTo="BRL" />
      </main>

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
