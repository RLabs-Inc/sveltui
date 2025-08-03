import 'svelte/internal/disclose-version';

Advanced_style_demo[$.FILENAME] = 'examples/advanced-style-demo.svelte';

import * as $ from 'svelte/internal/client';
import { createStyleState } from '../src/dom/style-state.svelte.ts';
import { createStyle, mergeStyles } from '../src/dom/style-utils';

// Event handlers
function toggleTheme(_, theme) {
	$.set(theme, $.strict_equals($.get(theme), 'dark') ? 'light' : 'dark', true);
}

var on_click = (__1, selectTab) => selectTab(0);
var on_mouseover = (__2, tab1Style) => $.get(tab1Style).setHovered(true);
var on_mouseout = (__3, tab1Style) => $.get(tab1Style).setHovered(false);
var on_click_1 = (__4, selectTab) => selectTab(1);
var on_mouseover_1 = (__5, tab2Style) => $.get(tab2Style).setHovered(true);
var on_mouseout_1 = (__6, tab2Style) => $.get(tab2Style).setHovered(false);
var on_click_2 = (__7, selectTab) => selectTab(2);
var on_mouseover_2 = (__8, tab3Style) => $.get(tab3Style).setHovered(true);
var on_mouseout_2 = (__9, tab3Style) => $.get(tab3Style).setHovered(false);
var on_click_3 = (__10, addNotification) => addNotification('info');
var on_click_4 = (__11, addNotification) => addNotification('success');
var on_click_5 = (__12, addNotification) => addNotification('warning');
var on_click_6 = (__13, addNotification) => addNotification('error');
var on_mouseover_3 = (__14, notificationStyles, notification) => notificationStyles[$.get(notification).type].setHovered(true);
var on_mouseout_3 = (__15, notificationStyles, notification) => notificationStyles[$.get(notification).type].setHovered(false);
var on_click_7 = (__16, removeNotification, notification) => removeNotification($.get(notification).id);

var root_2 = $.add_locations($.template(`<box width="100%"><text></text> <text content="[×]"></text></box>`), Advanced_style_demo[$.FILENAME], [
	[245, 12, [[255, 14], [260, 14]]]
]);

var root_1 = $.add_locations($.template(`<box><text content="Click buttons to add notifications:"></text> <box><button content="Info"></button> <button content="Success"></button> <button content="Warning"></button> <button content="Error"></button></box> <box></box></box>`), Advanced_style_demo[$.FILENAME], [
	[
		208,
		6,
		[
			[209, 8],
			[
				211,
				8,
				[
					[212, 10],
					[219, 10],
					[226, 10],
					[233, 10]
				]
			],
			[243, 8]
		]
	]
]);

var root_4 = $.add_locations($.template(`<box><text content="Style Inheritance Demo:"></text> <box width="45%"><text content="Parent Style"></text> <text></text> <text></text> <box><text content="Child inherits parent"></text></box></box> <box width="45%"><text content="Override Style"></text> <text content="Custom border color"></text> <text content="Inherits text colors"></text></box></box>`), Advanced_style_demo[$.FILENAME], [
	[
		273,
		6,
		[
			[274, 8],
			[
				276,
				8,
				[
					[277, 10],
					[278, 10],
					[279, 10],
					[281, 10, [[282, 12]]]
				]
			],
			[
				286,
				8,
				[[290, 10], [291, 10], [292, 10]]
			]
		]
	]
]);

var root_6 = $.add_locations($.template(`<box><text content="Interactive Style States:"></text> <box><text content="Hover and click the elements below:"></text> <box><text align="center" content="Hoverable Box"></text></box> <textbox></textbox> <progressbar width="90%"></progressbar></box></box>`), Advanced_style_demo[$.FILENAME], [
	[
		298,
		6,
		[
			[299, 8],
			[
				301,
				8,
				[
					[302, 10],
					[304, 10, [[319, 12]]],
					[322, 10],
					[341, 10]
				]
			]
		]
	]
]);

