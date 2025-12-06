import 'svelte/internal/disclose-version';

Input[$.FILENAME] = 'src/components/Input.svelte';

import * as $ from 'svelte/internal/client';
import { getEngine } from '../core/state/engine.svelte.js';
import { keyboard } from '../input/keyboard.svelte.js';
import { onMount, onDestroy } from 'svelte';

export default function Input($$anchor, $$props) {
	$.check_target(new.target);
	$.push($$props, true, Input);

	const engine = getEngine();

	// Props
	let value = $.prop($$props, 'value', 15, ''),
		placeholder = $.prop($$props, 'placeholder', 3, ''),
		maxLength = $.prop($$props, 'maxLength', 19, () => -1),
		x = $.prop($$props, 'x', 3, 0),
		y = $.prop($$props, 'y', 3, 0),
		width = $.prop($$props, 'width', 3, 20);

	// Create component in engine
	const id = `input-${Math.random()}`;

	const index = engine().allocateIndex(id);

	// Set component type
	engine().componentType[index] = 4; // INPUT

	// Initialize positions - update when props change!
	$.user_effect(() => {
		engine().positions[index * 4] = x();
		engine().positions[index * 4 + 1] = y();
		engine().positions[index * 4 + 2] = width();
		engine().positions[index * 4 + 3] = 1;
	});

	// Update input properties when they change
	$.user_effect(() => {
		engine().inputValue[index] = value();
		engine().cursorPosition[index] = value().length;
	});

	$.user_effect(() => {
		engine().placeholder[index] = placeholder();
		engine().maxLength[index] = maxLength();
	});

	engine().focusable[index] = true;
	engine().tabIndex[index] = 0;
	engine().visibility[index] = true;

	// Subscribe to keyboard events when focused
	let unsubscribeKeyboard = null;

	onMount(() => {
		unsubscribeKeyboard = keyboard.onFocused(index, (event) => {
			// Call user's handler first
			if ($$props.onkeydown) {
				$$props.onkeydown(event);

				// Check if event was consumed by user handler
				// For now, assume it wasn't unless they return true
			}

			// Default input behavior
			const cursor = engine().cursorPosition[index];

			const key = event.key;

			if ($.strict_equals(key.length, 1) && !event.ctrlKey && !event.altKey && key.charCodeAt(0) >= 32) {
				if ($.strict_equals(maxLength(), -1) || value().length < maxLength()) {
					value(value().slice(0, cursor) + key + value().slice(cursor));
					engine().inputValue[index] = value();
					engine().cursorPosition[index]++;
					$$props.onchange?.(value());
				}

				return true; // Consume the event
			} else if ($.strict_equals(key, 'Backspace') && cursor > 0) {
				value(value().slice(0, cursor - 1) + value().slice(cursor));
				engine().inputValue[index] = value();
				engine().cursorPosition[index]--;
				$$props.onchange?.(value());

				return true;
			} else if ($.strict_equals(key, 'Delete') && cursor < value().length) {
				value(value().slice(0, cursor) + value().slice(cursor + 1));
				engine().inputValue[index] = value();
				$$props.onchange?.(value());

				return true;
			} else if ($.strict_equals(key, 'ArrowLeft') && cursor > 0) {
				engine().cursorPosition[index]--;

				return true;
			} else if ($.strict_equals(key, 'ArrowRight') && cursor < value().length) {
				engine().cursorPosition[index]++;

				return true;
			} else if ($.strict_equals(key, 'Home')) {
				engine().cursorPosition[index] = 0;

				return true;
			} else if ($.strict_equals(key, 'End')) {
				engine().cursorPosition[index] = value().length;

				return true;
			} else if ($.strict_equals(key, 'Ctrl+A')) {
				engine().selectionStart[index] = 0;
				engine().selectionEnd[index] = value().length;

				return true;
			} else if ($.strict_equals(key, 'Ctrl+K')) {
				value(value().slice(0, cursor));
				engine().inputValue[index] = value();
				$$props.onchange?.(value());

				return true;
			} else if ($.strict_equals(key, 'Ctrl+U')) {
				value(value().slice(cursor));
				engine().inputValue[index] = value();
				engine().cursorPosition[index] = 0;
				$$props.onchange?.(value());

				return true;
			}
		});
	});

	// Watch focus state reactively
	const isFocused = $.tag($.derived(() => $.strict_equals(engine().focusedIndex, index)), 'isFocused');

	let wasFocused = false;

	// Call handlers when focus changes
	$.user_effect(() => {
		if ($.get(isFocused) && !wasFocused) {
			$$props.onfocus?.();
			wasFocused = true;
		} else if (!$.get(isFocused) && wasFocused) {
			$$props.onblur?.();
			wasFocused = false;
		}
	});

	// Cleanup
	onDestroy(() => {
		if (unsubscribeKeyboard) unsubscribeKeyboard();

		engine().releaseIndex(id);
	});

	var $$exports = { ...$.legacy_api() };

	return $.pop($$exports);
}