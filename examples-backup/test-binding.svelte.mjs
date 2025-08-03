import 'svelte/internal/disclose-version';

Test_binding[$.FILENAME] = 'examples/test-binding.svelte';

import * as $ from 'svelte/internal/client';
import { Box, Text, Input } from '../src/components/ui/index.ts';

var root_1 = $.add_locations($.template(`<!> <!> <!> <!>`, 1), Test_binding[$.FILENAME], []);

export default function Test_binding($$anchor, $$props) {
	$.check_target(new.target);
	$.push($$props, true, Test_binding);

	// Simple bindable value
	let inputValue = $.state('Type here...');

	// Handler for key events
	function handleKeydown(event) {
		if ($.strict_equals(event.key, 'q')) {
			console.log('Quitting...');
			process.exit(0);
		}
	}

	Box($$anchor, {
		width: '100%',
		height: '100%',
		border: 'line',
		label: ' Input Binding Test ',
		onkeydown: handleKeydown,
		keys: true,
		focusable: true,
		children: $.wrap_snippet(Test_binding, ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			Text(node, {
				left: 1,
				top: 1,
				bold: true,
				children: $.wrap_snippet(Test_binding, ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Enter some text:');

					$.append($$anchor, text);
				}),
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			Input(node_1, {
				left: 1,
				top: 3,
				width: '50%',
				height: 1,
				border: true,
				focusable: true,
				keys: true,
				get value() {
					return $.get(inputValue);
				},
				set value($$value) {
					$.set(inputValue, $$value, true);
				}
			});

			var node_2 = $.sibling(node_1, 2);

			Text(node_2, {
				left: 1,
				top: 5,
				children: $.wrap_snippet(Test_binding, ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text();

					$.template_effect(() => $.set_text(text_1, `You typed: ${$.get(inputValue) ?? ''}`));
					$.append($$anchor, text_1);
				}),
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			Text(node_3, {
				left: 1,
				bottom: 1,
				fg: 'cyan',
				children: $.wrap_snippet(Test_binding, ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Press Tab to focus input, Enter to submit, q to quit');

					$.append($$anchor, text_2);
				}),
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		}),
		$$slots: { default: true }
	});

	return $.pop({ ...$.legacy_api() });
}