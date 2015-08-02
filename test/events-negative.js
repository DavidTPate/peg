(function (helper, Peg) {
    var expect = helper.expect;
    describe('Negative Event Tests', function () {
        it('shouldn\'t be able to execute an empty event', function () {
            return expect(Peg({})).to.eventually.be.rejectedWith(Error, 'child \"suite\" fails because [\"suite\" is required]');
        });
        it('shouldn\'t be able to execute an event with an invalid suite', function () {
            return expect(Peg({suite: 42})).to.eventually.be.rejectedWith(Error, 'child "suite" fails because ["suite" must be an object]');
        });
        it('shouldn\'t be able to execute an event without tests', function () {
            return expect(Peg({suite: {}})).to.eventually.be.rejectedWith(Error, 'child "suite" fails because [child "tests" fails because ["tests" is required]]');
        });
        it('shouldn\'t be able to execute an event with invalid tests', function () {
            return expect(Peg({suite: {tests: 42}})).to.eventually.be.rejectedWith(Error, 'child \"suite\" fails because [child \"tests\" fails because [\"tests\" does not contain 1 required value(s)]]');
        });
        it('shouldn\'t be able to execute an event with no tests', function () {
            return expect(Peg({suite: {tests: []}})).to.eventually.be.rejectedWith(Error, 'child \"suite\" fails because [child \"tests\" fails because [\"tests\" does not contain 1 required value(s)]]');
        });
        it('shouldn\'t be able to execute an event without a target', function () {
            return expect(Peg({suite: {tests: [{}]}})).to.eventually.be.rejectedWith(Error, 'child \"suite\" fails because [child \"tests\" fails because [\"tests\" does not contain 1 required value(s)]]');
        });
        it('shouldn\'t be able to execute an event without a url', function () {
            return expect(Peg({suite: {tests: [{target: {}}]}})).to.eventually.be.rejectedWith(Error, 'child \"suite\" fails because [child \"tests\" fails because [\"tests\" does not contain 1 required value(s)]]');
        });
        it('shouldn\'t be able to execute an event with a non-http/https url', function () {
            return expect(Peg({suite: {tests: [{target: {url: 'ftp://asdf.com'}}]}})).to.eventually.be.rejectedWith(Error, 'child \"suite\" fails because [child \"tests\" fails because [\"tests\" does not contain 1 required value(s)]]');
        });
        it('shouldn\'t be able to execute an event without a method', function () {
            return expect(Peg({suite: {tests: [{target: {url: 'http://asdf.com'}}]}})).to.eventually.be.rejectedWith(Error, 'child \"suite\" fails because [child \"tests\" fails because [\"tests\" does not contain 1 required value(s)]]');
        });
        it('shouldn\'t be able to execute an event with an invalid method', function () {
            return expect(Peg({
                suite: {
                    tests: [{
                        target: {
                            url: 'http://asdf.com',
                            method: 'SMILE'
                        }
                    }]
                }
            })).to.eventually.be.rejectedWith(Error, 'child \"suite\" fails because [child \"tests\" fails because [\"tests\" does not contain 1 required value(s)]]');
        });
        it('shouldn\'t be able to execute an event with invalid headers', function () {
            return expect(Peg({
                suite: {
                    tests: [{
                        target: {
                            url: 'http://asdf.com',
                            method: 'HEAD',
                            headers: 42
                        }
                    }]
                }
            })).to.eventually.be.rejectedWith(Error, 'child \"suite\" fails because [child \"tests\" fails because [\"tests\" does not contain 1 required value(s)]]');
        });
        it('shouldn\'t be able to execute an event with an invalid header', function () {
            return expect(Peg({
                suite: {
                    tests: [{
                        target: {
                            url: 'http://asdf.com',
                            method: 'HEAD',
                            headers: {asdf: 42}
                        }
                    }]
                }
            })).to.eventually.be.rejectedWith(Error, 'child \"suite\" fails because [child \"tests\" fails because [\"tests\" does not contain 1 required value(s)]]');
        });
    });

}(require('./helper'), require('../index')));