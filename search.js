'use strict';

var _ = require('underscore');
var google = require('google');
var youtube = require('youtube-search');
var Scraper = require ('images-scraper')
// , bing = new Scraper.Bing();

google.resultsPerPage = 1;

exports.search = function(query, querySource, callback) {
  querySource = querySource.toLowerCase();
	if(querySource === 'internet' || querySource === 'web' || querySource == 'google')
		searchWeb(query, callback);
	else if(_.indexOf(['image', 'images', 'picture', 'pictures', 'flickr'], querySource) >= 0){
		searchImage(query, callback);
	}
	else if( querySource == 'youtube' || 'video') searchVideo(query, callback);
	else {
		callback(undefined, {'type': 'image', 'content': 'http://i.imgur.com/Ql6Dvqa.jpg' });
	}
};

exports.youtube = function(query, callback) {
  searchVideo(query, callback);
};

exports.web = function(query, callback) {
  searchWeb(query, callback);
};

function searchWeb(query, callback){
  console.log('Search web', query);
	google(query, function (err, res){
    console.log('Search web', err, res.links);
	  if (err || res.links.length < 1) {
	  	console.error(err);
	  	callback(err)
	  }
	  var returnData = {'type': 'web', 'content': res.links[0].href}
	  callback(undefined, returnData);
	});
}

function searchImage(name,callback) {
  console.log('Search image', name);
	bing.list({
	    keyword: 'name',
	    num: 3
	}).then(function (res) {
    console.log('Search image', res);
		var returnData = {'type': 'image', 'content': res[0].url}
    callback(undefined, returnData)
	}).catch(function(err) {
	    console.error(err)
	    callback(err)
	})
}

function searchVideo(term, callback){
	var opts = {
	  maxResults: 10,
	  key: 'AIzaSyBsp2PzLbU-3tJTUxGHfna9f8Xu608gGt0',
    type: 'video'
	};
	youtube(term, opts, function(err, results) {
	  if( err || results < 1 ) {
	  	console.error(err)
	  	callback(err)
	  }
	  var returnData = {'type': 'youtube', 'content': results[0].link}
	  callback(undefined, returnData)
	});
}
