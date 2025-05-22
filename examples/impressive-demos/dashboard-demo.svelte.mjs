import 'svelte/internal/disclose-version';

Dashboard_demo[$.FILENAME] = 'examples/impressive-demos/dashboard-demo.svelte';

import * as $ from 'svelte/internal/client';
import { Box, Text, List, Input, Checkbox } from '../../src/components/ui';
import { getCurrentTheme } from '../../src/theme/currentTheme.svelte';

var root_2 = $.add_locations($.template(`<!> <!>`, 1), Dashboard_demo[$.FILENAME], []);
var root_9 = $.add_locations($.template(`<!> <!>`, 1), Dashboard_demo[$.FILENAME], []);
var root_12 = $.add_locations($.template(`<!> <!>`, 1), Dashboard_demo[$.FILENAME], []);
var root_15 = $.add_locations($.template(`<!> <!>`, 1), Dashboard_demo[$.FILENAME], []);
var root_19 = $.add_locations($.template(`Processes: <span> </span>`, 1), Dashboard_demo[$.FILENAME], [[125, 27]]);
var root_20 = $.add_locations($.template(`Network: <span> </span>`, 1), Dashboard_demo[$.FILENAME], [[126, 25]]);
var root_18 = $.add_locations($.template(`<!> <!>`, 1), Dashboard_demo[$.FILENAME], []);
var root_7 = $.add_locations($.template(`<!> <!> <!> <!> <!>`, 1), Dashboard_demo[$.FILENAME], []);
var root_23 = $.add_locations($.template(`<!> <!> <!>`, 1), Dashboard_demo[$.FILENAME], []);
var root_27 = $.add_locations($.template(`<!> <!>`, 1), Dashboard_demo[$.FILENAME], []);
var root_21 = $.add_locations($.template(`<!> <!> <!>`, 1), Dashboard_demo[$.FILENAME], []);
var root_6 = $.add_locations($.template(`<!> <!>`, 1), Dashboard_demo[$.FILENAME], []);
var root_30 = $.add_locations($.template(`<!> <!> <!>`, 1), Dashboard_demo[$.FILENAME], []);
var root_38 = $.add_locations($.template(`<!> <!>`, 1), Dashboard_demo[$.FILENAME], []);
var root_34 = $.add_locations($.template(`<!> <!> <!>`, 1), Dashboard_demo[$.FILENAME], []);
var root_29 = $.add_locations($.template(`<!> <!>`, 1), Dashboard_demo[$.FILENAME], []);
var root_5 = $.add_locations($.template(`<!> <!>`, 1), Dashboard_demo[$.FILENAME], []);
var root_42 = $.add_locations($.template(`<!> <!> <!>`, 1), Dashboard_demo[$.FILENAME], []);
var root_1 = $.add_locations($.template(`<!> <!> <!>`, 1), Dashboard_demo[$.FILENAME], []);

