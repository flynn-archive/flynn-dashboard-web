(function () {

"use strict";

FlynnDashboard.Dispatcher = Marbles.Utils.extend({
	handleViewAction: function (action) {
		this.dispatch(Marbles.Utils.extend({
			source: "VIEW_ACTION"
		}, action));
	},

	handleAppEvent: function (event) {
		this.dispatch(Marbles.Utils.extend({
			source: "APP_EVENT"
		}, event));
	}
}, Marbles.Dispatcher);

})();
