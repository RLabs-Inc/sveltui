import 'svelte/internal/disclose-version';

Theme_showcase[$.FILENAME] = 'examples/impressive-demos/theme-showcase.svelte';

import * as $ from 'svelte/internal/client';
import { Box, Text, List, Button } from '../../src/components/ui';
import { getCurrentTheme } from '../../src/theme/currentTheme.svelte';

var root_2 = $.add_locations($.template(`<!> <!>`, 1), Theme_showcase[$.FILENAME], []);
var root_5 = $.add_locations($.template(`<!> <!> <!>`, 1), Theme_showcase[$.FILENAME], []);
var root_9 = $.add_locations($.template(`<!> <!> <!>`, 1), Theme_showcase[$.FILENAME], []);
var root_18 = $.add_locations($.template(`<!> <!> <!>`, 1), Theme_showcase[$.FILENAME], []);
var root_14 = $.add_locations($.template(`<!> <!> <!>`, 1), Theme_showcase[$.FILENAME], []);
var root_26 = $.add_locations($.template(`<!> <!> <!> <!> <!>`, 1), Theme_showcase[$.FILENAME], []);
var root_32 = $.add_locations($.template(`<!> <!> <!> <!>`, 1), Theme_showcase[$.FILENAME], []);
var root_37 = $.add_locations($.template(`<!> <!>`, 1), Theme_showcase[$.FILENAME], []);
var root_24 = $.add_locations($.template(`<!> <!> <!> <!>`, 1), Theme_showcase[$.FILENAME], []);
var root_44 = $.add_locations($.template(`<!> <!>`, 1), Theme_showcase[$.FILENAME], []);
var root_40 = $.add_locations($.template(`<!> <!>`, 1), Theme_showcase[$.FILENAME], []);
var root_13 = $.add_locations($.template(`<!> <!> <!>`, 1), Theme_showcase[$.FILENAME], []);
var root_47 = $.add_locations($.template(`<!> <!> <!>`, 1), Theme_showcase[$.FILENAME], []);
var root_1 = $.add_locations($.template(`<!> <!> <!> <!> <!> <!>`, 1), Theme_showcase[$.FILENAME], []);

