(function (helper, nock, Peg) {
    var expect = helper.expect;
    describe('Suites', function () {
        it('should be able to specify only a before with a test', function () {
            var beforeEndpoint = nock('https://example.com')
                .get('/before')
                .reply(200);

            var testEndpoint = nock('https://example.com')
                .get('/test')
                .reply(200);

            return expect(new Peg().run({
                suite: {
                    before: [
                        {
                            target: {
                                url: 'https://example.com/before',
                                method: 'GET'
                            },
                            expect: {
                                statusCode: 200
                            }
                        }
                    ],
                    tests: [
                        {
                            target: {
                                url: 'https://example.com/test',
                                method: 'GET'
                            },
                            expect: {
                                statusCode: 200
                            }
                        }
                    ]
                }
            }).then(function () {
                expect(beforeEndpoint.isDone()).to.be.ok();
                expect(testEndpoint.isDone()).to.be.ok();
            })).to.eventually.be.fulfilled();
        });

        it('should be able to specify only an after with a test', function () {
            var afterEndpoint = nock('https://example.com')
                .get('/after')
                .reply(200);

            var testEndpoint = nock('https://example.com')
                .get('/test')
                .reply(200);

            return expect(new Peg().run({
                suite: {
                    after: [
                        {
                            target: {
                                url: 'https://example.com/after',
                                method: 'GET'
                            },
                            expect: {
                                statusCode: 200
                            }
                        }
                    ],
                    tests: [
                        {
                            target: {
                                url: 'https://example.com/test',
                                method: 'GET'
                            },
                            expect: {
                                statusCode: 200
                            }
                        }
                    ]
                }
            }).then(function () {
                expect(afterEndpoint.isDone()).to.be.ok();
                expect(testEndpoint.isDone()).to.be.ok();
            })).to.eventually.be.fulfilled();
        });

        it('should be able to specify only a beforeEach with a test', function () {
            var beforeEachEndpoint = nock('https://example.com')
                .get('/beforeEach')
                .reply(200);

            var testEndpoint = nock('https://example.com')
                .get('/test')
                .reply(200);

            return expect(new Peg().run({
                suite: {
                    beforeEach: [
                        {
                            target: {
                                url: 'https://example.com/beforeEach',
                                method: 'GET'
                            },
                            expect: {
                                statusCode: 200
                            }
                        }
                    ],
                    tests: [
                        {
                            target: {
                                url: 'https://example.com/test',
                                method: 'GET'
                            },
                            expect: {
                                statusCode: 200
                            }
                        }
                    ]
                }
            }).then(function () {
                expect(beforeEachEndpoint.isDone()).to.be.ok();
                expect(testEndpoint.isDone()).to.be.ok();
            })).to.eventually.be.fulfilled();
        });

        it('should be able to specify only an afterEach with a test', function () {
            var afterEachEndpoint = nock('https://example.com')
                .get('/afterEach')
                .reply(200);

            var testEndpoint = nock('https://example.com')
                .get('/test')
                .reply(200);

            return expect(new Peg().run({
                suite: {
                    afterEach: [
                        {
                            target: {
                                url: 'https://example.com/afterEach',
                                method: 'GET'
                            },
                            expect: {
                                statusCode: 200
                            }
                        }
                    ],
                    tests: [
                        {
                            target: {
                                url: 'https://example.com/test',
                                method: 'GET'
                            },
                            expect: {
                                statusCode: 200
                            }
                        }
                    ]
                }
            }).then(function () {
                expect(afterEachEndpoint.isDone()).to.be.ok();
                expect(testEndpoint.isDone()).to.be.ok();
            })).to.eventually.be.fulfilled();
        });

        it('should be able to specify a before, after, beforeEach, and afterEach', function () {
            var beforeEndpoint = nock('https://example.com')
                .get('/before')
                .reply(200);

            var afterEndpoint = nock('https://example.com')
                .get('/after')
                .reply(200, function(uri, requestBody, cb) {
                    cb(afterEachEndpoint.isDone() ? null : new Error('Expected afterEach to be called before after'));
                });

            var beforeEachEndpoint = nock('https://example.com')
                .get('/beforeEach')
                .reply(200, function(uri, requestBody, cb) {
                    cb(beforeEndpoint.isDone() ? null : new Error('Expected before to be called before beforeEach'));
                });

            var afterEachEndpoint = nock('https://example.com')
                .get('/afterEach')
                .reply(200, function(uri, requestBody, cb) {
                    cb(testEndpoint.isDone() ? null : new Error('Expected tests to be called before afterEach'));
                });

            var testEndpoint = nock('https://example.com')
                .get('/test')
                .reply(200, function(uri, requestBody, cb) {
                    cb(beforeEachEndpoint.isDone() ? null : new Error('Expected beforeEach to be called before tests'));
                });

            return expect(new Peg().run({
                suite: {
                    before: [
                        {
                            target: {
                                url: 'https://example.com/before',
                                method: 'GET'
                            },
                            expect: {
                                statusCode: 200
                            }
                        }
                    ],
                    beforeEach: [
                        {
                            target: {
                                url: 'https://example.com/beforeEach',
                                method: 'GET'
                            },
                            expect: {
                                statusCode: 200
                            }
                        }
                    ],
                    after: [
                        {
                            target: {
                                url: 'https://example.com/after',
                                method: 'GET'
                            },
                            expect: {
                                statusCode: 200
                            }
                        }
                    ],
                    afterEach: [
                        {
                            target: {
                                url: 'https://example.com/afterEach',
                                method: 'GET'
                            },
                            expect: {
                                statusCode: 200
                            }
                        }
                    ],
                    tests: [
                        {
                            target: {
                                url: 'https://example.com/test',
                                method: 'GET'
                            },
                            expect: {
                                statusCode: 200
                            }
                        }
                    ]
                }
            }).then(function () {
                expect(beforeEndpoint.isDone()).to.be.ok();
                expect(afterEndpoint.isDone()).to.be.ok();
                expect(beforeEachEndpoint.isDone()).to.be.ok();
                expect(afterEachEndpoint.isDone()).to.be.ok();
                expect(testEndpoint.isDone()).to.be.ok();
            })).to.eventually.be.fulfilled();
        });

        it('should execute tests in serial by default', function () {
            var firstTestEndpoint = nock('https://example.com')
                .get('/test')
                .reply(200);

            var secondTestEndpoint = nock('https://example.com')
                .get('/test2')
                .reply(200, function(uri, requestBody, cb) {
                    if (!firstTestEndpoint.isDone()) {
                        return cb(new Error('Expected first to be hit...uh...first'));
                    }
                    cb(null, '');
                });

            var thirdTestEndpoint = nock('https://example.com')
                .get('/test3')
                .reply(200, function(uri, requestBody, cb) {
                    if (!firstTestEndpoint.isDone()) {
                        return cb(new Error('Expected second to be hit second'));
                    }
                    cb(null, '');
                });

            return expect(new Peg().run({
                suite: {
                    tests: [
                        {
                            target: {
                                url: 'https://example.com/test',
                                method: 'GET'
                            },
                            expect: {
                                statusCode: 200
                            }
                        },
                        {
                            target: {
                                url: 'https://example.com/test2',
                                method: 'GET'
                            },
                            expect: {
                                statusCode: 200
                            }
                        },
                        {
                            target: {
                                url: 'https://example.com/test3',
                                method: 'GET'
                            },
                            expect: {
                                statusCode: 200
                            }
                        }
                    ]
                }
            }).then(function () {
                expect(firstTestEndpoint.isDone()).to.be.ok();
                expect(secondTestEndpoint.isDone()).to.be.ok();
                expect(thirdTestEndpoint.isDone()).to.be.ok();
            })).to.eventually.be.fulfilled();
        });

        it('should be able to execute tests in parallel', function () {
            // TODO: The fact that these run in parallel can be validated visually, but programatically I haven't figured out a good way yet.
            var testEndpoint = nock('https://example.com')
                .get('/test')
                .reply(200);

            var delayedTestEndpoint = nock('https://example.com')
                .get('/delayedTest')
                .delayConnection(250)
                .reply(200);

            return expect(new Peg().run({
                options: {
                    runInParallel: true
                },
                suite: {
                    tests: [
                        {
                            target: {
                                url: 'https://example.com/delayedTest',
                                method: 'GET'
                            },
                            expect: {
                                statusCode: 200
                            }
                        },
                        {
                            target: {
                                url: 'https://example.com/test',
                                method: 'GET'
                            },
                            expect: {
                                statusCode: 200
                            }
                        }
                    ]
                }
            }).then(function () {
                expect(testEndpoint.isDone()).to.be.ok();
                expect(delayedTestEndpoint.isDone()).to.be.ok();
            })).to.eventually.be.fulfilled();
        });

        it('should be able to specify multiple a before, after, beforeEach, and afterEach', function () {
            var beforeFirstEndpoint = nock('https://example.com')
                .get('/before1')
                .reply(200);

            var afterFirstEndpoint = nock('https://example.com')
                .get('/after1')
                .reply(200);

            var beforeEachFirstEndpoint = nock('https://example.com')
                .get('/beforeEach1')
                .twice()
                .reply(200);

            var afterEachFirstEndpoint = nock('https://example.com')
                .get('/afterEach1')
                .twice()
                .reply(200);

            var testFirstEndpoint = nock('https://example.com')
                .get('/test1')
                .reply(200);

            var beforeSecondEndpoint = nock('https://example.com')
                .get('/before2')
                .reply(200);

            var afterSecondEndpoint = nock('https://example.com')
                .get('/after2')
                .reply(200);

            var beforeEachSecondEndpoint = nock('https://example.com')
                .get('/beforeEach2')
                .twice()
                .reply(200);

            var afterEachSecondEndpoint = nock('https://example.com')
                .get('/afterEach2')
                .twice()
                .reply(200);

            var testSecondEndpoint = nock('https://example.com')
                .get('/test2')
                .reply(200);

            return expect(new Peg().run({
                suite: {
                    before: [
                        {
                            target: {
                                url: 'https://example.com/before1',
                                method: 'GET'
                            },
                            expect: {
                                statusCode: 200
                            }
                        },
                        {
                            target: {
                                url: 'https://example.com/before2',
                                method: 'GET'
                            },
                            expect: {
                                statusCode: 200
                            }
                        }
                    ],
                    beforeEach: [
                        {
                            target: {
                                url: 'https://example.com/beforeEach1',
                                method: 'GET'
                            },
                            expect: {
                                statusCode: 200
                            }
                        },
                        {
                            target: {
                                url: 'https://example.com/beforeEach2',
                                method: 'GET'
                            },
                            expect: {
                                statusCode: 200
                            }
                        }
                    ],
                    after: [
                        {
                            target: {
                                url: 'https://example.com/after1',
                                method: 'GET'
                            },
                            expect: {
                                statusCode: 200
                            }
                        },
                        {
                            target: {
                                url: 'https://example.com/after2',
                                method: 'GET'
                            },
                            expect: {
                                statusCode: 200
                            }
                        }
                    ],
                    afterEach: [
                        {
                            target: {
                                url: 'https://example.com/afterEach1',
                                method: 'GET'
                            },
                            expect: {
                                statusCode: 200
                            }
                        },
                        {
                            target: {
                                url: 'https://example.com/afterEach2',
                                method: 'GET'
                            },
                            expect: {
                                statusCode: 200
                            }
                        }
                    ],
                    tests: [
                        {
                            target: {
                                url: 'https://example.com/test1',
                                method: 'GET'
                            },
                            expect: {
                                statusCode: 200
                            }
                        },
                        {
                            target: {
                                url: 'https://example.com/test2',
                                method: 'GET'
                            },
                            expect: {
                                statusCode: 200
                            }
                        }
                    ]
                }
            }).then(function () {
                expect(beforeFirstEndpoint.isDone()).to.be.ok();
                expect(beforeSecondEndpoint.isDone()).to.be.ok();
                expect(afterFirstEndpoint.isDone()).to.be.ok();
                expect(afterSecondEndpoint.isDone()).to.be.ok();
                expect(beforeEachFirstEndpoint.isDone()).to.be.ok();
                expect(beforeEachSecondEndpoint.isDone()).to.be.ok();
                expect(afterEachFirstEndpoint.isDone()).to.be.ok();
                expect(afterEachSecondEndpoint.isDone()).to.be.ok();
                expect(testFirstEndpoint.isDone()).to.be.ok();
                expect(testSecondEndpoint.isDone()).to.be.ok();
            })).to.eventually.be.fulfilled();
        });
    });
}(require('./helper'), require('nock'), require('../index')));