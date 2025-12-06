import 'svelte/internal/disclose-version';

LiveText[$.FILENAME] = 'src/components/ui/LiveText.svelte';

import * as $ from 'svelte/internal/client';

var root = $.add_locations($.from_svg(`<text><!></text>`), LiveText[$.FILENAME], [[35, 0]]);

export default function LiveText($$anchor, $$props) {
	$.check_target(new.target);
	$.push($$props, true, LiveText);

	// This component automatically updates its terminal element when content changes
	let // Direct content value (reactive)
		value = $.prop($$props, 'value', 3, ''),
		// Children for slot content
		// Other text element props
		restProps = $.rest_props($$props, ['$$slots', '$$events', '$$legacy', 'value', 'children'], 'restProps');

	// State for the element reference
	let element = $.tag($.state(void 0), 'element');

	// Derived content that reactively computes text from DOM or prop
	let finalContent = $.tag(
		$.derived(() => {
			// If value prop is provided, use it
			if (value()) return value();

			// Otherwise, extract text from DOM child nodes
			if ($.get(element) && $.get(element).childNodes.length > 0) {
				return Array.from($.get(element).childNodes).filter((node) => $.strict_equals(node.nodeType, 3)).map((node) => node.nodeValue || '').join('');
			}

			return '';
		}),
		'finalContent'
	);

	var $$exports = { ...$.legacy_api() };
	var text = root();

	$.attribute_effect(text, () => ({ content: $.get(finalContent), ...restProps }));

	var node_1 = $.child(text);

	{
		var consequent = ($$anchor) => {
			var fragment = $.comment();
			var node_2 = $.first_child(fragment);

			$.add_svelte_meta(() => $.snippet(node_2, () => $$props.children), 'render', LiveText, 37, 4);
			$.append($$anchor, fragment);
		};

		$.add_svelte_meta(
			() => $.if(node_1, ($$render) => {
				if ($$props.children) $$render(consequent);
			}),
			'if',
			LiveText,
			36,
			2
		);
	}

	$.reset(text);
	$.bind_this(text, ($$value) => $.set(element, $$value), () => $.get(element));
	$.append($$anchor, text);

	return $.pop($$exports);
}