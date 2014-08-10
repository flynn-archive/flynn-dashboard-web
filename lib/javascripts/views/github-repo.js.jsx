/** @jsx React.DOM */
//= require ../stores/github-pulls
//= require ./github-pulls
//= require ./helpers/getPath
//= require ./route-link

(function () {

"use strict";

var getPath = FlynnDashboard.Views.Helpers.getPath;
var RouteLink = FlynnDashboard.Views.RouteLink;

FlynnDashboard.Views.GithubRepo = React.createClass({
	displayName: "Views.GithubRepo",

	render: function () {
		var selectedPanel = this.props.selectedPanel;
		if ( !selectedPanel ) {
			selectedPanel = "commits";
		}
		return (
			<section className="github-repo">
				<header>
					<h1>{this.props.ownerLogin +"/"+ this.props.name}</h1>

					<ul className="h-nav">
						<li className={selectedPanel === "commits" ? "selected" : null}>
							<RouteLink path={getPath([{ repo_panel: "commits" }])}>
								Commits
							</RouteLink>
						</li>
						<li className={selectedPanel === "pulls" ? "selected" : null}>
							<RouteLink path={getPath([{ repo_panel: "pulls" }])}>
								Pull Requests
							</RouteLink>
						</li>
					</ul>
				</header>

				{selectedPanel === "commits" ? (
					<p>TODO: commits scroll view and branch selector</p>
				) : null}

				{selectedPanel === "pulls" ? (
					<FlynnDashboard.Views.GithubPulls ownerLogin={this.props.ownerLogin} name={this.props.name} />
				) : null}
			</section>
		);
	}
});

})();
