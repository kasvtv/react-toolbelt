var getFormValueFromTarget = require('./utils/getFormValueFromTarget');

function createUncontrolledFormHandler(path) {
	return function(event) {
		var target = event.target;
		(path ? this[path] : this)[target.name] = getFormValueFromTarget(target);

		return false;
	};
}
module.exports = createUncontrolledFormHandler;