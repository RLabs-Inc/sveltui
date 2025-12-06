import 'svelte/internal/disclose-version';

StreamingTextAdvanced[$.FILENAME] = 'src/components/ui/StreamingTextAdvanced.svelte';

import * as $ from 'svelte/internal/client';
import { createReactiveStream } from '../../streaming/reactive-stream.svelte.js';
import { getContext } from 'svelte';

import {
	markdownToTaggedString,
	parseMarkdown,
	tokensToTaggedString
} from './markdown';

var root = $.add_locations($.template(`<ttext></ttext>`), StreamingTextAdvanced[$.FILENAME], [[398, 0]]);

export default function StreamingTextAdvanced($$anchor, $$props) {
	$.check_target(new.target);
	$.push($$props, true, StreamingTextAdvanced);

	// Component props
	let stream = $.prop($$props, 'stream', 3, null),
		text = $.prop($$props, 'text', 3, ''),
		markdownMode = $.prop($$props, 'markdownMode', 3, 'full'),
		animationSpeed = $.prop($$props, 'animationSpeed', 3, 'word'),
		animationDelay = $.prop($$props, 'animationDelay', 3, 16),
		showCursor = $.prop($$props, 'showCursor', 3, true),
		cursorChar = $.prop($$props, 'cursorChar', 3, '▊'),
		cursorBlink = $.prop($$props, 'cursorBlink', 3, true),
		bufferSize = $.prop($$props, 'bufferSize', 3, 100),
		autoBackpressure = $.prop($$props, 'autoBackpressure', 3, true),
		autoScroll = $.prop($$props, 'autoScroll', 3, true),
		scrollSmooth = $.prop($$props, 'scrollSmooth', 3, true),
		clearOldChunks = $.prop($$props, 'clearOldChunks', 3, true),
		keepChunks = $.prop($$props, 'keepChunks', 3, 20),
		onStreamStart = $.prop($$props, 'onStreamStart', 3, () => {}),
		onStreamEnd = $.prop($$props, 'onStreamEnd', 3, () => {}),
		onStreamError = $.prop($$props, 'onStreamError', 3, (error) => {}),
		left = $.prop($$props, 'left', 3, 0),
		top = $.prop($$props, 'top', 3, 0),
		width = $.prop($$props, 'width', 3, '100%'),
		height = $.prop($$props, 'height', 3, 'shrink'),
		align = $.prop($$props, 'align', 3, 'left'),
		wrap = $.prop($$props, 'wrap', 3, true),
		border = $.prop($$props, 'border', 3, false),
		scrollable = $.prop($$props, 'scrollable', 3, false),
		alwaysScroll = $.prop($$props, 'alwaysScroll', 3, false),
		style = $.prop($$props, 'style', 19, () => ({})),
		hidden = $.prop($$props, 'hidden', 3, false),
		restProps = $.rest_props(
			$$props,
			[
				'$$slots',
				'$$events',
				'$$legacy',
				'stream',
				'text',
				'markdownMode',
				'animationSpeed',
				'animationDelay',
				'showCursor',
				'cursorChar',
				'cursorBlink',
				'bufferSize',
				'autoBackpressure',
				'autoScroll',
				'scrollSmooth',
				'clearOldChunks',
				'keepChunks',
				'onStreamStart',
				'onStreamEnd',
				'onStreamError',
				'left',
				'top',
				'right',
				'bottom',
				'width',
				'height',
				'align',
				'wrap',
				'border',
				'scrollable',
				'alwaysScroll',
				'style',
				'zIndex',
				'hidden'
			],
			'restProps'
		);

	// Get theme from context
	const theme = getContext('theme') || {
		name: 'default',
		colors: {
			text: 'white',
			emphasis: 'italic',
			strong: 'bold',
			code: 'yellow',
			codeBlock: 'yellow',
			link: 'blue',
			heading1: 'bright-white',
			heading2: 'bright-white',
			heading3: 'white',
			heading4: 'white',
			heading5: 'gray',
			heading6: 'gray',
			quote: 'gray',
			list: 'white',
			border: 'gray'
		}
	};

	// Create reactive stream instance
	const reactiveStream = createReactiveStream({
		bufferSize: bufferSize(),
		autoBackpressure: autoBackpressure(),
		onComplete: () => {
			$.set(isStreaming, false);
			onStreamEnd()();
		},
		onError: (error) => {
			$.set(isStreaming, false);
			onStreamError()(error);
		}
	});

	// State
	let isStreaming = $.state(false);
	let displayedContent = $.proxy(text());
	let cursorVisible = $.state(true);
	let cursorTimer = null;
	let scrollElement = null;
	// Derived values
	let streamContent = $.derived(() => reactiveStream.content);
	let streamMetrics = $.derived(() => reactiveStream.streamMetrics);
	let isPaused = $.derived(() => reactiveStream.paused);
	let hasError = $.derived(() => reactiveStream.hasError);
	let error = $.derived(() => reactiveStream.streamError);

	// Combined content (initial text + streamed content)
	let fullContent = $.derived(() => () => {
		if ($.get(streamContent)) {
			return text() ? text() + $.get(streamContent) : $.get(streamContent);
		}

		return text();
	});

	// Process content for markdown
	let processedContent = $.derived(() => () => {
		const content = $.get(fullContent)();

		if (!content || $.strict_equals(markdownMode(), 'none')) {
			return content || '';
		}

		try {
			return markdownToTaggedString(content, theme, markdownMode());
		} catch(e) {
			// If markdown parsing fails during streaming, return raw content
			return content;
		}
	});

	// Animated content display
	let animatedContent = $.state('');
	let animationIndex = $.state(0);
	let animationTimer = null;

	// Get raw text without tags
	function stripTags(taggedText) {
		return taggedText.replace(/{[^}]+}/g, '');
	}

	// Split text for animation
	let textSegments = $.derived(() => () => {
		if ($.strict_equals(animationSpeed(), 'instant')) {
			return [$.get(processedContent)()];
		}

		const rawText = stripTags($.get(processedContent)());

		if ($.strict_equals(animationSpeed(), 'char')) {
			return rawText.split('');
		} else {
			// Split by word, preserving spaces
			return rawText.match(/\S+\s*/g) || [];
		}
	});

	// Animate content display
	function animateContent() {
		if (animationTimer) {
			clearInterval(animationTimer);
		}

		if ($.strict_equals(animationSpeed(), 'instant')) {
			$.set(animatedContent, $.get(processedContent)(), true);
			$.set(animationIndex, $.get(textSegments)().length, true);
			return;
		}

		// Continue from current position if streaming
		if ($.get(isStreaming) && $.get(animationIndex) > 0) {} else // Just continue animation
		{
			$.set(animationIndex, 0);
			$.set(animatedContent, '');
		}

		animationTimer = setInterval(
			() => {
				const segments = $.get(textSegments)();

				if ($.get(animationIndex) < segments.length) {
					// Build up the displayed text progressively
					const displaySegments = segments.slice(0, $.get(animationIndex) + 1);

					if ($.strict_equals(markdownMode(), 'none')) {
						$.set(animatedContent, displaySegments.join(''), true);
					} else {
						// For markdown, rebuild tagged string up to current point
						const rawDisplayed = displaySegments.join('');
						const fullProcessed = $.get(processedContent)();
						// Extract portion of tagged string
						let charCount = 0;
						let result = '';
						let inTag = false;
						let openTags = [];

						for (let i = 0; i < fullProcessed.length; i++) {
							const char = fullProcessed[i];

							if ($.strict_equals(char, '{')) {
								inTag = true;
								result += char;
							} else if ($.strict_equals(char, '}')) {
								inTag = false;
								result += char;

								// Track open/close tags
								const tag = result.match(/{([^}]+)}$/)?.[1];

								if (tag) {
									if (tag.startsWith('/')) {
										openTags = openTags.filter((t) => $.strict_equals(t, tag.substring(1), false));
									} else {
										openTags.push(tag.split('-')[0]);
									}
								}
							} else if (!inTag) {
								if (charCount < rawDisplayed.length) {
									result += char;
									charCount++;
								} else {
									break;
								}
							} else {
								result += char;
							}
						}

						// Close any open tags
						for (let i = openTags.length - 1; i >= 0; i--) {
							result += `{/${openTags[i]}}`;
						}

						$.set(animatedContent, result, true);
					}

					$.update(animationIndex);

					// Auto-scroll if needed
					if (autoScroll() && scrollElement) {
						scrollToBottom();
					}
				} else {
					clearInterval(animationTimer);
					animationTimer = null;
				}
			},
			animationDelay()
		);
	}

	$.user_effect(() => {
		const content = $.get(processedContent)();

		if (content) {
			animateContent();
		}
	});

	$.user_effect(() => {
		if (showCursor() && cursorBlink() && $.get(isStreaming)) {
			cursorTimer = setInterval(
				() => {
					$.set(cursorVisible, !$.get(cursorVisible));
				},
				500
			);

			return () => {
				if (cursorTimer) {
					clearInterval(cursorTimer);
					cursorTimer = null;
				}
			};
		} else {
			$.set(cursorVisible, true);
		}
	});

	// Stream handling
	async function startStream(source) {
		if (!source) return;
		$.set(isStreaming, true);
		onStreamStart()();

		try {
			if (source instanceof ReadableStream) {
				await reactiveStream.streamFrom(source);
			} else if (source.next && $.strict_equals(typeof source.next, 'function')) {
				// Async generator
				await reactiveStream.streamFromGenerator(source);
			} else if ($.strict_equals(typeof source, 'string')) {
				// Demo mode - stream text slowly
				await reactiveStream.streamFromText(source, 50);
			}
		} catch(err) {
			onStreamError()(err);
		}
	}

	$.user_effect(() => {
		if (stream()) {
			startStream(stream());
		}
	});

	$.user_effect(() => {
		if (clearOldChunks() && $.get(isStreaming)) {
			const interval = setInterval(
				() => {
					reactiveStream.clearConsumedChunks(keepChunks());
				},
				5000
			);

			return () => clearInterval(interval);
		}
	});

	// Scroll to bottom helper
	function scrollToBottom() {
		if (scrollElement && scrollElement.scrollTo) {
			if (scrollSmooth()) {
				scrollElement.scrollTo({
					top: scrollElement.scrollHeight,
					behavior: 'smooth'
				});
			} else {
				scrollElement.scrollTop = scrollElement.scrollHeight;
			}
		}
	}

	// Final display content with cursor
	let finalContent = $.derived(() => () => {
		let content = $.get(animatedContent);

		if (showCursor() && $.get(isStreaming) && $.get(cursorVisible)) {
			content += `{${theme.colors.text}-fg}${cursorChar()}{/${theme.colors.text}-fg}`;
		}

		return content;
	});

	$.user_effect(() => {
		return () => {
			if (animationTimer) {
				clearInterval(animationTimer);
			}

			if (cursorTimer) {
				clearInterval(cursorTimer);
			}

			reactiveStream.cancel();
		};
	});

	// Convert border prop
	let borderValue = $.derived(() => $.strict_equals(typeof border(), 'boolean') ? border() ? 'line' : false : border());

	function pause() {
		reactiveStream.pause();
	}

	function resume() {
		reactiveStream.resume();
	}

	function cancel() {
		reactiveStream.cancel();
	}

	function reset() {
		reactiveStream.reset();
		$.set(animatedContent, '');
		$.set(animationIndex, 0);
	}

	function getMetrics() {
		return reactiveStream.streamMetrics;
	}

	var ttext = root();
	let attributes;

	$.bind_this(ttext, ($$value) => scrollElement = $$value, () => scrollElement);

	$.template_effect(
		($0) => attributes = $.set_attributes(ttext, attributes, {
			left: left(),
			top: top(),
			right: $$props.right,
			bottom: $$props.bottom,
			width: width(),
			height: height(),
			content: $0,
			align: align(),
			wrap: wrap(),
			tags: true,
			border: $.get(borderValue),
			scrollable: scrollable(),
			alwaysScroll: alwaysScroll(),
			style: style(),
			zIndex: $$props.zIndex,
			hidden: hidden(),
			...restProps
		}),
		[() => $.get(finalContent)()]
	);

	$.append($$anchor, ttext);

	return $.pop({
		get pause() {
			return pause;
		},
		get resume() {
			return resume;
		},
		get cancel() {
			return cancel;
		},
		get reset() {
			return reset;
		},
		get getMetrics() {
			return getMetrics;
		},
		...$.legacy_api()
	});
}