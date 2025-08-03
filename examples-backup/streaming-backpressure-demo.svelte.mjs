import 'svelte/internal/disclose-version';

Streaming_backpressure_demo[$.FILENAME] = 'examples/streaming-backpressure-demo.svelte';

import * as $ from 'svelte/internal/client';
import { createReactiveStream } from '../src/streaming/reactive-stream.svelte.ts';

import {
	createMockClaudeStream,
	textToStream,
	throttleStream
} from '../src/streaming/stream-utils';

import StreamingTextAdvanced from '../src/components/ui/StreamingTextAdvanced.svelte.mjs';

var root_1 = $.add_locations($.template(`<textinput label=" Custom Text "></textinput>`), Streaming_backpressure_demo[$.FILENAME], [[244, 6]]);

var root = $.add_locations($.template(`<box width="100%" height="100%"><box label=" 🌊 Streaming with Backpressure Demo " width="100%"><text>Control streaming behavior and observe backpressure in action</text></box> <box width="100%" label=" Controls "><text bold="">Stream Mode:</text> <list></list> <text> </text> <text bold=""> </text> <button content=" Slower "></button> <button content=" Faster "></button> <text bold=""> </text> <button content=" Increase "></button> <button content=" Decrease "></button> <!> <button content=" ▶ Start Stream "></button> <button content=" ⏸ Pause "></button> <button content=" ▶ Resume "></button> <button content=" ⏹ Stop "></button></box> <box width="100%" label=" Metrics "><text> </text> <text> </text> <text> </text></box> <box width="100%" height="-1" label=" Streamed Content "><!></box></box>`), Streaming_backpressure_demo[$.FILENAME], [
	[
		185,
		0,
		[
			[186, 2, [[187, 4]]],
			[
				191,
				2,
				[
					[193, 4],
					[194, 4],
					[206, 4],
					[209, 4],
					[210, 4],
					[217, 4],
					[226, 4],
					[227, 4],
					[234, 4],
					[257, 4],
					[264, 4],
					[272, 4],
					[280, 4]
				]
			],
			[
				291,
				2,
				[[292, 4], [293, 4], [294, 4]]
			],
			[298, 2]
		]
	]
]);

