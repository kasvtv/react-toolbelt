var fromPairs = require('./fromPairs');
var memoize = require('memoize-weak-promise');

function applyOptions(options) {
	return function(promiseFn)  {
	
		return function() {
			return promiseFn.apply(this, arguments).then(
				function(data) {
					if (options.shouldThrow(data)) throw data;
					return options.getData(data);
				}
			).catch(
				options.getError
			)
		}
	}
}

module.exports = function createPromiseFunction(fn, options) {
	var apply = applyOptions(options);

	var ret = fn && typeof fn === 'object' ?
		function(args) {
			return Promise.all(
				Object.entries(fn).map(
					function (pair) {
						var k = pair[0];
						var v = pair[1];
						return [
							k, apply(v((args || {})[k]))
						];
					}
				)
			).then(fromPairs);
		}
	: Array.isArray(fn) ?
		function(args) {
			return Promise.all(
				fn.map(
					function(x, i) {
						return apply(x((args || [])[i]));
					}
				)
			);
		}
	:
	apply(fn);

	if (options.memoize) {
		ret = memoize(ret, options);
	}

	return ret;
};