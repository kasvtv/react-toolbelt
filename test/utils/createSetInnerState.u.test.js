import createSetInnerState from '../../utils/createSetInnerState';

describe('GIVEN createSetInnerState', () => {
	describe('WHEN called with a falsy argument', () => {
		it('THEN returns (objX) => this.setState(objX)', () => {
			const fn = createSetInnerState();
			const setState = jest.fn();
			const newState = Symbol('newState');
			fn.call({ setState }, newState);

			expect(setState).toHaveBeenCalledTimes(1);
			expect(setState).toHaveBeenCalledWith(newState);
		});
	});

	describe('WHEN called with a string s', () => {
		it('THEN returns (objX) => this.setState((objY) => {...objY.s, ...objX})', () => {
			const fn = createSetInnerState('new');
			const setState = jest.fn();
			const prevState = {
				new: {
					existing: Symbol('prevState.new.existing'),
				},
			};
			const newStateItem = { new: Symbol('newStateItem') };

			fn.call({ setState }, newStateItem);

			const newStateFn = setState.mock.calls[0][0];
			const newState = newStateFn(prevState);

			expect(newState.new).toHaveProperty('existing', prevState.new.existing);
			expect(newState.new).toHaveProperty('new', newStateItem.new);
		});
	});
});