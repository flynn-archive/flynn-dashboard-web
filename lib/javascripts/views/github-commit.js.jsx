/** @jsx React.DOM */
//= require ./external-link
//= require ./timestamp

(function () {

"use strict";

var ExternalLink = FlynnDashboard.Views.ExternalLink;
var Timestamp = FlynnDashboard.Views.Timestamp;

FlynnDashboard.Views.GithubCommit = React.createClass({
	displayName: "Views.GithubCommit",

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
					<div className="message">
						{commit.message.split("\n")[0]}
					</div>
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
				{this.props.children}
			</article>
		);
	}
});

})();
