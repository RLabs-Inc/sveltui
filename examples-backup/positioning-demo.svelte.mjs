import 'svelte/internal/disclose-version';

Positioning_demo[$.FILENAME] = 'examples/positioning-demo.svelte';

import * as $ from 'svelte/internal/client';
import Box from '../src/components/ui/Box.svelte.mjs';
import Text from '../src/components/ui/Text.svelte.mjs';

var root_1 = $.add_locations($.template(`<!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1), Positioning_demo[$.FILENAME], []);

export default function Positioning_demo($$anchor, $$props) {
	$.check_target(new.target);
	$.push($$props, true, Positioning_demo);

	// Style for all demo boxes
	const boxStyle = { border: { fg: 'cyan' }, fg: 'white' };

	Box($$anchor, {
		width: '100%',
		height: '100%',
		style: { bg: '#111' },
		children: $.wrap_snippet(Positioning_demo, ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			Text(node, {
				left: 'center',
				top: 0,
				style: { fg: 'yellow', bold: true },
				children: $.wrap_snippet(Positioning_demo, ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('SvelTUI Positioning Demo');

					$.append($$anchor, text);
				}),
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			Box(node_1, {
				left: 'center',
				top: 'center',
				width: 30,
				height: 5,
				border: 'line',
				label: ' Centered Box ',
				style: boxStyle,
				children: $.wrap_snippet(Positioning_demo, ($$anchor, $$slotProps) => {
					Text($$anchor, {
						left: 'center',
						top: 'center',
						children: $.wrap_snippet(Positioning_demo, ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('left="center" top="center"');

							$.append($$anchor, text_1);
						}),
						$$slots: { default: true }
					});
				}),
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			Box(node_2, {
				left: '25%',
				top: 3,
				width: '50%',
				height: 4,
				border: 'line',
				label: ' 50% Width ',
				style: boxStyle,
				children: $.wrap_snippet(Positioning_demo, ($$anchor, $$slotProps) => {
					Text($$anchor, {
						left: 1,
						top: 1,
						children: $.wrap_snippet(Positioning_demo, ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('left="25%" width="50%"');

							$.append($$anchor, text_2);
						}),
						$$slots: { default: true }
					});
				}),
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			Box(node_3, {
				left: '50%-15',
				top: '50%+3',
				width: 30,
				height: 4,
				border: 'line',
				label: ' Offset Position ',
				style: boxStyle,
				children: $.wrap_snippet(Positioning_demo, ($$anchor, $$slotProps) => {
					Text($$anchor, {
						left: 1,
						top: 1,
						children: $.wrap_snippet(Positioning_demo, ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('left="50%-15" top="50%+3"');

							$.append($$anchor, text_3);
						}),
						$$slots: { default: true }
					});
				}),
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_3, 2);

			Box(node_4, {
				right: 2,
				bottom: 2,
				width: 25,
				height: 4,
				border: 'line',
				label: ' Bottom Right ',
				style: boxStyle,
				children: $.wrap_snippet(Positioning_demo, ($$anchor, $$slotProps) => {
					Text($$anchor, {
						left: 1,
						top: 1,
						children: $.wrap_snippet(Positioning_demo, ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text();

							text_4.nodeValue = 'right=2 bottom=2';
							$.append($$anchor, text_4);
						}),
						$$slots: { default: true }
					});
				}),
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_4, 2);

			Box(node_5, {
				left: 2,
				right: '50%+2',
				top: '75%',
				height: 4,
				border: 'line',
				label: ' Constraint Width ',
				style: boxStyle,
				children: $.wrap_snippet(Positioning_demo, ($$anchor, $$slotProps) => {
					Text($$anchor, {
						left: 1,
						top: 1,
						children: $.wrap_snippet(Positioning_demo, ($$anchor, $$slotProps) => {
							$.next();

							var text_5 = $.text();

							text_5.nodeValue = 'left=2 right="50%+2"';
							$.append($$anchor, text_5);
						}),
						$$slots: { default: true }
					});
				}),
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_5, 2);

			Box(node_6, {
				left: 2,
				bottom: 8,
				width: 'shrink',
				height: 'shrink',
				border: 'line',
				label: ' Shrink ',
				style: boxStyle,
				children: $.wrap_snippet(Positioning_demo, ($$anchor, $$slotProps) => {
					Text($$anchor, {
						children: $.wrap_snippet(Positioning_demo, ($$anchor, $$slotProps) => {
							$.next();

							var text_6 = $.text('This box shrinks to content');

							$.append($$anchor, text_6);
						}),
						$$slots: { default: true }
					});
				}),
				$$slots: { default: true }
			});

			var node_7 = $.sibling(node_6, 2);

			Box(node_7, {
				left: 2,
				top: 8,
				width: '100%-4',
				height: 3,
				border: 'line',
				label: ' Full Width Minus ',
				style: boxStyle,
				children: $.wrap_snippet(Positioning_demo, ($$anchor, $$slotProps) => {
					Text($$anchor, {
						left: 1,
						top: 0,
						children: $.wrap_snippet(Positioning_demo, ($$anchor, $$slotProps) => {
							$.next();

							var text_7 = $.text('width="100%-4" (full width minus 4 chars)');

							$.append($$anchor, text_7);
						}),
						$$slots: { default: true }
					});
				}),
				$$slots: { default: true }
			});

			var node_8 = $.sibling(node_7, 2);

			Box(node_8, {
				left: 'center',
				bottom: 0,
				width: 'shrink',
				height: 1,
				style: { fg: 'gray' },
				children: $.wrap_snippet(Positioning_demo, ($$anchor, $$slotProps) => {
					Text($$anchor, {
						children: $.wrap_snippet(Positioning_demo, ($$anchor, $$slotProps) => {
							$.next();

							var text_8 = $.text('Press q or Ctrl+C to quit');

							$.append($$anchor, text_8);
						}),
						$$slots: { default: true }
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