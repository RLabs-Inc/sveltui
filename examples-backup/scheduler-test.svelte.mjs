import 'svelte/internal/disclose-version';

Scheduler_test[$.FILENAME] = 'examples/scheduler-test.svelte';

import * as $ from 'svelte/internal/client';
import { renderScreen } from '../src/renderer/screen';
// Cleanup
import { onDestroy } from 'svelte';

var root = $.add_locations($.template(`<box width="100%" height="100%" border=""><text top="1" left="center" bold="">Render Scheduler Test</text> <text top="3" left="2"> </text> <text top="4" left="2"> </text> <text top="6" left="2" fg="gray">The scheduler should batch these rapid updates</text> <text top="7" left="2" fg="gray">to prevent excessive terminal redraws.</text></box>`), Scheduler_test[$.FILENAME], [
	[
		22,
		0,
		[
			[23, 2],
			[24, 2],
			[25, 2],
			[26, 2],
			[27, 2]
		]
	]
]);

export default function Scheduler_test($$anchor, $$props) {
	$.check_target(new.target);
	$.push($$props, true, Scheduler_test);

	// Simple counter state
	let count = $.state(0);
	let updateRate = 10; // Updates per second

	// Update counter continuously
	let interval = setInterval(
		() => {
			$.update(count);
			// This will be batched by the scheduler
			renderScreen('normal');
		},
		1000 / updateRate
	);

	onDestroy(() => {
		clearInterval(interval);
	});

	var box = root();
	var text = $.sibling($.child(box), 2);
	var text_1 = $.child(text);

	$.reset(text);

	var text_2 = $.sibling(text, 2);
	var text_3 = $.child(text_2);

	text_3.nodeValue = 'Update Rate: 10/sec';
	$.reset(text_2);
	$.next(4);
	$.reset(box);
	$.template_effect(() => $.set_text(text_1, `Count: ${$.get(count) ?? ''}`));
	$.append($$anchor, box);
	return $.pop({ ...$.legacy_api() });
}