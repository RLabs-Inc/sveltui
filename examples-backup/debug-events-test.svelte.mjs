import 'svelte/internal/disclose-version';

Debug_events_test[$.FILENAME] = 'examples/debug-events-test.svelte';

import * as $ from 'svelte/internal/client';

var root = $.add_locations($.template(`<box top="center" left="center" width="50%" height="10" label=" Debug Test "><text top="1" left="center"> </text> <button top="3" left="center" width="20" height="3">Increment</button></box>`), Debug_events_test[$.FILENAME], [[9, 0, [[17, 2], [19, 2]]]]);

export default function Debug_events_test($$anchor, $$props) {
	$.check_target(new.target);
	$.push($$props, true, Debug_events_test);

	let count = $.state(0);

	function increment() {
		$.update(count);
	}

	var box = root();

	$.set_attribute(box, 'border', { type: 'line' });

	var text = $.child(box);
	var text_1 = $.child(text);

	$.reset(text);

	var button = $.sibling(text, 2);

	$.set_attribute(button, 'border', { type: 'line' });
	$.reset(box);
	$.template_effect(() => $.set_text(text_1, `Count: ${$.get(count) ?? ''}`));
	$.event('press', button, increment);
	$.append($$anchor, box);
	return $.pop({ ...$.legacy_api() });
}