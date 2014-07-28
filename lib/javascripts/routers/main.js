//= require ../views/main

(function () {

"use strict";

FlynnDashboard.routers.main = new (Marbles.Router.createClass({
	displayName: "FlynnDashboard.routers.main",

	routes: [
		{ path: "", handler: "root" },
		{ path: "login", handler: "login", auth: false },
	],

	root: function () {
		React.renderComponent(
			FlynnDashboard.Views.Main({}), FlynnDashboard.el);
	},

	login: function (params) {
	}

}))();

})();
