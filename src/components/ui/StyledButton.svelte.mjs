import 'svelte/internal/disclose-version';

StyledButton[$.FILENAME] = 'src/components/ui/StyledButton.svelte';

import * as $ from 'svelte/internal/client';
import { createStyleState } from '../../dom/style-state.svelte.ts';
import { createStyle, mergeStyles } from '../../dom/style-utils';

var root_1 = $.add_locations($.ns_template(`<text align="center" content="Loading..."></text>`), StyledButton[$.FILENAME], [[165, 4]]);
var root = $.add_locations($.template(`<box><!></box>`), StyledButton[$.FILENAME], [[142, 0]]);

export default function StyledButton($$anchor, $$props) {
	$.check_target(new.target);
	$.push($$props, true, StyledButton);

	// Component props
	let onclick = $.prop($$props, 'onclick', 3, () => {}),
		variant = $.prop($$props, 'variant', 3, 'primary'),
		size = $.prop($$props, 'size', 3, 'medium'),
		disabled = $.prop($$props, 'disabled', 3, false),
		loading = $.prop($$props, 'loading', 3, false),
		top = $.prop($$props, 'top', 3, 0),
		left = $.prop($$props, 'left', 3, 0),
		width = $.prop($$props, 'width', 3, 'shrink'),
		height = $.prop($$props, 'height', 3, 3),
		normalStyle = $.prop($$props, 'normalStyle', 19, () => ({})),
		hoverStyle = $.prop($$props, 'hoverStyle', 19, () => ({})),
		focusStyle = $.prop($$props, 'focusStyle', 19, () => ({})),
		pressedStyle = $.prop($$props, 'pressedStyle', 19, () => ({})),
		props = $.rest_props(
			$$props,
			[
				'$$slots',
				'$$events',
				'$$legacy',
				'children',
				'onclick',
				'variant',
				'size',
				'disabled',
				'loading',
				'top',
				'left',
				'right',
				'bottom',
				'width',
				'height',
				'normalStyle',
				'hoverStyle',
				'focusStyle',
				'pressedStyle'
			],
			'props'
		);

	// Define variant styles
	const variantStyles = {
		primary: {
			normal: { fg: 'white', bg: 'blue' },
			hover: { bg: 'cyan' },
			focus: { border: { fg: 'yellow' } },
			pressed: { bg: 'magenta' }
		},
		secondary: {
			normal: { fg: 'white', bg: 'gray' },
			hover: { bg: 'white', fg: 'black' },
			focus: { border: { fg: 'white' } },
			pressed: { inverse: true }
		},
		danger: {
			normal: { fg: 'white', bg: 'red' },
			hover: { bg: 'brightred' },
			focus: { border: { fg: 'yellow' } },
			pressed: { bg: 'magenta' }
		},
		success: {
			normal: { fg: 'white', bg: 'green' },
			hover: { bg: 'brightgreen' },
			focus: { border: { fg: 'yellow' } },
			pressed: { bg: 'cyan' }
		}
	};

	// Define size styles
	const sizeStyles = {
		small: { height: 1, padding: { left: 1, right: 1 } },
		medium: { height: 3, padding: { left: 2, right: 2 } },
		large: { height: 5, padding: { left: 3, right: 3 } }
	};

	// Create the style state machine
	const styleState = createStyleState({
		normal: mergeStyles(
			createStyle({
				border: { type: 'line' },
				...variantStyles[variant()].normal
			}),
			normalStyle()
		),
		hover: mergeStyles(variantStyles[variant()].hover, hoverStyle()),
		focus: mergeStyles(variantStyles[variant()].focus, focusStyle()),
		pressed: mergeStyles(variantStyles[variant()].pressed, pressedStyle())
	});

	// Computed disabled style
	let computedStyle = $.derived(() => {
		if (disabled()) {
			return mergeStyles(styleState.blessedStyle, {
				fg: 'gray',
				bg: 'black',
				border: { fg: 'gray' }
			});
		}

		return styleState.blessedStyle;
	});

	// Event handlers
	function handleClick(event) {
		if (!disabled() && !loading()) {
			onclick()?.(event);
		}
	}

	function handleMouseOver() {
		if (!disabled()) styleState.setHovered(true);
	}

	function handleMouseOut() {
		styleState.setHovered(false);
	}

	function handleMouseDown() {
		if (!disabled()) styleState.setPressed(true);
	}

	function handleMouseUp() {
		styleState.setPressed(false);
	}

	function handleFocus() {
		if (!disabled()) styleState.setFocused(true);
	}

	function handleBlur() {
		styleState.setFocused(false);
	}

	// Computed dimensions based on size
	let computedHeight = $.derived(() => sizeStyles[size()].height);
	let computedPadding = $.derived(() => sizeStyles[size()].padding);
	var box = root();
	let attributes;
	var node = $.child(box);

	{
		var consequent = ($$anchor) => {
			var text = root_1();

			$.set_style(text, { fg: 'gray' });
			$.append($$anchor, text);
		};

		var alternate = ($$anchor, $$elseif) => {
			{
				var consequent_1 = ($$anchor) => {
					var fragment = $.comment();
					var node_1 = $.first_child(fragment);

					$.snippet(node_1, () => $$props.children);
					$.append($$anchor, fragment);
				};

				$.if(
					$$anchor,
					($$render) => {
						if ($$props.children) $$render(consequent_1);
					},
					$$elseif
				);
			}
		};

		$.if(node, ($$render) => {
			if (loading()) $$render(consequent); else $$render(alternate, false);
		});
	}

	$.reset(box);

	$.template_effect(() => attributes = $.set_attributes(box, attributes, {
		top: top(),
		left: left(),
		right: $$props.right,
		bottom: $$props.bottom,
		width: width(),
		height: $.strict_equals(height(), 'shrink') ? $.get(computedHeight) : height(),
		style: $.get(computedStyle),
		onclick: handleClick,
		onmouseover: handleMouseOver,
		onmouseout: handleMouseOut,
		onmousedown: handleMouseDown,
		onmouseup: handleMouseUp,
		onfocus: handleFocus,
		onblur: handleBlur,
		clickable: !disabled() && !loading(),
		mouse: true,
		keys: true,
		focusable: !disabled(),
		padding: $.get(computedPadding),
		...props
	}));

	$.append($$anchor, box);
	return $.pop({ ...$.legacy_api() });
}