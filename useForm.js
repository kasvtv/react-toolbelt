var useReducer = require('react').useReducer;
var getFormValueFromTarget = require('./utils/getFormValueFromTarget');

function formReducer(state, t) {
	var keyValue = {};
	keyValue[t.name] = getFormValueFromTarget(t);
	return Object.assign({}, state, keyValue);
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