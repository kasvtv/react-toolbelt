module.exports = function fromPairs(pairs) {
	var ret = {};
	for (var ind in pairs) {
		var pair = pairs[ind];
		ret[pair[0]] = pair[1];
	}
	return ret;
};