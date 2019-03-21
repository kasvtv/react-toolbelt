module.exports = function getFormValueFromTarget(target) {
	return target.type === 'checkbox' ? target.checked : target.value;
};