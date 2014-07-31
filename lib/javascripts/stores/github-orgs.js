(function () {
"use strict";

FlynnDashboard.Stores.GithubOrgs = Marbles.Store.createClass({
	displayName: "Stores.GithubOrgs",

	getState: function () {
		return this.state;
	},

	getInitialState: function () {
		return {
			orgs: []
		};
	},

	didBecomeActive: function () {
		this.__fetchOrgs();
	},

	didBecomeInactive: function () {
		this.constructor.discardInstance(this);
	},

	__fetchOrgs: function () {
		FlynnDashboard.githubClient.getOrgs().then(function (args) {
			var res = args[0];
			this.setState({
				orgs: res.map(this.__rewriteJSON)
			});
		}.bind(this));
	},

	__rewriteJSON: function (orgJSON) {
		return {
			id: orgJSON.id,
			avatarURL: orgJSON.avatar_url,
			login: orgJSON.login
		};
	}
});

})();
