import styled from 'styled-components'
import { IConfig } from '../../types'

export interface ICanvasOuterDefaultProps {
  config: IConfig
  children: any
  ref?: React.Ref<any>
  style?: any
}

export const CanvasOuterDefault = styled.div<ICanvasOuterDefaultProps>`

  cursor: not-allowed;
` as any
