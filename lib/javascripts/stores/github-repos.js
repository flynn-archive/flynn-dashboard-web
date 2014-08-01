(function () {
"use strict";

FlynnDashboard.Stores.GithubRepos = Marbles.Store.createClass({
	displayName: "Stores.GithubRepos",

	getState: function () {
		return this.state;
	},

	willInitialize: function () {
		this.props = this.id;
	},

	getInitialState: function () {
		return {
			repos: []
		};
	},

	didBecomeActive: function () {
		this.__fetchRepos();
	},

	didBecomeInactive: function () {
		this.constructor.discardInstance(this);
	},

	__fetchRepos: function () {
		var params = [{
			sort: "pushed",
			type: "owner"
		}];
		var getReposFn = FlynnDashboard.githubClient.getRepos;

		if (this.props.org) {
			getReposFn = FlynnDashboard.githubClient.getOrgRepos;
			params[0].org = this.props.org;

			if (this.props.type === "fork") {
				params[0].type = "forks";
			} else {
				params[0].type = "all";
			}
		} else if (this.props.type === "star") {
			getReposFn = FlynnDashboard.githubClient.getStarredRepos;
		}

		getReposFn.call(FlynnDashboard.githubClient, params).then(function (args) {
			var res = args[0];
			if (this.props.type === "fork") {
				res = res.filter(function (repoJSON) {
					return repoJSON.fork;
				}, this);
			} else if (this.props.type !== "star") {
				res = res.filter(function (repoJSON) {
					return !repoJSON.fork;
				}, this);
			}
			this.setState({
				repos: res.map(this.__rewriteJSON)
			});
		}.bind(this));
	},

	__rewriteJSON: function (repoJSON) {
		return {
			id: repoJSON.id,
			name: repoJSON.name,
			language: repoJSON.language,
			description: repoJSON.description,
			ownerLogin: repoJSON.owner.login
		};
	}

});

})();
