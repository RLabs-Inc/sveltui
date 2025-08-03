import 'svelte/internal/disclose-version';

Reactive_events_demo[$.FILENAME] = 'examples/reactive-events-demo.svelte';

import * as $ from 'svelte/internal/client';

import {
	globalEventBus,
	createEventSummary,
	createEventWatcher
} from '../src/dom/reactive-events.svelte.ts';

import { getElementEventEmitter } from '../src/dom/reactive-events.svelte.ts';

var root_1 = $.add_locations($.ns_template(`<text left="2"> </text>`), Reactive_events_demo[$.FILENAME], [[97, 6]]);
var root_2 = $.add_locations($.ns_template(`<text left="1"> <!></text>`), Reactive_events_demo[$.FILENAME], [[132, 6]]);
var root_4 = $.add_locations($.ns_template(`<text left="2"> </text>`), Reactive_events_demo[$.FILENAME], [[152, 6]]);
var root_5 = $.add_locations($.ns_template(`<text left="2"> </text>`), Reactive_events_demo[$.FILENAME], [[157, 6]]);

var root = $.add_locations(
	$.template(`<box top="0" left="0" width="100%" height="100%" label=" Reactive Events Demo " scrollable=""><box top="0" left="0" width="50%" height="40%" label=" Event Summary "><text top="0" left="1"> </text> <text top="1" left="1"> </text> <text top="3" left="1">Most Frequent:</text> <!></box> <box top="0" left="50%" width="50%" height="40%" label=" Event Tracking "><text top="0" left="1"> </text> <text top="1" left="1"> </text> <text top="2" left="1"> </text> <text top="4" left="1"> </text> <text top="5" left="1"> </text> <text top="7" left="1"> </text> <text top="8" left="1"> </text></box> <box top="40%" left="0" width="50%" height="30%" label=" Recent Events " scrollable=""></box> <box top="40%" left="50%" width="50%" height="30%" label=" Event Types "><text top="0" left="1" bold="">Mouse Events:</text> <!> <text top="6" left="1" bold="">Keyboard Events:</text> <!></box> <box top="70%" left="0" width="100%" height="30%" label=" Interactive Elements "><button top="1" left="2" width="20" height="3">Send Custom Event</button> <button top="1" left="24" width="15" height="3">Clear History</button> <button top="1" left="41" width="15" height="3">Reset Counts</button> <list top="5" left="2" width="30" height="5" mouse="" keys=""></list> <text top="5" left="35">Click buttons, press keys, and interact
      with elements to see reactive events!</text> <text top="7" left="35" fg="yellow">Press 'q' or Ctrl+C to exit</text></box></box>`),
	Reactive_events_demo[$.FILENAME],
	[
		[
			75,
			0,
			[
				[
					85,
					2,
					[[93, 4], [94, 4], [95, 4]]
				],
				[
					102,
					2,
					[
						[110, 4],
						[111, 4],
						[112, 4],
						[114, 4],
						[115, 4],
						[117, 4],
						[118, 4]
					]
				],
				[122, 2],
				[142, 2, [[150, 4], [155, 4]]],
				[
					162,
					2,
					[
						[170, 4],
						[182, 4],
						[193, 4],
						[204, 4],
						[216, 4],
						[221, 4]
					]
				]
			]
		]
	]
);

