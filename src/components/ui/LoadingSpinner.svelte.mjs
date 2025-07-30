import 'svelte/internal/disclose-version';

LoadingSpinner[$.FILENAME] = 'src/components/ui/LoadingSpinner.svelte';

import * as $ from 'svelte/internal/client';

var root = $.add_locations($.template(`<box width="100%"><text> </text></box>`), LoadingSpinner[$.FILENAME], [[53, 0, [[54, 2]]]]);

export default function LoadingSpinner($$anchor, $$props) {
	$.check_target(new.target);
	$.push($$props, true, LoadingSpinner);

	let style = $.prop($$props, 'style', 3, 'dots'),
		speed = $.prop($$props, 'speed', 3, 80),
		text = $.prop($$props, 'text', 3, ''),
		color = $.prop($$props, 'color', 3, 'cyan'),
		bold = $.prop($$props, 'bold', 3, false),
		dim = $.prop($$props, 'dim', 3, false);

	// Animation frames for different spinner styles
	const spinners = {
		dots: [
			'⠋',
			'⠙',
			'⠹',
			'⠸',
			'⠼',
			'⠴',
			'⠦',
			'⠧',
			'⠇',
			'⠏'
		],
		line: ['-', '\\', '|', '/'],
		circle: ['◐', '◓', '◑', '◒'],
		pulse: [
			'▁',
			'▂',
			'▃',
			'▄',
			'▅',
			'▆',
			'▇',
			'█',
			'▇',
			'▆',
			'▅',
			'▄',
			'▃',
			'▂'
		],
		dots2: ['⣾', '⣽', '⣻', '⢿', '⡿', '⣟', '⣯', '⣷'],
		dots3: [
			'⠋',
			'⠙',
			'⠚',
			'⠞',
			'⠖',
			'⠦',
			'⠴',
			'⠲',
			'⠳',
			'⠓'
		],
		arrow: ['←', '↖', '↑', '↗', '→', '↘', '↓', '↙'],
		bouncing: ['⠁', '⠂', '⠄', '⡀', '⢀', '⠠', '⠐', '⠈'],
		bar: [
			'▉',
			'▊',
			'▋',
			'▌',
			'▍',
			'▎',
			'▏',
			'▎',
			'▍',
			'▌',
			'▋',
			'▊',
			'▉'
		],
		star: ['✶', '✸', '✹', '✺', '✹', '✸']
	};

	let frameIndex = $.state(0);
	let intervalId = $.state(null);
	// Get the current spinner frames based on style
	let frames = $.derived(() => spinners[style()] || spinners.dots);
	let currentFrame = $.derived(() => $.get(frames)[$.get(frameIndex) % $.get(frames).length]);

	$.user_effect(() => {
		// Clear any existing interval
		if ($.get(intervalId)) {
			clearInterval($.get(intervalId));
		}

		// Start new animation
		$.set(
			intervalId,
			setInterval(
				() => {
					$.set(frameIndex, ($.get(frameIndex) + 1) % $.get(frames).length);
				},
				speed()
			),
			true
		);

		// Cleanup on unmount
		return () => {
			if ($.get(intervalId)) {
				clearInterval($.get(intervalId));
			}
		};
	});

	var box = root();

	$.set_attribute(box, 'height', 1);

	var text_1 = $.child(box);
	var text_2 = $.child(text_1);

	$.reset(text_1);
	$.reset(box);

	$.template_effect(() => {
		$.set_attribute(text_1, 'fg', color());
		$.set_attribute(text_1, 'bold', bold());
		$.set_attribute(text_1, 'dim', dim());
		$.set_text(text_2, `${$.get(currentFrame) ?? ''}${text() ? ` ${text()}` : ''}`);
	});

	$.append($$anchor, box);
	return $.pop({ ...$.legacy_api() });
}