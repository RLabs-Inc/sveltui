import 'svelte/internal/disclose-version';

TextInput[$.FILENAME] = 'src/components/ui/TextInput.svelte';

import * as $ from 'svelte/internal/client';

// Handle keyboard input
function handleKeydown(
	e,
	focused,
	cursorPosition,
	value,
	onSubmit
) {
	if (!focused()) return;

	// Debug logging to see what keys are coming through
	if ($.strict_equals(e.key, e.key.toLowerCase(), false) || [
		'ArrowLeft',
		'ArrowRight',
		'Backspace',
		'Delete',
		'Home',
		'End'
	].includes(e.key)) {}

	// Only log special keys to avoid cluttering with regular typing
	// console.log('[TextInput] Key event:', { key: e.key, code: e.code, keyCode: e.keyCode });
	switch (e.key) {
		case 'ArrowLeft':
			e.preventDefault();
			$.set(cursorPosition, Math.max(0, $.get(cursorPosition) - 1), true);
			break;

		case 'ArrowRight':
			e.preventDefault();
			$.set(cursorPosition, Math.min(value().length, $.get(cursorPosition) + 1), true);
			break;

		case 'Home':
			e.preventDefault();
			$.set(cursorPosition, 0);
			break;

		case 'End':
			e.preventDefault();
			$.set(cursorPosition, value().length, true);
			break;

		case 'Backspace':
			e.preventDefault();
			if ($.get(cursorPosition) > 0) {
				value(value().slice(0, $.get(cursorPosition) - 1) + value().slice($.get(cursorPosition)));
				$.update(cursorPosition, -1);
			}
			break;

		case 'Delete':
			e.preventDefault();
			if ($.get(cursorPosition) < value().length) {
				value(value().slice(0, $.get(cursorPosition)) + value().slice($.get(cursorPosition) + 1));
			}
			break;

		case 'Enter':
			e.preventDefault();
			onSubmit()(value());
			break;

		default:
			// Insert character if it's a printable character
			if ($.strict_equals(e.key.length, 1) && !e.ctrlKey && !e.altKey && !e.metaKey) {
				value(value().slice(0, $.get(cursorPosition)) + e.key + value().slice($.get(cursorPosition)));
				$.update(cursorPosition);
			}
	}
}

var root = $.add_locations($.template(`<box border="line"><text></text></box>`), TextInput[$.FILENAME], [[101, 0, [[113, 2]]]]);

export default function TextInput($$anchor, $$props) {
	$.check_target(new.target);
	$.push($$props, true, TextInput);

	let value = $.prop($$props, 'value', 15, ''),
		placeholder = $.prop($$props, 'placeholder', 3, ''),
		label = $.prop($$props, 'label', 3, ''),
		width = $.prop($$props, 'width', 3, 30),
		focused = $.prop($$props, 'focused', 3, false),
		onSubmit = $.prop($$props, 'onSubmit', 3, () => {}),
		style = $.prop($$props, 'style', 19, () => ({}));

	let cursorVisible = $.state(true);
	let cursorPosition = $.state($.proxy(value().length));

	$.user_effect(() => {
		if (focused()) {
			const interval = setInterval(
				() => {
					$.set(cursorVisible, !$.get(cursorVisible));
				},
				500
			);

			return () => clearInterval(interval);
		} else {
			$.set(cursorVisible, false);
		}
	});

	// Display value with cursor
	const displayValue = $.derived(() => {
		if (!focused()) return value() || placeholder();

		const text = value() || '';
		const cursor = $.get(cursorVisible) ? '█' : ' ';

		if ($.get(cursorPosition) >= text.length) {
			return text + cursor;
		}

		return text.slice(0, $.get(cursorPosition)) + cursor + text.slice($.get(cursorPosition) + 1);
	});

	// Style for placeholder
	const textStyle = $.derived(() => !value() && !focused() ? { fg: 'gray', ...style() } : style());
	var box = root();

	$.set_attribute(box, 'height', 3);

	box.__keydown = [
		handleKeydown,
		focused,
		cursorPosition,
		value,
		onSubmit
	];

	var text_1 = $.child(box);

	$.set_attribute(text_1, 'top', 0);
	$.set_attribute(text_1, 'left', 1);
	$.reset(box);

	$.template_effect(
		($0) => {
			$.set_attribute(box, 'width', width());
			$.set_attribute(box, 'label', label() ? ` ${label()} ` : '');
			$.set_style(box, $0);
			$.set_attribute(box, 'focused', focused());
			$.set_attribute(text_1, 'content', $.get(displayValue));
			$.set_style(text_1, $.get(textStyle));
		},
		[
			() => ({
				border: { fg: focused() ? 'cyan' : 'white' },
				...style()
			})
		]
	);

	$.append($$anchor, box);
	return $.pop({ ...$.legacy_api() });
}

$.delegate(['keydown']);