/** @jsx React.DOM */

(function () {

"use strict";

FlynnDashboard.Views.ExternalLink = React.createClass({
	displayName: "Views.ExternalLink",

	handleClick: function (e) {
		if (e.ctrlKey || e.metaKey || e.shiftKey) {
			return;
		}
		e.preventDefault();
		window.open(this.props.href);
	},

	render: function () {
		return (
			<a href={this.props.href} onClick={this.handleClick} title={this.props.title}>{this.props.children}</a>
		);
	}
});

})();
