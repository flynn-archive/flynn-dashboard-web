/** @jsx React.DOM */
//= require ../stores/github-commits
//= require ../actions/github-commits
//= require ./helpers/findScrollParent
//= require ./external-link
//= require ./timestamp
//= require ScrollPagination

(function () {

"use strict";

var GithubCommitsStore = FlynnDashboard.Stores.GithubCommits;
var GithubCommitsActions = FlynnDashboard.Actions.GithubCommits;

var ScrollPagination = window.ScrollPagination;
var ExternalLink = FlynnDashboard.Views.ExternalLink;
var Timestamp = FlynnDashboard.Views.Timestamp;

var findScrollParent = FlynnDashboard.Views.Helpers.findScrollParent;

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
										<li key={commit.sha}>
											<Commit commit={commit} />
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

	componentDidUpdate: function (prevProps, prevState) {
		var oldCommitsStoreId = prevState.commitsStoreId;
		var newCommitsStoreId = this.state.commitsStoreId;
		if (prevState.commitsPages.length === 1 || !Marbles.Utils.assertEqual(oldCommitsStoreId, newCommitsStoreId)) {
			this.__scrollToBottom();
		}
	},

	componentWillReceiveProps: function (props) {
		var oldCommitsStoreId = this.state.commitsStoreId;
		var newCommitsStoreId = getCommitsStoreId(props);
		if ( !Marbles.Utils.assertEqual(oldCommitsStoreId, newCommitsStoreId) ) {
			GithubCommitsStore.removeChangeListener(oldCommitsStoreId, this.__handleStoreChange);
			this.__handleStoreChange(props);
			GithubCommitsStore.addChangeListener(newCommitsStoreId, this.__handleStoreChange);
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

	__scrollToBottom: function () {
		var scrollParent = findScrollParent(this.getDOMNode());
		scrollParent.scrollTop = scrollParent.scrollHeight;
	}
});

var Commit = React.createClass({
	displayName: "Views.GithubCommitSelector",

	render: function () {
		var commit = this.props.commit;

		var authorAvatarURL = commit.author.avatarURL;
		var authorAvatarURLParams;
		var authorAvatarURLParts;
		if (authorAvatarURL) {
			authorAvatarURLParts = authorAvatarURL.split("?");
			authorAvatarURLParams = Marbles.QueryParams.deserializeParams(authorAvatarURLParts[1] || "");
			authorAvatarURLParams = Marbles.QueryParams.replaceParams(authorAvatarURLParams, {
				size: 50
			});
			authorAvatarURL = authorAvatarURLParts[0] + Marbles.QueryParams.serializeParams(authorAvatarURLParams);
		}

		return (
			<article className="github-commit">
				<img className="avatar" src={authorAvatarURL} />
				<div className="body">
					<div className="message">{commit.message.split("\n")[0]}</div>
					<div>
						<span className="name">
							{commit.author.name}
						</span>
						<span className="timestamp">
							<ExternalLink href={commit.githubURL}>
								<Timestamp timestamp={commit.createdAt} />
							</ExternalLink>
						</span>
					</div>
				</div>
			</article>
		);
	}
});

})();
