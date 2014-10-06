'use strict';

var base = require('xdg-basedir');
var fs = require('fs');
var mkdir = require('mkdirp');
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

		fs.exists(top, function (exists) {
			if (exists) {
				return fs.lstat(top, function (err, stats) {
					if (err) {
						cb(null, path.join(base.data, 'Trash'));
						return;
					}

					if (stats.isSymbolicLink()) {
						mkdir(topuid, function (err) {
							if (err) {
								cb(null, path.join(base.data, 'Trash'));
								return;
							}

							cb(null, topuid);
							return;
						});
					}

					mkdir(path.join(top, String(process.getuid())), function (err) {
						if (err) {
							cb(null, path.join(base.data, 'Trash'));
							return;
						}

						cb(null, path.join(top, String(process.getuid())));
						return;
					});
				});
			}

			mkdir(topuid, function (err) {
				if (err) {
					cb(null, path.join(base.data, 'Trash'));
					return;
				}

				cb(null, topuid);
			});
		});
	});
};
