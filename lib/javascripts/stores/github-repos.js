(function () {
"use strict";

FlynnDashboard.Stores.GithubRepos = Marbles.Store.createClass({
	displayName: "Stores.GithubRepos",

	getState: function () {
		return this.state;
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
		FlynnDashboard.githubClient.getRepos([{
			sort: "pushed"
		}]).then(function (args) {
			var res = args[0];
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
