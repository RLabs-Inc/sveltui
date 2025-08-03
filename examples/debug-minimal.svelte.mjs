import 'svelte/internal/disclose-version';

Debug_minimal[$.FILENAME] = 'examples/debug-minimal.svelte';

import * as $ from 'svelte/internal/client';

var root = $.add_locations($.template(`<box width="100%" height="100%" border="line"><text top="1" left="center"> </text> <text top="3" left="center">Press q to quit</text></box>`), Debug_minimal[$.FILENAME], [[5, 0, [[6, 2], [7, 2]]]]);

export default function Debug_minimal($$anchor, $$props) {
	$.check_target(new.target);
	$.push($$props, true, Debug_minimal);

	let count = 0;
	var box = root();
	var text = $.child(box);
	var text_1 = $.child(text);

	text_1.nodeValue = 'Count: 0';
	$.reset(text);
	$.next(2);
	$.reset(box);
	$.append($$anchor, box);
	return $.pop({ ...$.legacy_api() });
}