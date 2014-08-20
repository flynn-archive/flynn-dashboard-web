//= require ../store

(function () {
"use strict";

var GithubPull = FlynnDashboard.Stores.GithubPull = FlynnDashboard.Store.createClass({
	displayName: "Stores.GithubPull",

	getState: function () {
		return this.state;
	},

	willInitialize: function () {
		this.props = this.id;
	},

	getInitialState: function () {
		return {
			pull: null
		};
	},

	didBecomeActive: function () {
		this.__fetchPull();
	},

	__fetchPull: function () {
		var pull = FlynnDashboard.Stores.GithubPulls.findPull(this.props.ownerLogin, this.props.repoName, this.props.number);
		if (pull) {
			this.setState({
				pull: pull
			});
			return Promise.resolve(pull);
		}

		return FlynnDashboard.githubClient.getPull(this.props.ownerLogin, this.props.repoName, this.props.number).then(function (args) {
			var res = args[0];
			var pull = this.__rewriteJSON(res);
			this.setState({
				pull: pull
			});
			return pull;
		}.bind(this));
	},

	__rewriteJSON: function (pullJSON) {
		var stripHTML = function (str) {
			var tmp = document.createElement("div");
			tmp.innerHTML = str;
			return tmp.textContent || tmp.innerText;
		};
		return {
			id: pullJSON.id,
			number: pullJSON.number,
			title: pullJSON.title,
			body: stripHTML(pullJSON.body),
			url: pullJSON.html_url,
			createdAt: pullJSON.created_at,
			updatedAt: pullJSON.updated_at,
			user: {
				login: pullJSON.user.login,
				avatarURL: pullJSON.user.avatar_url
			},
			head: {
				label: pullJSON.head.label,
				ref: pullJSON.head.ref,
				sha: pullJSON.head.sha,
				name: pullJSON.head.repo.name,
				ownerLogin: pullJSON.head.repo.owner.login
			},
			base: {
				label: pullJSON.base.label,
				ref: pullJSON.base.ref,
				sha: pullJSON.base.sha,
				name: pullJSON.base.repo.name,
				ownerLogin: pullJSON.base.repo.owner.login
			}
		};
	}
});

GithubPull.isValidId = function (id) {
	return id.ownerLogin && id.repoName && id.number;
};

})();
