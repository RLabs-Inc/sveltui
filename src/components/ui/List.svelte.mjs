import 'svelte/internal/disclose-version';

List[$.FILENAME] = 'src/components/ui/List.svelte';

import * as $ from 'svelte/internal/client';

var root = $.add_locations(
	$.template(
		`/**
 * List Component
 * 
 * An interactive list component for selection from a list of items
 */ <list></list>`,
		1
	),
	List[$.FILENAME],
	[[104, 0]]
);

export default function List($$anchor, $$props) {
	$.check_target(new.target);
	$.push($$props, true, List);

	// Define component props with defaults
	let left = $.prop($$props, 'left', 3, 0),
		top = $.prop($$props, 'top', 3, 0),
		width = $.prop($$props, 'width', 3, '100%'),
		height = $.prop($$props, 'height', 3, 'shrink'),
		items = $.prop($$props, 'items', 19, () => []),
		selected = $.prop($$props, 'selected', 15, 0),
		interactive = $.prop($$props, 'interactive', 3, true),
		keys = $.prop($$props, 'keys', 3, true),
		vi = $.prop($$props, 'vi', 3, false),
		mouse = $.prop($$props, 'mouse', 3, true),
		border = $.prop($$props, 'border', 3, false),
		style = $.prop($$props, 'style', 19, () => ({})),
		selectedStyle = $.prop($$props, 'selectedStyle', 19, () => ({})),
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
				'selected',
				'onSelect',
				'onAction',
				'onFocus',
				'interactive',
				'keys',
				'vi',
				'mouse',
				'border',
				'style',
				'selectedStyle',
				'zIndex',
				'hidden'
			],
			'restProps'
		);

	// Use selected directly from props since it's bindable
	// No need for internal state tracking
	// Convert border prop to blessed-compatible value
	let borderValue = $.derived(() => $.strict_equals(typeof border(), 'boolean') ? border() ? 'line' : false : border());

	// Merge styles for selected item
	let mergedStyle = $.derived(() => ({
		...style(),
		selected: {
			...selectedStyle(),
			...style().selected || {}
		}
	}));

	// Handle selection
	function handleSelect(index) {
		if (index >= 0 && index < items().length) {
			selected(index);
			$$props.onSelect?.({ index, item: items()[index] });
		}
	}

	// Handle keypress events
	function handleKeypress(event) {
		if (!interactive()) return;

		if ($.strict_equals(event.key, 'up') || vi() && $.strict_equals(event.key, 'k')) {
			handleSelect(Math.max(0, selected() - 1));
		} else if ($.strict_equals(event.key, 'down') || vi() && $.strict_equals(event.key, 'j')) {
			handleSelect(Math.min(items().length - 1, selected() + 1));
		} else if ($.strict_equals(event.key, 'enter')) {
			$$props.onAction?.({
				index: selected(),
				item: items()[selected()]
			});
		}
	}

	function focus() {
		// This will be handled by the runtime DOM connector
		$$props.onFocus?.();
	}

	$.next();

	var fragment = root();
	var list = $.sibling($.first_child(fragment));
	var event_handler = (e) => handleSelect(e.detail.index);
	let attributes;

	$.template_effect(() => attributes = $.set_attributes(list, attributes, {
		left: left(),
		top: top(),
		right: $$props.right,
		bottom: $$props.bottom,
		width: width(),
		height: height(),
		items: items(),
		selected: selected(),
		border: $.get(borderValue),
		style: $.get(mergedStyle),
		keys: keys(),
		vi: vi(),
		mouse: mouse(),
		interactive: interactive(),
		zIndex: $$props.zIndex,
		hidden: hidden(),
		onkeypress: handleKeypress,
		onselect: event_handler,
		...restProps
	}));

	$.append($$anchor, fragment);

	return $.pop({
		get focus() {
			return focus;
		},
		...$.legacy_api()
	});
}