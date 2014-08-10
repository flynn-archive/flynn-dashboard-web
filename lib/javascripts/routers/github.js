//= require ../views/github

(function () {

"use strict";

FlynnDashboard.routers.github = new (Marbles.Router.createClass({
	displayName: "routers.github",

	routes: [
		{ path: "github", handler: "github" }
	],

	github: function (params) {
		var selectedRepo;
		if (params[0].repo && params[0].owner) {
			selectedRepo = {
				ownerLogin: params[0].owner,
				name: params[0].repo
			};
		}
		var props = {
			selectedSource: params[0].org || null,
			selectedType: params[0].type || null,
			selectedRepo: selectedRepo || null,
			selectedRepoPanel: params[0].repo_panel || null
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
