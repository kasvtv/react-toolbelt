var useState = require('react').useState;
var useMemo = require('react').useMemo;
var bindPromiseFunctionToState = require('./utils/bindPromiseFunctionToState');
var createPromiseFunction = require('./utils/createPromiseFunction');

function usePromise(fn, options) {
	var stateHook = useState({ loading: false, error: null, data: null });
	var state = stateHook[0];
	var setState = stateHook[1];

	var promiseFn = useMemo(
		function() {
			return bindPromiseFunctionToState(
				createPromiseFunction(fn, options),
				setState
			);
		},
		[] // eslint-disable-line react-hooks/exhaustive-deps
	);

	return [state, promiseFn];
}

module.exports = usePromise;