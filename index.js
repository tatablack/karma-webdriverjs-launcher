var webdriverjs = require('webdriverjs'),
    merge  = require('deepmerge');

var defaultOptions = {
    desiredCapabilities: {
        // browserName: 'internet explorer',
        // version: '9'
    },
    //x-ua-compatible: 'edge',
    logLevel: 'silent', // Webdriver.IO logging: verbose | silent | command | data | result
    host: '127.0.0.1',
    port: 4444
};

function getBrowserInfo(launcher) {
    return launcher.options.desiredCapabilities.browserName + 
           (launcher.options.desiredCapabilities.version ? (' ' + launcher.options.desiredCapabilities.version) : '');
}

function getUrl(defaultUrl, launcher) {
    var url = defaultUrl;

    if (launcher.options.desiredCapabilities.browserName === 'internet explorer') {
        url += '&x-ua-compatible=' + encodeURIComponent(launcher.options.x-ua-compatible);
    }

    return url;
}

var WebdriverJSLauncher = function(baseBrowserDecorator, args, logger) {
    var log = logger.create('webdriverjs'),
        self = this;

    this.options = merge(defaultOptions, args.config);

    if (!this.options.desiredCapabilities.browserName) {
        log.error('No browser specified. Please provide browserName and (optionally) version in the configuration.');
    }

    baseBrowserDecorator(this);
    
    this.name = getBrowserInfo(this) + ' through WebdriverJS';

    this._start = function(url) {
        var browserInfo = getBrowserInfo(self),
            finalUrl = getUrl(url, self);

        log.info('Loading %s using %s', finalUrl, browserInfo);

        self.browser = webdriverjs
            .remote(self.options)
            .init(function(err, session) {
                if (err) {
                    log.error('An error occurred while initializing %s. Status code: %s. %s', browserInfo, err.status, err.message);
                    self.error = err.message ? err.message : err;
                    self.emit('done');
                }
            })
            .url(finalUrl, function(err, response) {
                if (err) {
                    log.error('An error occurred while loading the url with %s. Status code: %s. %s', browserInfo, err.status, err.message);
                    self.error = err.message ? err.message : err;
                    self.emit('done');
                }
            });
    };

    this.on('done', function() {
        self.browser.end(function() {
            log.info('Browser %s closed.', getBrowserInfo(self));
        });
    });

    this.on('kill', function(callback) {
        self.browser.end(function() {
            log.info('Browser %s closed.', getBrowserInfo(self));
            callback();
            callback = null;
        });
    });
};

WebdriverJSLauncher.$inject = ['baseBrowserDecorator', 'args', 'logger'];

module.exports = {
  'launcher:WebdriverJS': ['type', WebdriverJSLauncher]
};
