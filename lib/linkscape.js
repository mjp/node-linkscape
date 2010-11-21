var http = require('http');


/**
 * Linkscape API client.
 */
var Linkscape = function(accessId, secret) {
    this.configure({ accessId: accessId, secret: secret });
}

exports.Linkscape = Linkscape;


(function() {

    this.defaults = {
        hostname    : 'lsapi.seomoz.com',
        path        : 'linkscape',
        userAgent   : 'node-linkscape (https://github.com/mjp/node-linkscape)',
        accessId    : null,
        secret      : null
    };

    this.configure = function(options) {
        var options = options || {};
        this.options = {};

        for (var key in this.defaults) {
            this.options[key] = options[key] !== undefined ? options[key] : this.defaults[key];
        }

        return this;
    }
    
    /**
     * URL Metrics API
     * 
     * http://apiwiki.seomoz.org/w/page/13991153/URL-Metrics-API
     */
    this.urlMetrics = function(url, callback) {
        var apiPath = 'url-metrics/' + encodeURIComponent(url);
        this.get(apiPath, {}, callback);
    };
    
    /**
     * Links API
     * 
     * http://apiwiki.seomoz.org/w/page/13991141/Links-API
     */
    this.links = function(url, callback) {
        var apiPath = 'links/' + encodeURIComponent(url);
        this.get(apiPath, {}, callback);
    };
    
    /**
     * Anchor Text API
     * 
     * http://apiwiki.seomoz.org/w/page/13991127/Anchor-Text-API
     */
    this.anchorText = function(url, callback) {
        var apiPath = 'anchor-text/' + encodeURIComponent(url);
        this.get(apiPath, {}, callback);
    };

    this.get = function(apiPath, params, callback) {
        return this.send(apiPath, params, 'GET', callback);
    };

    this.post = function(apiPath, params, callback) {
        return this.send(apiPath, params, 'POST', callback);
    };

    this.send = function(apiPath, params, method, callback) {
        var client = http.createClient(80, this.options.hostname);

        var headers = {
            'host': 'lsapi.seomoz.com',
            'Authorization': 'Basic ' + new Buffer(this.options.accessId + ':' + this.options.secret).toString('base64'),
            'User-Agent': this.options.userAgent,
            'Content-Length': '0'
        };

        var path = 'http://' + this.options.hostname + '/' + this.options.path + '/' + apiPath;

        var args = [];
        for (var key in params) {
            args.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
        }
        var queryString = args.join('&');

        if (queryString) {
            switch (method) {
                case 'GET':
                    path += '?' + queryString;
                    break;
                case 'POST':
                    headers['Content-Length'] = queryString.length;
                    break;
            }
        }

        var request = client.request(method, path, headers);
        if (method == 'POST') {
            request.write(queryString);
        }

        request.addListener('response', function(response) {
            if (response.statusCode > 200) {
                callback({ status: response.statusCode, msg: response.status });
                return;
            }

            response.setEncoding('utf8');

            var body = [];
            response.addListener('data', function(chunk) {
                body.push(chunk);
            });
            
            response.addListener('end', function() {
                callback(null, JSON.parse(body.join('')));
            });
        });

        request.end();
    };

}).call(Linkscape.prototype);
