import 'svelte/internal/disclose-version';

Minimal_binding_test[$.FILENAME] = 'examples/minimal-binding-test.svelte';

import * as $ from 'svelte/internal/client';
import { Box, Text } from '../src/components/ui/index.ts';

export default function Minimal_binding_test($$anchor, $$props) {
	$.check_target(new.target);
	$.push($$props, true, Minimal_binding_test);

	// Simple state
	let message = 'Hello from SvelTUI!';

	Box($$anchor, {
		width: '100%',
		height: '100%',
		border: 'line',
		children: $.wrap_snippet(Minimal_binding_test, ($$anchor, $$slotProps) => {
			Text($$anchor, {
				left: 1,
				top: 1,
				children: $.wrap_snippet(Minimal_binding_test, ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text();

					text.nodeValue = 'Hello from SvelTUI!';
					$.append($$anchor, text);
				}),
				$$slots: { default: true }
			});
		}),
		$$slots: { default: true }
	});

	return $.pop({ ...$.legacy_api() });
}