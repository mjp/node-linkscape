# SeoMOZ Linkscape API Library

Node-linkscape is a node.js module for asynchronously communicating with the
seoMOZ linkscape APIs. It supports the url-metrics, links, and anchor-text
APIs.

## Installation

    npm install linkscape

## Usage

    var Linkscape = require('linkscape').Linkscape;

    var seomoz = new Linkscape('your-access-id', 'your-secret');
    seomoz.urlMetrics('www.google.com', [], function(err, res) {
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

* `scope` The scope of the results as per the seoMOZ API docs, ex: `page_to_page`
* `options` An object with any of the following:

    * `sort` As per the seoMOZ API docs, ex: `page_authority`
    * `filter` An array of strings, ex: `['internal', external', 'nofollow']`
    * `targetCols` Columns for the target of the link, see `Linkscape.URL_METRICS_FLAGS`
    * `sourceCols` Columns for the source of the link, see `Linkscape.URL_METRICS_FLAGS`
    * `linkCols` Columns for the link itself, see `Linkscape.LINK_FLAGS`

* `callback` Same as urlMetrics.

###anchorText

    seomoz.anchorText(url, scope, cols, callback)

* `scope` Scope of the link as per the seoMOZ API docs, ex: `phrase_to_page`
* `cols` Which columns are returned, see `Linkscape.ANCHOR_TEXT_FLAGS`
* `callback` Same as urlMetrics.

