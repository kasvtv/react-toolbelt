var bindPromiseFunctionToState = require('./utils/bindPromiseFunctionToState');
var applyPromiseOptionsDefaults = require('./utils/applyPromiseOptionsDefaults');
var createPromiseFunction = require('./utils/createPromiseFunction');
var createSetInnerState = require('./utils/createSetInnerState');

function createPromiseHandler(fn, parentProp, options) {
	return bindPromiseFunctionToState(
		createPromiseFunction(fn, applyPromiseOptionsDefaults(options)),
		createSetInnerState(parentProp)
	);
}

module.exports = createPromiseHandler;