#!/usr/bin/env node
import yaml from 'js-yaml';
import { readFileSync } from 'fs';
import * as process from 'process';
import type { PnpmLockFile } from './types';

const lockFilePath:string = process.argv[process.argv.length - 1];
if (!lockFilePath) {
  console.error('no lock file');
  process.exit(0);
}

try {
  const doc = yaml.load(readFileSync(lockFilePath, 'utf8')) as PnpmLockFile;
  const map: Record<string, string[]> = {};
  Object.keys(doc.packages).forEach((pkg) => {
    const arr = pkg.split('/');
    const pkgName = arr.slice(0, -1).join('/');
    const version = arr[arr.length - 1];

    if (!map[pkgName]) {
      map[pkgName] = [];
    }
    map[pkgName].push(version);
  });

  Object.entries(map).forEach(([key, arr]) => {
    if (arr.length <= 1) {
      delete map[key];
    }
  });
  console.log(map);
} catch (e) {
  console.log(e);
}
