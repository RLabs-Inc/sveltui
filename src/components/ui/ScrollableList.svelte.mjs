import 'svelte/internal/disclose-version';

ScrollableList[$.FILENAME] = 'src/components/ui/ScrollableList.svelte';

import * as $ from 'svelte/internal/client';

var root_1 = $.add_locations($.template(`<box border="line"><text></text> <text></text></box>`), ScrollableList[$.FILENAME], [[441, 4, [[449, 6], [455, 6]]]]);
var root_4 = $.add_locations($.ns_template(`<text></text>`), ScrollableList[$.FILENAME], [[491, 10]]);
var root_2 = $.add_locations($.template(`<box><!></box>`), ScrollableList[$.FILENAME], [[475, 6]]);
var root_5 = $.add_locations($.ns_template(`<text></text>`), ScrollableList[$.FILENAME], [[501, 6]]);
var root_7 = $.add_locations($.ns_template(`<text content="↑"></text>`), ScrollableList[$.FILENAME], [[521, 8]]);
var root_8 = $.add_locations($.ns_template(`<text content="↓"></text>`), ScrollableList[$.FILENAME], [[530, 8]]);
var root_6 = $.add_locations($.template(`<box><!> <!> <box></box></box>`), ScrollableList[$.FILENAME], [[512, 4, [[539, 6]]]]);

var root = $.add_locations(
	$.template(
		`/**
 * ScrollableList Component
 * 
 * A powerful scrollable list component with keyboard navigation, search, and smooth scrolling.
 * Perfect for Claude CLI's conversation selector, model chooser, and file browser.
 * 
 * Features:
 * - Keyboard navigation (arrows, page up/down, home/end)
 * - Smooth scrolling that follows selection
 * - Optional search/filter functionality
 * - Custom item rendering via slots
 * - Visual scroll indicators
 * - Controlled and uncontrolled modes
 * - 60 FPS smooth rendering
 */ <box><!> <box><!> <!></box> <!> <!></box>`,
		1
	),
	ScrollableList[$.FILENAME],
	[[417, 0, [[465, 2]]]]
);

