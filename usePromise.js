var useState = require('react').useState;
var useMemo = require('react').useMemo;
var bindPromiseFunctionToState = require('./utils/bindPromiseFunctionToState');
var applyPromiseOptionsDefaults = require('./utils/applyPromiseOptionsDefaults');
var createPromiseFunction = require('./utils/createPromiseFunction');

function usePromise(fn, options) {
	var stateHook = useState({loading: false, error: null, data: null});
	var state = stateHook[0];
	var setState = stateHook[1];

	var promiseFn = useMemo(
		function() {
			return bindPromiseFunctionToState(
				createPromiseFunction(fn, applyPromiseOptionsDefaults(options)),
				setState
			)
		},
		[]
	);

	return [state, promiseFn];
}

module.exports = usePromise;