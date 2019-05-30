function createSetInnerState(stateProp) {
	if (!stateProp) {
		return function(toAdd) {
			this.setState(toAdd);
		};
	}

	return function(toAdd) {
		if (toAdd !== null) {
			this.setState(function(state) {
				var ret = {};
				ret[stateProp] = Object.assign({}, state[stateProp], toAdd);
				return ret;
			});
		}
	};

}

module.exports = createSetInnerState;