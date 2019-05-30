import getFormValueFromTarget from '../../utils/getFormValueFromTarget';

describe('GIVEN getFormValueFromTarget', () => {
	describe('WHEN called with object X with type: "checkbox"', () => {
		it('THEN returns X.checked', () => {
			const checked = Symbol('checked');
			expect(getFormValueFromTarget({ type: 'checkbox', checked }))
				.toStrictEqual(checked);
		});
	});

	describe('WHEN called with object X with type NOT equal to "checkbox"', () => {
		it('THEN returns X.value', () => {
			const value = Symbol('value');
			expect(getFormValueFromTarget({ type: 'arbitrary', value }))
				.toStrictEqual(value);
		});
	});
});