/** @jsx React.DOM */
//= require ./app-controls

(function () {

"use strict";

FlynnDashboard.Views.App = React.createClass({
	displayName: "Views.App",

	render: function () {
		return (
			<section>
				<section className="panel">
					<FlynnDashboard.Views.AppControls
						appId={this.props.appId}
						getAppPath={this.props.getAppPath} />
				</section>
			</section>
		);
	}
});

})();
