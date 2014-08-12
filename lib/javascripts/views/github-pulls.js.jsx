/** @jsx React.DOM */
//= require ../stores/github-pulls
//= require ../actions/github-pulls
//= require ./external-link
//= require ./timestamp
//= require ScrollPagination

(function () {

"use strict";

var GithubPullsStore = FlynnDashboard.Stores.GithubPulls;
var GithubPullsActions = FlynnDashboard.Actions.GithubPulls;

var ScrollPagination = window.ScrollPagination;
var ExternalLink = FlynnDashboard.Views.ExternalLink;
var Timestamp = FlynnDashboard.Views.Timestamp;

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
											<PullRequest pull={pull} />
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
		var pull = this.props.pull;

		var userAvatarURL = pull.user.avatarURL;
		var userAvatarURLParams;
		var userAvatarURLParts;
		if (userAvatarURL) {
			userAvatarURLParts = userAvatarURL.split("?");
			userAvatarURLParams = Marbles.QueryParams.deserializeParams(userAvatarURLParts[1] || "");
			userAvatarURLParams = Marbles.QueryParams.replaceParams(userAvatarURLParams, {
				size: 50
			});
			userAvatarURL = userAvatarURLParts[0] + Marbles.QueryParams.serializeParams(userAvatarURLParams);
		}

		return (
			<article className="github-pull">
				<img className="avatar" src={userAvatarURL} />
				<div className="body">
					<div className="message">
						<ExternalLink href={pull.githubUrl}>
							{pull.title} #{pull.number}
						</ExternalLink>
					</div>
					<div>
						<span className="name">
							{pull.user.login}
						</span>
						<span className="timestamp">
							<ExternalLink href={pull.url}>
								<Timestamp timestamp={pull.createdAt} />
								{pull.updatedAt !== pull.createdAt ? (
									<span>
										&nbsp;(Updated <Timestamp timestamp={pull.updatedAt} />)
									</span>
								) : null}
							</ExternalLink>
						</span>
					</div>
				</div>
			</article>
		);
	}
});

})();
