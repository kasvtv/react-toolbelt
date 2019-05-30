/* eslint-disable no-param-reassign */
/* for lack of es6 default params */

function assertArray(val) {
	return Array.isArray(val)
		? val
		: [val];
}

function applyOptions(fn, options) {

	var appliedFunction = function() {
		var promise = fn.apply(this, arguments);

		var ret = promise.then(
			function(data) {
				if (options.shouldThrow && options.shouldThrow(data)) throw data;
				return options.getData ? options.getData(data) : data;
			}
		).catch(function(error) {
			throw options.getError ? options.getError(error) : error;
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

	if (options.memoizeFn) {
		return options.memoizeFn(
			appliedFunction,
			Object.assign({ weak: false }, options)
		);
	}

	return appliedFunction;
}

function arrayfy(fns, options) {
	var appliedFunctions = fns.map(
		function(fn) { return applyOptions(fn, options); }
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
	};
}

function objectify(fns, options) {
	var keys = Object.keys(fns);

	var appliedFns = keys.map(
		function(key) { return applyOptions(fns[key], options); }
	);

	return function(args) {
		args = args || {};
		var that = this;

		return Promise.all(keys.map(
			function(key, i) {
				var a = assertArray(args[key]);
				return appliedFns[i].apply(that, a);
			}
		)).then(
			function(resolvedPromises) {
				var ret = {};
				resolvedPromises.forEach(
					function(resolved, i) {
						ret[keys[i]] = resolved;
					}
				);
				return ret;
			}
		);
	};
}

module.exports = function createPromiseFunction(fn, options) {
	options = options || {};

	if (Array.isArray(fn)) {
		return arrayfy(fn, options);
	}
	if (fn && typeof fn === 'object') {
		return objectify(fn, options);

	}
	return applyOptions(fn, options);
};