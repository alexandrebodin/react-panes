import React, { Component, Children } from 'react';

const containerStyles = {
  display: 'flex',
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
};

const separator = {
  cursor: 'col-resize',
  height: 'auto',
  width: 10,
  backgroundColor: '#f7f7f7',
  flex: '0 0 auto',
  borderLeft: '1px solid rgb(236, 236, 236)',
  borderRight: '1px solid rgb(236, 236, 236)',
};

const panelStyle = {
  flex: 1,
  // width: '33.33%'
};

const startDraggingPane = index => state => ({
  ...state,
  dragging: true,
  paneDragging: index,
});

const stopDragging = state => ({
  ...state,
  dragging: false,
  paneDragging: null,
});

const getBounds = (pane, splitPane) => {
  return {
    width: pane.getBoundingClientRect().width / splitPane.getBoundingClientRect().width * 100,
    left: pane.getBoundingClientRect().left,
    right: pane.getBoundingClientRect().right,
  };
};

class Split extends Component {
  constructor(props) {
    super(props);
    this.state = {
      panes: {},
      dragging: false,
      paneDragging: null,
    };
    this.panes = {};
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
  }

  componentDidMount() {
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);

    // save current pane sizes
    this.setState(state => {
      return {
        ...state,
        panes: Object.keys(this.panes).reduce((acc, key) => {
          acc[key] = {
            size: getBounds(this.panes[key], this.splitPane),
          };
          return acc;
        }, {}),
      };
    });
  }

  onMouseDown(event, index) {
    this.setState(startDraggingPane(index));
  }

  onMouseUp(event) {
    this.setState(stopDragging);
  }

  onMouseMove(event) {
    const { dragging, paneDragging } = this.state;

    if (dragging === true && paneDragging !== null) {
      const currentPaneSize = getBounds(this.panes[paneDragging], this.splitPane);

      if (event.clientX < currentPaneSize.left + 10) return;

      const newWdith = (event.clientX - currentPaneSize.left - 10) / this.splitPane.getBoundingClientRect().width * 100;

      const prevPaneIndex = paneDragging - 1;
      if (this.panes[prevPaneIndex]) {
        if (event.clientX <= getBounds(this.panes[prevPaneIndex], this.splitPane).right + 30) return;
      }

      const nextPaneIndex = paneDragging + 1;
      if (this.panes[nextPaneIndex]) {
        if (event.clientX >= getBounds(this.panes[nextPaneIndex], this.splitPane).right - 10) return;

        const nextPaneSize = getBounds(this.panes[nextPaneIndex], this.splitPane);
        const nextPaneWidth = nextPaneSize.width + (currentPaneSize.width - newWdith);
        this.setState(state => {
          state.panes[nextPaneIndex].size = {
            ...nextPaneSize,
            width: nextPaneWidth,
          };

          return state;
        });
      }

      this.setState(state => {
        state.panes[paneDragging].size = {
          ...currentPaneSize,
          width: newWdith,
        };

        return state;
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

      let style = panelStyle;

      if (pane && pane.size) {
        style = {
          ...style,
          flex: 'none',
          width: `${pane.size.width}%`,
        };
      }

      const res = [
        <div ref={pane => (this.panes[index] = pane)} style={style}>
          {child}
        </div>,
      ];

      if (index < Children.count(this.props.children) - 1)
        return res.concat(
          <span
            style={separator}
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
