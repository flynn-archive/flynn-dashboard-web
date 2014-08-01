/** @jsx React.DOM */
//= require ../stores/github-user
//= require ../stores/github-repos
//= require ./helpers/getPath
//= require ./route-link

(function () {

"use strict";

var GithubUserStore = FlynnDashboard.Stores.GithubUser;
var GithubReposStore = FlynnDashboard.Stores.GithubRepos;

var userStoreId = "default";

var getPath = FlynnDashboard.Views.Helpers.getPath;

function getRepoStoreId(props) {
	return {
		org: props.selectedSource,
		type: props.selectedType
	};
}

function getState(props) {
	var state = {};

	state.reposStoreId = getRepoStoreId(props);

	state.repos = GithubReposStore.getState(state.reposStoreId).repos;

	return state;
}

function getTypesState() {
	var state = {};

	state.user = GithubUserStore.getState(userStoreId).user;

	return state;
}

FlynnDashboard.Views.GithubRepos = React.createClass({
	displayName: "Views.GithubRepos",

	render: function () {
		return (
			<ul className="github-repos">
				<li className="github-repo-types">
					<Types selectedType={this.props.selectedType} selectedSource={this.props.selectedSource} />
				</li>

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
		var oldRepoStoreId = this.state.reposStoreId;
		var newRepoStoreId = getRepoStoreId(props);
		if (oldRepoStoreId !== newRepoStoreId) {
			GithubReposStore.removeChangeListener(oldRepoStoreId, this.__handleStoreChange);
			GithubReposStore.addChangeListener(newRepoStoreId, this.__handleStoreChange);
		}
		this.setState(getState(props));
	},

	componentWillUnmount: function () {
		GithubReposStore.removeChangeListener(this.state.reposStoreId, this.__handleStoreChange);
	},

	__handleStoreChange: function () {
		this.setState(getState(this.props));
	}
});

var Types = React.createClass({
	displayName: "Views.GithubRepos - Types",

	render: function () {
		var user = this.state.user;
		return (
			<ul>
				<li className={this.props.selectedType === null ? "selected" : null}>
					<FlynnDashboard.Views.RouteLink path={getPath([{ type: null }])}>
						{this.props.selectedSource || (user ? user.login : "")}
					</FlynnDashboard.Views.RouteLink>
				</li>

				{this.props.selectedSource ? null : (
					<li className={this.props.selectedType === "star" ? "selected" : null}>
						<FlynnDashboard.Views.RouteLink path={getPath([{ type: "star" }])}>
							starred
						</FlynnDashboard.Views.RouteLink>
					</li>
				)}

				<li className={this.props.selectedType === "fork" ? "selected" : null}>
					<FlynnDashboard.Views.RouteLink path={getPath([{ type: "fork" }])}>
						forked
					</FlynnDashboard.Views.RouteLink>
				</li>
			</ul>
		);
	},

	getInitialState: function () {
		return getTypesState(this.props);
	},

	componentDidMount: function () {
		GithubUserStore.addChangeListener(userStoreId, this.__handleStoreChange);
	},

	componentWillReceiveProps: function (props) {
		this.setState(getTypesState(props));
	},

	componentWillUnmount: function () {
		GithubUserStore.removeChangeListener(userStoreId, this.__handleStoreChange);
	},

	__handleStoreChange: function () {
		this.setState(getTypesState(this.props));
	}
});

})();
