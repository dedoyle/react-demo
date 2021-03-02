import React from 'react'
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

class ListOld extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      list: [],
    }
  }

  componentDidMount() {
    getList().then((data) => {
      this.setState({
        list: data,
      })
    })
  }

  render() {
    console.log('list render')
    return (
      <ul>
        {this.state.list.map((item) => (
          <Item key={item.id} data={item} />
        ))}
      </ul>
    )
  }
}

// List.defaultProps = {
// }

// List.propTypes = {
//   : PropTypes.
// }

export default ListOld
