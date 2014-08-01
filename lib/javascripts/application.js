//= require_self
//= require ./config
//= require ./dispatcher
//= require ./client
//= require ./github-client
//= require ./routers/main
//= require ./routers/github
//= require ./views/service-unavailable
//= require ./boot

(function () {

"use strict";

window.FlynnDashboard = {
	Stores: {},
	Views: {
		Models: {},
		Helpers: {}
	},
	Actions: {},
	routers: {},
	config: {},

	run: function () {
		if ( Marbles.history && Marbles.history.started ) {
			throw new Error("Marbles.history already started!");
		}

		this.client = new this.Client(this.config.endpoints);

		if (this.config.user && this.config.user.auths.github) {
			FlynnDashboard.githubClient = new FlynnDashboard.GithubClient(
				this.config.user.auths.github.id,
				this.config.user.auths.github.access_token
			);
		}

		this.el = document.getElementById("main");

		Marbles.History.start({
			root: (this.config.PATH_PREFIX || '') + '/',
			dispatcher: this.Dispatcher
		});
	},

	__isLoginPath: function () {
		var path = Marbles.history.path;
		if ( path === "" ) {
			return false;
		}
		return String(path).substr(0, 5) === 'login';
	},

	__redirectToLogin: function () {
		var redirectPath = Marbles.history.path ? '?redirect='+ encodeURIComponent(Marbles.history.path) : '';
		Marbles.history.navigate('login'+ redirectPath);
	},

	__handleEvent: function (event) {
		if (event.source === "Marbles.History") {
			switch (event.name) {
				case "handler:before":
					// prevent route handlers requiring auth from being called when app is not authenticated
					if ( !this.config.authenticated && event.handler.opts.auth !== false ) {
						event.abort();
					}
				break;
			}
			return;
		}

		if (event.source !== "APP_EVENT") {
			return;
		}
		var started = this.__started || false;
		switch (event.name) {
			case "CONFIG_READY":
				if ( !started ) {
					this.__started = true;
					this.run();
				}
			break;

			case "AUTH_CHANGE":
				this.__handleAuthChange(event.authenticated);
			break;

			case "SERVICE_UNAVAILABLE":
				this.__handleServiceUnavailable(event.status);
			break;
		}
	},

	__handleAuthChange: function (authenticated) {
		if ( !authenticated && !this.__isLoginPath() ) {
			this.__redirectToLogin();
		}
	},

	__handleServiceUnavailable: function (status) {
		React.renderComponent(
			FlynnDashboard.Views.ServiceUnavailable({ status: status }),
			document.getElementById('main')
		);
	}
};

})();
