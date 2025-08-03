import 'svelte/internal/disclose-version';

Simple_layout_test[$.FILENAME] = 'examples/simple-layout-test.svelte';

import * as $ from 'svelte/internal/client';

var root = $.add_locations($.template(`<box label="Simple Layout Test" width="100%" height="100%" keys=""><text> </text> <text>Press SPACE to increment, q to quit</text> <box width="50%" label="Responsive Box"><text top="center" left="center">This box is 50% width</text></box> <box top="center" left="center" label="Centered"><text top="center" left="center">Always centered</text></box></box>`), Simple_layout_test[$.FILENAME], [
	[
		12,
		0,
		[
			[23, 2],
			[27, 2],
			[32, 2, [[41, 4]]],
			[47, 2, [[56, 4]]]
		]
	]
]);

export default function Simple_layout_test($$anchor, $$props) {
	$.check_target(new.target);
	$.push($$props, true, Simple_layout_test);

	let count = $.state(0);
	// Simple reactive derived value
	let message = $.derived(() => `Count is ${$.get(count)}`);

	function increment() {
		$.update(count);
	}

	var box = root();

	$.set_attribute(box, 'border', { type: 'line' });
	$.set_style(box, { border: { fg: 'cyan' } });

	var text = $.child(box);

	$.set_attribute(text, 'top', 2);
	$.set_attribute(text, 'left', 2);

	var text_1 = $.child(text, true);

	$.reset(text);

	var text_2 = $.sibling(text, 2);

	$.set_attribute(text_2, 'top', 4);
	$.set_attribute(text_2, 'left', 2);

	var box_1 = $.sibling(text_2, 2);

	$.set_attribute(box_1, 'top', 6);
	$.set_attribute(box_1, 'left', 2);
	$.set_attribute(box_1, 'height', 5);
	$.set_attribute(box_1, 'border', { type: 'line' });
	$.set_style(box_1, { border: { fg: 'green' } });

	var box_2 = $.sibling(box_1, 2);

	$.set_attribute(box_2, 'width', 20);
	$.set_attribute(box_2, 'height', 3);
	$.set_attribute(box_2, 'border', { type: 'line' });
	$.set_style(box_2, { border: { fg: 'yellow' } });
	$.reset(box);
	$.template_effect(() => $.set_text(text_1, $.get(message)));

	$.event('keypress', box, (key) => {
		if ($.strict_equals(key.name, 'space')) increment();
	});

	$.append($$anchor, box);
	return $.pop({ ...$.legacy_api() });
}