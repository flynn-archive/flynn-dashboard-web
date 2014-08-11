(function () {
"use strict";

var GithubCommits = FlynnDashboard.Stores.GithubCommits = Marbles.Store.createClass({
	displayName: "FlynnDashboard.Stores.GithubCommits",

	getState: function () {
		return this.state;
	},

	willInitialize: function () {
		var id = this.id;
		this.props = {
			userLogin: id.ownerLogin,
			repoName: id.repoName,
			refSha: id.refSha,
			refShaBranch: id.refShaBranch,
			branch: id.branch
		};

		this.status = "cold";

		this.__cachedCommits = [];
		this.__cachedCommitIndex = {};
	},

	didInitialize: function () {
		this.unloadPageId = this.unloadPageId.bind(this);
		this.fetchNextPage = this.fetchNextPage.bind(this);
		this.fetchPrevPage = this.fetchPrevPage.bind(this);
	},

	didBecomeActive: function () {
		var opts = {
			operation: "append"
		};
		if (this.props.branch === this.props.refShaBranch) {
			opts.untilSha = this.props.refSha;
		}
		this.__fetch([{}], opts).then(this.__setFetchNewCommitsTimeout.bind(this));
	},

	didBecomeInactive: function () {
		clearTimeout(this.__fetchNewCommitsTimeout);
		this.status = "inactive";
		this.constructor.discardInstance(this);
	},

	willUpdate: function () {
		this.state.version += 1;
	},

	getInitialState: function () {
		return {
			pages: [],
			version: 0
		};
	},

	handleEvent: function (event) {
		switch (event.name) {
			case "GITHUB_COMMITS:UNLAOD_PAGE_ID":
				this.unloadPageId(event.pageId);
			break;

			case "GITHUB_COMMITS:FETCH_NEXT_PAGE":
				this.fetchNextPage();
			break;

			case "GITHUB_COMMITS:FETCH_PREV_PAGE":
				this.fetchPrevPage();
			break;
		}
	},

	getCommits: function () {
		var pages = this.state.pages;
		var hasRefCommit = false;
		for (var i = 0, len = pages.length; i < len; i++) {
			if (pages[i].hasRefCommit) {
				hasRefCommit = true;
				break;
			}
		}

		return {
			version: this.state.version,
			pages: pages,
			hasRefCommit: hasRefCommit,
			hasPrevPage: Boolean(this.state.prevPageParams),
			hasNextPage: Boolean(this.state.nextPageParams)
		};
	},

	fetchNextPage: function () {
		if ( !this.state.nextPageParams ) {
			throw new Error("GithubCommits: Invalid attempt to fetch next page! "+ JSON.stringify(this.state.nextPageParams));
		}

		return this.__fetch(this.state.nextPageParams, {
			operation: "append"
		});
	},

	fetchPrevPage: function (opts) {
		if ( !this.state.prevPageParams ) {
			throw new Error("GithubCommits: Invalid attempt to fetch prev page! "+ JSON.stringify(this.state.prevPageParams));
		}

		return this.__fetch(this.state.prevPageParams, Marbles.Utils.extend({
			operation: "prepend"
		}, opts));
	},

	unloadPageId: function (pageId) {
		var pages = this.state.pages;
		if (pages.length === 0) {
			throw new Error("Invalid attempt to unload page id ("+ JSON.stringify(pageId) +"): no pages loaded!");
		}
		if (pages.length === 1) {
			throw new Error("Invalid attempt to unload page id ("+ JSON.stringify(pageId) +"): can't unload only page!");
		}
		var removedPage = null;
		if (pages[0].id === pageId) {
			removedPage = pages[0];
			pages.shift();
		} else if (pages[pages.length-1].id === pageId) {
			removedPage = pages[pages.length-1];
			pages.pop();
		} else {
			throw new Error("Invalid attempt to unload page id ("+ JSON.stringify(pageId) +"): may only unload first or last page!");
		}
		["prevPageParams", "nextPageParams"].forEach(function (k) {
			var params = (removedPage[k] || [])[0];
			if ( !params ) {
				return;
			}
			var sha = params.sinceSha || params.beforeSha;
			delete this.__cachedCommitIndex[sha];
		}.bind(this));

		var nextParams = pages[pages.length-1].nextParams;
		var prevParams = pages[0].prevParams;

		this.setState({
			pages: pages,
			prevPageParams: prevParams,
			nextPageParams: nextParams
		});
	},

	__clearFetchNewCommitsTimeout: function () {
		clearTimeout(this.__fetchNewCommitsTimeout);
	},

	__setFetchNewCommitsTimeout: function () {
		this.__fetchNewCommitsTimeout = setTimeout(function () {
			var lastCommit = this.__cachedCommits[this.__cachedCommits.length-1];
			this.__fetchNewCommits({
				untilSha: lastCommit.sha,
				excludeUntilSha: true
			});
		}.bind(this), 30000);
	},

	__fetchNewCommits: function (opts) {
		this.__clearFetchNewCommitsTimeout();
		var operation;
		var lastPage = this.state.pages[this.state.pages.length-1];
		if (lastPage && lastPage.hasOwnProperty("nextParams")) {
			operation = "cache";
		} else {
			operation = "append";
		}
		return this.__fetch([{}], Marbles.Utils.extend({
			isFirstPage: true,
			operation: operation,
			sliceUntil: true
		}, opts || {})).then(function () {
			if (this.status !== "inactive") {
				this.__setFetchNewCommitsTimeout();
			}
		}.bind(this));
	},

	__fetch: function (params, opts) {
		this.status = "pending";
		var userLogin = this.props.userLogin;
		var repoName = this.props.repoName;
		var branch = this.props.branch;
		params = params || [{}];

		var commitsPerPage = 30;
		var cacheIndex = this.__cachedCommitIndex;
		var cachedCommits = this.__cachedCommits;
		var sinceSha = params[0].sinceSha;
		var beforeSha = params[0].beforeSha;
		var commits;
		var page;
		if (sinceSha) {
			if (cacheIndex.hasOwnProperty(sinceSha)) {
				commits = cachedCommits.slice(cacheIndex[sinceSha] + 1, cacheIndex[sinceSha] + commitsPerPage + 1);
			}
		} else if (beforeSha) {
			if (cacheIndex.hasOwnProperty(beforeSha)) {
				commits = cachedCommits.slice(Math.max(0, cacheIndex[beforeSha] - commitsPerPage), cacheIndex[beforeSha]);
			}
		}

		var hasRefCommit = false;
		var len;
		if (commits && commits.length > 0) {
			len = commits.length;
			for (var i = 0; i < len; i++) {
				if (commits[i].sha === this.props.refSha) {
					hasRefCommit = true;
					break;
				}
			}
			page = {
				commits: commits,
				id: commits[0].sha +":"+ commits[len-1].sha,
				hasRefCommit: hasRefCommit,
				prevParams: [{
					beforeSha: commits[0].sha
				}],
				nextParams: [{
					sinceSha: commits[len-1].sha
				}]
			};

			cacheIndex[commits[0].sha] = cachedCommits.indexOf(commits[0]);
			cacheIndex[commits[len-1].sha] = cachedCommits.indexOf(commits[len-1]);

			if (cacheIndex[commits[len-1].sha] === cachedCommits.length-1) {
				delete page.nextParams;
			}

			this.__addPage(page, opts.operation);
			return Promise.resolve();
		}

		params = [{}];

		if (beforeSha) {
			params[0].sha = beforeSha;
		} else if (sinceSha) {
			throw new Error("GithubCommits: Invalid fetch request: sinceSha: "+ JSON.stringify(sinceSha));
		}

		if ( !params[0].hasOwnProperty("sha") ) {
			params[0].sha = branch;
		}

		var getCommits = FlynnDashboard.githubClient.getCommits(userLogin, repoName, params);
		return getCommits.then(
			this.__handleFetchSuccess.bind(this, params, opts),
			this.__handleFetchFailure.bind(this)
		);
	},

	__handleFetchSuccess: function (params, opts, res) {
		res = res[0];

		if (res[0].sha === params[0].sha) {
			res = res.slice(1);
		}

		if (res.length === 0) {
			this.setState({});
			return;
		}

		var refSha = this.props.refSha;
		var hasRefCommit = false;
		var commits = res.map(function (item) {
			if (item.sha === refSha) {
				hasRefCommit = true;
			}

			return this.__rewriteJSON(item);
		}, this).reverse();

		var hasUntilSha = false;
		var untilShaIndex = -1;
		if (opts.untilSha) {
			for (var i = 0, len = commits.length; i < len; i++) {
				if (commits[i].sha === opts.untilSha) {
					hasUntilSha = true;
					untilShaIndex = i;
					break;
				}
			}
			if (untilShaIndex > -1 && opts.sliceUntil) {
				if (opts.excludeUntilSha) {
					untilShaIndex += 1;
				}
				commits = commits.slice(untilShaIndex);
			}
		}

		if (commits.length === 0) {
			return;
		}

		var pageId = null;
		if (commits.length > 1) {
			pageId = commits[0].sha +":"+ commits[commits.length-1].sha;
		} else {
			pageId = commits[0].sha;
		}

		var prevParams = [{
			beforeSha: commits[0].sha
		}];
		var nextParams = null;
		if (this.__cachedCommits.length > 0 && !opts.isFirstPage) {
			nextParams = [{
				sinceSha: commits[commits.length-1].sha
			}];
		}

		var page = {
			commits: commits,
			id: pageId,
			hasRefCommit: hasRefCommit,
			prevParams: prevParams,
			nextParams: nextParams
		};

		var startSha = commits[0].sha;
		var endSha = commits[commits.length-1].sha;
		switch (opts.operation) {
			case "append":
				this.__cachedCommitIndex[startSha] = this.__cachedCommits.length;
				this.__cachedCommitIndex[endSha] = this.__cachedCommits.length + commits.length - 1;
				Array.prototype.push.apply(this.__cachedCommits, commits);
			break;

			case "prepend":
				Object.keys(this.__cachedCommitIndex).forEach(function (sha) {
					this.__cachedCommitIndex[sha] += commits.length;
				}.bind(this));
				this.__cachedCommitIndex[startSha] = 0;
				this.__cachedCommitIndex[endSha] = commits.length-1;
				Array.prototype.unshift.apply(this.__cachedCommits, commits);
			break;

			case "cache":
				this.__cachedCommitIndex[startSha] = this.__cachedCommits.length;
				this.__cachedCommitIndex[endSha] = this.__cachedCommits.length + commits.length - 1;
				Array.prototype.push.apply(this.__cachedCommits, commits);
			break;
		}

		if (opts.untilSha && !hasUntilSha && prevParams) {
			this.setState({
				prevPageParams: prevParams
			});
			return this.fetchPrevPage({
				untilSha: opts.untilSha
			});
		}

		if (opts.operation !== "cache") {
			this.status = "hot";
			this.__addPage(page, opts.operation);
		}
	},

	__rewriteJSON: function (commitJSON) {
		return {
			committer: {
				avatarURL: commitJSON.committer.avatar_url,
				name: commitJSON.commit.committer.name
			},
			author: {
				avatarURL: commitJSON.author.avatar_url,
				name: commitJSON.commit.author.name
			},
			committedAt: Date.parse(commitJSON.commit.committer.date),
			createdAt: Date.parse(commitJSON.commit.author.date),
			sha: commitJSON.sha,
			message: commitJSON.commit.message,
			githubURL: commitJSON.html_url
		};
	},

	__addPage: function (page, operation) {
		var pages = this.state.pages;

		var pageAlreadyAdded = false;
		for (var i = 0, len = pages.length; i < len; i++) {
			if (pages[i].id === page.id) {
				pageAlreadyAdded = true;
				break;
			}
		}
		if (pageAlreadyAdded) {
			throw new Error(this.constructor.displayName +": Invalid attempt to add page! Page with id "+ page.id +" has already been added.");
		}

		switch (operation) {
			case "append":
				pages.push(page);
			break;

			case "prepend":
				pages.unshift(page);
			break;

			default:
				throw new Error("GithubCommits: Invalid operation: "+ JSON.stringify(operation));
		}

		var nextParams = pages[pages.length-1].nextParams;
		var prevParams = pages[0].prevParams;

		this.setState({
			empty: false,
			pages: pages,
			prevPageParams: prevParams,
			nextPageParams: nextParams
		});
	},

	__handleFetchFailure: function (err) {
		this.status = "error";
		if (err instanceof Error) {
			throw err;
		} else {
			var res = err[0];
			var xhr = err[1];
			throw new Error("Failed to fetch commits: "+ xhr.status +" - "+ JSON.stringify(res));
		}
	}
});

GithubCommits.isValidId = function (id) {
	return id.userLogin && id.repoName && id.refSha && id.branch;
};

GithubCommits.registerWithDispatcher(FlynnDashboard.Dispatcher);

})();
