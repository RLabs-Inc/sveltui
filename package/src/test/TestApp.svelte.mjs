import 'svelte/internal/disclose-version';

TestApp[$.FILENAME] = 'src/test/TestApp.svelte';

import * as $ from 'svelte/internal/client';
import Box from '../components/Box.svelte.mjs';
import Text from '../components/Text.svelte.mjs';

var root_1 = $.add_locations($.from_html(`<!> <!> <!> <!> <!> <!> <!>`, 1), TestApp[$.FILENAME], []);

export default function TestApp($$anchor, $$props) {
	$.check_target(new.target);
	$.push($$props, true, TestApp);

	// import Input from '../components/Input.svelte.mjs'
	// State
	let counter = $.tag($.state(0), 'counter');

	let name = '';
	let progress = $.tag($.state(0), 'progress');
	let status = $.tag($.state('Ready'), 'status');

	// Update functions
	function incrementCounter() {
		$.update(counter);
		$.set(status, `Counter incremented to ${$.get(counter)}`);
	}

	function decrementCounter() {
		$.update(counter, -1);
		$.set(status, `Counter decremented to ${$.get(counter)}`);
	}

	function resetProgress() {
		$.set(progress, 0);
		$.set(status, 'Progress reset');
	}

	// Handle input keyboard events
	function handleInputKey(event) {
		// Let default input behavior happen unless it's a special key
		if ($.strict_equals(event.key, 'Enter')) {
			$.set(status, `Name entered: ${name}`);

			return true; // Consume the event
		}
	}

	// Global keyboard handler for the box
	function handleGlobalKey(event) {
		if ($.strict_equals(event.key, '+') || $.strict_equals(event.key, '=')) {
			incrementCounter();

			return true;
		} else if ($.strict_equals(event.key, '-') || $.strict_equals(event.key, '_')) {
			decrementCounter();

			return true;
		} else if ($.strict_equals(event.key, ' ')) {
			resetProgress();

			return true;
		}
	}

	// Timer for progress
	setInterval(
		() => {
			$.set(progress, $.get(progress) >= 100 ? 0 : $.get(progress) + 5, true);
		},
		500
	);

	// Timer for clock
	let clock = $.tag($.state($.proxy(new Date().toLocaleTimeString())), 'clock');

	setInterval(
		() => {
			$.set(clock, new Date().toLocaleTimeString(), true);
		},
		1000
	);

	var $$exports = { ...$.legacy_api() };

	$.add_svelte_meta(
		() => Box($$anchor, {
			x: 1,
			y: 1,
			width: 60,
			height: 20,
			border: 'rounded',
			borderColor: 0x0088ff,
			focusable: true,
			onkeydown: handleGlobalKey,

			children: $.wrap_snippet(TestApp, ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node = $.first_child(fragment_1);

				$.add_svelte_meta(
					() => Text(node, {
						x: 3,
						y: 2,
						color: 0x00ff00,
						text: 'SvelTUI v2 - Reactive Test'
					}),
					'component',
					TestApp,
					74,
					2,
					{ componentTag: 'Text' }
				);

				var node_1 = $.sibling(node, 2);

				{
					let $0 = $.derived(() => `Status: ${$.get(status)}`);

					$.add_svelte_meta(
						() => Text(node_1, {
							x: 3,
							y: 4,
							color: 0xffff00,

							get text() {
								return $.get($0);
							}
						}),
						'component',
						TestApp,
						76,
						2,
						{ componentTag: 'Text' }
					);
				}

				var node_2 = $.sibling(node_1, 2);

				{
					let $0 = $.derived(() => `Counter: ${$.get(counter)}`);

					$.add_svelte_meta(
						() => Text(node_2, {
							x: 3,
							y: 6,

							get text() {
								return $.get($0);
							}
						}),
						'component',
						TestApp,
						78,
						2,
						{ componentTag: 'Text' }
					);
				}

				var node_3 = $.sibling(node_2, 2);

				$.add_svelte_meta(
					() => Text(node_3, {
						x: 3,
						y: 10,
						color: name ? 0x00ffff : 0xffffff,
						text: name ? `Hello, ${name}!` : 'Hello, stranger!'
					}),
					'component',
					TestApp,
					89,
					2,
					{ componentTag: 'Text' }
				);

				var node_4 = $.sibling(node_3, 2);

				{
					let $0 = $.derived(() => `Progress: ${$.get(progress)}%`);

					$.add_svelte_meta(
						() => Text(node_4, {
							x: 3,
							y: 12,

							get text() {
								return $.get($0);
							}
						}),
						'component',
						TestApp,
						96,
						2,
						{ componentTag: 'Text' }
					);
				}

				var node_5 = $.sibling(node_4, 2);

				$.add_svelte_meta(
					() => Text(node_5, {
						x: 3,
						y: 14,

						get text() {
							return $.get(clock);
						}
					}),
					'component',
					TestApp,
					98,
					2,
					{ componentTag: 'Text' }
				);

				var node_6 = $.sibling(node_5, 2);

				$.add_svelte_meta(
					() => Text(node_6, {
						x: 3,
						y: 16,
						color: 0x808080,
						text: 'Tab: Focus | +/-: Counter | Space: Reset | Ctrl+C: Exit'
					}),
					'component',
					TestApp,
					100,
					2,
					{ componentTag: 'Text' }
				);

				$.append($$anchor, fragment_1);
			}),

			$$slots: { default: true }
		}),
		'component',
		TestApp,
		64,
		0,
		{ componentTag: 'Box' }
	);

	return $.pop($$exports);
}