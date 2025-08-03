import 'svelte/internal/disclose-version';

Working_binding_demo[$.FILENAME] = 'examples/working-binding-demo.svelte';

import * as $ from 'svelte/internal/client';
import Box from '../src/components/ui/Box.svelte.mjs';
import Text from '../src/components/ui/Text.svelte.mjs';
import Input from '../src/components/ui/Input.svelte.mjs';

var root_1 = $.add_locations($.template(`<!> <!> <!> <!> <!>`, 1), Working_binding_demo[$.FILENAME], []);

export default function Working_binding_demo($$anchor, $$props) {
	$.check_target(new.target);
	$.push($$props, true, Working_binding_demo);

	// State for binding
	let inputValue = $.state('Hello SvelTUI!');

	Box($$anchor, {
		width: '100%',
		height: '100%',
		border: 'line',
		label: ' Binding Demo ',
		children: $.wrap_snippet(Working_binding_demo, ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			Text(node, {
				left: 1,
				top: 1,
				bold: true,
				children: $.wrap_snippet(Working_binding_demo, ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Input Binding Test');

					$.append($$anchor, text);
				}),
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			Text(node_1, {
				left: 1,
				top: 3,
				children: $.wrap_snippet(Working_binding_demo, ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Enter text:');

					$.append($$anchor, text_1);
				}),
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			Input(node_2, {
				left: 12,
				top: 3,
				width: 30,
				height: 1,
				border: true,
				get value() {
					return $.get(inputValue);
				},
				set value($$value) {
					$.set(inputValue, $$value, true);
				}
			});

			var node_3 = $.sibling(node_2, 2);

			Text(node_3, {
				left: 1,
				top: 5,
				children: $.wrap_snippet(Working_binding_demo, ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text();

					$.template_effect(() => $.set_text(text_2, `You typed: ${$.get(inputValue) ?? ''}`));
					$.append($$anchor, text_2);
				}),
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_3, 2);

			Text(node_4, {
				left: 1,
				bottom: 1,
				fg: 'cyan',
				children: $.wrap_snippet(Working_binding_demo, ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('Press q to quit');

					$.append($$anchor, text_3);
				}),
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		}),
		$$slots: { default: true }
	});

	return $.pop({ ...$.legacy_api() });
}