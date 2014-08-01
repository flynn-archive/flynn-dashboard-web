//= require ../views/github

(function () {

"use strict";

FlynnDashboard.routers.github = new (Marbles.Router.createClass({
	displayName: "routers.github",

	routes: [
		{ path: "github", handler: "github" }
	],

	github: function (params) {
		React.renderComponent(
			FlynnDashboard.Views.Github({
				selectedSource: params[0].org || null,
				selectedType: params[0].type || null
			}),
			FlynnDashboard.el);
	}

}))();

})();
