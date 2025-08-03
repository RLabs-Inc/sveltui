import 'svelte/internal/disclose-version';

Streaming_simple_demo[$.FILENAME] = 'examples/streaming-simple-demo.svelte';

import * as $ from 'svelte/internal/client';
import { createReactiveStream } from '../src/streaming/reactive-stream.svelte.ts';
import { textToStream } from '../src/streaming/stream-utils';
import StreamingTextAdvanced from '../src/components/ui/StreamingTextAdvanced.svelte.mjs';

var root = $.add_locations($.template(`<box width="100%" height="100%"><box label=" 🌊 Simple Streaming Demo " width="100%"><text>Watch text stream with reactive updates!</text></box> <box width="100%"><button content=" Start Streaming "></button> <button content=" Stop Streaming "></button> <text> </text></box> <box width="100%" height="-1" label=" Content "><!></box></box>`), Streaming_simple_demo[$.FILENAME], [
	[
		48,
		0,
		[
			[49, 2, [[50, 4]]],
			[
				53,
				2,
				[[54, 4], [62, 4], [71, 4]]
			],
			[76, 2]
		]
	]
]);

export default function Streaming_simple_demo($$anchor, $$props) {
	$.check_target(new.target);
	$.push($$props, true, Streaming_simple_demo);

	// Demo content
	const sampleText = `Hello! I'm demonstrating the streaming text component.

This text is being streamed word by word with backpressure support.

Watch as the content flows smoothly onto your screen, with:
- Automatic flow control
- Markdown rendering
- Smooth animations
- Cursor indicator

Pretty cool, right? 🚀`;

	// State
	let isStreaming = $.state(false);
	let streamRef = null;
	let activeStream = $.state(null);

	// Start streaming
	function startStream() {
		if ($.get(activeStream)) {
			stopStream();
		}

		$.set(activeStream, textToStream(sampleText, { chunkSize: 5, delay: 80 }), true);
		$.set(isStreaming, true);
	}

	// Stop streaming
	function stopStream() {
		if (streamRef) {
			streamRef.cancel();
		}

		$.set(activeStream, null);
		$.set(isStreaming, false);
	}

	var box = root();

	$.set_attribute(box, 'border', { type: 'line' });

	var box_1 = $.child(box);

	$.set_attribute(box_1, 'height', 3);
	$.set_attribute(box_1, 'border', { type: 'line' });

	var text = $.child(box_1);

	$.set_attribute(text, 'left', 1);
	$.set_attribute(text, 'top', 0);
	$.reset(box_1);

	var box_2 = $.sibling(box_1, 2);

	$.set_attribute(box_2, 'top', 3);
	$.set_attribute(box_2, 'height', 5);
	$.set_attribute(box_2, 'border', { type: 'line' });

	var button = $.child(box_2);

	$.set_attribute(button, 'left', 1);
	$.set_attribute(button, 'top', 1);

	var button_1 = $.sibling(button, 2);

	$.set_attribute(button_1, 'left', 19);
	$.set_attribute(button_1, 'top', 1);

	var text_1 = $.sibling(button_1, 2);

	$.set_attribute(text_1, 'left', 1);
	$.set_attribute(text_1, 'top', 3);

	var text_2 = $.child(text_1);

	$.reset(text_1);
	$.reset(box_2);

	var box_3 = $.sibling(box_2, 2);

	$.set_attribute(box_3, 'top', 8);
	$.set_attribute(box_3, 'border', { type: 'line' });

	var node = $.child(box_3);

	$.bind_this(
		StreamingTextAdvanced(node, {
			get stream() {
				return $.get(activeStream);
			},
			showCursor: true,
			cursorBlink: true,
			autoScroll: true,
			scrollable: true,
			markdownMode: 'subtle',
			animationSpeed: 'word',
			animationDelay: 10,
			onStreamEnd: () => {
				$.set(isStreaming, false);
			}
		}),
		($$value) => streamRef = $$value,
		() => streamRef
	);

	$.reset(box_3);
	$.reset(box);

	$.template_effect(() => {
		button.disabled = $.get(isStreaming);

		$.set_style(button, {
			bg: $.get(isStreaming) ? 'gray' : 'green',
			fg: 'white'
		});

		button_1.disabled = !$.get(isStreaming);

		$.set_style(button_1, {
			bg: !$.get(isStreaming) ? 'gray' : 'red',
			fg: 'white'
		});

		$.set_attribute(text_1, 'fg', $.get(isStreaming) ? 'green' : 'gray');
		$.set_text(text_2, `Status: ${$.get(isStreaming) ? 'STREAMING...' : 'IDLE'}`);
	});

	$.event('Press', button, startStream);
	$.event('Press', button_1, stopStream);
	$.append($$anchor, box);
	return $.pop({ ...$.legacy_api() });
}