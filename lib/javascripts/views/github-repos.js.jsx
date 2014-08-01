/** @jsx React.DOM */
//= require ../stores/github-repos
//= require ./helpers/getPath
//= require ./route-link

(function () {

"use strict";

var GithubReposStore = FlynnDashboard.Stores.GithubRepos;

var getPath = FlynnDashboard.Views.Helpers.getPath;

function getState() {
	var state = {};

	state.reposStoreId = "default";

	state.repos = GithubReposStore.getState(state.reposStoreId).repos;

	return state;
}

FlynnDashboard.Views.GithubRepos = React.createClass({
	displayName: "Views.GithubRepos",

	render: function () {
		return (
			<ul className="github-repos">
				{this.state.repos.map(function (repo) {
					return (
						<li key={repo.id}>
							<FlynnDashboard.Views.RouteLink path={getPath([{ repo: repo.name, owner: repo.ownerLogin }])}>
								<h2>
									{repo.name} <small>{repo.language}</small>
								</h2>
								<p>{repo.description}</p>
							</FlynnDashboard.Views.RouteLink>
						</li>
					);
				}, this)}
			</ul>
		);
	},

	getInitialState: function () {
		return getState(this.props);
	},

	componentDidMount: function () {
		GithubReposStore.addChangeListener(this.state.reposStoreId, this.__handleStoreChange);
	},

	componentWillReceiveProps: function (props) {
		this.setState(getState(props));
	},

	componentWillUnmount: function () {
		GithubReposStore.removeChangeListener(this.state.reposStoreId, this.__handleStoreChange);
	},

	__handleStoreChange: function () {
		this.setState(getState(this.props));
	}
});

})();
