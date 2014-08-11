//= require ../views/github

(function () {

"use strict";

var githubRouter = FlynnDashboard.routers.github = new (Marbles.Router.createClass({
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
			selectedRepoPanel: params[0].repo_panel || null,
			selectedBranchName: params[0].branch || null
		};
		var view = FlynnDashboard.primaryView;
		if (view && view.constructor.displayName === "Views.Github") {
			view.setProps(props);
		} else {
			view = FlynnDashboard.primaryView = React.renderComponent(
				FlynnDashboard.Views.Github(props),
				FlynnDashboard.el);
			}
	},

	handleEvent: function (event) {
		if (event.name !== "GITHUB_BRANCH_SELECTOR:BRANCH_SELECTED") {
			return;
		}
		var path = Marbles.history.getPath();
		var pathParts = path.split("?");
		var handler = Marbles.history.getHandler(pathParts[0]);
		var params = [{}];
		if (handler.name === "github") {
			params = Marbles.QueryParams.deserializeParams(pathParts[1] || "");
		}

		if (params[0].repo === event.storeId.repoName && params[0].owner === event.storeId.ownerLogin) {
			params = Marbles.QueryParams.replaceParams(params, {
				branch: event.branchName
			});
			Marbles.history.navigate(Marbles.history.pathWithParams("/github", params));
		}
	}
}))();

githubRouter.dispatcherIndex = FlynnDashboard.Dispatcher.register(githubRouter.handleEvent);

})();
