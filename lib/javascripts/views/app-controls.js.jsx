/** @jsx React.DOM */
//= require ../stores/app
//= require ./app-processes
//= require ./route-link

(function () {

"use strict";

var AppStore = FlynnDashboard.Stores.App;

var RouteLink = FlynnDashboard.Views.RouteLink;

function getAppStoreId (props) {
	return {
		appId: props.appId
	};
}

function getState (props) {
	var state = {
		appStoreId: getAppStoreId(props)
	};

	var appState = AppStore.getState(state.appStoreId);
	state.app = appState.app;
	state.formation = appState.formation;

	return state;
}

FlynnDashboard.Views.AppControls = React.createClass({
	displayName: "Views.AppControls",

	render: function () {
		var app = this.state.app;
		var formation = this.state.formation;
		var getAppPath = this.props.getAppPath;

		if ( !app ) {
			return <section />;
		}

		return (
			<section className="app-controls">
				<header>
					<h1>
						{app.name}
					</h1>
				</header>

				{formation ? (
					<FlynnDashboard.Views.AppProcesses formation={formation} />
				) : null}
			</section>
		);
	},

	getInitialState: function () {
		return getState(this.props);
	},

	componentDidMount: function () {
		AppStore.addChangeListener(this.state.appStoreId, this.__handleStoreChange);
	},

	componentWillReceiveProps: function (nextProps) {
		var prevAppStoreId = this.state.appStoreId;
		var nextAppStoreId = getAppStoreId(nextProps);
		if ( !Marbles.Utils.assertEqual(prevAppStoreId, nextAppStoreId) ) {
			AppStore.removeChangeListener(prevAppStoreId, this.__handleStoreChange);
			AppStore.addChangeListener(nextAppStoreId, this.__handleStoreChange);
			this.__handleStoreChange(nextProps);
		}
	},

	componentWillUnmount: function () {
		AppStore.removeChangeListener(this.state.appStoreId, this.__handleStoreChange);
	},

	__handleStoreChange: function (props) {
		this.setState(getState(props || this.props));
	}
});

})();