export default function Theme_showcase($$anchor, $$props) {
	$.check_target(new.target);
	$.push($$props, true, Theme_showcase);

	// Get reactive theme
	const theme = getCurrentTheme();

	// Available themes for cycling
	const availableThemes = [
		'cyberpunk',
		'dark',
		'light',
		'ocean',
		'forest',
		'sunset',
		'terminal'
	];

	let currentThemeIndex = $.state(0);
	let autoSwitch = $.state(false);
	let switchInterval = $.state(null);
	// Demo components state
	let sampleText = 'SvelTUI Theme Showcase! 🎨';
	let progressValue = 75;
	let isEnabled = true;

	// Color preview data
	let colorPreview = $.derived(() => () => {
		return [
			{
				name: 'Primary',
				color: theme().currentTheme.colors.primary,
				icon: '🔵'
			},
			{
				name: 'Secondary',
				color: theme().currentTheme.colors.secondary,
				icon: '🟡'
			},
			{
				name: 'Success',
				color: theme().currentTheme.colors.success,
				icon: '🟢'
			},
			{
				name: 'Warning',
				color: theme().currentTheme.colors.warning,
				icon: '🟠'
			},
			{
				name: 'Error',
				color: theme().currentTheme.colors.error,
				icon: '🔴'
			},
			{
				name: 'Info',
				color: theme().currentTheme.colors.info,
				icon: '🔷'
			}
		];
	});

	$.user_effect(() => {
		if ($.get(autoSwitch)) {
			$.set(
				switchInterval,
				setInterval(
					() => {
						nextTheme();
					},
					3000
				),
				true
			);
		} else if ($.get(switchInterval)) {
			clearInterval($.get(switchInterval));
			$.set(switchInterval, null);
		}

		return () => {
			if ($.get(switchInterval)) clearInterval($.get(switchInterval));
		};
	});

	// Theme switching functions
	function nextTheme() {
		$.set(currentThemeIndex, ($.get(currentThemeIndex) + 1) % availableThemes.length);

		const themeName = availableThemes[$.get(currentThemeIndex)];

		theme().setTheme(themeName);
	}

	function prevTheme() {
		$.set(currentThemeIndex, $.strict_equals($.get(currentThemeIndex), 0) ? availableThemes.length - 1 : $.get(currentThemeIndex) - 1, true);

		const themeName = availableThemes[$.get(currentThemeIndex)];

		theme().setTheme(themeName);
	}

	function toggleAutoSwitch() {
		$.set(autoSwitch, !$.get(autoSwitch));
	}

	function getProgressBar(value, char = '█') {
		const width = 30;
		const filled = Math.round(value / 100 * width);

		return char.repeat(filled) + ('░').repeat(width - filled);
	}

	Box($$anchor, {
		width: '100%',
		height: '100%',
		padding: 2,
		children: $.wrap_snippet(Theme_showcase, ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			Box(node, {
				border: true,
				padding: 2,
				marginBottom: 2,
				get borderColor() {
					return theme().currentTheme.colors.primary;
				},
				children: $.wrap_snippet(Theme_showcase, ($$anchor, $$slotProps) => {
					var fragment_2 = root_2();
					var node_1 = $.first_child(fragment_2);

					Text(node_1, {
						bold: true,
						fontSize: 'xl',
						get color() {
							return theme().currentTheme.colors.primary;
						},
						align: 'center',
						children: $.wrap_snippet(Theme_showcase, ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('🎨 SvelTUI Theme Showcase');

							$.append($$anchor, text);
						}),
						$$slots: { default: true }
					});

					var node_2 = $.sibling(node_1, 2);

					Text(node_2, {
						get color() {
							return theme().getColors().secondary;
						},
						align: 'center',
						children: $.wrap_snippet(Theme_showcase, ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Dynamic theming with Svelte 5 reactivity');

							$.append($$anchor, text_1);
						}),
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				}),
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node, 2);

			Box(node_3, {
				border: true,
				padding: 1,
				marginBottom: 2,
				get borderColor() {
					return theme().currentTheme.colors.secondary;
				},
				get backgroundColor() {
					return theme().currentTheme.colors.background;
				},
				children: $.wrap_snippet(Theme_showcase, ($$anchor, $$slotProps) => {
					var fragment_3 = root_5();
					var node_4 = $.first_child(fragment_3);

					Text(node_4, {
						bold: true,
						get color() {
							return theme().currentTheme.colors.info;
						},
						children: $.wrap_snippet(Theme_showcase, ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text();

							$.template_effect(($0) => $.set_text(text_2, `🎯 Current Theme: ${$0 ?? ''}`), [() => theme().currentTheme.info.name]);
							$.append($$anchor, text_2);
						}),
						$$slots: { default: true }
					});

					var node_5 = $.sibling(node_4, 2);

					Text(node_5, {
						get color() {
							return theme().currentTheme.colors.foreground;
						},
						children: $.wrap_snippet(Theme_showcase, ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text();

							$.template_effect(($0) => $.set_text(text_3, $0), [
								() => theme().currentTheme.info.description
							]);

							$.append($$anchor, text_3);
						}),
						$$slots: { default: true }
					});

					var node_6 = $.sibling(node_5, 2);

					Text(node_6, {
						fontSize: 'small',
						get color() {
							return theme().currentTheme.colors.secondary;
						},
						children: $.wrap_snippet(Theme_showcase, ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text();

							$.template_effect(($0, $1) => $.set_text(text_4, `By ${$0 ?? ''} • v${$1 ?? ''}`), [
								() => theme().currentTheme.info.author,
								() => theme().currentTheme.info.version
							]);

							$.append($$anchor, text_4);
						}),
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_3);
				}),
				$$slots: { default: true }
			});

			var node_7 = $.sibling(node_3, 2);

			Box(node_7, {
				flexDirection: 'row',
				gap: 2,
				marginBottom: 2,
				justifyContent: 'center',
				children: $.wrap_snippet(Theme_showcase, ($$anchor, $$slotProps) => {
					var fragment_7 = root_9();
					var node_8 = $.first_child(fragment_7);

					Button(node_8, {
						onClick: prevTheme,
						get color() {
							return theme().currentTheme.colors.info;
						},
						border: true,
						width: 12,
						children: $.wrap_snippet(Theme_showcase, ($$anchor, $$slotProps) => {
							$.next();

							var text_5 = $.text('← Previous');

							$.append($$anchor, text_5);
						}),
						$$slots: { default: true }
					});

					var node_9 = $.sibling(node_8, 2);
					const expression = $.derived(() => $.get(autoSwitch) ? theme().currentTheme.colors.error : theme().currentTheme.colors.success);

					Button(node_9, {
						onClick: toggleAutoSwitch,
						get color() {
							return $.get(expression);
						},
						border: true,
						width: 16,
						children: $.wrap_snippet(Theme_showcase, ($$anchor, $$slotProps) => {
							$.next();

							var text_6 = $.text();

							$.template_effect(() => $.set_text(text_6, $.get(autoSwitch) ? '⏹️ Stop Auto' : '▶️ Auto Switch'));
							$.append($$anchor, text_6);
						}),
						$$slots: { default: true }
					});

					var node_10 = $.sibling(node_9, 2);

					Button(node_10, {
						onClick: nextTheme,
						get color() {
							return theme().currentTheme.colors.info;
						},
						border: true,
						width: 12,
						children: $.wrap_snippet(Theme_showcase, ($$anchor, $$slotProps) => {
							$.next();

							var text_7 = $.text('Next →');

							$.append($$anchor, text_7);
						}),
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_7);
				}),
				$$slots: { default: true }
			});

			var node_11 = $.sibling(node_7, 2);

			Box(node_11, {
				flexDirection: 'row',
				gap: 2,
				height: '60%',
				children: $.wrap_snippet(Theme_showcase, ($$anchor, $$slotProps) => {
					var fragment_9 = root_13();
					var node_12 = $.first_child(fragment_9);

					Box(node_12, {
						width: '30%',
						border: true,
						padding: 1,
						get borderColor() {
							return theme().currentTheme.colors.warning;
						},
						children: $.wrap_snippet(Theme_showcase, ($$anchor, $$slotProps) => {
							var fragment_10 = root_14();
							var node_13 = $.first_child(fragment_10);

							Text(node_13, {
								bold: true,
								get color() {
									return theme().currentTheme.colors.warning;
								},
								children: $.wrap_snippet(Theme_showcase, ($$anchor, $$slotProps) => {
									$.next();

									var text_8 = $.text('🎨 Color Palette');

									$.append($$anchor, text_8);
								}),
								$$slots: { default: true }
							});

							var node_14 = $.sibling(node_13, 2);

							Box(node_14, {
								marginTop: 1,
								children: $.wrap_snippet(Theme_showcase, ($$anchor, $$slotProps) => {
									var fragment_11 = $.comment();
									var node_15 = $.first_child(fragment_11);

									$.each(node_15, 17, () => $.get(colorPreview), $.index, ($$anchor, colorInfo) => {
										Box($$anchor, {
											flexDirection: 'row',
											gap: 1,
											marginBottom: 0.5,
											children: $.wrap_snippet(Theme_showcase, ($$anchor, $$slotProps) => {
												var fragment_13 = root_18();
												var node_16 = $.first_child(fragment_13);

												Text(node_16, {
													get color() {
														return $.get(colorInfo).color;
													},
													children: $.wrap_snippet(Theme_showcase, ($$anchor, $$slotProps) => {
														$.next();

														var text_9 = $.text();

														$.template_effect(() => $.set_text(text_9, $.get(colorInfo).icon));
														$.append($$anchor, text_9);
													}),
													$$slots: { default: true }
												});

												var node_17 = $.sibling(node_16, 2);

												Text(node_17, {
													get color() {
														return theme().currentTheme.colors.foreground;
													},
													children: $.wrap_snippet(Theme_showcase, ($$anchor, $$slotProps) => {
														$.next();

														var text_10 = $.text();

														$.template_effect(() => $.set_text(text_10, $.get(colorInfo).name));
														$.append($$anchor, text_10);
													}),
													$$slots: { default: true }
												});

												var node_18 = $.sibling(node_17, 2);

												Text(node_18, {
													fontSize: 'small',
													get color() {
														return theme().currentTheme.colors.secondary;
													},
													children: $.wrap_snippet(Theme_showcase, ($$anchor, $$slotProps) => {
														$.next();

														var text_11 = $.text();

														$.template_effect(() => $.set_text(text_11, $.get(colorInfo).color));
														$.append($$anchor, text_11);
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

							var node_19 = $.sibling(node_14, 2);

							Box(node_19, {
								marginTop: 2,
								border: true,
								padding: 1,
								get borderColor() {
									return theme().currentTheme.colors.primary;
								},
								children: $.wrap_snippet(Theme_showcase, ($$anchor, $$slotProps) => {
									Text($$anchor, {
										get color() {
											return theme().currentTheme.colors.primary;
										},
										children: $.wrap_snippet(Theme_showcase, ($$anchor, $$slotProps) => {
											$.next();

											var text_12 = $.text('Sample Border');

											$.append($$anchor, text_12);
										}),
										$$slots: { default: true }
									});
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
						border: true,
						padding: 1,
						get borderColor() {
							return theme().currentTheme.colors.success;
						},
						children: $.wrap_snippet(Theme_showcase, ($$anchor, $$slotProps) => {
							var fragment_18 = root_24();
							var node_21 = $.first_child(fragment_18);

							Text(node_21, {
								bold: true,
								get color() {
									return theme().currentTheme.colors.success;
								},
								children: $.wrap_snippet(Theme_showcase, ($$anchor, $$slotProps) => {
									$.next();

									var text_13 = $.text('🧩 Component Preview');

									$.append($$anchor, text_13);
								}),
								$$slots: { default: true }
							});

							var node_22 = $.sibling(node_21, 2);

							Box(node_22, {
								marginTop: 1,
								marginBottom: 2,
								children: $.wrap_snippet(Theme_showcase, ($$anchor, $$slotProps) => {
									var fragment_19 = root_26();
									var node_23 = $.first_child(fragment_19);

									Text(node_23, {
										bold: true,
										get color() {
											return theme().currentTheme.colors.primary;
										},
										children: $.wrap_snippet(Theme_showcase, ($$anchor, $$slotProps) => {
											$.next();

											var text_14 = $.text('Primary Text');

											$.append($$anchor, text_14);
										}),
										$$slots: { default: true }
									});

									var node_24 = $.sibling(node_23, 2);

									Text(node_24, {
										get color() {
											return theme().currentTheme.colors.secondary;
										},
										children: $.wrap_snippet(Theme_showcase, ($$anchor, $$slotProps) => {
											$.next();

											var text_15 = $.text('Secondary Text');

											$.append($$anchor, text_15);
										}),
										$$slots: { default: true }
									});

									var node_25 = $.sibling(node_24, 2);

									Text(node_25, {
										get color() {
											return theme().currentTheme.colors.success;
										},
										children: $.wrap_snippet(Theme_showcase, ($$anchor, $$slotProps) => {
											$.next();

											var text_16 = $.text('Success Message ✅');

											$.append($$anchor, text_16);
										}),
										$$slots: { default: true }
									});

									var node_26 = $.sibling(node_25, 2);

									Text(node_26, {
										get color() {
											return theme().currentTheme.colors.warning;
										},
										children: $.wrap_snippet(Theme_showcase, ($$anchor, $$slotProps) => {
											$.next();

											var text_17 = $.text('Warning Alert ⚠️');

											$.append($$anchor, text_17);
										}),
										$$slots: { default: true }
									});

									var node_27 = $.sibling(node_26, 2);

									Text(node_27, {
										get color() {
											return theme().currentTheme.colors.error;
										},
										children: $.wrap_snippet(Theme_showcase, ($$anchor, $$slotProps) => {
											$.next();

											var text_18 = $.text('Error Message ❌');

											$.append($$anchor, text_18);
										}),
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_19);
								}),
								$$slots: { default: true }
							});

							var node_28 = $.sibling(node_22, 2);

							Box(node_28, {
								marginBottom: 2,
								children: $.wrap_snippet(Theme_showcase, ($$anchor, $$slotProps) => {
									var fragment_20 = root_32();
									var node_29 = $.first_child(fragment_20);

									Text(node_29, {
										get color() {
											return theme().currentTheme.colors.info;
										},
										children: $.wrap_snippet(Theme_showcase, ($$anchor, $$slotProps) => {
											$.next();

											var text_19 = $.text('Progress Indicators:');

											$.append($$anchor, text_19);
										}),
										$$slots: { default: true }
									});

									var node_30 = $.sibling(node_29, 2);

									Text(node_30, {
										get color() {
											return theme().currentTheme.colors.success;
										},
										children: $.wrap_snippet(Theme_showcase, ($$anchor, $$slotProps) => {
											$.next();

											var text_20 = $.text();

											$.template_effect(($0) => $.set_text(text_20, `${$0 ?? ''} 75%`), [() => getProgressBar(progressValue)]);
											$.append($$anchor, text_20);
										}),
										$$slots: { default: true }
									});

									var node_31 = $.sibling(node_30, 2);

									Text(node_31, {
										get color() {
											return theme().currentTheme.colors.warning;
										},
										children: $.wrap_snippet(Theme_showcase, ($$anchor, $$slotProps) => {
											$.next();

											var text_21 = $.text();

											$.template_effect(($0) => $.set_text(text_21, `${$0 ?? ''} 45%`), [() => getProgressBar(45, '▓')]);
											$.append($$anchor, text_21);
										}),
										$$slots: { default: true }
									});

									var node_32 = $.sibling(node_31, 2);

									Text(node_32, {
										get color() {
											return theme().currentTheme.colors.error;
										},
										children: $.wrap_snippet(Theme_showcase, ($$anchor, $$slotProps) => {
											$.next();

											var text_22 = $.text();

											$.template_effect(($0) => $.set_text(text_22, `${$0 ?? ''} 25%`), [() => getProgressBar(25, '▄')]);
											$.append($$anchor, text_22);
										}),
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_20);
								}),
								$$slots: { default: true }
							});

							var node_33 = $.sibling(node_28, 2);

							Box(node_33, {
								border: true,
								padding: 1,
								get borderColor() {
									return theme().currentTheme.colors.info;
								},
								children: $.wrap_snippet(Theme_showcase, ($$anchor, $$slotProps) => {
									var fragment_24 = root_37();
									var node_34 = $.first_child(fragment_24);

									Text(node_34, {
										get color() {
											return theme().currentTheme.colors.info;
										},
										children: $.wrap_snippet(Theme_showcase, ($$anchor, $$slotProps) => {
											$.next();

											var text_23 = $.text('Interactive Elements:');

											$.append($$anchor, text_23);
										}),
										$$slots: { default: true }
									});

									var node_35 = $.sibling(node_34, 2);
									const expression_1 = $.derived(() => isEnabled ? theme().currentTheme.colors.success : theme().currentTheme.colors.secondary);

									Text(node_35, {
										get color() {
											return $.get(expression_1);
										},
										children: $.wrap_snippet(Theme_showcase, ($$anchor, $$slotProps) => {
											$.next();

											var text_24 = $.text();

											text_24.nodeValue = '● Status: Enabled';
											$.append($$anchor, text_24);
										}),
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_24);
								}),
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_18);
						}),
						$$slots: { default: true }
					});

					var node_36 = $.sibling(node_20, 2);

					Box(node_36, {
						width: '30%',
						border: true,
						padding: 1,
						get borderColor() {
							return theme().currentTheme.colors.error;
						},
						children: $.wrap_snippet(Theme_showcase, ($$anchor, $$slotProps) => {
							var fragment_26 = root_40();
							var node_37 = $.first_child(fragment_26);

							Text(node_37, {
								bold: true,
								get color() {
									return theme().currentTheme.colors.error;
								},
								children: $.wrap_snippet(Theme_showcase, ($$anchor, $$slotProps) => {
									$.next();

									var text_25 = $.text('📋 Available Themes');

									$.append($$anchor, text_25);
								}),
								$$slots: { default: true }
							});

							var node_38 = $.sibling(node_37, 2);

							Box(node_38, {
								marginTop: 1,
								children: $.wrap_snippet(Theme_showcase, ($$anchor, $$slotProps) => {
									var fragment_27 = $.comment();
									var node_39 = $.first_child(fragment_27);

									$.each(node_39, 17, () => availableThemes, $.index, ($$anchor, themeName, index) => {
										const expression_2 = $.derived(() => $.strict_equals(index, $.get(currentThemeIndex)) ? theme().getColors().primary : 'transparent');

										Box($$anchor, {
											flexDirection: 'row',
											gap: 1,
											marginBottom: 0.5,
											padding: 0.5,
											get backgroundColor() {
												return $.get(expression_2);
											},
											children: $.wrap_snippet(Theme_showcase, ($$anchor, $$slotProps) => {
												var fragment_29 = root_44();
												var node_40 = $.first_child(fragment_29);
												const expression_3 = $.derived(() => $.strict_equals(index, $.get(currentThemeIndex)) ? theme().currentTheme.colors.background : theme().currentTheme.colors.foreground);

												Text(node_40, {
													get color() {
														return $.get(expression_3);
													},
													children: $.wrap_snippet(Theme_showcase, ($$anchor, $$slotProps) => {
														$.next();

														var text_26 = $.text();

														$.template_effect(() => $.set_text(text_26, $.strict_equals(index, $.get(currentThemeIndex)) ? '▶️' : '  '));
														$.append($$anchor, text_26);
													}),
													$$slots: { default: true }
												});

												var node_41 = $.sibling(node_40, 2);
												const expression_4 = $.derived(() => $.strict_equals(index, $.get(currentThemeIndex)) ? theme().currentTheme.colors.background : theme().currentTheme.colors.foreground);
												const expression_5 = $.derived(() => $.strict_equals(index, $.get(currentThemeIndex)));

												Text(node_41, {
													get color() {
														return $.get(expression_4);
													},
													get bold() {
														return $.get(expression_5);
													},
													children: $.wrap_snippet(Theme_showcase, ($$anchor, $$slotProps) => {
														$.next();

														var text_27 = $.text();

														$.template_effect(($0) => $.set_text(text_27, $0), [
															() => $.get(themeName).charAt(0).toUpperCase() + $.get(themeName).slice(1)
														]);

														$.append($$anchor, text_27);
													}),
													$$slots: { default: true }
												});

												$.append($$anchor, fragment_29);
											}),
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_27);
								}),
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_26);
						}),
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_9);
				}),
				$$slots: { default: true }
			});

			var node_42 = $.sibling(node_11, 2);

			Box(node_42, {
				border: true,
				padding: 1,
				marginTop: 2,
				get borderColor() {
					return theme().currentTheme.colors.secondary;
				},
				flexDirection: 'row',
				justifyContent: 'space-between',
				children: $.wrap_snippet(Theme_showcase, ($$anchor, $$slotProps) => {
					var fragment_32 = root_47();
					var node_43 = $.first_child(fragment_32);

					Text(node_43, {
						get color() {
							return theme().currentTheme.colors.info;
						},
						children: $.wrap_snippet(Theme_showcase, ($$anchor, $$slotProps) => {
							$.next();

							var text_28 = $.text();

							$.template_effect(() => $.set_text(text_28, `🔄 Theme: ${$.get(currentThemeIndex) + 1}/${availableThemes.length ?? ''}`));
							$.append($$anchor, text_28);
						}),
						$$slots: { default: true }
					});

					var node_44 = $.sibling(node_43, 2);

					Text(node_44, {
						get color() {
							return theme().currentTheme.colors.success;
						},
						children: $.wrap_snippet(Theme_showcase, ($$anchor, $$slotProps) => {
							$.next();

							var text_29 = $.text('✨ Svelte 5 Reactivity Working!');

							$.append($$anchor, text_29);
						}),
						$$slots: { default: true }
					});

					var node_45 = $.sibling(node_44, 2);

					Text(node_45, {
						get color() {
							return theme().currentTheme.colors.warning;
						},
						children: $.wrap_snippet(Theme_showcase, ($$anchor, $$slotProps) => {
							$.next();

							var text_30 = $.text('🚀 Powered by SvelTUI');

							$.append($$anchor, text_30);
						}),
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_32);
				}),
				$$slots: { default: true }
			});

			var node_46 = $.sibling(node_42, 2);

			{
				var consequent = ($$anchor) => {
					Box($$anchor, {
						marginTop: 1,
						align: 'center',
						children: $.wrap_snippet(Theme_showcase, ($$anchor, $$slotProps) => {
							Text($$anchor, {
								get color() {
									return theme().currentTheme.colors.primary;
								},
								bold: true,
								children: $.wrap_snippet(Theme_showcase, ($$anchor, $$slotProps) => {
									$.next();

									var text_31 = $.text('🔄 Live Theme Switching Active - Themes change every 3 seconds!');

									$.append($$anchor, text_31);
								}),
								$$slots: { default: true }
							});
						}),
						$$slots: { default: true }
					});
				};

				$.if(node_46, ($$render) => {
					if ($.get(autoSwitch)) $$render(consequent);
				});
			}

			$.append($$anchor, fragment_1);
		}),
		$$slots: { default: true }
	});

	return $.pop({ ...$.legacy_api() });
}