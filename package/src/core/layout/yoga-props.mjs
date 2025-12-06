// @bun
// src/core/layout/yoga-props.ts
function applyYogaProps(node, props, Yoga, context) {
  const finalProps = { ...props };
  if (finalProps.position !== undefined) {
    const posMap = {
      static: Yoga.POSITION_TYPE_STATIC,
      relative: Yoga.POSITION_TYPE_RELATIVE,
      absolute: Yoga.POSITION_TYPE_ABSOLUTE
    };
    node.setPositionType(posMap[finalProps.position]);
  }
  const setPositionValue = (edge, value) => {
    if (value === "auto") {
      node.setPositionAuto(edge);
    } else if (typeof value === "string" && value.endsWith("%")) {
      node.setPositionPercent(edge, parseFloat(value));
    } else if (value !== undefined) {
      node.setPosition(edge, Number(value));
    }
  };
  if (finalProps.top !== undefined)
    setPositionValue(Yoga.EDGE_TOP, finalProps.top);
  if (finalProps.right !== undefined)
    setPositionValue(Yoga.EDGE_RIGHT, finalProps.right);
  if (finalProps.bottom !== undefined)
    setPositionValue(Yoga.EDGE_BOTTOM, finalProps.bottom);
  if (finalProps.left !== undefined)
    setPositionValue(Yoga.EDGE_LEFT, finalProps.left);
  if (finalProps.start !== undefined)
    setPositionValue(Yoga.EDGE_START, finalProps.start);
  if (finalProps.end !== undefined)
    setPositionValue(Yoga.EDGE_END, finalProps.end);
  if (finalProps.display !== undefined) {
    const displayMap = {
      flex: Yoga.DISPLAY_FLEX,
      none: Yoga.DISPLAY_NONE,
      contents: Yoga.DISPLAY_CONTENTS
    };
    node.setDisplay(displayMap[finalProps.display]);
  }
  if (finalProps.flexDirection !== undefined) {
    const flexDirMap = {
      column: Yoga.FLEX_DIRECTION_COLUMN,
      "column-reverse": Yoga.FLEX_DIRECTION_COLUMN_REVERSE,
      row: Yoga.FLEX_DIRECTION_ROW,
      "row-reverse": Yoga.FLEX_DIRECTION_ROW_REVERSE
    };
    node.setFlexDirection(flexDirMap[finalProps.flexDirection]);
  }
  if (finalProps.flexWrap !== undefined) {
    const wrapMap = {
      "no-wrap": Yoga.WRAP_NO_WRAP,
      wrap: Yoga.WRAP_WRAP,
      "wrap-reverse": Yoga.WRAP_WRAP_REVERSE
    };
    node.setFlexWrap(wrapMap[finalProps.flexWrap]);
  }
  if (finalProps.justifyContent !== undefined) {
    const justifyMap = {
      "flex-start": Yoga.JUSTIFY_FLEX_START,
      center: Yoga.JUSTIFY_CENTER,
      "flex-end": Yoga.JUSTIFY_FLEX_END,
      "space-between": Yoga.JUSTIFY_SPACE_BETWEEN,
      "space-around": Yoga.JUSTIFY_SPACE_AROUND,
      "space-evenly": Yoga.JUSTIFY_SPACE_EVENLY
    };
    node.setJustifyContent(justifyMap[finalProps.justifyContent]);
  }
  if (finalProps.alignItems !== undefined) {
    const alignMap = {
      auto: Yoga.ALIGN_AUTO,
      "flex-start": Yoga.ALIGN_FLEX_START,
      center: Yoga.ALIGN_CENTER,
      "flex-end": Yoga.ALIGN_FLEX_END,
      stretch: Yoga.ALIGN_STRETCH,
      baseline: Yoga.ALIGN_BASELINE,
      "space-between": Yoga.ALIGN_SPACE_BETWEEN,
      "space-around": Yoga.ALIGN_SPACE_AROUND,
      "space-evenly": Yoga.ALIGN_SPACE_EVENLY
    };
    node.setAlignItems(alignMap[finalProps.alignItems]);
  }
  if (finalProps.alignContent !== undefined) {
    const alignMap = {
      auto: Yoga.ALIGN_AUTO,
      "flex-start": Yoga.ALIGN_FLEX_START,
      center: Yoga.ALIGN_CENTER,
      "flex-end": Yoga.ALIGN_FLEX_END,
      stretch: Yoga.ALIGN_STRETCH,
      baseline: Yoga.ALIGN_BASELINE,
      "space-between": Yoga.ALIGN_SPACE_BETWEEN,
      "space-around": Yoga.ALIGN_SPACE_AROUND,
      "space-evenly": Yoga.ALIGN_SPACE_EVENLY
    };
    node.setAlignContent(alignMap[finalProps.alignContent]);
  }
  const setGapValue = (gutter, value) => {
    if (value === undefined)
      return;
    if (typeof value === "string" && value.endsWith("%")) {
      node.setGapPercent(gutter, parseFloat(value));
    } else {
      node.setGap(gutter, Number(value));
    }
  };
  if (finalProps.gap !== undefined)
    setGapValue(Yoga.GUTTER_ALL, finalProps.gap);
  if (finalProps.rowGap !== undefined)
    setGapValue(Yoga.GUTTER_ROW, finalProps.rowGap);
  if (finalProps.columnGap !== undefined)
    setGapValue(Yoga.GUTTER_COLUMN, finalProps.columnGap);
  if (finalProps.flex !== undefined) {
    node.setFlex(finalProps.flex);
  }
  if (finalProps.flexGrow !== undefined) {
    node.setFlexGrow(finalProps.flexGrow);
  }
  if (finalProps.flexShrink !== undefined) {
    node.setFlexShrink(finalProps.flexShrink);
  }
  if (finalProps.flexBasis !== undefined) {
    const value = finalProps.flexBasis;
    if (value === "auto") {
      if (typeof node.setFlexBasisAuto === "function") {
        node.setFlexBasisAuto();
      } else {
        node.setFlexBasis(Number.NaN);
      }
    } else if (value === "max-content") {
      if (typeof node.setFlexBasisMaxContent === "function") {
        node.setFlexBasisMaxContent();
      } else {
        node.setFlexBasisAuto();
      }
    } else if (value === "fit-content") {
      if (typeof node.setFlexBasisFitContent === "function") {
        node.setFlexBasisFitContent();
      } else {
        node.setFlexBasisAuto();
      }
    } else if (value === "stretch") {
      if (typeof node.setFlexBasisStretch === "function") {
        node.setFlexBasisStretch();
      } else {
        node.setFlexBasisAuto();
      }
    } else if (typeof value === "string" && value.endsWith("%")) {
      node.setFlexBasisPercent(parseFloat(value));
    } else if (typeof value === "number") {
      node.setFlexBasis(value);
    }
  }
  if (finalProps.alignSelf !== undefined) {
    const alignMap = {
      auto: Yoga.ALIGN_AUTO,
      "flex-start": Yoga.ALIGN_FLEX_START,
      center: Yoga.ALIGN_CENTER,
      "flex-end": Yoga.ALIGN_FLEX_END,
      stretch: Yoga.ALIGN_STRETCH,
      baseline: Yoga.ALIGN_BASELINE
    };
    node.setAlignSelf(alignMap[finalProps.alignSelf]);
  }
  const setDimensionValue = (setter, value) => {
    if (value === undefined)
      return;
    if (value === "auto") {
      const autoMethod = `${setter}Auto`;
      if (typeof node[autoMethod] === "function") {
        node[autoMethod]();
      } else {
        return;
      }
    } else if (value === "max-content") {
      const maxContentMethod = `${setter}MaxContent`;
      if (typeof node[maxContentMethod] === "function") {
        node[maxContentMethod]();
      } else {
        const autoMethod = `${setter}Auto`;
        if (typeof node[autoMethod] === "function") {
          node[autoMethod]();
        }
      }
    } else if (value === "fit-content") {
      const fitContentMethod = `${setter}FitContent`;
      if (typeof node[fitContentMethod] === "function") {
        node[fitContentMethod]();
      } else {
        const autoMethod = `${setter}Auto`;
        if (typeof node[autoMethod] === "function") {
          node[autoMethod]();
        }
      }
    } else if (value === "stretch") {
      const stretchMethod = `${setter}Stretch`;
      if (typeof node[stretchMethod] === "function") {
        node[stretchMethod]();
      } else {
        const autoMethod = `${setter}Auto`;
        if (typeof node[autoMethod] === "function") {
          node[autoMethod]();
        }
      }
    } else if (typeof value === "string" && value.endsWith("%")) {
      const percentMethod = `${setter}Percent`;
      if (typeof node[percentMethod] === "function") {
        node[percentMethod](parseFloat(value));
      }
    } else if (typeof value === "number") {
      if (typeof node[setter] === "function") {
        node[setter](value);
      }
    } else if (typeof value === "string") {
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && typeof node[setter] === "function") {
        node[setter](numValue);
      }
    }
  };
  if (finalProps.width !== undefined)
    setDimensionValue("setWidth", finalProps.width);
  if (finalProps.height !== undefined)
    setDimensionValue("setHeight", finalProps.height);
  if (finalProps.minWidth !== undefined)
    setDimensionValue("setMinWidth", finalProps.minWidth);
  if (finalProps.minHeight !== undefined)
    setDimensionValue("setMinHeight", finalProps.minHeight);
  if (finalProps.maxWidth !== undefined)
    setDimensionValue("setMaxWidth", finalProps.maxWidth);
  if (finalProps.maxHeight !== undefined)
    setDimensionValue("setMaxHeight", finalProps.maxHeight);
  const setMarginValue = (edge, value) => {
    if (value === "auto") {
      node.setMarginAuto(edge);
    } else if (typeof value === "string" && value.endsWith("%")) {
      node.setMarginPercent(edge, parseFloat(value));
    } else if (value !== undefined) {
      node.setMargin(edge, Number(value));
    }
  };
  if (finalProps.margin !== undefined)
    setMarginValue(Yoga.EDGE_ALL, finalProps.margin);
  if (finalProps.marginTop !== undefined)
    setMarginValue(Yoga.EDGE_TOP, finalProps.marginTop);
  if (finalProps.marginRight !== undefined)
    setMarginValue(Yoga.EDGE_RIGHT, finalProps.marginRight);
  if (finalProps.marginBottom !== undefined)
    setMarginValue(Yoga.EDGE_BOTTOM, finalProps.marginBottom);
  if (finalProps.marginLeft !== undefined)
    setMarginValue(Yoga.EDGE_LEFT, finalProps.marginLeft);
  if (finalProps.marginStart !== undefined)
    setMarginValue(Yoga.EDGE_START, finalProps.marginStart);
  if (finalProps.marginEnd !== undefined)
    setMarginValue(Yoga.EDGE_END, finalProps.marginEnd);
  if (finalProps.marginHorizontal !== undefined)
    setMarginValue(Yoga.EDGE_HORIZONTAL, finalProps.marginHorizontal);
  if (finalProps.marginVertical !== undefined)
    setMarginValue(Yoga.EDGE_VERTICAL, finalProps.marginVertical);
  if (finalProps.marginX !== undefined)
    setMarginValue(Yoga.EDGE_HORIZONTAL, finalProps.marginX);
  if (finalProps.marginY !== undefined)
    setMarginValue(Yoga.EDGE_VERTICAL, finalProps.marginY);
  const setPaddingValue = (edge, value) => {
    if (value === undefined)
      return;
    if (typeof value === "string" && value.endsWith("%")) {
      node.setPaddingPercent(edge, parseFloat(value));
    } else {
      node.setPadding(edge, Number(value));
    }
  };
  if (finalProps.padding !== undefined)
    setPaddingValue(Yoga.EDGE_ALL, finalProps.padding);
  if (finalProps.paddingTop !== undefined)
    setPaddingValue(Yoga.EDGE_TOP, finalProps.paddingTop);
  if (finalProps.paddingRight !== undefined)
    setPaddingValue(Yoga.EDGE_RIGHT, finalProps.paddingRight);
  if (finalProps.paddingBottom !== undefined)
    setPaddingValue(Yoga.EDGE_BOTTOM, finalProps.paddingBottom);
  if (finalProps.paddingLeft !== undefined)
    setPaddingValue(Yoga.EDGE_LEFT, finalProps.paddingLeft);
  if (finalProps.paddingStart !== undefined)
    setPaddingValue(Yoga.EDGE_START, finalProps.paddingStart);
  if (finalProps.paddingEnd !== undefined)
    setPaddingValue(Yoga.EDGE_END, finalProps.paddingEnd);
  if (finalProps.paddingHorizontal !== undefined)
    setPaddingValue(Yoga.EDGE_HORIZONTAL, finalProps.paddingHorizontal);
  if (finalProps.paddingVertical !== undefined)
    setPaddingValue(Yoga.EDGE_VERTICAL, finalProps.paddingVertical);
  if (finalProps.paddingX !== undefined)
    setPaddingValue(Yoga.EDGE_HORIZONTAL, finalProps.paddingX);
  if (finalProps.paddingY !== undefined)
    setPaddingValue(Yoga.EDGE_VERTICAL, finalProps.paddingY);
  const setBorderValue = (edge, value) => {
    if (value !== undefined) {
      node.setBorder(edge, value);
    }
  };
  if (finalProps.borderWidth !== undefined)
    setBorderValue(Yoga.EDGE_ALL, finalProps.borderWidth);
  if (finalProps.borderTopWidth !== undefined)
    setBorderValue(Yoga.EDGE_TOP, finalProps.borderTopWidth);
  if (finalProps.borderRightWidth !== undefined)
    setBorderValue(Yoga.EDGE_RIGHT, finalProps.borderRightWidth);
  if (finalProps.borderBottomWidth !== undefined)
    setBorderValue(Yoga.EDGE_BOTTOM, finalProps.borderBottomWidth);
  if (finalProps.borderLeftWidth !== undefined)
    setBorderValue(Yoga.EDGE_LEFT, finalProps.borderLeftWidth);
  if (finalProps.borderStartWidth !== undefined)
    setBorderValue(Yoga.EDGE_START, finalProps.borderStartWidth);
  if (finalProps.borderEndWidth !== undefined)
    setBorderValue(Yoga.EDGE_END, finalProps.borderEndWidth);
  if (finalProps.borderHorizontalWidth !== undefined)
    setBorderValue(Yoga.EDGE_HORIZONTAL, finalProps.borderHorizontalWidth);
  if (finalProps.borderVerticalWidth !== undefined)
    setBorderValue(Yoga.EDGE_VERTICAL, finalProps.borderVerticalWidth);
  if (finalProps.aspectRatio !== undefined) {
    node.setAspectRatio(finalProps.aspectRatio);
  }
  if (finalProps.overflow !== undefined) {
    const overflowMap = {
      visible: Yoga.OVERFLOW_VISIBLE,
      hidden: Yoga.OVERFLOW_HIDDEN,
      scroll: Yoga.OVERFLOW_SCROLL,
      auto: Yoga.OVERFLOW_SCROLL
    };
    node.setOverflow(overflowMap[finalProps.overflow]);
  }
  if (finalProps.direction !== undefined) {
    const dirMap = {
      inherit: Yoga.DIRECTION_INHERIT,
      ltr: Yoga.DIRECTION_LTR,
      rtl: Yoga.DIRECTION_RTL
    };
    node.setDirection(dirMap[finalProps.direction]);
  }
  if (finalProps.boxSizing !== undefined) {
    const boxSizingMap = {
      "border-box": Yoga.BOX_SIZING_BORDER_BOX,
      "content-box": Yoga.BOX_SIZING_CONTENT_BOX
    };
    if (typeof node.setBoxSizing === "function") {
      node.setBoxSizing(boxSizingMap[finalProps.boxSizing]);
    }
  }
  if (finalProps.nodeType !== undefined) {
    const nodeTypeMap = {
      default: Yoga.NODE_TYPE_DEFAULT,
      text: Yoga.NODE_TYPE_TEXT
    };
    if (typeof node.setNodeType === "function") {
      node.setNodeType(nodeTypeMap[finalProps.nodeType]);
    }
  }
  if (finalProps.isReferenceBaseline !== undefined && typeof node.setIsReferenceBaseline === "function") {
    node.setIsReferenceBaseline(finalProps.isReferenceBaseline);
  }
  if (finalProps.alwaysFormsContainingBlock !== undefined && typeof node.setAlwaysFormsContainingBlock === "function") {
    node.setAlwaysFormsContainingBlock(finalProps.alwaysFormsContainingBlock);
  }
}
var YogaEnums = {
  Display: {
    Flex: 0,
    None: 1,
    Contents: 2
  },
  FlexDirection: {
    Column: 0,
    ColumnReverse: 1,
    Row: 2,
    RowReverse: 3
  },
  Wrap: {
    NoWrap: 0,
    Wrap: 1,
    WrapReverse: 2
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
    SpaceEvenly: 8
  },
  Justify: {
    FlexStart: 0,
    Center: 1,
    FlexEnd: 2,
    SpaceBetween: 3,
    SpaceAround: 4,
    SpaceEvenly: 5
  },
  PositionType: {
    Static: 0,
    Relative: 1,
    Absolute: 2
  },
  Overflow: {
    Visible: 0,
    Hidden: 1,
    Scroll: 2
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
    All: 8
  },
  Gutter: {
    Column: 0,
    Row: 1,
    All: 2
  }
};
export {
  applyYogaProps,
  YogaEnums
};
