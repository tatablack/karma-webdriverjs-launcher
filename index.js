var webdriverjs = require('webdriverjs'),
    merge  = require('deepmerge');

var defaultOptions = {
    desiredCapabilities: {
        browserName: 'internet explorer',
        version: '9'
    },
    logLevel: 'silent', // verbose | silent | command | data | result
    host: '127.0.0.1',
    port: 4444
};

var WebdriverJSLauncher = function(baseBrowserDecorator, args, logger) {
    var log = logger.create('webdriverjs'),
        self = this;

    baseBrowserDecorator(this);

    this.name = 'WebdriverJS';
    this.options = merge(defaultOptions, args.config);

    this._start = (function(url) {
        log.info('Loading %s', url);
        this.browser = webdriverjs
            .remote(this.options)
            .init(function(err, session) {
                if (err) {
                    log.error('An error occurred. Status code: %s. %s', err.status, err.message);
                    self.error = err;
                    self.emit('done');
                }
            })
            .url(url, function(err, response) {
                if (err) {
                    log.error('An error occurred. Status code: %s. %s', err.status, err.message);
                    self.error = err;
                    self.emit('done');
                }
            });
    }).bind(this);

    this.on('done', function() {
        self.browser.end(function() {
            log.info('Browser closed.');
        });
    });

    this.on('kill', (function(callback) {
        this.browser.end(function() {
            log.info('Browser closed.');
            callback();
            callback = null;
        });
    }).bind(this));
};

WebdriverJSLauncher.$inject = ['baseBrowserDecorator', 'args', 'logger'];

module.exports = {
  'launcher:WebdriverJS': ['type', WebdriverJSLauncher]
};
