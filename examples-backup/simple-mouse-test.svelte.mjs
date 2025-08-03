import 'svelte/internal/disclose-version';

Simple_mouse_test[$.FILENAME] = 'examples/simple-mouse-test.svelte';

import * as $ from 'svelte/internal/client';
import { mouseState, isMouseOver } from '../src/input/simple-mouse-state';

var root = $.add_locations($.template(`<box width="100%" height="100%" border="line" label=" Simple Mouse Test "><text top="1" left="2"> </text> <text top="2" left="2"> </text> <text top="4" left="2">Move your mouse to see coordinates update!</text></box>`), Simple_mouse_test[$.FILENAME], [
	[
		26,
		0,
		[[27, 2], [28, 2], [29, 2]]
	]
]);

export default function Simple_mouse_test($$anchor, $$props) {
	$.check_target(new.target);
	$.push($$props, true, Simple_mouse_test);

	// Simple reactive state
	let mouseX = $.state(0);
	let mouseY = $.state(0);
	let updateTicks = $.state(0);

	$.user_effect(() => {
		const unsubscribe = mouseState.subscribe(() => {
			$.update(updateTicks);
		});

		return unsubscribe;
	});

	$.user_effect(() => {
		$.get(updateTicks); // Create dependency

		const pos = mouseState.getPosition();

		$.set(mouseX, pos.x, true);
		$.set(mouseY, pos.y, true);
	});

	var box = root();
	var text = $.child(box);
	var text_1 = $.child(text);

	$.reset(text);

	var text_2 = $.sibling(text, 2);
	var text_3 = $.child(text_2);

	$.reset(text_2);
	$.next(2);
	$.reset(box);

	$.template_effect(() => {
		$.set_text(text_1, `Mouse Position: (${$.get(mouseX) ?? ''}, ${$.get(mouseY) ?? ''})`);
		$.set_text(text_3, `Updates: ${$.get(updateTicks) ?? ''}`);
	});

	$.append($$anchor, box);
	return $.pop({ ...$.legacy_api() });
}