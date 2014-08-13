/** @jsx React.DOM */
//= require ../stores/github-commit
//= require ./github-commit
//= require ./edit-env
//= require Modal

(function () {

"use strict";

var GithubCommitStore = FlynnDashboard.Stores.GithubCommit;

var Modal = window.Modal;

function getCommitStoreId (props) {
	return {
		ownerLogin: props.ownerLogin,
		repoName: props.repoName,
		sha: props.sha
	};
}

function getState (props) {
	var state = {
		commitStoreId: getCommitStoreId(props)
	};

	state.commit = GithubCommitStore.getState(state.commitStoreId).commit;

	state.launchDisabled = !state.commit;

	return state;
}

FlynnDashboard.Views.GithubDeploy = React.createClass({
	displayName: "Views.GithubDeploy",

	render: function () {
		var commit = this.state.commit;
		return (
			<Modal visible={true} onHide={this.props.onHide} className="github-deploy">
				<header>
					<h1>Launch app</h1>
					<h2>
						{this.props.ownerLogin +"/"+ this.props.repoName +":"+ this.props.branchName}
					</h2>
					{commit ? (
						<FlynnDashboard.Views.GithubCommit commit={commit} />
					) : null}
				</header>

				<label>
					<span className="name">Name</span>
					<input type="text" value={this.state.name} onChange={this.__handleNameChange} />
				</label>

				<label>
					<span className="name">Postgres</span>
					<input type="checkbox" checked={this.state.db} onChange={this.__handleDbChange} />
				</label>

				<FlynnDashboard.Views.EditEnv env={this.state.env} onChange={this.__handleEnvChange} />

				<button className="launch-btn" disabled={this.state.launchDisabled}>Launch app</button>
			</Modal>
		);
	},

	getInitialState: function () {
		return Marbles.Utils.extend(getState(this.props), {
			name: this.__formatName([this.props.ownerLogin, this.props.repoName, this.props.branchName].join("-")),
			db: false,
			env: {}
		});
	},

	componentDidMount: function () {
		GithubCommitStore.addChangeListener(this.state.commitStoreId, this.__handleStoreChange);
	},

	componentWillReceiveProps: function (props) {
		var prevCommitStoreId = this.state.commitStoreId;
		var nextCommitStoreId = getCommitStoreId(props);
		if ( !Marbles.Utils.assertEqual(prevCommitStoreId, nextCommitStoreId) ) {
			GithubCommitStore.removeChangeListener(prevCommitStoreId, this.__handleStoreChange);
			GithubCommitStore.addChangeListener(nextCommitStoreId, this.__handleStoreChange);
			this.__handleStoreChange(props);
		}
	},

	componentWillUnmount: function () {
		GithubCommitStore.removeChangeListener(this.state.commitStoreId, this.__handleStoreChange);
	},

	__handleStoreChange: function (props) {
		this.setState(getState(props || this.props));
	},

	__handleNameChange: function (e) {
		var name = e.target.value;
		this.setState({
			name: this.__formatName(name)
		});
	},

	__handleDbChange: function (e) {
		var db = e.target.checked;
		this.setState({
			db: db
		});
	},

	__handleEnvChange: function (env) {
		this.setState({
			env: env
		});
	},

	__formatName: function (name) {
		name = name.replace(/[^-a-z\d]/gi, '').replace(/^[^a-z\d]/i, '');
		name = name.toLowerCase().substr(0, 30);
		return name;
	}
});

})();
