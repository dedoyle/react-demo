import React, { useState } from 'react'
import Logo from './logo.svg'
import styles from './App.less'
import wukong from './imgs/wukong.jpg'
import smallJpg from './imgs/5kb.jpg'
import List from './components/List'
// import ListOld from './components/ListOld'

function App() {
  // const [name, setName] = useState('dong')
  return (
    <div className={styles.App}>
      <header className={styles.header}>
        {/* <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        /> */}
        <div className={styles.slider}>
          <Logo className={styles.logo} />
          {/* <img src={smallJpg} alt="smalljpg" /> */}
        </div>
        {/* <List /> */}
      </header>
    </div>
  )
}

export default App
