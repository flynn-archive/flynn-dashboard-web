(function () {
"use strict";

var GithubBranches = FlynnDashboard.Stores.GithubBranches = Marbles.Store.createClass({
	displayName: "Stores.GithubBranches",

	getState: function () {
		return this.state;
	},

	willInitialize: function () {
		this.props = this.id;
	},

	getInitialState: function () {
		return {
			branchNames: []
		};
	},

	didBecomeActive: function () {
		this.__fetchBranches();
	},

	didBecomeInactive: function () {
		this.constructor.discardInstance(this);
	},

	__fetchBranches: function () {
		FlynnDashboard.githubClient.getBranches(this.props.ownerLogin, this.props.repoName).then(function (args) {
			var res = args[0];
			this.setState({
				branchNames: res.map(this.__rewriteJSON)
			});
		}.bind(this));
	},

	__rewriteJSON: function (branchJSON) {
		return branchJSON.name;
	}
});

GithubBranches.isValidId = function (id) {
	return id.userLogin && id.repoName;
};

})();
