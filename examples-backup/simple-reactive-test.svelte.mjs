import 'svelte/internal/disclose-version';

Simple_reactive_test[$.FILENAME] = 'examples/simple-reactive-test.svelte';

import * as $ from 'svelte/internal/client';

var root = $.add_locations($.template(`<box width="100%" height="100%"><text left="center"></text></box>`), Simple_reactive_test[$.FILENAME], [[18, 0, [[24, 2]]]]);

export default function Simple_reactive_test($$anchor, $$props) {
	$.check_target(new.target);
	$.push($$props, true, Simple_reactive_test);

	// Simple test without onMount to avoid the effect_orphan error
	let count = $.state(0);
	let message = $.derived(() => `Count: ${$.get(count)}`);

	// Increment every second using setTimeout instead of onMount
	function startTimer() {
		setTimeout(
			() => {
				$.update(count);
				if ($.get(count) < 10) startTimer();
			},
			1000
		);
	}

	// Start the timer immediately
	startTimer();

	var box = root();

	$.set_attribute(box, 'border', { type: 'line' });
	$.set_style(box, { border: { fg: 'cyan' } });

	var text = $.child(box);

	$.set_attribute(text, 'top', 1);
	$.set_style(text, { fg: 'yellow' });
	$.reset(box);
	$.template_effect(() => $.set_attribute(text, 'content', $.get(message)));
	$.append($$anchor, box);
	return $.pop({ ...$.legacy_api() });
}