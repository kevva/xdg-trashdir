'use strict';
var fs = require('fs');
var path = require('path');
var mountPoint = require('mount-point');
var userHome = require('user-home');
var xdgBasedir = require('xdg-basedir');

module.exports = function (file, cb) {
	if (typeof file === 'function' && !cb) {
		cb = file;
		file = undefined;
	}

	if (process.platform !== 'linux') {
		throw new Error('Only Linux systems are supported');
	}

	if (!file) {
		cb(null, path.join(xdgBasedir.data, 'Trash'));
		return;
	}

	mountPoint(userHome, function (err, ret) {
		if (err) {
			cb(err);
			return;
		}

		mountPoint(file, function (err, res) {
			if (err) {
				cb(err);
				return;
			}

			if (res.mount === ret.mount) {
				cb(null, path.join(xdgBasedir.data, 'Trash'));
				return;
			}

			var top = path.join(res.mount, '.Trash');
			var topuid = top + '-' + process.getuid();
			var stickyBitMode = 17407;

			fs.lstat(top, function (err, stats) {
				if (err && err.code === 'ENOENT') {
					cb(null, topuid);
					return;
				}

				if (err) {
					cb(null, path.join(xdgBasedir.data, 'Trash'));
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
