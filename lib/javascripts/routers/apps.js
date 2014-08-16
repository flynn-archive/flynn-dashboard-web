//= require ../dispatcher
//= require ../views/app
//= require ../views/app-env
//= require ../views/app-logs
//= require ../views/app-delete
//= require ../views/app-route-new
//= require ../views/app-route-delete

(function () {

"use strict";

var appsRouter = FlynnDashboard.routers.apps = new (Marbles.Router.createClass({
	displayName: "routers.apps",

	routes: [
		{ path: "apps/:id", handler: "app" },
		{ path: "apps/:id/env", handler: "appEnv", secondary: true },
		{ path: "apps/:id/logs", handler: "appLogs", secondary: true },
		{ path: "apps/:id/delete", handler: "appDelete", secondary: true },
		{ path: "apps/:id/routes/new", handler: "newAppRoute", secondary: true },
		{ path: "apps/:id/routes/:route/delete", handler: "appRouteDelete", secondary: true }
	],

	beforeHandler: function (event) {
		// don't discard store between handlers
		var appId = event.params[0].id;
		if (appId) {
			FlynnDashboard.Stores.App.expectChangeListener({ appId: appId });
			FlynnDashboard.Stores.AppRoutes.expectChangeListener({ appId: appId });
			FlynnDashboard.Stores.AppResources.expectChangeListener({ appId: appId });
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
					Marbles.QueryParams.replaceParams.apply(null, [[Marbles.Utils.extend({}, params)]].concat(subpathParams || [])));
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

	appLogs: function (params) {
		params = params[0];

		FlynnDashboard.secondaryView = React.renderComponent(
			FlynnDashboard.Views.AppLogs({
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

	newAppRoute: function (params) {
		params = params[0];

		FlynnDashboard.secondaryView = React.renderComponent(
			FlynnDashboard.Views.NewAppRoute({
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

	appRouteDelete: function (params) {
		params = params[0];

		FlynnDashboard.secondaryView = React.renderComponent(
			FlynnDashboard.Views.AppRouteDelete({
				appId: params.id,
				routeId: params.route,
				domain: params.domain,
				onHide: function () {
					var path = Marbles.history.pathWithParams("/apps/:id", Marbles.QueryParams.replaceParams([Marbles.Utils.extend({}, params)], {route: null, domain:null}));
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

			case "APP_ROUTES:CREATED":
				this.__handleAppRouteCreated(event);
			break;

			case "APP_ROUTES:CREATE_FAILED":
				this.__handleAppRouteCreateFailure(event);
			break;

			case "APP_ROUTES:DELETED":
				this.__handleAppRouteDeleted(event);
			break;

			case "APP_ROUTES:DELETE_FAILED":
				this.__handleAppRouteDeleteFailure(event);
			break;
		}
	},

	__handleReleaseCreated: function (event) {
		// exit app env view when successfully saved
		var view = FlynnDashboard.secondaryView;
		if (view && view.isMounted() && view.constructor.displayName === "Views.AppEnv" && view.props.appId === event.appId && view.state.isSaving) {
			this.__navigateToApp(event);
		}
	},

	__handleAppDeleted: function (event) {
		// exit app delete view when successfully deleted
		var view = FlynnDashboard.secondaryView;
		if (view && view.isMounted() && view.constructor.displayName === "Views.AppDelete" && view.props.appId === event.appId && view.state.isDeleting) {
			Marbles.history.navigate("");
		}
	},

	__handleAppRouteCreated: function (event) {
		// exit app rotue delete view when successfully deleted
		var view = FlynnDashboard.secondaryView;
		if (view && view.isMounted() && view.constructor.displayName === "Views.NewAppRoute" && view.props.appId === event.appId && view.state.isCreating) {
			this.__navigateToApp(event);
		}
	},

	__handleAppRouteCreateFailure: function (event) {
		var view = FlynnDashboard.secondaryView;
		if (view && view.isMounted() && view.constructor.displayName === "Views.AppRouteDelete" && view.props.appId === event.appId && view.state.isDeleting) {
			view.setProps({
				errorMsg: event.errorMsg
			});
		}
	},

	__handleAppRouteDeleted: function (event) {
		// exit app rotue delete view when successfully deleted
		var view = FlynnDashboard.secondaryView;
		if (view && view.isMounted() && view.constructor.displayName === "Views.AppRouteDelete" && view.props.appId === event.appId && view.props.routeId === event.routeId && view.state.isDeleting) {
			this.__navigateToApp(event, {route: null, domain: null});
		}
	},

	__handleAppRouteDeleteFailure: function (event) {
		var view = FlynnDashboard.secondaryView;
		if (view && view.isMounted() && view.constructor.displayName === "Views.AppRouteDelete" && view.props.appId === event.appId && view.props.routeId === event.routeId && view.state.isDeleting) {
			view.setProps({
				errorMsg: event.errorMsg
			});
		}
	},

	__navigateToApp: function (event, __params) {
		var params = Marbles.QueryParams.deserializeParams(Marbles.history.path.split("?")[1] || "");
		params = Marbles.QueryParams.replaceParams(params, Marbles.Utils.extend({id: event.appId}, __params));
		Marbles.history.navigate(Marbles.history.pathWithParams("/apps/:id", params));
	}

}))();

appsRouter.dispatcherIndex = FlynnDashboard.Dispatcher.register(
	appsRouter.handleEvent.bind(appsRouter)
);

})();
