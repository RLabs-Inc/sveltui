import 'svelte/internal/disclose-version';

Button[$.FILENAME] = 'src/components/ui/Button.svelte';

import * as $ from 'svelte/internal/client';
import { applyThemeToProps } from '../../theme/currentTheme.svelte';

var root = $.add_locations($.template(`<box><!></box>`), Button[$.FILENAME], [[38, 0]]);

export default function Button($$anchor, $$props) {
	$.check_target(new.target);
	$.push($$props, true, Button);

	// Props with proper defaults
	let onClick = $.prop($$props, 'onClick', 3, () => {}),
		color = $.prop($$props, 'color', 3, 'primary'),
		border = $.prop($$props, 'border', 3, false),
		width = $.prop($$props, 'width', 3, 'auto'),
		height = $.prop($$props, 'height', 3, 'auto'),
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
				'onClick',
				'color',
				'border',
				'width',
				'height',
				'bold',
				'disabled',
				'style'
			],
			'props'
		);

	// Apply theme to props
	const themedProps = $.derived(() => applyThemeToProps('button', {
		color: color(),
		border: border(),
		width: width(),
		height: height(),
		bold: bold(),
		disabled: disabled(),
		style: style(),
		...props
	}));

	function handleClick(event) {
		if (!disabled() && onClick()) {
			onClick()(event);
		}
	}

	var box = root();
	let attributes;
	var node = $.child(box);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(box);

	$.template_effect(
		($0) => attributes = $.set_attributes(box, attributes, {
			...$.get(themedProps),
			onclick: handleClick,
			clickable: !disabled(),
			mouse: true,
			keys: true,
			style: $0
		}),
		[
			() => ({
				cursor: disabled() ? 'not-allowed' : 'pointer',
				...$.get(themedProps).style
			})
		]
	);

	$.append($$anchor, box);
	return $.pop({ ...$.legacy_api() });
}