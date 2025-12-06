import 'svelte/internal/disclose-version';

AutoText[$.FILENAME] = 'src/components/ui/AutoText.svelte';

import * as $ from 'svelte/internal/client';
import { tick } from 'svelte';

var root = $.add_locations($.from_svg(`<text><!></text>`), AutoText[$.FILENAME], [[39, 0]]);

export default function AutoText($$anchor, $$props) {
	$.check_target(new.target);
	$.push($$props, true, AutoText);

	// Component that automatically syncs its content with terminal element
	let restProps = $.rest_props($$props, ['$$slots', '$$events', '$$legacy', 'children'], 'restProps');

	let element = $.tag($.state(void 0), 'element');
	let textContent = $.tag($.state(''), 'textContent');

	// Effect that forces text content updates
	$.user_effect(() => {
		if (!$.get(element)) return;

		// Function to update text content
		const updateText = async () => {
			(await $.track_reactivity_loss(tick() // Wait for DOM updates
			))();

			const newText = Array.from($.get(element).childNodes).filter((node) => $.strict_equals(node.nodeType, 3)).map((node) => node.nodeValue || '').join('');

			$.set(textContent, newText, true);
		};

		// Initial update
		updateText();

		// Set up interval to poll for changes (temporary solution)
		const interval = setInterval(updateText, 100);

		return () => clearInterval(interval);
	});

	var $$exports = { ...$.legacy_api() };
	var text = root();

	$.attribute_effect(text, () => ({ content: $.get(textContent), ...restProps }));

	var node_1 = $.child(text);

	{
		var consequent = ($$anchor) => {
			var fragment = $.comment();
			var node_2 = $.first_child(fragment);

			$.add_svelte_meta(() => $.snippet(node_2, () => $$props.children), 'render', AutoText, 41, 4);
			$.append($$anchor, fragment);
		};

		$.add_svelte_meta(
			() => $.if(node_1, ($$render) => {
				if ($$props.children) $$render(consequent);
			}),
			'if',
			AutoText,
			40,
			2
		);
	}

	$.reset(text);
	$.bind_this(text, ($$value) => $.set(element, $$value), () => $.get(element));
	$.append($$anchor, text);

	return $.pop($$exports);
}