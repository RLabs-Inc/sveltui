// ============================================================================
// SVELTUI - COMPREHENSIVE YOGA PROPS
// Complete set of Yoga layout properties for components
// Based on exhaustive Yoga API analysis
// ============================================================================

// Value type that can be a number, percentage string, or special value
export type YogaValue =
  | number
  | string
  | 'auto'
  | 'max-content'
  | 'fit-content'
  | 'stretch'
export type YogaEdgeValue = number | string | 'auto'

export interface YogaLayoutProps {
  // Position
  position?: 'relative' | 'absolute' | 'static'
  top?: YogaEdgeValue
  right?: YogaEdgeValue
  bottom?: YogaEdgeValue
  left?: YogaEdgeValue
  start?: YogaEdgeValue // writing-direction aware
  end?: YogaEdgeValue

  // Display
  display?: 'flex' | 'none' | 'contents'

  // Flex Container (only applies when display='flex')
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse'
  flexWrap?: 'no-wrap' | 'wrap' | 'wrap-reverse'
  justifyContent?:
    | 'flex-start'
    | 'center'
    | 'flex-end'
    | 'space-between'
    | 'space-around'
    | 'space-evenly'
  alignItems?:
    | 'auto'
    | 'flex-start'
    | 'center'
    | 'flex-end'
    | 'stretch'
    | 'baseline'
    | 'space-between'
    | 'space-around'
    | 'space-evenly'
  alignContent?:
    | 'auto'
    | 'flex-start'
    | 'center'
    | 'flex-end'
    | 'stretch'
    | 'baseline'
    | 'space-between'
    | 'space-around'
    | 'space-evenly'

  // Gap (spacing between flex items)
  gap?: number | string
  rowGap?: number | string
  columnGap?: number | string

  // Flex Item
  flex?: number // Yoga's shorthand: positive = flexGrow, negative = flexShrink
  flexGrow?: number
  flexShrink?: number
  flexBasis?: YogaValue
  alignSelf?:
    | 'auto'
    | 'flex-start'
    | 'center'
    | 'flex-end'
    | 'stretch'
    | 'baseline'

  // Size
  width?: YogaValue
  height?: YogaValue
  minWidth?: YogaValue
  minHeight?: YogaValue
  maxWidth?: YogaValue
  maxHeight?: YogaValue

  // Spacing - supports edge-specific values
  margin?: YogaEdgeValue
  marginTop?: YogaEdgeValue
  marginRight?: YogaEdgeValue
  marginBottom?: YogaEdgeValue
  marginLeft?: YogaEdgeValue
  marginStart?: YogaEdgeValue
  marginEnd?: YogaEdgeValue
  marginHorizontal?: YogaEdgeValue
  marginVertical?: YogaEdgeValue
  marginX?: YogaEdgeValue // alias for marginHorizontal
  marginY?: YogaEdgeValue // alias for marginVertical

  padding?: number | string
  paddingTop?: number | string
  paddingRight?: number | string
  paddingBottom?: number | string
  paddingLeft?: number | string
  paddingStart?: number | string
  paddingEnd?: number | string
  paddingHorizontal?: number | string
  paddingVertical?: number | string
  paddingX?: number | string // alias for paddingHorizontal
  paddingY?: number | string // alias for paddingVertical

  // Border (Yoga tracks border width for layout calculations)
  borderWidth?: number
  borderTopWidth?: number
  borderRightWidth?: number
  borderBottomWidth?: number
  borderLeftWidth?: number
  borderStartWidth?: number
  borderEndWidth?: number
  borderHorizontalWidth?: number
  borderVerticalWidth?: number

  // Other
  aspectRatio?: number
  overflow?: 'visible' | 'hidden' | 'scroll' | 'auto'
  direction?: 'inherit' | 'ltr' | 'rtl'
  boxSizing?: 'border-box' | 'content-box'
  
  // Node type - for text nodes that can be truncated
  nodeType?: 'default' | 'text'
  