export default function ScrollableList($$anchor, $$props) {
	$.check_target(new.target);
	$.push($$props, true, ScrollableList);

	// Define component props with defaults
	let left = $.prop($$props, 'left', 3, 0),
		top = $.prop($$props, 'top', 3, 0),
		width = $.prop($$props, 'width', 3, '100%'),
		height = $.prop($$props, 'height', 3, '50%'),
		items = $.prop($$props, 'items', 19, () => []),
		selectedIndex = $.prop($$props, 'selectedIndex', 15, 0),
		focusedIndex = $.prop($$props, 'focusedIndex', 15, 0),
		searchable = $.prop($$props, 'searchable', 3, false),
		searchPlaceholder = $.prop($$props, 'searchPlaceholder', 3, 'Type to search...'),
		border = $.prop($$props, 'border', 3, 'line'),
		label = $.prop($$props, 'label', 3, ''),
		scrollbar = $.prop($$props, 'scrollbar', 3, true),
		alwaysScroll = $.prop($$props, 'alwaysScroll', 3, false),
		keys = $.prop($$props, 'keys', 3, true),
		vi = $.prop($$props, 'vi', 3, false),
		mouse = $.prop($$props, 'mouse', 3, true),
		focusable = $.prop($$props, 'focusable', 3, true),
		autoFocus = $.prop($$props, 'autoFocus', 3, false),
		style = $.prop($$props, 'style', 19, () => ({})),
		selectedStyle = $.prop($$props, 'selectedStyle', 19, () => ({ fg: 'black', bg: 'white', bold: true })),
		focusedStyle = $.prop($$props, 'focusedStyle', 19, () => ({ fg: 'yellow', bold: true })),
		scrollbarStyle = $.prop($$props, 'scrollbarStyle', 19, () => ({ bg: 'white', fg: 'blue' })),
		pageSize = $.prop($$props, 'pageSize', 3, 10),
		virtualScroll = $.prop($$props, 'virtualScroll', 3, true),
		hidden = $.prop($$props, 'hidden', 3, false),
		restProps = $.rest_props(
			$$props,
			[
				'$$slots',
				'$$events',
				'$$legacy',
				'left',
				'top',
				'right',
				'bottom',
				'width',
				'height',
				'items',
				'selectedIndex',
				'focusedIndex',
				'onSelect',
				'onFocus',
				'onChange',
				'onScroll',
				'searchable',
				'searchPlaceholder',
				'filterFn',
				'border',
				'label',
				'scrollbar',
				'alwaysScroll',
				'keys',
				'vi',
				'mouse',
				'focusable',
				'autoFocus',
				'style',
				'selectedStyle',
				'focusedStyle',
				'scrollbarStyle',
				'itemRenderer',
				'pageSize',
				'virtualScroll',
				'zIndex',
				'hidden',
				'children'
			],
			'restProps'
		);

	// Internal state
	let searchQuery = $.state('');
	let scrollOffset = $.state(0);
	let isSearchFocused = $.state(false);
	let isFocused = $.state(false);

	// Filtered items based on search
	let filteredItems = $.derived(() => () => {
		if (!$.get(searchQuery)) return items();

		const query = $.get(searchQuery).toLowerCase();

		if ($$props.filterFn) {
			return items().filter((item) => $$props.filterFn(item, query));
		}

		// Default filter: case-insensitive label match
		return items().filter((item) => item.label.toLowerCase().includes(query));
	});

	$.user_effect(() => {
		if (focusedIndex() >= $.get(filteredItems).length) {
			focusedIndex(Math.max(0, $.get(filteredItems).length - 1));
		}
	});

	$.user_effect(() => {
		const itemHeight = 1;
		const focusedPosition = focusedIndex() * itemHeight;
		const estimatedVisibleHeight = 10; // Estimate based on typical terminal size

		// Scroll up if focused item is above visible area
		if (focusedPosition < $.get(scrollOffset)) {
			$.set(scrollOffset, focusedPosition);
			$$props.onScroll?.($.get(scrollOffset));
		}

		// Scroll down if focused item is below visible area
		if (focusedPosition >= $.get(scrollOffset) + estimatedVisibleHeight - 1) {
			$.set(scrollOffset, focusedPosition - estimatedVisibleHeight + 2);
			$$props.onScroll?.($.get(scrollOffset));
		}
	});

	// Handle keyboard navigation
	function handleKeypress(event) {
		if (!keys() || !$.get(isFocused)) return;

		// Search mode
		if (searchable() && $.get(isSearchFocused)) {
			if ($.strict_equals(event.key, 'escape')) {
				$.set(isSearchFocused, false);
				$.set(searchQuery, '');
				event.preventDefault();
			} else if ($.strict_equals(event.key, 'enter') || $.strict_equals(event.key, 'down')) {
				$.set(isSearchFocused, false);
				focusedIndex(0);
				event.preventDefault();
			}

			return;
		}

		// List navigation
		switch (event.key) {
			case 'up':

			case vi() && 'k':
				navigateUp();
				event.preventDefault();
				break;

			case 'down':

			case vi() && 'j':
				navigateDown();
				event.preventDefault();
				break;

			case 'pageup':

			case vi() && 'C-b':
				navigatePageUp();
				event.preventDefault();
				break;

			case 'pagedown':

			case vi() && 'C-f':
				navigatePageDown();
				event.preventDefault();
				break;

			case 'home':

			case vi() && 'g':
				navigateHome();
				event.preventDefault();
				break;

			case 'end':

			case vi() && 'G':
				navigateEnd();
				event.preventDefault();
				break;

			case 'enter':

			case 'space':
				selectFocused();
				event.preventDefault();
				break;

			case '/':
				if (searchable() && !$.get(isSearchFocused)) {
					$.set(isSearchFocused, true);
					$.set(searchQuery, '');
					event.preventDefault();
				}
				break;

			case 'escape':
				if (searchable() && $.get(searchQuery)) {
					$.set(searchQuery, '');
					event.preventDefault();
				}
				break;
		}
	}

	// Navigation functions
	function navigateUp() {
		const newIndex = Math.max(0, focusedIndex() - 1);

		if ($.strict_equals(newIndex, focusedIndex(), false)) {
			focusedIndex(newIndex);

			const item = $.get(filteredItems)[newIndex];

			if (item && !item.disabled) {
				$$props.onFocus?.(item, newIndex);
			}
		}
	}

	function navigateDown() {
		const newIndex = Math.min($.get(filteredItems).length - 1, focusedIndex() + 1);

		if ($.strict_equals(newIndex, focusedIndex(), false)) {
			focusedIndex(newIndex);

			const item = $.get(filteredItems)[newIndex];

			if (item && !item.disabled) {
				$$props.onFocus?.(item, newIndex);
			}
		}
	}

	function navigatePageUp() {
		const newIndex = Math.max(0, focusedIndex() - pageSize());

		focusedIndex(newIndex);

		const item = $.get(filteredItems)[newIndex];

		if (item && !item.disabled) {
			$$props.onFocus?.(item, newIndex);
		}
	}

	function navigatePageDown() {
		const newIndex = Math.min($.get(filteredItems).length - 1, focusedIndex() + pageSize());

		focusedIndex(newIndex);

		const item = $.get(filteredItems)[newIndex];

		if (item && !item.disabled) {
			$$props.onFocus?.(item, newIndex);
		}
	}

	function navigateHome() {
		focusedIndex(0);

		const item = $.get(filteredItems)[0];

		if (item && !item.disabled) {
			$$props.onFocus?.(item, 0);
		}
	}

	function navigateEnd() {
		focusedIndex($.get(filteredItems).length - 1);

		const item = $.get(filteredItems)[focusedIndex()];

		if (item && !item.disabled) {
			$$props.onFocus?.(item, focusedIndex());
		}
	}

	function selectFocused() {
		const item = $.get(filteredItems)[focusedIndex()];

		if (item && !item.disabled) {
			selectedIndex(focusedIndex());
			$$props.onSelect?.(item, focusedIndex());
			$$props.onChange?.(item, focusedIndex());
		}
	}

	// Handle mouse click
	function handleMouseClick(index) {
		if (!mouse()) return;

		const item = $.get(filteredItems)[index];

		if (item && !item.disabled) {
			focusedIndex(index);
			selectedIndex(index);
			$$props.onFocus?.(item, index);
			$$props.onSelect?.(item, index);
			$$props.onChange?.(item, index);
		}
	}

	// Handle focus
	function handleFocus() {
		$.set(isFocused, true);

		if (autoFocus() && $.get(filteredItems).length > 0) {
			const item = $.get(filteredItems)[focusedIndex()];

			if (item) {
				$$props.onFocus?.(item, focusedIndex());
			}
		}
	}

	function handleBlur() {
		$.set(isFocused, false);
	}

	// Calculate if scrollbar is needed
	let showScrollbar = $.derived(() => scrollbar() && (alwaysScroll() || $.get(filteredItems).length > pageSize()));

	// Calculate scrollbar position and size
	let scrollbarHeight = $.derived(() => () => {
		if (!$.get(showScrollbar)) return 0;

		const contentHeight = $.get(filteredItems).length;
		const visibleHeight = pageSize();

		return Math.max(1, Math.floor(visibleHeight / contentHeight * visibleHeight));
	});

	let scrollbarTop = $.derived(() => () => {
		if (!$.get(showScrollbar)) return 0;

		const contentHeight = $.get(filteredItems).length;
		const visibleHeight = pageSize();
		const maxScroll = contentHeight - visibleHeight;

		if (maxScroll <= 0) return 0;
		return Math.floor($.get(scrollOffset) / maxScroll * (visibleHeight - $.get(scrollbarHeight)));
	});

	// Convert border prop
	let borderValue = $.derived(() => $.strict_equals(typeof border(), 'boolean') ? border() ? 'line' : false : border());

	// Merge styles
	let mergedStyle = $.derived(() => ({
		...style(),
		selected: {
			...selectedStyle(),
			...style().selected || {}
		},
		item: { ...style().item || {} },
		scrollbar: {
			...scrollbarStyle(),
			...style().scrollbar || {}
		}
	}));

	$.next();

	var fragment = root();
	var box = $.sibling($.first_child(fragment));
	let attributes;
	var node = $.child(box);

	{
		var consequent = ($$anchor) => {
			var box_1 = root_1();

			$.set_attribute(box_1, 'top', 0);
			$.set_attribute(box_1, 'left', 0);
			$.set_attribute(box_1, 'height', 3);

			var text = $.child(box_1);

			$.set_attribute(text, 'top', 0);
			$.set_attribute(text, 'left', 1);
			$.set_style(text, { fg: 'yellow', bold: true });

			var text_1 = $.sibling(text, 2);

			$.set_attribute(text_1, 'top', 0);
			$.set_attribute(text_1, 'left', 3);
			$.reset(box_1);

			$.template_effect(() => {
				$.set_attribute(box_1, 'right', $.get(showScrollbar) ? 1 : 0);

				$.set_style(box_1, {
					border: {
						fg: $.get(isSearchFocused) ? 'yellow' : 'white'
					}
				});

				$.set_attribute(text, 'content', $.get(isSearchFocused) ? '> ' : '  ');
				$.set_attribute(text_1, 'content', $.get(searchQuery) || searchPlaceholder());
				$.set_style(text_1, { fg: $.get(searchQuery) ? 'white' : 'gray' });
			});

			$.append($$anchor, box_1);
		};

		$.if(node, ($$render) => {
			if (searchable()) $$render(consequent);
		});
	}

	var box_2 = $.sibling(node, 2);

	$.set_attribute(box_2, 'left', 0);
	$.set_attribute(box_2, 'bottom', 0);
	$.set_attribute(box_2, 'scrollable', true);

	var node_1 = $.child(box_2);

	$.each(node_1, 17, () => $.get(filteredItems), $.index, ($$anchor, item, index) => {
		var box_3 = root_2();

		$.set_attribute(box_3, 'top', index);
		$.set_attribute(box_3, 'left', 0);
		$.set_attribute(box_3, 'right', 0);
		$.set_attribute(box_3, 'height', 1);
		box_3.__click = () => handleMouseClick(index);

		var node_2 = $.child(box_3);

		{
			var consequent_1 = ($$anchor) => {
				var fragment_1 = $.comment();
				var node_3 = $.first_child(fragment_1);

				$.snippet(node_3, () => $$props.itemRenderer, () => $.get(item), () => index, () => $.strict_equals(index, selectedIndex()), () => $.strict_equals(index, focusedIndex()));
				$.append($$anchor, fragment_1);
			};

			var alternate = ($$anchor) => {
				var text_2 = root_4();

				$.set_attribute(text_2, 'left', 1);
				$.template_effect(() => $.set_attribute(text_2, 'content', `${$.strict_equals(index, selectedIndex()) ? '▶ ' : '  '}${$.get(item).label}`));
				$.append($$anchor, text_2);
			};

			$.if(node_2, ($$render) => {
				if ($$props.itemRenderer) $$render(consequent_1); else $$render(alternate, false);
			});
		}

		$.reset(box_3);

		$.template_effect(
			($0) => {
				$.set_attribute(box_3, 'mouse', mouse());
				$.set_style(box_3, $0);
			},
			[
				() => ({
					...$.strict_equals(index, selectedIndex()) ? $.get(mergedStyle).selected : {},
					...$.strict_equals(index, focusedIndex()) && $.get(isFocused) ? focusedStyle() : {},
					...$.get(item).disabled ? { fg: 'gray' } : {}
				})
			]
		);

		$.append($$anchor, box_3);
	});

	var node_4 = $.sibling(node_1, 2);

	{
		var consequent_2 = ($$anchor) => {
			var text_3 = root_5();

			$.set_attribute(text_3, 'top', 1);
			$.set_attribute(text_3, 'left', 1);
			$.set_style(text_3, { fg: 'gray' });
			$.template_effect(() => $.set_attribute(text_3, 'content', $.get(searchQuery) ? 'No matching items' : 'No items to display'));
			$.append($$anchor, text_3);
		};

		$.if(node_4, ($$render) => {
			if ($.strict_equals($.get(filteredItems).length, 0)) $$render(consequent_2);
		});
	}

	$.reset(box_2);

	var node_5 = $.sibling(box_2, 2);

	{
		var consequent_5 = ($$anchor) => {
			var box_4 = root_6();

			$.set_attribute(box_4, 'right', 0);
			$.set_attribute(box_4, 'width', 1);
			$.set_attribute(box_4, 'bottom', 0);
			$.set_style(box_4, { bg: 'black' });

			var node_6 = $.child(box_4);

			{
				var consequent_3 = ($$anchor) => {
					var text_4 = root_7();

					$.set_attribute(text_4, 'top', 0);
					$.set_attribute(text_4, 'left', 0);
					$.set_style(text_4, { fg: 'white', bold: true });
					$.append($$anchor, text_4);
				};

				$.if(node_6, ($$render) => {
					if ($.get(scrollOffset) > 0) $$render(consequent_3);
				});
			}

			var node_7 = $.sibling(node_6, 2);

			{
				var consequent_4 = ($$anchor) => {
					var text_5 = root_8();

					$.set_attribute(text_5, 'bottom', 0);
					$.set_attribute(text_5, 'left', 0);
					$.set_style(text_5, { fg: 'white', bold: true });
					$.append($$anchor, text_5);
				};

				$.if(node_7, ($$render) => {
					if ($.get(scrollOffset) + pageSize() < $.get(filteredItems).length) $$render(consequent_4);
				});
			}

			var box_5 = $.sibling(node_7, 2);

			$.set_attribute(box_5, 'left', 0);
			$.set_attribute(box_5, 'width', 1);
			$.reset(box_4);

			$.template_effect(() => {
				$.set_attribute(box_4, 'top', searchable() ? 3 : 0);
				$.set_attribute(box_5, 'top', $.get(scrollbarTop) + ($.get(scrollOffset) > 0 ? 1 : 0));
				$.set_attribute(box_5, 'height', $.get(scrollbarHeight));
				$.set_style(box_5, $.get(mergedStyle).scrollbar);
			});

			$.append($$anchor, box_4);
		};

		$.if(node_5, ($$render) => {
			if ($.get(showScrollbar)) $$render(consequent_5);
		});
	}

	var node_8 = $.sibling(node_5, 2);

	{
		var consequent_6 = ($$anchor) => {
			var fragment_2 = $.comment();
			var node_9 = $.first_child(fragment_2);

			$.snippet(node_9, () => $$props.children);
			$.append($$anchor, fragment_2);
		};

		$.if(node_8, ($$render) => {
			if ($$props.children) $$render(consequent_6);
		});
	}

	$.reset(box);

	$.template_effect(() => {
		attributes = $.set_attributes(box, attributes, {
			left: left(),
			top: top(),
			right: $$props.right,
			bottom: $$props.bottom,
			width: width(),
			height: height(),
			border: $.get(borderValue),
			label: label(),
			style: $.get(mergedStyle),
			scrollable: true,
			alwaysScroll: alwaysScroll(),
			keys: keys(),
			mouse: mouse(),
			focusable: focusable(),
			focused: autoFocus(),
			zIndex: $$props.zIndex,
			hidden: hidden(),
			onkeypress: handleKeypress,
			onfocus: handleFocus,
			onblur: handleBlur,
			...restProps
		});

		$.set_attribute(box_2, 'top', searchable() ? 3 : 0);
		$.set_attribute(box_2, 'right', $.get(showScrollbar) ? 1 : 0);
		$.set_attribute(box_2, 'alwaysscroll', alwaysScroll());
		$.set_style(box_2, $.get(mergedStyle));
	});

	$.append($$anchor, fragment);
	return $.pop({ ...$.legacy_api() });
}

$.delegate(['click']);