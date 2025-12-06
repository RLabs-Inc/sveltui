import 'svelte/internal/disclose-version';

SimpleLayoutTest[$.FILENAME] = 'src/test/SimpleLayoutTest.svelte';

import * as $ from 'svelte/internal/client';
import Box from '../components/Box.svelte.mjs';
import Text from '../components/Text.svelte.mjs';

var root_1 = $.add_locations($.from_html(`<!> <!>`, 1), SimpleLayoutTest[$.FILENAME], []);

export default function SimpleLayoutTest($$anchor, $$props) {
	$.check_target(new.target);
	$.push($$props, true, SimpleLayoutTest);

	var $$exports = { ...$.legacy_api() };

	$.add_svelte_meta(
		() => Box($$anchor, {
			width: '100%',
			height: '100%',
			border: 'single',
			variant: 'primary',
			padding: 1,
			flexDirection: 'column',
			alignItems: 'center',
			justifyContent: 'center',

			children: $.wrap_snippet(SimpleLayoutTest, ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node = $.first_child(fragment_1);

				$.add_svelte_meta(
					() => Box(node, {
						border: 'double',
						variant: 'primary',
						alignItems: 'center',
						justifyContent: 'center',

						children: $.wrap_snippet(SimpleLayoutTest, ($$anchor, $$slotProps) => {
							$.add_svelte_meta(() => Text($$anchor, { text: 'Hello World', variant: 'primary' }), 'component', SimpleLayoutTest, 25, 4, { componentTag: 'Text' });
						}),

						$$slots: { default: true }
					}),
					'component',
					SimpleLayoutTest,
					18,
					2,
					{ componentTag: 'Box' }
				);

				var node_1 = $.sibling(node, 2);

				$.add_svelte_meta(
					() => Box(node_1, {
						border: 'rounded',
						variant: 'secondary',
						marginTop: 1,
						justifyContent: 'center',

						children: $.wrap_snippet(SimpleLayoutTest, ($$anchor, $$slotProps) => {
							$.add_svelte_meta(() => Text($$anchor, { text: 'Inside Box', variant: 'secondary' }), 'component', SimpleLayoutTest, 34, 4, { componentTag: 'Text' });
						}),

						$$slots: { default: true }
					}),
					'component',
					SimpleLayoutTest,
					27,
					2,
					{ componentTag: 'Box' }
				);

				$.append($$anchor, fragment_1);
			}),

			$$slots: { default: true }
		}),
		'component',
		SimpleLayoutTest,
		8,
		0,
		{ componentTag: 'Box' }
	);

	return $.pop($$exports);
}