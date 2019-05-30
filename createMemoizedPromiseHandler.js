var createPromiseHandler = require('./createPromiseHandler');
var memoize = require('memoize-weak-promise');

function createMemoizedPromiseHandler(fn, stateProp, options) {
	return createPromiseHandler(
		fn,
		stateProp,
		Object.assign({}, options, { memoizeFn: memoize })
	);
}

module.exports = createMemoizedPromiseHandler;