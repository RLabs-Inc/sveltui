import 'svelte/internal/disclose-version';

Text[$.FILENAME] = 'src/components/ui/Text.svelte';

import * as $ from 'svelte/internal/client';

var root = $.add_locations($.ns_template(`<text><!></text>`), Text[$.FILENAME], [[52, 0]]);

export default function Text($$anchor, $$props) {
	$.check_target(new.target);
	$.push($$props, true, Text);

	// Define component props with defaults
	let left = $.prop($$props, 'left', 3, 0),
		top = $.prop($$props, 'top', 3, 0),
		width = $.prop($$props, 'width', 3, 'shrink'),
		height = $.prop($$props, 'height', 3, 'shrink'),
		content = $.prop($$props, 'content', 3, ''),
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
				'hidden',
				'children'
			],
			'restProps'
		);

	// Convert border prop to blessed-compatible value
	let borderValue = $.derived(() => $.strict_equals(typeof border(), 'boolean') ? border() ? 'line' : false : border());
	var text = root();
	let attributes;
	var node = $.child(text);

	{
		var consequent = ($$anchor) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			$.snippet(node_1, () => $$props.children);
			$.append($$anchor, fragment);
		};

		$.if(node, ($$render) => {
			if ($$props.children) $$render(consequent);
		});
	}

	$.reset(text);

	$.template_effect(() => attributes = $.set_attributes(text, attributes, {
		left: left(),
		top: top(),
		right: $$props.right,
		bottom: $$props.bottom,
		width: width(),
		height: height(),
		content: content(),
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

	$.append($$anchor, text);
	return $.pop({ ...$.legacy_api() });
}