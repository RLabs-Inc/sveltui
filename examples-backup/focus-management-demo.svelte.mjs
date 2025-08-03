import 'svelte/internal/disclose-version';

Focus_management_demo[$.FILENAME] = 'examples/focus-management-demo.svelte';

import * as $ from 'svelte/internal/client';
import { getGlobalFocusContext } from '../src/dom/focus-context-simple';
import Input from '../src/components/ui/Input.svelte.mjs';
import Button from '../src/components/ui/Button.svelte.mjs';
import List from '../src/components/ui/List.svelte.mjs';
import Text from '../src/components/ui/Text.svelte.mjs';
import Box from '../src/components/ui/Box.svelte.mjs';

// Event handlers
function handleLogin(_, lastAction, username, password) {
	$.set(lastAction, `Login: ${$.get(username) || 'empty'} / ${$.get(password) ? '***' : 'empty'}`);
}

function openModal(__1, showModal, lastAction) {
	$.set(showModal, true);
	$.set(lastAction, 'Modal opened');
}

function submitModal(__2, lastAction, modalInput, closeModal) {
	$.set(lastAction, `Modal submitted: ${$.get(modalInput)}`);
	closeModal();
}

var on_click = (__3, lastAction) => $.set(lastAction, 'Skip to end clicked');

var root_1 = $.add_locations($.template(`<box left="center" top="center" width="50%" border="line" label="Modal Dialog"><text>Enter some text:</text> <input id="modal-input" width="90%"> <text>Modal is open. Press Escape to close.</text> <button id="modal-submit">Submit</button> <button id="modal-cancel">Cancel</button></box>`), Focus_management_demo[$.FILENAME], [
	[
		183,
		4,
		[
			[192, 6],
			[193, 6],
			[202, 6],
			[206, 6],
			[217, 6]
		]
	]
]);

var root = $.add_locations(
	$.template(
		`/**
 * Focus Management Demo
 * 
 * Demonstrates the focus context system with tab navigation,
 * focus traps, visual indicators, and custom tab order.
 */ <box><box border="line" label="Focus Management Demo"><text> </text></box> <box border="line" label="Main Area"><box width="50%" border="line" label="Login Form"><text>Username:</text> <input id="username" width="90%"> <text>Password:</text> <input id="password" width="90%"> <button id="login">Login</button> <button id="modal">Open Modal</button></box> <box width="45%" border="line" label="Menu"><list id="menu" height="100%"></list></box> <button id="skip">Skip to End</button> <text>Tab: Next | Shift+Tab: Previous | Enter: Activate</text></box> <box border="line" label="Status"><text> </text></box> <!></box>`,
		1
	),
	Focus_management_demo[$.FILENAME],
	[
		[
			92,
			0,
			[
				[94, 2, [[95, 4]]],
				[
					99,
					2,
					[
						[
							101,
							4,
							[
								[102, 6],
								[103, 6],
								[112, 6],
								[113, 6],
								[123, 6],
								[134, 6]
							]
						],
						[147, 4, [[148, 6]]],
						[159, 4],
						[171, 4]
					]
				],
				[177, 2, [[178, 4]]]
			]
		]
	]
);

