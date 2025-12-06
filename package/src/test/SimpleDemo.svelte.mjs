import 'svelte/internal/disclose-version';

SimpleDemo[$.FILENAME] = 'src/test/SimpleDemo.svelte';

import * as $ from 'svelte/internal/client';
import Box from '../components/Box.svelte.mjs';
import Text from '../components/Text.svelte.mjs';

var root_2 = $.add_locations($.from_html(`<!> <!>`, 1), SimpleDemo[$.FILENAME], []);
var root_1 = $.add_locations($.from_html(`<!> <!> <!> <!>`, 1), SimpleDemo[$.FILENAME], []);

export default function SimpleDemo($$anchor, $$props) {
	$.check_target(new.target);
	$.push($$props, true, SimpleDemo);

	let count = $.tag($.state(0), 'count');

	setInterval(
		() => {
			$.update(count);
		},
		1000
	);

	var $$exports = { ...$.legacy_api() };

	$.add_svelte_meta(
		() => Box($$anchor, {
			width: 80,
			height: 10,
			border: 'single',
			borderColor: 'cyan',
			padding: 1,
			flexDirection: 'column',
			gap: 1,

			children: $.wrap_snippet(SimpleDemo, ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node = $.first_child(fragment_1);

				$.add_svelte_meta(
					() => Text(node, {
						text: '🎉 Simplified Layout System Working!',
						color: 'green',
						bold: true
					}),
					'component',
					SimpleDemo,
					21,
					2,
					{ componentTag: 'Text' }
				);

				var node_1 = $.sibling(node, 2);

				{
					let $0 = $.derived(() => `Count: ${$.get(count)}`);

					$.add_svelte_meta(
						() => Text(node_1, {
							get text() {
								return $.get($0);
							},

							color: 'yellow'
						}),
						'component',
						SimpleDemo,
						22,
						2,
						{ componentTag: 'Text' }
					);
				}

				var node_2 = $.sibling(node_1, 2);

				$.add_svelte_meta(
					() => Box(node_2, {
						flexDirection: 'row',
						gap: 2,
						marginY: 1,

						children: $.wrap_snippet(SimpleDemo, ($$anchor, $$slotProps) => {
							var fragment_2 = root_2();
							var node_3 = $.first_child(fragment_2);

							$.add_svelte_meta(
								() => Box(node_3, {
									border: 'rounded',
									borderColor: 'blue',
									padding: 1,
									flexGrow: 1,

									children: $.wrap_snippet(SimpleDemo, ($$anchor, $$slotProps) => {
										$.add_svelte_meta(() => Text($$anchor, { text: 'Box 1', color: 'blue' }), 'component', SimpleDemo, 35, 6, { componentTag: 'Text' });
									}),

									$$slots: { default: true }
								}),
								'component',
								SimpleDemo,
								29,
								4,
								{ componentTag: 'Box' }
							);

							var node_4 = $.sibling(node_3, 2);

							$.add_svelte_meta(
								() => Box(node_4, {
									border: 'double',
									borderColor: 'magenta',
									padding: 1,
									flexGrow: 1,

									children: $.wrap_snippet(SimpleDemo, ($$anchor, $$slotProps) => {
										$.add_svelte_meta(() => Text($$anchor, { text: 'Box 2', color: 'magenta' }), 'component', SimpleDemo, 44, 6, { componentTag: 'Text' });
									}),

									$$slots: { default: true }
								}),
								'component',
								SimpleDemo,
								38,
								4,
								{ componentTag: 'Box' }
							);

							$.append($$anchor, fragment_2);
						}),

						$$slots: { default: true }
					}),
					'component',
					SimpleDemo,
					24,
					2,
					{ componentTag: 'Box' }
				);

				var node_5 = $.sibling(node_2, 2);

				$.add_svelte_meta(() => Text(node_5, { text: 'Press Ctrl+C to exit', color: 'gray', dim: true }), 'component', SimpleDemo, 48, 2, { componentTag: 'Text' });
				$.append($$anchor, fragment_1);
			}),

			$$slots: { default: true }
		}),
		'component',
		SimpleDemo,
		12,
		0,
		{ componentTag: 'Box' }
	);

	return $.pop($$exports);
}