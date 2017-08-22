exports.config = {
    framework: 'jasmine',
    specs: ['test/protractor/*.spec.js'],
    directConnect: true,
    multiCapabilities: [
        {
            browserName: 'chrome',
            chromeOptions: {
                args: ['--no-sandbox']
            }
        }/*, {
            'browserName': 'firefox'
        }*/
    ],
    localSeleniumStandaloneOpts: {
        seleniumArgs: ['-browserTimeout=60']
    },
    baseUrl: 'http://localhost:8080/',
    onPrepare: function () {
        browser.ignoreSynchronization = true;
        browser.manage().timeouts().pageLoadTimeout(40000);
        browser.manage().timeouts().implicitlyWait(25000);

        browser.driver.manage().window().setSize(1024, 768);
        browser.driver.get('http://localhost:8080/protractor/teste.html');
    },
    maxSessions: 1
};
