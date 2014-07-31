(function () {

"use strict";

FlynnDashboard.Client = Marbles.Utils.createClass({
	displayName: "Client",

	mixins: [{
		ctor: {
			middleware: [
				Marbles.HTTP.Middleware.SerializeJSON,
				Marbles.HTTP.Middleware.WithCredentials
			]
		}
	}],

	willInitialize: function (endpoints) {
		this.endpoints = endpoints;
	},

	performRequest: function (method, args) {
		if ( !args.url ) {
				var err = new Error(this.constructor.displayName +".prototype.performRequest(): Can't make request without URL");
			setTimeout(function () {
				throw err;
			}.bind(this), 0);
			return Promise.reject(err);
		}

		var middleware = args.middleware || [];
		delete args.middleware;

		return Marbles.HTTP(Marbles.Utils.extend({
			method: method,
			middleware: [].concat(this.constructor.middleware).concat(middleware),
		}, args)).then(function (args) {
			var res = args[0];
			var xhr = args[1];
			return new Promise(function (resolve, reject) {
				if (xhr.status >= 200 && xhr.status < 400) {
					resolve([res, xhr]);
				} else {
					if (xhr.status === 401) {
						FlynnDashboard.config.fetch();
					}

					reject([res, xhr]);
				}
			});
		});
	},

	login: function (email, passphrase) {
		return this.performRequest('POST', {
			url: this.endpoints.login,
			body: {
				email: email,
				passphrase: passphrase
			},
			headers: {
				'Content-Type': 'application/json'
			}
		}).then(function (args) {
			return FlynnDashboard.config.fetch().then(function () {
				return args;
			});
		});
	}
});

})();
