import 'svelte/internal/disclose-version';

Positioning_test[$.FILENAME] = 'examples/positioning-test.svelte';

import * as $ from 'svelte/internal/client';
import { Box, Text } from '../src/components/ui/index';

var root_5 = $.add_locations($.template(`<!> <!>`, 1), Positioning_test[$.FILENAME], []);
var root_12 = $.add_locations($.template(`<!> <!>`, 1), Positioning_test[$.FILENAME], []);
var root = $.add_locations($.template(`<!> <!> <!> <!> <!> <!> <!>`, 1), Positioning_test[$.FILENAME], []);

export default function Positioning_test($$anchor, $$props) {
	$.check_target(new.target);
	$.push($$props, true, Positioning_test);

	// State for dynamic positioning test
	let dynamicPosition = $.state('center');
	let count = $.state(0);

	$.user_effect(() => {
		const interval = setInterval(
			() => {
				$.update(count);

				const positions = [
					'center',
					'25%',
					'50%',
					'75%',
					'10',
					'50%-10'
				];

				$.set(dynamicPosition, positions[$.get(count) % positions.length], true);
			},
			2000
		);

		return () => clearInterval(interval);
	});

	var fragment = root();
	var node = $.first_child(fragment);

	Box(node, {
		left: 'center',
		top: 'center',
		width: '30',
		height: '5',
		border: 'line',
		label: 'Centered Box',
		children: $.wrap_snippet(Positioning_test, ($$anchor, $$slotProps) => {
			Text($$anchor, {
				children: $.wrap_snippet(Positioning_test, ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('This box is centered!');

					$.append($$anchor, text);
				}),
				$$slots: { default: true }
			});
		}),
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Box(node_1, {
		left: '75%',
		top: '0',
		width: '25%',
		height: '5',
		border: 'line',
		label: '75% Left, 25% Width',
		children: $.wrap_snippet(Positioning_test, ($$anchor, $$slotProps) => {
			Text($$anchor, {
				children: $.wrap_snippet(Positioning_test, ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Percentage positioning');

					$.append($$anchor, text_1);
				}),
				$$slots: { default: true }
			});
		}),
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Box(node_2, {
		left: '0',
		top: '50%-3',
		width: '100%-40',
		height: '6',
		border: 'line',
		label: 'Full Width - 40',
		children: $.wrap_snippet(Positioning_test, ($$anchor, $$slotProps) => {
			var fragment_3 = root_5();
			var node_3 = $.first_child(fragment_3);

			Text(node_3, {
				children: $.wrap_snippet(Positioning_test, ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('This box is full width minus 40 chars');

					$.append($$anchor, text_2);
				}),
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_3, 2);

			Text(node_4, {
				children: $.wrap_snippet(Positioning_test, ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('Positioned at 50% - 3 lines from top');

					$.append($$anchor, text_3);
				}),
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_3);
		}),
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_2, 2);

	Box(node_5, {
		right: '0',
		bottom: '0',
		width: '30',
		height: '5',
		border: 'line',
		label: 'Bottom Right',
		children: $.wrap_snippet(Positioning_test, ($$anchor, $$slotProps) => {
			Text($$anchor, {
				children: $.wrap_snippet(Positioning_test, ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text('Anchored to bottom-right');

					$.append($$anchor, text_4);
				}),
				$$slots: { default: true }
			});
		}),
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_5, 2);

	Box(node_6, {
		get left() {
			return $.get(dynamicPosition);
		},
		top: '80%',
		width: '20',
		height: '3',
		border: 'line',
		label: 'Dynamic Position',
		children: $.wrap_snippet(Positioning_test, ($$anchor, $$slotProps) => {
			Text($$anchor, {
				children: $.wrap_snippet(Positioning_test, ($$anchor, $$slotProps) => {
					$.next();

					var text_5 = $.text();

					$.template_effect(() => $.set_text(text_5, `Position: ${$.get(dynamicPosition) ?? ''}`));
					$.append($$anchor, text_5);
				}),
				$$slots: { default: true }
			});
		}),
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_6, 2);

	Box(node_7, {
		left: '5',
		top: '5',
		width: 'shrink',
		height: 'shrink',
		border: 'line',
		label: 'Shrink Box',
		children: $.wrap_snippet(Positioning_test, ($$anchor, $$slotProps) => {
			var fragment_7 = root_12();
			var node_8 = $.first_child(fragment_7);

			Text(node_8, {
				children: $.wrap_snippet(Positioning_test, ($$anchor, $$slotProps) => {
					$.next();

					var text_6 = $.text('This box shrinks to content!');

					$.append($$anchor, text_6);
				}),
				$$slots: { default: true }
			});

			var node_9 = $.sibling(node_8, 2);

			Text(node_9, {
				children: $.wrap_snippet(Positioning_test, ($$anchor, $$slotProps) => {
					$.next();

					var text_7 = $.text('Second line of text');

					$.append($$anchor, text_7);
				}),
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_7);
		}),
		$$slots: { default: true }
	});

	var node_10 = $.sibling(node_7, 2);

	Box(node_10, {
		left: '5',
		right: '5',
		top: '25%',
		height: '4',
		border: 'line',
		label: 'Stretched Box',
		children: $.wrap_snippet(Positioning_test, ($$anchor, $$slotProps) => {
			Text($$anchor, {
				children: $.wrap_snippet(Positioning_test, ($$anchor, $$slotProps) => {
					$.next();

					var text_8 = $.text('This box stretches between left:5 and right:5');

					$.append($$anchor, text_8);
				}),
				$$slots: { default: true }
			});
		}),
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
	return $.pop({ ...$.legacy_api() });
}