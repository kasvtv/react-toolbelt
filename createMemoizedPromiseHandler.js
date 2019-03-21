var createPromiseHandler = require('./createPromiseHandler');

function createMemoizedPromiseHandler(fn, path, options) {
	return createPromiseHandler.call(this, fn, path, Object.assign({}, options, {memoize: true}));
}

module.exports = createMemoizedPromiseHandler;