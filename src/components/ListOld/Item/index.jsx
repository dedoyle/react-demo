import React from 'react'
import PropTypes from 'prop-types'

class Item extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      isRead: false,
    }
  }
  render() {
    return (
      <li>
        <span>{this.props.data.name}</span>
        {!this.state.isRead && (
          <span
            onClick={() =>
              this.setState({
                isRead: true,
              })
            }
          >
            标记已读
          </span>
        )}
      </li>
    )
  }
}

Item.propTypes = {
  data: PropTypes.object,
}

export default Item
