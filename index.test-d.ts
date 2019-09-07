import {expectType} from 'tsd';
import xdgTrashdir = require('.');

expectType<Promise<string>>(xdgTrashdir());
expectType<Promise<string>>(xdgTrashdir(__filename));
expectType<Promise<string[]>>(xdgTrashdir.all());
