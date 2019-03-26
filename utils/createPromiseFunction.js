var fromPairs = require('./fromPairs');
var memoize = require('memoize-weak-promise');

function assertArray(val) {
	return Array.isArray(val)
		? val
		: [val];
}

function createOptionsApplier(options) {
	return function(promiseFn)  {
	
		var appliedFunction = function() {
			var promise = promiseFn.apply(this, arguments);
			
			var ret = promise.then(
				function(data) {
					if (options.shouldThrow(data)) throw data;
					return options.getData(data);
				}
			).catch(function(error) {
				throw options.getError(error);
			});

			// copy any enumerable properties on the promise
			for (var ind in promise) {
				Object.defineProperty(
					ret,
					ind,
					Object.getOwnPropertyDescriptor(promise, ind)
				);
			}

			return ret;
		}

		return options.memoize
			? memoize(appliedFunction, options)
			: appliedFunction;
	}
}

function arrayfy(arrayOfAsyncFunctions, applyToFn) {
	var appliedFunctions = arrayOfAsyncFunctions.map(
		function(fn) { return applyToFn(fn) }
	);
	
	return function(args) {
		args = args || [];
		var that = this;

		return Promise.all(
			appliedFunctions.map(
				function(fn, i) {
					var a = assertArray(args[i]);
					return fn.apply(that, a);
				}
			)
		);
	}
}

function objectify(objectOfAsyncFunctions, applyToFn) {
	var keys = Object.keys(objectOfAsyncFunctions);

	var appliedFunctions = keys.map(
		function(key) { return applyToFn(objectOfAsyncFunctions[key]) }
	);

	return function(args) {
		args = args || {};
		var that = this;

		return Promise.all(keys.map(
			function(key, i) {
				var a = assertArray(args[key]);
				return appliedFunctions[i].apply(that, a);
			}
		)).then(
			function(resolvedPromises) {
				return fromPairs(resolvedPromises.map(
					function(resolved, i) {
						return [keys[i], resolved];
					}
				));
			}
		);
	}
}

function funcify(asyncFunction, applyToFn) {
	return applyToFn(asyncFunction);
}

module.exports = function createPromiseFunction(functionality, options) {
	var applyToFn = createOptionsApplier(options);

	return Array.isArray(functionality) ?
		arrayfy(functionality, applyToFn)
	: functionality && typeof functionality === 'object' ?
		objectify(functionality, applyToFn)
	:
		funcify(functionality, applyToFn);
};