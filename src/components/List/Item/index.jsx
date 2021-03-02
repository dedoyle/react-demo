import React, { useState } from 'react'
// import classNames from 'classnames'
// import PropTypes from 'prop-types'
// import styles from './index.module.less'

const Item = ({ data }) => {
  const [isRead, setIsRead] = useState(false)
  return (
    <li>
      <span>{data.name}</span>
      {!isRead && <span onClick={() => setIsRead(true)}>标记已读</span>}
    </li>
  )
}

// Item.defaultProps = {
// }

// Item.propTypes = {
//   : PropTypes.
// }

export default Item
