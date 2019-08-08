import fs from 'fs';
import path from 'path';
import test from 'ava';
import xdgBasedir from 'xdg-basedir';
import execa from 'execa';
import trashdir from '..';

test('get the trash path', async t => {
	const dir = await trashdir();
	t.is(path.join(xdgBasedir.data, 'Trash'), dir);
});

test('get all trash paths', async t => {
	const dirs = await trashdir.all();
	t.truthy(dirs.length);
});

test('get the trash path using a file', async t => {
	const dir = await trashdir(path.join(__dirname, '../index.js'));
	t.is(path.join(xdgBasedir.data, 'Trash'), dir);
});

test('get the trash path using a dangling symlink', async t => {
	const filename = path.join(__dirname, 'dangly');
	fs.symlinkSync('nonexistent', filename);

	const dir = await trashdir(filename);
	t.is(path.join(xdgBasedir.data, 'Trash'), dir);

	fs.unlinkSync(filename);
});

if (!process.env.CI) {
	test('get the trash path on a mounted drive', async t => {
		const name = path.join(__dirname, 'test-disk');
		const dirname = path.join(name, '.Trash-') + process.getuid();

		await execa(path.join(__dirname, 'mount_create'), [name]);

		const dir = await trashdir(name);
		t.is(dirname, dir);

		await execa(path.join(__dirname, 'mount_clean'), [name]);
	});

	test('get the trash path on a mounted drive with a top trash', async t => {
		const name = path.join(__dirname, 'test-disk-top');
		const dirname = path.join(name, '.Trash', String(process.getuid()));

		await execa(path.join(__dirname, 'mount_create'), [name, '--with-trash']);

		const dir = await trashdir(name);
		t.is(dirname, dir);

		await execa(path.join(__dirname, 'mount_clean'), [name]);
	});
}
