(function () {
"use strict";

var GithubRepo = FlynnDashboard.Stores.GithubRepo = Marbles.Store.createClass({
	displayName: "Stores.GithubRepo",

	getState: function () {
		return this.state;
	},

	willInitialize: function () {
		this.props = this.id;
	},

	getInitialState: function () {
		return {
			repo: null
		};
	},

	didBecomeActive: function () {
		this.__fetchRepo();
	},

	didBecomeInactive: function () {
		this.constructor.discardInstance(this);
	},

	__fetchRepo: function () {
		FlynnDashboard.githubClient.getRepo(this.props.ownerLogin, this.props.name).then(function (args) {
			var res = args[0];
			this.setState({
				repo: this.__rewriteJSON(res)
			});
		}.bind(this));
	},

	__rewriteJSON: function (repoJSON) {
		return {
			id: repoJSON.id,
			defaultBranch: repoJSON.default_branch
		};
	}
});

GithubRepo.isValidId = function (id) {
	return id.userLogin && id.repoName;
};

})();
