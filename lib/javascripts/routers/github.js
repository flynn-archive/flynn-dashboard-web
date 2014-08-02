//= require ../views/github

(function () {

"use strict";

FlynnDashboard.routers.github = new (Marbles.Router.createClass({
	displayName: "routers.github",

	routes: [
		{ path: "github", handler: "github" }
	],

	github: function (params) {
		var props = {
			selectedSource: params[0].org || null,
			selectedType: params[0].type || null
		};
		var view = FlynnDashboard.primaryView;
		if (view && view.constructor.displayName === "Views.Github") {
			view.setProps(props);
		} else {
			view = FlynnDashboard.primaryView = React.renderComponent(
				FlynnDashboard.Views.Github(props),
				FlynnDashboard.el);
			}
	}

}))();

})();
