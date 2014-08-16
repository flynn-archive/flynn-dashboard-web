(function () {

"use strict";

var AppResources = FlynnDashboard.Stores.AppResources = Marbles.Store.createClass({
	displayName: "Stores.AppResources",

	getState: function () {
		return this.state;
	},

	willInitialize: function () {
		this.props = {
			appId: this.id.appId
		};
	},

	didInitialize: function () {},

	didBecomeActive: function () {
		this.__fetchResources();
	},

	didBecomeInactive: function () {
		this.constructor.discardInstance(this);
	},

	getInitialState: function () {
		return {
			resources: [],
			fetched: false
		};
	},

	handleEvent: function () {
	},

	__fetchResources: function () {
		return FlynnDashboard.client.getAppResources(this.props.appId).then(function (args) {
			var res = args[0];
			this.setState({
				resources: res,
				fetched: true
			});
		}.bind(this));
	}

}, Marbles.State);

AppResources.registerWithDispatcher(FlynnDashboard.Dispatcher);

})();
