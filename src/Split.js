import React, { Component, Children } from 'react';

const containerStyles = {
  display: 'flex',
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%'
};

const separator = {
  position: 'absolute',
  top: 0,
  bottom: 0,
  cursor: 'col-resize',
  height: 'auto',
  width: 10,
  backgroundColor: '#f7f7f7',
  flex: '0 0 auto',
  borderLeft: '1px solid rgb(236, 236, 236)',
  borderRight: '1px solid rgb(236, 236, 236)',
  userSelect: 'text'
};

const panelStyle = {
  // width: '33.33%'
};

const startDraggingPane = index => state => ({
  ...state,
  dragging: true,
  paneDragging: index
});

const stopDragging = state => ({
  ...state,
  dragging: false,
  paneDragging: null
});

class Split extends Component {
  constructor(props) {
    super(props);
    this.state = {
      panes: {},
      dragging: false,
      paneDragging: null
    };

    for (let i = 0; i < Children.count(props.children); i++) {
      this.state.panes[i] = {
        left: 0,
        width: 0
      };
    }

    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
  }

  componentDidMount() {
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);

    const { width } = this.splitPane.getBoundingClientRect();

    const childrenCount = Children.count(this.props.children);

    console.log(width, childrenCount);

    const initialPanesWith = (width - 12 * (childrenCount - 1)) / childrenCount;

    // save current pane sizes
    this.setState(state => {
      return {
        ...state,
        panes: Object.keys(this.state.panes).reduce((acc, key, i) => {
          acc[key] = {
            width: initialPanesWith,
            left: initialPanesWith * i + i * 12
          };
          return acc;
        }, {})
      };
    });
  }

  onMouseDown(event, index) {
    this.setState(startDraggingPane(index + 1));
  }

  onMouseUp(event) {
    this.setState(stopDragging);
  }

  onMouseMove(event) {
    const { dragging, paneDragging } = this.state;

    const clientX = event.clientX;

    if (dragging === true && paneDragging !== null) {
      this.setState(state => {
        const previousPane = state.panes[paneDragging - 1];
        const currentPane = state.panes[paneDragging];

        const diff = clientX - currentPane.left;

        const newPos = {
          left: clientX,
          width: currentPane.width - diff
        };

        const newState = {
          panes: {
            ...state.panes
          }
        };

        newState.panes[paneDragging] = {
          ...currentPane,
          ...newPos
        };

        if (previousPane) {
          newState.panes[paneDragging - 1] = {
            ...previousPane,
            width: previousPane.width + diff
          };
        }

        return newState;
      });
    }
  }

  componentWillUnmount() {
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
  }

  render() {
    const ch = Children.map(this.props.children, (child, index) => {
      const pane = this.state.panes[index];

      const style = {
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: pane.width,
        left: pane.left
      };

      const res = [<div style={style}>{child}</div>];

      if (index < Children.count(this.props.children) - 1)
        return res.concat(
          <span
            style={{
              ...separator,
              left: pane.left + pane.width
            }}
            onMouseDown={e => this.onMouseDown(e, index)}
            onMouseMove={e => this.onMouseMove(e, index)}
          />
        );

      return res;
    });

    return (
      <div style={containerStyles} ref={ref => (this.splitPane = ref)}>
        {ch}
      </div>
    );
  }
}

export default Split;
