import 'svelte/internal/disclose-version';

Demo_launcher[$.FILENAME] = 'examples/impressive-demos/demo-launcher.svelte';

import * as $ from 'svelte/internal/client';
import { Box, Text, List, Button } from '../../src/components/ui';
import { getCurrentTheme } from '../../src/theme/currentTheme.svelte';
// Import our demos (compiled versions)
import CounterDemo from './counter-demo.svelte.mjs';
import DashboardDemo from './dashboard-demo.svelte.mjs';
import ThemeShowcase from './theme-showcase.svelte.mjs';

var root_2 = $.add_locations($.template(`<!> <!>`, 1), Demo_launcher[$.FILENAME], []);
var root_9 = $.add_locations($.template(`<!> <!>`, 1), Demo_launcher[$.FILENAME], []);
var root_12 = $.add_locations($.template(`<!> <!> <!>`, 1), Demo_launcher[$.FILENAME], []);
var root_23 = $.add_locations($.template(`<!> <!>`, 1), Demo_launcher[$.FILENAME], []);
var root_21 = $.add_locations($.template(`<!> <!>`, 1), Demo_launcher[$.FILENAME], []);
var root_17 = $.add_locations($.template(`<!> <!>`, 1), Demo_launcher[$.FILENAME], []);
var root_30 = $.add_locations($.template(`<!> <!> <!> <!> <!>`, 1), Demo_launcher[$.FILENAME], []);
var root_27 = $.add_locations($.template(`<!> <!> <!>`, 1), Demo_launcher[$.FILENAME], []);
var root_38 = $.add_locations($.template(`<!> <!>`, 1), Demo_launcher[$.FILENAME], []);
var root_36 = $.add_locations($.template(`<!> <!> <!>`, 1), Demo_launcher[$.FILENAME], []);
var root_44 = $.add_locations($.template(`<!> <!> <!> <!> <!> <!>`, 1), Demo_launcher[$.FILENAME], []);
var root_42 = $.add_locations($.template(`<!> <!>`, 1), Demo_launcher[$.FILENAME], []);
var root_26 = $.add_locations($.template(`<!> <!> <!>`, 1), Demo_launcher[$.FILENAME], []);
var root_16 = $.add_locations($.template(`<!> <!>`, 1), Demo_launcher[$.FILENAME], []);
var root_51 = $.add_locations($.template(`<!> <!> <!>`, 1), Demo_launcher[$.FILENAME], []);
var root_8 = $.add_locations($.template(`<!> <!> <!> <!>`, 1), Demo_launcher[$.FILENAME], []);

