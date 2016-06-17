let request = require('request');
let crypto = require('crypto');

/**
 * Mozscape API client.
 */

let Mozscape = function (accessId, secret) {
  this.configure({accessId: accessId, secret: secret});
};

exports.Mozscape = Mozscape;

(function () {

  this.defaults = {
    hostname: 'lsapi.seomoz.com',
    path: 'linkscape',
    userAgent: 'node-mozscape (https://github.com/scott-wyatt/node-mozscape)',
    accessId: null,
    secret: null
  };

  this.configure = function (options) {
    options = options || {};
    this.options = {};

    Object.keys(this.defaults).forEach(key => {
      this.options[key] = typeof options[key] !== 'undefined' ? options[key] : this.defaults[key];
    });

    return this;
  };

  /**
   * URL Metrics API
   *
   * http://apiwiki.moz.com/url-metrics
   */
  this.urlMetrics = function (url, cols, callback) {
    let apiPath = `url-metrics/${encodeURIComponent(url)}`;
    let params = {
      Cols: this._translateBitfield(cols, this.URL_METRICS_FLAGS)
    };

    this.get(apiPath, params, callback);
  };

  this.bulkUrlMetrics = function (urlsArray, cols, callback) {
    let apiPath = 'url-metrics/';

    cols = this._translateBitfield(cols, this.URL_METRICS_FLAGS);
    apiPath += `?Cols=${cols}`;

    let expires = Date.now() + 300;
    let stringToSign = `${this.options.accessId}\n${expires}`;
    let binarySignature = crypto.createHmac('sha1', this.options.secret).update(stringToSign).digest('base64');
    let urlSafeSignature = encodeURIComponent(binarySignature);

    apiPath += `&AccessId=${this.options.accessId}`;
    apiPath += `&Expires=${expires}`;
    apiPath += `&Signature=${urlSafeSignature}`;

    let path = `http://${this.options.hostname}/${this.options.path}/${apiPath}`;
    let auth = new Buffer(`${this.options.accessId}:${this.options.secret}`).toString('base64');
    let params = JSON.stringify(urlsArray);
    let options = {
      url: path,
      method: 'POST',
      headers: {
        'User-Agent': this.defaults.userAgent,
        Authorization: `Basic ${auth}`,
        'Content-Length': params.length
      },
      body: params
    };
    request(options, callback);
  };

  /**
   * Links API
   *
   * http://apiwiki.moz.com/link-metrics
   */
  this.links = function (url, scope, options, callback) {
    let apiPath = `links/${encodeURIComponent(url)}`;
    let params = {
      Scope: scope
    };

    if (typeof options.sort !== 'undefined') {
      params.Sort = options.sort;
    }

    if (typeof options.filter !== 'undefined') {
      params.Filter = options.filter.join('+');
    }

    if (typeof options.targetCols !== 'undefined') {
      params.TargetCols = this._translateBitfield(
        options.targetCols,
        this.URL_METRICS_FLAGS
      );
    }

    if (typeof options.sourceCols !== 'undefined') {
      params.SourceCols = this._translateBitfield(
        options.sourceCols,
        this.URL_METRICS_FLAGS
      );
    }

    if (typeof options.linkCols !== 'undefined') {
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
  this.anchorText = function (url, scope, cols, callback) {
    let apiPath = `anchor-text/${encodeURIComponent(url)}`;
    let params = {
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
  this.topPages = function (url, cols, options, callback) {
    let apiPath = `top-pages/${encodeURIComponent(url)}`;
    let params = {
      Cols: this._translateBitfield(cols, this.URL_METRICS_FLAGS)
    };

    params.Offset = typeof options.offset === 'undefined' ? 0 : options.offset;
    params.Limit = typeof options.limit === 'undefined' ? 1000 : options.limit;

    this.get(apiPath, params, callback);
  };

  /**
   * Metadata API
   * option: last_update, next_update, index_status
   * http://apiwiki.moz.com/metadata
   */
  this.metadata = function (option, callback) {
    let apiPath = `metadata/${option}`;
    let params = {};

    this.get(apiPath, params, callback);
  };

  /**
   * Translate an array of keys and an object lookup table
   * into a bit mask.
   */
  this._translateBitfield = function (columns, lookup) {
    let bits = 0;

    columns.forEach(key => {
      if (typeof lookup[key] !== 'undefined') {

        /*
         * javascript has a "documented bug" in that it will only
         * use the lower 32 bit of a number in binary OR operations.
         * Some of the bitfields in the Mozscape API have more than 32 bits.
         * Therefore we replace binary OR (|=) with addition (+=)
         * which has the same effect, except that it works. - yas4891
         */

        bits += lookup[key];
      }
    });

    return bits;
  };

  /**
   * GET Request
   */
  this.get = function (apiPath, params, callback) {
    return this.send(apiPath, params, 'GET', callback);
  };

  /**
   * POST Request
   */
  this.post = function (apiPath, params, callback) {
    return this.send(apiPath, params, 'POST', callback);
  };

  /**
   * Send request to the MOZ API
   */
  this.send = function (apiPath, params, method, callback) {

    let path = `http://${this.options.hostname}/${this.options.path}/${apiPath}`;
    let auth = new Buffer(`${this.options.accessId}:${this.options.secret}`).toString('base64');

    let options = {
      url: path,
      headers: {
        'User-Agent': this.defaults.userAgent,
        Authorization: `Basic ${auth}`,
        'Content-Length': 0
      }
    };

    let args = [];
    Object.keys(params).forEach(key => args.push(`${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`));

    let queryString = args.join('&');
    if (queryString) {
      switch (method) {
        case 'GET':
          options.url += `?${queryString}`;
          break;
        case 'POST':
          options.headers['Content-Length'] = queryString.length;
          break;
        default:
          break;
      }
    }

    function cb(error, response, body) {

      if (!error && response.statusCode > 200) {
        callback({status: response.statusCode, msg: body});
      } else {
        callback(null, JSON.parse(body));
      }
    }

    console.log('Calling: ' + options.url);
    request(options, cb);
  };

  /**
   * URL Metrics Columns
   */
  this.URL_METRICS_FLAGS = {
    title: 1,
    url: 4,
    subdomain: 8,
    root_domain: 16,
    external_equity_links: 32,
    subdomain_external_links: 64,
    domain_external_links: 128,
    juice_passing_links: 256,
    subdomains_linking: 512,
    domains_linking: 1024,
    links: 2048,
    subdomain_subs_linking: 4096,
    domain_domains_linking: 8192,
    mozRank: 16384,
    subdomain_mozRank: 32768,
    domain_mozRank: 65536,
    mozTrust: 131072,
    subdomain_mozTrust: 262144,
    domain_mozTrust: 524288,
    external_mozRank: 1048576,
    subdomain_external_juice: 2097152,
    domain_external_juice: 4194304,
    subdomain_domain_juice: 8388608,
    domain_domain_juice: 16777216,
    spam_score: 67108864,
    social: 134217728,
    canonical_url: 268435456,
    http_status: 536870912,
    subdomain_links: 4294967296,
    domain_links: 8589934592,
    domains_linking_to_subdomain: 17179869184,
    page_authority: 34359738368,
    domain_authority: 68719476736,
    external_links: 549755813888,
    external_links_to_subdomain: 140737488355328,
    external_links_to_root: 2251799813685248,
    linking_c_blocks: 36028797018963968,
    time_last_crawled: 144115188075855872,
  };

  /**
   * Link Columns
   */
  this.LINK_FLAGS = {
    flags: 2,
    anchor_text: 4,
    moxRank_passed: 16,
  };

  /**
   * Anchor Text Columns
   */
  this.ANCHOR_TEXT_FLAGS = {
    phrase: 2,
    internal_pages_linking: 8,
    internal_subdomains_linking: 16,
    external_pages_linking: 32,
    external_subdomains_linking: 64,
    external_domains_linking: 128,
    internal_mozRank_passed: 256,
    external_mozRank_passed: 512,
    flags: 1024,
  };

}).call(Mozscape.prototype);
