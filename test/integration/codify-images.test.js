import * as expectedImages from '../assets/images.js';
import childProcess from 'child_process';
import { createInterface } from 'readline';
import { createReadStream } from 'fs';
import { expect } from 'chai';
import { promisify } from 'util';
import { resolve as resolvePath } from 'path';
import { rm } from 'fs/promises';
import { version } from '../../package.json';

const exec = promisify(childProcess.exec);
const testPath = resolvePath(__dirname);
const inputPath = resolvePath(__dirname, '../assets/');
const options = { cwd: testPath, stdio: 'inherit' };
const svgModes = ['base64', 'uri', 'mini', 'mini-srcset'];
const excludeKeys = [
  'testSvgBase64',
  'testSvgUri',
  'testSvgMini',
  'testSvgMiniSrcset'
];
const expectedKeys = [...Object.keys(expectedImages), 'testSvg'].filter(
  e => !excludeKeys.includes(e)
);
const comment = '// auto-generated';
const es5FirstLine = 'module.exports = {';

const makeOutputPath = (outputPath, esVersion) => {
  esVersion = esVersion ? esVersion.toString() : '';

  return resolvePath(__dirname, '.temp/', esVersion, outputPath);
};

const getFirstLine = async outputPath => {
  const readable = createReadStream(outputPath);
  const reader = createInterface({ input: readable });
  const firstLine = await new Promise(resolve => {
    reader.on('line', line => {
      reader.close();

      resolve(line);
    });
  });

  readable.close();

  return firstLine;
};

const execute = async (args, outputPath) => {
  args = args || [];
  args.unshift('node ../../dist/cli.js');

  if (outputPath) {
    args.push('--output', outputPath);
    args.push(inputPath);

    await rm(outputPath, { force: true, recursive: true });
  }

  const command = args.join(' ');

  return await exec(command, options);
};

const validate = async (outputPath, esVersion, svgMode, banner = true) => {
  const outputFilePath = resolvePath(outputPath, 'images.js');
  const firstLine = await getFirstLine(outputFilePath);

  esVersion = esVersion || 6;

  if (banner) {
    expect(firstLine).to.eq(comment);
  } else if (esVersion === 5) {
    expect(firstLine).to.eq(es5FirstLine);
  } else if (esVersion === 6) {
    expect(firstLine).to.not.eq(es5FirstLine);
  }

  let images = await import(outputFilePath);

  expect(images).to.be.instanceOf(Object);

  if (esVersion === 5) {
    expect(images).to.have.deep.keys([...expectedKeys, 'default']);

    images = images.default;
  }

  expect(images).to.have.deep.keys(expectedKeys);

  for (const expectedKey of expectedKeys) {
    if (expectedKey === 'testSvg') {
      if (svgMode === 'uri') {
        expect(images[expectedKey]).to.eql(expectedImages.testSvgUri);
      } else if (svgMode === 'mini') {
        expect(images[expectedKey]).to.eql(expectedImages.testSvgMini);
      } else if (svgMode === 'mini-srcset') {
        expect(images[expectedKey]).to.eql(expectedImages.testSvgMiniSrcset);
      } else {
        expect(images[expectedKey]).to.eql(expectedImages.testSvgBase64);
      }
    } else {
      expect(images[expectedKey]).to.eql(expectedImages[expectedKey]);
    }
  }
};

describe('codify-images', function() {
  this.timeout(500);
  this.slow(250);

  describe('shows', () => {
    it('version', async () => {
      const { stdout } = await execute(['--version']);

      expect(stdout, version);
    });

    it('help', async () => {
      await execute(['--help']);
    });
  });

  describe('generates', async () => {
    it('defaults', async () => {
      const outputPath = makeOutputPath('defaults/');

      await execute([], outputPath);
      await validate(outputPath);
    });

    for (const esVersion of [5, 6]) {
      describe(`es${esVersion}`, () => {
        it('without banner', async () => {
          const outputPath = makeOutputPath('without-banner/', esVersion);

          await execute(['--es', esVersion, '--no-banner'], outputPath);
          await validate(outputPath, esVersion, 'base64', false);
        });

        for (const mode of svgModes) {
          it(`svg '${mode}'`, async () => {
            const outputPath = makeOutputPath(`svg-mode/${mode}/`, esVersion);

            await execute(['--es', esVersion, '--svg-mode', mode], outputPath);
            await validate(outputPath, esVersion, mode);
          });
        }
      });
    }
  });
});
