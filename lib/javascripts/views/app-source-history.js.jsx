/** @jsx React.DOM */
//= require ../stores/github-repo
//= require ../actions/app-source-history
//= require ./github-branch-selector

(function () {

"use strict";

var GithubRepoStore = FlynnDashboard.Stores.GithubRepo;

var AppSourceHistoryActions = FlynnDashboard.Actions.AppSourceHistory;

function getRepoStoreId (props) {
	var meta = props.app.meta;
	return {
		ownerLogin: meta.user_login,
		name: meta.repo_name
	};
}

function getState (props) {
	var state = {
		repoStoreId: getRepoStoreId(props)
	};

	state.repo = GithubRepoStore.getState(state.repoStoreId).repo;

	return state;
}

FlynnDashboard.Views.AppSourceHistory = React.createClass({
	displayName: "Views.AppSourceHistory",

	render: function () {
		var app = this.props.app;
		var meta = app.meta;
		var repo = this.state.repo;

		var ownerLogin = meta.user_login;
		var repoName = meta.repo_name;
		var selectedSha = this.props.selectedSha || meta.sha;
		var selectedBranchName = this.props.selectedBranchName || meta.ref;

		var deployBtnDisabled = true;
		if (selectedSha !== meta.sha) {
			deployBtnDisabled = false;
		}

		return (
			<div className="app-source-history">
				<header>
					<h2>Source history</h2>
				</header>

				<FlynnDashboard.Views.GithubBranchSelector
					ownerLogin={ownerLogin}
					repoName={repoName}
					selectedBranchName={selectedBranchName}
					defaultBranchName={repo ? repo.defaultBranch : null}/>

				<FlynnDashboard.Views.GithubCommitSelector
					ownerLogin={ownerLogin}
					repoName={repoName}
					selectedBranchName={selectedBranchName}
					selectableCommits={true}
					selectedSha={selectedSha}
					deployedSha={meta.sha} />

				<div className="deploy-btn-container">
					<button className="btn-green" disabled={deployBtnDisabled} onClick={this.__handleDeployBtnClick}>Deploy</button>
				</div>
			</div>
		);
	},

	getInitialState: function () {
		return getState(this.props);
	},

	componentDidMount: function () {
		GithubRepoStore.addChangeListener(this.state.repoStoreId, this.__handleStoreChange);
	},

	componentWillReceiveProps: function (props) {
		var oldRepoStoreId = this.state.repoStoreId;
		var newRepoStoreId = getRepoStoreId(props);
		if ( !Marbles.Utils.assertEqual(oldRepoStoreId, newRepoStoreId) ) {
			GithubRepoStore.removeChangeListener(oldRepoStoreId, this.__handleStoreChange);
			GithubRepoStore.addChangeListener(newRepoStoreId, this.__handleStoreChange);
			this.__handleStoreChange(props);
		}
	},

	componentWillUnmount: function () {
		GithubRepoStore.removeChangeListener(this.state.repoStoreId, this.__handleStoreChange);
	},

	__handleStoreChange: function (props) {
		this.setState(getState(props || this.props));
	},

	__handleDeployBtnClick: function (e) {
		e.preventDefault();
		if ( !this.props.selectedSha ) {
			return;
		}
		var app = this.props.app;
		var meta = app.meta;
		AppSourceHistoryActions.confirmDeployCommit(this.props.appId, meta.user_login, meta.repo_name, this.props.selectedBranchName || meta.ref, this.props.selectedSha);
	}
});

})();
