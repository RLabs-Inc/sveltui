import 'svelte/internal/disclose-version';

Box[$.FILENAME] = 'src/components/Box.svelte';

import * as $ from 'svelte/internal/client';

import {
	ComponentType,
	borderStyles,
	colors,
	scrollOffset,
	scrollable,
	maxScrollOffset,
	computedHeight,
	focus
} from '../core/state/engine.svelte.js';

import { getTheme } from '../theme/theme.svelte.js';
import { parseColor } from '../utils/bun-color.mjs';
import { useSimpleComponent } from './base-component-simple.svelte.js';
import { keyboard } from '../input/keyboard.svelte.js';
import { createSubscriber } from 'svelte/reactivity';

export default function Box($$anchor, $$props) {
	$.check_target(new.target);
	$.push($$props, true, Box);

	const theme = getTheme();

	// Props - extends simplified component props
	// Visual
	// Focus state binding
	let // Visual
		border = $.prop($$props, 'border', 3, 'none'),
		// Focus state
		focused = $.prop($$props, 'focused', 15, false),
		// All other props from SimpleComponentProps (includes onfocus, onblur)
		baseProps = $.rest_props(
			$$props,
			[
				'$$slots',
				'$$events',
				'$$legacy',
				'children',
				'border',
				'borderColor',
				'backgroundColor',
				'variant',
				'focused'
			],
			'baseProps'
		);

	// Create base component
	const component = useSimpleComponent(ComponentType.BOX, baseProps, true); // Can have children

	const index = component.getIndex();

	// Update visual properties when they change
	$.user_effect(() => {
		// Border style
		borderStyles[index] = $.strict_equals(border(), 'single')
			? 1
			: $.strict_equals(border(), 'double')
				? 2
				: $.strict_equals(border(), 'rounded')
					? 3
					: $.strict_equals(border(), 'bold')
						? 4
						: $.strict_equals(border(), 'dashed') ? 5 : $.strict_equals(border(), 'dotted') ? 6 : 0;

		// Border color with theme support
		let finalBorderColor = $$props.borderColor ? parseColor($$props.borderColor) : undefined;

		if (!finalBorderColor && $$props.variant) {
			finalBorderColor = theme().colors[$$props.variant];
		}

		// Background color with theme support
		let finalBgColor = $$props.backgroundColor ? parseColor($$props.backgroundColor) : undefined;

		colors[index * 2] = finalBorderColor;
		colors[index * 2 + 1] = finalBgColor;
	});

	// Watch for prop changes and update base component
	$.user_effect(() => {
		component.updateProps(baseProps);
	});

	// Update bindable focused state and call focus callbacks
	$.user_effect(() => {
		const wasFocused = focused();

		focused($.strict_equals(focus.value, index));

		// Call focus callbacks when focus changes
		if (focused() && !wasFocused && $$props.onfocus) {
			$$props.onfocus();
		} else if (!focused() && wasFocused && $$props.onblur) {
			$$props.onblur();
		}
	});

	// Setup keyboard scrolling with createSubscriber
	// This will automatically subscribe when the component is focused
	const keyboardSubscribe = createSubscriber((update) => {
		return keyboard.onFocused(index, (event) => {
			// Only handle if this box is scrollable (auto-detected by layout)
			if (!scrollable[index]) return;

			const currentOffset = scrollOffset[index] || 0;
			const maxOffset = maxScrollOffset[index] || 0;

			switch (event.key) {
				case 'ArrowUp':
					if (currentOffset > 0) {
						scrollOffset[index] = Math.max(0, currentOffset - 1);
						update(); // Notify subscribers of the change

						return true; // Prevent default
					}
					break;

				case 'ArrowDown':
					if (currentOffset < maxOffset) {
						scrollOffset[index] = Math.min(maxOffset, currentOffset + 1);
						update();

						return true;
					}
					break;

				case 'PageUp':
					if (currentOffset > 0) {
						const pageSize = Math.max(1, (computedHeight[index] || 10) - 2); // Account for borders

						scrollOffset[index] = Math.max(0, currentOffset - pageSize);
						update();

						return true;
					}
					break;

				case 'PageDown':
					if (currentOffset < maxOffset) {
						const pageSize = Math.max(1, (computedHeight[index] || 10) - 2);

						scrollOffset[index] = Math.min(maxOffset, currentOffset + pageSize);
						update();

						return true;
					}
					break;
			}
		});
	});

	// Subscribe to keyboard events - this activates the subscription
	$.user_effect(() => {
		keyboardSubscribe();
	});

	var $$exports = { ...$.legacy_api() };
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.add_svelte_meta(() => $.snippet(node_1, () => $$props.children), 'render', Box, 145, 2);
			$.append($$anchor, fragment_1);
		};

		$.add_svelte_meta(
			() => $.if(node, ($$render) => {
				if ($$props.children) $$render(consequent);
			}),
			'if',
			Box,
			144,
			0
		);
	}

	$.append($$anchor, fragment);

	return $.pop($$exports);
}