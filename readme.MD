[![NPM version](https://img.shields.io/npm/v/react-toolbelt.svg?style=flat)](https://www.npmjs.org/package/react-toolbelt)
[![Size](https://badgen.net/bundlephobia/minzip/react-toolbelt)](https://bundlephobia.com/result?p=react-toolbelt)
[![Build Status](https://travis-ci.com/kasvtv/react-toolbelt.svg?branch=master)](https://travis-ci.com/kasvtv/react-toolbelt)
[![Coverage Status](https://coveralls.io/repos/github/kasvtv/react-toolbelt/badge.svg?branch=master)](https://coveralls.io/github/kasvtv/react-toolbelt?branch=master)
[![Dependency Status](https://david-dm.org/kasvtv/react-toolbelt.svg)](https://david-dm.org/kasvtv/react-toolbelt)
[![Known Vulnerabilities](https://snyk.io/test/github/kasvtv/react-toolbelt/badge.svg?targetFile=package.json)](https://snyk.io/test/github/kasvtv/react-toolbelt?targetFile=package.json)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

# react-toolbelt
Don't reimplement forms and asynchronous data loading over and over in all your React components! This small library allows you to:
- Define a single handler for an entire form in one simple call (controlled or uncontrolled)
- Define an async data loader in one simple call, automatically preventing race conditions, with optional memoization

*...for both classes and hooks!*

## Installation

```bash
npm install react-toolbelt
```
## Scoped imports

The source code of this package splitted into separate imports, such that only the necessary functionality will be included in your bundle. Maybe you don't need memoization, you never use uncontrolled forms or prefer hooks over classes (or vice versa). In that case that code won't end up in your bundle.

You *can* import the entire library from `react-toolbelt`, but there is no reason not to use scoped imports, as is done in the examples.

## Hooks API

### function useForm(initialState) -> [form, setForm]

Register a hook for keeping track of a form's state. The `name` property of any element `setForm` is passed to determines its key in the `form` variable.

Similar to React's builtin `useState` hook, except that `setForm` expects a React event and therefore should be passed as the `onChange` prop to any form fields.

This would be the preferred form hook for most use cases.

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

This would be the preferred form hook for components that need to keep track of their field's values, but that shouldn't be rerendered on every change.

*Note: If you pass anything but the entire `form` object to a function, such as `form.firstName`, the latest value of the form won't be reflected.*

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

### function usePromise(fn, options) -> [{loading, data, error}, requestFn]

Register a hook for loading a function returning a `Promise` its return value into a component's state. Re-renders the component when the function is called and when the resulting `Promise` either resolves or rejects.

Automatically prevents race conditions when subsequent calls don't arrive in order. Also sets `state` straight to the result when a memoized result is used, without setting to `loading` in between.

#### arguments
- **fn** *(function)*, *(Array)* or *(Object)*: An async function or an array/object of them.
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
  - **requestFn** *(function)*: Calls `fn`. In case `fn` is was an `Array`, parameters will be applied in order. In case `fn` is was an `Object`, values of the object will be applied based on their keys.

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

### function useMemoizedPromise(fn, options) -> [{loading, data, error}, requestFn]

Same as `usePromise`, but memoizes the result. Will not memoize any results of rejected `Promise`'s. Uses reference equality for non-primitive values.

Sets `state` straight to the result when a memoized result is used, without setting to `loading` in between.

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

### function createFormHandler(stateProp) -> onChange

Create a class function for keeping track of a form's state. The `name` property of any element `onChange` is passed to determines its key in the component's state.

Optionally a `stateProp` can be passed to store the form values under a specific key in the component's state.

This would be the preferred function to use for class forms for most use cases.

#### arguments
- **stateProp** *(string) (optional)*: If set, values will be put under `this.state[stateProp][fieldName]`. If unset values will be put under `this.state[fieldName]`.

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
### function createUncontrolledFormHandler(stateProp) -> onChange

Create a class function for keeping track of a form's state. The `name` property of any element `onChange` is passed to determines the property under which the values will be stored on the component's instance. This method differs from `createFormHandler` in that it doesn't call `setState`, but stores the form state on the component's instance.

Optionally a `stateProp` can be passed to store the form values under a specific property in the component's instance.

This would be the preferred function to use for form components that need to keep track of their field's values, but that shouldn't be rerendered on every change.

#### arguments
- **stateProp** *(string) (optional)*: If set, values will be put under `this[stateProp][fieldName]`. If unset values will be put under `this[fieldName]`.

#### returns
- **onChange** *(function)*: A function to be passed to the `onChange` property of form elements.

#### example
```js
import React from 'react';
import createUncontrolledFormHandler from 'react-toolbelt/createUncontrolledFormHandler';

class MyUncontrolledFormComponent extends React.Component {
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

### function createPromiseHandler(fn, stateProp, options) -> requestFn

Creates a handler for loading a function returning a `Promise` its return value into a component's state. Re-renders the component when the function is called and when the resulting `Promise` either resolves or rejects.

Optionally a `stateProp` can be passed to store the `Promise` its value under a specific key in the component's state.

Automatically prevents race conditions when subsequent calls don't arrive in order. Also sets `state` straight to the result when a memoized result is used, without setting to `loading` in between.


#### arguments
- **fn** *(function)*, *(Array)* or *(Object)*: An async function or an array/object of them.
- **stateProp** *(string) (optional)*: If set, result will be put under `this.state[stateProp]`. If unset values will be put under `this.state`.
- **options** *(Object) (optional)*:
  - **getData** *(function(response) -> parsedResponse)*: Transforms any resolved value before resolving. Useful when you're only interested in a part of the resolved value's.
  - **getError** *(function(error) -> parsedError) (optional)*: Transforms any rejected value before rejecting.
  - **shouldThrow** *(function(response) -> isError) (optional)*: Triggers a rejection of any `Promise` that would otherwise resolve, based on its response. Useful for when you want your function to 

#### returns
- **requestFn** *(function)*: Calls `fn`. In case `fn` is was an `Array` of functions, each argument must be an array and will be applied to each function of `fn` respectively. In case `fn` is was an `Object` of functions, a single values of the object will be applied based on their keys.

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

### function createMemoizedPromiseHandler(fn, stateProp, options) -> requestFn

Same as `createPromiseHandler`, but memoizes the result. Will not memoize any results of rejected `Promise`'s. Uses reference equality for non-primitive values.

Sets `state` straight to the result when a memoized result is used, without setting to `loading` in between.

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

class MyMemoizedPromiseComponent extends React.Component {
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
`react-toolbelt` uses `Object.assign` and `Promise` under the hood, which is part of the ES6 syntax. This means that to use `react-toolbelt` with ES5 applications, the necessary polyfills must be included in your project.