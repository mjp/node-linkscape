//var http = require('http');
var request = require('request');
/**
 * Mozscape API client.
 */
var Mozscape = function(accessId, secret) {
    this.configure({ accessId: accessId, secret: secret });
}

exports.Mozscape = Mozscape;


(function() {

    this.defaults = {
        hostname    : 'lsapi.seomoz.com',
        path        : 'linkscape',
        userAgent   : 'node-mozscape (https://github.com/scott-wyatt/node-mozscape)',
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
    };
    
    /**
     * URL Metrics API
     * 
     * http://apiwiki.moz.com/url-metrics
     */
    this.urlMetrics = function(url, cols, callback) {
        var apiPath = 'url-metrics/' + encodeURIComponent(url);
        var params = { 
            Cols: this._translateBitfield(cols, this.URL_METRICS_FLAGS)
        };

        this.get(apiPath, params, callback);
    };
    
    /**
     * Links API
     * 
     * http://apiwiki.moz.com/link-metrics
     */
    this.links = function(url, scope, options, callback) {
        var apiPath = 'links/' + encodeURIComponent(url);
        var params = {
            Scope: scope
        };

        if (options.sort !== undefined) {
            params.Sort = options.sort;
        }

        if (options.filter !== undefined) {
            params.Filter = options.filter.join('+');
        }

        if (options.targetCols !== undefined) {
            params.TargetCols = this._translateBitfield(
                options.targetCols, 
                this.URL_METRICS_FLAGS
            );
        }

        if (options.sourceCols !== undefined) {
            params.SourceCols = this._translateBitfield(
                options.sourceCols, 
                this.URL_METRICS_FLAGS
            );
        }

        if (options.linkCols !== undefined) {
            params.LinkCols = this._translateBitfield(
                options.linkCols,
                this.LINK_FLAGS
            );
        }

        this.get(apiPath, params, callback);
    };
    
    /**
     * Anchor Text API
     * 
     * http://apiwiki.moz.com/anchor-text-metrics
     */
    this.anchorText = function(url, scope, cols, callback) {
        var apiPath = 'anchor-text/' + encodeURIComponent(url);
        var params = {
            Scope: scope,
            Cols: this._translateBitfield(cols, this.ANCHOR_TEXT_FLAGS),
            Sort: 'domains_linking_page'
        };

        this.get(apiPath, params, callback);
    };

    /**
     * Top Pages API
     *
     * http://apiwiki.moz.com/top-pages
     */
    this.topPages = function(url, cols, options, callback) {
        var apiPath = 'top-pages/' + encodeURIComponent(url);
        var params = {
            Cols: this._translateBitfield(cols, this.URL_METRICS_FLAGS)
        };

        params.Offset = options.offset === undefined ? 0 : options.offset;
        params.Limit = options.limit === undefined? 1000 : options.limit;

        this.get(apiPath, params, callback);
    };

    /**
     * Metadata API
     * option: last_update, next_update, index_status
     * http://apiwiki.moz.com/metadata
     */
    this.metadata = function(option, callback) {
        var apiPath = 'metadata/' + option;
        var params = {};

        this.get(apiPath, params, callback);
    };

    /**
     * Translate an array of keys and an object lookup table
     * into a bit mask.
     */
    this._translateBitfield = function(columns, lookup) {
        var bits = 0;

        for (var key in columns) {
            if (lookup[columns[key]] !== undefined) {
				
				/*
				 * javascript has a "documented bug" in that it will only 
				 * use the lower 32 bit of a number in binary OR operations.
				 * Some of the bitfields in the Mozscape API have more than 32 bits.
				 * Therefore we replace binary OR (|=) with addition (+=) 
				 * which has the same effect, except that it works. - yas4891
				 */
				 
                bits += lookup[columns[key]];
            }
        }

        return bits;
    }
    
    /**
     * GET Request
     */
    this.get = function(apiPath, params, callback) {
        return this.send(apiPath, params, 'GET', callback);
    };
    
    /**
     * POST Request
     */
    this.post = function(apiPath, params, callback) {
        return this.send(apiPath, params, 'POST', callback);
    };

    /**
     * Send request to the MOZ API
     */
    this.send = function(apiPath, params, method, callback) {

        var path = 'http://' + this.options.hostname + '/' + this.options.path + '/' + apiPath;
        var auth = new Buffer(this.options.accessId + ':' + this.options.secret).toString('base64');

        var options = {
            url: path,
            headers: {
                'User-Agent': this.defaults.userAgent,
                'Authorization': 'Basic ' + auth,
                'Content-Length': 0
            }
        };

        var args = [];
        for (var key in params) {
            args.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
        }
        var queryString = args.join('&');
        if (queryString) {
            switch (method) {
                case 'GET':
                    options.url += '?' + queryString;
                    break;
                case 'POST':
                    options.headers['Content-Length'] = queryString.length;
                    break;
            }
        }

        function cb(error, response, body) {
            
            if (!error && response.statusCode > 200) {
                callback({ status: response.statusCode, msg: body });   
            }
            else {
                callback(null, JSON.parse(body));
            }
        }

        console.log("Calling: "+options.url);
        request(options, cb);
    };

    /**
     * URL Metrics Columns
     */
    this.URL_METRICS_FLAGS = {
        'title'                         : 1,
        'url'                           : 4,
        'subdomain'                     : 8,
        'root_domain'                   : 16,
        'external_links'                : 32,
        'subdomain_external_links'      : 64,
        'domain_external_links'         : 128,
        'juice_passing_links'           : 256,
        'subdomains_linking'            : 512,
        'domains_linking'               : 1024,
        'links'                         : 2048,
        'subdomain_subs_linking'        : 4096,
        'domain_domains_linking'        : 8192,
        'mozRank'                       : 16384,
        'subdomain_mozRank'             : 32768,
        'domain_mozRank'                : 65536,
        'mozTrust'                      : 131072,
        'subdomain_mozTrust'            : 262144,
        'domain_mozTrust'               : 524288,
        'external_mozRank'              : 1048576,
        'subdomain_external_juice'      : 2097152,
        'domain_external_juice'         : 4194304,
        'subdomain_domain_juice'        : 8388608,
        'domain_domain_juice'           : 16777216,
        'canonical_url'                 : 268435456,
        'http_status'                   : 536870912,
        'subdomain_links'               : 4294967296,
        'domain_links'                  : 8589934592,
        'domains_linking_to_subdomain'  : 17179869184,
        'page_authority'                : 34359738368,
        'domain_authority'              : 68719476736
    };

    /**
     * Link Columns
     */
    this.LINK_FLAGS = {
        'flags'                         : 2,
        'anchor_text'                   : 4,
        'moxRank_passed'                : 16
    };

    /**
     * Anchor Text Columns
     */
    this.ANCHOR_TEXT_FLAGS = {
        'phrase'                        : 2,
        'internal_pages_linking'        : 8,
        'internal_subdomains_linking'   : 16,
        'external_pages_linking'        : 32,
        'external_subdomains_linking'   : 64,
        'external_domains_linking'      : 128,
        'internal_mozRank_passed'       : 256,
        'external_mozRank_passed'       : 512,
        'flags'                         : 1024
    };

}).call(Mozscape.prototype);
