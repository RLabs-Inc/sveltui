import 'svelte/internal/disclose-version';

AdvancedTextInput[$.FILENAME] = 'src/components/ui/AdvancedTextInput.svelte';

import * as $ from 'svelte/internal/client';

var root_3 = $.add_locations($.from_svg(`<text> </text>`), AdvancedTextInput[$.FILENAME], [[150, 10]]);
var root_2 = $.add_locations($.from_svg(`<text></text>`), AdvancedTextInput[$.FILENAME], [[148, 6]]);
var root_4 = $.add_locations($.from_svg(`<text></text>`), AdvancedTextInput[$.FILENAME], [[155, 6]]);
var root_5 = $.add_locations($.from_svg(`<text></text>`), AdvancedTextInput[$.FILENAME], [[166, 4]]);
var root_7 = $.add_locations($.from_svg(`<text></text>`), AdvancedTextInput[$.FILENAME], [[185, 8]]);
var root_6 = $.add_locations($.from_html(`<box border="line"></box>`), AdvancedTextInput[$.FILENAME], [[176, 4]]);
var root = $.add_locations($.from_html(`<box border="line"><!> <!> <!></box>`), AdvancedTextInput[$.FILENAME], [[134, 0]]);

export default function AdvancedTextInput($$anchor, $$props) {
	$.check_target(new.target);
	$.push($$props, true, AdvancedTextInput);

	// Advanced TextInput with full terminal capabilities
	let value = $.prop($$props, 'value', 11, ''),
		placeholder = $.prop($$props, 'placeholder', 3, 'Type here...'),
		label = $.prop($$props, 'label', 3, ''),
		width = $.prop($$props, 'width', 3, 30),
		focused = $.prop($$props, 'focused', 11, false),
		multiline = $.prop($$props, 'multiline', 3, false),
		height = $.prop($$props, 'height', 3, 3),
		onSubmit = $.prop($$props, 'onSubmit', 3, () => {}),
		onChange = $.prop($$props, 'onChange', 3, () => {}),
		onFocus = $.prop($$props, 'onFocus', 3, () => {}),
		onBlur = $.prop($$props, 'onBlur', 3, () => {}),
		history = $.prop($$props, 'history', 19, () => []),
		// Command history for up/down arrows
		style = $.prop($$props, 'style', 19, () => ({})),
		cursorStyle = $.prop($$props, 'cursorStyle', 3, 'block' // 'block', 'line', 'underline'
		),
		showCompletions = $.prop($$props, 'showCompletions', 3, false),
		completions = $.prop($$props, 'completions', 19, () => []);

	// Internal state
	let cursorPosition = $.tag($.state($.proxy(value().length)), 'cursorPosition');

	let cursorVisible = $.tag($.state(true), 'cursorVisible');
	let historyIndex = -1;
	let selectionStart = -1;
	let selectionEnd = -1;

	// Cursor blink effect
	$.user_effect(() => {
		if (focused()) {
			const interval = setInterval(
				() => {
					$.set(cursorVisible, !$.get(cursorVisible));
				},
				530
			);

			return () => clearInterval(interval);
		} else {
			$.set(cursorVisible, false);
		}
	});

	// Ensure cursor stays in bounds
	$.user_effect(() => {
		if ($.get(cursorPosition) > value().length) {
			$.set(cursorPosition, value().length, true);
		}

		if ($.get(cursorPosition) < 0) {
			$.set(cursorPosition, 0);
		}
	});

	// Get cursor character based on style
	const getCursor = () => {
		if (!$.get(cursorVisible) || !focused()) return '';

		switch (cursorStyle()) {
			case 'block':
				return '█';

			case 'line':
				return '│';

			case 'underline':
				return '_';

			default:
				return '█';
		}
	};

	// Display value with cursor and selection
	const displayLines = $.tag(
		$.derived(() => {
			if (!focused() && !value()) {
				return [{ text: placeholder(), style: { fg: 'gray' } }];
			}

			const text = value() || '';
			const lines = multiline() ? text.split('\n') : [text];

			// For single line, handle cursor
			if (!multiline()) {
				const line = lines[0];
				const cursor = getCursor();

				// Handle selection
				if (selectionStart >= 0 && selectionEnd > selectionStart) {
					const before = line.slice(0, selectionStart);
					const selected = line.slice(selectionStart, selectionEnd);
					const after = line.slice(selectionEnd);

					return [
						{
							parts: [
								{ text: before, style: {} },
								{ text: selected, style: { bg: 'blue', fg: 'white' } },
								{ text: after, style: {} }
							]
						}
					];
				}

				// Normal cursor
				if (cursor) {
					const before = line.slice(0, $.get(cursorPosition));
					const after = line.slice($.get(cursorPosition));

					return [{ text: before + cursor + after, style: {} }];
				}

				return [{ text: line, style: {} }];
			}

			// TODO: Handle multiline cursor
			return lines.map((line) => ({ text: line, style: {} }));
		}),
		'displayLines'
	);

	// Calculate display height
	const displayHeight = $.tag(
		$.derived(() => multiline()
			? Math.max(height(), $.get(displayLines)().length + 2)
			: 3),
		'displayHeight'
	);

	// Border color based on state
	const borderColor = $.tag(
		$.derived(() => {
			if (focused()) return 'cyan';
			if (value()) return 'green';

			return 'white';
		}),
		'borderColor'
	);

	// Status line
	const statusText = $.tag(
		$.derived(() => {
			if (showCompletions() && completions().length > 0) {
				return `Tab: ${completions()[0]}`;
			}

			if (multiline()) {
				const lines = value().split('\n').length;

				return `${lines} lines, ${value().length} chars`;
			}

			return `${value().length} chars`;
		}),
		'statusText'
	);

	var $$exports = { ...$.legacy_api() };
	var box = root();
	var node = $.child(box);

	$.add_svelte_meta(
		() => $.each(node, 17, () => $.get(displayLines), $.index, ($$anchor, line, i) => {
			var fragment = $.comment();
			var node_1 = $.first_child(fragment);

			{
				var consequent = ($$anchor) => {
					var text_1 = root_2();

					$.set_attribute(text_1, 'top', i);
					$.set_attribute(text_1, 'left', 1);

					$.add_svelte_meta(
						() => $.each(text_1, 21, () => $.get(line).parts, $.index, ($$anchor, part) => {
							var text_2 = root_3();
							var text_3 = $.child(text_2, true);

							$.reset(text_2);

							$.template_effect(() => {
								$.set_style(text_2, $.get(part).style);
								$.set_text(text_3, $.get(part).text);
							});

							$.append($$anchor, text_2);
						}),
						'each',
						AdvancedTextInput,
						149,
						8
					);

					$.reset(text_1);
					$.append($$anchor, text_1);
				};

				var alternate = ($$anchor) => {
					var text_4 = root_4();

					$.set_attribute(text_4, 'top', i);
					$.set_attribute(text_4, 'left', 1);

					$.template_effect(() => {
						$.set_attribute(text_4, 'content', $.get(line).text);
						$.set_style(text_4, $.get(line).style);
					});

					$.append($$anchor, text_4);
				};

				$.add_svelte_meta(
					() => $.if(node_1, ($$render) => {
						if ($.get(line).parts) $$render(consequent); else $$render(alternate, false);
					}),
					'if',
					AdvancedTextInput,
					146,
					4
				);
			}

			$.append($$anchor, fragment);
		}),
		'each',
		AdvancedTextInput,
		145,
		2
	);

	var node_2 = $.sibling(node, 2);

	{
		var consequent_1 = ($$anchor) => {
			var text_5 = root_5();

			$.set_attribute(text_5, 'bottom', 0);
			$.set_attribute(text_5, 'right', 1);
			$.set_style(text_5, { fg: 'gray' });
			$.template_effect(() => $.set_attribute(text_5, 'content', $.get(statusText)));
			$.append($$anchor, text_5);
		};

		$.add_svelte_meta(
			() => $.if(node_2, ($$render) => {
				if (focused() && (multiline() || showCompletions())) $$render(consequent_1);
			}),
			'if',
			AdvancedTextInput,
			165,
			2
		);
	}

	var node_3 = $.sibling(node_2, 2);

	{
		var consequent_2 = ($$anchor) => {
			var box_1 = root_6();

			$.set_attribute(box_1, 'left', 0);
			$.set_style(box_1, { border: { fg: 'yellow' } });

			$.add_svelte_meta(
				() => $.each(box_1, 21, () => completions().slice(0, 3), $.index, ($$anchor, completion, i) => {
					var text_6 = root_7();

					$.set_attribute(text_6, 'top', i);
					$.set_attribute(text_6, 'left', 1);
					$.set_style(text_6, { fg: $.strict_equals(i, 0) ? 'yellow' : 'white' });
					$.template_effect(() => $.set_attribute(text_6, 'content', $.get(completion)));
					$.append($$anchor, text_6);
				}),
				'each',
				AdvancedTextInput,
				184,
				6
			);

			$.reset(box_1);

			$.template_effect(
				($0) => {
					$.set_attribute(box_1, 'top', $.get(displayHeight));
					$.set_attribute(box_1, 'width', width());
					$.set_attribute(box_1, 'height', $0);
				},
				[() => Math.min(completions().length + 2, 5)]
			);

			$.append($$anchor, box_1);
		};

		$.add_svelte_meta(
			() => $.if(node_3, ($$render) => {
				if (focused() && showCompletions() && completions().length > 0) $$render(consequent_2);
			}),
			'if',
			AdvancedTextInput,
			175,
			2
		);
	}

	$.reset(box);

	$.template_effect(
		($0) => {
			$.set_attribute(box, 'width', width());
			$.set_attribute(box, 'height', $.get(displayHeight));
			$.set_attribute(box, 'label', label() ? ` ${label()} ` : '');
			$.set_style(box, $0);
		},
		[() => ({ border: { fg: $.get(borderColor) }, ...style() })]
	);

	$.append($$anchor, box);

	return $.pop($$exports);
}