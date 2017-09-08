/* Copyright 2017 Assembleia Legislativa de Minas Gerais
 * 
 * This file is part of Editor-Articulacao.
 *
 * Editor-Articulacao is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, version 3.
 *
 * Editor-Articulacao is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Editor-Articulacao.  If not, see <http://www.gnu.org/licenses/>.
 */

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
    baseUrl: 'http://localhost:8075/',
    onPrepare: function () {
        browser.ignoreSynchronization = true;
        browser.manage().timeouts().pageLoadTimeout(40000);
        browser.manage().timeouts().implicitlyWait(25000);

        browser.driver.manage().window().setSize(1024, 768);
        browser.driver.get('http://localhost:8075/protractor/teste.html');
    },
    maxSessions: 1
};
