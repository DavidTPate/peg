(function (helper, nock, Peg) {
    var expect = helper.expect;
    describe('HEAD Requests', function () {
        it('should execute a plain request', function () {
            var endpoint = nock('https://example.com')
                .head('/')
                .reply(200);

            return expect(new Peg().run({
                suite: {
                    tests: [
                        {
                            target: {
                                url: 'https://example.com',
                                method: 'HEAD'
                            }
                        }
                    ]
                }
            }).then(function () {
                expect(endpoint.isDone()).to.be.ok();
            })).to.eventually.be.fulfilled();
        });
        it('should make sure we get back the expected status code', function () {
            var endpoint = nock('https://example.com')
                .head('/')
                .reply(204);

            return expect(new Peg().run({
                suite: {
                    tests: [
                        {
                            target: {
                                url: 'https://example.com',
                                method: 'HEAD'
                            },
                            expect: {
                                statusCode: 200
                            }
                        }
                    ]
                }
            }).then(function () {
                expect(endpoint.isDone()).to.be.ok();
            })).to.eventually.be.rejectedWith(Error, 'Expected statusCode to have value "200" but it had value "204"');
        });
        it('should match the status code with our expected regex', function () {
            var endpoint = nock('https://example.com')
                .head('/')
                .reply(204);

            return expect(new Peg().run({
                suite: {
                    tests: [
                        {
                            target: {
                                url: 'https://example.com',
                                method: 'HEAD'
                            },
                            expect: {
                                statusCode: {
                                    expression: '^20[0-9]$'
                                }
                            }
                        }
                    ]
                }
            }).then(function () {
                expect(endpoint.isDone()).to.be.ok();
            })).to.eventually.be.fulfilled();
        });
        it('should make sure we get back a status code matching our expected regex', function () {
            var endpoint = nock('https://example.com')
                .head('/')
                .reply(400);

            return expect(new Peg().run({
                suite: {
                    tests: [
                        {
                            target: {
                                url: 'https://example.com',
                                method: 'HEAD'
                            },
                            expect: {
                                statusCode: {
                                    expression: '^20[0-9]$'
                                }
                            }
                        }
                    ]
                }
            }).then(function () {
                expect(endpoint.isDone()).to.be.ok();
            })).to.eventually.be.rejectedWith(Error, 'Expected statusCode to match "^20[0-9]$" with flags "" but "400" did not match');
        });
        it('should execute a request with a header to send', function () {
            var endpoint = nock('https://example.com')
                .matchHeader('authorization', 'Auth')
                .head('/')
                .reply(200, '', {
                    SomeHeader: 'Value'
                });

            return expect(new Peg().run({
                suite: {
                    tests: [
                        {
                            target: {
                                url: 'https://example.com',
                                method: 'HEAD',
                                headers: {
                                    authorization: 'Auth'
                                }
                            }
                        }
                    ]
                }
            }).then(function () {
                expect(endpoint.isDone()).to.be.ok();
            })).to.eventually.be.fulfilled();
        });
        it('should make sure our expected header exists', function () {
            var endpoint = nock('https://example.com')
                .head('/')
                .reply(200);

            return expect(new Peg().run({
                suite: {
                    tests: [
                        {
                            target: {
                                url: 'https://example.com',
                                method: 'HEAD'
                            },
                            expect: {
                                headers: {
                                    SomeHeader: 'Value'
                                }
                            }
                        }
                    ]
                }
            }).then(function () {
                expect(endpoint.isDone()).to.be.ok();
            })).to.eventually.be.rejectedWith(Error, 'Expected header "SomeHeader" to have value "Value" but it wasn\'t present');
        });
        it('should make sure we get back the expected header', function () {
            var endpoint = nock('https://example.com')
                .head('/')
                .reply(200, '', {
                    SomeHeader: 'Value'
                });

            return expect(new Peg().run({
                suite: {
                    tests: [
                        {
                            target: {
                                url: 'https://example.com',
                                method: 'HEAD'
                            },
                            expect: {
                                headers: {
                                    SomeHeader: 'Value'
                                }
                            }
                        }
                    ]
                }
            }).then(function () {
                expect(endpoint.isDone()).to.be.ok();
            })).to.eventually.be.fulfilled();
        });
        it('should match the expected header with our regex', function () {
            var endpoint = nock('https://example.com')
                .head('/')
                .reply(200, '', {
                    SomeHeader: 'Value'
                });

            return expect(new Peg().run({
                suite: {
                    tests: [
                        {
                            target: {
                                url: 'https://example.com',
                                method: 'HEAD'
                            },
                            expect: {
                                headers: {
                                    SomeHeader: {
                                        expression: '^V[a-z]+$'
                                    }
                                }
                            }
                        }
                    ]
                }
            }).then(function () {
                expect(endpoint.isDone()).to.be.ok();
            })).to.eventually.be.fulfilled();
        });
        it('should make sure the expected header matches our regex', function () {
            var endpoint = nock('https://example.com')
                .head('/')
                .reply(200, '', {
                    SomeHeader: 'Value'
                });

            return expect(new Peg().run({
                suite: {
                    tests: [
                        {
                            target: {
                                url: 'https://example.com',
                                method: 'HEAD'
                            },
                            expect: {
                                headers: {
                                    SomeHeader: {
                                        expression: '^[a-z]+$'
                                    }
                                }
                            }
                        }
                    ]
                }
            }).then(function () {
                expect(endpoint.isDone()).to.be.ok();
            })).to.eventually.be.rejectedWith(Error, 'Expected header "SomeHeader" to match "^[a-z]+$" with flags "" but "Value" did not match');
        });

        it('should make sure the expected header matches our regex with flags', function () {
            var endpoint = nock('https://example.com')
                .head('/')
                .reply(200, '', {
                    SomeHeader: 'Value'
                });

            return expect(new Peg().run({
                suite: {
                    tests: [
                        {
                            target: {
                                url: 'https://example.com',
                                method: 'HEAD'
                            },
                            expect: {
                                headers: {
                                    SomeHeader: {
                                        expression: '^[a-z]+$',
                                        flags: {
                                            ignoreCase: true
                                        }
                                    }
                                }
                            }
                        }
                    ]
                }
            }).then(function () {
                expect(endpoint.isDone()).to.be.ok();
            })).to.eventually.be.fulfilled();
        });
    });
}(require('./helper'), require('nock'), require('../index')));