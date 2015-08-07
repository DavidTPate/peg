#!/usr/bin/env node
(function (program, Promise, exit, Peg, SpecReporter) {
    'use strict';
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    var input = '';

    process.stdin.on('data', function (chunk) {
        input += chunk;
    });

    program
        .version(require('../package').version)
        .parse(process.argv);

    process.stdin.on('end', function () {
        if (program.help === true) {
            return;
        }

        var testPromise = new Promise(function (resolve) {
            var tests = JSON.parse(input);
            var runner = new Peg();
            var reporter = new SpecReporter(runner);
            return resolve(runner.run(tests));
        });

        testPromise
            .then(function () {
                exit(0);
            })
            .catch(function (err) {
                console.error(err);
                console.error(err.stack);
                exit(1);
            });
    });

}(require('commander'), require('bluebird'), require('exit'), require('../index'), require('../lib/reporters/spec')));