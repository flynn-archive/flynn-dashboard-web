//= require ../dispatcher

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
			app: null,
			release: null,
			formation: null
		};
	},

	didBecomeActive: function () {
		this.__fetchApp();
		this.__fetchAppRelease().then(this.__fetchAppFormation.bind(this));
	},

	didBecomeInactive: function () {
		this.constructor.discardInstance(this);
	},

	handleEvent: function (event) {
		switch (event.name) {
			case "APP_ENV:CREATE_RELEASE":
				this.__createRelease(event.release).then(function () {
					return Promise.all([
						this.__fetchAppRelease(),
						this.__fetchAppFormation()]);
				}.bind(this));
			break;

			case "APP_PROCESSES:CREATE_FORMATION":
				this.__createAppFormation(event.formation);
			break;
		}
	},

	__fetchApp: function () {
		return FlynnDashboard.client.getApp(this.props.appId).then(function (args) {
			var res = args[0];
			this.setState({
				app: res
			});
		}.bind(this));
	},

	__fetchAppRelease: function () {
		return FlynnDashboard.client.getAppRelease(this.props.appId).then(function (args) {
			var res = args[0];
			this.setState({
				release: res
			});
		}.bind(this));
	},

	__fetchAppFormation: function () {
		return FlynnDashboard.client.getAppFormation(this.props.appId, this.state.release.id).then(function (args) {
			var res = args[0];
			this.setState({
				formation: res
			});
			return res;
		}.bind(this));
	},

	__createRelease: function (release) {
		var client = FlynnDashboard.client;
		var appId = this.props.appId;
		return client.createRelease(release).then(function (args) {
			var res = args[0];
			var releaseId = res.id;
			return client.createAppRelease(appId, {id: releaseId});
		}.bind(this)).then(function () {
			FlynnDashboard.Dispatcher.handleStoreEvent({
				name: "APP:RELEASE_CREATED",
				appId: appId
			});
		}.bind(this));
	},

	__createAppFormation: function (formation) {
		return FlynnDashboard.client.createAppFormation(formation.app, formation).then(function (args) {
			var res = args[0];
			this.setState({
				formation: res
			});
		}.bind(this));
	}
});

App.dispatcherIndex = App.registerWithDispatcher(FlynnDashboard.Dispatcher);

App.createFromGithubCommit = function (repo, branchName, sha, appData) {
	var meta = {
		type: "github",
		user_login: repo.ownerLogin,
		repo_name: repo.name,
		ref: branchName,
		sha: sha,
		clone_url: repo.cloneURL
	};
	return this.createFromGithub(meta, appData);
};

App.createFromGithubPull = function (repo, pull, appData) {
	var meta = {
		type: "github",
		user_login: repo.ownerLogin,
		repo_name: repo.name,
		ref: pull.head.ref,
		sha: pull.head.sha,
		clone_url: repo.cloneURL,
		pull_number: String(pull.number),
		pull_user_login: pull.user.login,
		base_user_login: pull.base.ownerLogin,
		base_repo_name: pull.base.name,
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
			FlynnDashboard.Dispatcher.handleStoreEvent({
				name: "APP:DATABASE_CREATED",
				appId: appId,
				appName: appName,
				env: Marbles.Utils.extend({}, appData.env, databaseEnv)
			});
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
			return createAppRelease(res.id);
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
		}).then(function (args) {
			FlynnDashboard.Dispatcher.handleStoreEvent({
				name: "APP:JOB_CREATED",
				appId: appId,
				appName: appName,
				job: args[0]
			});
			return args;
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
	}).catch(function (args) {
		if (args instanceof Error) {
			throw args;
		} else {
			var res = args[0];
			var xhr = args[1];
			FlynnDashboard.Dispatcher.handleStoreEvent({
				name: "APP:CREATE_FAILED",
				appName: data.name,
				errorMsg: res.message || "Something went wrong ["+ xhr.status +"]"
			});
		}
	});
};

App.handleEvent = function (event) {
	switch (event.name) {
		case "GITHUB_DEPLOY:LAUNCH_FROM_COMMIT":
			App.createFromGithubCommit(event.repo, event.branchName, event.commit.sha, event.appData);
		break;

		case "GITHUB_DEPLOY:LAUNCH_FROM_PULL":
			App.createFromGithubPull(event.repo, event.pull, event.appData);
		break;
	}
};
FlynnDashboard.Dispatcher.register(App.handleEvent);

})();
