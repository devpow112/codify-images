import { basename, extname, join, resolve as resolvePath } from 'path';
import { InvalidPathError, UnsupportedTypeError } from './errors.js';
import { readdirSync, readFileSync } from 'fs';
import camelCase from 'lodash.camelcase';
import svgToMiniDataURI from 'mini-svg-data-uri';

const svgExtension = '.svg';
const supportedMimeTypes = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml'
};

const isObject = value => {
  return Object.prototype.toString.call(value) === '[object Object]';
};

const getFormat = (isSvg, options) => {
  return isSvg && options.svgDisableBase64 === true ? 'utf-8' : 'base64';
};

const sanitizeFileData = data => {
  return data.replace(/[\r\n]+/gm, '');
};

const buildDataUri = (isSvg, source, mime, format, options) => {
  return isSvg && options.svgDisableBase64 === true ?
    svgToMiniDataURI(source) :
    `data:${mime};${format},${source}`;
};

const isSupported = extension => {
  return supportedMimeTypes[extension] !== undefined;
};

const getImageDataUri = (path, mime, isSvg, options) => {
  const format = getFormat(isSvg, options);
  const source = sanitizeFileData(readFileSync(path, format));

  return buildDataUri(isSvg, source, mime, format, options);
};

const processFile = (path, extension, options) => {
  const mime = supportedMimeTypes[extension];
  const isSvg = mime === supportedMimeTypes[svgExtension];

  return {
    path,
    name: camelCase(basename(path)),
    data: getImageDataUri(path, mime, isSvg, options)
  };
};

const processFiles = (path, files, options) => {
  const images = {};

  for (const file of files) {
    const filePath = join(path, file);
    const extension = extname(filePath);

    if (!isSupported(extension)) {
      if (options.ignoreUnsupportedTypes === true) {
        continue;
      } else {
        throw new UnsupportedTypeError(extension);
      }
    }

    const image = processFile(filePath, extension, options);

    images[image.name] = image.data;

    options.log?.(image.path, image.name);
  }

  return images;
};

const hasObjectProperty = (options, property) => {
  return Object.prototype.hasOwnProperty.call(options, property);
};

const sanitizeOptions = options => {
  if (!isObject(options)) {
    options = {};
  }

  if (!hasObjectProperty(options, 'ignoreUnsupportedTypes')) {
    options.ignoreUnsupportedTypes = true;
  }

  if (!hasObjectProperty(options, 'svgDisableBase64')) {
    options.svgDisableBase64 = false;
  }

  return options;
};

export const codifyImagesSync = (path, options = {}) => {
  let files;

  try {
    files = readdirSync(resolvePath(path));
  } catch (_) {
    throw new InvalidPathError(path);
  }

  return processFiles(path, files, sanitizeOptions(options));
};

export const codifyImages = (path, options = {}) => {
  return new Promise((resolve, reject) => {
    try {
      resolve(codifyImagesSync(path, sanitizeOptions(options)));
    } catch (err) {
      reject(err);
    }
  });
};
