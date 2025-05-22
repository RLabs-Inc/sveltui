import 'svelte/internal/disclose-version';

Counter_demo[$.FILENAME] = 'examples/impressive-demos/counter-demo.svelte';

import * as $ from 'svelte/internal/client';
import { Box, Text, Input, Button } from '../../src/components/ui';
import { getCurrentTheme } from '../../src/theme/currentTheme.svelte';

var root_5 = $.add_locations($.template(`<!> <!>`, 1), Counter_demo[$.FILENAME], []);
var root_9 = $.add_locations($.template(`<!> <!> <!>`, 1), Counter_demo[$.FILENAME], []);
var root_14 = $.add_locations($.template(`<!> <!>`, 1), Counter_demo[$.FILENAME], []);
var root_13 = $.add_locations($.template(`<!> <!>`, 1), Counter_demo[$.FILENAME], []);
var root_17 = $.add_locations($.template(`<!> <!> <!> <!> <!>`, 1), Counter_demo[$.FILENAME], []);
var root_1 = $.add_locations($.template(`<!> <!> <!> <!> <!> <!> <!>`, 1), Counter_demo[$.FILENAME], []);

export default function Counter_demo($$anchor, $$props) {
	$.check_target(new.target);
	$.push($$props, true, Counter_demo);

	// Get reactive theme
	const theme = getCurrentTheme();
	// Reactive state with Svelte 5 runes
	let count = $.state(0);
	let stepSize = $.state(1);
	let autoIncrement = $.state(false);
	let autoInterval = $.state(null);
	let message = $.state('Welcome to SvelTUI! 🚀');
	// Reactive derived values
	let countColor = $.derived(() => $.get(count) > 10 ? theme().currentTheme.colors.success : $.get(count) < 0 ? theme().currentTheme.colors.error : theme().currentTheme.colors.primary);
	let countDisplay = $.derived(() => `${$.get(count)}`);
	let progressBar = $.derived(() => ('█').repeat(Math.max(0, Math.min(20, $.get(count)))));

	$.user_effect(() => {
		if ($.get(autoIncrement)) {
			$.set(
				autoInterval,
				setInterval(
					() => {
						$.set(count, $.get(count) + $.get(stepSize));

						if ($.get(count) >= 50) {
							$.set(autoIncrement, false);
							$.set(message, '🎉 Auto-increment completed!');
						}
					},
					100
				),
				true
			);
		} else if ($.get(autoInterval)) {
			clearInterval($.get(autoInterval));
			$.set(autoInterval, null);
		}

		return () => {
			if ($.get(autoInterval)) clearInterval($.get(autoInterval));
		};
	});

	// Functions
	function increment() {
		$.set(count, $.get(count) + $.get(stepSize));
		$.set(message, $.strict_equals($.get(count) % 10, 0) ? `Milestone: ${$.get(count)}! 🎊` : `Count: ${$.get(count)}`, true);
	}

	function decrement() {
		$.set(count, $.get(count) - $.get(stepSize));
		$.set(message, $.strict_equals($.get(count), 0) ? 'Back to zero! 🏁' : `Count: ${$.get(count)}`, true);
	}

	function reset() {
		$.set(count, 0);
		$.set(autoIncrement, false);
		$.set(message, 'Counter reset! ✨');
	}

	function toggleAuto() {
		$.set(autoIncrement, !$.get(autoIncrement));
		$.set(message, $.get(autoIncrement) ? 'Auto-increment started! 🚀' : 'Auto-increment stopped', true);
	}

	Box($$anchor, {
		border: true,
		width: '100%',
		height: '100%',
		padding: 2,
		children: $.wrap_snippet(Counter_demo, ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			Text(node, {
				bold: true,
				fontSize: 'large',
				get color() {
					return theme().currentTheme.colors.primary;
				},
				children: $.wrap_snippet(Counter_demo, ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('🚀 SvelTUI Counter Demo - Svelte 5 in Terminal!');

					$.append($$anchor, text);
				}),
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			Box(node_1, {
				marginTop: 1,
				marginBottom: 1,
				children: $.wrap_snippet(Counter_demo, ($$anchor, $$slotProps) => {
					Text($$anchor, {
						get color() {
							return theme().currentTheme.colors.secondary;
						},
						children: $.wrap_snippet(Counter_demo, ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text();

							$.template_effect(() => $.set_text(text_1, $.get(message)));
							$.append($$anchor, text_1);
						}),
						$$slots: { default: true }
					});
				}),
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			Box(node_2, {
				border: true,
				padding: 1,
				marginBottom: 2,
				get borderColor() {
					return $.get(countColor);
				},
				children: $.wrap_snippet(Counter_demo, ($$anchor, $$slotProps) => {
					var fragment_4 = root_5();
					var node_3 = $.first_child(fragment_4);

					Text(node_3, {
						align: 'center',
						bold: true,
						fontSize: 'xl',
						get color() {
							return $.get(countColor);
						},
						children: $.wrap_snippet(Counter_demo, ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text();

							$.template_effect(() => $.set_text(text_2, `Count: ${$.get(countDisplay) ?? ''}`));
							$.append($$anchor, text_2);
						}),
						$$slots: { default: true }
					});

					var node_4 = $.sibling(node_3, 2);

					Box(node_4, {
						marginTop: 1,
						children: $.wrap_snippet(Counter_demo, ($$anchor, $$slotProps) => {
							Text($$anchor, {
								get color() {
									return theme().currentTheme.colors.success;
								},
								children: $.wrap_snippet(Counter_demo, ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text();

									$.template_effect(() => $.set_text(text_3, `Progress: ${$.get(progressBar) ?? ''}`));
									$.append($$anchor, text_3);
								}),
								$$slots: { default: true }
							});
						}),
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_4);
				}),
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_2, 2);

			Box(node_5, {
				flexDirection: 'row',
				gap: 2,
				marginBottom: 1,
				children: $.wrap_snippet(Counter_demo, ($$anchor, $$slotProps) => {
					var fragment_8 = root_9();
					var node_6 = $.first_child(fragment_8);

					Button(node_6, {
						onClick: decrement,
						get color() {
							return theme().getColors().error;
						},
						border: true,
						width: 12,
						children: $.wrap_snippet(Counter_demo, ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text();

							$.template_effect(() => $.set_text(text_4, `➖ (-${$.get(stepSize) ?? ''})`));
							$.append($$anchor, text_4);
						}),
						$$slots: { default: true }
					});

					var node_7 = $.sibling(node_6, 2);

					Button(node_7, {
						onClick: increment,
						get color() {
							return theme().currentTheme.colors.success;
						},
						border: true,
						width: 12,
						children: $.wrap_snippet(Counter_demo, ($$anchor, $$slotProps) => {
							$.next();

							var text_5 = $.text();

							$.template_effect(() => $.set_text(text_5, `➕ (+${$.get(stepSize) ?? ''})`));
							$.append($$anchor, text_5);
						}),
						$$slots: { default: true }
					});

					var node_8 = $.sibling(node_7, 2);

					Button(node_8, {
						onClick: reset,
						get color() {
							return theme().currentTheme.colors.warning;
						},
						border: true,
						width: 10,
						children: $.wrap_snippet(Counter_demo, ($$anchor, $$slotProps) => {
							$.next();

							var text_6 = $.text('🔄 Reset');

							$.append($$anchor, text_6);
						}),
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_8);
				}),
				$$slots: { default: true }
			});

			var node_9 = $.sibling(node_5, 2);

			Box(node_9, {
				flexDirection: 'row',
				gap: 2,
				marginBottom: 2,
				children: $.wrap_snippet(Counter_demo, ($$anchor, $$slotProps) => {
					var fragment_11 = root_13();
					var node_10 = $.first_child(fragment_11);

					Box(node_10, {
						children: $.wrap_snippet(Counter_demo, ($$anchor, $$slotProps) => {
							var fragment_12 = root_14();
							var node_11 = $.first_child(fragment_12);

							Text(node_11, {
								children: $.wrap_snippet(Counter_demo, ($$anchor, $$slotProps) => {
									$.next();

									var text_7 = $.text('Step Size:');

									$.append($$anchor, text_7);
								}),
								$$slots: { default: true }
							});

							var node_12 = $.sibling(node_11, 2);

							Input(node_12, {
								width: 8,
								type: 'number',
								min: 1,
								max: 10,
								get value() {
									return $.get(stepSize);
								},
								set value($$value) {
									$.set(stepSize, $$value, true);
								}
							});

							$.append($$anchor, fragment_12);
						}),
						$$slots: { default: true }
					});

					var node_13 = $.sibling(node_10, 2);
					const expression = $.derived(() => $.get(autoIncrement) ? theme().currentTheme.colors.error : theme().currentTheme.colors.info);

					Button(node_13, {
						onClick: toggleAuto,
						get color() {
							return $.get(expression);
						},
						border: true,
						width: 16,
						children: $.wrap_snippet(Counter_demo, ($$anchor, $$slotProps) => {
							$.next();

							var text_8 = $.text();

							$.template_effect(() => $.set_text(text_8, $.get(autoIncrement) ? '⏹️ Stop Auto' : '▶️ Start Auto'));
							$.append($$anchor, text_8);
						}),
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_11);
				}),
				$$slots: { default: true }
			});

			var node_14 = $.sibling(node_9, 2);

			Box(node_14, {
				border: true,
				padding: 1,
				get borderColor() {
					return theme().currentTheme.colors.info;
				},
				children: $.wrap_snippet(Counter_demo, ($$anchor, $$slotProps) => {
					var fragment_14 = root_17();
					var node_15 = $.first_child(fragment_14);

					Text(node_15, {
						bold: true,
						get color() {
							return theme().currentTheme.colors.info;
						},
						children: $.wrap_snippet(Counter_demo, ($$anchor, $$slotProps) => {
							$.next();

							var text_9 = $.text('📊 Statistics:');

							$.append($$anchor, text_9);
						}),
						$$slots: { default: true }
					});

					var node_16 = $.sibling(node_15, 2);

					Text(node_16, {
						children: $.wrap_snippet(Counter_demo, ($$anchor, $$slotProps) => {
							$.next();

							var text_10 = $.text();

							$.template_effect(() => $.set_text(text_10, `• Current Value: ${$.get(count) ?? ''}`));
							$.append($$anchor, text_10);
						}),
						$$slots: { default: true }
					});

					var node_17 = $.sibling(node_16, 2);

					Text(node_17, {
						children: $.wrap_snippet(Counter_demo, ($$anchor, $$slotProps) => {
							$.next();

							var text_11 = $.text();

							$.template_effect(() => $.set_text(text_11, `• Step Size: ${$.get(stepSize) ?? ''}`));
							$.append($$anchor, text_11);
						}),
						$$slots: { default: true }
					});

					var node_18 = $.sibling(node_17, 2);

					Text(node_18, {
						children: $.wrap_snippet(Counter_demo, ($$anchor, $$slotProps) => {
							$.next();

							var text_12 = $.text();

							$.template_effect(() => $.set_text(text_12, `• Auto Mode: ${$.get(autoIncrement) ? '🟢 ON' : '🔴 OFF'}`));
							$.append($$anchor, text_12);
						}),
						$$slots: { default: true }
					});

					var node_19 = $.sibling(node_18, 2);

					Text(node_19, {
						children: $.wrap_snippet(Counter_demo, ($$anchor, $$slotProps) => {
							$.next();

							var text_13 = $.text();

							$.template_effect(($0) => $.set_text(text_13, `• Progress: ${$0 ?? ''}% to 50`), [
								() => Math.round($.get(count) / 50 * 100)
							]);

							$.append($$anchor, text_13);
						}),
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_14);
				}),
				$$slots: { default: true }
			});

			var node_20 = $.sibling(node_14, 2);

			Box(node_20, {
				marginTop: 1,
				children: $.wrap_snippet(Counter_demo, ($$anchor, $$slotProps) => {
					Text($$anchor, {
						fontSize: 'small',
						get color() {
							return theme().currentTheme.colors.secondary;
						},
						children: $.wrap_snippet(Counter_demo, ($$anchor, $$slotProps) => {
							$.next();

							var text_14 = $.text();

							$.template_effect(($0) => $.set_text(text_14, `Theme: ${$0 ?? ''} | Powered by Svelte 5 + SvelTUI ✨`), [() => theme().currentTheme.info.name]);
							$.append($$anchor, text_14);
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