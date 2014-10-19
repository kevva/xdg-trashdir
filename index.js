'use strict';

var base = require('xdg-basedir');
var fs = require('fs');
var mount = require('mount-point');
var path = require('path');

/**
 * Get the correct trash path on Linux
 *
 * @param {String} file
 * @param {Function} cb
 * @api public
 */

module.exports = function (file, cb) {
	if (typeof file === 'function' && !cb) {
		cb = file;
		file = undefined;
	}

	if (process.platform !== 'linux') {
		cb(new Error('Only Linux systems are supported'));
		return;
	}

	if (!file) {
		cb(null, path.join(base.data, 'Trash'));
		return;
	}

	mount(file, function (err, res) {
		if (err) {
			cb(err);
			return;
		}

		if (res.mount === '/') {
			cb(null, path.join(base.data, 'Trash'));
			return;
		}

		var top = path.join(res.mount, '.Trash');
		var topuid = top + '-' + process.getuid();
		var stickyBitMode = 17407;

		fs.exists(top, function (exists) {
			if (!exists) {
				cb(null, topuid);
				return;
			}

			fs.lstat(top, function (err, stats) {
				if (err) {
					cb(null, path.join(base.data, 'Trash'));
					return;
				}

				if (stats.isSymbolicLink() || stats.mode !== stickyBitMode) {
					cb(null, topuid);
					return;
				}

				cb(null, path.join(top, String(process.getuid())));
			});
		});
	});
};
