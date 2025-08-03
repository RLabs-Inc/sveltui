import 'svelte/internal/disclose-version';

Test_initial_colors[$.FILENAME] = 'examples/test-initial-colors.svelte';

import * as $ from 'svelte/internal/client';

var root = $.add_locations($.template(`<box label="Color Test" width="100%" height="100%"><text> </text> <text> </text> <box><text> </text> <text>Press 'c' to change colors</text></box></box>`), Test_initial_colors[$.FILENAME], [
	[
		12,
		0,
		[
			[13, 2],
			[14, 2],
			[15, 2, [[16, 4], [17, 4]]]
		]
	]
]);

const $$css = {
	hash: 'svelte-1poblq3',
	code: '\n  /* Make sure no CSS interferes */\n\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdC1pbml0aWFsLWNvbG9ycy5zdmVsdGUiLCJzb3VyY2VzIjpbInRlc3QtaW5pdGlhbC1jb2xvcnMuc3ZlbHRlIl0sInNvdXJjZXNDb250ZW50IjpbIjxzY3JpcHQ+XG4gIC8vIFRlc3QgcmVhY3RpdmUgY29sb3JzIHRoYXQgc2hvdWxkIHNob3cgY29ycmVjdGx5IGZyb20gZmlyc3QgcmVuZGVyXG4gIGxldCBjb2xvciA9ICRzdGF0ZSgnZ3JlZW4nKTtcbiAgbGV0IGJvcmRlckNvbG9yID0gJHN0YXRlKCd5ZWxsb3cnKTsgXG4gIFxuICBmdW5jdGlvbiBjaGFuZ2VDb2xvcnMoKSB7XG4gICAgY29sb3IgPSBjb2xvciA9PT0gJ2dyZWVuJyA/ICdyZWQnIDogJ2dyZWVuJztcbiAgICBib3JkZXJDb2xvciA9IGJvcmRlckNvbG9yID09PSAneWVsbG93JyA/ICdibHVlJyA6ICd5ZWxsb3cnO1xuICB9XG48L3NjcmlwdD5cblxuPGJveCBsYWJlbD1cIkNvbG9yIFRlc3RcIiB3aWR0aD1cIjEwMCVcIiBoZWlnaHQ9XCIxMDAlXCIgYm9yZGVyPXt0cnVlfT5cbiAgPHRleHQgdG9wPXsxfSBzdHlsZT17eyBmZzogY29sb3IsIGJvbGQ6IHRydWUgfX0+VGV4dCBjb2xvcjoge2NvbG9yfTwvdGV4dD5cbiAgPHRleHQgdG9wPXsyfSBzdHlsZT17eyBmZzogYm9yZGVyQ29sb3IgfX0+Qm9yZGVyIGNvbG9yOiB7Ym9yZGVyQ29sb3J9PC90ZXh0PlxuICA8Ym94IHRvcD17NH0gbGVmdD17Mn0gd2lkdGg9ezMwfSBoZWlnaHQ9ezV9IGJvcmRlcj17eyBmZzogYm9yZGVyQ29sb3IsIHR5cGU6ICdsaW5lJyB9fT5cbiAgICA8dGV4dCB0b3A9ezF9IGxlZnQ9ezF9PlRoaXMgYm94IGJvcmRlciBzaG91bGQgYmUge2JvcmRlckNvbG9yfTwvdGV4dD5cbiAgICA8dGV4dCB0b3A9ezJ9IGxlZnQ9ezF9PlByZXNzICdjJyB0byBjaGFuZ2UgY29sb3JzPC90ZXh0PlxuICA8L2JveD5cbjwvYm94PlxuXG48c3R5bGU+XG4gIC8qIE1ha2Ugc3VyZSBubyBDU1MgaW50ZXJmZXJlcyAqL1xuPC9zdHlsZT4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQXFCQTsifQ== */'
};

export default function Test_initial_colors($$anchor, $$props) {
	$.check_target(new.target);
	$.push($$props, true, Test_initial_colors);
	$.append_styles($$anchor, $$css);

	// Test reactive colors that should show correctly from first render
	let color = $.state('green');
	let borderColor = $.state('yellow');

	function changeColors() {
		$.set(color, $.strict_equals($.get(color), 'green') ? 'red' : 'green', true);
		$.set(borderColor, $.strict_equals($.get(borderColor), 'yellow') ? 'blue' : 'yellow', true);
	}

	var box = root();

	$.set_attribute(box, 'border', true);

	var text = $.child(box);

	$.set_attribute(text, 'top', 1);

	var text_1 = $.child(text);

	$.reset(text);

	var text_2 = $.sibling(text, 2);

	$.set_attribute(text_2, 'top', 2);

	var text_3 = $.child(text_2);

	$.reset(text_2);

	var box_1 = $.sibling(text_2, 2);

	$.set_attribute(box_1, 'top', 4);
	$.set_attribute(box_1, 'left', 2);
	$.set_attribute(box_1, 'width', 30);
	$.set_attribute(box_1, 'height', 5);

	var text_4 = $.child(box_1);

	$.set_attribute(text_4, 'top', 1);
	$.set_attribute(text_4, 'left', 1);

	var text_5 = $.child(text_4);

	$.reset(text_4);

	var text_6 = $.sibling(text_4, 2);

	$.set_attribute(text_6, 'top', 2);
	$.set_attribute(text_6, 'left', 1);
	$.reset(box_1);
	$.reset(box);

	$.template_effect(() => {
		$.set_style(text, { fg: $.get(color), bold: true });
		$.set_text(text_1, `Text color: ${$.get(color) ?? ''}`);
		$.set_style(text_2, { fg: $.get(borderColor) });
		$.set_text(text_3, `Border color: ${$.get(borderColor) ?? ''}`);
		$.set_attribute(box_1, 'border', { fg: $.get(borderColor), type: 'line' });
		$.set_text(text_5, `This box border should be ${$.get(borderColor) ?? ''}`);
	});

	$.append($$anchor, box);
	return $.pop({ ...$.legacy_api() });
}