import React from 'react';
import PropTypes from 'prop-types';

const styles = {
  root: {
    height: 18,
    width: 18,
    cursor: 'pointer',
    border: 0,
    padding: 0,
    background: 'transparent',
    positino: 'relative',
    zIndex: 10
  },
  dot: {
    boxSizing: 'border-box',
    backgroundColor: 'transparent',
    border: '1px solid #FF3693',
    height: 10,
    width: 10,
    borderRadius: '50%',
    display: 'inline-block',
    margin: 2.5,
  },
  
  active: {
    backgroundColor: '#FF3693',
    animation: 'backgroundAnimation 1s'
  },
};

class PaginationDot extends React.Component {
  handleClick = event => {
    this.props.onClick(event, this.props.index);
  };

  render() {
    const { active } = this.props;

    let styleDot;

    if (active) {
      styleDot = Object.assign({}, styles.dot, styles.active);
    } else {
      styleDot = styles.dot;
    }

    return (
      <button type="button" style={styles.root} onClick={this.handleClick}>
        <div style={styleDot} />
      </button>
    );
  }
}

PaginationDot.propTypes = {
  active: PropTypes.bool.isRequired,
  index: PropTypes.number.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default PaginationDot;