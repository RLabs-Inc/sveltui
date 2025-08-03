import 'svelte/internal/disclose-version';

Two_way_binding_demo[$.FILENAME] = 'examples/two-way-binding-demo.svelte';

import * as $ from 'svelte/internal/client';
import { Box, Text, Input, Checkbox, List, Button } from '../src/components/ui/index.ts';

var root_7 = $.add_locations($.template(`<!> <!>`, 1), Two_way_binding_demo[$.FILENAME], []);
var root_2 = $.add_locations($.template(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1), Two_way_binding_demo[$.FILENAME], []);
var root_8 = $.add_locations($.template(`<!> <!> <!> <!> <!> <!> <!> <!>`, 1), Two_way_binding_demo[$.FILENAME], []);
var root_1 = $.add_locations($.template(`<!> <!>`, 1), Two_way_binding_demo[$.FILENAME], []);

export default function Two_way_binding_demo($$anchor, $$props) {
	$.check_target(new.target);
	$.push($$props, true, Two_way_binding_demo);

	// Form state with bindable properties
	let username = $.state('');
	let email = $.state('');
	let password = $.state('');
	let rememberMe = $.state(false);
	let acceptTerms = $.state(false);
	let selectedCountry = $.state(0);

	// Countries list
	const countries = [
		'United States',
		'Canada',
		'United Kingdom',
		'Australia',
		'Germany',
		'France',
		'Japan',
		'Other'
	];

	// Derived state
	let formValid = $.derived(() => $.get(username).length >= 3 && $.get(email).includes('@') && $.get(password).length >= 6 && $.get(acceptTerms));

	let formSummary = $.derived(() => () => {
		const lines = [
			`Username: ${$.get(username) || '(empty)'}`,
			`Email: ${$.get(email) || '(empty)'}`,
			`Password: ${('*').repeat($.get(password).length) || '(empty)'}`,
			`Remember Me: ${$.get(rememberMe) ? 'Yes' : 'No'}`,
			`Accept Terms: ${$.get(acceptTerms) ? 'Yes' : 'No'}`,
			`Country: ${countries[$.get(selectedCountry)]}`
		];

		return lines.join('\n');
	});

	// Submit handler
	function handleSubmit() {
		if (!$.get(formValid)) return;
		// In a real app, you'd submit the form here
		alert('Form submitted successfully!');
	}

	// Reset handler
	function handleReset() {
		$.set(username, '');
		$.set(email, '');
		$.set(password, '');
		$.set(rememberMe, false);
		$.set(acceptTerms, false);
		$.set(selectedCountry, 0);
	}

	Box($$anchor, {
		width: '100%',
		height: '100%',
		border: 'line',
		label: ' Two-Way Binding Demo ',
		children: $.wrap_snippet(Two_way_binding_demo, ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			Box(node, {
				left: 1,
				top: 1,
				width: '50%-2',
				height: '100%-2',
				border: 'line',
				label: ' Registration Form ',
				children: $.wrap_snippet(Two_way_binding_demo, ($$anchor, $$slotProps) => {
					var fragment_2 = root_2();
					var node_1 = $.first_child(fragment_2);

					Text(node_1, {
						left: 1,
						top: 1,
						bold: true,
						children: $.wrap_snippet(Two_way_binding_demo, ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Username:');

							$.append($$anchor, text);
						}),
						$$slots: { default: true }
					});

					var node_2 = $.sibling(node_1, 2);

					Input(node_2, {
						left: 1,
						top: 2,
						width: '100%-2',
						height: 1,
						placeholder: 'Enter username (min 3 chars)',
						border: true,
						get value() {
							return $.get(username);
						},
						set value($$value) {
							$.set(username, $$value, true);
						}
					});

					var node_3 = $.sibling(node_2, 2);

					Text(node_3, {
						left: 1,
						top: 4,
						bold: true,
						children: $.wrap_snippet(Two_way_binding_demo, ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Email:');

							$.append($$anchor, text_1);
						}),
						$$slots: { default: true }
					});

					var node_4 = $.sibling(node_3, 2);

					Input(node_4, {
						left: 1,
						top: 5,
						width: '100%-2',
						height: 1,
						placeholder: 'Enter email address',
						border: true,
						get value() {
							return $.get(email);
						},
						set value($$value) {
							$.set(email, $$value, true);
						}
					});

					var node_5 = $.sibling(node_4, 2);

					Text(node_5, {
						left: 1,
						top: 7,
						bold: true,
						children: $.wrap_snippet(Two_way_binding_demo, ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Password:');

							$.append($$anchor, text_2);
						}),
						$$slots: { default: true }
					});

					var node_6 = $.sibling(node_5, 2);

					Input(node_6, {
						left: 1,
						top: 8,
						width: '100%-2',
						height: 1,
						placeholder: 'Enter password (min 6 chars)',
						secret: true,
						border: true,
						get value() {
							return $.get(password);
						},
						set value($$value) {
							$.set(password, $$value, true);
						}
					});

					var node_7 = $.sibling(node_6, 2);

					Checkbox(node_7, {
						left: 1,
						top: 10,
						label: 'Remember me',
						get checked() {
							return $.get(rememberMe);
						},
						set checked($$value) {
							$.set(rememberMe, $$value, true);
						}
					});

					var node_8 = $.sibling(node_7, 2);

					Checkbox(node_8, {
						left: 1,
						top: 12,
						label: 'I accept the terms and conditions',
						get checked() {
							return $.get(acceptTerms);
						},
						set checked($$value) {
							$.set(acceptTerms, $$value, true);
						}
					});

					var node_9 = $.sibling(node_8, 2);

					Text(node_9, {
						left: 1,
						top: 14,
						bold: true,
						children: $.wrap_snippet(Two_way_binding_demo, ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('Country:');

							$.append($$anchor, text_3);
						}),
						$$slots: { default: true }
					});

					var node_10 = $.sibling(node_9, 2);

					List(node_10, {
						items: countries,
						left: 1,
						top: 15,
						width: '100%-2',
						height: 8,
						border: 'line',
						selectedStyle: { fg: 'white', bg: 'blue' },
						get selected() {
							return $.get(selectedCountry);
						},
						set selected($$value) {
							$.set(selectedCountry, $$value, true);
						}
					});

					var node_11 = $.sibling(node_10, 2);

					Box(node_11, {
						left: 1,
						bottom: 1,
						width: '100%-2',
						height: 3,
						children: $.wrap_snippet(Two_way_binding_demo, ($$anchor, $$slotProps) => {
							var fragment_3 = root_7();
							var node_12 = $.first_child(fragment_3);
							const expression = $.derived(() => $.get(formValid) ? "Submit" : "Submit (Complete form)");
							const expression_1 = $.derived(() => !$.get(formValid));
							const expression_2 = $.derived(() => ({ bg: $.get(formValid) ? 'green' : 'red' }));

							Button(node_12, {
								left: 0,
								get content() {
									return $.get(expression);
								},
								get disabled() {
									return $.get(expression_1);
								},
								get style() {
									return $.get(expression_2);
								},
								onPress: handleSubmit
							});

							var node_13 = $.sibling(node_12, 2);

							Button(node_13, {
								right: 0,
								content: 'Reset',
								style: { bg: 'yellow', fg: 'black' },
								onPress: handleReset
							});

							$.append($$anchor, fragment_3);
						}),
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				}),
				$$slots: { default: true }
			});

			var node_14 = $.sibling(node, 2);

			Box(node_14, {
				right: 1,
				top: 1,
				width: '50%-2',
				height: '100%-2',
				border: 'line',
				label: ' Live Form State ',
				children: $.wrap_snippet(Two_way_binding_demo, ($$anchor, $$slotProps) => {
					var fragment_4 = root_8();
					var node_15 = $.first_child(fragment_4);

					Text(node_15, {
						left: 1,
						top: 1,
						bold: true,
						children: $.wrap_snippet(Two_way_binding_demo, ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text('Form Data:');

							$.append($$anchor, text_4);
						}),
						$$slots: { default: true }
					});

					var node_16 = $.sibling(node_15, 2);

					Text(node_16, {
						left: 1,
						top: 3,
						children: $.wrap_snippet(Two_way_binding_demo, ($$anchor, $$slotProps) => {
							$.next();

							var text_5 = $.text();

							$.template_effect(($0) => $.set_text(text_5, $0), [() => $.get(formSummary)()]);
							$.append($$anchor, text_5);
						}),
						$$slots: { default: true }
					});

					var node_17 = $.sibling(node_16, 2);

					Text(node_17, {
						left: 1,
						top: 10,
						bold: true,
						children: $.wrap_snippet(Two_way_binding_demo, ($$anchor, $$slotProps) => {
							$.next();

							var text_6 = $.text('Validation Status:');

							$.append($$anchor, text_6);
						}),
						$$slots: { default: true }
					});

					var node_18 = $.sibling(node_17, 2);
					const expression_3 = $.derived(() => $.get(username).length >= 3 ? 'green' : 'red');

					Text(node_18, {
						left: 1,
						top: 11,
						get fg() {
							return $.get(expression_3);
						},
						children: $.wrap_snippet(Two_way_binding_demo, ($$anchor, $$slotProps) => {
							$.next();

							var text_7 = $.text();

							$.template_effect(() => $.set_text(text_7, `Username: ${$.get(username).length >= 3 ? '✓ Valid' : '✗ Too short'}`));
							$.append($$anchor, text_7);
						}),
						$$slots: { default: true }
					});

					var node_19 = $.sibling(node_18, 2);
					const expression_4 = $.derived(() => $.get(email).includes('@') ? 'green' : 'red');

					Text(node_19, {
						left: 1,
						top: 12,
						get fg() {
							return $.get(expression_4);
						},
						children: $.wrap_snippet(Two_way_binding_demo, ($$anchor, $$slotProps) => {
							$.next();

							var text_8 = $.text();

							$.template_effect(($0) => $.set_text(text_8, `Email: ${$0 ?? ''}`), [
								() => $.get(email).includes('@') ? '✓ Valid' : '✗ Invalid'
							]);

							$.append($$anchor, text_8);
						}),
						$$slots: { default: true }
					});

					var node_20 = $.sibling(node_19, 2);
					const expression_5 = $.derived(() => $.get(password).length >= 6 ? 'green' : 'red');

					Text(node_20, {
						left: 1,
						top: 13,
						get fg() {
							return $.get(expression_5);
						},
						children: $.wrap_snippet(Two_way_binding_demo, ($$anchor, $$slotProps) => {
							$.next();

							var text_9 = $.text();

							$.template_effect(() => $.set_text(text_9, `Password: ${$.get(password).length >= 6 ? '✓ Valid' : '✗ Too short'}`));
							$.append($$anchor, text_9);
						}),
						$$slots: { default: true }
					});

					var node_21 = $.sibling(node_20, 2);
					const expression_6 = $.derived(() => $.get(acceptTerms) ? 'green' : 'red');

					Text(node_21, {
						left: 1,
						top: 14,
						get fg() {
							return $.get(expression_6);
						},
						children: $.wrap_snippet(Two_way_binding_demo, ($$anchor, $$slotProps) => {
							$.next();

							var text_10 = $.text();

							$.template_effect(() => $.set_text(text_10, `Terms: ${$.get(acceptTerms) ? '✓ Accepted' : '✗ Not accepted'}`));
							$.append($$anchor, text_10);
						}),
						$$slots: { default: true }
					});

					var node_22 = $.sibling(node_21, 2);
					const expression_7 = $.derived(() => $.get(formValid) ? 'green' : 'yellow');

					Text(node_22, {
						left: 1,
						bottom: 2,
						bold: true,
						get fg() {
							return $.get(expression_7);
						},
						children: $.wrap_snippet(Two_way_binding_demo, ($$anchor, $$slotProps) => {
							$.next();

							var text_11 = $.text();

							$.template_effect(() => $.set_text(text_11, `Form Status: ${$.get(formValid) ? 'Ready to submit!' : 'Please complete all fields'}`));
							$.append($$anchor, text_11);
						}),
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_4);
				}),
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		}),
		$$slots: { default: true }
	});

	return $.pop({ ...$.legacy_api() });
}