export default function Reactive_events_demo($$anchor, $$props) {
	$.check_target(new.target);
	$.push($$props, true, Reactive_events_demo);

	// Component state
	let boxElement = null;
	let buttonElement = $.state(null);
	let listElement = $.state(null);
	// Create event summary for global events
	const getSummary = createEventSummary(globalEventBus);
	let globalSummary = $.derived(getSummary);
	// Track specific event counts reactively
	let clickCount = $.derived(() => globalEventBus.getEventCount('click'));
	let keypressCount = $.derived(() => globalEventBus.getEventCount('keypress'));
	let focusCount = $.derived(() => globalEventBus.getEventCount('focus'));
	// Track last events
	let lastClickEvent = $.derived(() => globalEventBus.getLastEvent('click'));
	let lastKeypressEvent = $.derived(() => globalEventBus.getLastEvent('keypress'));
	// Event history
	let eventHistory = $.derived(() => globalEventBus.getEventHistory());
	let recentEvents = $.derived(() => $.get(eventHistory).slice(-5).reverse());

	// Event rate tracking
	globalEventBus.trackEventRate('click', 5000);
	globalEventBus.trackEventRate('keypress', 5000);

	let clickRate = $.derived(() => globalEventBus.getEventRate('click'));
	let keypressRate = $.derived(() => globalEventBus.getEventRate('keypress'));

	// Filter event counts by type
	let mouseEventCounts = $.derived(() => globalEventBus.getFilteredEventCounts((type) => [
		'click',
		'mousedown',
		'mouseup',
		'mousemove'
	].includes(type)));

	let keyboardEventCounts = $.derived(() => globalEventBus.getFilteredEventCounts((type) => ['keypress', 'keydown', 'keyup'].includes(type)));

	// Custom event handling
	function sendCustomEvent() {
		globalEventBus.emit('custom-action', {
			message: 'Custom event triggered!',
			timestamp: new Date().toISOString()
		});
	}

	// Clear history
	function clearHistory() {
		globalEventBus.clearHistory();
	}

	// Reset counts
	function resetCounts() {
		globalEventBus.resetCounts();
	}

	$.user_effect(() => {
		createEventWatcher(globalEventBus, 'custom-action', (event) => {
			if (event) {
				// Side effect: log custom events
				console.log(...$.log_if_contains_state('log', 'Custom event received:', event.data));
			}
		});
	});

	var box = root();

	$.set_attribute(box, 'border', { type: 'line' });

	var box_1 = $.child(box);

	$.set_attribute(box_1, 'border', { type: 'line' });

	var text = $.child(box_1);
	var text_1 = $.child(text);

	$.reset(text);

	var text_2 = $.sibling(text, 2);
	var text_3 = $.child(text_2);

	$.reset(text_2);

	var node = $.sibling(text_2, 4);

	$.each(node, 17, () => $.get(globalSummary).mostFrequent, $.index, ($$anchor, event, i) => {
		var text_4 = root_1();

		$.set_attribute(text_4, 'top', 4 + i);

		var text_5 = $.child(text_4);

		$.reset(text_4);
		$.template_effect(() => $.set_text(text_5, `${$.get(event).type ?? ''}: ${$.get(event).count ?? ''}`));
		$.append($$anchor, text_4);
	});

	$.reset(box_1);

	var box_2 = $.sibling(box_1, 2);

	$.set_attribute(box_2, 'border', { type: 'line' });

	var text_6 = $.child(box_2);
	var text_7 = $.child(text_6);

	$.reset(text_6);

	var text_8 = $.sibling(text_6, 2);
	var text_9 = $.child(text_8);

	$.reset(text_8);

	var text_10 = $.sibling(text_8, 2);
	var text_11 = $.child(text_10);

	$.reset(text_10);

	var text_12 = $.sibling(text_10, 2);
	var text_13 = $.child(text_12);

	$.reset(text_12);

	var text_14 = $.sibling(text_12, 2);
	var text_15 = $.child(text_14);

	$.reset(text_14);

	var text_16 = $.sibling(text_14, 2);
	var text_17 = $.child(text_16);

	$.reset(text_16);

	var text_18 = $.sibling(text_16, 2);
	var text_19 = $.child(text_18);

	$.reset(text_18);
	$.reset(box_2);

	var box_3 = $.sibling(box_2, 2);

	$.set_attribute(box_3, 'border', { type: 'line' });

	$.each(box_3, 21, () => $.get(recentEvents), $.index, ($$anchor, event, i) => {
		var text_20 = root_2();

		$.set_attribute(text_20, 'top', i);

		var text_21 = $.child(text_20);
		var node_1 = $.sibling(text_21);

		{
			var consequent = ($$anchor) => {
				var text_22 = $.text();

				$.template_effect(($0) => $.set_text(text_22, `- ${$0 ?? ''}...`), [
					() => JSON.stringify($.get(event).data).slice(0, 30)
				]);

				$.append($$anchor, text_22);
			};

			$.if(node_1, ($$render) => {
				if ($.get(event).data) $$render(consequent);
			});
		}

		$.reset(text_20);

		$.template_effect(($0) => $.set_text(text_21, `[${$0 ?? ''}] ${$.get(event).type ?? ''} `), [
			() => new Date($.get(event).timestamp).toLocaleTimeString()
		]);

		$.append($$anchor, text_20);
	});

	$.reset(box_3);

	var box_4 = $.sibling(box_3, 2);

	$.set_attribute(box_4, 'border', { type: 'line' });

	var node_2 = $.sibling($.child(box_4), 2);

	$.each(node_2, 17, () => Object.entries($.get(mouseEventCounts)), $.index, ($$anchor, $$item, i) => {
		let type = () => $.get($$item)[0];

		type();

		let count = () => $.get($$item)[1];

		count();

		var text_23 = root_4();

		$.set_attribute(text_23, 'top', 1 + i);

		var text_24 = $.child(text_23);

		$.reset(text_23);
		$.template_effect(() => $.set_text(text_24, `${type() ?? ''}: ${count() ?? ''}`));
		$.append($$anchor, text_23);
	});

	var node_3 = $.sibling(node_2, 4);

	$.each(node_3, 17, () => Object.entries($.get(keyboardEventCounts)), $.index, ($$anchor, $$item, i) => {
		let type = () => $.get($$item)[0];

		type();

		let count = () => $.get($$item)[1];

		count();

		var text_25 = root_5();

		$.set_attribute(text_25, 'top', 7 + i);

		var text_26 = $.child(text_25);

		$.reset(text_25);
		$.template_effect(() => $.set_text(text_26, `${type() ?? ''}: ${count() ?? ''}`));
		$.append($$anchor, text_25);
	});

	$.reset(box_4);

	var box_5 = $.sibling(box_4, 2);

	$.set_attribute(box_5, 'border', { type: 'line' });

	var button = $.child(box_5);

	$.set_attribute(button, 'border', { type: 'line' });
	$.bind_this(button, ($$value) => $.set(buttonElement, $$value), () => $.get(buttonElement));

	var button_1 = $.sibling(button, 2);

	$.set_attribute(button_1, 'border', { type: 'line' });

	var button_2 = $.sibling(button_1, 2);

	$.set_attribute(button_2, 'border', { type: 'line' });

	var list = $.sibling(button_2, 2);

	$.set_attribute(list, 'border', { type: 'line' });
	$.set_attribute(list, 'items', ['Option 1', 'Option 2', 'Option 3']);
	$.bind_this(list, ($$value) => $.set(listElement, $$value), () => $.get(listElement));
	$.next(4);
	$.reset(box_5);
	$.reset(box);

	$.template_effect(
		($0, $1) => {
			$.set_text(text_1, `Total Events: ${$.get(globalSummary).total ?? ''}`);
			$.set_text(text_3, `Event Types: ${$.get(globalSummary).types ?? ''}`);
			$.set_text(text_7, `Click Count: ${$.get(clickCount) ?? ''}`);
			$.set_text(text_9, `Keypress Count: ${$.get(keypressCount) ?? ''}`);
			$.set_text(text_11, `Focus Count: ${$.get(focusCount) ?? ''}`);
			$.set_text(text_13, `Click Rate: ${$0 ?? ''}/sec`);
			$.set_text(text_15, `Keypress Rate: ${$1 ?? ''}/sec`);
			$.set_text(text_17, `Last Click: ${$.get(lastClickEvent) ? `(${$.get(lastClickEvent).data?.x}, ${$.get(lastClickEvent).data?.y})` : 'None'}`);
			$.set_text(text_19, `Last Key: ${($.get(lastKeypressEvent) ? $.get(lastKeypressEvent).data?.key : 'None') ?? ''}`);
		},
		[
			() => $.get(clickRate).toFixed(2),
			() => $.get(keypressRate).toFixed(2)
		]
	);

	$.event('press', button, sendCustomEvent);
	$.event('press', button_1, clearHistory);
	$.event('press', button_2, resetCounts);
	$.append($$anchor, box);
	return $.pop({ ...$.legacy_api() });
}