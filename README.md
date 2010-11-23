# SeoMOZ Linkscape API Library

Node-linkscape is a node.js module for asynchronously communicating with the
[seoMOZ linkscape APIs](http://www.seomoz.org/api). It supports the url-metrics, 
links, anchor-text, and top-pages APIs.

## Installation

Use [npm](http://npmjs.org/) to install node-linkscape

    npm install linkscape

## Usage

    var Linkscape = require('linkscape').Linkscape;

    var seomoz = new Linkscape('your-access-id', 'your-secret');
    seomoz.urlMetrics('www.google.com', ['url', 'links'], function(err, res) {
        if (err) {
            console.log(err);
            return;
        }

        console.log(res);
    });

## Methods Available

###urlMetrics

    seomoz.urlMetrics(url, cols, callback)

* `url` The URL you want metrics for, ex: `'www.google.com'`
* `cols` An array of strings for the columns you want in the
response (see `Linkscape.URL_METRICS_FLAGS`). Ex: `['title', 'url', 'links']`
* `callback` A function to be called asynchronously once the response comes
back from the API. The function should accept 2 arguments in the following
order: `error, result` where error will either be an object or null, and
result will be an object containing the response from seoMOZ.

###links

    seomoz.links(url, scope, options, callback)

* `url` The URL you want to get links for, ex: `www.google.com`
* `scope` The scope of the results as per the seoMOZ API docs, ex: `page_to_page`
* `options` An object with any of the following:

    * `sort` As per the seoMOZ API docs, ex: `page_authority`
    * `filter` An array of strings, ex: `['internal', external', 'nofollow']`
    * `targetCols` Array of strings for the columns returned for the target of the link, see `Linkscape.URL_METRICS_FLAGS`
    * `sourceCols` Array of strings for the columns returned for the source of the link, see `Linkscape.URL_METRICS_FLAGS`
    * `linkCols` Array of strings for the columns for the link itself, see `Linkscape.LINK_FLAGS`

* `callback` Same as urlMetrics.

###anchorText

    seomoz.anchorText(url, scope, cols, callback)

* `url` The URL you want to get anchor texts for, ex: `www.google.com`
* `scope` Scope of the link as per the seoMOZ API docs, ex: `phrase_to_page`
* `cols` Array of strings for the columns returned, see `Linkscape.ANCHOR_TEXT_FLAGS`
* `callback` Same as urlMetrics.

###topPages

    seomoz.topPages(url, cols, options, callback)

* `url` The subdomain you want results for
* `cols` An array of strings for the columns you want in the
response (see `Linkscape.URL_METRICS_FLAGS`). Ex: `['title', 'url', 'links']`
* `options` An object with any of the following:

    * `offset` Return starting at the nth result
    * `limit` How many results to return (max 1000)

* `callback` Same as urlMetrics

