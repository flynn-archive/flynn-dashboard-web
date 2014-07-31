/** @jsx React.DOM */
//= require ./github-sources

(function () {

"use strict";

FlynnDashboard.Views.Github = React.createClass({
	displayName: "Views.Github",

	render: function () {
		return (
			<section>
				<header className="page-header">
					<h1>GitHub repos</h1>
				</header>

				<section className="panel">
					<FlynnDashboard.Views.GithubSources selectedSource={this.props.selectedSource} />
				</section>
			</section>
		);
	}
});

})();