export default function Demo_launcher($$anchor, $$props) {
	$.check_target(new.target);
	$.push($$props, true, Demo_launcher);

	// Get reactive theme
	const theme = getCurrentTheme();

	// Demo configuration
	const demos = [
		{
			id: 'counter',
			name: 'Interactive Counter',
			description: 'Svelte 5 runes, reactive state, auto-increment, themed UI',
			icon: '🔢',
			component: CounterDemo,
			color: 'success'
		},
		{
			id: 'dashboard',
			name: 'System Dashboard',
			description: 'Real-time updates, multiple components, complex layouts',
			icon: '🏠',
			component: DashboardDemo,
			color: 'info'
		},
		{
			id: 'themes',
			name: 'Theme Showcase',
			description: 'Dynamic theming, color palettes, auto-switching',
			icon: '🎨',
			component: ThemeShowcase,
			color: 'warning'
		}
	];

	// State
	let currentDemo = $.state(null);
	let selectedIndex = $.state(0);
	let showWelcome = $.state(true);

	// Functions
	function selectDemo(demo) {
		$.set(currentDemo, demo, true);
		$.set(showWelcome, false);
	}

	function goBack() {
		$.set(currentDemo, null);
		$.set(showWelcome, true);
	}

	function nextDemo() {
		$.set(selectedIndex, ($.get(selectedIndex) + 1) % demos.length);
	}

	function prevDemo() {
		$.set(selectedIndex, $.strict_equals($.get(selectedIndex), 0) ? demos.length - 1 : $.get(selectedIndex) - 1, true);
	}

	function launchSelected() {
		selectDemo(demos[$.get(selectedIndex)]);
	}

	function getColorForDemo(colorName) {
		const colors = theme().getColors();

		return colors[colorName] || colors.primary;
	}

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			Box($$anchor, {
				width: '100%',
				height: '100%',
				children: $.wrap_snippet(Demo_launcher, ($$anchor, $$slotProps) => {
					var fragment_2 = root_2();
					var node_1 = $.first_child(fragment_2);

					Box(node_1, {
						padding: 1,
						borderBottom: true,
						get borderColor() {
							return theme().getColors().secondary;
						},
						children: $.wrap_snippet(Demo_launcher, ($$anchor, $$slotProps) => {
							Button($$anchor, {
								onClick: goBack,
								get color() {
									return theme().getColors().info;
								},
								border: true,
								width: 15,
								children: $.wrap_snippet(Demo_launcher, ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text('← Back to Launcher');

									$.append($$anchor, text);
								}),
								$$slots: { default: true }
							});
						}),
						$$slots: { default: true }
					});

					var node_2 = $.sibling(node_1, 2);

					Box(node_2, {
						width: '100%',
						height: '90%',
						children: $.wrap_snippet(Demo_launcher, ($$anchor, $$slotProps) => {
							var fragment_4 = $.comment();
							var node_3 = $.first_child(fragment_4);

							$.component(node_3, () => $.get(currentDemo).component, ($$anchor, $$component) => {
								$$component($$anchor, {});
							});

							$.append($$anchor, fragment_4);
						}),
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				}),
				$$slots: { default: true }
			});
		};

		var alternate = ($$anchor, $$elseif) => {
			{
				var consequent_1 = ($$anchor) => {
					Box($$anchor, {
						width: '100%',
						height: '100%',
						padding: 2,
						children: $.wrap_snippet(Demo_launcher, ($$anchor, $$slotProps) => {
							var fragment_6 = root_8();
							var node_4 = $.first_child(fragment_6);

							Box(node_4, {
								border: true,
								padding: 2,
								marginBottom: 2,
								get borderColor() {
									return theme().getColors().primary;
								},
								children: $.wrap_snippet(Demo_launcher, ($$anchor, $$slotProps) => {
									var fragment_7 = root_9();
									var node_5 = $.first_child(fragment_7);

									Text(node_5, {
										bold: true,
										fontSize: 'xl',
										get color() {
											return theme().getColors().primary;
										},
										align: 'center',
										children: $.wrap_snippet(Demo_launcher, ($$anchor, $$slotProps) => {
											$.next();

											var text_1 = $.text('🚀 SvelTUI Demo Launcher');

											$.append($$anchor, text_1);
										}),
										$$slots: { default: true }
									});

									var node_6 = $.sibling(node_5, 2);

									Text(node_6, {
										get color() {
											return theme().getColors().secondary;
										},
										align: 'center',
										children: $.wrap_snippet(Demo_launcher, ($$anchor, $$slotProps) => {
											$.next();

											var text_2 = $.text('Svelte 5 Terminal UI Framework - Interactive Demonstrations');

											$.append($$anchor, text_2);
										}),
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_7);
								}),
								$$slots: { default: true }
							});

							var node_7 = $.sibling(node_4, 2);

							Box(node_7, {
								border: true,
								padding: 2,
								marginBottom: 2,
								get borderColor() {
									return theme().getColors().success;
								},
								get backgroundColor() {
									return theme().getColors().background;
								},
								children: $.wrap_snippet(Demo_launcher, ($$anchor, $$slotProps) => {
									var fragment_8 = root_12();
									var node_8 = $.first_child(fragment_8);

									Text(node_8, {
										bold: true,
										get color() {
											return theme().getColors().success;
										},
										align: 'center',
										children: $.wrap_snippet(Demo_launcher, ($$anchor, $$slotProps) => {
											$.next();

											var text_3 = $.text('🎉 BREAKTHROUGH ACHIEVED! 🎉');

											$.append($$anchor, text_3);
										}),
										$$slots: { default: true }
									});

									var node_9 = $.sibling(node_8, 2);

									Text(node_9, {
										get color() {
											return theme().getColors().foreground;
										},
										align: 'center',
										children: $.wrap_snippet(Demo_launcher, ($$anchor, $$slotProps) => {
											$.next();

											var text_4 = $.text('Svelte 5 client-side mounting successfully working in Node.js terminal environment!');

											$.append($$anchor, text_4);
										}),
										$$slots: { default: true }
									});

									var node_10 = $.sibling(node_9, 2);

									Text(node_10, {
										get color() {
											return theme().getColors().secondary;
										},
										align: 'center',
										fontSize: 'small',
										children: $.wrap_snippet(Demo_launcher, ($$anchor, $$slotProps) => {
											$.next();

											var text_5 = $.text('Featuring: Reactive State • Component System • Dynamic Theming • Virtual DOM');

											$.append($$anchor, text_5);
										}),
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_8);
								}),
								$$slots: { default: true }
							});

							var node_11 = $.sibling(node_7, 2);

							Box(node_11, {
								flexDirection: 'row',
								gap: 4,
								height: '60%',
								children: $.wrap_snippet(Demo_launcher, ($$anchor, $$slotProps) => {
									var fragment_9 = root_16();
									var node_12 = $.first_child(fragment_9);

									Box(node_12, {
										width: '60%',
										border: true,
										padding: 1,
										get borderColor() {
											return theme().getColors().info;
										},
										children: $.wrap_snippet(Demo_launcher, ($$anchor, $$slotProps) => {
											var fragment_10 = root_17();
											var node_13 = $.first_child(fragment_10);

											Text(node_13, {
												bold: true,
												get color() {
													return theme().getColors().info;
												},
												children: $.wrap_snippet(Demo_launcher, ($$anchor, $$slotProps) => {
													$.next();

													var text_6 = $.text('📋 Available Demonstrations');

													$.append($$anchor, text_6);
												}),
												$$slots: { default: true }
											});

											var node_14 = $.sibling(node_13, 2);

											Box(node_14, {
												marginTop: 1,
												children: $.wrap_snippet(Demo_launcher, ($$anchor, $$slotProps) => {
													var fragment_11 = $.comment();
													var node_15 = $.first_child(fragment_11);

													$.each(node_15, 17, () => demos, $.index, ($$anchor, demo, index) => {
														const expression = $.derived(() => $.strict_equals(index, $.get(selectedIndex)) ? getColorForDemo($.get(demo).color) : theme().getColors().secondary);
														const expression_1 = $.derived(() => $.strict_equals(index, $.get(selectedIndex)) ? getColorForDemo($.get(demo).color) : 'transparent');

														Box($$anchor, {
															flexDirection: 'row',
															gap: 2,
															padding: 1,
															marginBottom: 1,
															border: true,
															get borderColor() {
																return $.get(expression);
															},
															get backgroundColor() {
																return $.get(expression_1);
															},
															style: 'cursor: pointer',
															onClick: () => $.set(selectedIndex, index, true),
															children: $.wrap_snippet(Demo_launcher, ($$anchor, $$slotProps) => {
																var fragment_13 = root_21();
																var node_16 = $.first_child(fragment_13);
																const expression_2 = $.derived(() => $.strict_equals(index, $.get(selectedIndex)) ? theme().getColors().background : getColorForDemo($.get(demo).color));

																Text(node_16, {
																	fontSize: 'large',
																	get color() {
																		return $.get(expression_2);
																	},
																	children: $.wrap_snippet(Demo_launcher, ($$anchor, $$slotProps) => {
																		$.next();

																		var text_7 = $.text();

																		$.template_effect(() => $.set_text(text_7, $.get(demo).icon));
																		$.append($$anchor, text_7);
																	}),
																	$$slots: { default: true }
																});

																var node_17 = $.sibling(node_16, 2);

																Box(node_17, {
																	flexDirection: 'column',
																	children: $.wrap_snippet(Demo_launcher, ($$anchor, $$slotProps) => {
																		var fragment_15 = root_23();
																		var node_18 = $.first_child(fragment_15);
																		const expression_3 = $.derived(() => $.strict_equals(index, $.get(selectedIndex)) ? theme().getColors().background : theme().getColors().foreground);

																		Text(node_18, {
																			bold: true,
																			get color() {
																				return $.get(expression_3);
																			},
																			children: $.wrap_snippet(Demo_launcher, ($$anchor, $$slotProps) => {
																				$.next();

																				var text_8 = $.text();

																				$.template_effect(() => $.set_text(text_8, $.get(demo).name));
																				$.append($$anchor, text_8);
																			}),
																			$$slots: { default: true }
																		});

																		var node_19 = $.sibling(node_18, 2);
																		const expression_4 = $.derived(() => $.strict_equals(index, $.get(selectedIndex)) ? theme().getColors().background : theme().getColors().secondary);

																		Text(node_19, {
																			fontSize: 'small',
																			get color() {
																				return $.get(expression_4);
																			},
																			children: $.wrap_snippet(Demo_launcher, ($$anchor, $$slotProps) => {
																				$.next();

																				var text_9 = $.text();

																				$.template_effect(() => $.set_text(text_9, $.get(demo).description));
																				$.append($$anchor, text_9);
																			}),
																			$$slots: { default: true }
																		});

																		$.append($$anchor, fragment_15);
																	}),
																	$$slots: { default: true }
																});

																$.append($$anchor, fragment_13);
															}),
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_11);
												}),
												$$slots: { default: true }
											});

											$.append($$anchor, fragment_10);
										}),
										$$slots: { default: true }
									});

									var node_20 = $.sibling(node_12, 2);

									Box(node_20, {
										width: '40%',
										flexDirection: 'column',
										gap: 2,
										children: $.wrap_snippet(Demo_launcher, ($$anchor, $$slotProps) => {
											var fragment_18 = root_26();
											var node_21 = $.first_child(fragment_18);
											const expression_5 = $.derived(() => getColorForDemo(demos[$.get(selectedIndex)].color));

											Box(node_21, {
												border: true,
												padding: 2,
												get borderColor() {
													return $.get(expression_5);
												},
												children: $.wrap_snippet(Demo_launcher, ($$anchor, $$slotProps) => {
													var fragment_19 = root_27();
													var node_22 = $.first_child(fragment_19);
													const expression_6 = $.derived(() => getColorForDemo(demos[$.get(selectedIndex)].color));

													Text(node_22, {
														bold: true,
														get color() {
															return $.get(expression_6);
														},
														fontSize: 'large',
														children: $.wrap_snippet(Demo_launcher, ($$anchor, $$slotProps) => {
															$.next();

															var text_10 = $.text();

															$.template_effect(() => $.set_text(text_10, `${demos[$.get(selectedIndex)].icon ?? ''} ${demos[$.get(selectedIndex)].name ?? ''}`));
															$.append($$anchor, text_10);
														}),
														$$slots: { default: true }
													});

													var node_23 = $.sibling(node_22, 2);

													Text(node_23, {
														get color() {
															return theme().getColors().foreground;
														},
														marginTop: 1,
														children: $.wrap_snippet(Demo_launcher, ($$anchor, $$slotProps) => {
															$.next();

															var text_11 = $.text();

															$.template_effect(() => $.set_text(text_11, demos[$.get(selectedIndex)].description));
															$.append($$anchor, text_11);
														}),
														$$slots: { default: true }
													});

													var node_24 = $.sibling(node_23, 2);

													Box(node_24, {
														marginTop: 2,
														children: $.wrap_snippet(Demo_launcher, ($$anchor, $$slotProps) => {
															var fragment_22 = root_30();
															var node_25 = $.first_child(fragment_22);

															Text(node_25, {
																bold: true,
																get color() {
																	return theme().getColors().info;
																},
																children: $.wrap_snippet(Demo_launcher, ($$anchor, $$slotProps) => {
																	$.next();

																	var text_12 = $.text('Features:');

																	$.append($$anchor, text_12);
																}),
																$$slots: { default: true }
															});

															var node_26 = $.sibling(node_25, 2);

															Text(node_26, {
																get color() {
																	return theme().getColors().foreground;
																},
																children: $.wrap_snippet(Demo_launcher, ($$anchor, $$slotProps) => {
																	$.next();

																	var text_13 = $.text('• Svelte 5 Runes ($state, $derived, $effect)');

																	$.append($$anchor, text_13);
																}),
																$$slots: { default: true }
															});

															var node_27 = $.sibling(node_26, 2);

															Text(node_27, {
																get color() {
																	return theme().getColors().foreground;
																},
																children: $.wrap_snippet(Demo_launcher, ($$anchor, $$slotProps) => {
																	$.next();

																	var text_14 = $.text('• Reactive Theme System');

																	$.append($$anchor, text_14);
																}),
																$$slots: { default: true }
															});

															var node_28 = $.sibling(node_27, 2);

															Text(node_28, {
																get color() {
																	return theme().getColors().foreground;
																},
																children: $.wrap_snippet(Demo_launcher, ($$anchor, $$slotProps) => {
																	$.next();

																	var text_15 = $.text('• Component Composition');

																	$.append($$anchor, text_15);
																}),
																$$slots: { default: true }
															});

															var node_29 = $.sibling(node_28, 2);

															Text(node_29, {
																get color() {
																	return theme().getColors().foreground;
																},
																children: $.wrap_snippet(Demo_launcher, ($$anchor, $$slotProps) => {
																	$.next();

																	var text_16 = $.text('• Terminal-optimized UI');

																	$.append($$anchor, text_16);
																}),
																$$slots: { default: true }
															});

															$.append($$anchor, fragment_22);
														}),
														$$slots: { default: true }
													});

													$.append($$anchor, fragment_19);
												}),
												$$slots: { default: true }
											});

											var node_30 = $.sibling(node_21, 2);

											Box(node_30, {
												border: true,
												padding: 1,
												get borderColor() {
													return theme().getColors().warning;
												},
												children: $.wrap_snippet(Demo_launcher, ($$anchor, $$slotProps) => {
													var fragment_23 = root_36();
													var node_31 = $.first_child(fragment_23);

													Text(node_31, {
														bold: true,
														get color() {
															return theme().getColors().warning;
														},
														children: $.wrap_snippet(Demo_launcher, ($$anchor, $$slotProps) => {
															$.next();

															var text_17 = $.text('🎮 Controls');

															$.append($$anchor, text_17);
														}),
														$$slots: { default: true }
													});

													var node_32 = $.sibling(node_31, 2);

													Box(node_32, {
														flexDirection: 'row',
														gap: 1,
														marginTop: 1,
														marginBottom: 2,
														children: $.wrap_snippet(Demo_launcher, ($$anchor, $$slotProps) => {
															var fragment_24 = root_38();
															var node_33 = $.first_child(fragment_24);

															Button(node_33, {
																onClick: prevDemo,
																get color() {
																	return theme().getColors().secondary;
																},
																border: true,
																width: 8,
																children: $.wrap_snippet(Demo_launcher, ($$anchor, $$slotProps) => {
																	$.next();

																	var text_18 = $.text('↑ Prev');

																	$.append($$anchor, text_18);
																}),
																$$slots: { default: true }
															});

															var node_34 = $.sibling(node_33, 2);

															Button(node_34, {
																onClick: nextDemo,
																get color() {
																	return theme().getColors().secondary;
																},
																border: true,
																width: 8,
																children: $.wrap_snippet(Demo_launcher, ($$anchor, $$slotProps) => {
																	$.next();

																	var text_19 = $.text('↓ Next');

																	$.append($$anchor, text_19);
																}),
																$$slots: { default: true }
															});

															$.append($$anchor, fragment_24);
														}),
														$$slots: { default: true }
													});

													var node_35 = $.sibling(node_32, 2);
													const expression_7 = $.derived(() => getColorForDemo(demos[$.get(selectedIndex)].color));

													Button(node_35, {
														onClick: launchSelected,
														get color() {
															return $.get(expression_7);
														},
														border: true,
														width: '100%',
														bold: true,
														children: $.wrap_snippet(Demo_launcher, ($$anchor, $$slotProps) => {
															$.next();

															var text_20 = $.text();

															$.template_effect(() => $.set_text(text_20, `🚀 Launch ${demos[$.get(selectedIndex)].name ?? ''}`));
															$.append($$anchor, text_20);
														}),
														$$slots: { default: true }
													});

													$.append($$anchor, fragment_23);
												}),
												$$slots: { default: true }
											});

											var node_36 = $.sibling(node_30, 2);

											Box(node_36, {
												border: true,
												padding: 1,
												get borderColor() {
													return theme().getColors().error;
												},
												children: $.wrap_snippet(Demo_launcher, ($$anchor, $$slotProps) => {
													var fragment_26 = root_42();
													var node_37 = $.first_child(fragment_26);

													Text(node_37, {
														bold: true,
														get color() {
															return theme().getColors().error;
														},
														children: $.wrap_snippet(Demo_launcher, ($$anchor, $$slotProps) => {
															$.next();

															var text_21 = $.text('⚡ Technology Stack');

															$.append($$anchor, text_21);
														}),
														$$slots: { default: true }
													});

													var node_38 = $.sibling(node_37, 2);

													Box(node_38, {
														marginTop: 1,
														children: $.wrap_snippet(Demo_launcher, ($$anchor, $$slotProps) => {
															var fragment_27 = root_44();
															var node_39 = $.first_child(fragment_27);

															Text(node_39, {
																get color() {
																	return theme().getColors().success;
																},
																children: $.wrap_snippet(Demo_launcher, ($$anchor, $$slotProps) => {
																	$.next();

																	var text_22 = $.text('✓ Svelte 5 (Client-side)');

																	$.append($$anchor, text_22);
																}),
																$$slots: { default: true }
															});

															var node_40 = $.sibling(node_39, 2);

															Text(node_40, {
																get color() {
																	return theme().getColors().success;
																},
																children: $.wrap_snippet(Demo_launcher, ($$anchor, $$slotProps) => {
																	$.next();

																	var text_23 = $.text('✓ Bun Runtime');

																	$.append($$anchor, text_23);
																}),
																$$slots: { default: true }
															});

															var node_41 = $.sibling(node_40, 2);

															Text(node_41, {
																get color() {
																	return theme().getColors().success;
																},
																children: $.wrap_snippet(Demo_launcher, ($$anchor, $$slotProps) => {
																	$.next();

																	var text_24 = $.text('✓ Terminal Virtual DOM');

																	$.append($$anchor, text_24);
																}),
																$$slots: { default: true }
															});

															var node_42 = $.sibling(node_41, 2);

															Text(node_42, {
																get color() {
																	return theme().getColors().success;
																},
																children: $.wrap_snippet(Demo_launcher, ($$anchor, $$slotProps) => {
																	$.next();

																	var text_25 = $.text('✓ Blessed Library');

																	$.append($$anchor, text_25);
																}),
																$$slots: { default: true }
															});

															var node_43 = $.sibling(node_42, 2);

															Text(node_43, {
																get color() {
																	return theme().getColors().success;
																},
																children: $.wrap_snippet(Demo_launcher, ($$anchor, $$slotProps) => {
																	$.next();

																	var text_26 = $.text('✓ Reactive Theming');

																	$.append($$anchor, text_26);
																}),
																$$slots: { default: true }
															});

															var node_44 = $.sibling(node_43, 2);

															Text(node_44, {
																get color() {
																	return theme().getColors().success;
																},
																children: $.wrap_snippet(Demo_launcher, ($$anchor, $$slotProps) => {
																	$.next();

																	var text_27 = $.text('✓ TypeScript');

																	$.append($$anchor, text_27);
																}),
																$$slots: { default: true }
															});

															$.append($$anchor, fragment_27);
														}),
														$$slots: { default: true }
													});

													$.append($$anchor, fragment_26);
												}),
												$$slots: { default: true }
											});

											$.append($$anchor, fragment_18);
										}),
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_9);
								}),
								$$slots: { default: true }
							});

							var node_45 = $.sibling(node_11, 2);

							Box(node_45, {
								border: true,
								padding: 1,
								marginTop: 2,
								get borderColor() {
									return theme().getColors().primary;
								},
								flexDirection: 'row',
								justifyContent: 'space-between',
								children: $.wrap_snippet(Demo_launcher, ($$anchor, $$slotProps) => {
									var fragment_28 = root_51();
									var node_46 = $.first_child(fragment_28);

									Text(node_46, {
										get color() {
											return theme().getColors().info;
										},
										children: $.wrap_snippet(Demo_launcher, ($$anchor, $$slotProps) => {
											$.next();

											var text_28 = $.text();

											$.template_effect(() => $.set_text(text_28, `🔧 Demo: ${$.get(selectedIndex) + 1}/${demos.length ?? ''}`));
											$.append($$anchor, text_28);
										}),
										$$slots: { default: true }
									});

									var node_47 = $.sibling(node_46, 2);

									Text(node_47, {
										get color() {
											return theme().getColors().success;
										},
										children: $.wrap_snippet(Demo_launcher, ($$anchor, $$slotProps) => {
											$.next();

											var text_29 = $.text('✨ All demos use live Svelte 5 reactivity!');

											$.append($$anchor, text_29);
										}),
										$$slots: { default: true }
									});

									var node_48 = $.sibling(node_47, 2);

									Text(node_48, {
										get color() {
											return theme().getColors().warning;
										},
										children: $.wrap_snippet(Demo_launcher, ($$anchor, $$slotProps) => {
											$.next();

											var text_30 = $.text();

											$.template_effect(($0) => $.set_text(text_30, `🎨 Theme: ${$0 ?? ''}`), [() => theme().getThemeInfo().name]);
											$.append($$anchor, text_30);
										}),
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_28);
								}),
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_6);
						}),
						$$slots: { default: true }
					});
				};

				$.if(
					$$anchor,
					($$render) => {
						if ($.get(showWelcome)) $$render(consequent_1);
					},
					$$elseif
				);
			}
		};

		$.if(node, ($$render) => {
			if ($.get(currentDemo)) $$render(consequent); else $$render(alternate, false);
		});
	}

	$.append($$anchor, fragment);
	return $.pop({ ...$.legacy_api() });
}