/** @jsx React.DOM */
//= require ../stores/github-pulls
//= require ../actions/github-pulls
//= require ./github-pull
//= require ScrollPagination

(function () {

"use strict";

var GithubPullsStore = FlynnDashboard.Stores.GithubPulls;
var GithubPullsActions = FlynnDashboard.Actions.GithubPulls;

var ScrollPagination = window.ScrollPagination;

function getPullsStoreId (props) {
	return {
		ownerLogin: props.ownerLogin,
		repoName: props.repoName
	};
}

function getState (props) {
	var state = {
		pullsStoreId: getPullsStoreId(props)
	};

	var pullsState = GithubPullsStore.getState(state.pullsStoreId);
	state.pullsEmpty = pullsState.empty;
	state.pullsPages = pullsState.pages;
	state.pullsHasPrevPage = !!pullsState.prevPageParams;
	state.pullsHasNextPage = !!pullsState.nextPageParams;

	return state;
}

FlynnDashboard.Views.GithubPulls = React.createClass({
	displayName: "Views.GithubPulls",

	render: function () {
		var handlePageEvent = this.__handlePageEvent;

		return (
			<section className="github-pulls">
				<ScrollPagination
					ref="scrollPagination"
					hasPrevPage={this.state.pullsHasPrevPage}
					hasNextPage={this.state.pullsHasNextPage}
					unloadPage={GithubPullsActions.unloadPageId.bind(null, this.state.pullsStoreId)}
					loadPrevPage={GithubPullsActions.fetchPrevPage.bind(null, this.state.pullsStoreId)}
					loadNextPage={GithubPullsActions.fetchNextPage.bind(null, this.state.pullsStoreId)}>

					{this.state.pullsEmpty ? (
						<p className="placeholder">There are no open pull requests</p>
					) : null}

					{this.state.pullsPages.map(function (page) {
						return (
							<ScrollPagination.Page
								key={page.id}
								id={page.id}
								onPageEvent={handlePageEvent}
								component={React.DOM.ul}>

								{page.pulls.map(function (pull) {
									return (
										<li key={pull.id}>
											<PullRequest pull={pull} pullsStoreId={this.state.pullsStoreId} />
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
		GithubPullsStore.addChangeListener(this.state.pullsStoreId, this.__handleStoreChange);
	},

	componentWillReceiveProps: function (props) {
		var oldPullsStoreId = this.state.pullsStoreId;
		var newPullsStoreId = getPullsStoreId(props);
		if ( !Marbles.Utils.assertEqual(oldPullsStoreId, newPullsStoreId) ) {
			GithubPullsStore.removeChangeListener(oldPullsStoreId, this.__handleStoreChange);
			GithubPullsStore.addChangeListener(newPullsStoreId, this.__handleStoreChange);
			this.__handleStoreChange(props);
		}
	},

	componentWillUnmount: function () {
		GithubPullsStore.removeChangeListener(this.state.pullsStoreId, this.__handleStoreChange);
	},

	__handleStoreChange: function (props) {
		this.setState(getState(props || this.props));
	},

	__handlePageEvent: function (pageId, event) {
		this.refs.scrollPagination.handlePageEvent(pageId, event);
	}
});

var PullRequest = React.createClass({
	displayName: "Views.GithubPulls PullRequest",

	render: function () {
		return (
			<FlynnDashboard.Views.GithubPull pull={this.props.pull}>
				<div className="launch-btn-container">
					<button className="launch-btn" onClick={this.__handleLaunchBtnClick}>Launch</button>
				</div>
			</FlynnDashboard.Views.GithubPull>
		);
	},

	__handleLaunchBtnClick: function (e) {
		e.preventDefault();
		GithubPullsActions.launchPull(this.props.pullsStoreId, this.props.pull);
	}
});

})();
