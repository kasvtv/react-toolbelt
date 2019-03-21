module.exports = function bindPromiseFunctionToState(promiseFn, setState) {
	var count = 0;
	return function (args) {		
		var promise = promiseFn(args);
		count++;
		var countAtStart = count;
		var promisePending = true;
		promise.then(function() {promisePending = false});

		var that = this;
		setTimeout(function() {

			if (promisePending) {
				setState.call(that, function(state) {
					return {data: state.data, loading: true, error: null};
				});
			}

			promise.then(
				function(data) {
					if (count === countAtStart) {
						setState.call(that, {loading: false, error: null, data});
					}
				}
			).catch(
				function(error) {
					if (count === countAtStart) {
						setState.call(that, function(state) {
							return {data: state.data, loading: false, error};
						});
					}
				}
			);
		});

		return promise;
	};
};