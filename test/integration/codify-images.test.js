import * as expectedImages from '../assets/images.js';
import childProcess from 'child_process';
import { expect } from 'chai';
import { promisify } from 'util';
import { resolve } from 'path';
import { rm } from 'fs/promises';
import { version } from '../../package.json';

const exec = promisify(childProcess.exec);
const testPath = resolve(__dirname);
const inputPath = resolve(__dirname, '../assets/');
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

const makeOutputPath = (esVersion, outputPath) => {
  return resolve(__dirname, '.temp/', esVersion.toString(), outputPath);
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

const validate = async (outputPath, esVersion, svgMode) => {
  const outputFilePath = resolve(outputPath, 'images.js');
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
    for (const esVersion of [5, 6]) {
      describe(`es${esVersion}`, () => {
        it('defaults', async () => {
          const outputPath = makeOutputPath(esVersion, 'defaults/');

          await execute(['--es', esVersion], outputPath);
          await validate(outputPath, esVersion);
        });

        for (const mode of svgModes) {
          it(`svg '${mode}'`, async () => {
            const outputPath = makeOutputPath(esVersion, `svg-mode/${mode}/`);

            await execute(['--es', esVersion, '--svg-mode', mode], outputPath);
            await validate(outputPath, esVersion, mode);
          });
        }
      });
    }
  });
});
