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

###anchorText

    seomoz.anchorText(url, scope, cols, callback)

