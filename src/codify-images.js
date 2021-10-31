import { basename, extname, resolve as resolvePath } from 'path';
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
  return isSvg && options?.forceBase64 !== true ? 'utf-8' : 'base64';
};

const sanitizeFileData = data => {
  return data.replace(/[\r\n]+/gm, '');
};

const buildDataUri = (isSvg, source, mime, format, options) => {
  return isSvg && options?.forceBase64 !== true ?
    svgToMiniDataURI(source).replace(/'/g, '"') :
    `data:${mime};${format},${source}`;
};

const isSupported = (file, extension) => {
  return extension !== file && supportedMimeTypes[extension] !== undefined;
};

const getImageDataUri = (path, mime, isSvg, options) => {
  const format = getFormat(isSvg, options);
  const source = sanitizeFileData(readFileSync(path, format));

  return buildDataUri(isSvg, source, mime, format, options);
};

const processFile = (path, file, extension, options) => {
  const mime = supportedMimeTypes[extension];
  const isSvg = mime === supportedMimeTypes[svgExtension];
  const filePath = resolvePath(path, file);

  return {
    path: filePath,
    name: camelCase(basename(file)),
    data: getImageDataUri(filePath, mime, isSvg, options)
  };
};

const processFiles = (path, files, options) => {
  const images = {};

  for (const file of files) {
    const extension = extname(file);

    if (!isSupported(file, extension)) {
      continue;
    }

    const image = processFile(path, file, extension, options);

    images[image.name] = image.data;

    options?.log?.(image);
  }

  return images;
};

export const codifyImagesSync = (path, options = {}) => {
  if (!isObject(options)) {
    options = null;
  }

  const files = readdirSync(path);

  return processFiles(path, files, options);
};

export const codifyImages = (path, options = {}) => {
  return new Promise((resolve, reject) => {
    try {
      resolve(codifyImagesSync(path, options));
    } catch (err) {
      reject(err);
    }
  });
};
