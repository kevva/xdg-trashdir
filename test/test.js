'use strict';

var base = require('xdg-basedir');
var exec = require('child_process').exec;
var path = require('path');
var test = require('ava');
var trashdir = require('../');

test('get the trash path', function (t) {
	t.plan(2);

	trashdir(function (err, dir) {
		t.assert(!err);
		t.assert(dir === path.join(base.data, 'Trash'));
	});
});

test('get the trash path using a file', function (t) {
	t.plan(2);

	trashdir('index.js', function (err, dir) {
		t.assert(!err);
		t.assert(dir === path.join(base.data, 'Trash'));
	});
});

test('get the trash path on a mounted drive', function (t) {
	t.plan(3);

	var name = 'test-disk';
	var dirname = path.join(__dirname, '..', name, '.Trash-') + process.getuid();

	exec(path.join(__dirname, 'mount_create') + ' ' + name, function (err) {
		t.assert(!err);

		trashdir(path.join(__dirname, '..', name), function (err, dir) {
			t.assert(dir === dirname);

			exec(path.join(__dirname, 'mount_clean') + ' ' + name, function (err) {
				t.assert(!err);
			});
		});
	});
});

test('get the trash path on a mounted drive with a top trash', function (t) {
	t.plan(3);

	var name = 'test-disk-top';
	var dirname = path.join(__dirname, '..', name, '.Trash', String(process.getuid()));

	exec(path.join(__dirname, 'mount_create') + ' ' + name + ' --with-trash', function (err) {
		t.assert(!err);

		trashdir(path.join(__dirname, '..', name), function (err, dir) {
			t.assert(dir === dirname);
		});

		exec(path.join(__dirname, 'mount_clean') + ' ' + name, function (err) {
			t.assert(!err);
		});
	});
});
