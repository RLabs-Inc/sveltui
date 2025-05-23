import 'svelte/internal/disclose-version';

Checkbox[$.FILENAME] = 'src/components/ui/Checkbox.svelte';

import * as $ from 'svelte/internal/client';
import { createEventDispatcher } from 'svelte';

var root = $.add_locations(
	$.template(
		`/**
 * Checkbox Component
 * 
 * A checkbox input component for boolean selection
 */  <button></button>`,
		1
	),
	Checkbox[$.FILENAME],
	[[106, 0]]
);

export default function Checkbox($$anchor, $$props) {
	$.check_target(new.target);
	$.push($$props, true, Checkbox);

	const dispatch = createEventDispatcher();

	// Define component props with defaults
	let left = $.prop($$props, 'left', 3, 0),
		top = $.prop($$props, 'top', 3, 0),
		width = $.prop($$props, 'width', 3, 'shrink'),
		height = $.prop($$props, 'height', 3, 1),
		checked = $.prop($$props, 'checked', 11, false),
		label = $.prop($$props, 'label', 3, ''),
		disabled = $.prop($$props, 'disabled', 3, false),
		border = $.prop($$props, 'border', 3, false),
		checkedChar = $.prop($$props, 'checkedChar', 3, '✓'),
		uncheckedChar = $.prop($$props, 'uncheckedChar', 3, '☐'),
		style = $.prop($$props, 'style', 19, () => ({})),
		focusable = $.prop($$props, 'focusable', 3, true),
		keys = $.prop($$props, 'keys', 3, true),
		mouse = $.prop($$props, 'mouse', 3, true),
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
				'checked',
				'label',
				'disabled',
				'border',
				'checkedChar',
				'uncheckedChar',
				'style',
				'focusable',
				'keys',
				'mouse',
				'zIndex',
				'hidden'
			],
			'restProps'
		);

	// Track checkbox state internally
	let isChecked = $.state($.proxy(checked()));

	$.user_effect(() => {
		$.set(isChecked, checked());
	});

	// Convert border prop to blessed-compatible value
	let borderValue = $.derived(() => $.strict_equals(typeof border(), 'boolean') ? border() ? 'line' : false : border());
	// Current checkbox character
	let currentChar = $.derived(() => $.get(isChecked) ? checkedChar() : uncheckedChar());
	// Full content with label
	let content = $.derived(() => `${$.get(currentChar)} ${label()}`);

	// Handle toggle
	function handleToggle() {
		if (disabled()) return;
		$.set(isChecked, !$.get(isChecked));
		dispatch('change', { checked: $.get(isChecked) });
	}

	// Handle keypress events
	function handleKeypress(event) {
		if (disabled()) return;

		if ($.strict_equals(event.key, 'enter') || $.strict_equals(event.key, ' ')) {
			handleToggle();
		}
	}

	// Handle mouse events
	function handleClick() {
		handleToggle();
	}

	function focus() {
		// This will be handled by the runtime DOM connector
		dispatch('focus');
	}

	$.next();

	var fragment = root();
	var button = $.sibling($.first_child(fragment));
	let attributes;

	$.template_effect(() => attributes = $.set_attributes(button, attributes, {
		left: left(),
		top: top(),
		right: $$props.right,
		bottom: $$props.bottom,
		width: width(),
		height: height(),
		content: $.get(content),
		border: $.get(borderValue),
		style: style(),
		keys: keys(),
		mouse: mouse(),
		focusable: focusable() && !disabled(),
		zIndex: $$props.zIndex,
		hidden: hidden(),
		onkeypress: handleKeypress,
		onpress: handleClick,
		...restProps
	}));

	$.append($$anchor, fragment);

	return $.pop({
		get focus() {
			return focus;
		},
		...$.legacy_api()
	});
}