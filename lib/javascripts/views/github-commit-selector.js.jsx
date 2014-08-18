/** @jsx React.DOM */
//= require ../stores/github-commits
//= require ../actions/github-commits
//= require ./helpers/findScrollParent
//= require ./external-link
//= require ./timestamp
//= require ./github-commit
//= require ScrollPagination

(function () {

"use strict";

var GithubCommitsStore = FlynnDashboard.Stores.GithubCommits;
var GithubCommitsActions = FlynnDashboard.Actions.GithubCommits;

var ScrollPagination = window.ScrollPagination;

function getCommitsStoreId (props) {
	return {
		ownerLogin: props.ownerLogin,
		repoName: props.repoName,
		branch: props.selectedBranchName
	};
}

function getState (props) {
	var state = {
		commitsStoreId: getCommitsStoreId(props)
	};

	var commitsState = GithubCommitsStore.getState(state.commitsStoreId);
	state.commitsEmpty = commitsState.empty;
	state.commitsPages = commitsState.pages;
	state.commitsHasPrevPage = !!commitsState.prevPageParams;
	state.commitsHasNextPage = !!commitsState.nextPageParams;

	return state;
}

FlynnDashboard.Views.GithubCommitSelector = React.createClass({
	displayName: "Views.GithubCommitSelector",

	render: function () {
		var handlePageEvent = this.__handlePageEvent;
		var Commit = this.props.commitComponent || FlynnDashboard.Views.GithubCommit;

		var deployedSha = this.props.deployedSha;
		var selectedSha = this.props.selectedSha;
		var selectableCommits = !!this.props.selectableCommits;

		return (
			<section className="github-commits">
				<ScrollPagination
					ref="scrollPagination"
					hasPrevPage={this.state.commitsHasPrevPage}
					hasNextPage={this.state.commitsHasNextPage}
					unloadPage={GithubCommitsActions.unloadPageId.bind(null, this.state.commitsStoreId)}
					loadPrevPage={GithubCommitsActions.fetchPrevPage.bind(null, this.state.commitsStoreId)}
					loadNextPage={GithubCommitsActions.fetchNextPage.bind(null, this.state.commitsStoreId)}>

					{this.state.commitsEmpty ? (
						<p className="placeholder">There are no commits</p>
					) : null}

					{this.state.commitsPages.map(function (page) {
						return (
							<ScrollPagination.Page
								key={page.id}
								id={page.id}
								onPageEvent={handlePageEvent}
								component={React.DOM.ul}>

								{page.commits.map(function (commit) {
									return (
										<li key={commit.sha} className={commit.sha === deployedSha ? "deployed" : ""}>
											<Commit
												commit={commit}
												selectable={selectableCommits}
												selected={commit.sha === selectedSha}
												commitsStoreId={this.state.commitsStoreId}
												onSelect={this.__handleCommitSelected} />
										</li>
									);
								}, this)}
							</ScrollPagination.Page>
						);
					}, this)}
				</ScrollPagination>
			</section>
		);
	},

	getInitialState: function () {
		return getState(this.props);
	},

	componentDidMount: function () {
		GithubCommitsStore.addChangeListener(this.state.commitsStoreId, this.__handleStoreChange);
	},

	componentWillReceiveProps: function (props) {
		var oldCommitsStoreId = this.state.commitsStoreId;
		var newCommitsStoreId = getCommitsStoreId(props);
		if ( !Marbles.Utils.assertEqual(oldCommitsStoreId, newCommitsStoreId) ) {
			GithubCommitsStore.removeChangeListener(oldCommitsStoreId, this.__handleStoreChange);
			GithubCommitsStore.addChangeListener(newCommitsStoreId, this.__handleStoreChange);
			this.__handleStoreChange(props);
		}
	},

	componentWillUnmount: function () {
		GithubCommitsStore.removeChangeListener(this.state.commitsStoreId, this.__handleStoreChange);
	},

	__handleStoreChange: function (props) {
		this.setState(getState(props || this.props));
	},

	__handlePageEvent: function (pageId, event) {
		this.refs.scrollPagination.handlePageEvent(pageId, event);
	},

	__handleCommitSelected: function (commit) {
		GithubCommitsActions.commitSelected(this.state.commitsStoreId, commit.sha);
	}
});

})();
