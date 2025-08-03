import 'svelte/internal/disclose-version';

Mouse_tracking_demo[$.FILENAME] = 'examples/mouse-tracking-demo.svelte';

import * as $ from 'svelte/internal/client';

import {
	mouseState,
	isMouseOver,
	getMouseRelativePosition
} from '../src/input/simple-mouse-state';

import { globalEventBus } from '../src/dom/reactive-events.svelte.ts';

var root_1 = $.add_locations($.ns_template(`<text top="1" left="1"> </text><text top="2" left="1"> </text><text top="3" left="1"> </text><text top="4" left="1"> </text>`, 1), Mouse_tracking_demo[$.FILENAME], [
	[136, 6],
	[137, 6],
	[138, 6],
	[139, 6]
]);

var on_mousedown = (_, handleDragStart) => handleDragStart('Box 1');
var on_click = (__1, handleBoxClick) => handleBoxClick('Box 1');
var on_mousedown_1 = (__2, handleDragStart) => handleDragStart('Box 2');
var on_click_1 = (__3, handleBoxClick) => handleBoxClick('Box 2');
var root_2 = $.add_locations($.ns_template(`<text left="2"> </text>`), Mouse_tracking_demo[$.FILENAME], [[202, 6]]);

var root = $.add_locations($.template(`<box width="100%" height="100%" border="line" label=" Mouse Tracking Demo "><box width="40" height="8" left="1" top="1" border="line" label=" Mouse State "><text top="0" left="1"> </text> <text top="1" left="1"> </text> <text top="2" left="1"> </text> <text top="3" left="1"> </text> <text top="4" left="1"> </text> <text top="5" left="1"> </text></box> <box width="40" height="8" right="1" top="1" border="line" label=" Drag State "><text top="0" left="1"> </text> <!></box> <box width="30" height="6" left="5" top="10" border="line" label=" Box 1 (Hoverable) "><text align="center" valign="middle"> </text></box> <box width="30" height="6" left="40" top="10" border="line" label=" Box 2 (Clickable) "><text align="center" valign="middle"> </text></box> <box width="60" height="10" left="center" top="18" border="line" label=" Drop Zone "><text top="0" align="center"> </text> <text top="2" left="1">Dropped items:</text> <!></box> <box width="100%-2" height="4" bottom="1" left="1" border="line" label=" Instructions "><text top="0" left="1">• Move mouse to see position tracking</text> <text top="1" left="1">• Hover over boxes to see hover effects</text> <text top="2" left="1">• Click and drag boxes to the drop zone</text></box></box>`), Mouse_tracking_demo[$.FILENAME], [
	[
		102,
		0,
		[
			[
				109,
				2,
				[
					[117, 4],
					[118, 4],
					[119, 4],
					[120, 4],
					[121, 4],
					[122, 4]
				]
			],
			[126, 2, [[134, 4]]],
			[144, 2, [[158, 4]]],
			[163, 2, [[178, 4]]],
			[184, 2, [[197, 4], [200, 4]]],
			[
				209,
				2,
				[[217, 4], [218, 4], [219, 4]]
			]
		]
	]
]);

