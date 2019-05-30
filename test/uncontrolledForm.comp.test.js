import { shallow } from 'enzyme';

import React from 'react';
import createUncontrolledFormHandler from '../createUncontrolledFormHandler';
import useUncontrolledForm from '../useUncontrolledForm';

class UncontrolledFormClass extends React.Component {
	form = { firstName: '', remember: false }

	onChange = createUncontrolledFormHandler('form').bind(this)

	render() {
		const form = this.form;
		this.props.getForm(() => form);

		return (
			<form>
				<input name='firstName' value={form.firstName} type='text' onChange={this.onChange} />
				<input name='remember' value={form.remember} type='checkbox' onChange={this.onChange} />
			</form>
		);
	}
}

function UncontrolledFormHook({ getForm }) {
	const [form, setForm] = useUncontrolledForm({ firstName: '', remember: false });
	getForm(() => form);

	return (
		<form>
			<input name='firstName' defaultValue={form.firstName} type='text' onChange={setForm} />
			<input name='remember' defaultValue={form.remember} type='checkbox' onChange={setForm} />
		</form>
	);
}

function testUncontrolledFormComponent(Component) {
	describe(`GIVEN ${Component.name} and an uncontrolled form handler`, () => {
		describe('WHEN input[name][type=checkbox] changes', () => {
			it("THEN form[name] is set to whether it's checked", () => {
				let getForm;
				const wrap = shallow(<Component getForm={f => { getForm = f; }} />);
				const checkbox = wrap.find('input[name="remember"]');

				checkbox.simulate('change', {
					target: {
						...checkbox.getElement().props,
						checked: true,
					},
				});

				expect(getForm()).toHaveProperty('remember', true);
			});
		});

		describe('WHEN input[name][type=text] changes', () => {
			it('THEN form[name] is set to its value', () => {
				let getForm;
				const wrap = shallow(<Component getForm={f => { getForm = f; }} />);
				const checkbox = wrap.find('input[name="firstName"]');
				const value = 'John Doe';

				checkbox.simulate('change', {
					target: {
						...checkbox.getElement().props,
						value,
					},
				});

				expect(getForm()).toHaveProperty('firstName', value);
			});
		});
	});
}

testUncontrolledFormComponent(UncontrolledFormClass);
testUncontrolledFormComponent(UncontrolledFormHook);