  // Reference baseline
  isReferenceBaseline?: boolean
  
  // Always forms containing block
  alwaysFormsContainingBlock?: boolean
}

// Helper function to apply Yoga props to a node with smart defaults
export function applyYogaProps(
  node: any,
  props: YogaLayoutProps,
  Yoga: any,
  context?: {
    componentType?: number
    parentProps?: YogaLayoutProps
    isRoot?: boolean
  }
) {
  const finalProps = { ...props }

  // Position type
  if (finalProps.position !== undefined) {
    const posMap = {
      static: Yoga.POSITION_TYPE_STATIC,
      relative: Yoga.POSITION_TYPE_RELATIVE,
      absolute: Yoga.POSITION_TYPE_ABSOLUTE,
    }
    node.setPositionType(posMap[finalProps.position])
  }

  // Position values (insets)
  const setPositionValue = (edge: any, value: YogaEdgeValue) => {
    if (value === 'auto') {
      node.setPositionAuto(edge)
    } else if (typeof value === 'string' && value.endsWith('%')) {
      node.setPositionPercent(edge, parseFloat(value))
    } else if (value !== undefined) {
      node.setPosition(edge, Number(value))
    }
  }

  if (finalProps.top !== undefined)
    setPositionValue(Yoga.EDGE_TOP, finalProps.top)
  if (finalProps.right !== undefined)
    setPositionValue(Yoga.EDGE_RIGHT, finalProps.right)
  if (finalProps.bottom !== undefined)
    setPositionValue(Yoga.EDGE_BOTTOM, finalProps.bottom)
  if (finalProps.left !== undefined)
    setPositionValue(Yoga.EDGE_LEFT, finalProps.left)
  if (finalProps.start !== undefined)
    setPositionValue(Yoga.EDGE_START, finalProps.start)
  if (finalProps.end !== undefined)
    setPositionValue(Yoga.EDGE_END, finalProps.end)

  // Display
  if (finalProps.display !== undefined) {
    const displayMap = {
      flex: Yoga.DISPLAY_FLEX,
      none: Yoga.DISPLAY_NONE,
      contents: Yoga.DISPLAY_CONTENTS,
    }
    node.setDisplay(displayMap[finalProps.display])
  }

  // Flex container properties
  if (finalProps.flexDirection !== undefined) {
    const flexDirMap = {
      column: Yoga.FLEX_DIRECTION_COLUMN,
      'column-reverse': Yoga.FLEX_DIRECTION_COLUMN_REVERSE,
      row: Yoga.FLEX_DIRECTION_ROW,
      'row-reverse': Yoga.FLEX_DIRECTION_ROW_REVERSE,
    }
    node.setFlexDirection(flexDirMap[finalProps.flexDirection])
  }

  if (finalProps.flexWrap !== undefined) {
    const wrapMap = {
      'no-wrap': Yoga.WRAP_NO_WRAP,
      wrap: Yoga.WRAP_WRAP,
      'wrap-reverse': Yoga.WRAP_WRAP_REVERSE,
    }
    node.setFlexWrap(wrapMap[finalProps.flexWrap])
  }

  if (finalProps.justifyContent !== undefined) {
    const justifyMap = {
      'flex-start': Yoga.JUSTIFY_FLEX_START,
      center: Yoga.JUSTIFY_CENTER,
      'flex-end': Yoga.JUSTIFY_FLEX_END,
      'space-between': Yoga.JUSTIFY_SPACE_BETWEEN,
      'space-around': Yoga.JUSTIFY_SPACE_AROUND,
      'space-evenly': Yoga.JUSTIFY_SPACE_EVENLY,
    }
    node.setJustifyContent(justifyMap[finalProps.justifyContent])
  }

  if (finalProps.alignItems !== undefined) {
    const alignMap = {
      auto: Yoga.ALIGN_AUTO,
      'flex-start': Yoga.ALIGN_FLEX_START,
      center: Yoga.ALIGN_CENTER,
      'flex-end': Yoga.ALIGN_FLEX_END,
      stretch: Yoga.ALIGN_STRETCH,
      baseline: Yoga.ALIGN_BASELINE,
      'space-between': Yoga.ALIGN_SPACE_BETWEEN,
      'space-around': Yoga.ALIGN_SPACE_AROUND,
      'space-evenly': Yoga.ALIGN_SPACE_EVENLY,
    }
    node.setAlignItems(alignMap[finalProps.alignItems])
  }

  if (finalProps.alignContent !== undefined) {
    const alignMap = {
      auto: Yoga.ALIGN_AUTO,
      'flex-start': Yoga.ALIGN_FLEX_START,
      center: Yoga.ALIGN_CENTER,
      'flex-end': Yoga.ALIGN_FLEX_END,
      stretch: Yoga.ALIGN_STRETCH,
      baseline: Yoga.ALIGN_BASELINE,
      'space-between': Yoga.ALIGN_SPACE_BETWEEN,
      'space-around': Yoga.ALIGN_SPACE_AROUND,
      'space-evenly': Yoga.ALIGN_SPACE_EVENLY,
    }
    node.setAlignContent(alignMap[finalProps.alignContent])
  }

  // Gap
  const setGapValue = (gutter: any, value: number | string | undefined) => {
    if (value === undefined) return
    if (typeof value === 'string' && value.endsWith('%')) {
      node.setGapPercent(gutter, parseFloat(value))
    } else {
      node.setGap(gutter, Number(value))
    }
  }

  if (finalProps.gap !== undefined) setGapValue(Yoga.GUTTER_ALL, finalProps.gap)
  if (finalProps.rowGap !== undefined)
    setGapValue(Yoga.GUTTER_ROW, finalProps.rowGap)
  if (finalProps.columnGap !== undefined)
    setGapValue(Yoga.GUTTER_COLUMN, finalProps.columnGap)

  // Flex item properties
  if (finalProps.flex !== undefined) {
    node.setFlex(finalProps.flex)
  }
  if (finalProps.flexGrow !== undefined) {
    node.setFlexGrow(finalProps.flexGrow)
  }
  if (finalProps.flexShrink !== undefined) {
    node.setFlexShrink(finalProps.flexShrink)
  }
  if (finalProps.flexBasis !== undefined) {
    const value = finalProps.flexBasis
    
    if (value === 'auto') {
      if (typeof node.setFlexBasisAuto === 'function') {
        node.setFlexBasisAuto()
      } else {
        // Fallback: use NaN like Ink does
        node.setFlexBasis(Number.NaN)
      }
    } else if (value === 'max-content') {
      if (typeof node.setFlexBasisMaxContent === 'function') {
        node.setFlexBasisMaxContent()
      } else {
        node.setFlexBasisAuto()
      }
    } else if (value === 'fit-content') {
      if (typeof node.setFlexBasisFitContent === 'function') {
        node.setFlexBasisFitContent()
      } else {
        node.setFlexBasisAuto()
      }
    } else if (value === 'stretch') {
      if (typeof node.setFlexBasisStretch === 'function') {
        node.setFlexBasisStretch()
      } else {
        node.setFlexBasisAuto()
      }
    } else if (typeof value === 'string' && value.endsWith('%')) {
      node.setFlexBasisPercent(parseFloat(value))
    } else if (typeof value === 'number') {
      node.setFlexBasis(value)
    }
  }

  if (finalProps.alignSelf !== undefined) {
    const alignMap = {
      auto: Yoga.ALIGN_AUTO,
      'flex-start': Yoga.ALIGN_FLEX_START,
      center: Yoga.ALIGN_CENTER,
      'flex-end': Yoga.ALIGN_FLEX_END,
      stretch: Yoga.ALIGN_STRETCH,
      baseline: Yoga.ALIGN_BASELINE,
    }
    node.setAlignSelf(alignMap[finalProps.alignSelf])
  }

  // Size - helper for dimension values with COMPLETE support for all yoga methods
  const setDimensionValue = (setter: string, value: YogaValue) => {
    if (value === undefined) return
    
    // Handle special values based on the setter type
    if (value === 'auto') {
      const autoMethod = `${setter}Auto`
      if (typeof node[autoMethod] === 'function') {
        node[autoMethod]()
      } else {
        // Fallback: for dimensions that don't support auto, skip
        return
      }
    } else if (value === 'max-content') {
      const maxContentMethod = `${setter}MaxContent`
      if (typeof node[maxContentMethod] === 'function') {
        node[maxContentMethod]()
      } else {
        // Fallback to auto if max-content is not available
        const autoMethod = `${setter}Auto`
        if (typeof node[autoMethod] === 'function') {
          node[autoMethod]()
        }
      }
    } else if (value === 'fit-content') {
      const fitContentMethod = `${setter}FitContent`
      if (typeof node[fitContentMethod] === 'function') {
        node[fitContentMethod]()
      } else {
        // Fallback to auto if fit-content is not available
        const autoMethod = `${setter}Auto`
        if (typeof node[autoMethod] === 'function') {
          node[autoMethod]()
        }
      }
    } else if (value === 'stretch') {
      const stretchMethod = `${setter}Stretch`
      if (typeof node[stretchMethod] === 'function') {
        node[stretchMethod]()
      } else {
        // Fallback to auto if stretch is not available
        const autoMethod = `${setter}Auto`
        if (typeof node[autoMethod] === 'function') {
          node[autoMethod]()
        }
      }
    } else if (typeof value === 'string' && value.endsWith('%')) {
      // Percentage values
      const percentMethod = `${setter}Percent`
      if (typeof node[percentMethod] === 'function') {
        node[percentMethod](parseFloat(value))
      }
    } else if (typeof value === 'number') {
      // Numeric values
      if (typeof node[setter] === 'function') {
        node[setter](value)
      }
    } else if (typeof value === 'string') {
      // Try to parse as number if it's a string
      const numValue = parseFloat(value)
      if (!isNaN(numValue) && typeof node[setter] === 'function') {
        node[setter](numValue)
      }
    }
  }

  if (finalProps.width !== undefined)
    setDimensionValue('setWidth', finalProps.width)
  if (finalProps.height !== undefined)
    setDimensionValue('setHeight', finalProps.height)
  if (finalProps.minWidth !== undefined)
    setDimensionValue('setMinWidth', finalProps.minWidth)
  if (finalProps.minHeight !== undefined)
    setDimensionValue('setMinHeight', finalProps.minHeight)
  if (finalProps.maxWidth !== undefined)
    setDimensionValue('setMaxWidth', finalProps.maxWidth)
  if (finalProps.maxHeight !== undefined)
    setDimensionValue('setMaxHeight', finalProps.maxHeight)

  // Margin - helper for margin values
  const setMarginValue = (edge: any, value: YogaEdgeValue) => {
    if (value === 'auto') {
      node.setMarginAuto(edge)
    } else if (typeof value === 'string' && value.endsWith('%')) {
      node.setMarginPercent(edge, parseFloat(value))
    } else if (value !== undefined) {
      node.setMargin(edge, Number(value))
    }
  }

  if (finalProps.margin !== undefined)
    setMarginValue(Yoga.EDGE_ALL, finalProps.margin)
  if (finalProps.marginTop !== undefined)
    setMarginValue(Yoga.EDGE_TOP, finalProps.marginTop)
  if (finalProps.marginRight !== undefined)
    setMarginValue(Yoga.EDGE_RIGHT, finalProps.marginRight)
  if (finalProps.marginBottom !== undefined)
    setMarginValue(Yoga.EDGE_BOTTOM, finalProps.marginBottom)
  if (finalProps.marginLeft !== undefined)
    setMarginValue(Yoga.EDGE_LEFT, finalProps.marginLeft)
  if (finalProps.marginStart !== undefined)
    setMarginValue(Yoga.EDGE_START, finalProps.marginStart)
  if (finalProps.marginEnd !== undefined)
    setMarginValue(Yoga.EDGE_END, finalProps.marginEnd)
  if (finalProps.marginHorizontal !== undefined)
    setMarginValue(Yoga.EDGE_HORIZONTAL, finalProps.marginHorizontal)
  if (finalProps.marginVertical !== undefined)
    setMarginValue(Yoga.EDGE_VERTICAL, finalProps.marginVertical)
  // Convenience aliases
  if (finalProps.marginX !== undefined)
    setMarginValue(Yoga.EDGE_HORIZONTAL, finalProps.marginX)
  if (finalProps.marginY !== undefined)
    setMarginValue(Yoga.EDGE_VERTICAL, finalProps.marginY)

  // Padding - helper for padding values
  const setPaddingValue = (edge: any, value: number | string | undefined) => {
    if (value === undefined) return
    if (typeof value === 'string' && value.endsWith('%')) {
      node.setPaddingPercent(edge, parseFloat(value))
    } else {
      node.setPadding(edge, Number(value))
    }
  }

  if (finalProps.padding !== undefined)
    setPaddingValue(Yoga.EDGE_ALL, finalProps.padding)
  if (finalProps.paddingTop !== undefined)
    setPaddingValue(Yoga.EDGE_TOP, finalProps.paddingTop)
  if (finalProps.paddingRight !== undefined)
    setPaddingValue(Yoga.EDGE_RIGHT, finalProps.paddingRight)
  if (finalProps.paddingBottom !== undefined)
    setPaddingValue(Yoga.EDGE_BOTTOM, finalProps.paddingBottom)
  if (finalProps.paddingLeft !== undefined)
    setPaddingValue(Yoga.EDGE_LEFT, finalProps.paddingLeft)
  if (finalProps.paddingStart !== undefined)
    setPaddingValue(Yoga.EDGE_START, finalProps.paddingStart)
  if (finalProps.paddingEnd !== undefined)
    setPaddingValue(Yoga.EDGE_END, finalProps.paddingEnd)
  if (finalProps.paddingHorizontal !== undefined)
    setPaddingValue(Yoga.EDGE_HORIZONTAL, finalProps.paddingHorizontal)
  if (finalProps.paddingVertical !== undefined)
    setPaddingValue(Yoga.EDGE_VERTICAL, finalProps.paddingVertical)
  // Convenience aliases
  if (finalProps.paddingX !== undefined)
    setPaddingValue(Yoga.EDGE_HORIZONTAL, finalProps.paddingX)
  if (finalProps.paddingY !== undefined)
    setPaddingValue(Yoga.EDGE_VERTICAL, finalProps.paddingY)

  // Border - helper for border values
  const setBorderValue = (edge: any, value: number | undefined) => {
    if (value !== undefined) {
      node.setBorder(edge, value)
    }
  }

  if (finalProps.borderWidth !== undefined)
    setBorderValue(Yoga.EDGE_ALL, finalProps.borderWidth)
  if (finalProps.borderTopWidth !== undefined)
    setBorderValue(Yoga.EDGE_TOP, finalProps.borderTopWidth)
  if (finalProps.borderRightWidth !== undefined)
    setBorderValue(Yoga.EDGE_RIGHT, finalProps.borderRightWidth)
  if (finalProps.borderBottomWidth !== undefined)
    setBorderValue(Yoga.EDGE_BOTTOM, finalProps.borderBottomWidth)
  if (finalProps.borderLeftWidth !== undefined)
    setBorderValue(Yoga.EDGE_LEFT, finalProps.borderLeftWidth)
  if (finalProps.borderStartWidth !== undefined)
    setBorderValue(Yoga.EDGE_START, finalProps.borderStartWidth)
  if (finalProps.borderEndWidth !== undefined)
    setBorderValue(Yoga.EDGE_END, finalProps.borderEndWidth)
  if (finalProps.borderHorizontalWidth !== undefined)
    setBorderValue(Yoga.EDGE_HORIZONTAL, finalProps.borderHorizontalWidth)
  if (finalProps.borderVerticalWidth !== undefined)
    setBorderValue(Yoga.EDGE_VERTICAL, finalProps.borderVerticalWidth)

  // Aspect ratio
  if (finalProps.aspectRatio !== undefined) {
    node.setAspectRatio(finalProps.aspectRatio)
  }

  // Overflow
  if (finalProps.overflow !== undefined) {
    const overflowMap = {
      visible: Yoga.OVERFLOW_VISIBLE,
      hidden: Yoga.OVERFLOW_HIDDEN,
      scroll: Yoga.OVERFLOW_SCROLL,
      auto: Yoga.OVERFLOW_SCROLL, // auto is treated as scroll in terminals
    }
    node.setOverflow(overflowMap[finalProps.overflow])
  }

  // Direction
  if (finalProps.direction !== undefined) {
    const dirMap = {
      inherit: Yoga.DIRECTION_INHERIT,
      ltr: Yoga.DIRECTION_LTR,
      rtl: Yoga.DIRECTION_RTL,
    }
    node.setDirection(dirMap[finalProps.direction])
  }

  // Box sizing
  if (finalProps.boxSizing !== undefined) {
    const boxSizingMap = {
      'border-box': Yoga.BOX_SIZING_BORDER_BOX,
      'content-box': Yoga.BOX_SIZING_CONTENT_BOX,
    }
    if (typeof node.setBoxSizing === 'function') {
      node.setBoxSizing(boxSizingMap[finalProps.boxSizing])
    }
  }
  
  // Node Type (for text truncation)
  if (finalProps.nodeType !== undefined) {
    const nodeTypeMap = {
      default: Yoga.NODE_TYPE_DEFAULT,
      text: Yoga.NODE_TYPE_TEXT,
    }
    if (typeof node.setNodeType === 'function') {
      node.setNodeType(nodeTypeMap[finalProps.nodeType])
    }
  }
  
  // Reference Baseline
  if (finalProps.isReferenceBaseline !== undefined && typeof node.setIsReferenceBaseline === 'function') {
    node.setIsReferenceBaseline(finalProps.isReferenceBaseline)
  }
  
  // Always Forms Containing Block
  if (finalProps.alwaysFormsContainingBlock !== undefined && typeof node.setAlwaysFormsContainingBlock === 'function') {
    node.setAlwaysFormsContainingBlock(finalProps.alwaysFormsContainingBlock)
  }
}

