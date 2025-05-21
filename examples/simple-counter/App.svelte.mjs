import 'svelte/internal/disclose-version';

App[$.FILENAME] = 'examples/simple-counter/App.svelte';

import * as $ from 'svelte/internal/client';

// Function to increment the counter
function increment(_, count) {
	$.update(count);
}

// Function to decrement the counter
function decrement(__1, count) {
	if ($.get(count) > 0) {
		$.update(count, -1);
	}
}

var root = $.add_locations($.template(`<box border="" label="SvelTUI Counter Demo" width="100%" height="100%"><box left="center" border=""><text bold=""></text></box> <box left="center"><box border=""><text content=" + "></text></box> <box border=""><text content=" - "></text></box></box> <text left="center" content="Press Q to exit | Click buttons to change count"></text></box>`), App[$.FILENAME], [
	[
		19,
		0,
		[
			[20, 2, [[21, 4]]],
			[
				24,
				2,
				[
					[25, 4, [[26, 6]]],
					[33, 4, [[34, 6]]]
				]
			],
			[42, 2]
		]
	]
]);

export default function App($$anchor, $$props) {
	$.check_target(new.target);
	$.push($$props, true, App);

	// Use Svelte 5 $state for reactivity
	let count = $.state(0);
	var box = root();
	var box_1 = $.child(box);

	$.set_attribute(box_1, 'top', 2);
	$.set_attribute(box_1, 'width', 30);
	$.set_attribute(box_1, 'height', 3);

	var text = $.child(box_1);

	$.reset(box_1);

	var box_2 = $.sibling(box_1, 2);

	$.set_attribute(box_2, 'top', 6);
	$.set_attribute(box_2, 'width', 50);
	$.set_attribute(box_2, 'height', 3);

	var box_3 = $.child(box_2);

	$.set_attribute(box_3, 'left', 0);
	$.set_attribute(box_3, 'width', 20);
	$.set_attribute(box_3, 'height', 3);

	var text_1 = $.child(box_3);

	$.set_style(text_1, { fg: 'white', bg: 'blue' });
	text_1.__click = [increment, count];
	$.reset(box_3);

	var box_4 = $.sibling(box_3, 2);

	$.set_attribute(box_4, 'left', 25);
	$.set_attribute(box_4, 'width', 20);
	$.set_attribute(box_4, 'height', 3);

	var text_2 = $.child(box_4);

	$.set_style(text_2, { fg: 'white', bg: 'red' });
	text_2.__click = [decrement, count];
	$.reset(box_4);
	$.reset(box_2);

	var text_3 = $.sibling(box_2, 2);

	$.set_attribute(text_3, 'bottom', 1);
	$.set_style(text_3, { fg: "gray" });
	$.reset(box);
	$.template_effect(() => $.set_attribute(text, 'content', `Count: ${$.get(count)}`));
	$.append($$anchor, box);
	return $.pop({ ...$.legacy_api() });
}

$.delegate(['click']);