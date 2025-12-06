import 'svelte/internal/disclose-version';

Button[$.FILENAME] = 'src/components/ui/Button.svelte';

import * as $ from 'svelte/internal/client';

var root = $.add_locations($.template(`<box><!></box>`), Button[$.FILENAME], [[31, 0]]);

export default function Button($$anchor, $$props) {
	$.check_target(new.target);
	$.push($$props, true, Button);

	// Props with proper defaults
	let content = $.prop($$props, 'content', 3, ''),
		onclick = $.prop($$props, 'onclick', 3, () => {}),
		onPress = $.prop($$props, 'onPress', 3, () => {}),
		color = $.prop($$props, 'color', 3, 'primary'),
		border = $.prop($$props, 'border', 3, false),
		width = $.prop($$props, 'width', 3, 'shrink'),
		height = $.prop($$props, 'height', 3, 'shrink'),
		bold = $.prop($$props, 'bold', 3, false),
		disabled = $.prop($$props, 'disabled', 3, false),
		style = $.prop($$props, 'style', 19, () => ({})),
		props = $.rest_props(
			$$props,
			[
				'$$slots',
				'$$events',
				'$$legacy',
				'children',
				'content',
				'onclick',
				'onPress',
				'color',
				'border',
				'width',
				'height',
				'bold',
				'disabled',
				'style',
				'left',
				'right',
				'top',
				'bottom'
			],
			'props'
		);

	function handleClick(event) {
		if (!disabled()) {
			onclick()?.(event);
			onPress()?.(event);
		}
	}

	var box = root();
	let attributes;
	var node = $.child(box);

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

	$.reset(box);

	$.template_effect(() => attributes = $.set_attributes(box, attributes, {
		left: $$props.left,
		right: $$props.right,
		top: $$props.top,
		bottom: $$props.bottom,
		width: width(),
		height: height(),
		border: border(),
		style: style(),
		content: content(),
		onclick: handleClick,
		clickable: !disabled(),
		mouse: true,
		keys: true,
		...props
	}));

	$.append($$anchor, box);
	return $.pop({ ...$.legacy_api() });
}