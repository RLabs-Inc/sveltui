import 'svelte/internal/disclose-version';

Working_demo[$.FILENAME] = 'examples/working-demo.svelte';

import * as $ from 'svelte/internal/client';

function increment(_, count) {
	$.update(count);
}

function toggleAuto(__1, autoIncrement) {
	$.set(autoIncrement, !$.get(autoIncrement));
}

var root = $.add_locations($.template(`<div style="color: #00ff00; padding: 10px; border: 2px solid #00ff00;"><h1>🎉 SVELTE 5 TERMINAL UI BREAKTHROUGH! 🎉</h1> <p>Count: <span style="color: #ffff00; font-weight: bold;"> </span></p> <p>Progress: <span style="color: #00ffff;"> </span></p> <p>Auto Mode: <span> </span></p> <div style="margin-top: 10px;"><button style="color: #00ff00; margin-right: 10px;">➕ Increment</button> <button style="color: #ffff00;"> </button></div> <div style="margin-top: 15px; color: #ff00ff;">✨ This is Svelte 5 with runes ($state, $effect) running in Node.js terminal! <br> 🚀 Featuring: Reactive state, automatic cleanup, real-time updates!</div> <div style="margin-top: 10px; color: #00ffff; font-size: small;">🎯 Technologies: Svelte 5 + Bun + Terminal Virtual DOM + Browser Globals Utility</div></div>`), Working_demo[$.FILENAME], [
	[
		28,
		0,
		[
			[29, 2],
			[31, 2, [[31, 12]]],
			[33, 2, [[33, 15]]],
			[35, 2, [[35, 16]]],
			[39, 2, [[40, 4], [44, 4]]],
			[49, 2, [[51, 4]]],
			[55, 2]
		]
	]
]);

export default function Working_demo($$anchor, $$props) {
	$.check_target(new.target);
	$.push($$props, true, Working_demo);

	// Working Svelte 5 demo that bypasses complex template issues
	let count = $.state(0);
	let autoIncrement = $.state(false);

	$.user_effect(() => {
		if ($.get(autoIncrement)) {
			const interval = setInterval(
				() => {
					$.update(count);

					if ($.get(count) >= 20) {
						$.set(autoIncrement, false);
					}
				},
				500
			);

			return () => clearInterval(interval);
		}
	});

	var div = root();
	var p = $.sibling($.child(div), 2);
	var span = $.sibling($.child(p));
	var text = $.child(span, true);

	$.reset(span);
	$.reset(p);

	var p_1 = $.sibling(p, 2);
	var span_1 = $.sibling($.child(p_1));
	var text_1 = $.child(span_1);

	$.reset(span_1);
	$.reset(p_1);

	var p_2 = $.sibling(p_1, 2);
	var span_2 = $.sibling($.child(p_2));
	var text_2 = $.child(span_2, true);

	$.reset(span_2);
	$.reset(p_2);

	var div_1 = $.sibling(p_2, 2);
	var button = $.child(div_1);

	button.__click = [increment, count];

	var button_1 = $.sibling(button, 2);

	button_1.__click = [toggleAuto, autoIncrement];

	var text_3 = $.child(button_1, true);

	$.reset(button_1);
	$.reset(div_1);
	$.next(4);
	$.reset(div);

	$.template_effect(
		($0, $1) => {
			$.set_text(text, $.get(count));
			$.set_text(text_1, `${$0 ?? ''}${$1 ?? ''}`);
			$.set_style(span_2, `color: ${$.get(autoIncrement) ? '#00ff00' : '#ff0000'};`);
			$.set_text(text_2, $.get(autoIncrement) ? '🟢 ON' : '🔴 OFF');
			$.set_text(text_3, $.get(autoIncrement) ? '⏹️ Stop Auto' : '▶️ Start Auto');
		},
		[
			() => ('█').repeat($.get(count)),
			() => ('░').repeat(20 - $.get(count))
		]
	);

	$.append($$anchor, div);
	return $.pop({ ...$.legacy_api() });
}

$.delegate(['click']);