var root = $.add_locations($.template(`<box width="100%" height="100%"><box width="100%" label=" Advanced Style State Demo "><text></text> <button content="Toggle Theme"></button></box> <box width="100%"><box width="33%"><text align="center" content="Notifications"></text></box> <box left="33%" width="34%"><text align="center" content="Style Cascading"></text></box> <box width="33%"><text align="center" content="Interactive Demo"></text></box></box> <box width="100%"><!></box> <box width="100%"><text></text> <text content="Press Tab to navigate, Enter to select"></text></box></box>`), Advanced_style_demo[$.FILENAME], [
	[
		116,
		0,
		[
			[122, 2, [[129, 4], [135, 4]]],
			[
				154,
				2,
				[
					[155, 4, [[168, 6]]],
					[171, 4, [[184, 6]]],
					[187, 4, [[200, 6]]]
				]
			],
			[205, 2],
			[358, 2, [[364, 4], [369, 4]]]
		]
	]
]);

export default function Advanced_style_demo($$anchor, $$props) {
	$.check_target(new.target);
	$.push($$props, true, Advanced_style_demo);

	// Application state
	let theme = $.state('dark'); // 'dark' or 'light'
	let selectedTab = $.state(0);

	let notifications = $.state($.proxy([
		{
			id: 1,
			text: 'Welcome to SvelTUI!',
			type: 'info'
		},
		{
			id: 2,
			text: 'Style states are reactive',
			type: 'success'
		}
	]));

	// Theme styles
	const themes = {
		dark: {
			normal: { fg: 'white', bg: 'black' },
			panel: { border: { fg: 'gray' } },
			active: { fg: 'cyan', bg: 'blue' }
		},
		light: {
			normal: { fg: 'black', bg: 'white' },
			panel: { border: { fg: 'black' } },
			active: { fg: 'white', bg: 'blue' }
		}
	};

	// Root style state (theme-aware)
	const rootStyle = $.derived(() => {
		return createStyleState({ normal: themes[$.get(theme)].normal });
	});

	// Panel style state (inherits from root)
	const panelStyle = createStyleState({
		normal: createStyle({ border: themes[$.get(theme)].panel.border }),
		focus: createStyle({ border: { fg: 'yellow', type: 'double' } }),
		parent: $.get(rootStyle)
	});

	// Tab styles
	function createTabStyle(index) {
		return createStyleState({
			normal: createStyle({
				fg: $.strict_equals($.get(selectedTab), index) ? themes[$.get(theme)].active.fg : themes[$.get(theme)].normal.fg,
				bg: $.strict_equals($.get(selectedTab), index) ? themes[$.get(theme)].active.bg : themes[$.get(theme)].normal.bg,
				border: {
					type: 'line',
					fg: $.strict_equals($.get(selectedTab), index) ? 'cyan' : 'gray'
				}
			}),
			hover: createStyle({
				bg: $.strict_equals($.get(selectedTab), index) ? themes[$.get(theme)].active.bg : 'gray',
				bold: true
			}),
			focus: createStyle({ border: { fg: 'yellow' } })
		});
	}

	// Notification styles by type
	const notificationStyles = {
		info: createStyleState({
			normal: createStyle({
				fg: 'cyan',
				border: { fg: 'cyan', type: 'line' }
			}),
			hover: createStyle({ bg: 'blue' })
		}),
		success: createStyleState({
			normal: createStyle({
				fg: 'green',
				border: { fg: 'green', type: 'line' }
			}),
			hover: createStyle({ bg: 'green', fg: 'black' })
		}),
		warning: createStyleState({
			normal: createStyle({
				fg: 'yellow',
				border: { fg: 'yellow', type: 'line' }
			}),
			hover: createStyle({ bg: 'yellow', fg: 'black' })
		}),
		error: createStyleState({
			normal: createStyle({
				fg: 'red',
				border: { fg: 'red', type: 'line' }
			}),
			hover: createStyle({ bg: 'red', fg: 'white' })
		})
	};

	// Tab style states
	let tab1Style = $.derived(() => createTabStyle(0));
	let tab2Style = $.derived(() => createTabStyle(1));
	let tab3Style = $.derived(() => createTabStyle(2));

	function selectTab(index) {
		$.set(selectedTab, index, true);
	}

	function addNotification(type) {
		const id = Date.now();

		$.set(
			notifications,
			[
				...$.get(notifications),
				{ id, text: `New ${type} notification!`, type }
			],
			true
		);

		// Auto-remove after 5 seconds
		setTimeout(
			() => {
				$.set(notifications, $.get(notifications).filter((n) => $.strict_equals(n.id, id, false)), true);
			},
			5000
		);
	}

	function removeNotification(id) {
		$.set(notifications, $.get(notifications).filter((n) => $.strict_equals(n.id, id, false)), true);
	}

	var box = root();
	var box_1 = $.child(box);

	$.set_attribute(box_1, 'top', 0);
	$.set_attribute(box_1, 'height', 3);

	var text = $.child(box_1);

	$.set_attribute(text, 'top', 0);
	$.set_attribute(text, 'left', 2);

	var button = $.sibling(text, 2);

	$.set_attribute(button, 'top', 0);
	$.set_attribute(button, 'right', 2);
	$.set_attribute(button, 'width', 15);
	$.set_attribute(button, 'height', 1);
	button.__click = [toggleTheme, theme];

	$.set_style(button, {
		fg: 'black',
		bg: 'yellow',
		hover: { bg: 'brightyellow' },
		focus: { bold: true }
	});

	$.set_attribute(button, 'mouse', true);
	$.set_attribute(button, 'keys', true);
	$.reset(box_1);

	var box_2 = $.sibling(box_1, 2);

	$.set_attribute(box_2, 'top', 3);
	$.set_attribute(box_2, 'height', 3);

	var box_3 = $.child(box_2);

	$.set_attribute(box_3, 'left', 0);
	$.set_attribute(box_3, 'height', 3);
	box_3.__click = [on_click, selectTab];
	box_3.__mouseover = [on_mouseover, tab1Style];
	box_3.__mouseout = [on_mouseout, tab1Style];
	$.set_attribute(box_3, 'mouse', true);
	$.set_attribute(box_3, 'keys', true);

	var box_4 = $.sibling(box_3, 2);

	$.set_attribute(box_4, 'height', 3);
	box_4.__click = [on_click_1, selectTab];
	box_4.__mouseover = [on_mouseover_1, tab2Style];
	box_4.__mouseout = [on_mouseout_1, tab2Style];
	$.set_attribute(box_4, 'mouse', true);
	$.set_attribute(box_4, 'keys', true);

	var box_5 = $.sibling(box_4, 2);

	$.set_attribute(box_5, 'right', 0);
	$.set_attribute(box_5, 'height', 3);
	box_5.__click = [on_click_2, selectTab];
	box_5.__mouseover = [on_mouseover_2, tab3Style];
	box_5.__mouseout = [on_mouseout_2, tab3Style];
	$.set_attribute(box_5, 'mouse', true);
	$.set_attribute(box_5, 'keys', true);
	$.reset(box_2);

	var box_6 = $.sibling(box_2, 2);

	$.set_attribute(box_6, 'top', 6);
	$.set_attribute(box_6, 'bottom', 3);

	var node = $.child(box_6);

	{
		var consequent = ($$anchor) => {
			var box_7 = root_1();

			$.set_attribute(box_7, 'padding', 1);

			var box_8 = $.sibling($.child(box_7), 2);

			$.set_attribute(box_8, 'top', 2);
			$.set_attribute(box_8, 'height', 3);

			var button_1 = $.child(box_8);

			$.set_attribute(button_1, 'left', 0);
			button_1.__click = [on_click_3, addNotification];
			$.set_style(button_1, { bg: 'cyan', fg: 'black' });
			$.set_attribute(button_1, 'mouse', true);

			var button_2 = $.sibling(button_1, 2);

			$.set_attribute(button_2, 'left', 10);
			button_2.__click = [on_click_4, addNotification];
			$.set_style(button_2, { bg: 'green', fg: 'white' });
			$.set_attribute(button_2, 'mouse', true);

			var button_3 = $.sibling(button_2, 2);

			$.set_attribute(button_3, 'left', 20);
			button_3.__click = [on_click_5, addNotification];
			$.set_style(button_3, { bg: 'yellow', fg: 'black' });
			$.set_attribute(button_3, 'mouse', true);

			var button_4 = $.sibling(button_3, 2);

			$.set_attribute(button_4, 'left', 30);
			button_4.__click = [on_click_6, addNotification];
			$.set_style(button_4, { bg: 'red', fg: 'white' });
			$.set_attribute(button_4, 'mouse', true);
			$.reset(box_8);

			var box_9 = $.sibling(box_8, 2);

			$.set_attribute(box_9, 'top', 5);
			$.set_attribute(box_9, 'bottom', 0);
			$.set_attribute(box_9, 'scrollable', true);

			$.each(box_9, 21, () => $.get(notifications), $.index, ($$anchor, notification, i) => {
				var box_10 = root_2();

				$.set_attribute(box_10, 'top', i * 3);
				$.set_attribute(box_10, 'height', 3);

				box_10.__mouseover = [
					on_mouseover_3,
					notificationStyles,
					notification
				];

				box_10.__mouseout = [
					on_mouseout_3,
					notificationStyles,
					notification
				];

				box_10.__click = [on_click_7, removeNotification, notification];
				$.set_attribute(box_10, 'mouse', true);

				var text_1 = $.child(box_10);

				$.set_attribute(text_1, 'top', 0);
				$.set_attribute(text_1, 'left', 1);

				var text_2 = $.sibling(text_1, 2);

				$.set_attribute(text_2, 'top', 0);
				$.set_attribute(text_2, 'right', 1);
				$.set_style(text_2, { fg: 'gray' });
				$.reset(box_10);

				$.template_effect(() => {
					$.set_style(box_10, notificationStyles[$.get(notification).type].blessedStyle);
					$.set_attribute(text_1, 'content', $.get(notification).text);
				});

				$.append($$anchor, box_10);
			});

			$.reset(box_9);
			$.reset(box_7);
			$.append($$anchor, box_7);
		};

		var alternate = ($$anchor, $$elseif) => {
			{
				var consequent_1 = ($$anchor) => {
					var box_11 = root_4();

					$.set_attribute(box_11, 'padding', 1);

					var text_3 = $.child(box_11);

					$.set_style(text_3, { bold: true });

					var box_12 = $.sibling(text_3, 2);

					$.set_attribute(box_12, 'top', 2);
					$.set_attribute(box_12, 'left', 2);
					$.set_attribute(box_12, 'height', 8);

					var text_4 = $.child(box_12);

					$.set_attribute(text_4, 'top', 0);
					$.set_attribute(text_4, 'left', 1);

					var text_5 = $.sibling(text_4, 2);

					$.set_attribute(text_5, 'top', 1);
					$.set_attribute(text_5, 'left', 1);

					var text_6 = $.sibling(text_5, 2);

					$.set_attribute(text_6, 'top', 2);
					$.set_attribute(text_6, 'left', 1);

					var box_13 = $.sibling(text_6, 2);

					$.set_attribute(box_13, 'top', 4);
					$.set_attribute(box_13, 'left', 1);
					$.set_attribute(box_13, 'right', 1);
					$.set_attribute(box_13, 'height', 3);
					$.reset(box_12);

					var box_14 = $.sibling(box_12, 2);

					$.set_attribute(box_14, 'top', 2);
					$.set_attribute(box_14, 'right', 2);
					$.set_attribute(box_14, 'height', 8);

					var text_7 = $.child(box_14);

					$.set_attribute(text_7, 'top', 0);
					$.set_attribute(text_7, 'left', 1);

					var text_8 = $.sibling(text_7, 2);

					$.set_attribute(text_8, 'top', 1);
					$.set_attribute(text_8, 'left', 1);
					$.set_style(text_8, { fg: 'magenta' });

					var text_9 = $.sibling(text_8, 2);

					$.set_attribute(text_9, 'top', 2);
					$.set_attribute(text_9, 'left', 1);
					$.reset(box_14);
					$.reset(box_11);

					$.template_effect(
						($0) => {
							$.set_style(box_12, panelStyle.blessedStyle);
							$.set_attribute(text_5, 'content', `fg: ${$.get(rootStyle).currentStyle.fg}`);
							$.set_attribute(text_6, 'content', `bg: ${$.get(rootStyle).currentStyle.bg}`);
							$.set_style(box_13, panelStyle.blessedStyle);
							$.set_style(box_14, $0);
						},
						[
							() => ({
								...panelStyle.blessedStyle,
								border: { fg: 'magenta', type: 'double' }
							})
						]
					);

					$.append($$anchor, box_11);
				};

				var alternate_1 = ($$anchor, $$elseif) => {
					{
						var consequent_2 = ($$anchor) => {
							var box_15 = root_6();

							$.set_attribute(box_15, 'padding', 1);

							var text_10 = $.child(box_15);

							$.set_style(text_10, { bold: true });

							var box_16 = $.sibling(text_10, 2);

							$.set_attribute(box_16, 'top', 2);
							$.set_attribute(box_16, 'height', 10);

							var text_11 = $.child(box_16);

							$.set_attribute(text_11, 'top', 0);

							var box_17 = $.sibling(text_11, 2);

							$.set_attribute(box_17, 'top', 2);
							$.set_attribute(box_17, 'left', 0);
							$.set_attribute(box_17, 'width', 20);
							$.set_attribute(box_17, 'height', 3);

							$.set_style(box_17, {
								fg: 'white',
								bg: 'blue',
								border: { type: 'line' },
								hover: { bg: 'cyan', bold: true },
								focus: { border: { fg: 'yellow' } }
							});

							$.set_attribute(box_17, 'mouse', true);
							$.set_attribute(box_17, 'keys', true);

							var textbox = $.sibling(box_17, 2);

							$.set_attribute(textbox, 'top', 2);
							$.set_attribute(textbox, 'left', 25);
							$.set_attribute(textbox, 'width', 30);
							$.set_attribute(textbox, 'height', 3);

							$.set_style(textbox, {
								fg: 'white',
								bg: 'black',
								border: { type: 'line' },
								focus: {
									bg: 'blue',
									border: { fg: 'cyan', type: 'double' }
								}
							});

							$.set_attribute(textbox, 'mouse', true);
							$.set_attribute(textbox, 'keys', true);
							$.set_attribute(textbox, 'inputonfocus', true);

							var progressbar = $.sibling(textbox, 2);

							$.set_attribute(progressbar, 'top', 6);
							$.set_attribute(progressbar, 'left', 0);
							$.set_attribute(progressbar, 'height', 3);
							$.set_attribute(progressbar, 'filled', 60);

							$.set_style(progressbar, {
								border: { type: 'line' },
								bar: { bg: 'green' }
							});

							$.reset(box_16);
							$.reset(box_15);
							$.append($$anchor, box_15);
						};

						$.if(
							$$anchor,
							($$render) => {
								if ($.strict_equals($.get(selectedTab), 2)) $$render(consequent_2);
							},
							$$elseif
						);
					}
				};

				$.if(
					$$anchor,
					($$render) => {
						if ($.strict_equals($.get(selectedTab), 1)) $$render(consequent_1); else $$render(alternate_1, false);
					},
					$$elseif
				);
			}
		};

		$.if(node, ($$render) => {
			if ($.strict_equals($.get(selectedTab), 0)) $$render(consequent); else $$render(alternate, false);
		});
	}

	$.reset(box_6);

	var box_18 = $.sibling(box_6, 2);

	$.set_attribute(box_18, 'bottom', 0);
	$.set_attribute(box_18, 'height', 3);

	var text_12 = $.child(box_18);

	$.set_attribute(text_12, 'top', 0);
	$.set_attribute(text_12, 'left', 2);

	var text_13 = $.sibling(text_12, 2);

	$.set_attribute(text_13, 'top', 0);
	$.set_attribute(text_13, 'right', 2);
	$.set_style(text_13, { fg: 'gray' });
	$.reset(box_18);
	$.reset(box);

	$.template_effect(() => {
		$.set_style(box, $.get(rootStyle).blessedStyle);
		$.set_style(box_1, panelStyle.blessedStyle);
		$.set_attribute(text, 'content', `Theme: ${$.get(theme)}`);

		$.set_style(text, {
			fg: $.strict_equals($.get(theme), 'dark') ? 'white' : 'black'
		});

		$.set_style(box_3, $.get(tab1Style).blessedStyle);
		$.set_style(box_4, $.get(tab2Style).blessedStyle);
		$.set_style(box_5, $.get(tab3Style).blessedStyle);
		$.set_style(box_6, panelStyle.blessedStyle);
		$.set_style(box_18, panelStyle.blessedStyle);

		$.set_attribute(text_12, 'content', `Tab: ${[
			'Notifications',
			'Style Cascading',
			'Interactive Demo'
		][$.get(selectedTab)]}`);
	});

	$.event('focus', box_3, () => $.get(tab1Style).setFocused(true));
	$.event('blur', box_3, () => $.get(tab1Style).setFocused(false));
	$.event('focus', box_4, () => $.get(tab2Style).setFocused(true));
	$.event('blur', box_4, () => $.get(tab2Style).setFocused(false));
	$.event('focus', box_5, () => $.get(tab3Style).setFocused(true));
	$.event('blur', box_5, () => $.get(tab3Style).setFocused(false));
	$.append($$anchor, box);
	return $.pop({ ...$.legacy_api() });
}

$.delegate(['click', 'mouseover', 'mouseout']);