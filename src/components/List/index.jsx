import React, { useEffect, useState } from 'react'
import Item from './Item'
// import classNames from 'classnames'
// import PropTypes from 'prop-types'
// import styles from './index.module.less'

const getData = (delay, data) =>
  new Promise((resolve) => setTimeout(() => resolve(data), delay))

const getList = () => {
  const list = new Array(20).fill(1).map((item, idx) => ({
    id: idx,
    name: `item-${idx}`,
  }))
  return getData(500, list)
}

const List = () => {
  const [list, setList] = useState([{ id: '30k', name: 'dong' }])

  console.log('list rerender')
  useEffect(() => {
    getList().then((data) => {
      setList(data)
    })
  }, [])

  return (
    <ul>
      {list.map((item) => (
        <Item key={item.id} data={item} />
      ))}
    </ul>
  )
}

// List.defaultProps = {
// }

// List.propTypes = {
//   : PropTypes.
// }

export default List
