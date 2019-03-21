# react-toolbelt
[![npm version](https://img.shields.io/npm/v/react-toolbelt.svg)](https://www.npmjs.com/package/react-toolbelt)

> A simple functional library to simplify and unify commonly used React component functionality

## Installation

```bash
npm install react-toolbelt
```

## Hooks API

### function useForm(initialState) -> [form, setForm]

Register a hook for keeping track of a form's state. The `name` property of any element `setForm` is passed to determines its key in the `form` variable.

Similar to React's builtin `useState` hook, except that `setForm` expects a React event and therefore should be passed as the `onChange` prop to any form fields.

This would be the preferred function to use for forms for most people.



#### arguments
- **initialState** *(Object) (optional)*: The form's initial state

#### returns
- *(Array)*:
  - **form** *(Object)*: The form's current state.
  - **setForm** *(function)*: The form's change handler, to be passed to any form fields.

#### example
```js
import React from 'react';
import useForm from 'react-toolbelt/useForm';

function MyFormComponent() {
    const [form, setForm] = useForm({firstName: '', lastName: '', remember: false});

    console.log(form);

    return <form onSubmit={
        e => {
            e.preventDefault();
            alert(JSON.stringify(form, null, 4));
        }
    }>
        <input name='firstName' value={form.firstName} type='text' onChange={setForm} />
        <input name='lastName' value={form.lastName} type='text' onChange={setForm} />
        <input name='remember' value={form.remember} type='checkbox' onChange={setForm} />
        <button type='submit'>Submit</button>
    </form>;
}
```

### function useUncontrolledForm([initialState]) -> [form, setForm]

Register a hook for keeping track of an uncontrolled form. The `name` property of any element `setForm` is passed to determines its key in the `form` variable. It differs from `useForm` in that it does not call a re-render when an input changes.

Please note that when assigning any indexed value of `form` to a variable in your component's render function, that variable will (contrary to using `form` directly) NOT necessarily hold the latest variable when it is used later, because uncontrolled forms don't cause a rerender on an input change.

#### arguments
- **initialState** *(Object) (optional)*: The form's initial state

#### returns
- *(Array)*:
  - **form** *(Object)*: The form's current state.
  - **setForm** *(function)*: The form's change handler, to be passed to any form fields.

#### example
```js
import React from 'react';
import useUncontrolledForm from 'react-toolbelt/useUncontrolledForm';

function MyFormComponent() {
    const [form, setForm] = useUncontrolledForm({firstName: '', lastName: '', remember: false});

    console.log(form);

    return <form onSubmit={
        e => {
            e.preventDefault();
            alert(JSON.stringify(form, null, 4));
        }
    }>
        <input name='firstName' defaultValue={form.firstName} type='text' onChange={setForm} />
        <input name='lastName' defaultValue={form.lastName} type='text' onChange={setForm} />
        <input name='remember' defaultValue={form.remember} type='checkbox' onChange={setForm} />
        <button type='submit'>Submit</button>
    </form>;
}
```

### function usePromise(promiseFn, options) -> [{loading, data, error}, requestFn]

Register a hook for loading a function returning a `Promise` its return value into a component's state. Re-renders the component when the function is called and when the resulting `Promise` either resolves or rejects.

Automatically prevents common asynchronicity issues by not rerendering the component if the `Promise` resolves when `requestFn` has already been called again. Also will skip immediately to setting `data` (instead of first setting `loading` to true) when `requestFn` immediately resolves.

#### arguments
- **promiseFn** *(function)*, *(Array)* or *(Object)*: A function that returns a promise or a collection of them.
- **options** *(Object) (optional)*:
  - **getData** *(function(response) -> parsedResponse)*: Transforms any resolved value before resolving. Useful when you're only interested in a part of the resolved value's.
  - **getError** *(function(error) -> parsedError) (optional)*: Transforms any rejected value before rejecting.
  - **shouldThrow** *(function(response) -> isError) (optional)*: Triggers a rejection of any `Promise` that would otherwise resolve, based on its response. Useful for when you want your function to 

#### returns
- *(Array)*:
  - **state** *(Object)*:
    - **loading** *(boolean)*: True if the latest function call's resulting `Promise` is being awaited/pending.
    - **data** *(any)*: Holds the the latest function call's resolved value, set to `null` initially, in case of an error or in case `requestFn` is called again.
    - **error** *(any)*: Holds the the latest function call's rejected value, in case it rejected. Set to `null` initially, in case of success or in case `requestFn` is called again.
  - **requestFn** *(function)*: Calls `promiseFn`. In case `promiseFn` is was an `Array`, parameters will be applied in order. In case `promiseFn` is was an `Object`, values of the object will be applied based on their keys.

#### example
```js
import React, {useRef} from 'react';
import usePromise from 'react-toolbelt/usePromise';
import axios from 'axios';

function MyPromiseComponent() {
    const [requestState, fireRequest] = usePromise(status => axios.get(`https://httpstat.us/${status}`));
    const ref = useRef();

    console.log(requestState);

    return <div>

        <input type='text' ref={ref} placeholder='status' defaultValue='200'/>

        <button type='button' onClick={() => fireRequest(ref.current.value)}>Go!</button>

        <pre>{JSON.stringify(requestState, null, 4)}</pre>

    </div>;
}
```

### function useMemoizedPromise(promiseFn, options) -> [{loading, data, error}, requestFn]

Same as `usePromise`, but memoizes the result. Will not memoize any results of rejected `Promise`'s. Uses reference equality for non-primitive values.

Automatically prevents common asynchronicity issues by not refiring `promiseFn` when it is refired with the same arguments before the previous call returned.

#### arguments
- ...
- **options** *(Object) (optional)*:
  - ...
  - **once** *(boolean) (optional)*: Only cache the latest result
  - **weak** *(boolean) (optional)*: Use a WeakMap when possible, prevents memory leaks, but allows any cached result to get garbage collected when there are no more references to its arguments.

#### example
```js
import React, {useRef} from 'react';
import useMemoizedPromise from 'react-toolbelt/useMemoizedPromise';
import axios from 'axios';

function MyPromiseComponent() {
    const [requestState, fireRequest] = useMemoizedPromise(status => axios.get(`https://httpstat.us/${status}`));
    const ref = useRef();

    console.log(requestState);

    return <div>

        <input type='text' ref={ref} placeholder='status' defaultValue='200'/>

        <button type='button' onClick={() => fireRequest(ref.current.value)}>Go!</button>

        <pre>{JSON.stringify(requestState, null, 4)}</pre>
        
    </div>;
}
```

## Class API

### function createFormHandler(parentProp) -> onChange

Create a class function for keeping track of a form's state. The `name` property of any element `onChange` is passed to determines its key in the component's state.

Optionally a `parentProp` can be passed to store the form values under a specific key in the component's state.

This would be the preferred function to use for forms for most people.

#### arguments
- **parentProp** *(string) (optional)*: If set, values will be put under `this.state[parentProp][fieldName]`. If unset values will be put under `this.state[fieldName]`.

#### returns
- **onChange** *(function)*: A function to be passed to the `onChange` property of form elements.

#### example
```js
import React from 'react';
import createFormHandler from 'react-toolbelt/createFormHandler';

class MyFormComponent extends React.Component {
    state = {
        form: {firstName: '', lastName: '', remember: false}
    }

    onChange = createFormHandler('form').bind(this)

    render() {
        const form = this.state.form;

        console.log(form);

        return <form onSubmit={
            e => {
                e.preventDefault();
                alert(JSON.stringify(this.state.form, null, 4));
            }
        }>
            <input name='firstName' value={form.firstName} type='text' onChange={this.onChange} />
            <input name='lastName' value={form.lastName} type='text' onChange={this.onChange} />
            <input name='remember' value={form.remember} type='checkbox' onChange={this.onChange} />
            <button type='submit'>Submit</button>
        </form>;
    }
}
```
### function createUncontrolledFormHandler(parentProp) -> onChange

Create a class function for keeping track of a form's state. The `name` property of any element `onChange` is passed to determines the property under which the values will be stored on the component's instance. This method differs from `createFormHandler` in that it doesn't call `setState`, but rather stores the state of the form directly on the class instance.

Optionally a `parentProp` can be passed to store the form values under a specific property in the component's instance.

This would be the preferred function to use for form components that need to keep track of their field's values, but that shouldn't be rerendered on every change.

#### arguments
- **parentProp** *(string) (optional)*: If set, values will be put under `this[parentProp][fieldName]`. If unset values will be put under `this[fieldName]`.

#### returns
- **onChange** *(function)*: A function to be passed to the `onChange` property of form elements.

#### example
```js
import React from 'react';
import createUncontrolledFormHandler from 'react-toolbelt/createUncontrolledFormHandler';

class MyFormComponent extends React.Component {
    form = {firstName: '', lastName: '', remember: false}

    onChange = createUncontrolledFormHandler('form').bind(this)

    render() {
        const form = this.form;

        console.log(form);

        return <form onSubmit={
            e => {
                e.preventDefault();
                alert(JSON.stringify(this.form, null, 4));
            }
        }>
            <input name='firstName' defaultValue={form.firstName} type='text' onChange={this.onChange} />
            <input name='lastName' defaultValue={form.lastName} type='text' onChange={this.onChange} />
            <input name='remember' defaultValue={form.remember} type='checkbox' onChange={this.onChange} />
            <button type='submit'>Submit</button>
        </form>;
    }
}
```

### function createPromiseHandler(promiseFn, parentProp, options) -> requestFn

Creates a handler for loading a function returning a `Promise` its return value into a component's state. Re-renders the component when the function is called and when the resulting `Promise` either resolves or rejects.

Optionally a `parentProp` can be passed to store the `Promise` its value under a specific key in the component's state.

Automatically prevents common asynchronicity issues by not rerendering the component if the `Promise` resolves when `requestFn` has already been called again. Also will skip immediately to setting `data` (instead of first setting `loading` to true) when `requestFn` immediately resolves.

#### arguments
- **promiseFn** *(function)*, *(Array)* or *(Object)*: A function that returns a promise or a collection of them.
- **parentProp** *(string) (optional)*: If set, result will be put under `this.state[parentProp]`. If unset values will be put under `this.state`.
- **options** *(Object) (optional)*:
  - **getData** *(function(response) -> parsedResponse)*: Transforms any resolved value before resolving. Useful when you're only interested in a part of the resolved value's.
  - **getError** *(function(error) -> parsedError) (optional)*: Transforms any rejected value before rejecting.
  - **shouldThrow** *(function(response) -> isError) (optional)*: Triggers a rejection of any `Promise` that would otherwise resolve, based on its response. Useful for when you want your function to 

#### returns
- **requestFn** *(function)*: Calls `promiseFn`. In case `promiseFn` is was an `Array` of functions, each argument must be an array and will be applied to each function of `promiseFn` with the same index. In case `promiseFn` is was an `Object` of functions, a single values of the object will be applied based on their keys.

#### example
```js
import React from 'react';
import createPromiseHandler from 'react-toolbelt/createPromiseHandler';
import axios from 'axios';

class MyPromiseComponent extends React.Component {
    state = {
        request: {}
    }

    ref = React.createRef();

    fireRequest = createPromiseHandler(
        status => axios.get(`https://httpstat.us/${status}`),
        'request'
    ).bind(this)

    render() {
        console.log(this.state.request)

        return <div>

            <input type='text' ref={this.ref} placeholder='status' defaultValue='200'/>

            <button type='button' onClick={() => this.fireRequest(this.ref.current.value)}>Go!</button>

            <pre>{JSON.stringify(this.state.request, null, 4)}</pre>

        </div>;
    }
}
```

### function createMemoizedPromiseHandler(promiseFn, parentProp, options) -> requestFn

Same as `createPromiseHandler`, but memoizes the result. Will not memoize any results of rejected `Promise`'s. Uses reference equality for non-primitive values.

Automatically prevents common asynchronicity issues by not refiring `promiseFn` when it is refired with the same arguments before the previous call returned.

#### arguments
- ...
- **options** *(Object) (optional)*:
  - ...
  - **once** *(boolean) (optional)*: Only cache the latest result
  - **weak** *(boolean) (optional)*: Use a WeakMap when possible, prevents memory leaks, but allows any cached result to get garbage collected when there are no more references to its arguments.

#### example
```js
import React from 'react';
import createMemoizedPromiseHandler from 'react-toolbelt/createMemoizedPromiseHandler';
import axios from 'axios';

class MyPromiseComponent extends React.Component {
    state = {
        request: {}
    }

    ref = React.createRef();

    fireRequest = createMemoizedPromiseHandler(
        status => axios.get(`https://httpstat.us/${status}`),
        'request'
    ).bind(this)

    render() {
        console.log(this.state.request)

        return <div>

            <input type='text' ref={this.ref} placeholder='status' defaultValue='200'/>

            <button type='button' onClick={() => this.fireRequest(this.ref.current.value)}>Go!</button>

            <pre>{JSON.stringify(this.state.request, null, 4)}</pre>

        </div>;
    }
}
```

## Using `react-toolbelt` in ES5 applications
`react-toolbelt` uses the `Object.assign` syntax under the hood, which is part of the ES6 syntax. This means that to use `react-toolbelt` with ES5 applications, a polyfill for `Object.assign` must be included in your project.