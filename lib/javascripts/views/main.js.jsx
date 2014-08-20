/** @jsx React.DOM */
//= require ./apps-list
//= require ./route-link

(function () {

"use strict";

FlynnDashboard.Views.Main = React.createClass({
	displayName: "Views.Main",

	render: function () {
		return (
			<section className="panel">
				<section>
					<FlynnDashboard.Views.AppsList />
				</section>

				<section className="clearfix">
					<FlynnDashboard.Views.RouteLink
						className="btn-green float-right"
						path="/github">
							{this.props.githubAuthed ? (
								"Add Services"
							) : (
								<span className="connect-with-github">
									<i className="icn-github-mark" />
									Connect with Github
								</span>
							)}
					</FlynnDashboard.Views.RouteLink>
				</section>
			</section>
		);
	}
});

})();