export default function Mouse_tracking_demo($$anchor, $$props) {
	$.check_target(new.target);
	$.push($$props, true, Mouse_tracking_demo);

	// Mouse state tracking
	let position = $.state($.proxy({ x: 0, y: 0 }));
	let buttons = $.state($.proxy({ left: false, middle: false, right: false }));
	let dragInfo = $.state(null);
	let scrollInfo = $.state($.proxy({ x: 0, y: 0 }));
	let velocity = $.state($.proxy({ x: 0, y: 0 }));
	// Click tracking
	let clickCount = $.state(0);
	let lastClickPos = $.state($.proxy({ x: 0, y: 0 }));
	// Hover states for different elements
	let box1Element = $.state(null);
	let box2Element = $.state(null);
	let box3Element = $.state(null);
	// Hover tracking
	let box1Hovered = $.state(false);
	let box2Hovered = $.state(false);
	let box3Hovered = $.state(false);
	// Drag and drop state
	let draggedBox = $.state(null);
	let dropZoneActive = $.state(false);
	let droppedItems = $.state($.proxy([]));
	// Subscribe to mouse state changes
	let updateCount = $.state(0);

	$.user_effect(() => {
		// Subscribe to mouse state updates
		const unsubscribe = mouseState.subscribe(() => {
			$.update(updateCount);
		});

		return unsubscribe;
	});

	$.user_effect(() => {
		// This will run when updateCount changes
		$.get(updateCount); // Access to create dependency
		$.set(position, mouseState.getPosition(), true);
		$.set(buttons, mouseState.getButtons(), true);
		$.set(dragInfo, mouseState.getDragState(), true);
		$.set(scrollInfo, mouseState.getScrollDelta(), true);
		$.set(velocity, mouseState.getVelocity(), true);
		// Update hover states
		if ($.get(box1Element)) $.set(box1Hovered, isMouseOver($.get(box1Element)), true);
		if ($.get(box2Element)) $.set(box2Hovered, isMouseOver($.get(box2Element)), true);
		if ($.get(box3Element)) $.set(box3Hovered, isMouseOver($.get(box3Element)), true);

		// Update drop zone state
		if ($.get(dragInfo)?.isDragging && $.get(box3Element)) {
			$.set(dropZoneActive, isMouseOver($.get(box3Element)), true);
		} else {
			$.set(dropZoneActive, false);
		}
	});

	// Handle clicks
	function handleBoxClick(boxName) {
		$.update(clickCount);
		$.set(lastClickPos, { ...$.get(position) }, true);
		console.log(...$.log_if_contains_state('log', `Clicked ${boxName} at (${$.get(position).x}, ${$.get(position).y})`));
	}

	// Handle drag start
	function handleDragStart(boxName) {
		if ($.get(buttons).left) {
			$.set(draggedBox, boxName, true);
			console.log(...$.log_if_contains_state('log', `Started dragging ${boxName}`));
		}
	}

	// Handle drop
	function handleDrop() {
		if ($.get(draggedBox) && $.get(dropZoneActive)) {
			$.set(
				droppedItems,
				[
					...$.get(droppedItems),
					{
						name: $.get(draggedBox),
						timestamp: Date.now()
					}
				],
				true
			);

			console.log(...$.log_if_contains_state('log', `Dropped ${$.get(draggedBox)} in drop zone`));
		}

		$.set(draggedBox, null);
	}

	$.user_effect(() => {
		if (!$.get(dragInfo)?.isDragging && $.get(draggedBox)) {
			handleDrop();
		}
	});

	var box = root();
	var box_1 = $.child(box);
	var text = $.child(box_1);
	var text_1 = $.child(text);

	$.reset(text);

	var text_2 = $.sibling(text, 2);
	var text_3 = $.child(text_2);

	$.reset(text_2);

	var text_4 = $.sibling(text_2, 2);
	var text_5 = $.child(text_4);

	$.reset(text_4);

	var text_6 = $.sibling(text_4, 2);
	var text_7 = $.child(text_6);

	$.reset(text_6);

	var text_8 = $.sibling(text_6, 2);
	var text_9 = $.child(text_8);

	$.reset(text_8);

	var text_10 = $.sibling(text_8, 2);
	var text_11 = $.child(text_10);

	$.reset(text_10);
	$.reset(box_1);

	var box_2 = $.sibling(box_1, 2);
	var text_12 = $.child(box_2);
	var text_13 = $.child(text_12);

	$.reset(text_12);

	var node = $.sibling(text_12, 2);

	{
		var consequent = ($$anchor) => {
			var fragment = root_1();
			var text_14 = $.first_child(fragment);
			var text_15 = $.child(text_14);

			$.reset(text_14);

			var text_16 = $.sibling(text_14);
			var text_17 = $.child(text_16);

			$.reset(text_16);

			var text_18 = $.sibling(text_16);
			var text_19 = $.child(text_18);

			$.reset(text_18);

			var text_20 = $.sibling(text_18);
			var text_21 = $.child(text_20);

			$.reset(text_20);

			$.template_effect(() => {
				$.set_text(text_15, `Start: (${$.get(dragInfo).startX ?? ''}, ${$.get(dragInfo).startY ?? ''})`);
				$.set_text(text_17, `Current: (${$.get(dragInfo).currentX ?? ''}, ${$.get(dragInfo).currentY ?? ''})`);
				$.set_text(text_19, `Delta: (${$.get(dragInfo).deltaX ?? ''}, ${$.get(dragInfo).deltaY ?? ''})`);
				$.set_text(text_21, `Dragging: ${($.get(draggedBox) || 'None') ?? ''}`);
			});

			$.append($$anchor, fragment);
		};

		$.if(node, ($$render) => {
			if ($.get(dragInfo)?.isDragging) $$render(consequent);
		});
	}

	$.reset(box_2);

	var box_3 = $.sibling(box_2, 2);

	box_3.__mousedown = [on_mousedown, handleDragStart];
	box_3.__click = [on_click, handleBoxClick];

	var text_22 = $.child(box_3);
	var text_23 = $.child(text_22, true);

	$.reset(text_22);
	$.reset(box_3);
	$.bind_this(box_3, ($$value) => $.set(box1Element, $$value), () => $.get(box1Element));

	var box_4 = $.sibling(box_3, 2);

	box_4.__mousedown = [on_mousedown_1, handleDragStart];
	box_4.__click = [on_click_1, handleBoxClick];

	var text_24 = $.child(box_4);
	var text_25 = $.child(text_24);

	$.reset(text_24);
	$.reset(box_4);
	$.bind_this(box_4, ($$value) => $.set(box2Element, $$value), () => $.get(box2Element));

	var box_5 = $.sibling(box_4, 2);
	var text_26 = $.child(box_5);
	var text_27 = $.child(text_26, true);

	$.reset(text_26);

	var node_1 = $.sibling(text_26, 4);

	$.each(node_1, 17, () => $.get(droppedItems).slice(-5), $.index, ($$anchor, item, i) => {
		var text_28 = root_2();

		$.set_attribute(text_28, 'top', 3 + i);

		var text_29 = $.child(text_28);

		$.reset(text_28);

		$.template_effect(($0) => $.set_text(text_29, `• ${$.get(item).name ?? ''} at ${$0 ?? ''}`), [
			() => new Date($.get(item).timestamp).toLocaleTimeString()
		]);

		$.append($$anchor, text_28);
	});

	$.reset(box_5);
	$.bind_this(box_5, ($$value) => $.set(box3Element, $$value), () => $.get(box3Element));
	$.next(2);
	$.reset(box);

	$.template_effect(
		($0, $1) => {
			$.set_text(text_1, `Position: (${$.get(position).x ?? ''}, ${$.get(position).y ?? ''})`);
			$.set_text(text_3, `Buttons: L:${$.get(buttons).left ?? ''} M:${$.get(buttons).middle ?? ''} R:${$.get(buttons).right ?? ''}`);
			$.set_text(text_5, `Velocity: (${$0 ?? ''}, ${$1 ?? ''}) px/s`);
			$.set_text(text_7, `Scroll: (${$.get(scrollInfo).x ?? ''}, ${$.get(scrollInfo).y ?? ''})`);
			$.set_text(text_9, `Clicks: ${$.get(clickCount) ?? ''}`);
			$.set_text(text_11, `Last Click: (${$.get(lastClickPos).x ?? ''}, ${$.get(lastClickPos).y ?? ''})`);
			$.set_text(text_13, `Dragging: ${($.get(dragInfo)?.isDragging || false) ?? ''}`);
			$.set_style(box_3, { bg: $.get(box1Hovered) ? 'blue' : 'black' });
			$.set_text(text_23, $.get(box1Hovered) ? '🔵 HOVERED' : 'Hover me!');

			$.set_style(box_4, {
				bg: $.get(box2Hovered) ? 'green' : 'black',
				bold: $.get(box2Hovered)
			});

			$.set_text(text_25, `Click me! (${$.get(clickCount) ?? ''} clicks)`);

			$.set_style(box_5, {
				bg: $.get(dropZoneActive) ? 'yellow' : 'black',
				fg: $.get(dropZoneActive) ? 'black' : 'white'
			});

			$.set_text(text_27, $.get(dropZoneActive) ? '📦 DROP HERE!' : 'Drag boxes here');
		},
		[
			() => $.get(velocity).x.toFixed(1),
			() => $.get(velocity).y.toFixed(1)
		]
	);

	$.append($$anchor, box);
	return $.pop({ ...$.legacy_api() });
}

$.delegate(['mousedown', 'click']);