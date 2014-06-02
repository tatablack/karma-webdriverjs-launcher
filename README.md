# karma-webdriverjs-launcher

A plugin for Karma. Launcher for Remote WebDriver instances using WebDriverJS.

## Why another WebDriver launcher?
This implementation is inspired by the [karma-webdriver-launcher](https://github.com/karma-runner/karma-webdriver-launcher) made by the folks at Karma.

However, it uses a different WebDriver implementation ([WebdriverJS](http://webdriver.io/) instead of [wd](https://github.com/admc/wd)), and tries harder to get hold of a browser instance from Selenium Grid.

## Installation
```
npm install karma-webdriverjs-launcher --save-dev
```

## Usage
Add a custom launcher to your Karma configuration, specifying the necessary parameters.

```
customLaunchers: {
    'Remote-IE9': {
        base: 'WebdriverJS',
        config: {
            host: 'qa-builder001',
            desiredCapabilities: {
                browserName: 'internet explorer',
                version: '9'
            }
        },
        browserName: 'internet explorer',
        version: '9',
        name: 'Karma'
    }
}
```

And then use that launcher in your browser suite configuration.
