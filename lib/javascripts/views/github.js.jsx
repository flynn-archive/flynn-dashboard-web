/** @jsx React.DOM */
//= require ./github-sources
//= require ./github-repos

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
					<FlynnDashboard.Views.GithubSources
						selectedSource={this.props.selectedSource} />
				</section>

				<section className="panel-row">
					<section className="github-repos-panel">
						<FlynnDashboard.Views.GithubRepos
							selectedSource={this.props.selectedSource}
							selectedType={this.props.selectedType} />
					</section>

					<section className="panel">
						<span className="placeholder">Select a repo on the left to get started</span>
					</section>
				</section>
			</section>
		);
	}
});

})();
