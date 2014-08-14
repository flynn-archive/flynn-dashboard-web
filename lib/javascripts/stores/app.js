(function () {
"use strict";

var App = FlynnDashboard.Stores.App = Marbles.Store.createClass({
	displayName: "Stores.App",

	getState: function () {
		return this.state;
	},

	willInitialize: function () {
		this.props = this.id;
	},

	getInitialState: function () {
		return {
			app: null
		};
	},

	didBecomeActive: function () {
		this.__fetchBranches();
	},

	didBecomeInactive: function () {
		this.constructor.discardInstance(this);
	}
});

App.createFromGithubCommit = function (repo, branchName, sha, appData) {
	var meta = {
		type: "github",
		user_login: repo.owner.login,
		repo_name: repo.name,
		ref: branchName,
		sha: sha,
		clone_url: repo.clone_url
	};
	return this.createFromGithub(meta, appData);
};

App.createFromGithubPull = function (repo, pull, appData) {
	var meta = {
		type: "github",
		user_login: repo.owner.login,
		repo_name: repo.name,
		ref: pull.head.ref,
		sha: pull.head.sha,
		clone_url: repo.clone_url,
		pull_number: pull.number,
		pull_user_login: pull.user.login,
		base_user_login: pull.base.repo.owner.login,
		base_repo_name: pull.base.repo.name,
		base_ref: pull.base.ref,
		base_sha: pull.base.sha
	};
	return this.createFromGithub(meta, appData);
};

App.createFromGithub = function (meta, appData) {
	var data = {
		name: appData.name,
		meta: meta
	};

	var appId, appName, databaseEnv, artifactId;

	var client = FlynnDashboard.client;

	function createDatabase () {
		return client.createAppDatabase({ apps: [appId] }).then(function (args) {
			var res = args[0];
			databaseEnv = res.env;
			return createArtifact();
		});
	}

	function createArtifact () {
		return client.createArtifact({
			type: "docker",
			uri: "example://uri"
		}).then(function (args) {
			var res = args[0];
			artifactId = res.id;
			return createRelease();
		});
	}

	function createRelease () {
		return client.createRelease({
			env: Marbles.Utils.extend({}, appData.env, databaseEnv),
			artifact: artifactId
		}).then(function (args) {
			var res = args[0];
			return createAppRelease(res[0].id);
		});
	}

	function createAppRelease (releaseId) {
		return client.createAppRelease(appId, {
			id: releaseId
		}).then(function () {
			return getTaffyRelease();
		});
	}

	function getTaffyRelease () {
		return client.getTaffyRelease().then(function (args) {
			var res = args[0];
			return createTaffyJob(res.id);
		});
	}

	function createTaffyJob (taffyReleaseId) {
		return client.createTaffyJob({
			release: taffyReleaseId,
			cmd: [appName, meta.clone_url, meta.ref, meta.sha]
		});
	}

	return client.createApp(data).then(function (args) {
		var res = args[0];
		appId = res.id;
		appName = res.name;
		if (appData.dbRequested) {
			return createDatabase();
		} else {
			return getTaffyRelease();
		}
	});
};

})();
