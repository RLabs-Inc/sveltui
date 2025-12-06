// @bun
// src/core/layout/yoga-props-simple.ts
function applyTerminalProps(node, props, Yoga) {
  if (props.display !== undefined) {
    node.setDisplay(props.display === "none" ? Yoga.DISPLAY_NONE : Yoga.DISPLAY_FLEX);
  }
  if (props.flexDirection !== undefined) {
    const dirMap = {
      row: Yoga.FLEX_DIRECTION_ROW,
      column: Yoga.FLEX_DIRECTION_COLUMN,
      "row-reverse": Yoga.FLEX_DIRECTION_ROW_REVERSE,
      "column-reverse": Yoga.FLEX_DIRECTION_COLUMN_REVERSE
    };
    node.setFlexDirection(dirMap[props.flexDirection]);
  }
  if (props.flexWrap !== undefined) {
    node.setFlexWrap(props.flexWrap === "wrap" ? Yoga.WRAP_WRAP : Yoga.WRAP_NO_WRAP);
  }
  if (props.justifyContent !== undefined) {
    const justifyMap = {
      "flex-start": Yoga.JUSTIFY_FLEX_START,
      center: Yoga.JUSTIFY_CENTER,
      "flex-end": Yoga.JUSTIFY_FLEX_END,
      "space-between": Yoga.JUSTIFY_SPACE_BETWEEN,
      "space-around": Yoga.JUSTIFY_SPACE_AROUND,
      "space-evenly": Yoga.JUSTIFY_SPACE_EVENLY
    };
    node.setJustifyContent(justifyMap[props.justifyContent]);
  }
  if (props.alignItems !== undefined) {
    const alignMap = {
      "flex-start": Yoga.ALIGN_FLEX_START,
      center: Yoga.ALIGN_CENTER,
      "flex-end": Yoga.ALIGN_FLEX_END,
      stretch: Yoga.ALIGN_STRETCH
    };
    node.setAlignItems(alignMap[props.alignItems]);
  }
  if (props.alignContent !== undefined) {
    const alignMap = {
      "flex-start": Yoga.ALIGN_FLEX_START,
      center: Yoga.ALIGN_CENTER,
      "flex-end": Yoga.ALIGN_FLEX_END,
      stretch: Yoga.ALIGN_STRETCH,
      "space-between": Yoga.ALIGN_SPACE_BETWEEN,
      "space-around": Yoga.ALIGN_SPACE_AROUND
    };
    node.setAlignContent(alignMap[props.alignContent]);
  }
  if (props.flexGrow !== undefined) {
    node.setFlexGrow(props.flexGrow);
  }
  if (props.flexShrink !== undefined) {
    node.setFlexShrink(props.flexShrink);
  }
  if (props.flexBasis !== undefined) {
    if (typeof props.flexBasis === "string" && props.flexBasis.endsWith("%")) {
      node.setFlexBasisPercent(parseFloat(props.flexBasis));
    } else {
      node.setFlexBasis(Number(props.flexBasis));
    }
  }
  if (props.alignSelf !== undefined) {
    const alignMap = {
      auto: Yoga.ALIGN_AUTO,
      "flex-start": Yoga.ALIGN_FLEX_START,
      center: Yoga.ALIGN_CENTER,
      "flex-end": Yoga.ALIGN_FLEX_END,
      stretch: Yoga.ALIGN_STRETCH
    };
    node.setAlignSelf(alignMap[props.alignSelf]);
  }
  if (props.width !== undefined) {
    if (typeof props.width === "string" && props.width.endsWith("%")) {
      node.setWidthPercent(parseFloat(props.width));
    } else {
      node.setWidth(Number(props.width));
    }
  }
  if (props.height !== undefined) {
    if (typeof props.height === "string" && props.height.endsWith("%")) {
      node.setHeightPercent(parseFloat(props.height));
    } else {
      node.setHeight(Number(props.height));
    }
  }
  if (props.minWidth !== undefined) {
    node.setMinWidth(props.minWidth);
  }
  if (props.minHeight !== undefined) {
    node.setMinHeight(props.minHeight);
  }
  if (props.margin !== undefined) {
    node.setMargin(Yoga.EDGE_ALL, props.margin);
  }
  if (props.marginX !== undefined) {
    node.setMargin(Yoga.EDGE_HORIZONTAL, props.marginX);
  }
  if (props.marginY !== undefined) {
    node.setMargin(Yoga.EDGE_VERTICAL, props.marginY);
  }
  if (props.padding !== undefined) {
    node.setPadding(Yoga.EDGE_ALL, props.padding);
  }
  if (props.paddingX !== undefined) {
    node.setPadding(Yoga.EDGE_HORIZONTAL, props.paddingX);
  }
  if (props.paddingY !== undefined) {
    node.setPadding(Yoga.EDGE_VERTICAL, props.paddingY);
  }
  if (props.gap !== undefined) {
    node.setGap(Yoga.GUTTER_ALL, props.gap);
  }
  if (props.position !== undefined) {
    node.setPositionType(props.position === "absolute" ? Yoga.POSITION_TYPE_ABSOLUTE : Yoga.POSITION_TYPE_RELATIVE);
  }
  if (props.top !== undefined) {
    node.setPosition(Yoga.EDGE_TOP, props.top);
  }
  if (props.left !== undefined) {
    node.setPosition(Yoga.EDGE_LEFT, props.left);
  }
  if (props.borderWidth !== undefined) {
    node.setBorder(Yoga.EDGE_ALL, props.borderWidth);
  }
  if (props.overflow !== undefined) {
    const overflowMap = {
      visible: Yoga.OVERFLOW_VISIBLE,
      hidden: Yoga.OVERFLOW_HIDDEN,
      scroll: Yoga.OVERFLOW_SCROLL
    };
    node.setOverflow(overflowMap[props.overflow]);
  }
}
export {
  applyTerminalProps
};
