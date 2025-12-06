import 'svelte/internal/disclose-version';

ComplexScrollDemo[$.FILENAME] = 'src/test/ComplexScrollDemo.svelte';

import * as $ from 'svelte/internal/client';
import Box from '../components/Box.svelte.mjs';
import Text from '../components/Text.svelte.mjs';

var root_5 = $.add_locations($.from_html(`<!> <!> <!>`, 1), ComplexScrollDemo[$.FILENAME], []);
var root_10 = $.add_locations($.from_html(`<!> <!> <!>`, 1), ComplexScrollDemo[$.FILENAME], []);
var root_8 = $.add_locations($.from_html(`<!> <!> <!> <!>`, 1), ComplexScrollDemo[$.FILENAME], []);
var root_3 = $.add_locations($.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1), ComplexScrollDemo[$.FILENAME], []);
var root_2 = $.add_locations($.from_html(`<!> <!> <!>`, 1), ComplexScrollDemo[$.FILENAME], []);
var root_14 = $.add_locations($.from_html(`<!> <!> <!>`, 1), ComplexScrollDemo[$.FILENAME], []);
var root_16 = $.add_locations($.from_html(`<!> <!> <!>`, 1), ComplexScrollDemo[$.FILENAME], []);
var root_13 = $.add_locations($.from_html(`<!> <!> <!>`, 1), ComplexScrollDemo[$.FILENAME], []);
var root_1 = $.add_locations($.from_html(`<!> <!> <!>`, 1), ComplexScrollDemo[$.FILENAME], []);

