import 'svelte/internal/disclose-version';

ComprehensiveLayoutDemo[$.FILENAME] = 'src/test/ComprehensiveLayoutDemo.svelte';

import * as $ from 'svelte/internal/client';
import Box from '../components/Box.svelte.mjs';
import Text from '../components/Text.svelte.mjs';

var root_3 = $.add_locations($.from_html(`<!> <!> <!>`, 1), ComprehensiveLayoutDemo[$.FILENAME], []);
var root_7 = $.add_locations($.from_html(`<!> <!> <!>`, 1), ComprehensiveLayoutDemo[$.FILENAME], []);
var root_12 = $.add_locations($.from_html(`<!> <!> <!>`, 1), ComprehensiveLayoutDemo[$.FILENAME], []);
var root_15 = $.add_locations($.from_html(`<!> <!> <!>`, 1), ComprehensiveLayoutDemo[$.FILENAME], []);
var root_18 = $.add_locations($.from_html(`<!> <!> <!>`, 1), ComprehensiveLayoutDemo[$.FILENAME], []);
var root_11 = $.add_locations($.from_html(`<!> <!> <!>`, 1), ComprehensiveLayoutDemo[$.FILENAME], []);
var root_19 = $.add_locations($.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1), ComprehensiveLayoutDemo[$.FILENAME], []);
var root_20 = $.add_locations($.from_html(`<!> <!> <!>`, 1), ComprehensiveLayoutDemo[$.FILENAME], []);
var root_24 = $.add_locations($.from_html(`<!> <!> <!>`, 1), ComprehensiveLayoutDemo[$.FILENAME], []);
var root_1 = $.add_locations($.from_html(`<!> <!> <!> <!> <!> <!> <!> <!>`, 1), ComprehensiveLayoutDemo[$.FILENAME], []);

