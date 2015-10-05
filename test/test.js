import {execFile} from 'child_process';
import path from 'path';
import test from 'ava';
import xdgBaseDir from 'xdg-basedir';
import pify from 'pify';
import trashdir from '../';

const exec = pify(execFile);

test('get the trash path', async t => {
	var dir = await trashdir();

	t.is(path.join(xdgBasedir.data, 'Trash'), dir);
});

test('get the trash path using a file', async t => {
	var dir = await trashdir('index.js');

	t.is(path.join(xdgBasedir.data, 'Trash'), dir);
});

if (!process.env.TRAVIS) {
	test('get the trash path on a mounted drive', async t => {
		var name = 'test-disk';
		var dirname = path.join(__dirname, '..', name, '.Trash-') + process.getuid();

		await exec(path.join(__dirname, 'mount_create'), [name]);

		var dir = await trashdir(path.join(__dirname, '..', name));
		t.is(dirname, dir);

		await exec(path.join(__dirname, 'mount_clean'), [name]);
	});

	test('get the trash path on a mounted drive with a top trash', async t => {
		var name = 'test-disk-top';
		var dirname = path.join(__dirname, '..', name, '.Trash', String(process.getuid()));

		await exec(path.join(__dirname, 'mount_create'), [name, '--with-trash']);

		var dir = await trashdir(path.join(__dirname, '..', name));
		t.is(dirname, dir);

		await exec(path.join(__dirname, 'mount_clean'), [name]);
	});
}
