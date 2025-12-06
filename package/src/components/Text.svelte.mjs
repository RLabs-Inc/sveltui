import 'svelte/internal/disclose-version';

Text[$.FILENAME] = 'src/components/Text.svelte';

import * as $ from 'svelte/internal/client';
import { ComponentType, colors, textStyles, texts } from '../core/state/engine.svelte.js';
import { getTheme } from '../theme/theme.svelte.js';
import { parseColor } from '../utils/bun-color.mjs';
import { useSimpleComponent } from './base-component-simple.svelte.js';

export default function Text($$anchor, $$props) {
	$.check_target(new.target);
	$.push($$props, true, Text);

	const theme = getTheme();

	// Props - extends simplified component props
	let bold = $.prop($$props, 'bold', 3, false),
		italic = $.prop($$props, 'italic', 3, false),
		underline = $.prop($$props, 'underline', 3, false),
		strikethrough = $.prop($$props, 'strikethrough', 3, false),
		dim = $.prop($$props, 'dim', 3, false),
		muted = $.prop($$props, 'muted', 3, false),
		bright = $.prop($$props, 'bright', 3, false),
		// All other props from SimpleComponentProps
		baseProps = $.rest_props(
			$$props,
			[
				'$$slots',
				'$$events',
				'$$legacy',
				'text',
				'color',
				'backgroundColor',
				'bold',
				'italic',
				'underline',
				'strikethrough',
				'dim',
				'muted',
				'bright',
				'variant'
			],
			'baseProps'
		);

	// Create base component
	const component = useSimpleComponent(ComponentType.TEXT, baseProps, false); // No children

	const index = component.getIndex();

	// Update text content
	$.user_effect(() => {
		texts[index] = $$props.text;
	});

	// Update visual properties
	$.user_effect(() => {
		// Text style flags
		let flags = 0;

		if (bold()) flags |= 1;
		if (italic()) flags |= 2;
		if (underline()) flags |= 4;
		if (strikethrough()) flags |= 8;
		if (dim()) flags |= 16;

		textStyles[index] = flags;

		// Colors with theme support
		let finalColor = $$props.color ? parseColor($$props.color) : undefined;

		// Apply theme colors based on priority: explicit color > variant > muted/bright
		if (!finalColor) {
			if ($$props.variant) {
				finalColor = theme().colors[$$props.variant] || theme().colors.text;
			} else if (muted()) {
				finalColor = theme().colors.textMuted;
			} else if (bright()) {
				finalColor = theme().colors.textBright;
			}
		}

		let finalBgColor = $$props.backgroundColor ? parseColor($$props.backgroundColor) : undefined;

		colors[index * 2] = finalColor;
		colors[index * 2 + 1] = finalBgColor;
	});

	// Watch for prop changes and update base component
	$.user_effect(() => {
		component.updateProps(baseProps);
	});

	var $$exports = { ...$.legacy_api() };

	return $.pop($$exports);
}