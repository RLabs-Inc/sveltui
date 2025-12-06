import 'svelte/internal/disclose-version';

FocusScrollDemo[$.FILENAME] = 'src/test/FocusScrollDemo.svelte';

import * as $ from 'svelte/internal/client';
import Box from '../components/Box.svelte.mjs';
import Text from '../components/Text.svelte.mjs';

var root_5 = $.add_locations($.from_html(`<!> <!>`, 1), FocusScrollDemo[$.FILENAME], []);
var root_2 = $.add_locations($.from_html(`<!> <!> <!> <!>`, 1), FocusScrollDemo[$.FILENAME], []);
var root_8 = $.add_locations($.from_html(`<!> <!>`, 1), FocusScrollDemo[$.FILENAME], []);
var root_1 = $.add_locations($.from_html(`<!> <!> <!>`, 1), FocusScrollDemo[$.FILENAME], []);

export default function FocusScrollDemo($$anchor, $$props) {
	$.check_target(new.target);
	$.push($$props, true, FocusScrollDemo);

	let focused1 = $.tag($.state(false), 'focused1');
	let focused2 = $.tag($.state(false), 'focused2');
	let focused3 = $.tag($.state(false), 'focused3');
	let focusLog = $.tag($.state($.proxy([])), 'focusLog');

	function addLog(msg) {
		$.set(
			focusLog,
			[
				...$.get(focusLog),
				`${new Date().toLocaleTimeString()}: ${msg}`
			].slice(-5),
			true
		);
	}

	var $$exports = { ...$.legacy_api() };

	$.add_svelte_meta(
		() => Box($$anchor, {
			width: '100%',
			height: '100%',
			flexDirection: 'row',
			gap: 2,
			padding: 1,

			children: $.wrap_snippet(FocusScrollDemo, ($$anchor, $$slotProps) => {
				var fragment_1 = root_1();
				var node = $.first_child(fragment_1);

				$.add_svelte_meta(
					() => Box(node, {
						width: 40,
						flexDirection: 'column',
						gap: 1,

						children: $.wrap_snippet(FocusScrollDemo, ($$anchor, $$slotProps) => {
							var fragment_2 = root_2();
							var node_1 = $.first_child(fragment_2);

							$.add_svelte_meta(
								() => Text(node_1, {
									text: 'Tab/Shift+Tab to navigate',
									variant: 'warning',
									bold: true
								}),
								'component',
								FocusScrollDemo,
								28,
								4,
								{ componentTag: 'Text' }
							);

							var node_2 = $.sibling(node_1, 2);

							{
								let $0 = $.derived(() => $.get(focused1) ? "primary" : "secondary");

								$.add_svelte_meta(
									() => Box(node_2, {
										border: 'single',

										get variant() {
											return $.get($0);
										},

										padding: 1,
										focusable: true,
										tabIndex: 1,
										onfocus: () => addLog("Box 1 focused"),
										onblur: () => addLog("Box 1 blurred"),

										get focused() {
											return $.get(focused1);
										},

										set focused($$value) {
											$.set(focused1, $$value, true);
										},

										children: $.wrap_snippet(FocusScrollDemo, ($$anchor, $$slotProps) => {
											{
												let $0 = $.derived(() => $.get(focused1) ? "Box 1 - FOCUSED" : "Box 1");
												let $1 = $.derived(() => $.get(focused1) ? "primary" : "secondary");

												$.add_svelte_meta(
													() => Text($$anchor, {
														get text() {
															return $.get($0);
														},

														get variant() {
															return $.get($1);
														}
													}),
													'component',
													FocusScrollDemo,
													40,
													6,
													{ componentTag: 'Text' }
												);
											}
										}),

										$$slots: { default: true }
									}),
									'component',
									FocusScrollDemo,
									30,
									4,
									{ componentTag: 'Box' }
								);
							}

							var node_3 = $.sibling(node_2, 2);

							{
								let $0 = $.derived(() => $.get(focused2) ? "primary" : "secondary");

								$.add_svelte_meta(
									() => Box(node_3, {
										border: 'single',

										get variant() {
											return $.get($0);
										},

										padding: 1,
										focusable: true,
										tabIndex: 2,
										onfocus: () => addLog("Box 2 focused"),
										onblur: () => addLog("Box 2 blurred"),

										get focused() {
											return $.get(focused2);
										},

										set focused($$value) {
											$.set(focused2, $$value, true);
										},

										children: $.wrap_snippet(FocusScrollDemo, ($$anchor, $$slotProps) => {
											{
												let $0 = $.derived(() => $.get(focused2) ? "Box 2 - FOCUSED" : "Box 2");
												let $1 = $.derived(() => $.get(focused2) ? "primary" : "secondary");

												$.add_svelte_meta(
													() => Text($$anchor, {
														get text() {
															return $.get($0);
														},

														get variant() {
															return $.get($1);
														}
													}),
													'component',
													FocusScrollDemo,
													53,
													6,
													{ componentTag: 'Text' }
												);
											}
										}),

										$$slots: { default: true }
									}),
									'component',
									FocusScrollDemo,
									43,
									4,
									{ componentTag: 'Box' }
								);
							}

							var node_4 = $.sibling(node_3, 2);

							{
								let $0 = $.derived(() => $.get(focused3) ? "primary" : "secondary");

								$.add_svelte_meta(
									() => Box(node_4, {
										border: 'double',

										get variant() {
											return $.get($0);
										},

										padding: 1,
										height: 8,
										focusable: true,
										tabIndex: 3,
										onfocus: () => addLog("Scrollable box focused"),
										onblur: () => addLog("Scrollable box blurred"),

										get focused() {
											return $.get(focused3);
										},

										set focused($$value) {
											$.set(focused3, $$value, true);
										},

										children: $.wrap_snippet(FocusScrollDemo, ($$anchor, $$slotProps) => {
											var fragment_5 = root_5();
											var node_5 = $.first_child(fragment_5);

											{
												let $0 = $.derived(() => $.get(focused3)
													? "Scrollable - Use ↑↓ PgUp/PgDn"
													: "Scrollable content");

												let $1 = $.derived(() => $.get(focused3) ? "primary" : "secondary");

												$.add_svelte_meta(
													() => Text(node_5, {
														get text() {
															return $.get($0);
														},

														get variant() {
															return $.get($1);
														},

														bold: true
													}),
													'component',
													FocusScrollDemo,
													68,
													6,
													{ componentTag: 'Text' }
												);
											}

											var node_6 = $.sibling(node_5, 2);

											$.add_svelte_meta(
												() => $.each(node_6, 16, () => Array(20), $.index, ($$anchor, _, i) => {
													$.add_svelte_meta(
														() => Text($$anchor, {
															text: `Line ${i + 1}: This is scrollable content that should be clipped`,
															muted: true
														}),
														'component',
														FocusScrollDemo,
														70,
														8,
														{ componentTag: 'Text' }
													);
												}),
												'each',
												FocusScrollDemo,
												69,
												6
											);

											$.append($$anchor, fragment_5);
										}),

										$$slots: { default: true }
									}),
									'component',
									FocusScrollDemo,
									57,
									4,
									{ componentTag: 'Box' }
								);
							}

							$.append($$anchor, fragment_2);
						}),

						$$slots: { default: true }
					}),
					'component',
					FocusScrollDemo,
					23,
					2,
					{ componentTag: 'Box' }
				);

				var node_7 = $.sibling(node, 2);

				$.add_svelte_meta(
					() => Box(node_7, {
						border: 'single',
						variant: 'tertiary',
						padding: 1,
						flexGrow: 1,

						children: $.wrap_snippet(FocusScrollDemo, ($$anchor, $$slotProps) => {
							$.add_svelte_meta(
								() => Box($$anchor, {
									flexDirection: 'column',

									children: $.wrap_snippet(FocusScrollDemo, ($$anchor, $$slotProps) => {
										var fragment_8 = root_8();
										var node_8 = $.first_child(fragment_8);

										$.add_svelte_meta(() => Text(node_8, { text: 'Focus Event Log:', variant: 'tertiary', bold: true }), 'component', FocusScrollDemo, 83, 6, { componentTag: 'Text' });

										var node_9 = $.sibling(node_8, 2);

										$.add_svelte_meta(
											() => $.each(node_9, 17, () => $.get(focusLog), $.index, ($$anchor, log) => {
												$.add_svelte_meta(
													() => Text($$anchor, {
														get text() {
															return $.get(log);
														},

														muted: true
													}),
													'component',
													FocusScrollDemo,
													85,
													8,
													{ componentTag: 'Text' }
												);
											}),
											'each',
											FocusScrollDemo,
											84,
											6
										);

										$.append($$anchor, fragment_8);
									}),

									$$slots: { default: true }
								}),
								'component',
								FocusScrollDemo,
								82,
								4,
								{ componentTag: 'Box' }
							);
						}),

						$$slots: { default: true }
					}),
					'component',
					FocusScrollDemo,
					76,
					2,
					{ componentTag: 'Box' }
				);

				var node_10 = $.sibling(node_7, 2);

				$.add_svelte_meta(
					() => Box(node_10, {
						position: 'absolute',
						bottom: 0,
						left: 0,

						children: $.wrap_snippet(FocusScrollDemo, ($$anchor, $$slotProps) => {
							$.add_svelte_meta(() => Text($$anchor, { text: 'Ctrl+C to exit', color: 'gray', dim: true }), 'component', FocusScrollDemo, 91, 4, { componentTag: 'Text' });
						}),

						$$slots: { default: true }
					}),
					'component',
					FocusScrollDemo,
					90,
					2,
					{ componentTag: 'Box' }
				);

				$.append($$anchor, fragment_1);
			}),

			$$slots: { default: true }
		}),
		'component',
		FocusScrollDemo,
		15,
		0,
		{ componentTag: 'Box' }
	);

	return $.pop($$exports);
}