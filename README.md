# MOZ Mozscape API Library

Node-mozscape is a node.js module for asynchronously communicating with the
[MOZ Mozscape APIs](http://moz.com/products/api). 

## APIs It supports
- url-metrics 
- links 
- anchor-text
- top-pages
- metadata

This is reworked the from the tremendous previous api library - [Linkscape API Library](https://github.com/mjp/node-linkscape)

## Installation

Use [npm](http://npmjs.org/) to install node-mozscape

    npm install mozscape

## Dependencies
[request](https://www.npmjs.org/package/request)

## Usage

    var Mozscape = require('mozscape').Mozscape;

    var moz = new Mozscape('your-access-id', 'your-secret');
    moz.urlMetrics('www.google.com', ['url', 'links'], function(err, res) {
        if (err) {
            console.log(err);
            return;
        }

        console.log(res);
    });

## Methods Available

###urlMetrics

    moz.urlMetrics(url, cols, callback)

* `url` The URL you want metrics for, ex: `'www.google.com'`
* `cols` An array of strings for the columns you want in the
response (see `Mozscape.URL_METRICS_FLAGS`). Ex: `['title', 'url', 'links']`
* `callback` A function to be called asynchronously once the response comes
back from the API. The function should accept 2 arguments in the following
order: `error, result` where error will either be an object or null, and
result will be an object containing the response from seoMOZ.

###links

    moz.links(url, scope, options, callback)

* `url` The URL you want to get links for, ex: `www.google.com`
* `scope` The scope of the results as per the seoMOZ API docs, ex: `page_to_page`
* `options` An object with any of the following:

    * `sort` As per the seoMOZ API docs, ex: `page_authority`
    * `filter` An array of strings, ex: `['internal', external', 'nofollow']`
    * `targetCols` Array of strings for the columns returned for the target of the link, see `Mozscape.URL_METRICS_FLAGS`
    * `sourceCols` Array of strings for the columns returned for the source of the link, see `Mozscape.URL_METRICS_FLAGS`
    * `linkCols` Array of strings for the columns for the link itself, see `Linkscape.LINK_FLAGS`

* `callback` Same as urlMetrics.

###anchorText

    moz.anchorText(url, scope, cols, callback)

* `url` The URL you want to get anchor texts for, ex: `www.google.com`
* `scope` Scope of the link as per the MOZ API docs, ex: `phrase_to_page`
* `cols` Array of strings for the columns returned, see `Mozscape.ANCHOR_TEXT_FLAGS`
* `callback` Same as urlMetrics.

###topPages

    moz.topPages(url, cols, options, callback)

* `url` The subdomain you want results for
* `cols` An array of strings for the columns you want in the
response (see `Mozscape.URL_METRICS_FLAGS`). Ex: `['title', 'url', 'links']`
* `options` An object with any of the following:

    * `offset` Return starting at the nth result
    * `limit` How many results to return (max 1000)

* `callback` Same as urlMetrics

###metadata

    moz.metadata(option, callback)

* `option` A string of any of the following:

    * `last_update` 
    * `next_update`
    * `index_stats` 

* `callback` Same as urlMetrics

