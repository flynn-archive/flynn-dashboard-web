//= require ../dispatcher
//= require ../views/app
//= require ../views/app-env
//= require ../views/app-delete

(function () {

"use strict";

var appsRouter = FlynnDashboard.routers.apps = new (Marbles.Router.createClass({
	displayName: "routers.apps",

	routes: [
		{ path: "apps/:id", handler: "app" },
		{ path: "apps/:id/env", handler: "appEnv", secondary: true },
		{ path: "apps/:id/delete", handler: "appDelete", secondary: true }
	],

	beforeHandler: function (event) {
		// don't discard store between handlers
		var appId = event.params[0].id;
		if (appId) {
			FlynnDashboard.Stores.App.expectChangeListener({ appId: appId });
		}
	},

	app: function (params) {
		params = params[0];
		var view = FlynnDashboard.primaryView;
		var props = {
			appId: params.id,
			getAppPath: function (subpath, subpathParams) {
				return Marbles.history.pathWithParams(
					"/apps/:id"+ subpath,
					Marbles.QueryParams.replaceParams.apply(null, [params].concat(subpathParams || [])));
			}
		};
		if (view && view.isMounted() && view.constructor.displayName === "Views.App") {
			view.setProps(props);
		} else {
			FlynnDashboard.primaryView = view = React.renderComponent(
				FlynnDashboard.Views.App(props),
				FlynnDashboard.el);
			}
	},

	appEnv: function (params) {
		params = params[0];

		FlynnDashboard.secondaryView = React.renderComponent(
			FlynnDashboard.Views.AppEnv({
				appId: params.id,
				onHide: function () {
					var path = Marbles.history.pathWithParams("/apps/:id", [params]);
					Marbles.history.navigate(path);
				}
			}),
			FlynnDashboard.secondaryEl
		);

		// render app view in background
		this.app.apply(this, arguments);
	},

	appDelete: function (params) {
		params = params[0];

		FlynnDashboard.secondaryView = React.renderComponent(
			FlynnDashboard.Views.AppDelete({
				appId: params.id,
				onHide: function () {
					var path = Marbles.history.pathWithParams("/apps/:id", [params]);
					Marbles.history.navigate(path);
				}
			}),
			FlynnDashboard.secondaryEl
		);

		// render app view in background
		this.app.apply(this, arguments);
	},

	handleEvent: function (event) {
		switch (event.name) {
			case "APP:RELEASE_CREATED":
				this.__handleReleaseCreated(event);
			break;

			case "APP:DELETED":
				this.__handleAppDeleted(event);
			break;
		}
	},

	__handleReleaseCreated: function (event) {
		// exit app env view when successfully saved
		var view = FlynnDashboard.secondaryView;
		if (view && view.isMounted() && view.constructor.displayName === "Views.AppEnv" && view.props.appId === event.appId && view.state.isSaving) {
			var params = Marbles.QueryParams.deserializeParams(Marbles.history.path);
			Marbles.history.navigate(Marbles.history.pathWithParams("/apps/:id", Marbles.QueryParams.replaceParams(params, {id: event.appId})));
		}
	},

	__handleAppDeleted: function (event) {
		// exit app delete view when successfully deleted
		var view = FlynnDashboard.secondaryView;
		if (view && view.isMounted() && view.constructor.displayName === "Views.AppDelete" && view.props.appId === event.appId && view.state.isDeleting) {
			Marbles.history.navigate("");
		}
	}

}))();

appsRouter.dispatcherIndex = FlynnDashboard.Dispatcher.register(
	appsRouter.handleEvent.bind(appsRouter)
);

})();
