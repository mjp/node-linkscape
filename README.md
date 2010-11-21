# SeoMOZ Linkscape API Library

Node-linkscape is a node.js module for asynchronously communicating with the
seoMOZ linkscape APIs. It supports the url-metrics, links, and anchor-text
APIs.

## Installation

## Usage

    var Linkscape = require('linkscape').Linkscape;

    var seomoz = new Linkscape('your-access-id', 'your-secret');
    seomoz.urlMetrics('www.google.com', {}, function(err, res) {
        if (err) {
            console.log(err);
            return;
        }

        console.log(res);
    }

## Methods Available

Coming soon.
