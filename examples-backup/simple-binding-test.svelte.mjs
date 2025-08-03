import 'svelte/internal/disclose-version';

Simple_binding_test[$.FILENAME] = 'examples/simple-binding-test.svelte';

import * as $ from 'svelte/internal/client';
import { Box, Text, Input, Checkbox } from '../src/components/ui/index.ts';

var root_1 = $.add_locations($.template(`<!> <!> <!> <!> <!> <!> <!> <!>`, 1), Simple_binding_test[$.FILENAME], []);

export default function Simple_binding_test($$anchor, $$props) {
	$.check_target(new.target);
	$.push($$props, true, Simple_binding_test);

	// Test state
	let inputValue = $.state('Hello SvelTUI!');
	let isChecked = $.state(false);
	// Derived values to show reactivity
	let uppercaseValue = $.derived(() => $.get(inputValue).toUpperCase());
	let characterCount = $.derived(() => $.get(inputValue).length);

	Box($$anchor, {
		width: '100%',
		height: '100%',
		border: 'line',
		label: ' Simple Binding Test ',
		children: $.wrap_snippet(Simple_binding_test, ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			Text(node, {
				left: 1,
				top: 1,
				bold: true,
				children: $.wrap_snippet(Simple_binding_test, ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Input Test:');

					$.append($$anchor, text);
				}),
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			Input(node_1, {
				left: 1,
				top: 3,
				width: 30,
				height: 1,
				border: true,
				placeholder: 'Type something...',
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
				children: $.wrap_snippet(Simple_binding_test, ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text();

					$.template_effect(() => $.set_text(text_1, `Current value: ${$.get(inputValue) ?? ''}`));
					$.append($$anchor, text_1);
				}),
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			Text(node_3, {
				left: 1,
				top: 6,
				children: $.wrap_snippet(Simple_binding_test, ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text();

					$.template_effect(() => $.set_text(text_2, `Uppercase: ${$.get(uppercaseValue) ?? ''}`));
					$.append($$anchor, text_2);
				}),
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_3, 2);

			Text(node_4, {
				left: 1,
				top: 7,
				children: $.wrap_snippet(Simple_binding_test, ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text();

					$.template_effect(() => $.set_text(text_3, `Length: ${$.get(characterCount) ?? ''} characters`));
					$.append($$anchor, text_3);
				}),
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_4, 2);

			Checkbox(node_5, {
				left: 1,
				top: 9,
				label: 'Toggle me',
				get checked() {
					return $.get(isChecked);
				},
				set checked($$value) {
					$.set(isChecked, $$value, true);
				}
			});

			var node_6 = $.sibling(node_5, 2);

			Text(node_6, {
				left: 1,
				top: 11,
				children: $.wrap_snippet(Simple_binding_test, ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text();

					$.template_effect(() => $.set_text(text_4, `Checkbox is: ${$.get(isChecked) ? 'CHECKED' : 'unchecked'}`));
					$.append($$anchor, text_4);
				}),
				$$slots: { default: true }
			});

			var node_7 = $.sibling(node_6, 2);

			Text(node_7, {
				left: 1,
				bottom: 1,
				fg: 'cyan',
				children: $.wrap_snippet(Simple_binding_test, ($$anchor, $$slotProps) => {
					$.next();

					var text_5 = $.text('Press Tab to switch focus, Enter to submit input, Space to toggle checkbox');

					$.append($$anchor, text_5);
				}),
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		}),
		$$slots: { default: true }
	});

	return $.pop({ ...$.legacy_api() });
}