//= require ../views/app

(function () {

"use strict";

FlynnDashboard.routers.apps = new (Marbles.Router.createClass({
	displayName: "routers.apps",

	routes: [
		{ path: "apps/:id", handler: "app" },
	],

	app: function (params) {
		params = params[0];
		React.renderComponent(
			FlynnDashboard.Views.App({
				appId: params.id,
				getAppPath: function (subpath, subpathParams) {
					return Marbles.history.pathWithParams(
						"/apps/:id"+ subpath,
						Marbles.QueryParams.replaceParams.apply(null, [params].concat(subpathParams || [])));
				}
			}),
			FlynnDashboard.el);
	}

}))();

})();
