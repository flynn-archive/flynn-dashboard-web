//= require_self
//= require ./config
//= require ./dispatcher
//= require_tree ./routers
//= require ./boot

(function () {

"use strict";

window.FlynnDashboard = {
	Stores: {},
	Views: {},
	Actions: {},
	routers: {},
	config: {},

	run: function () {
		if ( !Marbles.history || Marbles.history.started ) {
			throw new Error("Marbles.history already started!");
		}

		this.el = document.getElementById("main");

		Marbles.history.start({
			root: (this.config.PATH_PREFIX || '') + '/'
		});
	}
};

})();
