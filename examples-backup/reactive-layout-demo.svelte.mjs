import 'svelte/internal/disclose-version';

Reactive_layout_demo[$.FILENAME] = 'examples/reactive-layout-demo.svelte';

import * as $ from 'svelte/internal/client';
import { layoutContext } from '../src/layout/layout-context.svelte.ts';
import { layoutManager } from '../src/layout/reactive-layout.svelte.ts';
import { LayoutPattern, layoutHelpers } from '../src/layout/layout-utils';

var root_1 = $.add_locations($.template(`<box height="100%-3" label="Sidebar"><text>Controls:</text> <text>[s] Toggle sidebar</text> <text>[g] Toggle grid cols</text> <text>[a] Add item</text> <text>[d] Delete item</text> <text>Panels:</text> <text>[1] Main</text> <text>[2] Grid</text> <text>[3] Center</text></box>`), Reactive_layout_demo[$.FILENAME], [
	[
		89,
		4,
		[
			[98, 6],
			[99, 6],
			[100, 6],
			[101, 6],
			[102, 6],
			[103, 6],
			[104, 6],
			[105, 6],
			[106, 6]
		]
	]
]);

var root_3 = $.add_locations($.template(`<box width="100%"><text left="center"> </text></box>`), Reactive_layout_demo[$.FILENAME], [[126, 10, [[134, 12]]]]);
var root_2 = $.add_locations($.template(`<box width="100%-2" height="100%-2"><text>Vertical Stack Layout (auto-reflows):</text> <!></box>`), Reactive_layout_demo[$.FILENAME], [[122, 6, [[123, 8]]]]);
var root_6 = $.add_locations($.template(`<box><text left="center" top="center"> </text></box>`), Reactive_layout_demo[$.FILENAME], [[150, 10, [[158, 12]]]]);
var root_5 = $.add_locations($.template(`<box width="100%-2" height="100%-2"><text> </text> <!></box>`), Reactive_layout_demo[$.FILENAME], [[141, 6, [[142, 8]]]]);

var root_8 = $.add_locations($.template(`<box top="center" left="center" width="50%" height="50%"><box width="100%" height="100%" label="Centered Panel"><text top="center" left="center">Centered Content</text> <text top="center+2" left="center">Always stays centered</text> <text top="center+4" left="center">Even on resize!</text></box></box>`), Reactive_layout_demo[$.FILENAME], [
	[
		165,
		6,
		[
			[
				166,
				8,
				[[173, 10], [176, 10], [179, 10]]
			]
		]
	]
]);

var root_9 = $.add_locations($.template(`<box><text top="center" left="center" fg="red">Too many items!</text> <text top="center+2" left="center">Performance may degrade</text></box>`), Reactive_layout_demo[$.FILENAME], [[189, 4, [[198, 6], [201, 6]]]]);

var root = $.add_locations($.template(`<box label="Reactive Layout Demo" keys=""><box width="100%"><text> </text></box> <!> <box height="100%-3" label="Content"><!></box> <!></box>`), Reactive_layout_demo[$.FILENAME], [
	[
		63,
		0,
		[[71, 2, [[79, 4]]], [111, 2]]
	]
]);

