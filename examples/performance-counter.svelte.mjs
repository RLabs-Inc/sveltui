import 'svelte/internal/disclose-version';

Performance_counter[$.FILENAME] = 'examples/performance-counter.svelte';

import * as $ from 'svelte/internal/client';

var on_keydown = (
	key,
	trackKeyTime,
	increment,
	decrement,
	count,
	responseTime
) => {
	trackKeyTime();

	if ($.strict_equals(key, '+')) increment(); else if ($.strict_equals(key, '-')) decrement(); else if ($.strict_equals(key, 'r')) {
		$.set(count, 0);
		$.set(responseTime, 0);
	} else if ($.strict_equals(key, 'q')) process.exit(0);
};

var root = $.add_locations($.template(`<box width="100%" height="100%" label=" High-Performance Counter "><text left="center" content="Performance-Optimized Counter Demo"></text> <box left="center" label=" Live Counter "><text left="center"></text> <text left="center"></text> <text left="center"></text></box> <box left="center" label=" Instructions "><text content="+ = increment | - = decrement | r = reset | q = quit"></text> <text content="Test: Press +/- rapidly to measure response time"></text></box></box>`), Performance_counter[$.FILENAME], [
	[
		30,
		0,
		[
			[47, 2],
			[
				54,
				2,
				[[63, 4], [70, 4], [77, 4]]
			],
			[85, 2, [[94, 4], [100, 4]]]
		]
	]
]);

export default function Performance_counter($$anchor, $$props) {
	$.check_target(new.target);
	$.push($$props, true, Performance_counter);

	// High-performance reactive state
	let count = $.state(0);
	let lastKeyTime = $.state(0);
	let responseTime = $.state(0);
	// Derived values
	let doubled = $.derived(() => $.get(count) * 2);
	let message = $.derived(() => `Count: ${$.get(count)} | Doubled: ${$.get(doubled)}`);
	let color = $.derived(() => $.strict_equals($.get(count) % 2, 0) ? 'green' : 'yellow');

	// Performance tracking
	function increment() {
		const now = performance.now();

		$.update(count);
		$.set(responseTime, now - $.get(lastKeyTime));
	}

	function decrement() {
		const now = performance.now();

		$.update(count, -1);
		$.set(responseTime, now - $.get(lastKeyTime));
	}

	function trackKeyTime() {
		$.set(lastKeyTime, performance.now(), true);
	}

	var box = root();

	$.set_attribute(box, 'top', 0);
	$.set_attribute(box, 'left', 0);
	$.set_attribute(box, 'border', { type: 'line' });
	$.set_style(box, { border: { fg: 'cyan' } });
	$.set_attribute(box, 'focused', true);

	box.__keydown = [
		on_keydown,
		trackKeyTime,
		increment,
		decrement,
		count,
		responseTime
	];

	var text = $.child(box);

	$.set_attribute(text, 'top', 2);
	$.set_style(text, { fg: 'white', bold: true });

	var box_1 = $.sibling(text, 2);

	$.set_attribute(box_1, 'top', 5);
	$.set_attribute(box_1, 'width', 50);
	$.set_attribute(box_1, 'height', 8);
	$.set_attribute(box_1, 'border', { type: 'line' });

	var text_1 = $.child(box_1);

	$.set_attribute(text_1, 'top', 1);

	var text_2 = $.sibling(text_1, 2);

	$.set_attribute(text_2, 'top', 3);

	var text_3 = $.sibling(text_2, 2);

	$.set_attribute(text_3, 'top', 5);
	$.set_attribute(text_3, 'content', `Target: < 16ms (60fps)`);
	$.set_style(text_3, { fg: 'gray' });
	$.reset(box_1);

	var box_2 = $.sibling(box_1, 2);

	$.set_attribute(box_2, 'bottom', 5);
	$.set_attribute(box_2, 'width', 60);
	$.set_attribute(box_2, 'height', 4);
	$.set_attribute(box_2, 'border', { type: 'line' });
	$.set_style(box_2, { border: { fg: 'blue' } });

	var text_4 = $.child(box_2);

	$.set_attribute(text_4, 'top', 0);
	$.set_attribute(text_4, 'left', 2);
	$.set_style(text_4, { fg: 'white' });

	var text_5 = $.sibling(text_4, 2);

	$.set_attribute(text_5, 'top', 1);
	$.set_attribute(text_5, 'left', 2);
	$.set_style(text_5, { fg: 'yellow' });
	$.reset(box_2);
	$.reset(box);

	$.template_effect(
		($0) => {
			$.set_style(box_1, { border: { fg: $.get(color) } });
			$.set_attribute(text_1, 'content', $.get(message));
			$.set_style(text_1, { fg: $.get(color), bold: true });
			$.set_attribute(text_2, 'content', $0);

			$.set_style(text_2, {
				fg: $.get(responseTime) > 50 ? 'red' : $.get(responseTime) > 20 ? 'yellow' : 'green'
			});
		},
		[
			() => `Response Time: ${$.get(responseTime).toFixed(1)}ms`
		]
	);

	$.append($$anchor, box);
	return $.pop({ ...$.legacy_api() });
}

$.delegate(['keydown']);