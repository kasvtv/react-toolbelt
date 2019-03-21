# react-toolbelt
[![npm version](https://img.shields.io/npm/v/react-toolbelt.svg)](https://www.npmjs.com/package/react-toolbelt)

> A simple functional library to simplify and unify commonly used React component functionality

## Installation

```bash
npm install react-toolbelt
```

## Hooks API

### function useForm([initialState]) -> [form, setForm]

Register a hook for keeping track of a form's state. The `name` property of any element it is passed to determines its key in the `form` variable. Similar to React's builtin `useState` hook, except that `setForm` expects a React event and therefore should can passed as `onChange` prop to any form fields.

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
    const [form, setForm] = useForm();

    return <form onSubmit={
        e => {
            e.preventDefault();
            console.log(form);
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

Register a hook for keeping track of an uncontrolled form. The `name` property of any element it is passed to determines its key in the `form` variable. It differs from `useForm` in that it does not call a re-render when an input changes.

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
    const [form, setForm] = useUncontrolledForm();

    const {firstName, lastName, remember} = form; // these variables wont update as soon as the user types!

    return <form onSubmit={
        e => {
            e.preventDefault();
            console.log(form);
        }
    }>
        <input name='firstName' defaultValue={form.firstName} type='text' onChange={setForm} />
        <input name='lastName' defaultValue={form.lastName} type='text' onChange={setForm} />
        <input name='remember' defaultValue={form.remember} type='checkbox' onChange={setForm} />
        <button type='submit'>Submit</button>
    </form>;
}
```

### function usePromise(promiseFn, options) -> [{loading, data, error}, request]

Register a hook for loading a function returning a `Promise` its return value into a component's state. Re-renders the component when the function is called and when the resulting `Promise` either resolves or rejects.

Automatically prevents common asynchronicity issues by not rerendering the component if the `Promise` resolves when `request` has already been called again. Also will not trigger a re-render with `loading` set to `true` when `request` immediately resolves.

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
    - **data** *(any)*: Holds the the latest function call's resolved value, set to `null` initially.
    - **error** *(any)*: Holds the the latest function call's rejected value, in case it rejected. Set to `null` initially, in case of success, or in case `request` is called again.
  - **request** *(function)*: Calls `promiseFn`. In case `promiseFn` is was an `Array`, parameters will be applied in order. In case `promiseFn` is was an `Object`, values of the object will be applied based on their keys.

#### example
```js
import React from 'react';
import usePromise from 'react-toolbelt/usePromise';
import axios from 'axios';

function MyFormComponent() {
    const [package, getPackage] = usePromise(package => axios.get(`https://www.npmjs.com/package/${package}`));

    return <div>
        {
            package.loading ? <p>Loading...</p>
            : package.error ? <p className='red'>An error occurred: {package.error}</p>
            : package.data
        }
        <button type='button' onClick={() => getPackage(`react-toolbelt`)}>Go!</button>
    </div>;
}
```

### function useMemoizedPromise(promiseFn, options) -> [{loading, data, error}, request]

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
import React from 'react';
import useMemoizedPromise from 'react-toolbelt/useMemoizedPromise';
import axios from 'axios';

function MyFormComponent() {
    const [package, getPackage] = useMemoizedPromise(package => axios.get(`https://www.npmjs.com/package/${package}`));

    return <div>
        {
            package.loading ? <p>Loading...</p>
            : package.error ? <p className='red'>An error occurred: {package.error}</p>
            : package.data
        }
        <button type='button' onClick={() => getPackage(`react-toolbelt`)}>Go!</button>
    </div>;
}
```

## Class API

To be documented...

## Using `react-toolbelt` in ES5 applications
`react-toolbelt` uses the `Object.assign` syntax under the hood, which is part of the ES6 syntax. This means that to use `react-toolbelt` with ES5 applications, a polyfill for `Object.assign` must be included in your project.