import index from '..';

import createFormHandler from '../createFormHandler';
import createMemoizedPromiseHandler from '../createMemoizedPromiseHandler';
import createPromiseHandler from '../createPromiseHandler';
import createUncontrolledFormHandler from '../createUncontrolledFormHandler';
import useForm from '../useForm';
import useMemoizedPromise from '../useMemoizedPromise';
import usePromise from '../usePromise';
import useUncontrolledForm from '../useUncontrolledForm';


test('bundles all scoped imports into an object correctly', () => {
	expect(index.createFormHandler).toBe(createFormHandler);
	expect(index.createMemoizedPromiseHandler).toBe(createMemoizedPromiseHandler);
	expect(index.createPromiseHandler).toBe(createPromiseHandler);
	expect(index.createUncontrolledFormHandler).toBe(createUncontrolledFormHandler);
	expect(index.useForm).toBe(useForm);
	expect(index.useMemoizedPromise).toBe(useMemoizedPromise);
	expect(index.usePromise).toBe(usePromise);
	expect(index.useUncontrolledForm).toBe(useUncontrolledForm);
});