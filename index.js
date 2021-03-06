(function (request, util, assert, Joi, Promise, create, EventEmitter) {
    var methods = ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE'];

    var statusCodes = [100, 101, 102, 200, 201, 202, 203, 204, 205, 206, 207, 300,
        301, 302, 303, 304, 305, 307, 308, 400, 401, 402, 403, 404, 405, 406, 407,
        408, 409, 410, 411, 412, 413, 414, 415, 416, 417, 418, 422, 423, 424, 425,
        426, 428, 429, 431, 500, 501, 502, 503, 504, 505, 506, 507, 509, 510, 511];

    var regexValueSchema = Joi.object().keys({
        expression: Joi.string().required(),
        flags: Joi.object().keys({
            ignoreCase: Joi.boolean().optional(),
            global: Joi.boolean().optional(),
            multiline: Joi.boolean().optional()
        }).unknown().optional()
    }).unknown().required();
    var testValueSchema = Joi.alternatives().try(Joi.string().required(), regexValueSchema);

    var testSchema = Joi.array().items(Joi.object().keys({
        title: Joi.string().optional(),
        target: Joi.object().keys({
            url: Joi.string().uri({
                scheme: ['http', 'https']
            }).required(),
            method: Joi.string().valid(methods).required(),
            headers: Joi.object().pattern(/.+/, Joi.string().required()).optional(),
            body: Joi.alternatives().when('method', {is: ['POST', 'PUT', 'PATCH'], then: Joi.alternatives().try(Joi.string().optional(), Joi.object().optional()), otherwise: Joi.forbidden()})
        }).unknown().required(),
        expect: Joi.object().keys({
            statusCode: Joi.alternatives().try(Joi.number().valid(statusCodes), regexValueSchema).optional(),
            headers: Joi.object().pattern(/.+/, testValueSchema.required()).optional(),
            body: Joi.alternatives().try(testValueSchema.optional(), Joi.object().optional(), Joi.func().optional())
        }).unknown()
    }).unknown().required()).single(true);

    var suitesSchema = Joi.object().keys({
        options: Joi.object().keys({
            followRedirects: Joi.boolean().default(false).optional(),
            persistCookies: Joi.boolean().default(false).optional(),
            runInParallel: Joi.boolean().default(false).optional()
        }).unknown().optional(),
        suite: Joi.object().keys({
            title: Joi.string().optional(),
            before: testSchema.optional(),
            beforeEach: testSchema.optional(),
            after: testSchema.optional(),
            afterEach: testSchema.optional(),
            tests: testSchema.required()
        }).unknown().required()
    }).unknown().required();

    function SuiteRunner() {
    }

    SuiteRunner.prototype = create(EventEmitter.prototype, {
        constructor: SuiteRunner
    });

    SuiteRunner.prototype.run = function runSuites(suites) {
        if (!suites) {
            return Promise.reject(new Error('Suites must either be an Array of suites or a single suite'));
        }

        if (!Array.isArray(suites)) {
            suites = [suites];
        }

        var self = this;
        self.emit('start', suites);
        return Promise.each(suites, function (suite) {
            return new Promise(function (resolve, reject) {
                var result = Joi.validate(suite, suitesSchema, {stripUnknown: true});

                if (result.error) {
                    return reject(result.error);
                }

                var validatedSuite = result.value.suite;
                self.suiteOptions = result.value.options || {};

                // For now, don't want to add the ability to nest suites, as I feel that would encourage test suites to be larger than I prefer. I think they should be small and simple, but it would allow for over-nesting and large test suites instead of focusing on small bits of functionality.
                return resolve(self.executeSuite(validatedSuite));
            });
        }).finally(function () {
            self.emit('end', suites);
        });
    };

    SuiteRunner.prototype.executeSuite = function executeSuite(suite) {
        var self = this;
        suite.title = suite.title || 'Suite';
        self.emit('suite', suite);
        var suiteCompletePromise;
        if (suite.before) {
            self.emit('before', suite.before);
            suiteCompletePromise = self.executeTestsSerial(suite.before).then(function () {
                self.emit('before end', suite.before);
            });
        } else {
            suiteCompletePromise = Promise.resolve();
        }

        suiteCompletePromise = suiteCompletePromise.then(function () {
            if (self.suiteOptions.runInParallel) {
                return self.executeTestsParallel(suite.tests, suite.beforeEach, suite.afterEach);
            }
            return self.executeTestsSerial(suite.tests, suite.beforeEach, suite.afterEach);
        });

        if (suite.after) {
            suiteCompletePromise = suiteCompletePromise.then(function () {
                self.emit('after', suite.after);
                return self.executeTestsSerial(suite.after).then(function () {
                    self.emit('after end', suite.after);
                });
            });
        }

        return suiteCompletePromise.then(function () {
            self.emit('suite end', suite);
        });
    };

    SuiteRunner.prototype.executeTestsSerial = function executeTestsSerial(tests, beforeEach, afterEach) {
        var self = this;
        var testsCompletePromise = Promise.resolve();
        tests.forEach(function (test) {
            testsCompletePromise = testsCompletePromise.then(function () {
                return self.executeTest(test, beforeEach, afterEach);
            });
        });
        return testsCompletePromise;
    };

    SuiteRunner.prototype.executeTestsParallel = function executeTestsParallel(tests, beforeEach, afterEach) {
        var self = this;
        return Promise.all(tests.map(function (test) {
            return self.executeTest(test, beforeEach, afterEach);
        }));
    };

    SuiteRunner.prototype.executeTest = function executeTest(test, beforeEach, afterEach) {
        var self = this;
        var testCompletePromise;

        if (beforeEach) {
            self.emit('beforeEach', beforeEach);
            testCompletePromise = self.executeTestsSerial(beforeEach).then(function () {
                self.emit('beforeEach end', beforeEach);
            });
        } else {
            testCompletePromise = Promise.resolve();
        }

        test.title = test.title || (test.target.method + ' ' + test.target.url);

        testCompletePromise = testCompletePromise.then(function () {
            //self.emit('pending', test);
            return self.executeRequest(test).then(function () {
                self.emit('pass', test);
            }, function (err) {
                self.emit('fail', test, err);
                return Promise.reject(err);
            }).finally(function () {
                self.emit('test end', test);
            });
        });

        if (afterEach) {
            self.emit('afterEach', afterEach);
            testCompletePromise = testCompletePromise.then(function () {
                return self.executeTestsSerial(afterEach).then(function () {
                    self.emit('afterEach end', afterEach);
                });
            });
        }

        return testCompletePromise;
    };

    SuiteRunner.prototype.executeRequest = function executeRequest(test) {
        var self = this;
        var options = {
            url: test.target.url,
            method: test.target.method,
            headers: test.target.headers,
            gzip: true,
            resolveWithFullResponse: true,
            body: test.target.body,
            json: typeof test.target.body === 'object',
            simple: false,
            jar: self.suiteOptions.persistCookies
        };
        return request(options)
            .then(function (response) {
                var resultPromise = Promise.resolve();
                if (test.expect) {
                    if (test.expect.statusCode) {
                        resultPromise = resultPromise.then(function () {
                            return validateTestValue(response.statusCode, test.expect.statusCode, 'statusCode');
                        });
                    }

                    if (test.expect.headers) {
                        Object.keys(test.expect.headers).forEach(function (header) {
                            resultPromise = resultPromise.then(function () {
                                var lcaseHeader = header.toLowerCase();
                                assert.ok(response.headers[lcaseHeader], util.format('Expected header "%s" to have value "%s" but it wasn\'t present', header, test.expect.headers[header]));
                                return validateTestValue(response.headers[lcaseHeader], test.expect.headers[header], util.format('header "%s"', header));
                            });
                        });
                    }

                    if (test.expect.body) {
                        resultPromise = resultPromise.then(function () {
                            return validateTestValue(response.body, test.expect.body, 'body');
                        });
                    }
                }

                return resultPromise;
            });
    };

    function validateTestValue(actual, expected, type) {
        return new Promise(function (resolve) {
            if (typeof expected === 'function') {
                return resolve(validateValueWithFunction(actual, expected, type));
            } else if (typeof expected === 'string' || typeof expected === 'number') {
                return resolve(validateValueAsEquivalent(actual, expected, type));
            } else if (typeof expected === 'object') {
                // If we have a Regex provided, use that.
                if (expected.expression) {
                    return resolve(validateValueWithRegExp(actual, expected, type));
                } else {
                    // Otherwise we have a JSON object, let's compare those.
                    return resolve(validateValueAsObject(actual, expected, type));
                }
            }
            resolve();
        });
    }

    function validateValueWithFunction(actual, expected, type) {
        return new Promise(function (resolve) {
            return resolve(expected(actual));
        }).then(function (result) {
                if (typeof result === 'boolean') {
                    if (!result) {
                        return Promise.reject(new Error(util.format('Expected %s "%s" to satisfy function "%s" but it did not', type, JSON.stringify(actual), expected.name || 'anonymous')));
                    }
                }

                return Promise.resolve();
            });
    }

    function validateValueAsObject(actual, expected, type) {
        return new Promise(function (resolve) {
            if (typeof actual === 'string') {
                // If we got a String back, let's make it JSON.
                actual = JSON.parse(actual);
            }

            assert.deepEqual(actual, expected, util.format('Expected %s "%s" to deep equal "%s" but it did not', type, JSON.stringify(actual), JSON.stringify(expected)));
            resolve();
        });
    }

    function validateValueAsEquivalent(actual, expected, type) {
        return new Promise(function (resolve) {
            assert.strictEqual(actual, expected, util.format('Expected %s to have value "%s" but it had value "%s"', type, expected, actual));
            resolve();
        });
    }

    function validateValueWithRegExp(actual, expected, type) {
        return new Promise(function (resolve) {
            var flags = '';
            expected.flags = expected.flags || {};
            if (expected.flags.ignoreCase) {
                flags += 'i';
            }
            if (expected.flags.global) {
                flags += 'g';
            }
            if (expected.flags.multiline) {
                flags += 'm';
            }
            var regex = new RegExp(expected.expression, flags);
            assert.ok(regex.test(actual), util.format('Expected %s to match "%s" with flags "%s" but "%s" did not match', type, regex.source, flags, actual));
            resolve();
        });
    }

    module.exports = SuiteRunner;
}(require('request-promise'), require('util'), require('assert'), require('joi'), require('bluebird'), require('lodash.create'), require('events').EventEmitter));