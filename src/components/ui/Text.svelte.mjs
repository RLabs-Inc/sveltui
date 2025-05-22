import 'svelte/internal/disclose-version';

Text[$.FILENAME] = 'src/components/ui/Text.svelte';

import * as $ from 'svelte/internal/client';

const content = $.wrap_snippet(Text, function ($$anchor, value = $.noop) {
	$.validate_snippet_args(...arguments);
	$.next();

	var text = $.text('value');

	$.append($$anchor, text);
});

var root = $.add_locations(
	$.ns_template(
		`/**
 * Text Component
 * 
 * A component for displaying text in the terminal
 */ <text><!></text>`,
		1
	),
	Text[$.FILENAME],
	[[59, 0]]
);

export default function Text($$anchor, $$props) {
	$.check_target(new.target);
	$.push($$props, true, Text);

	// Define component props with defaults
	let left = $.prop($$props, 'left', 3, 0),
		top = $.prop($$props, 'top', 3, 0),
		width = $.prop($$props, 'width', 3, 'shrink'),
		height = $.prop($$props, 'height', 3, 'shrink'),
		content = $.prop($$props, 'content', 11, ''),
		align = $.prop($$props, 'align', 3, 'left'),
		wrap = $.prop($$props, 'wrap', 3, true),
		tags = $.prop($$props, 'tags', 3, false),
		truncate = $.prop($$props, 'truncate', 3, false),
		border = $.prop($$props, 'border', 3, false),
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
				'content',
				'align',
				'wrap',
				'tags',
				'truncate',
				'border',
				'style',
				'zIndex',
				'hidden'
			],
			'restProps'
		);

	// Convert border prop to blessed-compatible value
	let borderValue = $.derived(() => $.set(borderValue, $.strict_equals(typeof border(), 'boolean') ? border() ? 'line' : false : border(), true));

	$.next();

	var fragment = root();
	var text_1 = $.sibling($.first_child(fragment));
	let attributes;
	var node = $.child(text_1);

	content(node, () => props.content);
	$.reset(text_1);

	$.template_effect(() => attributes = $.set_attributes(text_1, attributes, {
		left: left(),
		top: top(),
		right: $$props.right,
		bottom: $$props.bottom,
		width: width(),
		height: height(),
		content,
		align: align(),
		wrap: wrap(),
		tags: tags(),
		border: $.get(borderValue),
		style: style(),
		zIndex: $$props.zIndex,
		hidden: hidden(),
		truncate: truncate(),
		...restProps
	}));

	$.append($$anchor, fragment);
	return $.pop({ ...$.legacy_api() });
}