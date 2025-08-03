import 'svelte/internal/disclose-version';

Style_state_demo[$.FILENAME] = 'examples/style-state-demo.svelte';

import * as $ from 'svelte/internal/client';
import { createStyleState, StyleState } from '../src/dom/style-state.svelte.ts';
import { createStyle, mergeStyles } from '../src/dom/style-utils';

var on_click = (_, handleButtonClick) => handleButtonClick(0);
var on_click_1 = (__1, handleButtonClick) => handleButtonClick(1);

var root = $.add_locations($.template(`<box label="Style State Demo" width="100%" height="100%"><text left="center" content="SvelTUI Style State Machine Demo"></text> <box width="50%" label="Interactive Buttons"><button content="Button 1"></button> <button content="Button 2"></button> <text></text></box> <box width="45%" label="Hover Text"><text content="Hover over me!"></text> <text content="Current style:"></text> <text></text> <text></text></box> <box width="50%" label="Focus Input"><textbox width="90%"></textbox> <text></text></box> <box width="45%" label="Stateful Checkbox"><checkbox text="Enable feature"></checkbox> <text></text></box> <box width="100%"><text left="center" content="Use mouse to hover, click to interact, Tab to focus"></text></box></box>`), Style_state_demo[$.FILENAME], [
	[
		81,
		0,
		[
			[92, 2],
			[
				100,
				2,
				[[101, 4], [119, 4], [137, 4]]
			],
			[
				146,
				2,
				[
					[147, 4],
					[157, 4],
					[164, 4],
					[171, 4]
				]
			],
			[180, 2, [[181, 4], [201, 4]]],
			[210, 2, [[211, 4], [227, 4]]],
			[236, 2, [[237, 4]]]
		]
	]
]);

