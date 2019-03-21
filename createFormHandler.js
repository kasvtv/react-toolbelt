var getFormValueFromTarget = require('./utils/getFormValueFromTarget');
var createSetInnerState = require('./utils/createSetInnerState');

function createFormHandler(path='') {
	var setStateFunction = createSetInnerState(path);

	return function(event) {
		return setStateFunction({
			[event.target.name]: getFormValueFromTarget(event.target)
		});
	};
}

module.exports = createFormHandler;