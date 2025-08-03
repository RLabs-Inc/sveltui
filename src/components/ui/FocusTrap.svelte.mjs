import 'svelte/internal/disclose-version';

FocusTrap[$.FILENAME] = 'src/components/ui/FocusTrap.svelte';

import * as $ from 'svelte/internal/client';
import { onMount, onDestroy } from 'svelte';
import { getFocusContext, hasFocusContext } from '../../dom/focus-context.svelte.ts';

var root = $.add_locations(
	$.template(
		`/**
 * FocusTrap Component
 * 
 * Traps focus within its children, useful for modals and dialogs.
 * Automatically restores focus when unmounted.
 */ <box><!></box>`,
		1
	),
	FocusTrap[$.FILENAME],
	[[123, 0]]
);

export default function FocusTrap($$anchor, $$props) {
	$.check_target(new.target);
	$.push($$props, true, FocusTrap);

	// Component props
	let active = $.prop($$props, 'active', 7, true),
		restoreFocus = $.prop($$props, 'restoreFocus', 3, true),
		autoFocus = $.prop($$props, 'autoFocus', 3, true),
		escapeDeactivates = $.prop($$props, 'escapeDeactivates', 3, true),
		left = $.prop($$props, 'left', 3, 0),
		top = $.prop($$props, 'top', 3, 0),
		width = $.prop($$props, 'width', 3, '100%'),
		height = $.prop($$props, 'height', 3, '100%'),
		border = $.prop($$props, 'border', 3, false),
		hidden = $.prop($$props, 'hidden', 3, false),
		restProps = $.rest_props(
			$$props,
			[
				'$$slots',
				'$$events',
				'$$legacy',
				'active',
				'restoreFocus',
				'autoFocus',
				'escapeDeactivates',
				'onDeactivate',
				'left',
				'top',
				'width',
				'height',
				'border',
				'zIndex',
				'hidden',
				'children'
			],
			'restProps'
		);

	let containerElement = $.state(null);
	let previouslyFocusedElement = $.state(null);
	let focusContext = null;

	$.user_effect(() => {
		if (hasFocusContext()) {
			focusContext = getFocusContext();
		}
	});

	$.user_effect(() => {
		if (!focusContext || !$.get(containerElement) || !active()) return;
		// Store currently focused element for restoration
		$.set(previouslyFocusedElement, focusContext.focusedElement, true);
		// Activate focus trap
		focusContext.trapFocus($.get(containerElement));

		// Auto-focus first element if requested
		if (autoFocus() && focusContext.focusableElements.length > 0) {
			focusContext.focus(focusContext.focusableElements[0].element);
		}

		// Set up escape key handler
		let cleanup = null;

		if (escapeDeactivates()) {
			const handleKeyPress = (ch, key) => {
				if ($.strict_equals(key.name, 'escape')) {
					deactivate();
				}
			};

			const screen = getScreen();

			if (screen) {
				screen.on('keypress', handleKeyPress);
				cleanup = () => screen.off('keypress', handleKeyPress);
			}
		}

		return () => {
			// Release focus trap
			if (focusContext) {
				focusContext.releaseFocusTrap();

				// Restore focus if requested
				if (restoreFocus() && $.get(previouslyFocusedElement)) {
					focusContext.focus($.get(previouslyFocusedElement));
				}
			}

			// Clean up escape handler
			if (cleanup) cleanup();
		};
	});

	function deactivate() {
		active(false);
		$$props.onDeactivate?.();
	}

	function getScreen() {
		if (!$.get(containerElement)?._terminalElement) return null;
		return $.get(containerElement)._terminalElement.screen;
	}

	// Convert border prop to blessed-compatible value
	let borderValue = $.derived(() => $.strict_equals(typeof border(), 'boolean') ? border() ? 'line' : false : border());

	$.next();

	var fragment = root();
	var box = $.sibling($.first_child(fragment));
	let attributes;
	var node = $.child(box);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			$.snippet(node_1, () => $$props.children);
			$.append($$anchor, fragment_1);
		};

		$.if(node, ($$render) => {
			if ($$props.children) $$render(consequent);
		});
	}

	$.reset(box);
	$.bind_this(box, ($$value) => $.set(containerElement, $$value), () => $.get(containerElement));

	$.template_effect(() => attributes = $.set_attributes(box, attributes, {
		left: left(),
		top: top(),
		width: width(),
		height: height(),
		border: $.get(borderValue),
		zIndex: $$props.zIndex,
		hidden: hidden() || !active(),
		focusable: false,
		...restProps
	}));

	$.append($$anchor, fragment);
	return $.pop({ ...$.legacy_api() });
}