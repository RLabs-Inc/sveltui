import 'svelte/internal/disclose-version';

Simple_events_test[$.FILENAME] = 'examples/simple-events-test.svelte';

import * as $ from 'svelte/internal/client';
import { globalEventBus } from '../src/dom/reactive-events.svelte.ts';

var root = $.add_locations($.template(`<box top="center" left="center" width="50%" height="10" label=" Simple Events Test "><text top="1" left="center"> </text> <button top="3" left="center" width="20" height="3">Click Me!</button></box>`), Simple_events_test[$.FILENAME], [[19, 0, [[27, 2], [29, 2]]]]);

export default function Simple_events_test($$anchor, $$props) {
	$.check_target(new.target);
	$.push($$props, true, Simple_events_test);

	// Simple reactive state tracking
	let clickCount = $.state(0);
	let message = $.state('Click the button!');

	// Subscribe to global events
	globalEventBus.on('click', () => {
		$.update(clickCount);
		$.set(message, `Button clicked ${$.get(clickCount)} times`);
	});

	function handleClick() {
		globalEventBus.emit('click', { source: 'button' });
	}

	var box = root();

	$.set_attribute(box, 'border', { type: 'line' });

	var text = $.child(box);
	var text_1 = $.child(text, true);

	$.reset(text);

	var button = $.sibling(text, 2);

	$.set_attribute(button, 'border', { type: 'line' });
	$.reset(box);
	$.template_effect(() => $.set_text(text_1, $.get(message)));
	$.event('press', button, handleClick);
	$.append($$anchor, box);
	return $.pop({ ...$.legacy_api() });
}