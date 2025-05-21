import 'svelte/internal/disclose-version';

SimpleApp[$.FILENAME] = 'examples/basic/SimpleApp.svelte';

import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';

// Function to increment the count
function increment(_, count) {
	$.update(count);
}

// Function to decrement the count
function decrement(__1, count) {
	if ($.get(count) > 0) {
		$.update(count, -1);
	}
}

var root = $.add_locations(
	$.template(
		`/**
 * Simple SvelTUI Demo
 */ <box border="" label="SvelTUI Simple Demo"><box width="50%" border=""><text></text></box> <box left="center"><box border=""><text content=" + "></text></box> <box border=""><text content=" - "></text></box></box> <text left="center" content="Press Q to exit | Click buttons to change count"></text></box>`,
		1
	),
	SimpleApp[$.FILENAME],
	[
		[
			32,
			0,
			[
				[33, 2, [[34, 4]]],
				[
					37,
					2,
					[
						[38, 4, [[39, 6]]],
						[46, 4, [[47, 6]]]
					]
				],
				[55, 2]
			]
		]
	]
);

export default function SimpleApp($$anchor, $$props) {
	$.check_target(new.target);
	$.push($$props, true, SimpleApp);

	// Count state using Svelte 5 runes
	let count = $.state(0);

	// Add lifecycle method to ensure client-side rendering
	onMount(() => {
		console.log('Component mounted');

		return () => {
			console.log('Component unmounted');
		};
	});

	$.next();

	var fragment = root();
	var box = $.sibling($.first_child(fragment));
	var box_1 = $.child(box);

	$.set_attribute(box_1, 'top', 1);
	$.set_attribute(box_1, 'left', 2);
	$.set_attribute(box_1, 'height', 3);

	var text = $.child(box_1);

	$.reset(box_1);

	var box_2 = $.sibling(box_1, 2);

	$.set_attribute(box_2, 'top', 5);
	$.set_attribute(box_2, 'width', 40);
	$.set_attribute(box_2, 'height', 3);

	var box_3 = $.child(box_2);

	$.set_attribute(box_3, 'left', 0);
	$.set_attribute(box_3, 'width', 15);
	$.set_attribute(box_3, 'height', 3);

	var text_1 = $.child(box_3);

	$.set_style(text_1, { fg: 'white', bg: 'blue' });
	text_1.__click = [increment, count];
	$.reset(box_3);

	var box_4 = $.sibling(box_3, 2);

	$.set_attribute(box_4, 'left', 20);
	$.set_attribute(box_4, 'width', 15);
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
	$.append($$anchor, fragment);
	return $.pop({ ...$.legacy_api() });
}

$.delegate(['click']);