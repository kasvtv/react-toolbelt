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
			).catch(
				options.getError
			);

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

module.exports = function createPromiseFunction(fn, options) {
	var applyOptions = createOptionsApplier(options);

	var ret = fn && typeof fn === 'object' ?
		function(args) {
			return Promise.all(
				Object.entries(fn).map(
					function (pair) {
						var k = pair[0];
						var v = pair[1];

						var a = assertArray( (args || {})[k] );
						return [
							k, applyOptions(v(a))
						];
					}
				)
			).then(fromPairs);
		}
	: Array.isArray(fn) ?
		function(args) {
			return Promise.all(
				fn.map(
					function(f, i) {
						var a = assertArray( (args || [])[i] );
						return applyOptions(f(a));
					}
				)
			);
		}
	:
	applyOptions(fn);

	if (options.memoize) {
		ret = memoize(ret, options);
	}

	return ret;
};