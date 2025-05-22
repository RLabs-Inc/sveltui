import 'svelte/internal/disclose-version';

Box[$.FILENAME] = 'src/components/ui/Box.svelte';

import * as $ from 'svelte/internal/client';

const content = $.wrap_snippet(Box, function ($$anchor, value = $.noop) {
	$.validate_snippet_args(...arguments);
	$.next();

	var text = $.text('value');

	$.append($$anchor, text);
});

var root = $.add_locations(
	$.template(
		`/**
 * Box Component
 * 
 * A basic container element that serves as a building block for layouts
 */  <box><!></box>`,
		1
	),
	Box[$.FILENAME],
	[[62, 0]]
);

export default function Box($$anchor, $$props) {
	$.check_target(new.target);
	$.push($$props, true, Box);

	// Define component props with defaults
	let left = $.prop($$props, 'left', 3, 0),
		top = $.prop($$props, 'top', 3, 0),
		width = $.prop($$props, 'width', 3, '100%'),
		height = $.prop($$props, 'height', 3, 'shrink'),
		border = $.prop($$props, 'border', 3, false),
		focusable = $.prop($$props, 'focusable', 3, false),
		scrollable = $.prop($$props, 'scrollable', 3, false),
		mouse = $.prop($$props, 'mouse', 3, true),
		style = $.prop($$props, 'style', 19, () => ({})),
		hidden = $.prop($$props, 'hidden', 3, false),
		restProps = $.rest_props(
			$$props,
			[
				'$$slots',
				'$$events',
				'$$legacy',
				'left',
				'top',
				'right',
				'bottom',
				'width',
				'height',
				'border',
				'borderColor',
				'label',
				'focusable',
				'scrollable',
				'mouse',
				'style',
				'zIndex',
				'hidden'
			],
			'restProps'
		);

	// Convert border prop to blessed-compatible value
	let borderValue = $.derived(() => $.set(borderValue, $.strict_equals(typeof border(), 'boolean') ? border() ? 'line' : false : border(), true));

	// Merge styles
	let mergedStyle = $.derived(() => $.set(
		mergedStyle,
		{
			...style(),
			border: {
				fg: $$props.borderColor,
				...style().border || {}
			}
		},
		true
	));

	$.next();

	var fragment = root();
	var box = $.sibling($.first_child(fragment));
	let attributes;
	var node = $.child(box);

	content(node, () => props.content);
	$.reset(box);

	$.template_effect(() => attributes = $.set_attributes(box, attributes, {
		left: left(),
		top: top(),
		right: $$props.right,
		bottom: $$props.bottom,
		width: width(),
		height: height(),
		border: $.get(borderValue),
		label: $$props.label,
		style: $.get(mergedStyle),
		focusable: focusable(),
		scrollable: scrollable(),
		mouse: mouse(),
		hidden: hidden(),
		zIndex: $$props.zIndex,
		...restProps
	}));

	$.append($$anchor, fragment);
	return $.pop({ ...$.legacy_api() });
}