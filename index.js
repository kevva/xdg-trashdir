'use strict';
const fs = require('fs').promises;
const path = require('path');
const df = require('@sindresorhus/df');
const mountPoint = require('mount-point');
const userHome = require('user-home');
const xdgBasedir = require('xdg-basedir');

const check = async file => {
	const topuid = `${file}-${process.getuid()}`;
	const stickyBitMode = 17407;

	try {
		const stats = await fs.lstat(file);

		if (stats.isSymbolicLink() || stats.mode !== stickyBitMode) {
			return topuid;
		}

		return path.join(file, String(process.getuid()));
	} catch (error) {
		if (error.code === 'ENOENT') {
			return topuid;
		}

		return path.join(xdgBasedir.data, 'Trash');
	}
};

module.exports = async file => {
	if (process.platform !== 'linux') {
		return Promise.reject(new Error('Only Linux systems are supported'));
	}

	if (!file) {
		return Promise.resolve(path.join(xdgBasedir.data, 'Trash'));
	}

	const mountPoints = await Promise.all([
		mountPoint(userHome),
		// Ignore errors in case `file` is a dangling symlink
		mountPoint(file).catch(() => {})
	]);

	const homeMountPoint = mountPoints[0];
	const fileMountPoint = mountPoints[1];

	if (!fileMountPoint || fileMountPoint === homeMountPoint) {
		return path.join(xdgBasedir.data, 'Trash');
	}

	return check(path.join(fileMountPoint, '.Trash'));
};

module.exports.all = async () => {
	if (process.platform !== 'linux') {
		return Promise.reject(new Error('Only Linux systems are supported'));
	}

	return Promise.all((await df()).map(file => {
		if (file.mountpoint === '/') {
			return path.join(xdgBasedir.data, 'Trash');
		}

		return check(path.join(file.mountpoint, '.Trash'));
	}));
};