// Export enums for direct usage if needed
export const YogaEnums = {
  Display: {
    Flex: 0,
    None: 1,
    Contents: 2,
  },
  FlexDirection: {
    Column: 0,
    ColumnReverse: 1,
    Row: 2,
    RowReverse: 3,
  },
  Wrap: {
    NoWrap: 0,
    Wrap: 1,
    WrapReverse: 2,
  },
  Align: {
    Auto: 0,
    FlexStart: 1,
    Center: 2,
    FlexEnd: 3,
    Stretch: 4,
    Baseline: 5,
    SpaceBetween: 6,
    SpaceAround: 7,
    SpaceEvenly: 8,
  },
  Justify: {
    FlexStart: 0,
    Center: 1,
    FlexEnd: 2,
    SpaceBetween: 3,
    SpaceAround: 4,
    SpaceEvenly: 5,
  },
  PositionType: {
    Static: 0,
    Relative: 1,
    Absolute: 2,
  },
  Overflow: {
    Visible: 0,
    Hidden: 1,
    Scroll: 2,
  },
  Edge: {
    Left: 0,
    Top: 1,
    Right: 2,
    Bottom: 3,
    Start: 4,
    End: 5,
    Horizontal: 6,
    Vertical: 7,
    All: 8,
  },
  Gutter: {
    Column: 0,
    Row: 1,
    All: 2,
  },
}
