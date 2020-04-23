import * as React from 'react'
import Draggable from 'react-draggable'
import {
  IConfig,
  IOnCanvasClick,
  IOnCanvasDrop,
  IOnDeleteKey,
  IOnDragCanvas,
  IOnDragCanvasStop,
  IOnZoomCanvas,
  IZoom,
  REACT_FLOW_CHART,
} from '../../'
import CanvasContext from './CanvasContext'
import { ICanvasInnerDefaultProps } from './CanvasInner.default'
import { ICanvasOuterDefaultProps } from './CanvasOuter.default'

export interface ICanvasWrapperProps {
  config: IConfig
  position: {
    x: number
    y: number
  }
  zoom: IZoom
  onZoomCanvas: IOnZoomCanvas
  onDragCanvas: IOnDragCanvas
  onDragCanvasStop: IOnDragCanvasStop
  onDeleteKey: IOnDeleteKey
  onCanvasClick: IOnCanvasClick
  onCanvasDrop: IOnCanvasDrop
  ComponentInner: React.FunctionComponent<ICanvasInnerDefaultProps>
  ComponentOuter: React.FunctionComponent<ICanvasOuterDefaultProps>
  onSizeChange: (x: number, y: number) => void
  children: any
}

interface IState {
  width: number
  height: number
  offsetX: number
  offsetY: number
}

export class CanvasWrapper extends React.Component<
  ICanvasWrapperProps,
  IState
  > {
  public state = {
    width: 0,
    height: 0,
    offsetX: 0,
    offsetY: 0,
  }

  private ref = React.createRef<HTMLElement>()

  public componentDidMount() {
    this.updateSize()

    if (this.ref.current) {
      if ((window as any).ResizeObserver) {
        const ro = new (window as any).ResizeObserver(this.updateSize)
        ro.observe(this.ref.current)
      } else {
        window.addEventListener('resize', this.updateSize)
      }
      window.addEventListener('scroll', this.updateSize)
    }
  }

  public componentDidUpdate() {
    this.updateSize()
  }

  public componentWillUnmount() {
    window.removeEventListener('resize', this.updateSize)
    window.removeEventListener('scroll', this.updateSize)
  }

  public onDragCanvas(props: { config: any; event: any; data: any }) {
    const { config, event, data } = props;
    this.props.onDragCanvas({ config, event, data })
  }

  public onDragCanvasStop(props: { config: any; event: any; data: any }) {
    const { config, event, data } = props;
    this.props.onDragCanvas({ config, event, data })
  }

  public render() {
    const {
      config,
      ComponentInner,
      ComponentOuter,
      position,
      children,
      onCanvasClick,
      onDeleteKey,
      onCanvasDrop,
      zoom,
    } = this.props
    const { offsetX, offsetY } = this.state

    return (
      <CanvasContext.Provider
        value={{
          offsetX: this.state.offsetX,
          offsetY: this.state.offsetY,
          zoomScale: zoom.scale,
        }}
      >
        <ComponentOuter
          config={config}
          ref={this.ref}
          style={{
            width: `${zoom.width}%`,
            height: `${zoom.height}%`,
            transform: `scale(${zoom.scale})`,
            transformOrigin: `left top`
          }}
        >

          {/* <div
            style={{
              width: `${zoom.width}%`,
              height: `${zoom.height}%`,
              transform: `scale(${zoom.scale})`,
              transformOrigin: `left top`
            }}
          > */}
            {/* <div> */}

            <Draggable
              axis="both"
              position={position}
              grid={[1, 1]}
              onDrag={(event, data) => this.onDragCanvas({ config, event, data })}
              onStop={(event, data) => this.onDragCanvasStop({ config, event, data })}
              disabled={config.readonly}
            >
              <ComponentInner
                config={config}
                children={children}
                onClick={onCanvasClick}
                tabIndex={0}
                onKeyDown={(e: React.KeyboardEvent) => {
                  // delete or backspace keys
                  if (e.keyCode === 46 || e.keyCode === 8) {
                    onDeleteKey({ config })
                  }
                }}
                onDrop={(e) => {
                  const data = JSON.parse(
                    e.dataTransfer.getData(REACT_FLOW_CHART)
                  )
                  if (data) {
                    onCanvasDrop({
                      data,
                      position: {
                        x: e.clientX - (position.x + offsetX),
                        y: e.clientY - (position.y + offsetY),
                      },
                    })
                  }
                }}
                onDragOver={(e) => e.preventDefault()}
              />

            </Draggable>
          {/* </div> */}
        </ComponentOuter>
      </CanvasContext.Provider >
    )
  }

  private updateSize = () => {
    const el = this.ref.current

    if (el) {
      const rect = el.getBoundingClientRect()

      if (
        el.offsetWidth !== this.state.width ||
        el.offsetHeight !== this.state.height
      ) {
        this.setState({ width: el.offsetWidth, height: el.offsetHeight })
        this.props.onSizeChange(el.offsetWidth, el.offsetHeight)
      }

      if (rect.left !== this.state.offsetX || rect.top !== this.state.offsetY) {
        this.setState({ offsetX: rect.left, offsetY: rect.top })
      }
    }
  }
}