export default function Streaming_backpressure_demo($$anchor, $$props) {
	$.check_target(new.target);
	$.push($$props, true, Streaming_backpressure_demo);

	// Demo content
	const claudeResponse = `# Understanding Backpressure in Streaming Systems

Backpressure is a crucial concept in streaming systems that helps manage the flow of data between producers and consumers. Let me explain this concept with some examples.

## What is Backpressure?

**Backpressure** occurs when a data consumer cannot process incoming data as fast as the producer is generating it. Think of it like a water pipe system:

- The **producer** is like a water tap
- The **consumer** is like a drain
- The **buffer** is like a sink basin

When the drain can't empty water as fast as the tap fills it, the sink starts to overflow - that's when we need backpressure!

## Why is Backpressure Important?

1. **Memory Management**: Without backpressure, buffers can grow unbounded, leading to memory exhaustion
2. **System Stability**: Prevents system crashes due to resource overload
3. **Flow Control**: Ensures smooth data flow throughout the pipeline
4. **Performance**: Maintains optimal throughput without overwhelming any component

## Common Backpressure Strategies

### 1. Pause/Resume Pattern
The simplest strategy - pause the producer when the buffer is full:

\`\`\`javascript
if (buffer.length >= maxSize) {
  producer.pause();
}
\`\`\`

### 2. Token Bucket Algorithm
Limit the rate of data production using tokens:

\`\`\`javascript
const tokens = refillTokens(elapsed);
if (tokens >= required) {
  produceData();
}
\`\`\`

### 3. Sliding Window
Control flow using acknowledgments and window sizes.

## Real-world Applications

- **Video Streaming**: Netflix adjusts quality based on network speed
- **Message Queues**: RabbitMQ implements flow control
- **Database Replication**: MongoDB uses backpressure for replica synchronization
- **API Rate Limiting**: Web services limit request rates

## Best Practices

1. **Monitor Buffer Sizes**: Keep track of queue depths
2. **Set Reasonable Limits**: Don't make buffers too small or too large
3. **Graceful Degradation**: Have fallback strategies when overwhelmed
4. **Metrics & Alerting**: Monitor system health proactively

Remember: *Good backpressure design is invisible to users but critical for system reliability!*`;

	// State
	let activeStream = $.state(null);
	let streamingMode = $.state('claude');
	let isPaused = $.state(false);
	let metrics = $.state(null);
	let bufferVisualization = $.state($.proxy([]));
	let customText = $.state('');
	let streamSpeed = $.state(30);
	let bufferSize = $.state(50);
	// Stream control
	let streamingTextRef = null;

	// Start streaming based on mode
	async function startStreaming() {
		if ($.get(activeStream)) {
			await stopStreaming();
		}

		switch ($.get(streamingMode)) {
			case 'claude':
				$.set(
					activeStream,
					createMockClaudeStream(claudeResponse, {
						streamDelay: $.get(streamSpeed),
						chunkVariance: true
					}),
					true
				);
				break;

			case 'fast':
				$.set(activeStream, textToStream(claudeResponse, { chunkSize: 50, delay: 10 }), true);
				break;

			case 'throttled':
				const baseStream = textToStream(claudeResponse, { chunkSize: 20, delay: 0 });
				$.set(activeStream, throttleStream(baseStream, 100, (chunk) => chunk.length), true);
				break;

			case 'custom':
				if (!$.get(customText)) {
					$.set(customText, 'Enter some text to stream in the input above...');
				}
				$.set(activeStream, textToStream($.get(customText), { chunkSize: 5, delay: $.get(streamSpeed) }), true);
				break;
		}

		// Reset the streaming component
		if (streamingTextRef) {
			streamingTextRef.reset();
		}
	}

	async function stopStreaming() {
		if (streamingTextRef) {
			await streamingTextRef.cancel();
		}

		$.set(activeStream, null);
		$.set(isPaused, false);
	}

	function pauseStream() {
		if (streamingTextRef) {
			streamingTextRef.pause();
			$.set(isPaused, true);
		}
	}

	function resumeStream() {
		if (streamingTextRef) {
			streamingTextRef.resume();
			$.set(isPaused, false);
		}
	}

	$.user_effect(() => {
		const interval = setInterval(
			() => {
				if (streamingTextRef) {
					$.set(metrics, streamingTextRef.getMetrics(), true);

					// Update buffer visualization
					if ($.get(metrics)) {
						const usage = Math.floor($.get(metrics).bufferUsage * 10);

						$.set(bufferVisualization, Array(10).fill(false).map((_, i) => i < usage), true);
					}
				}
			},
			100
		);

		return () => clearInterval(interval);
	});

	// Format metrics for display
	let metricsDisplay = $.derived(() => () => {
		if (!$.get(metrics)) return 'No metrics available';

		const rate = Math.round($.get(metrics).bytesReceived / ((Date.now() - $.get(metrics).startTime) / 1000) || 0);
		const duration = Math.round((Date.now() - $.get(metrics).startTime) / 1000);

		return `Chunks: ${$.get(metrics).chunksReceived} | Bytes: ${$.get(metrics).bytesReceived} | Rate: ${rate} B/s | Duration: ${duration}s`;
	});

	// Stream mode descriptions
	const modeDescriptions = {
		claude: 'Simulates Claude API streaming with variable chunk sizes',
		fast: 'Fast streaming with large chunks',
		throttled: 'Throttled stream limited to 100 bytes/second',
		custom: 'Stream your own custom text'
	};

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
	$.set_attribute(box_2, 'height', 12);
	$.set_attribute(box_2, 'border', { type: 'line' });

	var text_1 = $.child(box_2);

	$.set_attribute(text_1, 'left', 1);
	$.set_attribute(text_1, 'top', 0);

	var list = $.sibling(text_1, 2);

	$.set_attribute(list, 'top', 1);
	$.set_attribute(list, 'left', 1);
	$.set_attribute(list, 'width', 30);
	$.set_attribute(list, 'height', 4);
	$.set_attribute(list, 'border', { type: 'line' });
	$.set_attribute(list, 'items', ['claude', 'fast', 'throttled', 'custom']);
	$.set_style(list, { selected: { bg: 'blue' } });

	var text_2 = $.sibling(list, 2);

	$.set_attribute(text_2, 'left', 35);
	$.set_attribute(text_2, 'top', 0);

	var text_3 = $.child(text_2, true);

	$.reset(text_2);

	var text_4 = $.sibling(text_2, 2);

	$.set_attribute(text_4, 'left', 35);
	$.set_attribute(text_4, 'top', 2);

	var text_5 = $.child(text_4);

	$.reset(text_4);

	var button = $.sibling(text_4, 2);

	$.set_attribute(button, 'left', 35);
	$.set_attribute(button, 'top', 3);

	$.set_style(button, {
		bg: 'gray',
		fg: 'white',
		focus: { bg: 'white', fg: 'black' }
	});

	var button_1 = $.sibling(button, 2);

	$.set_attribute(button_1, 'left', 45);
	$.set_attribute(button_1, 'top', 3);

	$.set_style(button_1, {
		bg: 'gray',
		fg: 'white',
		focus: { bg: 'white', fg: 'black' }
	});

	var text_6 = $.sibling(button_1, 2);

	$.set_attribute(text_6, 'left', 35);
	$.set_attribute(text_6, 'top', 5);

	var text_7 = $.child(text_6);

	$.reset(text_6);

	var button_2 = $.sibling(text_6, 2);

	$.set_attribute(button_2, 'left', 35);
	$.set_attribute(button_2, 'top', 6);

	$.set_style(button_2, {
		bg: 'gray',
		fg: 'white',
		focus: { bg: 'white', fg: 'black' }
	});

	var button_3 = $.sibling(button_2, 2);

	$.set_attribute(button_3, 'left', 46);
	$.set_attribute(button_3, 'top', 6);

	$.set_style(button_3, {
		bg: 'gray',
		fg: 'white',
		focus: { bg: 'white', fg: 'black' }
	});

	var node = $.sibling(button_3, 2);

	{
		var consequent = ($$anchor) => {
			var textinput = root_1();

			$.set_attribute(textinput, 'left', 1);
			$.set_attribute(textinput, 'top', 6);
			$.set_attribute(textinput, 'width', 30);
			$.set_attribute(textinput, 'height', 3);
			$.set_attribute(textinput, 'border', { type: 'line' });
			$.template_effect(() => $.set_value(textinput, $.get(customText)));

			$.event('Submit', textinput, (value) => {
				$.set(customText, value, true);
			});

			$.append($$anchor, textinput);
		};

		$.if(node, ($$render) => {
			if ($.strict_equals($.get(streamingMode), 'custom')) $$render(consequent);
		});
	}

	var button_4 = $.sibling(node, 2);

	$.set_attribute(button_4, 'left', 1);
	$.set_attribute(button_4, 'top', 9);

	$.set_style(button_4, {
		bg: 'green',
		fg: 'white',
		focus: { bg: 'white', fg: 'green' }
	});

	var button_5 = $.sibling(button_4, 2);

	$.set_attribute(button_5, 'left', 18);
	$.set_attribute(button_5, 'top', 9);

	var button_6 = $.sibling(button_5, 2);

	$.set_attribute(button_6, 'left', 29);
	$.set_attribute(button_6, 'top', 9);

	var button_7 = $.sibling(button_6, 2);

	$.set_attribute(button_7, 'left', 40);
	$.set_attribute(button_7, 'top', 9);

	$.set_style(button_7, {
		bg: 'red',
		fg: 'white',
		focus: { bg: 'white', fg: 'red' }
	});

	$.reset(box_2);

	var box_3 = $.sibling(box_2, 2);

	$.set_attribute(box_3, 'top', 15);
	$.set_attribute(box_3, 'height', 4);
	$.set_attribute(box_3, 'border', { type: 'line' });

	var text_8 = $.child(box_3);

	$.set_attribute(text_8, 'left', 1);
	$.set_attribute(text_8, 'top', 0);

	var text_9 = $.child(text_8, true);

	$.reset(text_8);

	var text_10 = $.sibling(text_8, 2);

	$.set_attribute(text_10, 'left', 1);
	$.set_attribute(text_10, 'top', 1);

	var text_11 = $.child(text_10);

	$.reset(text_10);

	var text_12 = $.sibling(text_10, 2);

	$.set_attribute(text_12, 'left', 1);
	$.set_attribute(text_12, 'top', 2);

	var text_13 = $.child(text_12);

	$.reset(text_12);
	$.reset(box_3);

	var box_4 = $.sibling(box_3, 2);

	$.set_attribute(box_4, 'top', 19);
	$.set_attribute(box_4, 'border', { type: 'line' });

	var node_1 = $.child(box_4);

	$.bind_this(
		StreamingTextAdvanced(node_1, {
			get stream() {
				return $.get(activeStream);
			},
			get bufferSize() {
				return $.get(bufferSize);
			},
			markdownMode: 'full',
			showCursor: true,
			cursorBlink: true,
			autoScroll: true,
			scrollable: true,
			alwaysScroll: true,
			animationSpeed: 'word',
			animationDelay: 5,
			onStreamStart: () => {
				$.set(metrics, null);
			},
			onStreamEnd: () => {
				$.set(activeStream, null);
			},
			onStreamError: (err) => {
				console.error(...$.log_if_contains_state('error', 'Stream error:', err));
			},
			style: { bg: 'black' }
		}),
		($$value) => streamingTextRef = $$value,
		() => streamingTextRef
	);

	$.reset(box_4);
	$.reset(box);

	$.template_effect(
		($0, $1, $2, $3) => {
			$.set_selected(list, $0);
			$.set_text(text_3, modeDescriptions[$.get(streamingMode)]);
			$.set_text(text_5, `Stream Speed: ${$.get(streamSpeed) ?? ''}ms`);
			$.set_text(text_7, `Buffer Size: ${$.get(bufferSize) ?? ''}`);
			button_5.disabled = !$.get(activeStream) || $.get(isPaused);

			$.set_style(button_5, {
				bg: $.get(isPaused) ? 'gray' : 'yellow',
				fg: 'black',
				focus: { bg: 'white', fg: 'black' }
			});

			button_6.disabled = !$.get(activeStream) || !$.get(isPaused);

			$.set_style(button_6, {
				bg: !$.get(isPaused) ? 'gray' : 'blue',
				fg: 'white',
				focus: { bg: 'white', fg: 'blue' }
			});

			button_7.disabled = !$.get(activeStream);
			$.set_text(text_9, $1);
			$.set_text(text_11, `Buffer Usage: [${$2 ?? ''}] ${$3 ?? ''}%`);
			$.set_attribute(text_12, 'fg', $.get(isPaused) ? 'yellow' : 'green');
			$.set_text(text_13, `Status: ${$.get(isPaused) ? 'PAUSED' : $.get(activeStream) ? 'STREAMING' : 'IDLE'}`);
		},
		[
			() => ['claude', 'fast', 'throttled', 'custom'].indexOf($.get(streamingMode)),
			() => $.get(metricsDisplay)(),
			() => $.get(bufferVisualization).map((filled) => filled ? '█' : '░').join(''),
			() => Math.round(($.get(metrics)?.bufferUsage || 0) * 100)
		]
	);

	$.event('Select', list, (item) => {
		$.set(streamingMode, item.content, true);
	});

	$.event('Press', button, () => {
		$.set(streamSpeed, Math.min(200, $.get(streamSpeed) + 10), true);
	});

	$.event('Press', button_1, () => {
		$.set(streamSpeed, Math.max(10, $.get(streamSpeed) - 10), true);
	});

	$.event('Press', button_2, () => {
		$.set(bufferSize, Math.min(200, $.get(bufferSize) + 10), true);
	});

	$.event('Press', button_3, () => {
		$.set(bufferSize, Math.max(10, $.get(bufferSize) - 10), true);
	});

	$.event('Press', button_4, startStreaming);
	$.event('Press', button_5, pauseStream);
	$.event('Press', button_6, resumeStream);
	$.event('Press', button_7, stopStreaming);
	$.append($$anchor, box);
	return $.pop({ ...$.legacy_api() });
}