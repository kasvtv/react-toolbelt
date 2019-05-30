module.exports = function bindPromiseFunctionToState(fn, setState) {
	var count = 0;

	return function() {
		var promise = fn.apply(this, arguments);
		var that = this;
		var countAtStart = ++count;
		var pending = true;

		function load() { pending = false; }
		function done(obj) {
			if (count === countAtStart) {
				setState.call(that, obj);
			}
		}

		promise.then(load, load);

		setTimeout(function() {

			if (pending) { done({ loading: true, data: null, error: null }); }

			promise.then(
				function(x) { done({ loading: false, data: x, error: null }); },
				function(x) { done({ loading: false, data: null, error: x }); }
			);
		});

		return promise;
	};
};