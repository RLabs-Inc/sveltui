import 'svelte/internal/disclose-version';

ReactiveText[$.FILENAME] = 'src/components/ui/ReactiveText.svelte';

import * as $ from 'svelte/internal/client';

var root = $.add_locations($.from_svg(`<text><!></text>`), ReactiveText[$.FILENAME], [[29, 0]]);

export default function ReactiveText($$anchor, $$props) {
	$.check_target(new.target);
	$.push($$props, true, ReactiveText);

	// Props
	let // Text content from prop
		content = $.prop($$props, 'content', 3, ''),
		// Children snippet
		// Other props
		restProps = $.rest_props($$props, ['$$slots', '$$events', '$$legacy', 'content', 'children'], 'restProps');

	// Reference to the text element
	let textElement = $.tag($.state(void 0), 'textElement');

	// Derive the actual content from either prop or children
	let actualContent = $.tag(
		$.derived(() => content() || ($.get(textElement) && $.get(textElement).childNodes.length > 0
			? Array.from($.get(textElement).childNodes).filter((node // Text nodes
			) => $.strict_equals(node.nodeType, 3)).map((node) => node.nodeValue || '').join('')
			: '')),
		'actualContent'
	);

	var $$exports = { ...$.legacy_api() };
	var text = root();

	$.attribute_effect(text, () => ({
		content: $.get(
			// Use the derived content in the element
			actualContent
		),

		...restProps
	}));

	var node_1 = $.child(text);

	{
		var consequent = ($$anchor) => {
			var fragment = $.comment();
			var node_2 = $.first_child(fragment);

			$.add_svelte_meta(() => $.snippet(node_2, () => $$props.children), 'render', ReactiveText, 31, 4);
			$.append($$anchor, fragment);
		};

		$.add_svelte_meta(
			() => $.if(node_1, ($$render) => {
				if ($$props.children) $$render(consequent);
			}),
			'if',
			ReactiveText,
			30,
			2
		);
	}

	$.reset(text);
	$.bind_this(text, ($$value) => $.set(textElement, $$value), () => $.get(textElement));
	$.append($$anchor, text);

	return $.pop($$exports);
}