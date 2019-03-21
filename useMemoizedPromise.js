var usePromise = require('./usePromise');

function useMemoizedPromise(fn, options) {
	return usePromise(fn, Object.assign({}, options, {memoize: true}));
}

module.exports = useMemoizedPromise;