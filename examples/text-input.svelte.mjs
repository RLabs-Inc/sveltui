import 'svelte/internal/disclose-version';

Text_input[$.FILENAME] = 'examples/text-input.svelte';

import * as $ from 'svelte/internal/client';
import Box from '../src/components/ui/Box.svelte.mjs';
import Text from '../src/components/ui/Text.svelte.mjs';
import TextInput from '../src/components/ui/TextInput.svelte.mjs';

var root_1 = $.add_locations($.template(`<!> <!> <!> <!> <!>`, 1), Text_input[$.FILENAME], []);

export default function Text_input($$anchor, $$props) {
	$.check_target(new.target);
	$.push($$props, true, Text_input);

	let title = $.prop($$props, 'title', 3, 'TextInput Test');
	let inputValue = $.state('');
	let submitted = $.state(false);

	function handleSubmit() {
		$.set(submitted, true);
	}

	Box($$anchor, {
		border: true,
		width: '80%',
		height: '50%',
		get label() {
			return title();
		},
		children: $.wrap_snippet(Text_input, ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			Text(node, {
				top: 0,
				left: 'center',
				bold: true,
				fg: 'cyan',
				content: 'TextInput Component Test'
			});

			var node_1 = $.sibling(node, 2);

			Text(node_1, {
				top: 2,
				left: 2,
				fg: 'white',
				content: 'Type something and press Enter:'
			});

			var node_2 = $.sibling(node_1, 2);

			TextInput(node_2, {
				top: 4,
				left: 2,
				width: '90%',
				onSubmit: handleSubmit,
				placeholder: 'Type here...',
				focused: true,
				get value() {
					return $.get(inputValue);
				},
				set value($$value) {
					$.set(inputValue, $$value, true);
				}
			});

			var node_3 = $.sibling(node_2, 2);
			const expression = $.derived(() => `Current value: ${$.get(inputValue) || '(empty)'}`);

			Text(node_3, {
				top: 6,
				left: 2,
				fg: 'yellow',
				get content() {
					return $.get(expression);
				}
			});

			var node_4 = $.sibling(node_3, 2);

			{
				var consequent = ($$anchor) => {
					const expression_1 = $.derived(() => `✓ You submitted: ${$.get(inputValue)}`);

					Text($$anchor, {
						top: 8,
						left: 2,
						bold: true,
						fg: 'green',
						get content() {
							return $.get(expression_1);
						}
					});
				};

				$.if(node_4, ($$render) => {
					if ($.get(submitted)) $$render(consequent);
				});
			}

			$.append($$anchor, fragment_1);
		}),
		$$slots: { default: true }
	});

	return $.pop({ ...$.legacy_api() });
}