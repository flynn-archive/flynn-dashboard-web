/** @jsx React.DOM */
//= require ./input
//= require ./models/login

(function () {

"use strict";

var Input = FlynnDashboard.Views.Input;
var LoginModel = FlynnDashboard.Views.Models.Login;

FlynnDashboard.Views.Login = React.createClass({
	displayName: "FlynnDashboard.Views.Login",

	componentDidMount: function () {
		LoginModel.addChangeListener(this.__handleLoginModelChange);
	},

	componentWillUnmount: function () {
		LoginModel.removeChangeListener(this.__handleLoginModelChange);
	},

	render: function () {
		return (
			<section>
				<header>
					<h1>Log in</h1>
				</header>

				<form className="login-form" noValidate={true} onSubmit={this.__handleSubmit}>
					<Input ref="email" type="email" name="email" label="Email" valueLink={LoginModel.getValueLink("email")} />

					<Input ref="passphrase" type="password" name="passphrase" label="Passphrase" valueLink={LoginModel.getValueLink("passphrase")} />

					<button type="submit" disabled={this.__isSubmitDisabled()}>Login</button>
				</form>
			</section>
		);
	},

	__isSubmitDisabled: function () {
		return !LoginModel.isValid() && !LoginModel.isPersisting();
	},

	__handleLoginModelChange: function () {
		this.forceUpdate();
	},

	__handleSubmit: function (e) {
		e.preventDefault();
		this.refs.email.setChanging(false);
		this.refs.passphrase.setChanging(false);
		LoginModel.performLogin().then(this.props.onSuccess, function(){});
	}
});

})();
