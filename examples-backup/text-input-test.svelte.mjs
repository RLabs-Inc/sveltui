import 'svelte/internal/disclose-version';

Text_input_test[$.FILENAME] = 'examples/text-input-test.svelte';

import * as $ from 'svelte/internal/client';
import Box from '../src/components/ui/Box.svelte.mjs';
import Text from '../src/components/ui/Text.svelte.mjs';
import TextInput from '../src/components/ui/TextInput.svelte.mjs';

var root_1 = $.add_locations($.template(`<!> <!> <!> <!> <!>`, 1), Text_input_test[$.FILENAME], []);

export default function Text_input_test($$anchor, $$props) {
	$.check_target(new.target);
	$.push($$props, true, Text_input_test);

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
		children: $.wrap_snippet(Text_input_test, ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			Text(node, {
				bold: true,
				fg: 'cyan',
				content: 'TextInput Component Test'
			});

			var node_1 = $.sibling(node, 2);

			Text(node_1, {
				fg: 'white',
				content: 'Type something and press Enter:'
			});

			var node_2 = $.sibling(node_1, 2);

			TextInput(node_2, {
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