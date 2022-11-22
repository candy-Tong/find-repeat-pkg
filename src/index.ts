#!/usr/bin/env node
import yaml from 'js-yaml';
import fs from 'fs';
import * as process from 'process';
import * as path from 'path';
import type { PnpmLockFile } from './types';

const root:string = process.argv.slice(2)[0];
if (!root) {
  console.error('no lock');
  process.exit(0);
}

// 找到 lock 文件路径
let lockFilePath: string = root;
try {
  const stat = fs.lstatSync(root);
  if (stat.isDirectory()) {
    lockFilePath = path.resolve(lockFilePath, './pnpm-lock.yaml');
  }
} catch (e) {
  console.error(e);
}

try {
  const doc = yaml.load(fs.readFileSync(lockFilePath, 'utf8')) as PnpmLockFile;
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
