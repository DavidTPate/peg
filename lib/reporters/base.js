/**
 * Module dependencies.
 */

var tty = require('tty');
var ms = require('../ms');
var supportsColor = process.browser ? null : require('supports-color');

/**
 * Expose `Base`.
 */

exports = module.exports = Base;

/**
 * Check if both stdio streams are associated with a tty.
 */

var isatty = tty.isatty(1) && tty.isatty(2);

/**
 * Enable coloring by default, except in the browser interface.
 */

exports.useColors = !process.browser && supportsColor;

/**
 * Inline diffs instead of +/-
 */

exports.inlineDiffs = false;

/**
 * Default color map.
 */

exports.colors = {
    pass: 90,
    fail: 31,
    'bright pass': 92,
    'bright fail': 91,
    'bright yellow': 93,
    pending: 36,
    suite: 0,
    'error title': 0,
    'error message': 31,
    'error stack': 90,
    checkmark: 32,
    fast: 90,
    medium: 33,
    slow: 31,
    green: 32,
    light: 90,
    'diff gutter': 90,
    'diff added': 32,
    'diff removed': 31
};

/**
 * Default symbol map.
 */

exports.symbols = {
    ok: '✓',
    err: '✖',
    dot: '․'
};

// With node.js on Windows: use symbols available in terminal default fonts
if (process.platform === 'win32') {
    exports.symbols.ok = '\u221A';
    exports.symbols.err = '\u00D7';
    exports.symbols.dot = '.';
}

/**
 * Color `str` with the given `type`,
 * allowing colors to be disabled,
 * as well as user-defined color
 * schemes.
 *
 * @param {string} type
 * @param {string} str
 * @return {string}
 * @api private
 */
var color = exports.color = function (type, str) {
    return '\u001b[' + exports.colors[type] + 'm' + str + '\u001b[0m';
};

/**
 * Expose term window size, with some defaults for when stderr is not a tty.
 */

exports.window = {
    width: 75
};

if (isatty) {
    exports.window.width = process.stdout.getWindowSize
        ? process.stdout.getWindowSize(1)[0]
        : tty.getWindowSize()[1];
}

/**
 * Expose some basic cursor interactions that are common among reporters.
 */

exports.cursor = {
    hide: function () {
        isatty && process.stdout.write('\u001b[?25l');
    },

    show: function () {
        isatty && process.stdout.write('\u001b[?25h');
    },

    deleteLine: function () {
        isatty && process.stdout.write('\u001b[2K');
    },

    beginningOfLine: function () {
        isatty && process.stdout.write('\u001b[0G');
    },

    CR: function () {
        if (isatty) {
            exports.cursor.deleteLine();
            exports.cursor.beginningOfLine();
        } else {
            process.stdout.write('\r');
        }
    }
};

/**
 * Outut the given `failures` as a list.
 *
 * @param {Array} failures
 * @api public
 */

exports.list = function (failures) {
    console.log();
    failures.forEach(function (test, i) {
        // format
        var fmt = color('error title', '  %s) %s:\n')
            + color('error message', '     %s')
            + color('error stack', '\n%s\n');

        // msg
        var msg;
        var err = test.err;
        var message = err.message || '';
        var stack = err.stack || message;
        var index = stack.indexOf(message);

        if (index === -1) {
            msg = message;
        } else {
            index += message.length;
            msg = stack.slice(0, index);
            // remove msg from stack
            stack = stack.slice(index + 1);
        }

        // uncaught
        if (err.uncaught) {
            msg = 'Uncaught ' + msg;
        }

        // indent stack trace
        stack = stack.replace(/^/gm, '  ');

        console.log(fmt, (i + 1), test.fullTitle(), msg, stack);
    });
};

/**
 * Initialize a new `Base` reporter.
 *
 * All other reporters generally
 * inherit from this reporter, providing
 * stats such as test duration, number
 * of tests passed / failed etc.
 *
 * @param {Runner} runner
 * @api public
 */

function Base(runner) {
    var stats = this.stats = {suites: 0, tests: 0, passes: 0, pending: 0, failures: 0};
    var failures = this.failures = [];

    if (!runner) {
        return;
    }
    this.runner = runner;

    runner.stats = stats;

    runner.on('start', function () {
        stats.start = new Date();
    });

    runner.on('suite', function (suite) {
        stats.suites = stats.suites || 0;
        suite.root || stats.suites++;
    });

    runner.on('test end', function () {
        stats.tests = stats.tests || 0;
        stats.tests++;
    });

    runner.on('pass', function (test) {
        stats.passes = stats.passes || 0;

        if (test.duration > 250) {
            test.speed = 'slow';
        } else if (test.duration > 250 / 2) {
            test.speed = 'medium';
        } else {
            test.speed = 'fast';
        }

        stats.passes++;
    });

    runner.on('fail', function (test, err) {
        stats.failures = stats.failures || 0;
        stats.failures++;
        test.err = err;
        failures.push(test);
    });

    runner.on('end', function () {
        stats.end = new Date();
        stats.duration = new Date() - stats.start;
    });

    runner.on('pending', function () {
        stats.pending++;
    });
}

/**
 * Output common epilogue used by many of
 * the bundled reporters.
 *
 * @api public
 */
Base.prototype.epilogue = function () {
    var stats = this.stats;
    var fmt;

    console.log();

    // passes
    fmt = color('bright pass', ' ')
        + color('green', ' %d passing')
        + color('light', ' (%s)');

    console.log(fmt,
        stats.passes || 0,
        ms(stats.duration));

    // pending
    if (stats.pending) {
        fmt = color('pending', ' ')
            + color('pending', ' %d pending');

        console.log(fmt, stats.pending);
    }

    // failures
    if (stats.failures) {
        fmt = color('fail', '  %d failing');

        console.log(fmt, stats.failures);

        Base.list(this.failures);
        console.log();
    }

    console.log();
};