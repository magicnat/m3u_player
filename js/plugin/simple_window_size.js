var winSize = (function () {

	isLandscape = function () {
		return window.innerHeight > window.innerWidth;
	},

	getWidth = function () {
		return isLandscape ? window.innerHeight : window.innerWidth;
	},

	getHeight = function () {
		return isLandscape ? window.innerWidth : window.innerHeight;
	};

	return {
		isLandscape : isLandscape,
		getWidth : getWidth,
		getHeight : getHeight
	};

})();
