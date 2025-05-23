import 'svelte/internal/disclose-version';

Demo_app[$.FILENAME] = 'examples/demo-app.svelte';

import * as $ from 'svelte/internal/client';
import Box from '../src/components/ui/Box.svelte.mjs';
import Text from '../src/components/ui/Text.svelte.mjs';
import List from '../src/components/ui/List.svelte.mjs';
import Input from '../src/components/ui/Input.svelte.mjs';
import Checkbox from '../src/components/ui/Checkbox.svelte.mjs';

var root_5 = $.add_locations($.template(`<!> <!> <!> <!>`, 1), Demo_app[$.FILENAME], []);
var root_10 = $.add_locations($.template(`<!> <!> <!> <!> <!> <!>`, 1), Demo_app[$.FILENAME], []);
var root_1 = $.add_locations($.template(`<!> <!> <!> <!> <!>`, 1), Demo_app[$.FILENAME], []);

var root = $.add_locations(
	$.template(
		`/**
 * SvelTUI Demo Application
 * 
 * This demo showcases the core UI components of SvelTUI
 */ <!>`,
		1
	),
	Demo_app[$.FILENAME],
	[]
);

export default function Demo_app($$anchor, $$props) {
	$.check_target(new.target);
	$.push($$props, true, Demo_app);

	// State - using both Runes and direct state for compatibility
	let count = $.state(0);
	let message = $.state('Hello SvelTUI!');

	let items = $.state($.proxy([
		'Item 1: Welcome to SvelTUI',
		'Item 2: A true Svelte 5 terminal UI renderer',
		'Item 3: Based on blessed terminal library',
		'Item 4: With full Svelte 5 reactivity',
		'Item 5: And component composition'
	]));

	let selectedItem = $.state(0);
	let showDetails = $.state(false);

	$.user_effect(() => {
		$.set(message, `Count: ${$.get(count)} - Hello SvelTUI!`);
	});

	// Event handlers
	function incrementCount() {
		$.set(count, $.get(count) + 1);
	}

	function handleItemSelect(event) {
		$.set(selectedItem, event.detail.index, true);
	}

	function handleMessageChange(event) {
		$.set(message, event.detail.value, true);
	}

	function handleToggleDetails(event) {
		$.set(showDetails, event.detail.checked, true);
	}

	function addItem() {
		$.set(
			items,
			[
				...$.get(items),
				`Item ${$.get(items).length + 1}: Added at ${new Date().toLocaleTimeString()}`
			],
			true
		);
	}

	function removeItem() {
		if ($.get(items).length > 0) {
			$.set(items, $.get(items).slice(0, -1), true);
		}
	}

	$.next();

	var fragment = root();
	var node = $.sibling($.first_child(fragment));

	Box(node, {
		border: true,
		label: 'SvelTUI Demo',
		width: '100%',
		height: '100%',
		children: $.wrap_snippet(Demo_app, ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node_1 = $.first_child(fragment_1);

			Box(node_1, {
				top: 1,
				left: 1,
				width: '98%',
				height: 3,
				children: $.wrap_snippet(Demo_app, ($$anchor, $$slotProps) => {
					Text($$anchor, {
						get content() {
							return $.get(message);
						},
						style: { fg: 'green', bold: true }
					});
				}),
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			Box(node_2, {
				top: 4,
				left: 1,
				width: '98%',
				height: 10,
				border: true,
				label: 'Interactive List',
				children: $.wrap_snippet(Demo_app, ($$anchor, $$slotProps) => {
					List($$anchor, {
						get items() {
							return $.get(items);
						},
						get selected() {
							return $.get(selectedItem);
						},
						onselect: handleItemSelect,
						style: {
							selected: { bg: 'blue', fg: 'white', bold: true }
						}
					});
				}),
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			Box(node_3, {
				top: 15,
				left: 1,
				width: '98%',
				height: 3,
				border: true,
				label: 'Input',
				children: $.wrap_snippet(Demo_app, ($$anchor, $$slotProps) => {
					Input($$anchor, {
						get value() {
							return $.get(message);
						},
						onchange: handleMessageChange,
						style: { fg: 'cyan' }
					});
				}),
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_3, 2);

			Box(node_4, {
				top: 19,
				left: 1,
				width: '98%',
				height: 6,
				border: true,
				label: 'Actions',
				children: $.wrap_snippet(Demo_app, ($$anchor, $$slotProps) => {
					var fragment_5 = root_5();
					var node_5 = $.first_child(fragment_5);

					Checkbox(node_5, {
						left: 2,
						top: 1,
						get checked() {
							return $.get(showDetails);
						},
						label: 'Show Details',
						onchange: handleToggleDetails
					});

					var node_6 = $.sibling(node_5, 2);

					Box(node_6, {
						left: 28,
						top: 1,
						width: 20,
						height: 1,
						border: true,
						children: $.wrap_snippet(Demo_app, ($$anchor, $$slotProps) => {
							Text($$anchor, {
								content: ' Count + ',
								style: { fg: 'white', bg: 'blue' },
								onclick: incrementCount
							});
						}),
						$$slots: { default: true }
					});

					var node_7 = $.sibling(node_6, 2);

					Box(node_7, {
						left: 50,
						top: 1,
						width: 20,
						height: 1,
						border: true,
						children: $.wrap_snippet(Demo_app, ($$anchor, $$slotProps) => {
							Text($$anchor, {
								content: ' Add Item ',
								style: { fg: 'white', bg: 'green' },
								onclick: addItem
							});
						}),
						$$slots: { default: true }
					});

					var node_8 = $.sibling(node_7, 2);

					Box(node_8, {
						left: 72,
						top: 1,
						width: 20,
						height: 1,
						border: true,
						children: $.wrap_snippet(Demo_app, ($$anchor, $$slotProps) => {
							Text($$anchor, {
								content: ' Remove Item ',
								style: { fg: 'white', bg: 'red' },
								onclick: removeItem
							});
						}),
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_5);
				}),
				$$slots: { default: true }
			});

			var node_9 = $.sibling(node_4, 2);

			{
				var consequent = ($$anchor) => {
					Box($$anchor, {
						top: 26,
						left: 1,
						width: '98%',
						height: 10,
						border: true,
						label: 'Details',
						children: $.wrap_snippet(Demo_app, ($$anchor, $$slotProps) => {
							var fragment_10 = root_10();
							var node_10 = $.first_child(fragment_10);
							const expression = $.derived(() => `Selected Item: ${$.get(selectedItem)}`);

							Text(node_10, {
								left: 2,
								top: 1,
								get content() {
									return $.get(expression);
								}
							});

							var node_11 = $.sibling(node_10, 2);
							const expression_1 = $.derived(() => `Selected Text: ${$.get(items)[$.get(selectedItem)]}`);

							Text(node_11, {
								left: 2,
								top: 2,
								get content() {
									return $.get(expression_1);
								}
							});

							var node_12 = $.sibling(node_11, 2);
							const expression_2 = $.derived(() => `Count: ${$.get(count)}`);

							Text(node_12, {
								left: 2,
								top: 3,
								get content() {
									return $.get(expression_2);
								}
							});

							var node_13 = $.sibling(node_12, 2);
							const expression_3 = $.derived(() => `Message: ${$.get(message)}`);

							Text(node_13, {
								left: 2,
								top: 4,
								get content() {
									return $.get(expression_3);
								}
							});

							var node_14 = $.sibling(node_13, 2);
							const expression_4 = $.derived(() => `Items Count: ${$.get(items).length}`);

							Text(node_14, {
								left: 2,
								top: 5,
								get content() {
									return $.get(expression_4);
								}
							});

							var node_15 = $.sibling(node_14, 2);

							Text(node_15, {
								left: 2,
								top: 6,
								content: 'Press Q to exit, Arrow keys to navigate list'
							});

							$.append($$anchor, fragment_10);
						}),
						$$slots: { default: true }
					});
				};

				$.if(node_9, ($$render) => {
					if ($.get(showDetails)) $$render(consequent);
				});
			}

			$.append($$anchor, fragment_1);
		}),
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	return $.pop({ ...$.legacy_api() });
}