var bindPromiseFunctionToState = require('./utils/bindPromiseFunctionToState');
var createPromiseFunction = require('./utils/createPromiseFunction');
var createSetInnerState = require('./utils/createSetInnerState');

function createPromiseHandler(fn, stateProp, options) {
	return bindPromiseFunctionToState(
		createPromiseFunction(fn, options),
		createSetInnerState(stateProp)
	);
}

module.exports = createPromiseHandler;