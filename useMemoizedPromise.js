var usePromise = require('./usePromise');
var memoize = require('memoize-weak-promise');

function useMemoizedPromise(fn, options) {
	return usePromise(fn, Object.assign({}, options, { memoizeFn: memoize }));
}

module.exports = useMemoizedPromise;