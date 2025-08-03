import 'svelte/internal/disclose-version';

Static_test[$.FILENAME] = 'examples/static-test.svelte';

import * as $ from 'svelte/internal/client';
import { Box, Text } from '../src/components/ui/index.ts';

var root_1 = $.add_locations($.template(`<!> <!> <!>`, 1), Static_test[$.FILENAME], []);

export default function Static_test($$anchor, $$props) {
	$.check_target(new.target);
	$.push($$props, true, Static_test);

	Box($$anchor, {
		width: '100%',
		height: '100%',
		border: 'line',
		children: $.wrap_snippet(Static_test, ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			Text(node, {
				left: 1,
				top: 1,
				children: $.wrap_snippet(Static_test, ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Hello from SvelTUI!');

					$.append($$anchor, text);
				}),
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			Text(node_1, {
				left: 1,
				top: 3,
				children: $.wrap_snippet(Static_test, ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('This is a static test.');

					$.append($$anchor, text_1);
				}),
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			Text(node_2, {
				left: 1,
				bottom: 1,
				fg: 'cyan',
				children: $.wrap_snippet(Static_test, ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Press q to quit');

					$.append($$anchor, text_2);
				}),
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		}),
		$$slots: { default: true }
	});

	return $.pop({ ...$.legacy_api() });
}