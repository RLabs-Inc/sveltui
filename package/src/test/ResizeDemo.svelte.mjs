import 'svelte/internal/disclose-version';

ResizeDemo[$.FILENAME] = 'src/test/ResizeDemo.svelte';

import * as $ from 'svelte/internal/client';
import Box from '../components/Box.svelte.mjs';
import Text from '../components/Text.svelte.mjs';
import { terminalSize } from '../core/state/engine.svelte.js';

var root_4 = $.add_locations($.from_html(`<!> <!>`, 1), ResizeDemo[$.FILENAME], []);
var root_5 = $.add_locations($.from_html(`<!> <!>`, 1), ResizeDemo[$.FILENAME], []);
var root_3 = $.add_locations($.from_html(`<!> <!>`, 1), ResizeDemo[$.FILENAME], []);
var root_6 = $.add_locations($.from_html(`<!> <!>`, 1), ResizeDemo[$.FILENAME], []);
var root_1 = $.add_locations($.from_html(`<!> <!> <!> <!> <!> <!> <!> <!>`, 1), ResizeDemo[$.FILENAME], []);

export default function ResizeDemo($$anchor, $$props) {
	$.check_target(new.target);
	$.push($$props, true, ResizeDemo);

	let resizeCount = 0;
	let lastResize = $.tag_proxy($.proxy(new Date().toLocaleTimeString()), 'lastResize');
	var $$exports = { ...$.legacy_api() };

	$.add_svelte_meta(
		() => Box($$anchor, {
			width: '100%',
			height: '100%',
			border: 'double',
			borderColor: 'cyan',
			padding: 2,
			flexDirection: 'column',
			gap: 1,

			children: $.wrap_snippet(ResizeDemo, ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node = $.first_child(fragment_1);

				$.add_svelte_meta(() => Text(node, { text: '📐 Resize Test Demo', color: 'yellow', bold: true }), 'component', ResizeDemo, 21, 2, { componentTag: 'Text' });

				var node_1 = $.sibling(node, 2);

				$.add_svelte_meta(
					() => Box(node_1, {
						border: 'single',
						borderColor: 'blue',
						padding: 1,
						marginY: 1,

						children: $.wrap_snippet(ResizeDemo, ($$anchor, $$slotProps) => {
							{
								let $0 = $.derived(() => `Terminal: ${terminalSize.width}x${terminalSize.height} | Mode: ${terminalSize.fullscreen ? 'Fullscreen' : 'Non-fullscreen'}`);

								$.add_svelte_meta(
									() => Text($$anchor, {
										get text() {
											return $.get($0);
										},

										color: 'cyan'
									}),
									'component',
									ResizeDemo,
									24,
									4,
									{ componentTag: 'Text' }
								);
							}
						}),

						$$slots: { default: true }
					}),
					'component',
					ResizeDemo,
					23,
					2,
					{ componentTag: 'Box' }
				);

				var node_2 = $.sibling(node_1, 2);

				$.add_svelte_meta(() => Text(node_2, { text: `Resize count: ${resizeCount}`, color: 'green' }), 'component', ResizeDemo, 27, 2, { componentTag: 'Text' });

				var node_3 = $.sibling(node_2, 2);

				{
					let $0 = $.derived(() => `Last resize: ${lastResize}`);

					$.add_svelte_meta(
						() => Text(node_3, {
							get text() {
								return $.get($0);
							},

							color: 'gray'
						}),
						'component',
						ResizeDemo,
						28,
						2,
						{ componentTag: 'Text' }
					);
				}

				var node_4 = $.sibling(node_3, 2);

				$.add_svelte_meta(
					() => Box(node_4, {
						flexDirection: 'row',
						gap: 2,
						marginY: 1,

						children: $.wrap_snippet(ResizeDemo, ($$anchor, $$slotProps) => {
							var fragment_3 = root_3();
							var node_5 = $.first_child(fragment_3);

							$.add_svelte_meta(
								() => Box(node_5, {
									border: 'rounded',
									borderColor: 'magenta',
									padding: 1,
									flexGrow: 1,

									children: $.wrap_snippet(ResizeDemo, ($$anchor, $$slotProps) => {
										var fragment_4 = root_4();
										var node_6 = $.first_child(fragment_4);

										$.add_svelte_meta(() => Text(node_6, { text: 'Flex Box 1', color: 'magenta' }), 'component', ResizeDemo, 37, 6, { componentTag: 'Text' });

										var node_7 = $.sibling(node_6, 2);

										{
											let $0 = $.derived(() => `Width: ${terminalSize.width / 2 - 6}ch`);

											$.add_svelte_meta(
												() => Text(node_7, {
													get text() {
														return $.get($0);
													},

													color: 'gray',
													dim: true
												}),
												'component',
												ResizeDemo,
												38,
												6,
												{ componentTag: 'Text' }
											);
										}

										$.append($$anchor, fragment_4);
									}),

									$$slots: { default: true }
								}),
								'component',
								ResizeDemo,
								31,
								4,
								{ componentTag: 'Box' }
							);

							var node_8 = $.sibling(node_5, 2);

							$.add_svelte_meta(
								() => Box(node_8, {
									border: 'rounded',
									borderColor: 'green',
									padding: 1,
									flexGrow: 1,

									children: $.wrap_snippet(ResizeDemo, ($$anchor, $$slotProps) => {
										var fragment_5 = root_5();
										var node_9 = $.first_child(fragment_5);

										$.add_svelte_meta(() => Text(node_9, { text: 'Flex Box 2', color: 'green' }), 'component', ResizeDemo, 47, 6, { componentTag: 'Text' });

										var node_10 = $.sibling(node_9, 2);

										{
											let $0 = $.derived(() => `Width: ${terminalSize.width / 2 - 6}ch`);

											$.add_svelte_meta(
												() => Text(node_10, {
													get text() {
														return $.get($0);
													},

													color: 'gray',
													dim: true
												}),
												'component',
												ResizeDemo,
												48,
												6,
												{ componentTag: 'Text' }
											);
										}

										$.append($$anchor, fragment_5);
									}),

									$$slots: { default: true }
								}),
								'component',
								ResizeDemo,
								41,
								4,
								{ componentTag: 'Box' }
							);

							$.append($$anchor, fragment_3);
						}),

						$$slots: { default: true }
					}),
					'component',
					ResizeDemo,
					30,
					2,
					{ componentTag: 'Box' }
				);

				var node_11 = $.sibling(node_4, 2);

				$.add_svelte_meta(
					() => Box(node_11, {
						height: 10,
						border: 'dashed',
						borderColor: 'yellow',
						padding: 1,
						scrollable: true,

						children: $.wrap_snippet(ResizeDemo, ($$anchor, $$slotProps) => {
							var fragment_6 = root_6();
							var node_12 = $.first_child(fragment_6);

							$.add_svelte_meta(() => Text(node_12, { text: 'Scrollable content area', color: 'yellow' }), 'component', ResizeDemo, 59, 4, { componentTag: 'Text' });

							var node_13 = $.sibling(node_12, 2);

							$.add_svelte_meta(
								() => $.each(node_13, 16, () => Array(20), $.index, ($$anchor, _, i) => {
									$.add_svelte_meta(
										() => Text($$anchor, {
											text: `Line ${i + 1}: This is a long line to test how resize affects scrollable content in the box`,
											color: 'white'
										}),
										'component',
										ResizeDemo,
										61,
										6,
										{ componentTag: 'Text' }
									);
								}),
								'each',
								ResizeDemo,
								60,
								4
							);

							$.append($$anchor, fragment_6);
						}),

						$$slots: { default: true }
					}),
					'component',
					ResizeDemo,
					52,
					2,
					{ componentTag: 'Box' }
				);

				var node_14 = $.sibling(node_11, 2);

				$.add_svelte_meta(
					() => Text(node_14, {
						text: 'Try resizing your terminal to see how the layout adapts!',
						color: 'cyan',
						dim: true
					}),
					'component',
					ResizeDemo,
					65,
					2,
					{ componentTag: 'Text' }
				);

				var node_15 = $.sibling(node_14, 2);

				$.add_svelte_meta(() => Text(node_15, { text: 'Press Ctrl+C to exit', color: 'gray', dim: true }), 'component', ResizeDemo, 66, 2, { componentTag: 'Text' });
				$.append($$anchor, fragment_1);
			}),

			$$slots: { default: true }
		}),
		'component',
		ResizeDemo,
		12,
		0,
		{ componentTag: 'Box' }
	);

	return $.pop($$exports);
}