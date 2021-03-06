'use strict';

const fs = require('fs-extra');
const path = require('path');
const pathToFolder = require('./pathToFolder');
const { promisify } = require('util');
const mkdirp = promisify(require('mkdirp'));

function write(dirPath, filename, data) {
  return fs.writeFile(path.join(dirPath, filename), data);
}

function isValidDirectoryName(name) {
  return name !== undefined && name !== '';
}

module.exports = function storageManager(baseDir, storagePathPrefix, useHash) {
  return {
    rootPathFromUrl(url) {
      return pathToFolder(url, useHash)
        .split('/')
        .filter(isValidDirectoryName)
        .map(() => '..')
        .join('/')
        .concat('/');
    },
    createDirectory(...subDirs) {
      const pathSegments = [baseDir, ...subDirs].filter(isValidDirectoryName);

      const dirPath = path.join.apply(null, pathSegments);
      return mkdirp(dirPath).then(() => dirPath);
    },
    writeData(data, filename) {
      return this.createDirectory('data').then(dir =>
        write(dir, filename, data)
      );
    },
    writeHtml(html, filename) {
      return this.createDirectory().then(dir => write(dir, filename, html));
    },
    getBaseDir() {
      return baseDir;
    },
    getStoragePrefix() {
      return storagePathPrefix;
    },
    copyToResultDir(filename) {
      return this.createDirectory().then(dir => fs.copy(filename, dir));
    },
    createDirForUrl(url, subDir) {
      return this.createDirectory(pathToFolder(url, useHash), subDir);
    },
    writeDataForUrl(data, filename, url, subDir) {
      return this.createDirectory(
        pathToFolder(url, useHash),
        'data',
        subDir
      ).then(dir => write(dir, filename, data));
    },
    writeHtmlForUrl(html, filename, url) {
      return this.createDirForUrl(url).then(dir => write(dir, filename, html));
    }
  };
};
