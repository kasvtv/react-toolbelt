var useReducer = require('react').useReducer;
var getFormValueFromTarget = require('./utils/getFormValueFromTarget');

function formReducer(state, t) {
	return Object.assign({}, state, {[t.name]: getFormValueFromTarget(t)});
}

function useForm(initialState) {
	var stateHook = useReducer(formReducer, initialState || {});

	return [
		stateHook[0],
		function setForm(e) {
			stateHook[1](e.target);
		}
	];
}

module.exports = useForm;