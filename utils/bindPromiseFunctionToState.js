module.exports = function bindPromiseFunctionToState(promiseFn, setState) {
	var count = 0;

	return function (args) {		
		var promise = promiseFn(args);
		count++;
		var countAtStart = count;
		var promisePending = true;
		var that = this;

		promise.then(function() {promisePending = false});

		setTimeout(function() {

			if (promisePending) {
				setState.call(that, {loading: true, data: null, error: null});
			}

			promise.then(
				function(data) {
					if (count === countAtStart) {
						setState.call(that, {loading: false, data: data, error: null});
					}
				}
			).catch(
				function(error) {
					if (count === countAtStart) {
						setState.call(that, {loading: false, data: null, error: error});
					}
				}
			);
		});

		return promise;
	};
};