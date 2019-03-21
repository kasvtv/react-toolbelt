var getFormValueFromTarget = require('./utils/getFormValueFromTarget');

function createUncontrolledFormHandler(parentProp) {
	return function(event) {
		var target = event.target;
		(parentProp ? this[parentProp] : this)[target.name] = getFormValueFromTarget(target);
	};
}
module.exports = createUncontrolledFormHandler;