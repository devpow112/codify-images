import * as errors from './errors.js';
import { basename, extname, join, resolve as resolvePath } from 'path';
import { readdirSync, readFileSync } from 'fs';
import camelCase from 'lodash.camelcase';
import svgToMiniDataURI from 'mini-svg-data-uri';

const { InvalidPathError, InvalidSvgModeError, UnsupportedTypeError } = errors;

const svgExtension = '.svg';
const supportedMimeTypes = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml'
};
const svgModes = ['base64', 'uri', 'mini', 'mini-srcset'];

const isObject = value => {
  return Object.prototype.toString.call(value) === '[object Object]';
};

const getEncoding = (isSvg, options) => {
  if (isSvg) {
    return options.svgMode;
  }

  return 'base64';
};

const getFormat = encoding => {
  switch (encoding) {
    case 'mini':
    case 'mini-srcset':
    case 'uri':
      return 'utf-8';
    default:
      return 'base64';
  }
};

const sanitizeFileData = data => {
  return data.replace(/[\r\n]+/gm, '');
};

const buildDataUri = (source, mime, encoding) => {
  if (encoding === 'uri') {
    return `data:${mime};${encodeURIComponent(source)}`;
  } else if (encoding === 'mini') {
    return svgToMiniDataURI(source);
  } else if (encoding === 'mini-srcset') {
    return svgToMiniDataURI.toSrcset(source);
  }

  return `data:${mime};${encoding},${source}`;
};

const isSupported = extension => {
  return supportedMimeTypes[extension] !== undefined;
};

const getImageDataUri = (path, mime, isSvg, options) => {
  const encoding = getEncoding(isSvg, options);
  const format = getFormat(encoding);
  const source = sanitizeFileData(readFileSync(path, format));

  return buildDataUri(source, mime, encoding);
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
  } else {
    options.ignoreUnsupportedTypes = options.ignoreUnsupportedTypes === true;
  }

  if (!hasObjectProperty(options, 'svgMode')) {
    options.svgMode = 'base64';
  } else if (!svgModes.includes(options.svgMode)) {
    throw new InvalidSvgModeError(options.svgMode);
  }

  return options;
};

export const codifyImagesSync = (path, options = {}) => {
  let files;

  try {
    files = readdirSync(resolvePath(path));
  } catch {
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

export default {
  codifyImages,
  codifyImagesSync
};
