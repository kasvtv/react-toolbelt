module.exports = function fromPairs(pairs) {
	var ret = {};
	for (var pair in pairs) {
		ret[pair[0]] = pair[1];
	}
	return ret;
};