import 'svelte/internal/disclose-version';

Basic_test[$.FILENAME] = 'examples/basic-test.svelte';

import * as $ from 'svelte/internal/client';

var root = $.add_locations($.template(`<box width="100%" height="100%"><text left="center" content="Hello from SvelTUI!"></text></box>`), Basic_test[$.FILENAME], [[5, 0, [[11, 2]]]]);

export default function Basic_test($$anchor, $$props) {
	$.check_target(new.target);
	$.push($$props, true, Basic_test);

	var box = root();

	$.set_attribute(box, 'border', { type: 'line' });
	$.set_style(box, { border: { fg: 'cyan' } });

	var text = $.child(box);

	$.set_attribute(text, 'top', 1);
	$.set_style(text, { fg: 'yellow' });
	$.reset(box);
	$.append($$anchor, box);
	return $.pop({ ...$.legacy_api() });
}