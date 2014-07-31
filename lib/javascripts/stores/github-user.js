(function () {
"use strict";

FlynnDashboard.Stores.GithubUser = Marbles.Store.createClass({
	displayName: "Stores.GithubUser",

	getState: function () {
		return this.state;
	},

	getInitialState: function () {
		return {
			user: null
		};
	},

	didBecomeActive: function () {
		this.__fetchUser();
	},

	didBecomeInactive: function () {
		this.constructor.discardInstance(this);
	},

	__fetchUser: function () {
		FlynnDashboard.githubClient.getUser().then(function (args) {
			var res = args[0];
			this.setState({
				user: this.__rewriteJSON(res)
			});
		}.bind(this));
	},

	__rewriteJSON: function (userJSON) {
		return {
			avatarURL: userJSON.avatar_url,
			login: userJSON.login,
			name: userJSON.name
		};
	}

});

})();
