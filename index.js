var webdriverio = require('webdriverio'),
    merge  = require('deepmerge');

var defaultOptions = {
    desiredCapabilities: {
    },
    host: '127.0.0.1',
    port: 4444
};

function getBrowserInfo(launcher) {
    return launcher.options.desiredCapabilities.browserName + 
           (launcher.options.desiredCapabilities.version ? (' ' + launcher.options.desiredCapabilities.version) : '');
}

function getUrl(defaultUrl, launcher) {
    var url = defaultUrl;

    if (launcher.options.desiredCapabilities.browserName === 'internet explorer' && 
        launcher.options.ieDocumentMode) {
        url += '&x-ua-compatible=' + encodeURIComponent(launcher.options.ieDocumentMode);
    }

    return url;
}

var WebdriverIOLauncher = function(baseBrowserDecorator, args, logger) {
    var log = logger.create('webdriverio'),
        self = this;

    this.options = merge(defaultOptions, args.config);

    if (!this.options.desiredCapabilities.browserName) {
        log.error('No browser specified. Please provide browserName and (optionally) version in the configuration.');
    }

    baseBrowserDecorator(this);

    // Make sure that we retry multiple times (default is 2)
    this._retryLimit = 4;

    // This allows clearer output when running multiple tests at once
    this.name = getBrowserInfo(this) + ' through WebdriverIO';

    this._start = function(url) {
        var browserInfo = getBrowserInfo(self),
            finalUrl = getUrl(url, self);

        log.info('Loading %s using %s', finalUrl, browserInfo);

        self.browser = webdriverio
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

WebdriverIOLauncher.$inject = ['baseBrowserDecorator', 'args', 'logger'];

module.exports = {
  'launcher:WebdriverIO': ['type', WebdriverIOLauncher]
};
