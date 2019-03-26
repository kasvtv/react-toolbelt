var fromPairs = require('./fromPairs');
var memoize = require('memoize-weak-promise');

function createOptionsApplier(options) {
	return function(promiseFn)  {
	
		return function applyOptions() {
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
		};
	};
}

function assertArray(val) {
	return Array.isArray(val)
		? val
		: [val];
}

function objectify(objectOfAsyncFunctions, applyToFn) {
	var keys = Object.keys(objectOfAsyncFunctions);

	var appliedFunctions = keys.map(
		function(key) { return applyToFn(objectOfAsyncFunctions[key]) }
	);

	return function(args) {
		args = args || {};

		return Promise.all(keys.map(
			function(key, i) {
				var a = assertArray(args[key]);
				return appliedFunctions[i].apply(this, a);
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

function arrayfy(arrayOfAsyncFunctions, applyToFn) {
	var appliedFunctions = arrayOfAsyncFunctions.map(
		function(fn) { return applyToFn(fn) }
	);
	
	return function(args) {
		args = args || [];

		return Promise.all(
			appliedFunctions.map(
				function(fn, i) {
					var a = assertArray(args[i]);
					return fn.apply(this, a);
				}
			)
		);
	}
}

module.exports = function createPromiseFunction(functionality, options) {
	var applyToFn = createOptionsApplier(options);

	var ret =
		Array.isArray(functionality) ?
			arrayfy(functionality, applyToFn)
		: functionality && typeof functionality === 'object' ?
			objectify(functionality, applyToFn)
		:
			applyToFn(functionality);

	if (options.memoize) {
		ret = memoize(ret, options);
	}

	return ret;
};