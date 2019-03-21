var bindPromiseFunctionToState = require('./utils/bindPromiseFunctionToState');
var applyPromiseOptionsDefaults = require('./utils/applyPromiseOptionsDefaults');
var createPromiseFunction = require('./utils/createPromiseFunction');
var createSetInnerState = require('./utils/createSetInnerState');

function createPromiseHandler(fn, path, options) {
	var promiseFunction = bindPromiseFunctionToState(
		createPromiseFunction(fn, applyPromiseOptionsDefaults(options)),
		createSetInnerState(path)
	);

	return function() {
		return promiseFunction.apply(this, arguments);
	};
}

module.exports = createPromiseHandler;