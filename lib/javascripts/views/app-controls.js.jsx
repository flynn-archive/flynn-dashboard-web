/** @jsx React.DOM */
//= require ../stores/app
//= require ./app-processes
//= require ./app-routes
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
						<RouteLink path={getAppPath("/delete")}>
							<i className="icn-trash" />
						</RouteLink>
					</h1>
				</header>

				<section className="flex-row">
					<section className="col">
						<RouteLink path={getAppPath("/env")} className="btn-green">
							App environment
						</RouteLink>

						{formation ? (
							<FlynnDashboard.Views.AppProcesses formation={formation} />
						) : (
							<section className="app-processes">
								&nbsp;
							</section>
						)}

						<RouteLink path={getAppPath("/logs")} className="logs-btn">
							Show logs
						</RouteLink>
					</section>

					<section className="col">
						<FlynnDashboard.Views.AppRoutes
							appId={this.props.appId}
							getAppPath={this.props.getAppPath} />
					</section>
				</section>
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
