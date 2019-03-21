function createSetInnerState(path) {
	if (!path) {
		return function(toAdd) {
			this.setState(toAdd);
		};
	} else {
		return function(toAdd) {
			if (toAdd !== null) {
				this.setState(function(state) {
					var ret = {};
					ret[path] = Object.assign({}, state[path], toAdd);
					return ret;
				});
			}
		};
	}
}

module.exports = createSetInnerState;