export default function Dashboard_demo($$anchor, $$props) {
	$.check_target(new.target);
	$.push($$props, true, Dashboard_demo);

	// Get reactive theme
	const theme = getCurrentTheme();
	// Reactive state
	let systemName = $.state('SvelTUI Terminal System');
	let cpuUsage = $.state(45);
	let memoryUsage = $.state(67);
	let diskUsage = 23;
	let networkActivity = $.state(true);
	let notifications = $.state(true);
	let darkMode = $.state(true);
	// System stats that update
	let uptime = $.state(0);
	let activeProcesses = 42;
	let networkSpeed = $.state(125.6);

	// Logs and activities
	let logEntries = $.state($.proxy([
		'System startup completed ✅',
		'Network interface initialized 🌐',
		'Memory check passed ✅',
		'SvelTUI renderer loaded 🚀',
		'Theme system activated 🎨'
	]));

	let todoItems = $.state($.proxy([
		{
			id: 1,
			text: 'Implement authentication',
			done: false
		},
		{ id: 2, text: 'Add file browser', done: true },
		{
			id: 3,
			text: 'Create settings panel',
			done: false
		},
		{
			id: 4,
			text: 'Write documentation',
			done: false
		}
	]));

	$.user_effect(() => {
		const interval = setInterval(
			() => {
				$.set(uptime, $.get(uptime) + 1);
				$.set(cpuUsage, Math.max(20, Math.min(90, $.get(cpuUsage) + (Math.random() - 0.5) * 10)), true);
				$.set(memoryUsage, Math.max(30, Math.min(95, $.get(memoryUsage) + (Math.random() - 0.5) * 5)), true);
				$.set(networkSpeed, Math.max(50, Math.min(200, $.get(networkSpeed) + (Math.random() - 0.5) * 20)), true);
			},
			2000
		);

		return () => clearInterval(interval);
	});

	// Functions
	function addLogEntry() {
		const newEntries = [
			'User action detected 👤',
			'Data synchronization complete 🔄',
			'Cache updated successfully ⚡',
			'Background task finished ✨',
			'Performance optimization applied 🚀'
		];

		const randomEntry = newEntries[Math.floor(Math.random() * newEntries.length)];

		$.set(
			logEntries,
			[
				randomEntry,
				...$.get(logEntries).slice(0, 4)
			],
			true
		);
	}

	function toggleTodo(id) {
		$.set(todoItems, $.get(todoItems).map((item) => $.strict_equals(item.id, id) ? { ...item, done: !item.done } : item), true);
	}

	function getProgressBar(value, max = 100, width = 20) {
		const filled = Math.round(value / max * width);
		const bar = ('█').repeat(filled) + ('░').repeat(width - filled);

		return `${bar} ${value}%`;
	}

	function getStatusColor(value) {
		if (value < 30) return theme().currentTheme.colors.success;
		if (value < 70) return theme().currentTheme.colors.warning;
		return theme().currentTheme.colors.error;
	}

	Box($$anchor, {
		width: '100%',
		height: '100%',
		padding: 1,
		children: $.wrap_snippet(Dashboard_demo, ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			Box(node, {
				border: true,
				padding: 1,
				marginBottom: 1,
				get borderColor() {
					return theme().currentTheme.colors.primary;
				},
				children: $.wrap_snippet(Dashboard_demo, ($$anchor, $$slotProps) => {
					var fragment_2 = root_2();
					var node_1 = $.first_child(fragment_2);

					Text(node_1, {
						bold: true,
						fontSize: 'large',
						get color() {
							return theme().currentTheme.colors.primary;
						},
						children: $.wrap_snippet(Dashboard_demo, ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text();

							$.template_effect(() => $.set_text(text, `🏠 ${$.get(systemName) ?? ''} Dashboard`));
							$.append($$anchor, text);
						}),
						$$slots: { default: true }
					});

					var node_2 = $.sibling(node_1, 2);

					Text(node_2, {
						get color() {
							return theme().currentTheme.colors.secondary;
						},
						children: $.wrap_snippet(Dashboard_demo, ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text();

							$.template_effect(($0) => $.set_text(text_1, `Powered by Svelte 5 + SvelTUI | Uptime: ${$0 ?? ''}m ${$.get(uptime) % 60}s`), [() => Math.floor($.get(uptime) / 60)]);
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
				flexDirection: 'row',
				gap: 2,
				height: '80%',
				children: $.wrap_snippet(Dashboard_demo, ($$anchor, $$slotProps) => {
					var fragment_5 = root_5();
					var node_4 = $.first_child(fragment_5);

					Box(node_4, {
						width: '50%',
						flexDirection: 'column',
						gap: 1,
						children: $.wrap_snippet(Dashboard_demo, ($$anchor, $$slotProps) => {
							var fragment_6 = root_6();
							var node_5 = $.first_child(fragment_6);

							Box(node_5, {
								border: true,
								padding: 1,
								get borderColor() {
									return theme().currentTheme.colors.info;
								},
								children: $.wrap_snippet(Dashboard_demo, ($$anchor, $$slotProps) => {
									var fragment_7 = root_7();
									var node_6 = $.first_child(fragment_7);

									Text(node_6, {
										bold: true,
										get color() {
											return theme().currentTheme.colors.info;
										},
										children: $.wrap_snippet(Dashboard_demo, ($$anchor, $$slotProps) => {
											$.next();

											var text_2 = $.text('📊 System Resources');

											$.append($$anchor, text_2);
										}),
										$$slots: { default: true }
									});

									var node_7 = $.sibling(node_6, 2);

									Box(node_7, {
										marginTop: 1,
										children: $.wrap_snippet(Dashboard_demo, ($$anchor, $$slotProps) => {
											var fragment_8 = root_9();
											var node_8 = $.first_child(fragment_8);

											Text(node_8, {
												children: $.wrap_snippet(Dashboard_demo, ($$anchor, $$slotProps) => {
													$.next();

													var text_3 = $.text('CPU Usage');

													$.append($$anchor, text_3);
												}),
												$$slots: { default: true }
											});

											var node_9 = $.sibling(node_8, 2);
											const expression = $.derived(() => getStatusColor($.get(cpuUsage)));

											Text(node_9, {
												get color() {
													return $.get(expression);
												},
												children: $.wrap_snippet(Dashboard_demo, ($$anchor, $$slotProps) => {
													$.next();

													var text_4 = $.text();

													$.template_effect(($0) => $.set_text(text_4, $0), [() => getProgressBar($.get(cpuUsage))]);
													$.append($$anchor, text_4);
												}),
												$$slots: { default: true }
											});

											$.append($$anchor, fragment_8);
										}),
										$$slots: { default: true }
									});

									var node_10 = $.sibling(node_7, 2);

									Box(node_10, {
										marginTop: 1,
										children: $.wrap_snippet(Dashboard_demo, ($$anchor, $$slotProps) => {
											var fragment_10 = root_12();
											var node_11 = $.first_child(fragment_10);

											Text(node_11, {
												children: $.wrap_snippet(Dashboard_demo, ($$anchor, $$slotProps) => {
													$.next();

													var text_5 = $.text('Memory Usage');

													$.append($$anchor, text_5);
												}),
												$$slots: { default: true }
											});

											var node_12 = $.sibling(node_11, 2);
											const expression_1 = $.derived(() => getStatusColor($.get(memoryUsage)));

											Text(node_12, {
												get color() {
													return $.get(expression_1);
												},
												children: $.wrap_snippet(Dashboard_demo, ($$anchor, $$slotProps) => {
													$.next();

													var text_6 = $.text();

													$.template_effect(($0) => $.set_text(text_6, $0), [
														() => getProgressBar($.get(memoryUsage))
													]);

													$.append($$anchor, text_6);
												}),
												$$slots: { default: true }
											});

											$.append($$anchor, fragment_10);
										}),
										$$slots: { default: true }
									});

									var node_13 = $.sibling(node_10, 2);

									Box(node_13, {
										marginTop: 1,
										children: $.wrap_snippet(Dashboard_demo, ($$anchor, $$slotProps) => {
											var fragment_12 = root_15();
											var node_14 = $.first_child(fragment_12);

											Text(node_14, {
												children: $.wrap_snippet(Dashboard_demo, ($$anchor, $$slotProps) => {
													$.next();

													var text_7 = $.text('Disk Usage');

													$.append($$anchor, text_7);
												}),
												$$slots: { default: true }
											});

											var node_15 = $.sibling(node_14, 2);
											const expression_2 = $.derived(() => getStatusColor(diskUsage));

											Text(node_15, {
												get color() {
													return $.get(expression_2);
												},
												children: $.wrap_snippet(Dashboard_demo, ($$anchor, $$slotProps) => {
													$.next();

													var text_8 = $.text();

													$.template_effect(($0) => $.set_text(text_8, $0), [() => getProgressBar(diskUsage)]);
													$.append($$anchor, text_8);
												}),
												$$slots: { default: true }
											});

											$.append($$anchor, fragment_12);
										}),
										$$slots: { default: true }
									});

									var node_16 = $.sibling(node_13, 2);

									Box(node_16, {
										marginTop: 1,
										flexDirection: 'row',
										gap: 4,
										children: $.wrap_snippet(Dashboard_demo, ($$anchor, $$slotProps) => {
											var fragment_14 = root_18();
											var node_17 = $.first_child(fragment_14);

											Text(node_17, {
												children: $.wrap_snippet(Dashboard_demo, ($$anchor, $$slotProps) => {
													$.next();

													var fragment_15 = root_19();
													var span = $.sibling($.first_child(fragment_15));
													var text_9 = $.child(span, true);

													text_9.nodeValue = '42';
													$.reset(span);
													$.template_effect(($0) => $.set_style(span, `color: ${$0 ?? ''}`), [() => theme().currentTheme.colors.success]);
													$.append($$anchor, fragment_15);
												}),
												$$slots: { default: true }
											});

											var node_18 = $.sibling(node_17, 2);

											Text(node_18, {
												children: $.wrap_snippet(Dashboard_demo, ($$anchor, $$slotProps) => {
													$.next();

													var fragment_16 = root_20();
													var span_1 = $.sibling($.first_child(fragment_16));
													var text_10 = $.child(span_1);

													$.reset(span_1);

													$.template_effect(
														($0, $1) => {
															$.set_style(span_1, `color: ${$0 ?? ''}`);
															$.set_text(text_10, `${$1 ?? ''} MB/s`);
														},
														[
															() => theme().currentTheme.colors.info,
															() => $.get(networkSpeed).toFixed(1)
														]
													);

													$.append($$anchor, fragment_16);
												}),
												$$slots: { default: true }
											});

											$.append($$anchor, fragment_14);
										}),
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_7);
								}),
								$$slots: { default: true }
							});

							var node_19 = $.sibling(node_5, 2);

							Box(node_19, {
								border: true,
								padding: 1,
								get borderColor() {
									return theme().currentTheme.colors.success;
								},
								children: $.wrap_snippet(Dashboard_demo, ($$anchor, $$slotProps) => {
									var fragment_17 = root_21();
									var node_20 = $.first_child(fragment_17);

									Text(node_20, {
										bold: true,
										get color() {
											return theme().currentTheme.colors.success;
										},
										children: $.wrap_snippet(Dashboard_demo, ($$anchor, $$slotProps) => {
											$.next();

											var text_11 = $.text('⚙️ Quick Actions');

											$.append($$anchor, text_11);
										}),
										$$slots: { default: true }
									});

									var node_21 = $.sibling(node_20, 2);

									Box(node_21, {
										marginTop: 1,
										flexDirection: 'column',
										gap: 1,
										children: $.wrap_snippet(Dashboard_demo, ($$anchor, $$slotProps) => {
											var fragment_18 = root_23();
											var node_22 = $.first_child(fragment_18);

											Checkbox(node_22, {
												get checked() {
													return $.get(networkActivity);
												},
												set checked($$value) {
													$.set(networkActivity, $$value, true);
												},
												children: $.wrap_snippet(Dashboard_demo, ($$anchor, $$slotProps) => {
													$.next();

													var text_12 = $.text('Network Activity Monitor');

													$.append($$anchor, text_12);
												}),
												$$slots: { default: true }
											});

											var node_23 = $.sibling(node_22, 2);

											Checkbox(node_23, {
												get checked() {
													return $.get(notifications);
												},
												set checked($$value) {
													$.set(notifications, $$value, true);
												},
												children: $.wrap_snippet(Dashboard_demo, ($$anchor, $$slotProps) => {
													$.next();

													var text_13 = $.text('System Notifications');

													$.append($$anchor, text_13);
												}),
												$$slots: { default: true }
											});

											var node_24 = $.sibling(node_23, 2);

											Checkbox(node_24, {
												get checked() {
													return $.get(darkMode);
												},
												set checked($$value) {
													$.set(darkMode, $$value, true);
												},
												children: $.wrap_snippet(Dashboard_demo, ($$anchor, $$slotProps) => {
													$.next();

													var text_14 = $.text('Dark Mode Interface');

													$.append($$anchor, text_14);
												}),
												$$slots: { default: true }
											});

											$.append($$anchor, fragment_18);
										}),
										$$slots: { default: true }
									});

									var node_25 = $.sibling(node_21, 2);

									Box(node_25, {
										marginTop: 1,
										children: $.wrap_snippet(Dashboard_demo, ($$anchor, $$slotProps) => {
											var fragment_19 = root_27();
											var node_26 = $.first_child(fragment_19);

											Text(node_26, {
												children: $.wrap_snippet(Dashboard_demo, ($$anchor, $$slotProps) => {
													$.next();

													var text_15 = $.text('System Name:');

													$.append($$anchor, text_15);
												}),
												$$slots: { default: true }
											});

											var node_27 = $.sibling(node_26, 2);

											Input(node_27, {
												width: '100%',
												get value() {
													return $.get(systemName);
												},
												set value($$value) {
													$.set(systemName, $$value, true);
												}
											});

											$.append($$anchor, fragment_19);
										}),
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_17);
								}),
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_6);
						}),
						$$slots: { default: true }
					});

					var node_28 = $.sibling(node_4, 2);

					Box(node_28, {
						width: '50%',
						flexDirection: 'column',
						gap: 1,
						children: $.wrap_snippet(Dashboard_demo, ($$anchor, $$slotProps) => {
							var fragment_20 = root_29();
							var node_29 = $.first_child(fragment_20);

							Box(node_29, {
								border: true,
								padding: 1,
								get borderColor() {
									return theme().currentTheme.colors.warning;
								},
								height: '50%',
								children: $.wrap_snippet(Dashboard_demo, ($$anchor, $$slotProps) => {
									var fragment_21 = root_30();
									var node_30 = $.first_child(fragment_21);

									Text(node_30, {
										bold: true,
										get color() {
											return theme().currentTheme.colors.warning;
										},
										children: $.wrap_snippet(Dashboard_demo, ($$anchor, $$slotProps) => {
											$.next();

											var text_16 = $.text('📝 Activity Log');

											$.append($$anchor, text_16);
										}),
										$$slots: { default: true }
									});

									var node_31 = $.sibling(node_30, 2);

									Box(node_31, {
										marginTop: 1,
										onClick: addLogEntry,
										style: 'cursor: pointer',
										children: $.wrap_snippet(Dashboard_demo, ($$anchor, $$slotProps) => {
											Text($$anchor, {
												get color() {
													return theme().currentTheme.colors.secondary;
												},
												children: $.wrap_snippet(Dashboard_demo, ($$anchor, $$slotProps) => {
													$.next();

													var text_17 = $.text('Click here to simulate activity →');

													$.append($$anchor, text_17);
												}),
												$$slots: { default: true }
											});
										}),
										$$slots: { default: true }
									});

									var node_32 = $.sibling(node_31, 2);

									const expression_3 = $.derived(() => ({
										border: {
											color: theme().currentTheme.colors.secondary
										}
									}));

									List(node_32, {
										get items() {
											return $.get(logEntries);
										},
										height: 8,
										scrollable: true,
										get style() {
											return $.get(expression_3);
										}
									});

									$.append($$anchor, fragment_21);
								}),
								$$slots: { default: true }
							});

							var node_33 = $.sibling(node_29, 2);

							Box(node_33, {
								border: true,
								padding: 1,
								get borderColor() {
									return theme().currentTheme.colors.error;
								},
								height: '50%',
								children: $.wrap_snippet(Dashboard_demo, ($$anchor, $$slotProps) => {
									var fragment_23 = root_34();
									var node_34 = $.first_child(fragment_23);

									Text(node_34, {
										bold: true,
										get color() {
											return theme().currentTheme.colors.error;
										},
										children: $.wrap_snippet(Dashboard_demo, ($$anchor, $$slotProps) => {
											$.next();

											var text_18 = $.text('✅ Task List');

											$.append($$anchor, text_18);
										}),
										$$slots: { default: true }
									});

									var node_35 = $.sibling(node_34, 2);

									Box(node_35, {
										marginTop: 1,
										children: $.wrap_snippet(Dashboard_demo, ($$anchor, $$slotProps) => {
											var fragment_24 = $.comment();
											var node_36 = $.first_child(fragment_24);

											$.validate_each_keys(() => $.get(todoItems), (item) => item.id);

											$.each(node_36, 17, () => $.get(todoItems), (item) => item.id, ($$anchor, item) => {
												Box($$anchor, {
													flexDirection: 'row',
													gap: 1,
													marginBottom: 0.5,
													children: $.wrap_snippet(Dashboard_demo, ($$anchor, $$slotProps) => {
														var fragment_26 = root_38();
														var node_37 = $.first_child(fragment_26);

														Checkbox(node_37, {
															get checked() {
																return $.get(item).done;
															},
															onChange: () => toggleTodo($.get(item).id)
														});

														var node_38 = $.sibling(node_37, 2);
														const expression_4 = $.derived(() => $.get(item).done ? theme().currentTheme.colors.success : theme().currentTheme.colors.foreground);
														const expression_5 = $.derived(() => $.get(item).done ? 'text-decoration: line-through' : '');

														Text(node_38, {
															get color() {
																return $.get(expression_4);
															},
															get style() {
																return $.get(expression_5);
															},
															children: $.wrap_snippet(Dashboard_demo, ($$anchor, $$slotProps) => {
																$.next();

																var text_19 = $.text();

																$.template_effect(() => $.set_text(text_19, $.get(item).text));
																$.append($$anchor, text_19);
															}),
															$$slots: { default: true }
														});

														$.append($$anchor, fragment_26);
													}),
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_24);
										}),
										$$slots: { default: true }
									});

									var node_39 = $.sibling(node_35, 2);

									Box(node_39, {
										marginTop: 1,
										children: $.wrap_snippet(Dashboard_demo, ($$anchor, $$slotProps) => {
											Text($$anchor, {
												fontSize: 'small',
												get color() {
													return theme().currentTheme.colors.secondary;
												},
												children: $.wrap_snippet(Dashboard_demo, ($$anchor, $$slotProps) => {
													$.next();

													var text_20 = $.text();

													$.template_effect(($0) => $.set_text(text_20, `Completed: ${$0 ?? ''}/${$.get(todoItems).length ?? ''}`), [
														() => $.get(todoItems).filter((item) => item.done).length
													]);

													$.append($$anchor, text_20);
												}),
												$$slots: { default: true }
											});
										}),
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_23);
								}),
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_20);
						}),
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_5);
				}),
				$$slots: { default: true }
			});

			var node_40 = $.sibling(node_3, 2);

			Box(node_40, {
				border: true,
				padding: 1,
				marginTop: 1,
				get borderColor() {
					return theme().currentTheme.colors.secondary;
				},
				flexDirection: 'row',
				justifyContent: 'space-between',
				children: $.wrap_snippet(Dashboard_demo, ($$anchor, $$slotProps) => {
					var fragment_30 = root_42();
					var node_41 = $.first_child(fragment_30);

					Text(node_41, {
						get color() {
							return theme().currentTheme.colors.success;
						},
						children: $.wrap_snippet(Dashboard_demo, ($$anchor, $$slotProps) => {
							$.next();

							var text_21 = $.text('🟢 System Status: Online');

							$.append($$anchor, text_21);
						}),
						$$slots: { default: true }
					});

					var node_42 = $.sibling(node_41, 2);

					Text(node_42, {
						get color() {
							return theme().currentTheme.colors.info;
						},
						children: $.wrap_snippet(Dashboard_demo, ($$anchor, $$slotProps) => {
							$.next();

							var text_22 = $.text();

							$.template_effect(($0) => $.set_text(text_22, `Theme: ${$0 ?? ''}`), [() => theme().currentTheme.info.name]);
							$.append($$anchor, text_22);
						}),
						$$slots: { default: true }
					});

					var node_43 = $.sibling(node_42, 2);

					Text(node_43, {
						get color() {
							return theme().currentTheme.colors.warning;
						},
						children: $.wrap_snippet(Dashboard_demo, ($$anchor, $$slotProps) => {
							$.next();

							var text_23 = $.text();

							$.template_effect(() => $.set_text(text_23, `🔄 Live Updates: ${$.get(networkActivity) ? 'ON' : 'OFF'}`));
							$.append($$anchor, text_23);
						}),
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_30);
				}),
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		}),
		$$slots: { default: true }
	});

	return $.pop({ ...$.legacy_api() });
}