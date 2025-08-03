import 'svelte/internal/disclose-version';

Render_scheduler_demo[$.FILENAME] = 'examples/render-scheduler-demo.svelte';

import * as $ from 'svelte/internal/client';
import { onDestroy } from 'svelte';

import {
	getRenderStats,
	pauseRendering,
	resumeRendering,
	renderScreen
} from '../src/renderer/screen';

var root_1 = $.add_locations($.template(`<box left="0" width="100%" height="3"><text top="0" left="1" bold=""> </text> <text top="0" left="20"> </text> <text top="1" left="1" fg="gray"> </text></box>`), Render_scheduler_demo[$.FILENAME], [
	[
		95,
		6,
		[[96, 8], [99, 8], [100, 8]]
	]
]);

var root_3 = $.add_locations($.ns_template(`<text top="3" left="1" bold="" underline="">Scheduler Stats:</text><text top="4" left="1"> </text><text top="5" left="1"> </text><text top="6" left="1"> </text><text top="7" left="1"> </text><text top="8" left="1"> </text><text top="10" left="1" bold="" underline="">Queue Stats:</text><text top="11" left="1" fg="red"> </text><text top="12" left="1" fg="yellow"> </text><text top="13" left="1" fg="green"> </text><text top="14" left="1" fg="blue"> </text><text top="15" left="1"> </text>`, 1), Render_scheduler_demo[$.FILENAME], [
	[117, 8],
	[118, 8],
	[119, 8],
	[120, 8],
	[121, 8],
	[122, 8],
	[124, 8],
	[125, 8],
	[126, 8],
	[127, 8],
	[128, 8],
	[129, 8]
]);

var root_2 = $.add_locations($.template(`<box top="3" left="50%" width="50%" height="60%" label=" Performance Stats "><text top="0" left="1" bold=""> </text> <text top="1" left="1"> </text> <!> <text top="17" left="1" bold="" underline="">Screen Stats:</text> <text top="18" left="1"> </text> <text top="19" left="1"> </text> <text top="20" left="1"> </text></box>`), Render_scheduler_demo[$.FILENAME], [
	[
		112,
		4,
		[
			[113, 6],
			[114, 6],
			[132, 6],
			[133, 6],
			[134, 6],
			[135, 6]
		]
	]
]);

var root = $.add_locations($.template(`<box top="0" left="0" width="100%" height="100%" label=" Render Scheduler Demo "><box top="0" left="0" width="100%" height="3"><text top="0" left="center" bold="">SvelTUI Render Scheduler Demo</text> <text top="1" left="center">Press: [Space] Pause/Resume | [S] Toggle Stats | [R] Reset | [E] Toggle Scheduler | [Q] Quit</text></box> <box top="3" left="0" width="50%" height="60%" label=" Counters "><!> <box top="12" left="0" width="100%" height="3"><text top="0" left="1" bold="">Total Updates:</text> <text top="0" left="20" bold="" fg="yellow"> </text></box></box> <!> <box top="65%" left="0" width="100%" height="35%" label=" Visual Comparison "><text top="0" left="1" bold="">Benefits of Render Scheduler:</text> <text top="1" left="1">✓ Batches multiple updates into single render</text> <text top="2" left="1">✓ Reduces terminal flicker and CPU usage</text> <text top="3" left="1">✓ Priority-based rendering for responsive UI</text> <text top="4" left="1">✓ FPS limiting prevents excessive updates</text> <text top="6" left="1" bold=""> </text> <text top="7" left="1"> </text></box></box> <box top="-1" left="-1" width="1" height="1" keys=""></box>`, 1), Render_scheduler_demo[$.FILENAME], [
	[
		85,
		0,
		[
			[87, 2, [[88, 4], [89, 4]]],
			[
				93,
				2,
				[[104, 4, [[105, 6], [106, 6]]]]
			],
			[
				140,
				2,
				[
					[141, 4],
					[142, 4],
					[143, 4],
					[144, 4],
					[145, 4],
					[147, 4],
					[148, 4]
				]
			]
		]
	],
	[155, 0]
]);

