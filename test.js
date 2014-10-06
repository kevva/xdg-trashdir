'use strict';

var base = require('xdg-basedir');
var path = require('path');
var test = require('ava');
var trashdir = require('./');

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
