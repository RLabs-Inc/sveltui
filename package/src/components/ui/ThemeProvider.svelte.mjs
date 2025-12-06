import 'svelte/internal/disclose-version';

ThemeProvider[$.FILENAME] = 'src/components/ui/ThemeProvider.svelte';

import * as $ from 'svelte/internal/client';
import { setContext, onMount } from 'svelte';
import { getDefaultTheme } from './theme';

export default function ThemeProvider($$anchor, $$props) {
	$.check_target(new.target);
	$.push($$props, true, ThemeProvider);

	let theme = $.prop($$props, 'theme', 19, getDefaultTheme);

	// Provide theme to all child components
	setContext('theme', theme());

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.snippet(node_1, () => $$props.children);
			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($$props.children) $$render(consequent);
		});
	}

	$.append($$anchor, fragment);
	return $.pop({ ...$.legacy_api() });
}