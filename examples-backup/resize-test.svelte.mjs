import 'svelte/internal/disclose-version';

Resize_test[$.FILENAME] = 'examples/resize-test.svelte';

import * as $ from 'svelte/internal/client';
import { layoutContext } from '../src/layout/layout-context.svelte.ts';

var root_1 = $.add_locations($.ns_template(`<text>Extra content</text><text>when wide</text>`, 1), Resize_test[$.FILENAME], [[53, 6], [54, 6]]);
var root_2 = $.add_locations($.ns_template(`<text fg="yellow">Narrow mode active</text>`), Resize_test[$.FILENAME], [[73, 6]]);
var root_3 = $.add_locations($.ns_template(`<text fg="red">Short mode active</text>`), Resize_test[$.FILENAME], [[77, 6]]);

var root = $.add_locations($.template(`<box label="Terminal Resize Test" width="100%" height="100%" keys=""><box width="100%" label="Status"><text> </text></box> <box label="Sidebar"><text> </text> <text>Responsive!</text> <!></box> <box label="Main Content"><text>Resize your terminal window!</text> <text>This layout will automatically</text> <text>adjust to the new dimensions.</text> <!> <!> <box top="center" left="center" label="Centered"><text top="center" left="center">Always</text> <text top="center+1" left="center">Centered</text></box></box></box>`), Resize_test[$.FILENAME], [
	[
		17,
		0,
		[
			[26, 2, [[35, 4]]],
			[41, 2, [[50, 4], [51, 4]]],
			[
				59,
				2,
				[
					[68, 4],
					[69, 4],
					[70, 4],
					[81, 4, [[90, 6], [93, 6]]]
				]
			]
		]
	]
]);

export default function Resize_test($$anchor, $$props) {
	$.check_target(new.target);
	$.push($$props, true, Resize_test);

	// Get reactive screen dimensions
	let screenDims = $.derived(() => layoutContext.screenDimensions);
	// Calculate responsive values
	let isNarrow = $.derived(() => $.get(screenDims).width < 80);
	let isShort = $.derived(() => $.get(screenDims).height < 24);
	let sidebarWidth = $.derived(() => $.get(isNarrow) ? 15 : 25);
	let statusHeight = $.derived(() => $.get(isShort) ? 2 : 3);
	let message = $.derived(() => `Screen: ${$.get(screenDims).width}x${$.get(screenDims).height} | Layout: ${$.get(isNarrow) ? 'Narrow' : 'Wide'} ${$.get(isShort) ? 'Short' : 'Tall'}`);
	var box = root();

	$.set_attribute(box, 'border', { type: 'line' });
	$.set_style(box, { border: { fg: 'cyan' } });

	var box_1 = $.child(box);

	$.set_attribute(box_1, 'top', 0);
	$.set_attribute(box_1, 'left', 0);
	$.set_attribute(box_1, 'border', { type: 'line' });
	$.set_style(box_1, { border: { fg: 'white' } });

	var text = $.child(box_1);

	$.set_attribute(text, 'top', 0);
	$.set_attribute(text, 'left', 1);

	var text_1 = $.child(text, true);

	$.reset(text);
	$.reset(box_1);

	var box_2 = $.sibling(box_1, 2);

	$.set_attribute(box_2, 'left', 0);
	$.set_attribute(box_2, 'border', { type: 'line' });
	$.set_style(box_2, { border: { fg: 'green' } });

	var text_2 = $.child(box_2);

	$.set_attribute(text_2, 'top', 1);
	$.set_attribute(text_2, 'left', 1);

	var text_3 = $.child(text_2);

	$.reset(text_2);

	var text_4 = $.sibling(text_2, 2);

	$.set_attribute(text_4, 'top', 2);
	$.set_attribute(text_4, 'left', 1);

	var node = $.sibling(text_4, 2);

	{
		var consequent = ($$anchor) => {
			var fragment = root_1();
			var text_5 = $.first_child(fragment);

			$.set_attribute(text_5, 'top', 4);
			$.set_attribute(text_5, 'left', 1);

			var text_6 = $.sibling(text_5);

			$.set_attribute(text_6, 'top', 5);
			$.set_attribute(text_6, 'left', 1);
			$.append($$anchor, fragment);
		};

		$.if(node, ($$render) => {
			if (!$.get(isNarrow)) $$render(consequent);
		});
	}

	$.reset(box_2);

	var box_3 = $.sibling(box_2, 2);

	$.set_attribute(box_3, 'border', { type: 'line' });
	$.set_style(box_3, { border: { fg: 'blue' } });

	var text_7 = $.child(box_3);

	$.set_attribute(text_7, 'top', 1);
	$.set_attribute(text_7, 'left', 1);

	var text_8 = $.sibling(text_7, 2);

	$.set_attribute(text_8, 'top', 3);
	$.set_attribute(text_8, 'left', 1);

	var text_9 = $.sibling(text_8, 2);

	$.set_attribute(text_9, 'top', 4);
	$.set_attribute(text_9, 'left', 1);

	var node_1 = $.sibling(text_9, 2);

	{
		var consequent_1 = ($$anchor) => {
			var text_10 = root_2();

			$.set_attribute(text_10, 'top', 6);
			$.set_attribute(text_10, 'left', 1);
			$.append($$anchor, text_10);
		};

		$.if(node_1, ($$render) => {
			if ($.get(isNarrow)) $$render(consequent_1);
		});
	}

	var node_2 = $.sibling(node_1, 2);

	{
		var consequent_2 = ($$anchor) => {
			var text_11 = root_3();

			$.set_attribute(text_11, 'top', 8);
			$.set_attribute(text_11, 'left', 1);
			$.append($$anchor, text_11);
		};

		$.if(node_2, ($$render) => {
			if ($.get(isShort)) $$render(consequent_2);
		});
	}

	var box_4 = $.sibling(node_2, 2);

	$.set_attribute(box_4, 'border', { type: 'line' });
	$.set_style(box_4, { border: { fg: 'magenta' } });
	$.reset(box_3);
	$.reset(box);

	$.template_effect(
		($0, $1) => {
			$.set_attribute(box_1, 'height', $.get(statusHeight));
			$.set_text(text_1, $.get(message));
			$.set_attribute(box_2, 'top', $.get(statusHeight));
			$.set_attribute(box_2, 'width', $.get(sidebarWidth));
			$.set_attribute(box_2, 'height', `100%-${$.get(statusHeight)}`);
			$.set_text(text_3, `Width: ${$.get(sidebarWidth) ?? ''}`);
			$.set_attribute(box_3, 'top', $.get(statusHeight));
			$.set_attribute(box_3, 'left', $.get(sidebarWidth));
			$.set_attribute(box_3, 'width', `100%-${$.get(sidebarWidth)}`);
			$.set_attribute(box_3, 'height', `100%-${$.get(statusHeight)}`);
			$.set_attribute(box_4, 'width', $0);
			$.set_attribute(box_4, 'height', $1);
		},
		[
			() => Math.min(20, Math.floor($.get(screenDims).width * 0.3)),
			() => Math.min(5, Math.floor($.get(screenDims).height * 0.3))
		]
	);

	$.append($$anchor, box);
	return $.pop({ ...$.legacy_api() });
}