import { shallow } from 'enzyme';

import React, { useRef } from 'react';
import createPromiseHandler from '../createPromiseHandler';
import createMemoizedPromiseHandler from '../createMemoizedPromiseHandler';
import usePromise from '../usePromise';
import useMemoizedPromise from '../useMemoizedPromise';

const delay = async (ms = 0) => {
	do {
		await new Promise(r => setTimeout(r, 1));
	} while (ms--);
};

const asyncMock = (x, ms, shouldReject, ref) => () => {
	const prom = new Promise((res, rej) => {
		const r = shouldReject ? rej : res;
		if (ms == undefined) {
			r(x);
		} else if (ms !== Infinity) {
			setTimeout(() => r(x), ms);
		}
	});

	if (ref) ref(() => prom);

	return prom;
};

/* eslint-disable react/no-this-in-sfc */
function promiseClassRender() {
	this.props.getRequestState(() => this.state.request);
	this.timesRendered++;

	return (
		<div>
			<button type='button' onClick={this.fireRequest} />
			<pre id='timesRendered'>{this.timesRendered}</pre>
		</div>
	);
}

function promiseClassConstructor(props) {
	this.timesRendered = 0;
	this.state = {
		request: {},
	};
	this.fireRequest = (this.memoize ? createMemoizedPromiseHandler : createPromiseHandler)(
		props.promFn,
		'request'
	).bind(this);
}

class PromiseClass extends React.Component {
	constructor(...args) {
		super(...args);
		promiseClassConstructor.apply(this, args);
	}

	render = promiseClassRender
}

class MemoizedPromiseClass extends React.Component {
	constructor(...args) {
		super(...args);
		this.memoize = true;
		promiseClassConstructor.apply(this, args);
	}

	render = promiseClassRender
}

function PromiseHook({ memoize, promFn, getRequestState }) {
	const timesRendered = useRef(0);
	timesRendered.current++;
	const [requestState, fireRequest] = (memoize ? useMemoizedPromise : usePromise)(promFn);
	getRequestState(() => requestState);

	return (
		<div>
			<button type='button' onClick={fireRequest} />
			<pre id='timesRendered'>{timesRendered.current}</pre>
		</div>
	);
}

// eslint-disable-next-line new-cap
const MemoizedPromiseHook = (props) => PromiseHook({ ...props, memoize: true });

function testPromiseComponent(Component, testMemoization) {
	describe(`GIVEN ${Component.name} calling createPromiseHandler, passing it an async function x and string "request"`, () => {

		describe('WHEN handler is fired AND its result resolves later', () => {
			it('THEN on a subsequent call stack, state.request is first set to {data: null, error: null, loading: true}', async () => {
				let getRequestState;
				const wrap = shallow(<Component
					promFn={asyncMock(null, Infinity)}
					getRequestState={f => { getRequestState = f; }}
				/>);

				wrap.find('button').simulate('click');
				await delay(5);
				expect(getRequestState())
					.toStrictEqual({ data: null, error: null, loading: true });
			});

			it('THEN state.request is set to {data: result, error: null, loading: false} on resolve', async () => {
				const data = 123;
				let getRequestState, getLastPromise;
				const wrap = shallow(<Component
					promFn={asyncMock(data, 1, false, p => { getLastPromise = p; })}
					getRequestState={f => { getRequestState = f; }}
				/>);

				wrap.find('button').simulate('click');
				await getLastPromise();
				await delay(5);
				expect(getRequestState())
					.toStrictEqual({ data, error: null, loading: false });
			});
		});

		describe('WHEN handler is fired AND its result resolves immediately', () => {
			it('THEN on a subsequent call stack, state.request is set to {data: result, error: null, loading: false} directly', async () => {
				const data = 123;
				let getRequestState;
				const wrap = shallow(<Component
					promFn={asyncMock(data, null)}
					getRequestState={f => { getRequestState = f; }}
				/>);

				wrap.find('button').simulate('click');
				await delay(5);
				expect(getRequestState())
					.toStrictEqual({ data, error: null, loading: false });
				expect(wrap.find('#timesRendered').text()).toBe('2');
			});
		});

		describe('WHEN handler is fired AND its result rejects later', () => {
			it('THEN state.request is set to {data: result, error: null, loading: false} on reject', async () => {
				const error = 123;
				let getRequestState, getLastPromise;
				const wrap = shallow(<Component
					promFn={asyncMock(error, 1, 1, p => { getLastPromise = p; })}
					getRequestState={f => { getRequestState = f; }}
				/>);

				wrap.find('button').simulate('click');

				await getLastPromise().catch(x => x);
				await delay(5);
				expect(getRequestState()).toStrictEqual({ data: null, error, loading: false });
			});
		});

		describe('WHEN handler is fired AND its result rejects immediately', () => {
			it('THEN on a subsequent call stack, state.request is set to {data: null, error: result, loading: false} directly', async () => {
				const error = 123;
				let getRequestState, getLastPromise;
				const wrap = shallow(<Component
					promFn={asyncMock(error, null, 1, p => { getLastPromise = p; })}
					getRequestState={f => { getRequestState = f; }}
				/>);

				wrap.find('button').simulate('click');
				await delay(5);
				expect(getRequestState())
					.toStrictEqual({ data: null, error, loading: false });
				expect(wrap.find('#timesRendered').text()).toBe('2');
				await getLastPromise().catch(x => x);
			});
		});

		if (testMemoization) {
			describe('WHEN handler is fired multiple times with the same args, resolving in between', () => {
				it('THEN on subsequent calls resolves immediately', async () => {
					const data = 123;
					let getRequestState, getLastPromise;
					const wrap = shallow(<Component
						promFn={asyncMock(data, 10, 0, p => { getLastPromise = p; })}
						getRequestState={f => { getRequestState = f; }}
					/>);

					wrap.find('button').simulate('click');
					await getLastPromise();
					await delay(5);
					expect(wrap.find('#timesRendered').text()).toBe('3');
					expect(getRequestState()).toStrictEqual({ data, error: null, loading: false });

					wrap.find('button').simulate('click');
					await getLastPromise();
					await delay(5);
					expect(wrap.find('#timesRendered').text()).toBe('4');
					expect(getRequestState()).toStrictEqual({ data, error: null, loading: false });
				});
			});

			describe('WHEN handler is fired multiple times with the same args, rejecting in between', () => {
				it('THEN on subsequent calls, calls the function and sets to loading again', async () => {
					const error = 123;
					let getRequestState, getLastPromise;
					const wrap = shallow(<Component
						promFn={asyncMock(error, 10, 1, p => { getLastPromise = p; })}
						getRequestState={f => { getRequestState = f; }}
					/>);

					wrap.find('button').simulate('click');
					await getLastPromise().catch(x => x);
					await delay(5);
					expect(wrap.find('#timesRendered').text()).toBe('3');
					expect(getRequestState()).toStrictEqual({ data: null, error, loading: false });

					wrap.find('button').simulate('click');
					await getLastPromise().catch(x => x);
					await delay(5);
					expect(wrap.find('#timesRendered').text()).toBe('5');
					expect(getRequestState()).toStrictEqual({ data: null, error, loading: false });
				});
			});
		}
	});
}

testPromiseComponent(PromiseClass);
testPromiseComponent(MemoizedPromiseClass, true);
testPromiseComponent(PromiseHook);
testPromiseComponent(MemoizedPromiseHook, true);