export default function Reactive_layout_demo($$anchor, $$props) {
	$.check_target(new.target);
	$.push($$props, true, Reactive_layout_demo);

	// Reactive state
	let activePanel = $.state('main');
	let showSidebar = $.state(true);
	let gridColumns = $.state(2);

	let items = $.state($.proxy([
		{ id: 1, label: 'Item 1', color: 'blue' },
		{ id: 2, label: 'Item 2', color: 'green' },
		{ id: 3, label: 'Item 3', color: 'yellow' },
		{ id: 4, label: 'Item 4', color: 'magenta' }
	]));

	// Screen dimensions (reactive)
	let screenDims = $.derived(() => layoutContext.screenDimensions);
	// Responsive sidebar width
	let sidebarWidth = $.derived(() => $.get(screenDims).width < 60 ? 15 : 20);
	// Main content area width
	let contentWidth = $.derived(() => $.get(showSidebar) ? `${$.get(screenDims).width - $.get(sidebarWidth)}` : '100%');
	// Dynamic grid columns based on screen width
	let responsiveColumns = $.derived(() => $.get(screenDims).width < 80 ? 1 : $.get(gridColumns));

	// Key handlers
	function handleKeypress(key) {
		switch (key.name) {
			case 's':
				$.set(showSidebar, !$.get(showSidebar));
				break;

			case 'g':
				$.set(gridColumns, $.strict_equals($.get(gridColumns), 2) ? 3 : 2, true);
				break;

			case 'a':
				$.set(
					items,
					[
						...$.get(items),
						{
							id: $.get(items).length + 1,
							label: `Item ${$.get(items).length + 1}`,
							color: 'cyan'
						}
					],
					true
				);
				break;

			case 'd':
				if ($.get(items).length > 0) {
					$.set(items, $.get(items).slice(0, -1), true);
				}
				break;

			case '1':
				$.set(activePanel, 'main');
				break;

			case '2':
				$.set(activePanel, 'grid');
				break;

			case '3':
				$.set(activePanel, 'center');
				break;
		}
	}

	var box = root();

	$.set_attribute(box, 'border', { type: 'line' });
	$.set_style(box, { border: { fg: 'cyan' } });

	var box_1 = $.child(box);

	$.set_attribute(box_1, 'top', 0);
	$.set_attribute(box_1, 'left', 0);
	$.set_attribute(box_1, 'height', 3);
	$.set_attribute(box_1, 'border', { type: 'line' });
	$.set_style(box_1, { border: { fg: 'white' } });

	var text = $.child(box_1);

	$.set_attribute(text, 'top', 0);
	$.set_attribute(text, 'left', 1);

	var text_1 = $.child(text);

	$.reset(text);
	$.reset(box_1);

	var node = $.sibling(box_1, 2);

	{
		var consequent = ($$anchor) => {
			var box_2 = root_1();

			$.set_attribute(box_2, 'top', 3);
			$.set_attribute(box_2, 'left', 0);
			$.set_attribute(box_2, 'border', { type: 'line' });
			$.set_style(box_2, { border: { fg: 'green' } });

			var text_2 = $.child(box_2);

			$.set_attribute(text_2, 'top', 1);
			$.set_attribute(text_2, 'left', 1);

			var text_3 = $.sibling(text_2, 2);

			$.set_attribute(text_3, 'top', 3);
			$.set_attribute(text_3, 'left', 1);

			var text_4 = $.sibling(text_3, 2);

			$.set_attribute(text_4, 'top', 4);
			$.set_attribute(text_4, 'left', 1);

			var text_5 = $.sibling(text_4, 2);

			$.set_attribute(text_5, 'top', 5);
			$.set_attribute(text_5, 'left', 1);

			var text_6 = $.sibling(text_5, 2);

			$.set_attribute(text_6, 'top', 6);
			$.set_attribute(text_6, 'left', 1);

			var text_7 = $.sibling(text_6, 2);

			$.set_attribute(text_7, 'top', 8);
			$.set_attribute(text_7, 'left', 1);

			var text_8 = $.sibling(text_7, 2);

			$.set_attribute(text_8, 'top', 9);
			$.set_attribute(text_8, 'left', 1);

			var text_9 = $.sibling(text_8, 2);

			$.set_attribute(text_9, 'top', 10);
			$.set_attribute(text_9, 'left', 1);

			var text_10 = $.sibling(text_9, 2);

			$.set_attribute(text_10, 'top', 11);
			$.set_attribute(text_10, 'left', 1);
			$.reset(box_2);
			$.template_effect(() => $.set_attribute(box_2, 'width', $.get(sidebarWidth)));
			$.append($$anchor, box_2);
		};

		$.if(node, ($$render) => {
			if ($.get(showSidebar)) $$render(consequent);
		});
	}

	var box_3 = $.sibling(node, 2);

	$.set_attribute(box_3, 'top', 3);
	$.set_attribute(box_3, 'border', { type: 'line' });
	$.set_style(box_3, { border: { fg: 'blue' } });

	var node_1 = $.child(box_3);

	{
		var consequent_1 = ($$anchor) => {
			var box_4 = root_2();

			$.set_attribute(box_4, 'top', 1);
			$.set_attribute(box_4, 'left', 1);

			var node_2 = $.sibling($.child(box_4), 2);

			$.each(node_2, 17, () => $.get(items), $.index, ($$anchor, item, i) => {
				var box_5 = root_3();

				$.set_attribute(box_5, 'top', 2 + i * 3);
				$.set_attribute(box_5, 'left', 0);
				$.set_attribute(box_5, 'height', 2);
				$.set_attribute(box_5, 'border', { type: 'line' });

				var text_11 = $.child(box_5);
				var text_12 = $.child(text_11, true);

				$.reset(text_11);
				$.reset(box_5);

				$.template_effect(() => {
					$.set_style(box_5, { border: { fg: $.get(item).color } });
					$.set_text(text_12, $.get(item).label);
				});

				$.append($$anchor, box_5);
			});

			$.reset(box_4);
			$.append($$anchor, box_4);
		};

		var alternate = ($$anchor, $$elseif) => {
			{
				var consequent_2 = ($$anchor) => {
					var box_6 = root_5();

					$.set_attribute(box_6, 'top', 1);
					$.set_attribute(box_6, 'left', 1);

					var text_13 = $.child(box_6);
					var text_14 = $.child(text_13);

					$.reset(text_13);

					var node_3 = $.sibling(text_13, 2);

					$.each(node_3, 17, () => $.get(items), $.index, ($$anchor, item, i) => {
						var box_7 = root_6();
						const col = $.derived(() => i % $.get(responsiveColumns));

						$.get(col);

						const row = $.derived(() => Math.floor(i / $.get(responsiveColumns)));

						$.get(row);

						const cellWidth = $.derived(() => Math.floor(($.get(contentWidth) - $.get(sidebarWidth) - 4) / $.get(responsiveColumns)) - 1);

						$.get(cellWidth);

						const cellHeight = $.derived(() => 5);

						$.get(cellHeight);
						$.set_attribute(box_7, 'border', { type: 'line' });

						var text_15 = $.child(box_7);
						var text_16 = $.child(text_15, true);

						$.reset(text_15);
						$.reset(box_7);

						$.template_effect(() => {
							$.set_attribute(box_7, 'top', 2 + $.get(row) * ($.get(cellHeight) + 1));
							$.set_attribute(box_7, 'left', $.get(col) * ($.get(cellWidth) + 1));
							$.set_attribute(box_7, 'width', $.get(cellWidth));
							$.set_attribute(box_7, 'height', $.get(cellHeight));
							$.set_style(box_7, { border: { fg: $.get(item).color } });
							$.set_text(text_16, $.get(item).label);
						});

						$.append($$anchor, box_7);
					});

					$.reset(box_6);
					$.template_effect(() => $.set_text(text_14, `Grid Layout (${$.get(responsiveColumns) ?? ''} columns):`));
					$.append($$anchor, box_6);
				};

				var alternate_1 = ($$anchor, $$elseif) => {
					{
						var consequent_3 = ($$anchor) => {
							var box_8 = root_8();
							var box_9 = $.child(box_8);

							$.set_attribute(box_9, 'border', { type: 'line' });
							$.set_style(box_9, { border: { fg: 'yellow' } });
							$.reset(box_8);
							$.append($$anchor, box_8);
						};

						$.if(
							$$anchor,
							($$render) => {
								if ($.strict_equals($.get(activePanel), 'center')) $$render(consequent_3);
							},
							$$elseif
						);
					}
				};

				$.if(
					$$anchor,
					($$render) => {
						if ($.strict_equals($.get(activePanel), 'grid')) $$render(consequent_2); else $$render(alternate_1, false);
					},
					$$elseif
				);
			}
		};

		$.if(node_1, ($$render) => {
			if ($.strict_equals($.get(activePanel), 'main')) $$render(consequent_1); else $$render(alternate, false);
		});
	}

	$.reset(box_3);

	var node_4 = $.sibling(box_3, 2);

	{
		var consequent_4 = ($$anchor) => {
			var box_10 = root_9();
			let attributes;

			$.template_effect(
				($0) => attributes = $.set_attributes(box_10, attributes, {
					...$0,
					border: { type: 'line' },
					style: { border: { fg: 'red' }, bg: 'black' },
					label: 'Warning'
				}),
				[() => layoutHelpers.modal('40%', 10)]
			);

			$.append($$anchor, box_10);
		};

		$.if(node_4, ($$render) => {
			if ($.get(items).length > 5) $$render(consequent_4);
		});
	}

	$.reset(box);

	$.template_effect(() => {
		$.set_text(text_1, `Screen: ${$.get(screenDims).width ?? ''}x${$.get(screenDims).height ?? ''} | 
      Sidebar: ${$.get(showSidebar) ? 'ON' : 'OFF'} | 
      Panel: ${$.get(activePanel) ?? ''} | 
      Items: ${$.get(items).length ?? ''}`);

		$.set_attribute(box_3, 'left', $.get(showSidebar) ? $.get(sidebarWidth) : 0);
		$.set_attribute(box_3, 'width', $.get(contentWidth));
	});

	$.event('keypress', box, handleKeypress);
	$.append($$anchor, box);
	return $.pop({ ...$.legacy_api() });
}