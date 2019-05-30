import bindPromiseFunctionToState from '../../utils/bindPromiseFunctionToState';

const createPromiseMock = (resolve, ms, val) => (
	new Promise((res, rej) => {
		const finish = () => resolve ? res(val) : rej(val);
		if (ms < 0) {
			finish();
		} else if (ms !== Infinity) {
			setTimeout(
				finish,
				ms
			);
		}
	})
);

const delay = async (ms = 0) => {
	do {
		await new Promise(r => setTimeout(r, 1));
	} while (ms--);
};
const resolveValue = Symbol('resolvedValue');
const rejectValue = Symbol('rejectValue');

describe('GIVEN an async function bound to a setState function '
	+ 'by bindPromiseFunctionToState', () => {

	const createBoundFunctionMock = (...args) => {
		const setState = jest.fn();
		const boundFn = bindPromiseFunctionToState(
			() => createPromiseMock(...args),
			setState
		);
		return { setState, boundFn };
	};


	describe('WHEN bound function is fired', () => {

		it('THEN at first setState is not called', () => {
			const { setState, boundFn } = createBoundFunctionMock(true);
			boundFn();
			expect(setState).toHaveBeenCalledTimes(0);
		});

		describe('AND bound function resolves after a while', () => {
			it('THEN on the next call stack, setState is called with: '
				+ '{loading: true, data: null, error: null}', async () => {

				const { setState, boundFn } = createBoundFunctionMock(true, Infinity, resolveValue);
				boundFn();
				await delay(5);

				expect(setState).toHaveBeenCalledTimes(1);
				expect(setState).toHaveBeenNthCalledWith(1, {
					loading: true,
					data: null,
					error: null,
				});

			});

			it('THEN on resolve, setState is called with: '
				+ '{loading: false, data: resolveValue, error: null}', async () => {

				const { setState, boundFn } = createBoundFunctionMock(true, 0, resolveValue);
				await boundFn();
				await delay(5);

				expect(setState).toHaveBeenCalledTimes(2);
				expect(setState).toHaveBeenNthCalledWith(2, {
					loading: false,
					data: resolveValue,
					error: null,
				});

			});
		});

		describe('AND bound function resolves immediately', () => {
			it('THEN on resolve, setState is called with: '
				+ '{loading: false, data: resolveValue, error: null}', async () => {

				const { setState, boundFn } = createBoundFunctionMock(true, -1, resolveValue);
				await boundFn();
				await delay(5);

				expect(setState).toHaveBeenCalledTimes(1);
				expect(setState).toHaveBeenNthCalledWith(1, {
					loading: false,
					data: resolveValue,
					error: null,
				});

			});
		});

		describe('WHEN bound function rejects after a while', () => {
			it('THEN on the next call stack, setState is called with: '
				+ '{loading: true, data: null, error: null}', async () => {

				const { setState, boundFn } = createBoundFunctionMock(false, Infinity, rejectValue);
				boundFn();
				await delay(5);

				expect(setState).toHaveBeenCalledTimes(1);
				expect(setState).toHaveBeenNthCalledWith(1, {
					loading: true,
					data: null,
					error: null,
				});

			});

			it('THEN on reject, setState is called with: '
				+ '{loading: false, data: null, error: rejectValue}', async () => {

				const { setState, boundFn } = createBoundFunctionMock(false, 0, rejectValue);
				const prom = boundFn();

				await prom.catch(x => x);
				await delay(5);

				expect(setState).toHaveBeenCalledTimes(2);
				expect(setState).toHaveBeenNthCalledWith(2, {
					loading: false,
					data: null,
					error: rejectValue,
				});

			});
		});

		describe('AND bound function rejects immediately', () => {
			it('THEN on reject, setState is called with: '
				+ '{loading: false, data: rejectValue, error: null}', async () => {

				const { setState, boundFn } = createBoundFunctionMock(false, -1, rejectValue);
				const prom = boundFn();

				await prom.catch(x => x);
				await delay(5);

				expect(setState).toHaveBeenCalledTimes(1);
				expect(setState).toHaveBeenNthCalledWith(1, {
					loading: false,
					data: null,
					error: rejectValue,
				});

			});
		});

	});
});