import React from 'react'
import Logo from './logo.svg'
import styles from './App.less'
console.log(styles)

function App() {
  return (
    <div className={styles.App}>
      {/* <Header name="typescript" color="#333" /> */}
      <header className={styles.header}>
        <Logo className={styles.logo} />
        <p className="primary-color">
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className={styles.link}
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  )
}

export default App
