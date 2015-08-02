(function (chai, chaiAsPromised, dirtyChai) {
    chai.use(chaiAsPromised);
    chai.use(dirtyChai);
    chai.config.includeStack = true;

    module.exports = {
        expect: chai.expect
    };
}(require('chai'), require('chai-as-promised'), require('dirty-chai')));