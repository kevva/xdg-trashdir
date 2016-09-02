'use strict';
const fs = require('fs');
const path = require('path');
const df = require('@sindresorhus/df');
const mountPoint = require('mount-point');
const userHome = require('user-home');
const xdgBasedir = require('xdg-basedir');
const pify = require('pify');

const check = file => {
	const topuid = `${file}-${process.getuid()}`;
	const stickyBitMode = 17407;

	return pify(fs.lstat)(file)
		.then(stats => {
			if (stats.isSymbolicLink() || stats.mode !== stickyBitMode) {
				return topuid;
			}

			return path.join(file, String(process.getuid()));
		})
		.catch(err => {
			if (err.code === 'ENOENT') {
				return topuid;
			}

			return path.join(xdgBasedir.data, 'Trash');
		});
};

module.exports = file => {
	if (process.platform !== 'linux') {
		return Promise.reject(new Error('Only Linux systems are supported'));
	}

	if (!file) {
		return Promise.resolve(path.join(xdgBasedir.data, 'Trash'));
	}

	return Promise.all([
		mountPoint(userHome),
		mountPoint(file)
	]).then(result => {
		const ret = result[0];
		const res = result[1];

		if (ret === res) {
			return path.join(xdgBasedir.data, 'Trash');
		}

		return check(path.join(res, '.Trash'));
	});
};

module.exports.all = () => {
	if (process.platform !== 'linux') {
		return Promise.reject(new Error('Only Linux systems are supported'));
	}

	return df().then(list => Promise.all(list.map(x => {
		if (x.mountpoint === '/') {
			return path.join(xdgBasedir.data, 'Trash');
		}

		return check(path.join(x.mountpoint, '.Trash'));
	})));
};
