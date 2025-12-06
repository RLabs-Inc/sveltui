import 'svelte/internal/disclose-version';

StreamingText[$.FILENAME] = 'src/components/ui/StreamingText.svelte';

import * as $ from 'svelte/internal/client';
import { getContext } from 'svelte';
import { markdownToTaggedString } from './markdown';

var root = $.add_locations($.template(`<ttext></ttext>`), StreamingText[$.FILENAME], [[252, 0]]);

export default function StreamingText($$anchor, $$props) {
	$.check_target(new.target);
	$.push($$props, true, StreamingText);

	// Component props
	let text = $.prop($$props, 'text', 3, ''),
		markdownMode = $.prop($$props, 'markdownMode', 3, 'full'),
		animated = $.prop($$props, 'animated', 3, true),
		animationSpeed = $.prop($$props, 'animationSpeed', 3, 'word'),
		animationDelay = $.prop($$props, 'animationDelay', 3, 16),
		showCursor = $.prop($$props, 'showCursor', 3, false),
		cursorChar = $.prop($$props, 'cursorChar', 3, '▊'),
		left = $.prop($$props, 'left', 3, 0),
		top = $.prop($$props, 'top', 3, 0),
		width = $.prop($$props, 'width', 3, '100%'),
		height = $.prop($$props, 'height', 3, 'shrink'),
		align = $.prop($$props, 'align', 3, 'left'),
		wrap = $.prop($$props, 'wrap', 3, true),
		border = $.prop($$props, 'border', 3, false),
		style = $.prop($$props, 'style', 19, () => ({})),
		hidden = $.prop($$props, 'hidden', 3, false),
		restProps = $.rest_props(
			$$props,
			[
				'$$slots',
				'$$events',
				'$$legacy',
				'text',
				'markdownMode',
				'animated',
				'animationSpeed',
				'animationDelay',
				'showCursor',
				'cursorChar',
				'left',
				'top',
				'right',
				'bottom',
				'width',
				'height',
				'align',
				'wrap',
				'border',
				'style',
				'zIndex',
				'hidden'
			],
			'restProps'
		);

	// Get theme from context or use default
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

	// State for animation
	let displayedText = $.state('');
	let animationIndex = $.state(0);
	let animationTimer = null;

	// Process text based on markdown mode
	let processedText = $.derived(() => () => {
		if ($.strict_equals(markdownMode(), 'none')) {
			return text();
		}

		return markdownToTaggedString(text(), theme, markdownMode());
	});

	// Get the raw text without tags for animation
	function stripTags(taggedText) {
		return taggedText.replace(/{[^}]+}/g, '');
	}

	// Split text for animation
	let textSegments = $.derived(() => () => {
		if (!animated() || $.strict_equals(animationSpeed(), 'instant')) {
			return [$.get(processedText)()];
		}

		const rawText = stripTags($.get(processedText)());

		if ($.strict_equals(animationSpeed(), 'char')) {
			return rawText.split('');
		} else {
			// Split by word, preserving spaces
			return rawText.match(/\S+\s*/g) || [];
		}
	});

	// Animate text display
	function animateText() {
		if (animationTimer) {
			clearInterval(animationTimer);
		}

		if (!animated() || $.strict_equals(animationSpeed(), 'instant')) {
			$.set(displayedText, $.get(processedText)(), true);
			$.set(animationIndex, $.get(textSegments).length, true);
			return;
		}

		$.set(animationIndex, 0);
		$.set(displayedText, '');

		animationTimer = setInterval(
			() => {
				if ($.get(animationIndex) < $.get(textSegments).length) {
					// Build up the displayed text progressively
					const segments = $.get(textSegments).slice(0, $.get(animationIndex) + 1);

					if ($.strict_equals(markdownMode(), 'none')) {
						$.set(displayedText, segments.join(''), true);
					} else {
						// For markdown, we need to rebuild the tagged string up to the current point
						const rawDisplayed = segments.join('');
						const fullRaw = stripTags($.get(processedText)());
						// Find where we are in the full text and extract that portion
						const endIndex = rawDisplayed.length;
						let charCount = 0;
						let taggedResult = '';
						let inTag = false;

						for (let i = 0; i < $.get(processedText)().length; i++) {
							const char = $.get(processedText)()[i];

							if ($.strict_equals(char, '{')) {
								inTag = true;
								taggedResult += char;
							} else if ($.strict_equals(char, '}')) {
								inTag = false;
								taggedResult += char;
							} else if (!inTag) {
								if (charCount < endIndex) {
									taggedResult += char;
									charCount++;
								} else {
									break;
								}
							} else {
								taggedResult += char;
							}
						}

						// Close any open tags
						const openTags = taggedResult.match(/{[^/}]+}/g) || [];
						const closeTags = taggedResult.match(/{\/[^}]+}/g) || [];
						const openTagCounts = {};
						const closeTagCounts = {};

						openTags.forEach((tag) => {
							const tagName = tag.replace(/[{}]/g, '');

							openTagCounts[tagName] = (openTagCounts[tagName] || 0) + 1;
						});

						closeTags.forEach((tag) => {
							const tagName = tag.replace(/[{}/]/g, '');

							closeTagCounts[tagName] = (closeTagCounts[tagName] || 0) + 1;
						});

						// Add closing tags for any unclosed tags
						for (const [tagName, openCount] of Object.entries(openTagCounts)) {
							const closeCount = closeTagCounts[tagName] || 0;

							if (openCount > closeCount) {
								taggedResult += `{/${tagName}}`;
							}
						}

						$.set(displayedText, taggedResult, true);
					}

					$.update(animationIndex);
				} else {
					clearInterval(animationTimer);
					animationTimer = null;
				}
			},
			animationDelay()
		);
	}

	$.user_effect(() => {
		if (text()) {
			animateText();
		}
	});

	// Final display content with cursor
	let finalContent = $.derived(() => () => {
		let content = $.get(displayedText);

		if (showCursor() && animated() && $.get(animationIndex) < $.get(textSegments).length) {
			content += `{${theme.colors.text}-fg}${cursorChar()}{/${theme.colors.text}-fg}`;
		}

		return content;
	});

	$.user_effect(() => {
		return () => {
			if (animationTimer) {
				clearInterval(animationTimer);
			}
		};
	});

	// Convert border prop to blessed-compatible value
	let borderValue = $.derived(() => $.strict_equals(typeof border(), 'boolean') ? border() ? 'line' : false : border());
	var ttext = root();
	let attributes;

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
			style: style(),
			zIndex: $$props.zIndex,
			hidden: hidden(),
			...restProps
		}),
		[() => $.get(finalContent)()]
	);

	$.append($$anchor, ttext);
	return $.pop({ ...$.legacy_api() });
}