export default function Style_state_demo($$anchor, $$props) {
	$.check_target(new.target);
	$.push($$props, true, Style_state_demo);

	// Create style states for different components
	const buttonStyle = createStyleState({
		normal: createStyle({
			fg: 'white',
			bg: 'blue',
			border: { fg: 'white', type: 'line' }
		}),
		hover: createStyle({ bg: 'cyan', bold: true }),
		focus: createStyle({ border: { fg: 'yellow' } }),
		pressed: createStyle({ bg: 'magenta', inverse: true })
	});

	const textStyle = createStyleState({
		normal: createStyle({ fg: 'green' }),
		hover: createStyle({ fg: 'brightgreen', underline: true })
	});

	const boxStyle = createStyleState({
		normal: createStyle({ border: { fg: 'gray', type: 'line' } }),
		focus: createStyle({ border: { fg: 'white', type: 'double' } })
	});

	// State for interactive elements
	let selectedButton = $.state(0);
	let inputValue = $.state('');
	let checkboxChecked = $.state(false);

	// Handle button clicks
	function handleButtonClick(index) {
		$.set(selectedButton, index, true);
	}

	// Handle focus changes
	function handleFocus(styleState) {
		return () => styleState.setFocused(true);
	}

	function handleBlur(styleState) {
		return () => styleState.setFocused(false);
	}

	// Handle mouse events
	function handleMouseOver(styleState) {
		return () => styleState.setHovered(true);
	}

	function handleMouseOut(styleState) {
		return () => styleState.setHovered(false);
	}

	function handleMouseDown(styleState) {
		return () => styleState.setPressed(true);
	}

	function handleMouseUp(styleState) {
		return () => styleState.setPressed(false);
	}

	var box = root();
	var event_handler = $.derived(() => handleFocus(boxStyle));
	var event_handler_1 = $.derived(() => handleBlur(boxStyle));

	$.set_attribute(box, 'keys', true);
	$.set_attribute(box, 'mouse', true);

	var text = $.child(box);

	$.set_attribute(text, 'top', 0);
	$.set_style(text, { fg: 'yellow', bold: true });

	var box_1 = $.sibling(text, 2);

	$.set_attribute(box_1, 'top', 2);
	$.set_attribute(box_1, 'left', 2);
	$.set_attribute(box_1, 'height', 10);

	var button = $.child(box_1);

	$.set_attribute(button, 'top', 1);
	$.set_attribute(button, 'left', 1);
	$.set_attribute(button, 'width', 20);
	$.set_attribute(button, 'height', 3);

	var event_handler_2 = $.derived(() => handleMouseOver(buttonStyle));

	button.__mouseover = function (...$$args) {
		$.apply(() => $.get(event_handler_2), this, $$args, Style_state_demo, [108, 19], true);
	};

	var event_handler_3 = $.derived(() => handleMouseOut(buttonStyle));

	button.__mouseout = function (...$$args) {
		$.apply(() => $.get(event_handler_3), this, $$args, Style_state_demo, [109, 18], true);
	};

	var event_handler_4 = $.derived(() => handleMouseDown(buttonStyle));

	button.__mousedown = function (...$$args) {
		$.apply(() => $.get(event_handler_4), this, $$args, Style_state_demo, [110, 19], true);
	};

	var event_handler_5 = $.derived(() => handleMouseUp(buttonStyle));

	button.__mouseup = function (...$$args) {
		$.apply(() => $.get(event_handler_5), this, $$args, Style_state_demo, [111, 17], true);
	};

	var event_handler_6 = $.derived(() => handleFocus(buttonStyle));
	var event_handler_7 = $.derived(() => handleBlur(buttonStyle));

	button.__click = [on_click, handleButtonClick];
	$.set_attribute(button, 'mouse', true);
	$.set_attribute(button, 'keys', true);

	var button_1 = $.sibling(button, 2);

	$.set_attribute(button_1, 'top', 4);
	$.set_attribute(button_1, 'left', 1);
	$.set_attribute(button_1, 'width', 20);
	$.set_attribute(button_1, 'height', 3);

	var event_handler_8 = $.derived(() => handleMouseOver(buttonStyle));

	button_1.__mouseover = function (...$$args) {
		$.apply(() => $.get(event_handler_8), this, $$args, Style_state_demo, [126, 19], true);
	};

	var event_handler_9 = $.derived(() => handleMouseOut(buttonStyle));

	button_1.__mouseout = function (...$$args) {
		$.apply(() => $.get(event_handler_9), this, $$args, Style_state_demo, [127, 18], true);
	};

	var event_handler_10 = $.derived(() => handleMouseDown(buttonStyle));

	button_1.__mousedown = function (...$$args) {
		$.apply(() => $.get(event_handler_10), this, $$args, Style_state_demo, [128, 19], true);
	};

	var event_handler_11 = $.derived(() => handleMouseUp(buttonStyle));

	button_1.__mouseup = function (...$$args) {
		$.apply(() => $.get(event_handler_11), this, $$args, Style_state_demo, [129, 17], true);
	};

	var event_handler_12 = $.derived(() => handleFocus(buttonStyle));
	var event_handler_13 = $.derived(() => handleBlur(buttonStyle));

	button_1.__click = [on_click_1, handleButtonClick];
	$.set_attribute(button_1, 'mouse', true);
	$.set_attribute(button_1, 'keys', true);

	var text_1 = $.sibling(button_1, 2);

	$.set_attribute(text_1, 'top', 7);
	$.set_attribute(text_1, 'left', 1);
	$.set_style(text_1, { fg: 'cyan' });
	$.reset(box_1);

	var box_2 = $.sibling(box_1, 2);

	$.set_attribute(box_2, 'top', 2);
	$.set_attribute(box_2, 'right', 2);
	$.set_attribute(box_2, 'height', 10);

	var text_2 = $.child(box_2);

	$.set_attribute(text_2, 'top', 1);
	$.set_attribute(text_2, 'left', 1);

	var event_handler_14 = $.derived(() => handleMouseOver(textStyle));

	text_2.__mouseover = function (...$$args) {
		$.apply(() => $.get(event_handler_14), this, $$args, Style_state_demo, [152, 19], true);
	};

	var event_handler_15 = $.derived(() => handleMouseOut(textStyle));

	text_2.__mouseout = function (...$$args) {
		$.apply(() => $.get(event_handler_15), this, $$args, Style_state_demo, [153, 18], true);
	};

	$.set_attribute(text_2, 'mouse', true);

	var text_3 = $.sibling(text_2, 2);

	$.set_attribute(text_3, 'top', 3);
	$.set_attribute(text_3, 'left', 1);
	$.set_style(text_3, { fg: 'gray' });

	var text_4 = $.sibling(text_3, 2);

	$.set_attribute(text_4, 'top', 4);
	$.set_attribute(text_4, 'left', 1);
	$.set_style(text_4, { fg: 'white' });

	var text_5 = $.sibling(text_4, 2);

	$.set_attribute(text_5, 'top', 5);
	$.set_attribute(text_5, 'left', 1);
	$.set_style(text_5, { fg: 'white' });
	$.reset(box_2);

	var box_3 = $.sibling(box_2, 2);

	$.set_attribute(box_3, 'top', 13);
	$.set_attribute(box_3, 'left', 2);
	$.set_attribute(box_3, 'height', 8);

	var textbox = $.child(box_3);

	$.set_attribute(textbox, 'top', 1);
	$.set_attribute(textbox, 'left', 1);
	$.set_attribute(textbox, 'height', 3);

	$.set_style(textbox, {
		fg: 'white',
		bg: 'black',
		focus: { bg: 'blue', fg: 'white' }
	});

	$.set_attribute(textbox, 'keys', true);
	$.set_attribute(textbox, 'mouse', true);
	$.set_attribute(textbox, 'inputonfocus', true);

	var text_6 = $.sibling(textbox, 2);

	$.set_attribute(text_6, 'top', 4);
	$.set_attribute(text_6, 'left', 1);
	$.set_style(text_6, { fg: 'yellow' });
	$.reset(box_3);

	var box_4 = $.sibling(box_3, 2);

	$.set_attribute(box_4, 'top', 13);
	$.set_attribute(box_4, 'right', 2);
	$.set_attribute(box_4, 'height', 8);

	var checkbox = $.child(box_4);

	$.set_attribute(checkbox, 'top', 1);
	$.set_attribute(checkbox, 'left', 1);
	$.set_style(checkbox, { fg: 'white', focus: { fg: 'cyan' } });
	$.set_attribute(checkbox, 'mouse', true);
	$.set_attribute(checkbox, 'keys', true);

	var text_7 = $.sibling(checkbox, 2);

	$.set_attribute(text_7, 'top', 3);
	$.set_attribute(text_7, 'left', 1);
	$.reset(box_4);

	var box_5 = $.sibling(box_4, 2);

	$.set_attribute(box_5, 'bottom', 0);
	$.set_attribute(box_5, 'height', 3);
	$.set_style(box_5, { border: { fg: 'gray' } });

	var text_8 = $.child(box_5);

	$.set_attribute(text_8, 'top', 0);
	$.set_style(text_8, { fg: 'gray' });
	$.reset(box_5);
	$.reset(box);

	$.template_effect(() => {
		$.set_style(box, boxStyle.blessedStyle);
		$.set_style(button, buttonStyle.blessedStyle);
		$.set_style(button_1, buttonStyle.blessedStyle);
		$.set_attribute(text_1, 'content', `Selected: Button ${$.get(selectedButton) + 1}`);
		$.set_style(text_2, textStyle.blessedStyle);
		$.set_attribute(text_4, 'content', `fg: ${textStyle.currentStyle.fg || 'default'}`);
		$.set_attribute(text_5, 'content', `underline: ${textStyle.currentStyle.underline || false}`);
		$.set_value(textbox, $.get(inputValue));
		$.set_attribute(text_6, 'content', `Value: ${$.get(inputValue) || '(empty)'}`);
		$.set_checked(checkbox, $.get(checkboxChecked));
		$.set_attribute(text_7, 'content', `Status: ${$.get(checkboxChecked) ? 'Enabled' : 'Disabled'}`);

		$.set_style(text_7, {
			fg: $.get(checkboxChecked) ? 'green' : 'red'
		});
	});

	$.event('focus', box, function (...$$args) {
		$.apply(() => $.get(event_handler), this, $$args, Style_state_demo, [86, 11], true);
	});

	$.event('blur', box, function (...$$args) {
		$.apply(() => $.get(event_handler_1), this, $$args, Style_state_demo, [87, 10], true);
	});

	$.event('focus', button, function (...$$args) {
		$.apply(() => $.get(event_handler_6), this, $$args, Style_state_demo, [112, 15], true);
	});

	$.event('blur', button, function (...$$args) {
		$.apply(() => $.get(event_handler_7), this, $$args, Style_state_demo, [113, 14], true);
	});

	$.event('focus', button_1, function (...$$args) {
		$.apply(() => $.get(event_handler_12), this, $$args, Style_state_demo, [130, 15], true);
	});

	$.event('blur', button_1, function (...$$args) {
		$.apply(() => $.get(event_handler_13), this, $$args, Style_state_demo, [131, 14], true);
	});

	$.event('submit', textbox, (value) => $.set(inputValue, value, true));
	$.event('check', checkbox, () => $.set(checkboxChecked, !$.get(checkboxChecked)));
	$.append($$anchor, box);
	return $.pop({ ...$.legacy_api() });
}

$.delegate([
	'mouseover',
	'mouseout',
	'mousedown',
	'mouseup',
	'click'
]);