var useMemo = require('react').useMemo;
var getFormValueFromTarget = require('./utils/getFormValueFromTarget');

function useUncontrolledForm(initialState) {
	var obj = useMemo(function() {
		return initialState || {};
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	return [
		obj,
		function setObj(e) {
			obj[e.target.name] = getFormValueFromTarget(e.target);
		},
	];
}

module.exports = useUncontrolledForm;