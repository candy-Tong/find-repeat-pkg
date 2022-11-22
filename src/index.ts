#!/usr/bin/env node
import yaml from 'js-yaml';
import * as fs from 'fs';
import * as process from 'process';
import * as path from 'path';
import fg from 'fast-glob';
import type { PnpmLockFile } from './types';
import { PackageJSON } from './types';

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

let lockFileData: PnpmLockFile;
try {
  lockFileData = yaml.load(fs.readFileSync(lockFilePath, 'utf8')) as PnpmLockFile;
} catch (e) {
  console.log(e);
  process.exit(1);
}

const map: Record<string, string[]> = {};
Object.keys(lockFileData.packages).forEach((pkg) => {
  const arr = pkg.split('/');
  const pkgName = arr.slice(1, -1).join('/');
  const version = arr[arr.length - 1];

  if (!map[pkgName]) {
    map[pkgName] = [];
  }
  map[pkgName].push(version);
});

const pkgSet = new Set();
function getAllPackage(file: string) {
  const str = fs.readFileSync(file, 'utf8');
  const pkg: PackageJSON = JSON.parse(str);
  Object.keys(pkg.peerDependency || {}).forEach((pkg) => pkgSet.add(pkg));
  Object.keys(pkg.dependency || {}).forEach((pkg) => pkgSet.add(pkg));
  Object.keys(pkg.devDependencies || {}).forEach((pkg) => pkgSet.add(pkg));
}

const entries = fg.sync(['**/package.json'], {
  ignore: ['**/node_modules/**'],
  cwd: root,
});
entries.forEach((file) => {
  getAllPackage(path.resolve(root, file));
});
console.log([...pkgSet]);

Object.entries(map).forEach(([key, arr]) => {
  if (arr.length <= 1) {
    delete map[key];
  } else if (!pkgSet.has(key)) {
    delete map[key];
  }
});

console.log(map);
