import 'svelte/internal/disclose-version';

Manual_counter[$.FILENAME] = 'examples/manual-counter.svelte';

import * as $ from 'svelte/internal/client';

var on_keydown = (key, increment, decrement, reset) => {
	if ($.strict_equals(key, '+')) increment(); else if ($.strict_equals(key, '-')) decrement(); else if ($.strict_equals(key, 'r')) reset(); else if ($.strict_equals(key, 'q')) process.exit(0);
};

var root = $.add_locations($.template(`<box width="100%" height="100%" label=" Manual Counter Control "><text left="center" content="SvelTUI Manual Counter Demo"></text> <box left="center" label=" Counter Display "><text left="center"></text> <text left="center"></text> <text left="center"></text></box> <box left="center" label=" Instructions "><text content="Press + to increment (→ yellow on odd)"></text> <text content="Press - to decrement (→ green on even)"></text> <text content="Press r to reset | Press q to quit"></text></box> <text></text> <text content="Even=Green, Odd=Yellow"></text></box>`), Manual_counter[$.FILENAME], [
	[
		30,
		0,
		[
			[47, 2],
			[
				55,
				2,
				[[64, 4], [71, 4], [78, 4]]
			],
			[
				87,
				2,
				[[96, 4], [102, 4], [108, 4]]
			],
			[117, 2],
			[125, 2]
		]
	]
]);

export default function Manual_counter($$anchor, $$props) {
	$.check_target(new.target);
	$.push($$props, true, Manual_counter);

	// Reactive state using Svelte 5 runes
	let count = $.state(0);
	let color = $.state('green');
	// Derived values
	let doubled = $.derived(() => $.get(count) * 2);
	let message = $.derived(() => `Count: ${$.get(count)} | Doubled: ${$.get(doubled)}`);
	let borderColor = $.derived(() => $.get(count) > 5 ? 'red' : 'green');
	let statusColor = $.derived(() => $.get(count) > 10 ? 'red' : $.get(count) > 5 ? 'yellow' : 'green');

	// Update functions
	function increment() {
		$.update(count);
		// Change color based on even/odd
		$.set(color, $.strict_equals($.get(count) % 2, 0) ? 'green' : 'yellow', true);
	}

	function decrement() {
		$.update(count, -1);
		$.set(color, $.strict_equals($.get(count) % 2, 0) ? 'green' : 'yellow', true);
	}

	function reset() {
		$.set(count, 0);
		$.set(color, 'green');
	}

	var box = root();

	$.set_attribute(box, 'top', 0);
	$.set_attribute(box, 'left', 0);
	$.set_attribute(box, 'border', { type: 'line' });
	$.set_style(box, { border: { fg: 'cyan' } });
	$.set_attribute(box, 'focused', true);
	box.__keydown = [on_keydown, increment, decrement, reset];

	var text = $.child(box);

	$.set_attribute(text, 'top', 1);
	$.set_style(text, { fg: 'white', bold: true });

	var box_1 = $.sibling(text, 2);

	$.set_attribute(box_1, 'top', 4);
	$.set_attribute(box_1, 'width', 40);
	$.set_attribute(box_1, 'height', 7);
	$.set_attribute(box_1, 'border', { type: 'line' });

	var text_1 = $.child(box_1);

	$.set_attribute(text_1, 'top', 1);

	var text_2 = $.sibling(text_1, 2);

	$.set_attribute(text_2, 'top', 3);
	$.set_style(text_2, { fg: 'gray' });

	var text_3 = $.sibling(text_2, 2);

	$.set_attribute(text_3, 'top', 4);
	$.set_style(text_3, { fg: 'gray' });
	$.reset(box_1);

	var box_2 = $.sibling(box_1, 2);

	$.set_attribute(box_2, 'bottom', 6);
	$.set_attribute(box_2, 'width', 50);
	$.set_attribute(box_2, 'height', 5);
	$.set_attribute(box_2, 'border', { type: 'line' });
	$.set_style(box_2, { border: { fg: 'blue' } });

	var text_4 = $.child(box_2);

	$.set_attribute(text_4, 'top', 0);
	$.set_attribute(text_4, 'left', 2);
	$.set_style(text_4, { fg: 'white' });

	var text_5 = $.sibling(text_4, 2);

	$.set_attribute(text_5, 'top', 1);
	$.set_attribute(text_5, 'left', 2);
	$.set_style(text_5, { fg: 'white' });

	var text_6 = $.sibling(text_5, 2);

	$.set_attribute(text_6, 'top', 2);
	$.set_attribute(text_6, 'left', 2);
	$.set_style(text_6, { fg: 'white' });
	$.reset(box_2);

	var text_7 = $.sibling(box_2, 2);

	$.set_attribute(text_7, 'bottom', 1);
	$.set_attribute(text_7, 'left', 2);

	var text_8 = $.sibling(text_7, 2);

	$.set_attribute(text_8, 'bottom', 1);
	$.set_attribute(text_8, 'right', 2);
	$.set_style(text_8, { fg: 'gray' });
	$.reset(box);

	$.template_effect(() => {
		$.set_style(box_1, { border: { fg: $.get(borderColor) } });
		$.set_attribute(text_1, 'content', $.get(message));
		$.set_style(text_1, { fg: $.get(color), bold: true });
		$.set_attribute(text_2, 'content', `Text color: ${$.get(color)}`);
		$.set_attribute(text_3, 'content', `Border color: ${$.get(borderColor)}`);
		$.set_attribute(text_7, 'content', `Status: ${$.get(count) > 10 ? 'Very High!' : $.get(count) > 5 ? 'High' : 'Normal'}`);

		$.set_style(text_7, {
			fg: $.get(statusColor),
			bold: $.get(count) > 10
		});
	});

	$.append($$anchor, box);
	return $.pop({ ...$.legacy_api() });
}

$.delegate(['keydown']);