module.exports = function applyPromiseOptionsDefaults(options) {
	var ret = options || {};
	ret.getData = ret.getData || function(x) { return x };
	ret.getError = ret.getError || function(x) { return x };
	ret.shouldThrow = ret.shouldThrow || function() { return false };
	ret.once = ret.once === undefined ? ret.once : false;
	ret.weak = ret.weak === undefined ? ret.weak : false;
	
	return ret;
};