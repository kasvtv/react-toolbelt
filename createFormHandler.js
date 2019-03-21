var getFormValueFromTarget = require('./utils/getFormValueFromTarget');
var createSetInnerState = require('./utils/createSetInnerState');

function createFormHandler(parentProp='') {
	var setStateFunction = createSetInnerState(parentProp);

	return function(event) {
		setStateFunction({
			[event.target.name]: getFormValueFromTarget(event.target)
		});
	};
}

module.exports = createFormHandler;