export default function ComplexScrollDemo($$anchor, $$props) {
	$.check_target(new.target);
	$.push($$props, true, ComplexScrollDemo);

	// Focus states for all scrollable containers
	let focusedOuter = $.tag($.state(false), 'focusedOuter');

	let focusedNested1 = $.tag($.state(false), 'focusedNested1');
	let focusedNested2 = $.tag($.state(false), 'focusedNested2');
	let focusedSidebar = $.tag($.state(false), 'focusedSidebar');
	let focusedCodeView = $.tag($.state(false), 'focusedCodeView');

	// Track which container is actively being scrolled
	let activeScroller = $.tag($.state(''), 'activeScroller');

	function setActiveScroller(name) {
		$.set(activeScroller, name, true);

		// Clear after a moment to show status
		setTimeout(() => $.set(activeScroller, ''), 2000);
	}

	var $$exports = { ...$.legacy_api() };

	$.add_svelte_meta(
		() => Box($$anchor, {
			width: '100%',
			height: '100%',
			flexDirection: 'row',
			gap: 1,
			padding: 1,

			children: $.wrap_snippet(ComplexScrollDemo, ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node = $.first_child(fragment_1);

				$.add_svelte_meta(
					() => Box(node, {
						width: '30%',
						flexDirection: 'column',
						gap: 1,

						children: $.wrap_snippet(ComplexScrollDemo, ($$anchor, $$slotProps) => {
							var fragment_2 = root_2();
							var node_1 = $.first_child(fragment_2);

							$.add_svelte_meta(
								() => Text(node_1, {
									text: '🎯 Complex Nested Scrolling Demo',
									variant: 'primary',
									bold: true
								}),
								'component',
								ComplexScrollDemo,
								35,
								4,
								{ componentTag: 'Text' }
							);

							var node_2 = $.sibling(node_1, 2);

							$.add_svelte_meta(
								() => Text(node_2, {
									text: 'Tab through containers, use arrows to scroll',
									variant: 'warning'
								}),
								'component',
								ComplexScrollDemo,
								36,
								4,
								{ componentTag: 'Text' }
							);

							var node_3 = $.sibling(node_2, 2);

							{
								let $0 = $.derived(() => $.get(focusedOuter) ? "primary" : "secondary");

								$.add_svelte_meta(
									() => Box(node_3, {
										border: 'double',

										get variant() {
											return $.get($0);
										},

										padding: 1,
										height: 20,
										focusable: true,
										tabIndex: 1,
										onfocus: () => setActiveScroller("Outer Container"),

										get focused() {
											return $.get(focusedOuter);
										},

										set focused($$value) {
											$.set(focusedOuter, $$value, true);
										},

										children: $.wrap_snippet(ComplexScrollDemo, ($$anchor, $$slotProps) => {
											var fragment_3 = root_3();
											var node_4 = $.first_child(fragment_3);

											{
												let $0 = $.derived(() => $.get(focusedOuter) ? "📦 OUTER CONTAINER (Focused)" : "📦 Outer Container");
												let $1 = $.derived(() => $.get(focusedOuter) ? "primary" : "info");

												$.add_svelte_meta(
													() => Text(node_4, {
														get text() {
															return $.get($0);
														},

														get variant() {
															return $.get($1);
														},

														bold: true
													}),
													'component',
													ComplexScrollDemo,
													49,
													6,
													{ componentTag: 'Text' }
												);
											}

											var node_5 = $.sibling(node_4, 2);

											$.add_svelte_meta(() => Text(node_5, { text: 'This container has 40+ lines of content', muted: true }), 'component', ComplexScrollDemo, 51, 6, { componentTag: 'Text' });

											var node_6 = $.sibling(node_5, 2);

											$.add_svelte_meta(
												() => $.each(node_6, 16, () => Array(5), $.index, ($$anchor, _, i) => {
													$.add_svelte_meta(() => Text($$anchor, { text: `Outer line ${i + 1}: Content before nested boxes` }), 'component', ComplexScrollDemo, 55, 8, { componentTag: 'Text' });
												}),
												'each',
												ComplexScrollDemo,
												54,
												6
											);

											var node_7 = $.sibling(node_6, 2);

											{
												let $0 = $.derived(() => $.get(focusedNested1) ? "success" : "secondary");

												$.add_svelte_meta(
													() => Box(node_7, {
														border: 'single',

														get variant() {
															return $.get($0);
														},

														padding: 1,
														height: 8,
														marginTop: 1,
														marginBottom: 1,
														focusable: true,
														tabIndex: 2,
														onfocus: () => setActiveScroller("Nested Box 1"),

														get focused() {
															return $.get(focusedNested1);
														},

														set focused($$value) {
															$.set(focusedNested1, $$value, true);
														},

														children: $.wrap_snippet(ComplexScrollDemo, ($$anchor, $$slotProps) => {
															var fragment_5 = root_5();
															var node_8 = $.first_child(fragment_5);

															{
																let $0 = $.derived(() => $.get(focusedNested1) ? "📂 NESTED BOX 1 (Focused)" : "📂 Nested Box 1");
																let $1 = $.derived(() => $.get(focusedNested1) ? "success" : "secondary");

																$.add_svelte_meta(
																	() => Text(node_8, {
																		get text() {
																			return $.get($0);
																		},

																		get variant() {
																			return $.get($1);
																		},

																		bold: true
																	}),
																	'component',
																	ComplexScrollDemo,
																	71,
																	8,
																	{ componentTag: 'Text' }
																);
															}

															var node_9 = $.sibling(node_8, 2);

															$.add_svelte_meta(() => Text(node_9, { text: 'Independent scrolling - 15 items', variant: 'success' }), 'component', ComplexScrollDemo, 73, 8, { componentTag: 'Text' });

															var node_10 = $.sibling(node_9, 2);

															$.add_svelte_meta(
																() => $.each(node_10, 16, () => Array(15), $.index, ($$anchor, _, i) => {
																	$.add_svelte_meta(
																		() => Text($$anchor, {
																			text: `  Nested item ${i + 1}: This scrolls independently`,
																			color: 'green'
																		}),
																		'component',
																		ComplexScrollDemo,
																		75,
																		10,
																		{ componentTag: 'Text' }
																	);
																}),
																'each',
																ComplexScrollDemo,
																74,
																8
															);

															$.append($$anchor, fragment_5);
														}),

														$$slots: { default: true }
													}),
													'component',
													ComplexScrollDemo,
													59,
													6,
													{ componentTag: 'Box' }
												);
											}

											var node_11 = $.sibling(node_7, 2);

											$.add_svelte_meta(
												() => $.each(node_11, 16, () => Array(3), $.index, ($$anchor, _, i) => {
													$.add_svelte_meta(() => Text($$anchor, { text: `Outer line ${i + 6}: Content between nested boxes` }), 'component', ComplexScrollDemo, 81, 8, { componentTag: 'Text' });
												}),
												'each',
												ComplexScrollDemo,
												80,
												6
											);

											var node_12 = $.sibling(node_11, 2);

											{
												let $0 = $.derived(() => $.get(focusedNested2) ? "danger" : "secondary");

												$.add_svelte_meta(
													() => Box(node_12, {
														border: 'single',

														get variant() {
															return $.get($0);
														},

														padding: 1,
														height: 10,
														marginTop: 1,
														marginBottom: 1,
														focusable: true,
														tabIndex: 3,
														onfocus: () => setActiveScroller("Nested Box 2"),

														get focused() {
															return $.get(focusedNested2);
														},

														set focused($$value) {
															$.set(focusedNested2, $$value, true);
														},

														children: $.wrap_snippet(ComplexScrollDemo, ($$anchor, $$slotProps) => {
															var fragment_8 = root_8();
															var node_13 = $.first_child(fragment_8);

															{
																let $0 = $.derived(() => $.get(focusedNested2) ? "📁 NESTED BOX 2 (Focused)" : "📁 Nested Box 2");
																let $1 = $.derived(() => $.get(focusedNested2) ? "danger" : "secondary");

																$.add_svelte_meta(
																	() => Text(node_13, {
																		get text() {
																			return $.get($0);
																		},

																		get variant() {
																			return $.get($1);
																		},

																		bold: true
																	}),
																	'component',
																	ComplexScrollDemo,
																	97,
																	8,
																	{ componentTag: 'Text' }
																);
															}

															var node_14 = $.sibling(node_13, 2);

															$.add_svelte_meta(() => Text(node_14, { text: 'Contains a mix of text and boxes', variant: 'danger' }), 'component', ComplexScrollDemo, 99, 8, { componentTag: 'Text' });

															var node_15 = $.sibling(node_14, 2);

															$.add_svelte_meta(
																() => $.each(node_15, 16, () => Array(3), $.index, ($$anchor, _, i) => {
																	$.add_svelte_meta(
																		() => Box($$anchor, {
																			border: 'single',
																			padding: 1,
																			marginBottom: 1,
																			variant: 'danger',

																			children: $.wrap_snippet(ComplexScrollDemo, ($$anchor, $$slotProps) => {
																				var fragment_10 = root_10();
																				var node_16 = $.first_child(fragment_10);

																				$.add_svelte_meta(() => Text(node_16, { text: `Mini box ${i + 1}`, bold: true, color: 'red' }), 'component', ComplexScrollDemo, 103, 12, { componentTag: 'Text' });

																				var node_17 = $.sibling(node_16, 2);

																				$.add_svelte_meta(() => Text(node_17, { text: 'With multiple lines', color: 'red' }), 'component', ComplexScrollDemo, 104, 12, { componentTag: 'Text' });

																				var node_18 = $.sibling(node_17, 2);

																				$.add_svelte_meta(() => Text(node_18, { text: 'To test clipping', color: 'red' }), 'component', ComplexScrollDemo, 105, 12, { componentTag: 'Text' });
																				$.append($$anchor, fragment_10);
																			}),

																			$$slots: { default: true }
																		}),
																		'component',
																		ComplexScrollDemo,
																		102,
																		10,
																		{ componentTag: 'Box' }
																	);
																}),
																'each',
																ComplexScrollDemo,
																101,
																8
															);

															var node_19 = $.sibling(node_15, 2);

															$.add_svelte_meta(
																() => $.each(node_19, 16, () => Array(5), $.index, ($$anchor, _, i) => {
																	$.add_svelte_meta(
																		() => Text($$anchor, {
																			text: `  Additional line ${i + 1} in nested box 2`,
																			color: 'red'
																		}),
																		'component',
																		ComplexScrollDemo,
																		110,
																		10,
																		{ componentTag: 'Text' }
																	);
																}),
																'each',
																ComplexScrollDemo,
																109,
																8
															);

															$.append($$anchor, fragment_8);
														}),

														$$slots: { default: true }
													}),
													'component',
													ComplexScrollDemo,
													85,
													6,
													{ componentTag: 'Box' }
												);
											}

											var node_20 = $.sibling(node_12, 2);

											$.add_svelte_meta(
												() => $.each(node_20, 16, () => Array(20), $.index, ($$anchor, _, i) => {
													$.add_svelte_meta(
														() => Text($$anchor, {
															text: `Outer line ${i + 9}: Content after nested boxes to make it scrollable`
														}),
														'component',
														ComplexScrollDemo,
														116,
														8,
														{ componentTag: 'Text' }
													);
												}),
												'each',
												ComplexScrollDemo,
												115,
												6
											);

											$.append($$anchor, fragment_3);
										}),

										$$slots: { default: true }
									}),
									'component',
									ComplexScrollDemo,
									39,
									4,
									{ componentTag: 'Box' }
								);
							}

							$.append($$anchor, fragment_2);
						}),

						$$slots: { default: true }
					}),
					'component',
					ComplexScrollDemo,
					30,
					2,
					{ componentTag: 'Box' }
				);

				var node_21 = $.sibling(node, 2);

				$.add_svelte_meta(
					() => Box(node_21, {
						flexDirection: 'column',
						width: '70%',
						gap: 1,

						children: $.wrap_snippet(ComplexScrollDemo, ($$anchor, $$slotProps) => {
							var fragment_13 = root_13();
							var node_22 = $.first_child(fragment_13);

							{
								let $0 = $.derived(() => $.get(focusedCodeView) ? "info" : "secondary");

								$.add_svelte_meta(
									() => Box(node_22, {
										border: 'single',

										get variant() {
											return $.get($0);
										},

										padding: 1,
										height: 10,
										focusable: true,
										tabIndex: 4,
										onfocus: () => setActiveScroller("Code View"),

										get focused() {
											return $.get(focusedCodeView);
										},

										set focused($$value) {
											$.set(focusedCodeView, $$value, true);
										},

										children: $.wrap_snippet(ComplexScrollDemo, ($$anchor, $$slotProps) => {
											var fragment_14 = root_14();
											var node_23 = $.first_child(fragment_14);

											{
												let $0 = $.derived(() => $.get(focusedCodeView) ? "💻 CODE VIEW (Focused)" : "💻 Code View");
												let $1 = $.derived(() => $.get(focusedCodeView) ? "info" : "secondary");

												$.add_svelte_meta(
													() => Text(node_23, {
														get text() {
															return $.get($0);
														},

														get variant() {
															return $.get($1);
														},

														bold: true
													}),
													'component',
													ComplexScrollDemo,
													138,
													6,
													{ componentTag: 'Text' }
												);
											}

											var node_24 = $.sibling(node_23, 2);

											$.add_svelte_meta(
												() => Text(node_24, {
													text: 'Long lines to test horizontal scroll (when implemented)',
													muted: true
												}),
												'component',
												ComplexScrollDemo,
												140,
												6,
												{ componentTag: 'Text' }
											);

											var node_25 = $.sibling(node_24, 2);

											$.add_svelte_meta(
												() => $.each(node_25, 16, () => Array(15), $.index, ($$anchor, _, i) => {
													{
														let $0 = $.derived(() => `${String(i + 1).padStart(3, '0')} | const veryLongVariableName = "This is a very long line that would benefit from horizontal scrolling when implemented";`);

														$.add_svelte_meta(
															() => Text($$anchor, {
																get text() {
																	return $.get($0);
																},

																color: 'cyan'
															}),
															'component',
															ComplexScrollDemo,
															142,
															8,
															{ componentTag: 'Text' }
														);
													}
												}),
												'each',
												ComplexScrollDemo,
												141,
												6
											);

											$.append($$anchor, fragment_14);
										}),

										$$slots: { default: true }
									}),
									'component',
									ComplexScrollDemo,
									128,
									4,
									{ componentTag: 'Box' }
								);
							}

							var node_26 = $.sibling(node_22, 2);

							{
								let $0 = $.derived(() => $.get(focusedSidebar) ? "warning" : "secondary");

								$.add_svelte_meta(
									() => Box(node_26, {
										border: 'single',

										get variant() {
											return $.get($0);
										},

										padding: 1,
										flexGrow: 1,
										flexDirection: 'column',
										focusable: true,
										tabIndex: 5,
										onfocus: () => setActiveScroller("Sidebar"),

										get focused() {
											return $.get(focusedSidebar);
										},

										set focused($$value) {
											$.set(focusedSidebar, $$value, true);
										},

										children: $.wrap_snippet(ComplexScrollDemo, ($$anchor, $$slotProps) => {
											var fragment_16 = root_16();
											var node_27 = $.first_child(fragment_16);

											{
												let $0 = $.derived(() => $.get(focusedSidebar) ? "📋 SIDEBAR (Focused)" : "📋 Sidebar");
												let $1 = $.derived(() => $.get(focusedSidebar) ? "warning" : "secondary");

												$.add_svelte_meta(
													() => Text(node_27, {
														get text() {
															return $.get($0);
														},

														get variant() {
															return $.get($1);
														},

														bold: true
													}),
													'component',
													ComplexScrollDemo,
													159,
													6,
													{ componentTag: 'Text' }
												);
											}

											var node_28 = $.sibling(node_27, 2);

											$.add_svelte_meta(() => Text(node_28, { text: 'File listing with many items', muted: true }), 'component', ComplexScrollDemo, 161, 6, { componentTag: 'Text' });

											var node_29 = $.sibling(node_28, 2);

											$.add_svelte_meta(
												() => $.each(node_29, 16, () => Array(30), $.index, ($$anchor, _, i) => {
													{
														let $0 = $.derived(() => `📄 file-${String(i + 1).padStart(3, '0')}.ts`);

														$.add_svelte_meta(
															() => Text($$anchor, {
																get text() {
																	return $.get($0);
																},

																color: $.strict_equals(i % 3, 0)
																	? "yellow"
																	: $.strict_equals(i % 3, 1) ? "magenta" : "white"
															}),
															'component',
															ComplexScrollDemo,
															163,
															8,
															{ componentTag: 'Text' }
														);
													}
												}),
												'each',
												ComplexScrollDemo,
												162,
												6
											);

											$.append($$anchor, fragment_16);
										}),

										$$slots: { default: true }
									}),
									'component',
									ComplexScrollDemo,
									148,
									4,
									{ componentTag: 'Box' }
								);
							}

							var node_30 = $.sibling(node_26, 2);

							$.add_svelte_meta(
								() => Box(node_30, {
									border: 'single',
									padding: 1,
									height: 3,
									variant: 'primary',

									children: $.wrap_snippet(ComplexScrollDemo, ($$anchor, $$slotProps) => {
										{
											let $0 = $.derived(() => $.get(activeScroller) ? `🎮 Scrolling: ${$.get(activeScroller)}` : "🎮 Ready");

											$.add_svelte_meta(
												() => Text($$anchor, {
													get text() {
														return $.get($0);
													},

													variant: 'primary',
													bold: true
												}),
												'component',
												ComplexScrollDemo,
												175,
												6,
												{ componentTag: 'Text' }
											);
										}
									}),

									$$slots: { default: true }
								}),
								'component',
								ComplexScrollDemo,
								169,
								4,
								{ componentTag: 'Box' }
							);

							$.append($$anchor, fragment_13);
						}),

						$$slots: { default: true }
					}),
					'component',
					ComplexScrollDemo,
					122,
					2,
					{ componentTag: 'Box' }
				);

				var node_31 = $.sibling(node_21, 2);

				$.add_svelte_meta(
					() => Box(node_31, {
						position: 'absolute',
						bottom: 0,
						left: 0,

						children: $.wrap_snippet(ComplexScrollDemo, ($$anchor, $$slotProps) => {
							$.add_svelte_meta(
								() => Text($$anchor, {
									text: 'Tab: Next | Shift+Tab: Previous | ↑↓: Scroll | PgUp/PgDn: Page | Ctrl+C: Exit',
									color: 'gray',
									dim: true
								}),
								'component',
								ComplexScrollDemo,
								182,
								4,
								{ componentTag: 'Text' }
							);
						}),

						$$slots: { default: true }
					}),
					'component',
					ComplexScrollDemo,
					181,
					2,
					{ componentTag: 'Box' }
				);

				$.append($$anchor, fragment_1);
			}),

			$$slots: { default: true }
		}),
		'component',
		ComplexScrollDemo,
		22,
		0,
		{ componentTag: 'Box' }
	);

	return $.pop($$exports);
}