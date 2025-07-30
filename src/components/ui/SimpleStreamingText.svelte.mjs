import 'svelte/internal/disclose-version';

SimpleStreamingText[$.FILENAME] = 'src/components/ui/SimpleStreamingText.svelte';

import * as $ from 'svelte/internal/client';

var root = $.add_locations($.ns_template(`<text></text>`), SimpleStreamingText[$.FILENAME], [[33, 0]]);

export default function SimpleStreamingText($$anchor, $$props) {
	$.check_target(new.target);
	$.push($$props, true, SimpleStreamingText);

	let text = $.prop($$props, 'text', 3, ''),
		speed = $.prop($$props, 'speed', 3, 50),
		onComplete = $.prop($$props, 'onComplete', 3, () => {}),
		props = $.rest_props(
			$$props,
			[
				'$$slots',
				'$$events',
				'$$legacy',
				'text',
				'speed',
				'onComplete'
			],
			'props'
		);

	let displayedText = $.state('');
	let currentIndex = $.state(0);

	$.user_effect(() => {
		// Reset when text changes
		$.set(displayedText, '');
		$.set(currentIndex, 0);
		if (!text()) return;

		const interval = setInterval(
			() => {
				if ($.get(currentIndex) < text().length) {
					$.set(displayedText, text().slice(0, $.get(currentIndex) + 1), true);
					$.update(currentIndex);
				} else {
					clearInterval(interval);
					onComplete()();
				}
			},
			speed()
		);

		return () => clearInterval(interval);
	});

	var text_1 = root();
	let attributes;

	$.template_effect(() => attributes = $.set_attributes(text_1, attributes, { content: $.get(displayedText), ...props }));
	$.append($$anchor, text_1);
	return $.pop({ ...$.legacy_api() });
}