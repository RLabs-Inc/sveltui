import 'svelte/internal/disclose-version';

Simple_demo[$.FILENAME] = 'examples/impressive-demos/simple-demo.svelte';

import * as $ from 'svelte/internal/client';

var root = $.add_locations($.template(`<div style="padding: 20px; border: 1px solid #00ff00;"><h1 style="color: #00ff00;">🎉 SvelTUI Demo - Svelte 5 Working!</h1> <p style="color: #ffffff;"> </p> <div style="margin-top: 10px; color: #ffff00;"> </div> <div style="margin-top: 10px; color: #ff00ff;">🚀 This is Svelte 5 running in a Node.js terminal!</div> <div style="margin-top: 10px; color: #00ffff;">✨ Featuring: $state reactivity, $effect cleanup, and real-time updates!</div></div>`), Simple_demo[$.FILENAME], [
	[
		18,
		0,
		[
			[19, 2],
			[21, 2],
			[25, 2],
			[29, 2],
			[33, 2]
		]
	]
]);

export default function Simple_demo($$anchor, $$props) {
	$.check_target(new.target);
	$.push($$props, true, Simple_demo);

	// Simple demo that just shows our Svelte 5 breakthrough working
	let count = $.state(0);
	let message = $.state('Welcome to SvelTUI! 🚀');

	$.user_effect(() => {
		const interval = setInterval(
			() => {
				$.update(count);
				$.set(message, `Count: ${$.get(count)} - Svelte 5 reactivity working! ✨`);
			},
			1000
		);

		return () => clearInterval(interval);
	});

	var div = root();
	var p = $.sibling($.child(div), 2);
	var text = $.child(p, true);

	$.reset(p);

	var div_1 = $.sibling(p, 2);
	var text_1 = $.child(div_1);

	$.reset(div_1);
	$.next(4);
	$.reset(div);

	$.template_effect(
		($0) => {
			$.set_text(text, $.get(message));
			$.set_text(text_1, `📊 Progress: ${$0 ?? ''}`);
		},
		[
			() => ('█').repeat(Math.min(20, $.get(count)))
		]
	);

	$.append($$anchor, div);
	return $.pop({ ...$.legacy_api() });
}