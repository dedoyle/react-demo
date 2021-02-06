import React, {useState} from 'react'
import Logo from './logo.svg'
import styles from './App.less'
import wukong from './imgs/wukong.jpg'
import smallJpg from './imgs/5kb.jpg'

const getData = (delay, data) =>
  new Promise((resolve) => setTimeout(() => resolve(data), delay))

const getList = () => {
  const list = new Array(20).fill(1).map((item, idx) => ({
    id: idx,
    name: `item-${idx}`,
  }))
  console.log(list)
  return getData(500, list)
}

function App() {
  const [list, setList] = useState([{id: '30k', name: 'dong'}])
  return (
    <div className={styles.App}>
      {/* <Header name="typescript" color="#333" /> */}
      <header className={styles.header}>
        <Logo className={styles.logo} />
        <img src={wukong} alt="wukong"/>
        <img src={smallJpg} alt="smalljpg"/>
        <button
          onClick={() =>
            getList().then((data) => {
              console.log(data)
              setList(data)
            })
          }
        >
          加载列表
        </button>
        <ul>
          {list.map((item) => (
            <li key={item.id}>{item.name}</li>
          ))}
        </ul>
      </header>
    </div>
  )
}

export default App