export default function Render_scheduler_demo($$anchor, $$props) {
	$.check_target(new.target);
	$.push($$props, true, Render_scheduler_demo);

	// State for demo
	let counters = $.proxy([
		{
			id: 'counter1',
			value: 0,
			interval: 16,
			priority: 'high'
		},
		{
			id: 'counter2',
			value: 0,
			interval: 50,
			priority: 'normal'
		},
		{
			id: 'counter3',
			value: 0,
			interval: 100,
			priority: 'normal'
		},
		{
			id: 'counter4',
			value: 0,
			interval: 200,
			priority: 'low'
		}
	]);

	let showStats = $.state(true);
	let isPaused = $.state(false);
	let schedulerEnabled = $.state(true);
	let renderStats = $.state(null);
	// Derived values
	let totalUpdates = $.derived(() => counters.reduce((sum, c) => sum + c.value, 0));
	// Timer intervals
	let intervals = [];

	// Start counter updates
	function startCounters() {
		counters.forEach((counter, index) => {
			const interval = setInterval(
				() => {
					counters[index].value++;

					// Schedule render with priority
					if ($.get(schedulerEnabled)) {
						renderScreen(counter.priority, counter.id);
					} else {
						renderScreen();
					}
				},
				counter.interval
			);

			intervals.push(interval);
		});
	}

	// Update stats
	let statsInterval = setInterval(
		() => {
			$.set(renderStats, getRenderStats(), true);
		},
		100
	);

	// Key handlers
	function handleKey(key) {
		switch (key) {
			case 'space':
				$.set(isPaused, !$.get(isPaused));
				if ($.get(isPaused)) {
					pauseRendering();
					intervals.forEach(clearInterval);
					intervals = [];
				} else {
					resumeRendering();
					startCounters();
				}
				break;

			case 's':
				$.set(showStats, !$.get(showStats));
				break;

			case 'r':
				// Reset counters
				counters.forEach((_, index) => {
					counters[index].value = 0;
				});
				break;

			case 'e':
				// Toggle scheduler
				$.set(schedulerEnabled, !$.get(schedulerEnabled));
				break;
		}
	}

	// Start counters on mount
	startCounters();

	// Cleanup
	onDestroy(() => {
		intervals.forEach(clearInterval);
		clearInterval(statsInterval);
	});

	var fragment = root();
	var box = $.first_child(fragment);

	$.set_attribute(box, 'border', { type: 'line' });

	var box_1 = $.sibling($.child(box), 2);

	$.set_attribute(box_1, 'border', { type: 'line' });

	var node = $.child(box_1);

	$.each(node, 17, () => counters, $.index, ($$anchor, counter, i) => {
		var box_2 = root_1();

		$.set_attribute(box_2, 'top', i * 3);

		var text = $.child(box_2);
		var text_1 = $.child(text);

		$.reset(text);

		var text_2 = $.sibling(text, 2);
		var text_3 = $.child(text_2, true);

		$.reset(text_2);

		var text_4 = $.sibling(text_2, 2);
		var text_5 = $.child(text_4);

		$.reset(text_4);
		$.reset(box_2);

		$.template_effect(() => {
			$.set_attribute(text, 'fg', $.strict_equals($.get(counter).priority, 'high') ? 'red' : $.strict_equals($.get(counter).priority, 'low') ? 'blue' : 'green');
			$.set_text(text_1, `${$.get(counter).id ?? ''} (${$.get(counter).priority ?? ''}):`);
			$.set_text(text_3, $.get(counter).value);
			$.set_text(text_5, `Update: ${$.get(counter).interval ?? ''}ms`);
		});

		$.append($$anchor, box_2);
	});

	var box_3 = $.sibling(node, 2);
	var text_6 = $.sibling($.child(box_3), 2);
	var text_7 = $.child(text_6, true);

	$.reset(text_6);
	$.reset(box_3);
	$.reset(box_1);

	var node_1 = $.sibling(box_1, 2);

	{
		var consequent_1 = ($$anchor) => {
			var box_4 = root_2();

			$.set_attribute(box_4, 'border', { type: 'line' });

			var text_8 = $.child(box_4);
			var text_9 = $.child(text_8);

			$.reset(text_8);

			var text_10 = $.sibling(text_8, 2);
			var text_11 = $.child(text_10);

			$.reset(text_10);

			var node_2 = $.sibling(text_10, 2);

			{
				var consequent = ($$anchor) => {
					var fragment_1 = root_3();
					var text_12 = $.sibling($.first_child(fragment_1));
					var text_13 = $.child(text_12);

					$.reset(text_12);

					var text_14 = $.sibling(text_12);
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

					var text_22 = $.sibling(text_20, 2);
					var text_23 = $.child(text_22);

					$.reset(text_22);

					var text_24 = $.sibling(text_22);
					var text_25 = $.child(text_24);

					$.reset(text_24);

					var text_26 = $.sibling(text_24);
					var text_27 = $.child(text_26);

					$.reset(text_26);

					var text_28 = $.sibling(text_26);
					var text_29 = $.child(text_28);

					$.reset(text_28);

					var text_30 = $.sibling(text_28);
					var text_31 = $.child(text_30);

					$.reset(text_30);

					$.template_effect(
						($0) => {
							$.set_text(text_13, `Frame Count: ${$.get(renderStats).scheduler.frameCount ?? ''}`);
							$.set_text(text_15, `Average FPS: ${$.get(renderStats).scheduler.averageFPS ?? ''}`);
							$.set_text(text_17, `Avg Render Time: ${$0 ?? ''}ms`);
							$.set_text(text_19, `Queued Elements: ${$.get(renderStats).scheduler.queuedElements ?? ''}`);
							$.set_text(text_21, `Render Count: ${$.get(renderStats).scheduler.renderCount ?? ''}`);
							$.set_text(text_23, `Immediate: ${$.get(renderStats).scheduler.queueStats.immediate ?? ''}`);
							$.set_text(text_25, `High: ${$.get(renderStats).scheduler.queueStats.high ?? ''}`);
							$.set_text(text_27, `Normal: ${$.get(renderStats).scheduler.queueStats.normal ?? ''}`);
							$.set_text(text_29, `Low: ${$.get(renderStats).scheduler.queueStats.low ?? ''}`);
							$.set_text(text_31, `Total Queued: ${$.get(renderStats).scheduler.queueStats.total ?? ''}`);
						},
						[
							() => $.get(renderStats).scheduler.averageRenderTime.toFixed(2)
						]
					);

					$.append($$anchor, fragment_1);
				};

				$.if(node_2, ($$render) => {
					if ($.get(renderStats).scheduler) $$render(consequent);
				});
			}

			var text_32 = $.sibling(node_2, 4);
			var text_33 = $.child(text_32);

			$.reset(text_32);

			var text_34 = $.sibling(text_32, 2);
			var text_35 = $.child(text_34);

			$.reset(text_34);

			var text_36 = $.sibling(text_34, 2);
			var text_37 = $.child(text_36);

			$.reset(text_36);
			$.reset(box_4);

			$.template_effect(
				($0, $1) => {
					$.set_text(text_9, `Scheduler: ${$.get(schedulerEnabled) ? 'ENABLED' : 'DISABLED'}`);
					$.set_text(text_11, `Status: ${$.get(isPaused) ? 'PAUSED' : 'RUNNING'}`);
					$.set_text(text_33, `Render Count: ${$.get(renderStats).screen.renderCount ?? ''}`);
					$.set_text(text_35, `Avg Render Time: ${$0 ?? ''}ms`);
					$.set_text(text_37, `Last Render: ${$1 ?? ''}ms`);
				},
				[
					() => $.get(renderStats).screen.averageRenderTime.toFixed(2),
					() => $.get(renderStats).screen.lastRenderTime.toFixed(2)
				]
			);

			$.append($$anchor, box_4);
		};

		$.if(node_1, ($$render) => {
			if ($.get(showStats) && $.get(renderStats)) $$render(consequent_1);
		});
	}

	var box_5 = $.sibling(node_1, 2);

	$.set_attribute(box_5, 'border', { type: 'line' });

	var text_38 = $.sibling($.child(box_5), 10);
	var text_39 = $.child(text_38);

	$.reset(text_38);

	var text_40 = $.sibling(text_38, 2);
	var text_41 = $.child(text_40, true);

	$.reset(text_40);
	$.reset(box_5);
	$.reset(box);

	var box_6 = $.sibling(box, 2);

	$.template_effect(() => {
		$.set_text(text_7, $.get(totalUpdates));
		$.set_text(text_39, `Current Mode: ${$.get(schedulerEnabled) ? 'OPTIMIZED' : 'DIRECT'}`);
		$.set_attribute(text_40, 'fg', $.get(schedulerEnabled) ? 'green' : 'red');
		$.set_text(text_41, $.get(schedulerEnabled) ? '→ Efficient batched rendering active' : '→ Each update triggers immediate render');
	});

	$.event('keypress', box_6, (e) => handleKey(e.key));
	$.append($$anchor, fragment);
	return $.pop({ ...$.legacy_api() });
}