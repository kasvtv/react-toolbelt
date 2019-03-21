var getFormValueFromTarget = require('./utils/getFormValueFromTarget');
var createSetInnerState = require('./utils/createSetInnerState');

function createFormHandler(parentProp) {
	var setStateFunction = createSetInnerState(parentProp);

	return function(event) {
		var toSet = {};
		toSet[event.target.name] = getFormValueFromTarget(event.target);
		setStateFunction(toSet);
	};
}

module.exports = createFormHandler;