export default function ComprehensiveLayoutDemo($$anchor, $$props) {
	$.check_target(new.target);
	$.push($$props, true, ComprehensiveLayoutDemo);

	let counter = $.tag($.state(0), 'counter');

	setInterval(() => $.update(counter), 1000);

	var $$exports = { ...$.legacy_api() };

	$.add_svelte_meta(
		() => Box($$anchor, {
			width: '100%',
			height: '100%',
			variant: 'primary',
			border: 'double',
			padding: 1,
			flexDirection: 'column',
			gap: 1,

			children: $.wrap_snippet(ComprehensiveLayoutDemo, ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node = $.first_child(fragment_1);

				$.add_svelte_meta(
					() => Box(node, {
						variant: 'success',
						padding: 1,

						children: $.wrap_snippet(ComprehensiveLayoutDemo, ($$anchor, $$slotProps) => {
							$.add_svelte_meta(
								() => Text($$anchor, {
									text: '🎨 SvelTUI Simplified Layout System',
									variant: 'success',
									bold: true
								}),
								'component',
								ComprehensiveLayoutDemo,
								21,
								4,
								{ componentTag: 'Text' }
							);
						}),

						$$slots: { default: true }
					}),
					'component',
					ComprehensiveLayoutDemo,
					20,
					2,
					{ componentTag: 'Box' }
				);

				var node_1 = $.sibling(node, 2);

				{
					let $0 = $.derived(() => `Live Updates: ${$.get(counter)}s`);

					$.add_svelte_meta(
						() => Text(node_1, {
							get text() {
								return $.get($0);
							},

							variant: 'warning'
						}),
						'component',
						ComprehensiveLayoutDemo,
						24,
						2,
						{ componentTag: 'Text' }
					);
				}

				var node_2 = $.sibling(node_1, 2);

				$.add_svelte_meta(
					() => Box(node_2, {
						flexDirection: 'row',
						gap: 1,
						height: 3,
						variant: 'primary',
						border: 'single',

						children: $.wrap_snippet(ComprehensiveLayoutDemo, ($$anchor, $$slotProps) => {
							var fragment_3 = root_3();
							var node_3 = $.first_child(fragment_3);

							$.add_svelte_meta(
								() => Box(node_3, {
									flexGrow: 1,
									variant: 'secondary',
									backgroundColor: '#1a1a2e',
									padding: 1,

									children: $.wrap_snippet(ComprehensiveLayoutDemo, ($$anchor, $$slotProps) => {
										$.add_svelte_meta(() => Text($$anchor, { text: 'Flex: 1', variant: 'secondary' }), 'component', ComprehensiveLayoutDemo, 35, 6, { componentTag: 'Text' });
									}),

									$$slots: { default: true }
								}),
								'component',
								ComprehensiveLayoutDemo,
								34,
								4,
								{ componentTag: 'Box' }
							);

							var node_4 = $.sibling(node_3, 2);

							$.add_svelte_meta(
								() => Box(node_4, {
									flexGrow: 2,
									variant: 'info',
									backgroundColor: '#16213e',
									padding: 1,

									children: $.wrap_snippet(ComprehensiveLayoutDemo, ($$anchor, $$slotProps) => {
										$.add_svelte_meta(() => Text($$anchor, { text: 'Flex: 2', variant: 'info' }), 'component', ComprehensiveLayoutDemo, 38, 6, { componentTag: 'Text' });
									}),

									$$slots: { default: true }
								}),
								'component',
								ComprehensiveLayoutDemo,
								37,
								4,
								{ componentTag: 'Box' }
							);

							var node_5 = $.sibling(node_4, 2);

							$.add_svelte_meta(
								() => Box(node_5, {
									flexGrow: 1,
									variant: 'warning',
									backgroundColor: '#0f3460',
									padding: 1,

									children: $.wrap_snippet(ComprehensiveLayoutDemo, ($$anchor, $$slotProps) => {
										$.add_svelte_meta(() => Text($$anchor, { text: 'Flex: 1', variant: 'warning' }), 'component', ComprehensiveLayoutDemo, 41, 6, { componentTag: 'Text' });
									}),

									$$slots: { default: true }
								}),
								'component',
								ComprehensiveLayoutDemo,
								40,
								4,
								{ componentTag: 'Box' }
							);

							$.append($$anchor, fragment_3);
						}),

						$$slots: { default: true }
					}),
					'component',
					ComprehensiveLayoutDemo,
					27,
					2,
					{ componentTag: 'Box' }
				);

				var node_6 = $.sibling(node_2, 2);

				$.add_svelte_meta(
					() => Box(node_6, {
						flexDirection: 'row',
						height: 3,
						gap: 1,

						children: $.wrap_snippet(ComprehensiveLayoutDemo, ($$anchor, $$slotProps) => {
							var fragment_7 = root_7();
							var node_7 = $.first_child(fragment_7);

							$.add_svelte_meta(
								() => Box(node_7, {
									width: '25%',
									border: 'rounded',
									variant: 'success',
									padding: 1,

									children: $.wrap_snippet(ComprehensiveLayoutDemo, ($$anchor, $$slotProps) => {
										$.add_svelte_meta(() => Text($$anchor, { text: '25%', variant: 'success' }), 'component', ComprehensiveLayoutDemo, 52, 6, { componentTag: 'Text' });
									}),

									$$slots: { default: true }
								}),
								'component',
								ComprehensiveLayoutDemo,
								51,
								4,
								{ componentTag: 'Box' }
							);

							var node_8 = $.sibling(node_7, 2);

							$.add_svelte_meta(
								() => Box(node_8, {
									width: '50%',
									border: 'rounded',
									variant: 'warning',
									padding: 1,

									children: $.wrap_snippet(ComprehensiveLayoutDemo, ($$anchor, $$slotProps) => {
										$.add_svelte_meta(() => Text($$anchor, { text: '50%', variant: 'warning' }), 'component', ComprehensiveLayoutDemo, 55, 6, { componentTag: 'Text' });
									}),

									$$slots: { default: true }
								}),
								'component',
								ComprehensiveLayoutDemo,
								54,
								4,
								{ componentTag: 'Box' }
							);

							var node_9 = $.sibling(node_8, 2);

							$.add_svelte_meta(
								() => Box(node_9, {
									width: '25%',
									border: 'rounded',
									variant: 'danger',
									padding: 1,

									children: $.wrap_snippet(ComprehensiveLayoutDemo, ($$anchor, $$slotProps) => {
										$.add_svelte_meta(() => Text($$anchor, { text: '25%', variant: 'danger' }), 'component', ComprehensiveLayoutDemo, 58, 6, { componentTag: 'Text' });
									}),

									$$slots: { default: true }
								}),
								'component',
								ComprehensiveLayoutDemo,
								57,
								4,
								{ componentTag: 'Box' }
							);

							$.append($$anchor, fragment_7);
						}),

						$$slots: { default: true }
					}),
					'component',
					ComprehensiveLayoutDemo,
					46,
					2,
					{ componentTag: 'Box' }
				);

				var node_10 = $.sibling(node_6, 2);

				$.add_svelte_meta(
					() => Box(node_10, {
						flexGrow: 1,
						flexDirection: 'row',
						gap: 1,
						minHeight: 8,

						children: $.wrap_snippet(ComprehensiveLayoutDemo, ($$anchor, $$slotProps) => {
							var fragment_11 = root_11();
							var node_11 = $.first_child(fragment_11);

							$.add_svelte_meta(
								() => Box(node_11, {
									width: '30%',
									flexDirection: 'column',
									border: 'single',
									variant: 'secondary',
									padding: 1,
									gap: 1,

									children: $.wrap_snippet(ComprehensiveLayoutDemo, ($$anchor, $$slotProps) => {
										var fragment_12 = root_12();
										var node_12 = $.first_child(fragment_12);

										$.add_svelte_meta(() => Text(node_12, { text: 'Left Column', variant: 'secondary', bold: true }), 'component', ComprehensiveLayoutDemo, 78, 6, { componentTag: 'Text' });

										var node_13 = $.sibling(node_12, 2);

										$.add_svelte_meta(
											() => Box(node_13, {
												flexGrow: 1,
												backgroundColor: '#2d1b69',
												padding: 1,

												children: $.wrap_snippet(ComprehensiveLayoutDemo, ($$anchor, $$slotProps) => {
													$.add_svelte_meta(() => Text($$anchor, { text: 'Item 1', color: 'white' }), 'component', ComprehensiveLayoutDemo, 80, 8, { componentTag: 'Text' });
												}),

												$$slots: { default: true }
											}),
											'component',
											ComprehensiveLayoutDemo,
											79,
											6,
											{ componentTag: 'Box' }
										);

										var node_14 = $.sibling(node_13, 2);

										$.add_svelte_meta(
											() => Box(node_14, {
												flexGrow: 1,
												backgroundColor: '#3d2b79',
												padding: 1,

												children: $.wrap_snippet(ComprehensiveLayoutDemo, ($$anchor, $$slotProps) => {
													$.add_svelte_meta(() => Text($$anchor, { text: 'Item 2', color: 'white' }), 'component', ComprehensiveLayoutDemo, 83, 8, { componentTag: 'Text' });
												}),

												$$slots: { default: true }
											}),
											'component',
											ComprehensiveLayoutDemo,
											82,
											6,
											{ componentTag: 'Box' }
										);

										$.append($$anchor, fragment_12);
									}),

									$$slots: { default: true }
								}),
								'component',
								ComprehensiveLayoutDemo,
								70,
								4,
								{ componentTag: 'Box' }
							);

							var node_15 = $.sibling(node_11, 2);

							$.add_svelte_meta(
								() => Box(node_15, {
									flexGrow: 1,
									position: 'relative',
									border: 'dashed',
									variant: 'primary',
									padding: 1,

									children: $.wrap_snippet(ComprehensiveLayoutDemo, ($$anchor, $$slotProps) => {
										var fragment_15 = root_15();
										var node_16 = $.first_child(fragment_15);

										$.add_svelte_meta(() => Text(node_16, { text: 'Relative Container', muted: true }), 'component', ComprehensiveLayoutDemo, 95, 6, { componentTag: 'Text' });

										var node_17 = $.sibling(node_16, 2);

										$.add_svelte_meta(
											() => Box(node_17, {
												position: 'absolute',
												top: 2,
												left: 2,
												width: 15,
												height: 2,
												backgroundColor: '#ff6b6b',
												padding: 1,

												children: $.wrap_snippet(ComprehensiveLayoutDemo, ($$anchor, $$slotProps) => {
													$.add_svelte_meta(() => Text($$anchor, { text: 'Abs @2,2', color: 'white' }), 'component', ComprehensiveLayoutDemo, 107, 8, { componentTag: 'Text' });
												}),

												$$slots: { default: true }
											}),
											'component',
											ComprehensiveLayoutDemo,
											98,
											6,
											{ componentTag: 'Box' }
										);

										var node_18 = $.sibling(node_17, 2);

										$.add_svelte_meta(
											() => Box(node_18, {
												position: 'absolute',
												top: 4,
												left: 10,
												width: 20,
												height: 2,
												backgroundColor: '#4ecdc4',
												padding: 1,

												children: $.wrap_snippet(ComprehensiveLayoutDemo, ($$anchor, $$slotProps) => {
													$.add_svelte_meta(() => Text($$anchor, { text: 'Abs @10,4', color: 'black' }), 'component', ComprehensiveLayoutDemo, 119, 8, { componentTag: 'Text' });
												}),

												$$slots: { default: true }
											}),
											'component',
											ComprehensiveLayoutDemo,
											110,
											6,
											{ componentTag: 'Box' }
										);

										$.append($$anchor, fragment_15);
									}),

									$$slots: { default: true }
								}),
								'component',
								ComprehensiveLayoutDemo,
								88,
								4,
								{ componentTag: 'Box' }
							);

							var node_19 = $.sibling(node_15, 2);

							$.add_svelte_meta(
								() => Box(node_19, {
									width: '25%',
									flexDirection: 'column',
									border: 'single',
									variant: 'info',
									padding: 1,
									alignItems: 'center',
									justifyContent: 'space-between',

									children: $.wrap_snippet(ComprehensiveLayoutDemo, ($$anchor, $$slotProps) => {
										var fragment_18 = root_18();
										var node_20 = $.first_child(fragment_18);

										$.add_svelte_meta(() => Text(node_20, { text: 'Top', variant: 'danger' }), 'component', ComprehensiveLayoutDemo, 133, 6, { componentTag: 'Text' });

										var node_21 = $.sibling(node_20, 2);

										$.add_svelte_meta(() => Text(node_21, { text: 'Center', variant: 'warning' }), 'component', ComprehensiveLayoutDemo, 134, 6, { componentTag: 'Text' });

										var node_22 = $.sibling(node_21, 2);

										$.add_svelte_meta(() => Text(node_22, { text: 'Bottom', variant: 'success' }), 'component', ComprehensiveLayoutDemo, 135, 6, { componentTag: 'Text' });
										$.append($$anchor, fragment_18);
									}),

									$$slots: { default: true }
								}),
								'component',
								ComprehensiveLayoutDemo,
								124,
								4,
								{ componentTag: 'Box' }
							);

							$.append($$anchor, fragment_11);
						}),

						$$slots: { default: true }
					}),
					'component',
					ComprehensiveLayoutDemo,
					63,
					2,
					{ componentTag: 'Box' }
				);

				var node_23 = $.sibling(node_10, 2);

				$.add_svelte_meta(
					() => Box(node_23, {
						height: 5,
						border: 'single',
						variant: 'secondary',
						overflow: 'scroll',
						padding: 1,
						focusable: true,
						tabIndex: 1,

						children: $.wrap_snippet(ComprehensiveLayoutDemo, ($$anchor, $$slotProps) => {
							var fragment_19 = root_19();
							var node_24 = $.first_child(fragment_19);

							$.add_svelte_meta(
								() => Text(node_24, {
									text: '📜 Scrollable Area (use arrows when focused)',
									variant: 'secondary',
									bold: true
								}),
								'component',
								ComprehensiveLayoutDemo,
								149,
								4,
								{ componentTag: 'Text' }
							);

							var node_25 = $.sibling(node_24, 2);

							$.add_svelte_meta(() => Text(node_25, { text: 'Line 1: The quick brown fox jumps over the lazy dog' }), 'component', ComprehensiveLayoutDemo, 150, 4, { componentTag: 'Text' });

							var node_26 = $.sibling(node_25, 2);

							$.add_svelte_meta(() => Text(node_26, { text: 'Line 2: Pack my box with five dozen liquor jugs' }), 'component', ComprehensiveLayoutDemo, 151, 4, { componentTag: 'Text' });

							var node_27 = $.sibling(node_26, 2);

							$.add_svelte_meta(() => Text(node_27, { text: 'Line 3: How vexingly quick daft zebras jump' }), 'component', ComprehensiveLayoutDemo, 152, 4, { componentTag: 'Text' });

							var node_28 = $.sibling(node_27, 2);

							$.add_svelte_meta(() => Text(node_28, { text: 'Line 4: The five boxing wizards jump quickly' }), 'component', ComprehensiveLayoutDemo, 153, 4, { componentTag: 'Text' });

							var node_29 = $.sibling(node_28, 2);

							$.add_svelte_meta(() => Text(node_29, { text: 'Line 5: Sphinx of black quartz, judge my vow' }), 'component', ComprehensiveLayoutDemo, 154, 4, { componentTag: 'Text' });

							var node_30 = $.sibling(node_29, 2);

							$.add_svelte_meta(() => Text(node_30, { text: 'Line 6: Two driven jocks help fax my big quiz' }), 'component', ComprehensiveLayoutDemo, 155, 4, { componentTag: 'Text' });

							var node_31 = $.sibling(node_30, 2);

							$.add_svelte_meta(() => Text(node_31, { text: 'Line 7: Five quacking zephyrs jolt my wax bed' }), 'component', ComprehensiveLayoutDemo, 156, 4, { componentTag: 'Text' });

							var node_32 = $.sibling(node_31, 2);

							$.add_svelte_meta(() => Text(node_32, { text: 'Line 8: The jay, pig, fox, zebra and my wolves quack' }), 'component', ComprehensiveLayoutDemo, 157, 4, { componentTag: 'Text' });

							var node_33 = $.sibling(node_32, 2);

							$.add_svelte_meta(() => Text(node_33, { text: 'Line 9: Jinxed wizards pluck ivy from the big quilt' }), 'component', ComprehensiveLayoutDemo, 158, 4, { componentTag: 'Text' });

							var node_34 = $.sibling(node_33, 2);

							$.add_svelte_meta(() => Text(node_34, { text: 'Line 10: ⬇️ More content below...' }), 'component', ComprehensiveLayoutDemo, 159, 4, { componentTag: 'Text' });
							$.append($$anchor, fragment_19);
						}),

						$$slots: { default: true }
					}),
					'component',
					ComprehensiveLayoutDemo,
					140,
					2,
					{ componentTag: 'Box' }
				);

				var node_35 = $.sibling(node_23, 2);

				$.add_svelte_meta(
					() => Box(node_35, {
						flexDirection: 'row',
						height: 3,
						gap: 2,

						children: $.wrap_snippet(ComprehensiveLayoutDemo, ($$anchor, $$slotProps) => {
							var fragment_20 = root_20();
							var node_36 = $.first_child(fragment_20);

							$.add_svelte_meta(
								() => Box(node_36, {
									marginX: 1,
									paddingX: 2,
									border: 'single',
									variant: 'warning',

									children: $.wrap_snippet(ComprehensiveLayoutDemo, ($$anchor, $$slotProps) => {
										$.add_svelte_meta(() => Text($$anchor, { text: 'MX=1 PX=2', variant: 'warning' }), 'component', ComprehensiveLayoutDemo, 174, 6, { componentTag: 'Text' });
									}),

									$$slots: { default: true }
								}),
								'component',
								ComprehensiveLayoutDemo,
								168,
								4,
								{ componentTag: 'Box' }
							);

							var node_37 = $.sibling(node_36, 2);

							$.add_svelte_meta(
								() => Box(node_37, {
									marginY: 1,
									padding: 1,
									border: 'single',
									variant: 'danger',

									children: $.wrap_snippet(ComprehensiveLayoutDemo, ($$anchor, $$slotProps) => {
										$.add_svelte_meta(() => Text($$anchor, { text: 'MY=1 P=1', variant: 'danger' }), 'component', ComprehensiveLayoutDemo, 183, 6, { componentTag: 'Text' });
									}),

									$$slots: { default: true }
								}),
								'component',
								ComprehensiveLayoutDemo,
								177,
								4,
								{ componentTag: 'Box' }
							);

							var node_38 = $.sibling(node_37, 2);

							$.add_svelte_meta(
								() => Box(node_38, {
									padding: 2,
									border: 'double',
									variant: 'success',

									children: $.wrap_snippet(ComprehensiveLayoutDemo, ($$anchor, $$slotProps) => {
										$.add_svelte_meta(() => Text($$anchor, { text: 'P=2', variant: 'success' }), 'component', ComprehensiveLayoutDemo, 191, 6, { componentTag: 'Text' });
									}),

									$$slots: { default: true }
								}),
								'component',
								ComprehensiveLayoutDemo,
								186,
								4,
								{ componentTag: 'Box' }
							);

							$.append($$anchor, fragment_20);
						}),

						$$slots: { default: true }
					}),
					'component',
					ComprehensiveLayoutDemo,
					163,
					2,
					{ componentTag: 'Box' }
				);

				var node_39 = $.sibling(node_35, 2);

				$.add_svelte_meta(
					() => Box(node_39, {
						flexDirection: 'row',
						justifyContent: 'space-between',
						variant: 'primary',
						border: 'single',
						padding: 1,

						children: $.wrap_snippet(ComprehensiveLayoutDemo, ($$anchor, $$slotProps) => {
							var fragment_24 = root_24();
							var node_40 = $.first_child(fragment_24);

							$.add_svelte_meta(() => Text(node_40, { text: '◀ Left', variant: 'danger' }), 'component', ComprehensiveLayoutDemo, 203, 4, { componentTag: 'Text' });

							var node_41 = $.sibling(node_40, 2);

							$.add_svelte_meta(() => Text(node_41, { text: '⬛ Center', variant: 'info' }), 'component', ComprehensiveLayoutDemo, 204, 4, { componentTag: 'Text' });

							var node_42 = $.sibling(node_41, 2);

							$.add_svelte_meta(() => Text(node_42, { text: 'Right ▶', variant: 'success' }), 'component', ComprehensiveLayoutDemo, 205, 4, { componentTag: 'Text' });
							$.append($$anchor, fragment_24);
						}),

						$$slots: { default: true }
					}),
					'component',
					ComprehensiveLayoutDemo,
					196,
					2,
					{ componentTag: 'Box' }
				);

				$.append($$anchor, fragment_1);
			}),

			$$slots: { default: true }
		}),
		'component',
		ComprehensiveLayoutDemo,
		10,
		0,
		{ componentTag: 'Box' }
	);

	return $.pop($$exports);
}