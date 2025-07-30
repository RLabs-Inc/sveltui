import 'svelte/internal/disclose-version';

Basic_test[$.FILENAME] = 'examples/basic-test.svelte';

import * as $ from 'svelte/internal/client';
import Box from '../src/components/ui/Box.svelte.mjs';
import Text from '../src/components/ui/Text.svelte.mjs';

var root_1 = $.add_locations($.template(`<!> <!> <!>`, 1), Basic_test[$.FILENAME], []);

export default function Basic_test($$anchor, $$props) {
	$.check_target(new.target);
	$.push($$props, true, Basic_test);

	let title = $.prop($$props, 'title', 3, 'Basic Test');

	Box($$anchor, {
		border: true,
		width: '50%',
		height: '50%',
		get label() {
			return title();
		},
		children: $.wrap_snippet(Basic_test, ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			Text(node, {
				bold: true,
				fg: 'green',
				content: '✓ SvelTUI is working!'
			});

			var node_1 = $.sibling(node, 2);

			Text(node_1, {
				fg: 'cyan',
				content: 'This is a simple Box with Text component.'
			});

			var node_2 = $.sibling(node_1, 2);

			Text(node_2, {
				fg: 'yellow',
				content: 'If you can see this, the basic components are rendering correctly.'
			});

			$.append($$anchor, fragment_1);
		}),
		$$slots: { default: true }
	});

	return $.pop({ ...$.legacy_api() });
}