export default function Focus_management_demo($$anchor, $$props) {
	$.check_target(new.target);
	$.push($$props, true, Focus_management_demo);

	// Get global focus context
	const focusContext = getGlobalFocusContext();
	// State
	let showModal = $.state(false);
	let username = $.state('');
	let password = $.state('');
	let selectedItem = $.state(0);
	let modalInput = $.state('');
	let lastAction = $.state('Press Tab to navigate');
	let focusedElementInfo = $.state('No element focused');

	$.user_effect(() => {
		const interval = setInterval(
			() => {
				const focused = focusContext.focusedElement;

				if (!focused) {
					$.set(focusedElementInfo, 'No element focused');
				} else {
					const tag = focused.tagName;
					const id = focused.getAttribute('id') || 'unnamed';
					const elements = focusContext.getFocusableElements();
					const index = elements.indexOf(focused);
					const total = elements.length;

					$.set(focusedElementInfo, `Focused: ${tag}#${id} (${index + 1}/${total})`);
				}
			},
			100
		);

		return () => clearInterval(interval);
	});

	$.user_effect(() => {
		if (!$.get(showModal)) return;

		const handleKey = (e) => {
			if ($.strict_equals(e.key, 'Escape')) {
				closeModal();
			}
		};

		window.addEventListener('keydown', handleKey);
		return () => window.removeEventListener('keydown', handleKey);
	});

	// List items
	const menuItems = [
		'Dashboard',
		'Profile',
		'Settings',
		'Logout'
	];

	function handleMenuSelect(index) {
		$.set(selectedItem, index, true);
		$.set(lastAction, `Selected: ${menuItems[index]}`);
	}

	function closeModal() {
		$.set(showModal, false);
		$.set(modalInput, '');
		$.set(lastAction, 'Modal closed');
	}

	$.next();

	var fragment = root();
	var box = $.sibling($.first_child(fragment));
	var box_1 = $.child(box);

	$.set_attribute(box_1, 'height', 3);

	var text = $.child(box_1);

	$.set_attribute(text, 'top', 0);
	$.set_attribute(text, 'left', 1);

	var text_1 = $.child(text, true);

	$.reset(text);
	$.reset(box_1);

	var box_2 = $.sibling(box_1, 2);

	$.set_attribute(box_2, 'top', 3);
	$.set_attribute(box_2, 'height', 15);

	var box_3 = $.child(box_2);

	$.set_attribute(box_3, 'top', 1);
	$.set_attribute(box_3, 'left', 2);
	$.set_attribute(box_3, 'height', 8);

	var text_2 = $.child(box_3);

	$.set_attribute(text_2, 'top', 0);
	$.set_attribute(text_2, 'left', 1);

	var input = $.sibling(text_2, 2);

	$.remove_input_defaults(input);
	$.set_attribute(input, 'top', 1);
	$.set_attribute(input, 'left', 1);
	$.set_attribute(input, 'tabindex', 1);

	var text_3 = $.sibling(input, 2);

	$.set_attribute(text_3, 'top', 2);
	$.set_attribute(text_3, 'left', 1);

	var input_1 = $.sibling(text_3, 2);

	$.remove_input_defaults(input_1);
	$.set_attribute(input_1, 'top', 3);
	$.set_attribute(input_1, 'left', 1);
	$.set_attribute(input_1, 'secret', true);
	$.set_attribute(input_1, 'tabindex', 2);

	var button = $.sibling(input_1, 2);

	$.set_attribute(button, 'top', 5);
	$.set_attribute(button, 'left', 1);
	$.set_attribute(button, 'width', 10);
	button.__click = [handleLogin, lastAction, username, password];
	$.set_attribute(button, 'tabindex', 3);

	var button_1 = $.sibling(button, 2);

	$.set_attribute(button_1, 'top', 5);
	$.set_attribute(button_1, 'left', 12);
	$.set_attribute(button_1, 'width', 15);
	button_1.__click = [openModal, showModal, lastAction];
	$.set_attribute(button_1, 'tabindex', 4);
	$.reset(box_3);

	var box_4 = $.sibling(box_3, 2);

	$.set_attribute(box_4, 'top', 1);
	$.set_attribute(box_4, 'right', 2);
	$.set_attribute(box_4, 'height', 8);

	var list = $.child(box_4);

	$.set_attribute(list, 'items', menuItems);
	$.set_attribute(list, 'tabindex', 5);
	$.reset(box_4);

	var button_2 = $.sibling(box_4, 2);

	$.set_attribute(button_2, 'bottom', 1);
	$.set_attribute(button_2, 'left', 2);
	$.set_attribute(button_2, 'width', 20);
	$.set_attribute(button_2, 'tabindex', 10);
	button_2.__click = [on_click, lastAction];

	var text_4 = $.sibling(button_2, 2);

	$.set_attribute(text_4, 'bottom', 1);
	$.set_attribute(text_4, 'right', 2);
	$.set_attribute(text_4, 'focusable', false);
	$.reset(box_2);

	var box_5 = $.sibling(box_2, 2);

	$.set_attribute(box_5, 'bottom', 0);
	$.set_attribute(box_5, 'height', 3);

	var text_5 = $.child(box_5);

	$.set_attribute(text_5, 'top', 0);
	$.set_attribute(text_5, 'left', 1);

	var text_6 = $.child(text_5);

	$.reset(text_5);
	$.reset(box_5);

	var node = $.sibling(box_5, 2);

	{
		var consequent = ($$anchor) => {
			var box_6 = root_1();

			$.set_attribute(box_6, 'height', 10);
			$.set_attribute(box_6, 'zindex', 100);

			var text_7 = $.child(box_6);

			$.set_attribute(text_7, 'top', 0);
			$.set_attribute(text_7, 'left', 1);

			var input_2 = $.sibling(text_7, 2);

			$.remove_input_defaults(input_2);
			$.set_attribute(input_2, 'top', 1);
			$.set_attribute(input_2, 'left', 1);
			$.set_attribute(input_2, 'tabindex', 1);

			var text_8 = $.sibling(input_2, 2);

			$.set_attribute(text_8, 'top', 3);
			$.set_attribute(text_8, 'left', 1);
			$.set_attribute(text_8, 'focusable', false);

			var button_3 = $.sibling(text_8, 2);

			$.set_attribute(button_3, 'bottom', 1);
			$.set_attribute(button_3, 'left', 1);
			$.set_attribute(button_3, 'width', 10);

			button_3.__click = [
				submitModal,
				lastAction,
				modalInput,
				closeModal
			];

			$.set_attribute(button_3, 'tabindex', 2);

			var button_4 = $.sibling(button_3, 2);

			$.set_attribute(button_4, 'bottom', 1);
			$.set_attribute(button_4, 'right', 1);
			$.set_attribute(button_4, 'width', 10);
			button_4.__click = closeModal;
			$.set_attribute(button_4, 'tabindex', 3);
			$.reset(box_6);
			$.bind_value(input_2, () => $.get(modalInput), ($$value) => $.set(modalInput, $$value));
			$.append($$anchor, box_6);
		};

		$.if(node, ($$render) => {
			if ($.get(showModal)) $$render(consequent);
		});
	}

	$.reset(box);

	$.template_effect(() => {
		$.set_text(text_1, $.get(focusedElementInfo));
		$.set_selected(list, $.get(selectedItem));
		$.set_text(text_6, `Last Action: ${$.get(lastAction) ?? ''}`);
	});

	$.bind_value(input, () => $.get(username), ($$value) => $.set(username, $$value));
	$.bind_value(input_1, () => $.get(password), ($$value) => $.set(password, $$value));
	$.event('Select', list, handleMenuSelect);
	$.append($$anchor, fragment);
	return $.pop({ ...$.legacy_api() });
}

$.delegate(['click']);