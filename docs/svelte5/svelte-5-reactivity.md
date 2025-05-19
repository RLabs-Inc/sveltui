This file is a merged representation of a subset of the codebase, containing specifically included files, combined into a single document by Repomix.
The content has been processed where security check has been disabled.

# File Summary

## Purpose
This file contains a packed representation of the entire repository's contents.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Only files matching these patterns are included: packages/svelte/src/reactivity/**/*.*
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Security check has been disabled - content may contain sensitive information
- Files are sorted by Git change count (files with more changes are at the bottom)

## Additional Info

# Directory Structure
```
packages/
  svelte/
    src/
      reactivity/
        window/
          index.js
        create-subscriber.js
        date.js
        date.test.ts
        index-client.js
        index-server.js
        map.js
        map.test.ts
        media-query.js
        reactive-value.js
        set.js
        set.test.ts
        url-search-params.js
        url-search-params.test.ts
        url.js
        url.test.ts
        utils.js
```

# Files

## File: packages/svelte/src/reactivity/window/index.js
````javascript
import { BROWSER } from 'esm-env';
import { on } from '../../events/index.js';
import { ReactiveValue } from '../reactive-value.js';
import { get } from '../../internal/client/index.js';
import { set, source } from '../../internal/client/reactivity/sources.js';

/**
 * `scrollX.current` is a reactive view of `window.scrollX`. On the server it is `undefined`.
 * @since 5.11.0
 */
export const scrollX = new ReactiveValue(
	BROWSER ? () => window.scrollX : () => undefined,
	(update) => on(window, 'scroll', update)
);

/**
 * `scrollY.current` is a reactive view of `window.scrollY`. On the server it is `undefined`.
 * @since 5.11.0
 */
export const scrollY = new ReactiveValue(
	BROWSER ? () => window.scrollY : () => undefined,
	(update) => on(window, 'scroll', update)
);

/**
 * `innerWidth.current` is a reactive view of `window.innerWidth`. On the server it is `undefined`.
 * @since 5.11.0
 */
export const innerWidth = new ReactiveValue(
	BROWSER ? () => window.innerWidth : () => undefined,
	(update) => on(window, 'resize', update)
);

/**
 * `innerHeight.current` is a reactive view of `window.innerHeight`. On the server it is `undefined`.
 * @since 5.11.0
 */
export const innerHeight = new ReactiveValue(
	BROWSER ? () => window.innerHeight : () => undefined,
	(update) => on(window, 'resize', update)
);

/**
 * `outerWidth.current` is a reactive view of `window.outerWidth`. On the server it is `undefined`.
 * @since 5.11.0
 */
export const outerWidth = new ReactiveValue(
	BROWSER ? () => window.outerWidth : () => undefined,
	(update) => on(window, 'resize', update)
);

/**
 * `outerHeight.current` is a reactive view of `window.outerHeight`. On the server it is `undefined`.
 * @since 5.11.0
 */
export const outerHeight = new ReactiveValue(
	BROWSER ? () => window.outerHeight : () => undefined,
	(update) => on(window, 'resize', update)
);

/**
 * `screenLeft.current` is a reactive view of `window.screenLeft`. It is updated inside a `requestAnimationFrame` callback. On the server it is `undefined`.
 * @since 5.11.0
 */
export const screenLeft = new ReactiveValue(
	BROWSER ? () => window.screenLeft : () => undefined,
	(update) => {
		let value = window.screenLeft;

		let frame = requestAnimationFrame(function check() {
			frame = requestAnimationFrame(check);

			if (value !== (value = window.screenLeft)) {
				update();
			}
		});

		return () => {
			cancelAnimationFrame(frame);
		};
	}
);

/**
 * `screenTop.current` is a reactive view of `window.screenTop`. It is updated inside a `requestAnimationFrame` callback. On the server it is `undefined`.
 * @since 5.11.0
 */
export const screenTop = new ReactiveValue(
	BROWSER ? () => window.screenTop : () => undefined,
	(update) => {
		let value = window.screenTop;

		let frame = requestAnimationFrame(function check() {
			frame = requestAnimationFrame(check);

			if (value !== (value = window.screenTop)) {
				update();
			}
		});

		return () => {
			cancelAnimationFrame(frame);
		};
	}
);

/**
 * `online.current` is a reactive view of `navigator.onLine`. On the server it is `undefined`.
 * @since 5.11.0
 */
export const online = new ReactiveValue(
	BROWSER ? () => navigator.onLine : () => undefined,
	(update) => {
		const unsub_online = on(window, 'online', update);
		const unsub_offline = on(window, 'offline', update);
		return () => {
			unsub_online();
			unsub_offline();
		};
	}
);

/**
 * `devicePixelRatio.current` is a reactive view of `window.devicePixelRatio`. On the server it is `undefined`.
 * Note that behaviour differs between browsers — on Chrome it will respond to the current zoom level,
 * on Firefox and Safari it won't.
 * @type {{ get current(): number | undefined }}
 * @since 5.11.0
 */
