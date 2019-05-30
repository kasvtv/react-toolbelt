import createPromiseFunction from '../../utils/createPromiseFunction';

describe('GIVEN createPromiseFunction', () => {
	describe('WHEN passed async function x', () => {
		it("THEN returned function returns x's result, a promise, which props are preserved", () => {
			const promProp = Symbol('promProp');
			const mockFn = jest.fn(a => {
				const prom = Promise.resolve({ a });
				prom.prop = promProp;
				return prom;
			});
			const promFn = createPromiseFunction(mockFn, {});

			expect(promFn()).toHaveProperty('prop', promProp);
		});

		describe('AND options: { }', () => {
			describe('AND x will resolve', () => {
				it('THEN returned function passes its args to x AND resolve to result', async () => {
					const mockResult = Symbol('mockResult');
					const mockFn = jest.fn(a => Promise.resolve({ a }));
					const promFn = createPromiseFunction(mockFn, {});

					expect(await promFn(mockResult)).toStrictEqual({ a: mockResult });
				});
			});

			describe('AND x will reject', () => {
				it('THEN returned function passes its args to x AND reject to result', async () => {
					const mockResult = Symbol('mockResult');
					const mockFn = jest.fn(a => Promise.reject({ a }));
					const promFn = createPromiseFunction(mockFn, {});

					const result = await promFn(mockResult)
						.then(() => { throw 'should not resolve'; })
						.catch(x => x);
					expect(result).toStrictEqual({ a: mockResult });
				});
			});
		});

		describe('AND options { getData: y }', () => {
			describe('AND x will resolve', () => {
				it('THEN returned function passes its args to x AND resolve to y(result)', async () => {
					const mockResult = Symbol('mockResult');
					const mockFn = jest.fn(a => Promise.resolve({ a }));
					const promFn = createPromiseFunction(mockFn, { getData: d => ({ d }) });

					expect(await promFn(mockResult)).toStrictEqual({ d: { a: mockResult } });
				});
			});
		});

		describe('AND options { getError: y }', () => {
			describe('AND x will reject', () => {
				it('THEN returned function passes its args to x AND reject to y(result)', async () => {
					const mockResult = Symbol('mockResult');
					const mockFn = jest.fn(a => Promise.reject({ a }));
					const promFn = createPromiseFunction(mockFn, { getError: e => ({ e }) });

					const result = await promFn(mockResult)
						.then(() => { throw 'should not resolve'; })
						.catch(x => x);
					expect(result).toStrictEqual({ e: { a: mockResult } });
				});
			});
		});

		describe('AND options { shouldThrow: y }', () => {
			describe('AND x will resolve to z AND y(z) is true', () => {
				it('THEN rejects instead', async () => {
					const mockFn = jest.fn(x => Promise.resolve(x));
					const promFn = createPromiseFunction(mockFn, { shouldThrow: d => d === 0 });

					expect(await promFn(0).catch(x => x)).toBe(0);
				});
			});
			describe('AND x will resolve to z AND y(z) is false', () => {
				it('THEN resolves normally', async () => {
					const mockFn = jest.fn(x => Promise.resolve(x));
					const promFn = createPromiseFunction(mockFn, { shouldThrow: d => d === 0 });

					expect(await promFn(1)).toBe(1);
				});
			});
		});

		describe('AND options { memoize: y, ... }', () => {
			describe('THEN function is set to options.memoize(x, options) AND '
				+ 'returned function passes its args to xx AND return its result', () => {
				it('- all of the above', async () => {
					const mockResult = Symbol('mockResult');
					const mockFn = jest.fn(a => Promise.resolve({ a }));
					const options = {
						memoizeFn: jest.fn(fn => () => fn(mockResult)),
					};
					const promFn = createPromiseFunction(mockFn, options);

					expect(await promFn()).toStrictEqual({ a: mockResult });
				});

				it('- passes options with {weak: false} as a default', () => {
					const options = {
						memoizeFn: jest.fn(),
						otherOption: Symbol('otherOption'),
					};

					createPromiseFunction(() => {}, options);
					createPromiseFunction(() => {}, { ...options, weak: true });

					expect(options.memoizeFn.mock.calls[0][1])
						.toStrictEqual({ ...options, weak: false });
					expect(options.memoizeFn.mock.calls[1][1])
						.toStrictEqual({ ...options, weak: true });
				});
			});
		});
	});

	describe('WHEN passed array of async functions x', () => {

		describe('AND options: { }', () => {
			describe("AND all of x's functions will resolve", () => {

				it('THEN returned function runs all of x AND resolve to their respective results', async () => {
					const mockFn = [0, 1, 2].map((e, i) => jest.fn(() => Promise.resolve({ i })));
					const promFn = createPromiseFunction(mockFn, {});

					const result = await promFn();

					result.forEach((e, i) => {
						expect(e).toStrictEqual({ i });
					});
				});

				it('THEN returned function passes its respective args to all of x AND resolve to their respective result', async () => {
					const mockResult = Symbol('mockResult');
					const mockFn = [0, 1, 2].map((e, i) => jest.fn(x => Promise.resolve({ [i]: x })));
					const promFn = createPromiseFunction(mockFn, {});

					const args = [
						[mockResult, 0],
						[mockResult, 1],
						[mockResult, 2],
					];
					const result = await promFn(args);

					result.forEach((e, i) => {
						expect(mockFn[i]).toHaveBeenCalledWith(...args[i]);
						expect(e).toStrictEqual({ [i]: mockResult });
					});
				});

			});

			describe("AND any of of x's functions will reject", () => {

				it('THEN returned function rejects with the promise that rejected first', async () => {
					const mockFn = [0, 1, 2].fill().map(
						(e, i) => jest.fn(() => Promise[i === 1 ? 'reject' : 'resolve']({ i }))
					);
					const promFn = createPromiseFunction(mockFn, {});

					const result = await promFn()
						.then(() => { throw 'should not resolve'; })
						.catch(x => x);

					expect(result).toStrictEqual({ i: 1 });
				});

			});
		});

		describe('AND options { getData: y }', () => {
			describe("AND all of x's functions will resolve", () => {

				it('THEN returned function passes its args to x AND resolve to y(result)', async () => {
					const mockFn = [0, 1, 2].map((e, i) => jest.fn(() => Promise.resolve(i)));
					const promFn = createPromiseFunction(mockFn, { getData: d => ({ d }) });

					(await promFn()).forEach((e, i) => {
						expect(e).toStrictEqual({ d: i });
					});
				});

			});
		});

		describe('AND options { getError: y }', () => {
			describe("AND any of x's functions will reject", () => {

				it('THEN returned function passes its args to x AND reject to y(result)', async () => {
					const mockResult = Symbol('mockResult');
					const mockFn = [0, 1, 2].map((e, i) => jest.fn(() => Promise.reject(i)));
					const promFn = createPromiseFunction(mockFn, { getError: e => ({ e }) });

					const result = await promFn(mockResult)
						.then(() => { throw 'should not resolve'; })
						.catch(x => x);
					expect(result).toStrictEqual({ e: 0 });
				});

			});
		});

		describe('AND options { shouldThrow: y }', () => {
			describe("AND all of x's functions will resolve to z AND y(z) is true", () => {
				it('THEN rejects instead', async () => {
					const mockFn = [0, 1, 2].map((e, i) => jest.fn(() => Promise.resolve(i)));
					const promFn = createPromiseFunction(mockFn, { shouldThrow: d => d === 1 });

					const result = await promFn()
						.then(() => { throw 'should not resolve'; })
						.catch(x => x);
					expect(result).toBe(1);
				});
			});

			describe("AND all of x's functions will resolve to z AND y(z) is false", () => {
				it('THEN resolves normally', async () => {
					const mockFn = [0, 1, 2].map((e, i) => jest.fn(() => Promise.resolve(i)));
					const promFn = createPromiseFunction(mockFn, { shouldThrow: d => d === 3 });

					(await promFn()).forEach((e, i) => {
						expect(e).toBe(i);
					});
				});
			});
		});

		describe('AND options { memoize: y, ... }', () => {
			it('THEN each function of x is set to options.memoize(function, options) AND '
				+ 'returned function passes its args to all of x AND return its result', async () => {
				const mockResult = Symbol('mockResult');
				const mockFn = [0, 1, 2].map(() => jest.fn(a => Promise.resolve({ a })));
				const options = {
					memoizeFn: jest.fn(fn => () => fn(mockResult)),
				};
				const promFn = createPromiseFunction(mockFn, options);

				(await promFn()).forEach(e => {
					expect(e).toStrictEqual({ a: mockResult });
				});
			});

		});

	});

	describe('WHEN passed an object of async functions x', () => {

		describe('AND options: { }', () => {
			describe("AND all of x's functions will resolve", () => {
				it('THEN returned function runs all of x AND resolve to their respective results', async () => {
					const mockFn = {};

					['a', 'b', 'c'].forEach(
						i => { mockFn[i] = jest.fn(() => Promise.resolve({ i })); }
					);
					const promFn = createPromiseFunction(mockFn, {});

					const result = await promFn();

					Object.entries(result).forEach(([i, e]) => {
						expect(e).toStrictEqual({ i });
					});
				});

				it('THEN returned function passes its args to all of x (by key) AND resolve to their respective result', async () => {
					const mockResult = Symbol('mockResult');
					const mockFn = {};
					['a', 'b', 'c'].forEach(
						i => { mockFn[i] = jest.fn(j => Promise.resolve({ j })); }
					);

					const promFn = createPromiseFunction(mockFn, {});

					const args = {
						a: [mockResult, 0],
						b: [mockResult, 1],
						c: [mockResult, 2],
					};

					const result = await promFn(args);

					Object.entries(result).forEach(([j, e]) => {
						expect(mockFn[j]).toHaveBeenCalledWith(...args[j]);
						expect(e).toStrictEqual({ j: mockResult });
					});
				});
			});

			describe("AND any of x's functions will reject", () => {
				it('THEN returned function rejects with promise that rejected first', async () => {
					const mockFn = {};
					['a', 'b', 'c'].forEach(
						i => { mockFn[i] = jest.fn(() => Promise[i === 'b' ? 'reject' : 'resolve']({ i })); }
					);
					const promFn = createPromiseFunction(mockFn, {});

					let result;
					try {
						await promFn();
					} catch (e) {
						result = e;
					}

					expect(result).toStrictEqual({ i: 'b' });
				});
			});
		});

		describe('AND options { getData: y }', () => {
			describe("AND all of x's functions will resolve", () => {

				it('THEN returned function passes its args to x AND resolve to y(result)', async () => {
					const mockFn = {};
					['a', 'b', 'c'].forEach(
						i => { mockFn[i] = jest.fn(() => Promise.resolve({ i })); }
					);

					const promFn = createPromiseFunction(mockFn, { getData: d => ({ d }) });

					Object.entries(await promFn()).forEach(([i, e ]) => {
						expect(e).toStrictEqual({ d: { i } });
					});
				});

			});
		});

		describe('AND options { getError: y }', () => {
			describe("AND any of x's functions will reject", () => {

				it('THEN returned function passes its args to x AND reject to y(result)', async () => {
					const mockFn = {};
					['a', 'b', 'c'].forEach(
						i => { mockFn[i] = jest.fn(() => Promise.reject({ i })); }
					);

					const promFn = createPromiseFunction(mockFn, { getError: e => ({ e }) });

					const result = await promFn().catch(x => x);
					expect(result).toStrictEqual({ e: { i: 'a' } });
				});

			});
		});

		describe('AND options { shouldThrow: y }', () => {

			describe("AND all of x's functions will resolve to z AND y(z) is true", () => {
				it('THEN rejects instead', async () => {
					const mockFn = {};
					['a', 'b', 'c'].forEach(
						i => { mockFn[i] = jest.fn(() => Promise.resolve(i)); }
					);

					const promFn = createPromiseFunction(mockFn, { shouldThrow: d => d === 'a' });

					const result = await promFn()
						.catch(x => x);

					expect(result).toStrictEqual('a');
				});
			});

			describe("AND all of x's functions will resolve to z AND y(z) is false", () => {
				it('THEN resolves normally', async () => {
					const mockFn = {};
					['a', 'b', 'c'].forEach(
						i => { mockFn[i] = jest.fn(() => Promise.resolve(i)); }
					);

					const promFn = createPromiseFunction(mockFn, { shouldThrow: d => d === 'd' });

					const result = await promFn();

					expect(result).toStrictEqual({
						a: 'a',
						b: 'b',
						c: 'c',
					});
				});
			});

		});

		describe('AND options { memoize: y, ... }', () => {
			it('THEN each function of x is set to options.memoize(function, options) AND '
				+ 'returned function passes its args to xx AND return its result', async () => {
				const mockResult = Symbol('mockResult');
				const mockFn = {};
				['a', 'b', 'c'].forEach(
					i => { mockFn[i] = jest.fn(x => Promise.resolve(x)); }
				);
				const options = {
					memoizeFn: jest.fn(fn => () => fn(mockResult)),
				};
				const promFn = createPromiseFunction(mockFn, options);

				Object.values(await promFn()).forEach(e => {
					expect(e).toStrictEqual(mockResult);
				});
			});

		});

	});

});