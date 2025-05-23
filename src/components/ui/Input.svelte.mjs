import 'svelte/internal/disclose-version';

Input[$.FILENAME] = 'src/components/ui/Input.svelte';

import * as $ from 'svelte/internal/client';
import { createEventDispatcher } from 'svelte';

var root = $.add_locations(
	$.template(
		`/**
 * Input Component
 * 
 * A text input component for user input
 */ <input>`,
		1
	),
	Input[$.FILENAME],
	[[117, 0]]
);

export default function Input($$anchor, $$props) {
	$.check_target(new.target);
	$.push($$props, true, Input);

	const dispatch = createEventDispatcher();

	// Define component props with defaults
	let left = $.prop($$props, 'left', 3, 0),
		top = $.prop($$props, 'top', 3, 0),
		width = $.prop($$props, 'width', 3, '50%'),
		height = $.prop($$props, 'height', 3, 1),
		value = $.prop($$props, 'value', 11, ''),
		placeholder = $.prop($$props, 'placeholder', 3, ''),
		secret = $.prop($$props, 'secret', 3, false),
		disabled = $.prop($$props, 'disabled', 3, false),
		border = $.prop($$props, 'border', 3, false),
		style = $.prop($$props, 'style', 19, () => ({})),
		focusable = $.prop($$props, 'focusable', 3, true),
		inputOnFocus = $.prop($$props, 'inputOnFocus', 3, true),
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
				'value',
				'placeholder',
				'secret',
				'disabled',
				'maxLength',
				'border',
				'style',
				'focusable',
				'inputOnFocus',
				'keys',
				'mouse',
				'zIndex',
				'hidden'
			],
			'restProps'
		);

	// Track input value internally
	let inputValue = $.state($.proxy(value()));

	$.user_effect(() => {
		$.set(inputValue, value());
	});

	// Convert border prop to blessed-compatible value
	let borderValue = $.derived(() => $.strict_equals(typeof border(), 'boolean') ? border() ? 'line' : false : border());

	// Handle value change
	function handleChange(event) {
		if (disabled()) return;

		const newValue = event.value;

		// Apply maxLength restriction if specified
		if ($.strict_equals($$props.maxLength, undefined, false) && newValue.length > $$props.maxLength) {
			return;
		}

		$.set(inputValue, newValue, true);
		dispatch('change', { value: newValue });
	}

	// Handle submit event (Enter key)
	function handleSubmit() {
		if (disabled()) return;
		dispatch('submit', { value: $.get(inputValue) });
	}

	function focus() {
		// This will be handled by the runtime DOM connector
		dispatch('focus');
	}

	function selectAll() {
		// This will be handled by the runtime DOM connector
		dispatch('selectAll');
	}

	function clear() {
		$.set(inputValue, '');
		dispatch('change', { value: '' });
	}

	$.next();

	var fragment = root();
	var input = $.sibling($.first_child(fragment));

	$.remove_input_defaults(input);

	let attributes;

	$.template_effect(() => attributes = $.set_attributes(input, attributes, {
		left: left(),
		top: top(),
		right: $$props.right,
		bottom: $$props.bottom,
		width: width(),
		height: height(),
		value: $.get(inputValue),
		placeholder: placeholder(),
		secret: secret(),
		disabled: disabled(),
		border: $.get(borderValue),
		style: style(),
		keys: keys(),
		mouse: mouse(),
		inputOnFocus: inputOnFocus(),
		focusable: focusable(),
		zIndex: $$props.zIndex,
		hidden: hidden(),
		onchange: handleChange,
		onsubmit: handleSubmit,
		...restProps
	}));

	$.append($$anchor, fragment);

	return $.pop({
		get focus() {
			return focus;
		},
		get selectAll() {
			return selectAll;
		},
		get clear() {
			return clear;
		},
		...$.legacy_api()
	});
}