import 'svelte/internal/disclose-version';

Simple_text_test[$.FILENAME] = 'examples/simple-text-test.svelte';

import * as $ from 'svelte/internal/client';
import Box from '../src/components/ui/Box.svelte.mjs';
import Text from '../src/components/ui/Text.svelte.mjs';

var root_1 = $.add_locations($.template(`<!> <!>`, 1), Simple_text_test[$.FILENAME], []);

export default function Simple_text_test($$anchor, $$props) {
	$.check_target(new.target);
	$.push($$props, true, Simple_text_test);

	Box($$anchor, {
		border: true,
		width: '50%',
		height: '10',
		label: 'Simple Text Test',
		children: $.wrap_snippet(Simple_text_test, ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			Text(node, { content: 'Direct content test', fg: 'green' });

			var node_1 = $.sibling(node, 2);

			Text(node_1, {
				fg: 'cyan',
				children: $.wrap_snippet(Simple_text_test, ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Child content test');

					$.append($$anchor, text);
				}),
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		}),
		$$slots: { default: true }
	});

	return $.pop({ ...$.legacy_api() });
}