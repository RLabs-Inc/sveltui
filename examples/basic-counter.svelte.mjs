import 'svelte/internal/disclose-version';

Basic_counter[$.FILENAME] = 'examples/basic-counter.svelte';

import * as $ from 'svelte/internal/client';
import { onMount } from 'svelte';

var on_keydown = (key, increment, decrement) => {
	if ($.strict_equals(key, '+')) increment(); else if ($.strict_equals(key, '-')) decrement(); else if ($.strict_equals(key, 'q')) process.exit(0);
};

var root = $.add_locations($.template(`<box width="100%" height="100%" label=" Reactive Terminal Demo "><text left="center" content="SvelTUI Fine-Grained Reactivity Bridge"></text> <box label=" Counter "><text left="center"></text></box> <text left="center" content="Press +/- to change counter | q to quit"></text> <text></text></box>`), Basic_counter[$.FILENAME], [
	[
		41,
		0,
		[
			[57, 2],
			[65, 2, [[74, 4]]],
			[83, 2],
			[91, 2]
		]
	]
]);

export default function Basic_counter($$anchor, $$props) {
	$.check_target(new.target);
	$.push($$props, true, Basic_counter);

	// Reactive state using Svelte 5 runes
	let count = $.state(0);
	let color = $.state('green');
	let position = $.proxy({ top: 2, left: 2 });
	// Derived values (computed from state)
	let doubled = $.derived(() => $.get(count) * 2);
	let message = $.derived(() => `Count: ${$.get(count)} | Doubled: ${$.get(doubled)}`);
	let borderColor = $.derived(() => $.get(count) > 5 ? 'red' : 'green');

	// Update functions that modify state
	function increment() {
		$.update(count);
		// Change color based on count
		$.set(color, $.strict_equals($.get(count) % 2, 0) ? 'green' : 'yellow', true);
	}

	function decrement() {
		$.update(count, -1);
		$.set(color, $.strict_equals($.get(count) % 2, 0) ? 'green' : 'yellow', true);
	}

	function moveBox() {
		position.left = position.left >= 20 ? 2 : position.left + 2;
	}

	// Auto-increment every second
	onMount(() => {
		const interval = setInterval(
			() => {
				increment();
				moveBox();
			},
			1000
		);

		return () => clearInterval(interval);
	});

	var box = root();

	$.set_attribute(box, 'top', 0);
	$.set_attribute(box, 'left', 0);
	$.set_attribute(box, 'border', { type: 'line' });
	$.set_style(box, { border: { fg: 'cyan' } });
	$.set_attribute(box, 'focused', true);
	box.__keydown = [on_keydown, increment, decrement];

	var text = $.child(box);

	$.set_attribute(text, 'top', 0);
	$.set_style(text, { fg: 'white', bold: true });

	var box_1 = $.sibling(text, 2);

	$.set_attribute(box_1, 'width', 30);
	$.set_attribute(box_1, 'height', 5);
	$.set_attribute(box_1, 'border', { type: 'line' });

	var text_1 = $.child(box_1);

	$.set_attribute(text_1, 'top', 1);
	$.reset(box_1);

	var text_2 = $.sibling(box_1, 2);

	$.set_attribute(text_2, 'bottom', 2);
	$.set_style(text_2, { fg: 'gray' });

	var text_3 = $.sibling(text_2, 2);

	$.set_attribute(text_3, 'bottom', 0);
	$.set_attribute(text_3, 'left', 2);
	$.reset(box);

	$.template_effect(() => {
		$.set_attribute(box_1, 'top', position.top);
		$.set_attribute(box_1, 'left', position.left);
		$.set_style(box_1, { border: { fg: $.get(borderColor) } });
		$.set_attribute(text_1, 'content', $.get(message));
		$.set_style(text_1, { fg: $.get(color) });
		$.set_attribute(text_3, 'content', `Status: ${$.get(count) > 5 ? 'High' : 'Normal'}`);
		$.set_style(text_3, { fg: $.get(count) > 5 ? 'red' : 'green' });
	});

	$.append($$anchor, box);
	return $.pop({ ...$.legacy_api() });
}

$.delegate(['keydown']);