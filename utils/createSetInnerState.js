function createSetInnerState(path) {
	if (!path) {
		return function(toAdd) {
			this.setState(toAdd);
		};
	} else {
		return function(toAdd) {
			this.setState(function(state) {
				return {
					[path]: Object.assign({}, state.path, toAdd)
				};
			});
		};
	}
}

module.exports = createSetInnerState;