export const devicePixelRatio = /* @__PURE__ */ new (class DevicePixelRatio {
	#dpr = source(BROWSER ? window.devicePixelRatio : undefined);

	#update() {
		const off = on(
			window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`),
			'change',
			() => {
				set(this.#dpr, window.devicePixelRatio);

				off();
				this.#update();
			}
		);
	}

	constructor() {
		if (BROWSER) {
			this.#update();
		}
	}

	get current() {
		get(this.#dpr);
		return BROWSER ? window.devicePixelRatio : undefined;
	}
})();
````

## File: packages/svelte/src/reactivity/create-subscriber.js
````javascript
import { get, tick, untrack } from '../internal/client/runtime.js';
import { effect_tracking, render_effect } from '../internal/client/reactivity/effects.js';
import { source } from '../internal/client/reactivity/sources.js';
import { increment } from './utils.js';

/**
 * Returns a `subscribe` function that, if called in an effect (including expressions in the template),
 * calls its `start` callback with an `update` function. Whenever `update` is called, the effect re-runs.
 *
 * If `start` returns a function, it will be called when the effect is destroyed.
 *
 * If `subscribe` is called in multiple effects, `start` will only be called once as long as the effects
 * are active, and the returned teardown function will only be called when all effects are destroyed.
 *
 * It's best understood with an example. Here's an implementation of [`MediaQuery`](https://svelte.dev/docs/svelte/svelte-reactivity#MediaQuery):
 *
 * ```js
 * import { createSubscriber } from 'svelte/reactivity';
 * import { on } from 'svelte/events';
 *
 * export class MediaQuery {
 * 	#query;
 * 	#subscribe;
 *
 * 	constructor(query) {
 * 		this.#query = window.matchMedia(`(${query})`);
 *
 * 		this.#subscribe = createSubscriber((update) => {
 * 			// when the `change` event occurs, re-run any effects that read `this.current`
 * 			const off = on(this.#query, 'change', update);
 *
 * 			// stop listening when all the effects are destroyed
 * 			return () => off();
 * 		});
 * 	}
 *
 * 	get current() {
 * 		this.#subscribe();
 *
 * 		// Return the current state of the query, whether or not we're in an effect
 * 		return this.#query.matches;
 * 	}
 * }
 * ```
 * @param {(update: () => void) => (() => void) | void} start
 * @since 5.7.0
 */
export function createSubscriber(start) {
	let subscribers = 0;
	let version = source(0);
	/** @type {(() => void) | void} */
	let stop;

	return () => {
		if (effect_tracking()) {
			get(version);

			render_effect(() => {
				if (subscribers === 0) {
					stop = untrack(() => start(() => increment(version)));
				}

				subscribers += 1;

				return () => {
					tick().then(() => {
						// Only count down after timeout, else we would reach 0 before our own render effect reruns,
						// but reach 1 again when the tick callback of the prior teardown runs. That would mean we
						// re-subcribe unnecessarily and create a memory leak because the old subscription is never cleaned up.
						subscribers -= 1;

						if (subscribers === 0) {
							stop?.();
							stop = undefined;
						}
					});
				};
			});
		}
	};
}
````

## File: packages/svelte/src/reactivity/date.js
````javascript
/** @import { Source } from '#client' */
import { derived } from '../internal/client/index.js';
import { source, set } from '../internal/client/reactivity/sources.js';
import { active_reaction, get, set_active_reaction } from '../internal/client/runtime.js';

var inited = false;

/**
 * A reactive version of the built-in [`Date`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) object.
 * Reading the date (whether with methods like `date.getTime()` or `date.toString()`, or via things like [`Intl.DateTimeFormat`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat))
 * in an [effect](https://svelte.dev/docs/svelte/$effect) or [derived](https://svelte.dev/docs/svelte/$derived)
 * will cause it to be re-evaluated when the value of the date changes.
 *
 * ```svelte
 * <script>
 * 	import { SvelteDate } from 'svelte/reactivity';
 *
 * 	const date = new SvelteDate();
 *
 * 	const formatter = new Intl.DateTimeFormat(undefined, {
 * 	  hour: 'numeric',
 * 	  minute: 'numeric',
 * 	  second: 'numeric'
 * 	});
 *
 * 	$effect(() => {
 * 		const interval = setInterval(() => {
 * 			date.setTime(Date.now());
 * 		}, 1000);
 *
 * 		return () => {
 * 			clearInterval(interval);
 * 		};
 * 	});
 * </script>
 *
 * <p>The time is {formatter.format(date)}</p>
 * ```
 */
export class SvelteDate extends Date {
	#time = source(super.getTime());

	/** @type {Map<keyof Date, Source<unknown>>} */
	#deriveds = new Map();

	#reaction = active_reaction;

	/** @param {any[]} params */
	constructor(...params) {
		// @ts-ignore
		super(...params);
		if (!inited) this.#init();
	}

	#init() {
		inited = true;

		var proto = SvelteDate.prototype;
		var date_proto = Date.prototype;

		var methods = /** @type {Array<keyof Date & string>} */ (
			Object.getOwnPropertyNames(date_proto)
		);

		for (const method of methods) {
			if (method.startsWith('get') || method.startsWith('to') || method === 'valueOf') {
				// @ts-ignore
				proto[method] = function (...args) {
					// don't memoize if there are arguments
					// @ts-ignore
					if (args.length > 0) {
						get(this.#time);
						// @ts-ignore
						return date_proto[method].apply(this, args);
					}

					var d = this.#deriveds.get(method);

					if (d === undefined) {
						// lazily create the derived, but as though it were being
						// created at the same time as the class instance
						const reaction = active_reaction;
						set_active_reaction(this.#reaction);

						d = derived(() => {
							get(this.#time);
							// @ts-ignore
							return date_proto[method].apply(this, args);
						});

						this.#deriveds.set(method, d);

						set_active_reaction(reaction);
					}

					return get(d);
				};
			}

			if (method.startsWith('set')) {
				// @ts-ignore
				proto[method] = function (...args) {
					// @ts-ignore
					var result = date_proto[method].apply(this, args);
					set(this.#time, date_proto.getTime.call(this));
					return result;
				};
			}
		}
	}
}
````

## File: packages/svelte/src/reactivity/date.test.ts
````typescript
import { render_effect, effect_root } from '../internal/client/reactivity/effects.js';
import { flushSync } from '../index-client.js';
import { SvelteDate } from './date.js';
import { assert, test } from 'vitest';
import { derived, get } from 'svelte/internal/client';

const initial_date = new Date(2023, 0, 2, 0, 0, 0, 0);
const a = new Date(2024, 1, 3, 1, 1, 1, 1);
const b = new Date(2025, 2, 4, 2, 2, 2, 2);
const c = new Date(2026, 3, 5, 3, 3, 3, 3);

test('date.setDate and date.setUTCDate', () => {
	const date = new SvelteDate(initial_date);
	const log: any = [];

	const cleanup = effect_root(() => {
		render_effect(() => {
			log.push(date.getDate());
		});
		render_effect(() => {
			log.push(date.getUTCDate());
		});
	});

	flushSync(() => {
		date.setDate(a.getDate());
	});

	flushSync(() => {
		date.setDate(date.getDate() + 1);
	});

	flushSync(() => {
		date.setDate(date.getDate()); // no change expected
	});

	flushSync(() => {
		date.setUTCDate(date.getUTCDate() + 1);
	});

	// Date/UTCDate may vary on some timezones
	const date_plus_zero = new Date(initial_date);
	date_plus_zero.setDate(a.getDate());
	const date_plus_one = new Date(initial_date);
	date_plus_one.setDate(a.getDate() + 1);
	const date_plus_two = new Date(initial_date);
	date_plus_two.setDate(a.getDate() + 2);

	assert.deepEqual(log, [
		initial_date.getDate(),
		initial_date.getUTCDate(),
		date_plus_zero.getDate(),
		date_plus_zero.getUTCDate(),
		date_plus_one.getDate(),
		date_plus_one.getUTCDate(),
		date_plus_two.getDate(),
		date_plus_two.getUTCDate()
	]);

	cleanup();
});

test('date.setFullYear and date.setUTCFullYear', () => {
	const date = new SvelteDate(initial_date);
	const log: any = [];

	const cleanup = effect_root(() => {
		render_effect(() => {
			log.push(date.getFullYear());
		});
		render_effect(() => {
			log.push(date.getUTCFullYear());
		});
	});

	flushSync(() => {
		date.setFullYear(a.getFullYear());
	});

	flushSync(() => {
		date.setFullYear(b.getFullYear());
	});

	flushSync(() => {
		date.setFullYear(b.getFullYear()); // no change expected
	});

	flushSync(() => {
		date.setUTCFullYear(c.getUTCFullYear());
	});

	assert.deepEqual(log, [
		initial_date.getFullYear(),
		initial_date.getUTCFullYear(),
		a.getFullYear(),
		a.getUTCFullYear(),
		b.getFullYear(),
		b.getUTCFullYear(),
		c.getFullYear(),
		c.getUTCFullYear()
	]);

	cleanup();
});

test('date.setHours and date.setUTCHours', () => {
	const date = new SvelteDate(initial_date);
	const log: any = [];

	const cleanup = effect_root(() => {
		render_effect(() => {
			log.push(date.getHours() % 24);
		});
		render_effect(() => {
			log.push(date.getUTCHours() % 24);
		});
	});

	flushSync(() => {
		date.setHours(a.getHours());
	});

	flushSync(() => {
		date.setHours(date.getHours() + 1);
	});

	flushSync(() => {
		date.setHours(date.getHours()); // no change expected
	});

	flushSync(() => {
		date.setUTCHours(date.getUTCHours() + 1);
	});

	assert.deepEqual(log, [
		initial_date.getHours(),
		initial_date.getUTCHours(),
		a.getHours() % 24,
		a.getUTCHours() % 24,
		(a.getHours() + 1) % 24,
		(a.getUTCHours() + 1) % 24,
		(a.getHours() + 2) % 24,
		(a.getUTCHours() + 2) % 24
	]);

	cleanup();
});

test('date.setMilliseconds and date.setUTCMilliseconds', () => {
	const date = new SvelteDate(initial_date);
	const log: any = [];

	const cleanup = effect_root(() => {
		render_effect(() => {
			log.push(date.getMilliseconds());
		});
		render_effect(() => {
			log.push(date.getUTCMilliseconds());
		});
	});

	flushSync(() => {
		date.setMilliseconds(a.getMilliseconds());
	});

	flushSync(() => {
		date.setMilliseconds(b.getMilliseconds());
	});

	flushSync(() => {
		date.setMilliseconds(b.getMilliseconds()); // no change expected
	});

	flushSync(() => {
		date.setUTCMilliseconds(c.getUTCMilliseconds());
	});

	assert.deepEqual(log, [
		initial_date.getMilliseconds(),
		initial_date.getUTCMilliseconds(),
		a.getMilliseconds(),
		a.getUTCMilliseconds(),
		b.getMilliseconds(),
		b.getUTCMilliseconds(),
		c.getMilliseconds(),
		c.getUTCMilliseconds()
	]);

	cleanup();
});

test('date.setMinutes and date.setUTCMinutes', () => {
	const date = new SvelteDate(initial_date);
	const log: any = [];

	const cleanup = effect_root(() => {
		render_effect(() => {
			log.push(date.getMinutes());
		});
		render_effect(() => {
			log.push(date.getUTCMinutes());
		});
	});

	flushSync(() => {
		date.setMinutes(a.getMinutes());
	});

	flushSync(() => {
		date.setMinutes(b.getMinutes());
	});

	flushSync(() => {
		date.setMinutes(b.getMinutes()); // no change expected
	});

	flushSync(() => {
		date.setUTCMinutes(c.getUTCMinutes());
	});

	assert.deepEqual(log, [
		initial_date.getMinutes(),
		initial_date.getUTCMinutes(),
		a.getMinutes(),
		a.getUTCMinutes(),
		b.getMinutes(),
		b.getUTCMinutes(),
		c.getMinutes(),
		c.getUTCMinutes()
	]);

	cleanup();
});

test('date.setMonth and date.setUTCMonth', () => {
	const date = new SvelteDate(initial_date);
	const log: any = [];

	const cleanup = effect_root(() => {
		render_effect(() => {
			log.push(date.getMonth());
		});
		render_effect(() => {
			log.push(date.getUTCMonth());
		});
	});

	flushSync(() => {
		date.setMonth(a.getMonth());
	});

	flushSync(() => {
		date.setMonth(b.getMonth());
	});

	flushSync(() => {
		date.setMonth(b.getMonth()); // no change expected
	});

	flushSync(() => {
		date.setUTCMonth(c.getUTCMonth());
	});

	assert.deepEqual(log, [
		initial_date.getMonth(),
		initial_date.getUTCMonth(),
		a.getMonth(),
		a.getUTCMonth(),
		b.getMonth(),
		b.getUTCMonth(),
		c.getMonth(),
		c.getUTCMonth()
	]);

	cleanup();
});

test('date.setSeconds and date.setUTCSeconds', () => {
	const date = new SvelteDate(initial_date);
	const log: any = [];

	const cleanup = effect_root(() => {
		render_effect(() => {
			log.push(date.getSeconds());
		});
		render_effect(() => {
			log.push(date.getUTCSeconds());
		});
	});

	flushSync(() => {
		date.setSeconds(a.getSeconds());
	});

	flushSync(() => {
		date.setSeconds(b.getSeconds());
	});

	flushSync(() => {
		date.setSeconds(b.getSeconds()); // no change expected
	});

	flushSync(() => {
		date.setUTCSeconds(c.getUTCSeconds());
	});

	assert.deepEqual(log, [
		initial_date.getSeconds(),
		initial_date.getUTCSeconds(),
		a.getSeconds(),
		a.getUTCSeconds(),
		b.getSeconds(),
		b.getUTCSeconds(),
		c.getSeconds(),
		c.getUTCSeconds()
	]);

	cleanup();
});

test('date.setTime', () => {
	const date = new SvelteDate(initial_date);
	const log: any = [];

	const cleanup = effect_root(() => {
		render_effect(() => {
			log.push(date.getTime());
		});
	});

	flushSync(() => {
		date.setTime(a.getTime());
	});

	flushSync(() => {
		date.setTime(b.getTime());
	});

	flushSync(() => {
		// nothing should happen here
		date.setTime(b.getTime());
	});

	assert.deepEqual(log, [initial_date.getTime(), a.getTime(), b.getTime()]);

	cleanup();
});

test('date.setYear', () => {
	const date = new SvelteDate(initial_date);
	const log: any = [];

	// @ts-expect-error
	if (!date.setYear) {
		return;
	}
	const cleanup = effect_root(() => {
		render_effect(() => {
			// @ts-expect-error
			log.push(date.getYear());
		});
	});

	flushSync(() => {
		// @ts-expect-error
		date.setYear(22);
	});

	flushSync(() => {
		// @ts-expect-error
		date.setYear(23);
	});

	flushSync(() => {
		// nothing should happen here
		// @ts-expect-error
		date.setYear(23);
	});

	// @ts-expect-error
	assert.deepEqual(log, [initial_date.getYear(), 22, 23]);

	cleanup();
});

test('date.setSeconds - edge cases', () => {
	const date = new SvelteDate(initial_date);
	const log: any = [];

	const cleanup = effect_root(() => {
		render_effect(() => {
			log.push(date.getSeconds());
		});
		render_effect(() => {
			log.push(date.getMinutes());
		});
	});

	flushSync(() => {
		date.setSeconds(60);
	});

	flushSync(() => {
		date.setSeconds(61);
	});

	assert.deepEqual(log, [
		initial_date.getSeconds(),
		initial_date.getMinutes(),
		initial_date.getMinutes() + 1,
		initial_date.getSeconds() + 1,
		initial_date.getMinutes() + 2
	]);

	cleanup();
});

test('Date propagated changes', () => {
	const date = new SvelteDate(initial_date);
	const log: any = [];

	const cleanup = effect_root(() => {
		render_effect(() => {
			log.push(date.getSeconds());
		});
		render_effect(() => {
			log.push(date.getMonth());
		});
		render_effect(() => {
			log.push(date.getFullYear());
		});
	});

	flushSync(() => {
		date.setMonth(13);
	});

	assert.deepEqual(log, [
		initial_date.getSeconds(),
		initial_date.getMonth(),
		initial_date.getFullYear(),
		1,
		2024
	]);

	cleanup();
});

test('Date fine grained tests', () => {
	const date = new SvelteDate(initial_date);

	let changes: Record<string, boolean> = {
		getFullYear: true,
		getUTCFullYear: true,
		getMonth: true,
		getUTCMonth: true,
		getDate: true,
		getUTCDate: true,
		getDay: true,
		getUTCDay: true,
		getHours: true,
		getUTCHours: true,
		getMinutes: true,
		getUTCMinutes: true,
		getSeconds: true,
		getUTCSeconds: true,
		getMilliseconds: true,
		getUTCMilliseconds: true,
		getTime: true,
		toISOString: true,
		toJSON: true,
		toUTCString: true,
		toString: true,
		toLocaleString: true
	};
	let test_description: string = '';

	const expect_all_changes_to_be_false = () => {
		for (const key of Object.keys(changes) as Array<keyof typeof Date>) {
			assert.equal(changes[key], false, `${test_description}: effect for ${key} was not fired`);
		}
	};

	const cleanup = effect_root(() => {
		for (const key of Object.keys(changes)) {
			render_effect(() => {
				// @ts-ignore
				date[key]();
				assert.equal(changes[key], true, `${test_description}: for ${key}`);
				changes[key] = false;
			});
		}
	});

	flushSync(() => {
		expect_all_changes_to_be_false();
		changes = {
			...changes,
			getFullYear: true,
			getUTCFullYear: true,
			getMonth: true,
			getUTCMonth: true,
			getDay: true,
			getUTCDay: true,
			getTime: true,
			toISOString: true,
			toJSON: true,
			toUTCString: true,
			toString: true,
			toLocaleString: true
		};
		test_description = 'changing setFullYear that will cause month/day change as well';
		date.setFullYear(initial_date.getFullYear() + 1, initial_date.getMonth() + 1);
	});

	flushSync(() => {
		expect_all_changes_to_be_false();
		changes = {
			...changes,
			getDate: true,
			getUTCDate: true,
			getDay: true,
			getUTCDay: true,
			getHours: true,
			getUTCHours: true,
			getMinutes: true,
			getUTCMinutes: true,
			getSeconds: true,
			getUTCSeconds: true,
			getMilliseconds: true,
			getUTCMilliseconds: true,
			getTime: true,
			toISOString: true,
			toJSON: true,
			toUTCString: true,
			toString: true,
			toLocaleString: true
		};
		test_description = 'changing seconds that will change day/hour/minutes/seconds/milliseconds';
		date.setSeconds(61 * 60 * 25 + 1, 10);
	});

	flushSync(() => {
		expect_all_changes_to_be_false();
		changes = {
			...changes,
			getMonth: true,
			getUTCMonth: true,
			getDay: true,
			getUTCDay: true,
			getMilliseconds: true,
			getUTCMilliseconds: true,
			getTime: true,
			toISOString: true,
			toJSON: true,
			toUTCString: true,
			toString: true,
			toLocaleString: true
		};
		test_description = 'changing month';
		date.setMonth(date.getMonth() + 1);
	});

	cleanup();
});

test('Date.toLocaleString', () => {
	const date = new SvelteDate(initial_date);

	const log: any = [];

	const cleanup = effect_root(() => {
		render_effect(() => {
			log.push(date.toLocaleString(undefined, { month: 'long', year: 'numeric' }));
		});
		render_effect(() => {
			log.push(date.toLocaleString(undefined, { month: 'long' }));
		});
	});

	flushSync();

	assert.deepEqual(log, [
		initial_date.toLocaleString(undefined, { month: 'long', year: 'numeric' }),
		initial_date.toLocaleString(undefined, { month: 'long' })
	]);

	cleanup();
});

test('Date.valueOf', () => {
	const date = new SvelteDate(initial_date);

	const log: any = [];

	const cleanup = effect_root(() => {
		render_effect(() => {
			log.push(date.valueOf());
		});
	});

	flushSync();

	assert.deepEqual(log, [initial_date.valueOf()]);

	flushSync(() => {
		date.setTime(date.getTime() + 10);
	});

	assert.deepEqual(log, [initial_date.valueOf(), new Date(initial_date.getTime() + 10).valueOf()]);

	cleanup();
});

test('Date.instanceOf', () => {
	assert.equal(new SvelteDate() instanceof Date, true);
});

test('Date methods invoked for the first time in a derived', () => {
	const date = new SvelteDate(initial_date);
	const log: any = [];

	const cleanup = effect_root(() => {
		const months = derived(() => {
			return date.getMonth();
		});

		render_effect(() => {
			log.push(get(months));
		});

		flushSync(() => {
			date.setMonth(date.getMonth() + 1);
		});

		flushSync(() => {
			date.setMonth(date.getMonth() + 1);
		});
	});

	assert.deepEqual(log, [0, 1, 2]);

	cleanup();
});

test('Date methods shared between deriveds', () => {
	const date = new SvelteDate(initial_date);
	const log: any = [];

	const cleanup = effect_root(() => {
		const year = derived(() => {
			return date.getFullYear();
		});
		const year2 = derived(() => {
			return date.getTime(), date.getFullYear();
		});

		render_effect(() => {
			log.push(get(year) + '/' + get(year2).toString());
		});

		flushSync(() => {
			date.setFullYear(date.getFullYear() + 1);
		});

		flushSync(() => {
			date.setFullYear(date.getFullYear() + 1);
		});
	});

	assert.deepEqual(log, ['2023/2023', '2024/2024', '2025/2025']);

	cleanup();
});
````

## File: packages/svelte/src/reactivity/index-client.js
````javascript
export { SvelteDate } from './date.js';
export { SvelteSet } from './set.js';
export { SvelteMap } from './map.js';
export { SvelteURL } from './url.js';
export { SvelteURLSearchParams } from './url-search-params.js';
export { MediaQuery } from './media-query.js';
export { createSubscriber } from './create-subscriber.js';
````

## File: packages/svelte/src/reactivity/index-server.js
````javascript
export const SvelteDate = globalThis.Date;
export const SvelteSet = globalThis.Set;
export const SvelteMap = globalThis.Map;
export const SvelteURL = globalThis.URL;
export const SvelteURLSearchParams = globalThis.URLSearchParams;

export class MediaQuery {
	current;
	/**
	 * @param {string} query
	 * @param {boolean} [matches]
	 */
	constructor(query, matches = false) {
		this.current = matches;
	}
}

/**
 * @param {any} _
 */
export function createSubscriber(_) {
	return () => {};
}
````

## File: packages/svelte/src/reactivity/map.js
````javascript
/** @import { Source } from '#client' */
import { DEV } from 'esm-env';
import { set, source } from '../internal/client/reactivity/sources.js';
import { get } from '../internal/client/runtime.js';
import { increment } from './utils.js';

/**
 * A reactive version of the built-in [`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) object.
 * Reading contents of the map (by iterating, or by reading `map.size` or calling `map.get(...)` or `map.has(...)` as in the [tic-tac-toe example](https://svelte.dev/playground/0b0ff4aa49c9443f9b47fe5203c78293) below) in an [effect](https://svelte.dev/docs/svelte/$effect) or [derived](https://svelte.dev/docs/svelte/$derived)
 * will cause it to be re-evaluated as necessary when the map is updated.
 *
 * Note that values in a reactive map are _not_ made [deeply reactive](https://svelte.dev/docs/svelte/$state#Deep-state).
 *
 * ```svelte
 * <script>
 * 	import { SvelteMap } from 'svelte/reactivity';
 * 	import { result } from './game.js';
 *
 * 	let board = new SvelteMap();
 * 	let player = $state('x');
 * 	let winner = $derived(result(board));
 *
 * 	function reset() {
 * 		player = 'x';
 * 		board.clear();
 * 	}
 * </script>
 *
 * <div class="board">
 * 	{#each Array(9), i}
 * 		<button
 * 			disabled={board.has(i) || winner}
 * 			onclick={() => {
 * 				board.set(i, player);
 * 				player = player === 'x' ? 'o' : 'x';
 * 			}}
 * 		>{board.get(i)}</button>
 * 	{/each}
 * </div>
 *
 * {#if winner}
 * 	<p>{winner} wins!</p>
 * 	<button onclick={reset}>reset</button>
 * {:else}
 * 	<p>{player} is next</p>
 * {/if}
 * ```
 *
 * @template K
 * @template V
 * @extends {Map<K, V>}
 */
export class SvelteMap extends Map {
	/** @type {Map<K, Source<number>>} */
	#sources = new Map();
	#version = source(0);
	#size = source(0);

	/**
	 * @param {Iterable<readonly [K, V]> | null | undefined} [value]
	 */
	constructor(value) {
		super();

		// If the value is invalid then the native exception will fire here
		if (DEV) value = new Map(value);

		if (value) {
			for (var [key, v] of value) {
				super.set(key, v);
			}
			this.#size.v = super.size;
		}
	}

	/** @param {K} key */
	has(key) {
		var sources = this.#sources;
		var s = sources.get(key);

		if (s === undefined) {
			var ret = super.get(key);
			if (ret !== undefined) {
				s = source(0);
				sources.set(key, s);
			} else {
				// We should always track the version in case
				// the Set ever gets this value in the future.
				get(this.#version);
				return false;
			}
		}

		get(s);
		return true;
	}

	/**
	 * @param {(value: V, key: K, map: Map<K, V>) => void} callbackfn
	 * @param {any} [this_arg]
	 */
	forEach(callbackfn, this_arg) {
		this.#read_all();
		super.forEach(callbackfn, this_arg);
	}

	/** @param {K} key */
	get(key) {
		var sources = this.#sources;
		var s = sources.get(key);

		if (s === undefined) {
			var ret = super.get(key);
			if (ret !== undefined) {
				s = source(0);
				sources.set(key, s);
			} else {
				// We should always track the version in case
				// the Set ever gets this value in the future.
				get(this.#version);
				return undefined;
			}
		}

		get(s);
		return super.get(key);
	}

	/**
	 * @param {K} key
	 * @param {V} value
	 * */
	set(key, value) {
		var sources = this.#sources;
		var s = sources.get(key);
		var prev_res = super.get(key);
		var res = super.set(key, value);
		var version = this.#version;

		if (s === undefined) {
			sources.set(key, source(0));
			set(this.#size, super.size);
			increment(version);
		} else if (prev_res !== value) {
			increment(s);

			// if not every reaction of s is a reaction of version we need to also include version
			var v_reactions = version.reactions === null ? null : new Set(version.reactions);
			var needs_version_increase =
				v_reactions === null ||
				!s.reactions?.every((r) =>
					/** @type {NonNullable<typeof v_reactions>} */ (v_reactions).has(r)
				);
			if (needs_version_increase) {
				increment(version);
			}
		}

		return res;
	}

	/** @param {K} key */
	delete(key) {
		var sources = this.#sources;
		var s = sources.get(key);
		var res = super.delete(key);

		if (s !== undefined) {
			sources.delete(key);
			set(this.#size, super.size);
			set(s, -1);
			increment(this.#version);
		}

		return res;
	}

	clear() {
		if (super.size === 0) {
			return;
		}
		// Clear first, so we get nice console.log outputs with $inspect
		super.clear();
		var sources = this.#sources;
		set(this.#size, 0);
		for (var s of sources.values()) {
			set(s, -1);
		}
		increment(this.#version);
		sources.clear();
	}

	#read_all() {
		get(this.#version);

		var sources = this.#sources;
		if (this.#size.v !== sources.size) {
			for (var key of super.keys()) {
				if (!sources.has(key)) {
					sources.set(key, source(0));
				}
			}
		}

		for (var [, s] of this.#sources) {
			get(s);
		}
	}

	keys() {
		get(this.#version);
		return super.keys();
	}

	values() {
		this.#read_all();
		return super.values();
	}

	entries() {
		this.#read_all();
		return super.entries();
	}

	[Symbol.iterator]() {
		return this.entries();
	}

	get size() {
		get(this.#size);
		return super.size;
	}
}
````

## File: packages/svelte/src/reactivity/map.test.ts
````typescript
import { render_effect, effect_root } from '../internal/client/reactivity/effects.js';
import { flushSync } from '../index-client.js';
import { SvelteMap } from './map.js';
import { assert, test } from 'vitest';

test('map.values()', () => {
	const map = new SvelteMap([
		[1, 1],
		[2, 2],
		[3, 3],
		[4, 4],
		[5, 5]
	]);

	const log: any = [];

	const cleanup = effect_root(() => {
		render_effect(() => {
			log.push(map.size);
		});

		render_effect(() => {
			log.push(map.has(3));
		});

		render_effect(() => {
			log.push(Array.from(map.values()));
		});
	});

	flushSync(() => {
		map.delete(3);
	});

	flushSync(() => {
		map.clear();
	});

	flushSync(() => {
		map.set(3, 3);
	});

	flushSync(() => {
		map.set(3, 4);
	});

	assert.deepEqual(log, [
		5,
		true,
		[1, 2, 3, 4, 5],
		4,
		false,
		[1, 2, 4, 5],
		0,
		false,
		[],
		1,
		true,
		[3],
		true,
		[4]
	]);

	cleanup();
});

test('map.get(...)', () => {
	const map = new SvelteMap([
		[1, 1],
		[2, 2],
		[3, 3]
	]);

	const log: any = [];

	const cleanup = effect_root(() => {
		render_effect(() => {
			log.push('get 1', map.get(1));
		});

		render_effect(() => {
			log.push('get 2', map.get(2));
		});

		render_effect(() => {
			log.push('get 3', map.get(3));
		});
	});

	flushSync(() => {
		map.delete(2);
	});

	flushSync(() => {
		map.set(2, 2);
	});

	assert.deepEqual(log, ['get 1', 1, 'get 2', 2, 'get 3', 3, 'get 2', undefined, 'get 2', 2]);

	cleanup();
});

test('map.has(...)', () => {
	const map = new SvelteMap([
		[1, 1],
		[2, 2],
		[3, 3]
	]);

	const log: any = [];

	const cleanup = effect_root(() => {
		render_effect(() => {
			log.push('has 1', map.has(1));
		});

		render_effect(() => {
			log.push('has 2', map.has(2));
		});

		render_effect(() => {
			log.push('has 3', map.has(3));
		});
	});

	flushSync(() => {
		map.delete(2);
	});

	flushSync(() => {
		map.set(2, 2);
	});

	assert.deepEqual(log, [
		'has 1',
		true,
		'has 2',
		true,
		'has 3',
		true,
		'has 2',
		false,
		'has 2',
		true
	]);

	cleanup();
});

test('map.forEach(...)', () => {
	const map = new SvelteMap([
		[1, 1],
		[2, 2],
		[3, 3]
	]);

	const log: any = [];
	const this_arg = {};

	map.forEach(function (this: unknown, ...args) {
		log.push([...args, this]);
	}, this_arg);

	assert.deepEqual(log, [
		[1, 1, map, this_arg],
		[2, 2, map, this_arg],
		[3, 3, map, this_arg]
	]);
});

test('map.delete(...)', () => {
	const map = new SvelteMap([
		[1, 1],
		[2, 2],
		[3, 3]
	]);

	assert.equal(map.delete(3), true);
	assert.equal(map.delete(3), false);

	assert.deepEqual(Array.from(map.values()), [1, 2]);
});

test('map handling of undefined values', () => {
	const map = new SvelteMap();

	const log: any = [];

	const cleanup = effect_root(() => {
		map.set(1, undefined);

		render_effect(() => {
			log.push(map.get(1));
		});

		flushSync(() => {
			map.delete(1);
		});

		flushSync(() => {
			map.set(1, 1);
		});
	});

	assert.deepEqual(log, [undefined, undefined, 1]);

	cleanup();
});

test('not invoking reactivity when value is not in the map after changes', () => {
	const map = new SvelteMap([[1, 1]]);

	const log: any = [];

	const cleanup = effect_root(() => {
		render_effect(() => {
			log.push(map.get(1));
		});

		render_effect(() => {
			log.push(map.get(2));
		});

		flushSync(() => {
			map.delete(1);
		});

		flushSync(() => {
			map.set(1, 1);
		});
	});

	assert.deepEqual(log, [1, undefined, undefined, undefined, 1, undefined]);

	cleanup();
});

test('Map.instanceOf', () => {
	assert.equal(new SvelteMap() instanceof Map, true);
});
````

## File: packages/svelte/src/reactivity/media-query.js
````javascript
import { on } from '../events/index.js';
import { ReactiveValue } from './reactive-value.js';

const parenthesis_regex = /\(.+\)/;

/**
 * Creates a media query and provides a `current` property that reflects whether or not it matches.
 *
 * Use it carefully — during server-side rendering, there is no way to know what the correct value should be, potentially causing content to change upon hydration.
 * If you can use the media query in CSS to achieve the same effect, do that.
 *
 * ```svelte
 * <script>
 * 	import { MediaQuery } from 'svelte/reactivity';
 *
 * 	const large = new MediaQuery('min-width: 800px');
 * </script>
 *
 * <h1>{large.current ? 'large screen' : 'small screen'}</h1>
 * ```
 * @extends {ReactiveValue<boolean>}
 * @since 5.7.0
 */
export class MediaQuery extends ReactiveValue {
	/**
	 * @param {string} query A media query string
	 * @param {boolean} [fallback] Fallback value for the server
	 */
	constructor(query, fallback) {
		let final_query = parenthesis_regex.test(query) ? query : `(${query})`;
		const q = window.matchMedia(final_query);
		super(
			() => q.matches,
			(update) => on(q, 'change', update)
		);
	}
}
````

## File: packages/svelte/src/reactivity/reactive-value.js
````javascript
import { createSubscriber } from './create-subscriber.js';

/**
 * @template T
 */
export class ReactiveValue {
	#fn;
	#subscribe;

	/**
	 *
	 * @param {() => T} fn
	 * @param {(update: () => void) => void} onsubscribe
	 */
	constructor(fn, onsubscribe) {
		this.#fn = fn;
		this.#subscribe = createSubscriber(onsubscribe);
	}

	get current() {
		this.#subscribe();
		return this.#fn();
	}
}
````

## File: packages/svelte/src/reactivity/set.js
````javascript
/** @import { Source } from '#client' */
import { DEV } from 'esm-env';
import { source, set } from '../internal/client/reactivity/sources.js';
import { get } from '../internal/client/runtime.js';
import { increment } from './utils.js';

var read_methods = ['forEach', 'isDisjointFrom', 'isSubsetOf', 'isSupersetOf'];
var set_like_methods = ['difference', 'intersection', 'symmetricDifference', 'union'];

var inited = false;

/**
 * A reactive version of the built-in [`Set`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set) object.
 * Reading contents of the set (by iterating, or by reading `set.size` or calling `set.has(...)` as in the [example](https://svelte.dev/playground/53438b51194b4882bcc18cddf9f96f15) below) in an [effect](https://svelte.dev/docs/svelte/$effect) or [derived](https://svelte.dev/docs/svelte/$derived)
 * will cause it to be re-evaluated as necessary when the set is updated.
 *
 * Note that values in a reactive set are _not_ made [deeply reactive](https://svelte.dev/docs/svelte/$state#Deep-state).
 *
 * ```svelte
 * <script>
 * 	import { SvelteSet } from 'svelte/reactivity';
 * 	let monkeys = new SvelteSet();
 *
 * 	function toggle(monkey) {
 * 		if (monkeys.has(monkey)) {
 * 			monkeys.delete(monkey);
 * 		} else {
 * 			monkeys.add(monkey);
 * 		}
 * 	}
 * </script>
 *
 * {#each ['🙈', '🙉', '🙊'] as monkey}
 * 	<button onclick={() => toggle(monkey)}>{monkey}</button>
 * {/each}
 *
 * <button onclick={() => monkeys.clear()}>clear</button>
 *
 * {#if monkeys.has('🙈')}<p>see no evil</p>{/if}
 * {#if monkeys.has('🙉')}<p>hear no evil</p>{/if}
 * {#if monkeys.has('🙊')}<p>speak no evil</p>{/if}
 * ```
 *
 * @template T
 * @extends {Set<T>}
 */
export class SvelteSet extends Set {
	/** @type {Map<T, Source<boolean>>} */
	#sources = new Map();
	#version = source(0);
	#size = source(0);

	/**
	 * @param {Iterable<T> | null | undefined} [value]
	 */
	constructor(value) {
		super();

		// If the value is invalid then the native exception will fire here
		if (DEV) value = new Set(value);

		if (value) {
			for (var element of value) {
				super.add(element);
			}
			this.#size.v = super.size;
		}

		if (!inited) this.#init();
	}

	// We init as part of the first instance so that we can treeshake this class
	#init() {
		inited = true;

		var proto = SvelteSet.prototype;
		var set_proto = Set.prototype;

		for (const method of read_methods) {
			// @ts-ignore
			proto[method] = function (...v) {
				get(this.#version);
				// @ts-ignore
				return set_proto[method].apply(this, v);
			};
		}

		for (const method of set_like_methods) {
			// @ts-ignore
			proto[method] = function (...v) {
				get(this.#version);
				// @ts-ignore
				var set = /** @type {Set<T>} */ (set_proto[method].apply(this, v));
				return new SvelteSet(set);
			};
		}
	}

	/** @param {T} value */
	has(value) {
		var has = super.has(value);
		var sources = this.#sources;
		var s = sources.get(value);

		if (s === undefined) {
			if (!has) {
				// If the value doesn't exist, track the version in case it's added later
				// but don't create sources willy-nilly to track all possible values
				get(this.#version);
				return false;
			}

			s = source(true);
			sources.set(value, s);
		}

		get(s);
		return has;
	}

	/** @param {T} value */
	add(value) {
		if (!super.has(value)) {
			super.add(value);
			set(this.#size, super.size);
			increment(this.#version);
		}

		return this;
	}

	/** @param {T} value */
	delete(value) {
		var deleted = super.delete(value);
		var sources = this.#sources;
		var s = sources.get(value);

		if (s !== undefined) {
			sources.delete(value);
			set(s, false);
		}

		if (deleted) {
			set(this.#size, super.size);
			increment(this.#version);
		}

		return deleted;
	}

	clear() {
		if (super.size === 0) {
			return;
		}
		// Clear first, so we get nice console.log outputs with $inspect
		super.clear();
		var sources = this.#sources;

		for (var s of sources.values()) {
			set(s, false);
		}

		sources.clear();
		set(this.#size, 0);
		increment(this.#version);
	}

	keys() {
		return this.values();
	}

	values() {
		get(this.#version);
		return super.values();
	}

	entries() {
		get(this.#version);
		return super.entries();
	}

	[Symbol.iterator]() {
		return this.keys();
	}

	get size() {
		return get(this.#size);
	}
}
````

## File: packages/svelte/src/reactivity/set.test.ts
````typescript
import { render_effect, effect_root } from '../internal/client/reactivity/effects.js';
import { flushSync } from '../index-client.js';
import { SvelteSet } from './set.js';
import { assert, test } from 'vitest';

test('set.values()', () => {
	const set = new SvelteSet([1, 2, 3, 4, 5]);

	const log: any = [];

	const cleanup = effect_root(() => {
		render_effect(() => {
			log.push(set.size);
		});

		render_effect(() => {
			log.push(set.has(3));
		});

		render_effect(() => {
			log.push(Array.from(set));
		});
	});

	flushSync(() => {
		set.delete(3);
	});

	flushSync(() => {
		set.clear();
	});

	assert.deepEqual(log, [5, true, [1, 2, 3, 4, 5], 4, false, [1, 2, 4, 5], 0, false, []]);

	cleanup();
});

test('set.has(...)', () => {
	const set = new SvelteSet([1, 2, 3]);

	const log: any = [];

	const cleanup = effect_root(() => {
		render_effect(() => {
			log.push('has 1', set.has(1));
		});

		render_effect(() => {
			log.push('has 2', set.has(2));
		});

		render_effect(() => {
			log.push('has 3', set.has(3));
		});
	});

	flushSync(() => {
		set.delete(2);
	});

	flushSync(() => {
		set.add(2);
	});

	assert.deepEqual(log, [
		'has 1',
		true,
		'has 2',
		true,
		'has 3',
		true,
		'has 2',
		false,
		'has 2',
		true
	]);

	cleanup();
});

test('set.delete(...)', () => {
	const set = new SvelteSet([1, 2, 3]);

	assert.equal(set.delete(3), true);
	assert.equal(set.delete(3), false);

	assert.deepEqual(Array.from(set.values()), [1, 2]);
});

test('set.forEach()', () => {
	const set = new SvelteSet([1, 2, 3, 4, 5]);

	const log: any = [];

	const cleanup = effect_root(() => {
		render_effect(() => {
			set.forEach((v) => log.push(v));
		});
	});

	flushSync(() => {
		set.add(6);
	});

	assert.deepEqual(log, [1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 6]);

	cleanup();
});

test('not invoking reactivity when value is not in the set after changes', () => {
	const set = new SvelteSet([1, 2]);

	const log: any = [];

	const cleanup = effect_root(() => {
		render_effect(() => {
			log.push('has 1', set.has(1));
		});

		render_effect(() => {
			log.push('has 2', set.has(2));
		});

		render_effect(() => {
			log.push('has 3', set.has(3));
		});
	});

	flushSync(() => {
		set.delete(2);
	});

	flushSync(() => {
		set.add(2);
	});

	assert.deepEqual(log, [
		'has 1',
		true,
		'has 2',
		true,
		'has 3',
		false,
		'has 2',
		false,
		'has 3',
		false,
		'has 2',
		true,
		'has 3',
		false
	]);

	cleanup();
});

test('Set.instanceOf', () => {
	assert.equal(new SvelteSet() instanceof Set, true);
});
````

## File: packages/svelte/src/reactivity/url-search-params.js
````javascript
import { source } from '../internal/client/reactivity/sources.js';
import { get } from '../internal/client/runtime.js';
import { get_current_url } from './url.js';
import { increment } from './utils.js';

export const REPLACE = Symbol();

/**
 * A reactive version of the built-in [`URLSearchParams`](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) object.
 * Reading its contents (by iterating, or by calling `params.get(...)` or `params.getAll(...)` as in the [example](https://svelte.dev/playground/b3926c86c5384bab9f2cf993bc08c1c8) below) in an [effect](https://svelte.dev/docs/svelte/$effect) or [derived](https://svelte.dev/docs/svelte/$derived)
 * will cause it to be re-evaluated as necessary when the params are updated.
 *
 * ```svelte
 * <script>
 * 	import { SvelteURLSearchParams } from 'svelte/reactivity';
 *
 * 	const params = new SvelteURLSearchParams('message=hello');
 *
 * 	let key = $state('key');
 * 	let value = $state('value');
 * </script>
 *
 * <input bind:value={key} />
 * <input bind:value={value} />
 * <button onclick={() => params.append(key, value)}>append</button>
 *
 * <p>?{params.toString()}</p>
 *
 * {#each params as [key, value]}
 * 	<p>{key}: {value}</p>
 * {/each}
 * ```
 */
export class SvelteURLSearchParams extends URLSearchParams {
	#version = source(0);
	#url = get_current_url();

	#updating = false;

	#update_url() {
		if (!this.#url || this.#updating) return;
		this.#updating = true;

		const search = this.toString();
		this.#url.search = search && `?${search}`;

		this.#updating = false;
	}

	/**
	 * @param {URLSearchParams} params
	 * @internal
	 */
	[REPLACE](params) {
		if (this.#updating) return;
		this.#updating = true;

		for (const key of [...super.keys()]) {
			super.delete(key);
		}

		for (const [key, value] of params) {
			super.append(key, value);
		}

		increment(this.#version);
		this.#updating = false;
	}

	/**
	 * @param {string} name
	 * @param {string} value
	 * @returns {void}
	 */
	append(name, value) {
		super.append(name, value);
		this.#update_url();
		increment(this.#version);
	}

	/**
	 * @param {string} name
	 * @param {string=} value
	 * @returns {void}
	 */
	delete(name, value) {
		var has_value = super.has(name, value);
		super.delete(name, value);
		if (has_value) {
			this.#update_url();
			increment(this.#version);
		}
	}

	/**
	 * @param {string} name
	 * @returns {string|null}
	 */
	get(name) {
		get(this.#version);
		return super.get(name);
	}

	/**
	 * @param {string} name
	 * @returns {string[]}
	 */
	getAll(name) {
		get(this.#version);
		return super.getAll(name);
	}

	/**
	 * @param {string} name
	 * @param {string=} value
	 * @returns {boolean}
	 */
	has(name, value) {
		get(this.#version);
		return super.has(name, value);
	}

	keys() {
		get(this.#version);
		return super.keys();
	}

	/**
	 * @param {string} name
	 * @param {string} value
	 * @returns {void}
	 */
	set(name, value) {
		var previous = super.getAll(name).join('');
		super.set(name, value);
		// can't use has(name, value), because for something like https://svelte.dev?foo=1&bar=2&foo=3
		// if you set `foo` to 1, then foo=3 gets deleted whilst `has("foo", "1")` returns true
		if (previous !== super.getAll(name).join('')) {
			this.#update_url();
			increment(this.#version);
		}
	}

	sort() {
		super.sort();
		this.#update_url();
		increment(this.#version);
	}

	toString() {
		get(this.#version);
		return super.toString();
	}

	values() {
		get(this.#version);
		return super.values();
	}

	entries() {
		get(this.#version);
		return super.entries();
	}

	[Symbol.iterator]() {
		return this.entries();
	}

	get size() {
		get(this.#version);
		return super.size;
	}
}
````

## File: packages/svelte/src/reactivity/url-search-params.test.ts
````typescript
import { render_effect, effect_root } from '../internal/client/reactivity/effects.js';
import { flushSync } from '../index-client.js';
import { assert, test } from 'vitest';
import { SvelteURLSearchParams } from './url-search-params';

test('new URLSearchParams', () => {
	const params = new SvelteURLSearchParams('a=b');
	const log: any = [];

	const cleanup = effect_root(() => {
		render_effect(() => {
			log.push(params.toString());
		});
	});

	flushSync(() => {
		params.set('a', 'c');
	});

	flushSync(() => {
		// nothing should happen here
		params.set('a', 'c');
	});

	assert.deepEqual(log, ['a=b', 'a=c']);

	cleanup();
});

test('URLSearchParams.set', () => {
	const params = new SvelteURLSearchParams();
	const log: any = [];

	const cleanup = effect_root(() => {
		render_effect(() => {
			log.push(params.toString());
		});
	});

	flushSync(() => {
		params.set('a', 'b');
	});

	flushSync(() => {
		params.set('a', 'c');
	});

	flushSync(() => {
		// nothing should happen here
		params.set('a', 'c');
	});

	assert.deepEqual(log, ['', 'a=b', 'a=c']);

	cleanup();
});

test('URLSearchParams.append', () => {
	const params = new SvelteURLSearchParams();
	const log: any = [];

	const cleanup = effect_root(() => {
		render_effect(() => {
			log.push(params.toString());
		});
	});

	flushSync(() => {
		params.append('a', 'b');
	});

	flushSync(() => {
		// nothing should happen here
		params.set('a', 'b');
	});

	flushSync(() => {
		params.append('a', 'c');
	});

	assert.deepEqual(log, ['', 'a=b', 'a=b&a=c']);

	cleanup();
});

test('URLSearchParams.delete', () => {
	const params = new SvelteURLSearchParams('a=b&c=d');
	const log: any = [];

	const cleanup = effect_root(() => {
		render_effect(() => {
			log.push(params.toString());
		});
	});

	flushSync(() => {
		params.delete('a');
	});

	flushSync(() => {
		// nothing should happen here
		params.delete('a');
	});

	flushSync(() => {
		params.set('a', 'b');
	});

	assert.deepEqual(log, ['a=b&c=d', 'c=d', 'c=d&a=b']);

	cleanup();
});

test('URLSearchParams.get', () => {
	const params = new SvelteURLSearchParams('a=b&c=d');
	const log: any = [];

	const cleanup = effect_root(() => {
		render_effect(() => {
			log.push(params.get('a'));
		});
		render_effect(() => {
			log.push(params.get('c'));
		});
		render_effect(() => {
			log.push(params.get('e'));
		});
	});

	flushSync(() => {
		params.set('a', 'b');
	});

	flushSync(() => {
		params.set('a', 'new-b');
	});

	flushSync(() => {
		params.delete('a');
	});

	assert.deepEqual(log, ['b', 'd', null, 'new-b', 'd', null, null, 'd', null]);

	cleanup();
});

test('URLSearchParams.getAll', () => {
	const params = new SvelteURLSearchParams('a=b&c=d');
	const log: any = [];

	const cleanup = effect_root(() => {
		render_effect(() => {
			log.push(params.getAll('a'));
		});
		render_effect(() => {
			log.push(params.getAll('q'));
		});
	});

	flushSync(() => {
		params.append('a', 'b1');
	});

	flushSync(() => {
		params.append('q', 'z');
	});

	assert.deepEqual(log, [
		// initial
		['b'],
		[],
		// first flush
		['b', 'b1'],
		[],
		// second flush
		['b', 'b1'],
		['z']
	]);

	cleanup();
});

test('URLSearchParams.toString', () => {
	const params = new SvelteURLSearchParams();
	const log: any = [];

	const cleanup = effect_root(() => {
		render_effect(() => {
			log.push(params.toString());
		});
	});

	flushSync(() => {
		params.set('a', 'b');
	});

	flushSync(() => {
		params.append('a', 'c');
	});

	assert.deepEqual(log, ['', 'a=b', 'a=b&a=c']);

	cleanup();
});

test('SvelteURLSearchParams instanceof URLSearchParams', () => {
	assert.ok(new SvelteURLSearchParams() instanceof URLSearchParams);
});
````

## File: packages/svelte/src/reactivity/url.js
````javascript
import { source, set } from '../internal/client/reactivity/sources.js';
import { get } from '../internal/client/runtime.js';
import { REPLACE, SvelteURLSearchParams } from './url-search-params.js';

/** @type {SvelteURL | null} */
let current_url = null;

export function get_current_url() {
	// ideally we'd just export `current_url` directly, but it seems Vitest doesn't respect live bindings
	return current_url;
}

/**
 * A reactive version of the built-in [`URL`](https://developer.mozilla.org/en-US/docs/Web/API/URL) object.
 * Reading properties of the URL (such as `url.href` or `url.pathname`) in an [effect](https://svelte.dev/docs/svelte/$effect) or [derived](https://svelte.dev/docs/svelte/$derived)
 * will cause it to be re-evaluated as necessary when the URL changes.
 *
 * The `searchParams` property is an instance of [SvelteURLSearchParams](https://svelte.dev/docs/svelte/svelte-reactivity#SvelteURLSearchParams).
 *
 * [Example](https://svelte.dev/playground/5a694758901b448c83dc40dc31c71f2a):
 *
 * ```svelte
 * <script>
 * 	import { SvelteURL } from 'svelte/reactivity';
 *
 * 	const url = new SvelteURL('https://example.com/path');
 * </script>
 *
 * <!-- changes to these... -->
 * <input bind:value={url.protocol} />
 * <input bind:value={url.hostname} />
 * <input bind:value={url.pathname} />
 *
 * <hr />
 *
 * <!-- will update `href` and vice versa -->
 * <input bind:value={url.href} size="65" />
 * ```
 */
export class SvelteURL extends URL {
	#protocol = source(super.protocol);
	#username = source(super.username);
	#password = source(super.password);
	#hostname = source(super.hostname);
	#port = source(super.port);
	#pathname = source(super.pathname);
	#hash = source(super.hash);
	#search = source(super.search);
	#searchParams;

	/**
	 * @param {string | URL} url
	 * @param {string | URL} [base]
	 */
	constructor(url, base) {
		url = new URL(url, base);
		super(url);

		current_url = this;
		this.#searchParams = new SvelteURLSearchParams(url.searchParams);
		current_url = null;
	}

	get hash() {
		return get(this.#hash);
	}

	set hash(value) {
		super.hash = value;
		set(this.#hash, super.hash);
	}

	get host() {
		get(this.#hostname);
		get(this.#port);
		return super.host;
	}

	set host(value) {
		super.host = value;
		set(this.#hostname, super.hostname);
		set(this.#port, super.port);
	}

	get hostname() {
		return get(this.#hostname);
	}

	set hostname(value) {
		super.hostname = value;
		set(this.#hostname, super.hostname);
	}

	get href() {
		get(this.#protocol);
		get(this.#username);
		get(this.#password);
		get(this.#hostname);
		get(this.#port);
		get(this.#pathname);
		get(this.#hash);
		get(this.#search);
		return super.href;
	}

	set href(value) {
		super.href = value;
		set(this.#protocol, super.protocol);
		set(this.#username, super.username);
		set(this.#password, super.password);
		set(this.#hostname, super.hostname);
		set(this.#port, super.port);
		set(this.#pathname, super.pathname);
		set(this.#hash, super.hash);
		set(this.#search, super.search);
		this.#searchParams[REPLACE](super.searchParams);
	}

	get password() {
		return get(this.#password);
	}

	set password(value) {
		super.password = value;
		set(this.#password, super.password);
	}

	get pathname() {
		return get(this.#pathname);
	}

	set pathname(value) {
		super.pathname = value;
		set(this.#pathname, super.pathname);
	}

	get port() {
		return get(this.#port);
	}

	set port(value) {
		super.port = value;
		set(this.#port, super.port);
	}

	get protocol() {
		return get(this.#protocol);
	}

	set protocol(value) {
		super.protocol = value;
		set(this.#protocol, super.protocol);
	}

	get search() {
		return get(this.#search);
	}

	set search(value) {
		super.search = value;
		set(this.#search, value);
		this.#searchParams[REPLACE](super.searchParams);
	}

	get username() {
		return get(this.#username);
	}

	set username(value) {
		super.username = value;
		set(this.#username, super.username);
	}

	get origin() {
		get(this.#protocol);
		get(this.#hostname);
		get(this.#port);
		return super.origin;
	}

	get searchParams() {
		return this.#searchParams;
	}

	toString() {
		return this.href;
	}

	toJSON() {
		return this.href;
	}
}
````

## File: packages/svelte/src/reactivity/url.test.ts
````typescript
import { render_effect, effect_root } from '../internal/client/reactivity/effects.js';
import { flushSync } from '../index-client.js';
import { SvelteURL } from './url.js';
import { assert, test } from 'vitest';

test('url.hash', () => {
	const url = new SvelteURL('https://svelte.dev');
	const log: any = [];

	const cleanup = effect_root(() => {
		render_effect(() => {
			log.push(url.hash);
		});
	});

	flushSync(() => {
		url.hash = 'abc';
	});

	flushSync(() => {
		url.href = 'https://svelte.dev/a/b/c#def';
	});

	flushSync(() => {
		// does not affect hash
		url.pathname = 'e/f';
	});

	assert.deepEqual(log, ['', '#abc', '#def']);

	cleanup();
});

test('url.href', () => {
	const url = new SvelteURL('https://svelte.dev?foo=bar&t=123');
	const log: any = [];

	const cleanup = effect_root(() => {
		render_effect(() => {
			log.push(url.href);
		});
	});

	flushSync(() => {
		url.search = '?q=kit&foo=baz';
	});

	flushSync(() => {
		// changes from searchParams should be synced to URL instance as well
		url.searchParams.append('foo', 'qux');
	});

	flushSync(() => {
		url.searchParams.delete('foo');
	});

	flushSync(() => {
		url.searchParams.set('love', 'svelte5');
	});

	assert.deepEqual(log, [
		'https://svelte.dev/?foo=bar&t=123',
		'https://svelte.dev/?q=kit&foo=baz',
		'https://svelte.dev/?q=kit&foo=baz&foo=qux',
		'https://svelte.dev/?q=kit',
		'https://svelte.dev/?q=kit&love=svelte5'
	]);

	cleanup();
});

test('url.searchParams', () => {
	const url = new SvelteURL('https://svelte.dev?foo=bar&t=123');
	const log: any = [];

	const cleanup = effect_root(() => {
		render_effect(() => {
			log.push('search: ' + url.search);
		});
		render_effect(() => {
			log.push('foo: ' + url.searchParams.get('foo'));
		});
		render_effect(() => {
			log.push('q: ' + url.searchParams.has('q'));
		});
	});

	flushSync(() => {
		url.search = '?q=kit&foo=baz';
	});

	flushSync(() => {
		url.searchParams.append('foo', 'qux');
	});

	flushSync(() => {
		url.searchParams.delete('foo');
	});

	assert.deepEqual(log, [
		'search: ?foo=bar&t=123',
		'foo: bar',
		'q: false',
		'search: ?q=kit&foo=baz',
		'foo: baz',
		'q: true',
		'search: ?q=kit&foo=baz&foo=qux',
		'foo: baz',
		'q: true',
		'search: ?q=kit',
		'foo: null',
		'q: true'
	]);

	cleanup();
});

test('SvelteURL instanceof URL', () => {
	assert.ok(new SvelteURL('https://svelte.dev') instanceof URL);
});
````

## File: packages/svelte/src/reactivity/utils.js
````javascript
/** @import { Source } from '#client' */
import { set } from '../internal/client/reactivity/sources.js';

/** @param {Source<number>} source */
export function increment(source) {
	set(source, source.v + 1);
}
````
