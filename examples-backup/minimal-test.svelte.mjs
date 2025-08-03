import 'svelte/internal/disclose-version';

Minimal_test[$.FILENAME] = 'examples/minimal-test.svelte';

import * as $ from 'svelte/internal/client';

var root = $.add_locations($.template(`<box top="0" left="0" width="100%" height="100%" label=" Test "><text top="1" left="1">Hello World!</text></box>`), Minimal_test[$.FILENAME], [[1, 0, [[9, 2]]]]);

export default function Minimal_test($$anchor, $$props) {
	$.check_target(new.target);
	$.push($$props, true, Minimal_test);

	var box = root();

	$.set_attribute(box, 'border', { type: 'line' });
	$.append($$anchor, box);
	return $.pop({ ...$.legacy_api() });
}