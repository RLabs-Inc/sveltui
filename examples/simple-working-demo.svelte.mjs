import 'svelte/internal/disclose-version';

Simple_working_demo[$.FILENAME] = 'examples/simple-working-demo.svelte';

import * as $ from 'svelte/internal/client';
import Box from '../src/components/ui/Box.svelte';
import Text from '../src/components/ui/Text.svelte';
import List from '../src/components/ui/List.svelte';

var root_1 = $.add_locations($.template(`<!> <!> <!>`, 1), Simple_working_demo[$.FILENAME], []);

export default function Simple_working_demo($$anchor, $$props) {
	$.check_target(new.target);
	$.push($$props, true, Simple_working_demo);

	let count = $.state(0);
	let items = $.proxy(['Option 1', 'Option 2', 'Option 3']);
	let selected = 0;

	$.user_effect(() => {
		const interval = setInterval(
			() => {
				$.update(count);
			},
			1000
		);

		return () => clearInterval(interval);
	});

	Box($$anchor, {
		width: '100%',
		height: '100%',
		border: true,
		label: '🎉 SvelTUI is WORKING!',
		children: $.wrap_snippet(Simple_working_demo, ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			Box(node, {
				top: 1,
				left: 2,
				width: '90%',
				height: 3,
				border: true,
				children: $.wrap_snippet(Simple_working_demo, ($$anchor, $$slotProps) => {
					const expression = $.derived(() => `Counter: ${$.get(count)}`);

					Text($$anchor, {
						get content() {
							return $.get(expression);
						},
						style: { fg: 'green', bold: true }
					});
				}),
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			Box(node_1, {
				top: 5,
				left: 2,
				width: '90%',
				height: 8,
				border: true,
				label: 'Select an option',
				children: $.wrap_snippet(Simple_working_demo, ($$anchor, $$slotProps) => {
					List($$anchor, {
						get items() {
							return items;
						},
						get selected() {
							return selected;
						},
						style: { selected: { bg: 'blue', fg: 'white' } }
					});
				}),
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			Box(node_2, {
				bottom: 0,
				left: 2,
				width: '90%',
				height: 3,
				children: $.wrap_snippet(Simple_working_demo, ($$anchor, $$slotProps) => {
					Text($$anchor, {
						content: 'Press Q to exit | Arrow keys to navigate',
						style: { fg: 'gray' }
					});
				}),
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		}),
		$$slots: { default: true }
	});

	return $.pop({ ...$.legacy_api() });
}