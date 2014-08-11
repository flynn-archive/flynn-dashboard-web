(function () {
"use strict";

FlynnDashboard.Stores.GithubPulls = Marbles.Store.createClass({
	displayName: "Stores.GithubRepo",

	getState: function () {
		return this.state;
	},

	willInitialize: function () {
		this.props = this.id;
	},

	getInitialState: function () {
		return {
			empty: false,
			pages: []
		};
	},

	didBecomeActive: function () {
		this.__fetchPulls({ operation: "append" });
	},

	didBecomeInactive: function () {
		this.constructor.discardInstance(this);
	},

	handleEvent: function (event) {
		switch (event.name) {
			case "GITHUB_PULLS:UNLAOD_PAGE_ID":
				this.__unloadPageId(event.pageId);
			break;

			case "GITHUB_PULLS:FETCH_PREV_PAGE":
				this.__fetchPrevPage();
			break;

			case "GITHUB_PULLS:FETCH_NEXT_PAGE":
				this.__fetchNextPage();
			break;
		}
	},

	__unloadPageId: function (pageId) {
		var pages = this.state.pages;
		var pageIndex = -1;
		for (var i = 0, len = pages.length; i < len; i++ && len--) {
			if (pages[i].id === pageId) {
				pageIndex = i;
				break;
			}
			if (pages[len-1].id === pageId) {
				pageIndex = len-1;
				break;
			}
		}
		if (pageIndex !== -1) {
			pages = pages.slice(0, pageIndex).concat(pages.slice(pageIndex+1, pages.length));
			this.setState({
				pages: pages,
				prevPageParams: pages[0].prevParams,
				nextParams: pages[pages.length-1].nextParams
			});
		}
	},

	__fetchPrevPage: function () {
		if ( !this.state.prevPageParams ) {
			throw new Error(this.constructor.displayName + ": Invalid attempt to fetch prev page!");
		}
		this.__fetchPulls({
			params: this.state.prevPageParams,
			operation: "prepend"
		});
	},

	__fetchNextPage: function () {
		if ( !this.state.nextPageParams ) {
			throw new Error(this.constructor.displayName + ": Invalid attempt to fetch next page!");
		}
		this.__fetchPulls({
			params: this.state.nextPageParams,
			operation: "append"
		});
	},

	__fetchPulls: function (options) {
		var params = Marbles.QueryParams.replaceParams.apply(null, [[{
			sort: "updated",
			direction: "desc"
		}]].concat(options.params || [{}]));

		FlynnDashboard.githubClient.getPulls(this.props.ownerLogin, this.props.repoName, params).then(function (args) {
			var res = args[0];
			var xhr = args[1];

			var parseLinkParams = function (rel, links) {
				var link = null;
				for (var i = 0, len = links.length; i < len; i++) {
					if (links[i].rel === rel) {
						link = links[i];
						break;
					}
				}
				if (link === null) {
					return null;
				}
				return Marbles.QueryParams.deserializeParams(link.href.split("?")[1]);
			};

			var links = Marbles.HTTP.LinkHeader.parse(xhr.getResponseHeader("Link") || "");
			var prevParams = parseLinkParams("prev", links);
			var nextParams = parseLinkParams("next", links);

			var pageId;
			if (prevParams) {
				pageId = Number(prevParams[0].page) + 1;
			} else if (nextParams) {
				pageId = Number(nextParams[0].page) - 1;
			} else {
				pageId = 1;
			}

			var pulls = res.filter(function (pullJSON) {
				return !!pullJSON.head.repo && !!pullJSON.base.repo;
			}).map(this.__rewriteJSON);

			if (pulls.length === 0) {
				if (this.state.pages.length === 0) {
					this.setState({
						empty: true
					});
				}

				// don't add an empty page
				return;
			}

			var page = {
				id: pageId,
				prevParams: prevParams,
				nextParams: nextParams,
				pulls: pulls
			};

			this.__addPage(page, options.operation);
		}.bind(this));
	},

	__rewriteJSON: function (pullJSON) {
		var stripHTML = function (str) {
			var tmp = document.createElement("div");
			tmp.innerHTML = str;
			return tmp.textContent || tmp.innerText;
		};
		return {
			id: pullJSON.id,
			number: pullJSON.number,
			title: pullJSON.title,
			body: stripHTML(pullJSON.body),
			url: pullJSON.html_url,
			createdAt: pullJSON.created_at,
			updatedAt: pullJSON.updated_at,
			user: {
				login: pullJSON.user.login,
				avatarURL: pullJSON.user.avatar_url
			},
			head: {
				label: pullJSON.head.label,
				ref: pullJSON.head.ref,
				sha: pullJSON.head.sha,
				name: pullJSON.head.repo.name,
				ownerLogin: pullJSON.head.repo.owner.login
			},
			base: {
				label: pullJSON.base.label,
				ref: pullJSON.base.ref,
				sha: pullJSON.base.sha,
				name: pullJSON.base.repo.name,
				ownerLogin: pullJSON.base.repo.owner.login
			}
		};
	},

	__addPage: function (page, operation) {
		var pages = this.state.pages;
		if (operation === "prepend") {
			pages = [page].concat(pages);
		} else if (operation === "append") {
			pages = pages.concat([page]);
		} else {
			throw new Error(this.constructor.displayName +": Invalid page operation: "+ JSON.stringify(operation));
		}

		var nextParams = pages[pages.length-1].nextParams;
		var prevParams = pages[0].prevParams;

		this.setState({
			empty: false,
			pages: pages,
			prevPageParams: prevParams,
			nextPageParams: nextParams
		});
	}

});

FlynnDashboard.Stores.GithubPulls.registerWithDispatcher(FlynnDashboard.Dispatcher);

})();
