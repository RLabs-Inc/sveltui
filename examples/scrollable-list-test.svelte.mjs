import 'svelte/internal/disclose-version';

Scrollable_list_test[$.FILENAME] = 'examples/scrollable-list-test.svelte';

import * as $ from 'svelte/internal/client';
import Box from '../src/components/ui/Box.svelte.mjs';
import Text from '../src/components/ui/Text.svelte.mjs';
import ScrollableList from '../src/components/ui/ScrollableList.svelte.mjs';

var root_4 = $.add_locations($.template(`<!> <!>`, 1), Scrollable_list_test[$.FILENAME], []);
var root_3 = $.add_locations($.template(`<!> <!>`, 1), Scrollable_list_test[$.FILENAME], []);
var root_1 = $.add_locations($.template(`<!> <!> <!> <!>`, 1), Scrollable_list_test[$.FILENAME], []);

export default function Scrollable_list_test($$anchor, $$props) {
	$.check_target(new.target);
	$.push($$props, true, Scrollable_list_test);

	let title = $.prop($$props, 'title', 3, 'ScrollableList Test');

	// Generate test items
	const items = Array.from({ length: 20 }, (_, i) => ({
		id: i + 1,
		label: `Item ${i + 1}`,
		description: `This is item number ${i + 1}`
	}));

	let selectedIndex = $.state(0);
	let selectedItem = $.state(null);

	function handleSelect(index) {
		$.set(selectedIndex, index, true);
		$.set(selectedItem, items[index], true);
	}

	Box($$anchor, {
		border: true,
		width: '80%',
		height: '80%',
		get label() {
			return title();
		},
		children: $.wrap_snippet(Scrollable_list_test, ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			Text(node, {
				bold: true,
				fg: 'cyan',
				content: 'ScrollableList Component Test'
			});

			var node_1 = $.sibling(node, 2);

			Text(node_1, {
				fg: 'white',
				content: 'Use arrow keys to navigate, Enter to select:'
			});

			var node_2 = $.sibling(node_1, 2);

			Box(node_2, {
				height: '50%',
				border: true,
				children: $.wrap_snippet(Scrollable_list_test, ($$anchor, $$slotProps) => {
					const expression = $.derived(() => items.map((item) => item.label));

					ScrollableList($$anchor, {
						get items() {
							return $.get(expression);
						},
						get selected() {
							return $.get(selectedIndex);
						},
						onSelect: handleSelect,
						focused: true
					});
				}),
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			Box(node_3, {
				height: '20%',
				border: true,
				label: 'Selection Info',
				children: $.wrap_snippet(Scrollable_list_test, ($$anchor, $$slotProps) => {
					var fragment_3 = root_3();
					var node_4 = $.first_child(fragment_3);
					const expression_1 = $.derived(() => `Selected Index: ${$.get(selectedIndex)}`);

					Text(node_4, {
						fg: 'yellow',
						get content() {
							return $.get(expression_1);
						}
					});

					var node_5 = $.sibling(node_4, 2);

					{
						var consequent = ($$anchor) => {
							var fragment_4 = root_4();
							var node_6 = $.first_child(fragment_4);
							const expression_2 = $.derived(() => `Selected: ${$.get(selectedItem).label}`);

							Text(node_6, {
								fg: 'green',
								get content() {
									return $.get(expression_2);
								}
							});

							var node_7 = $.sibling(node_6, 2);

							Text(node_7, {
								fg: 'white',
								get content() {
									return $.get(selectedItem).description;
								}
							});

							$.append($$anchor, fragment_4);
						};

						$.if(node_5, ($$render) => {
							if ($.get(selectedItem)) $$render(consequent);
						});
					}

					$.append($$anchor, fragment_3);
				}),
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		}),
		$$slots: { default: true }
	});

	return $.pop({ ...$.legacy_api() });
}