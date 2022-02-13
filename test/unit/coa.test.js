import * as expectedImages from '../assets/images.js';
import { Command, InvalidArgumentError } from 'commander';
import { readFile, rm } from 'fs/promises';
import { expect } from 'chai';
import { resolve } from 'path';
import { setUpProgram } from '../../src/coa.js';

const excludeKeys = [
  'testSvgBase64',
  'testSvgUri',
  'testSvgMini',
  'testSvgMiniSrcset'
];
const expectedKeys = [...Object.keys(expectedImages), 'testSvg'].filter(
  e => !excludeKeys.includes(e)
);

const execute = async options => {
  const program = new Command();

  setUpProgram(program);

  program
    .exitOverride(() => { })
    .configureOutput({
      writeOut: () => { },
      writeErr: () => { }
    });

  options = options ?? {};
  options.args = options.args ?? [];
  options.banner = options.banner ?? true;
  options.input = resolve(__dirname, options.input ?? '../assets/');

  if (options.output) {
    options.output = resolve(__dirname, '.temp/', options.output);
    options.args.push('--output', options.output);

    await rm(options.output, { force: true, recursive: true });
  }

  options.args.push(options.input);

  await program.parseAsync(['node', 'codify-images', ...options.args]);
};

const validate = async options => {
  options = options ?? {};
  options.es = options.es ?? 6;
  options.banner = options.banner ?? true;
  options.doubleQuotes = options.doubleQuotes ?? false;
  options.indentType = options.indentType ?? 'tab';

  const outputFilePath = resolve(options.output, 'images.js');
  let fileData = await readFile(outputFilePath);

  fileData = fileData.toString().split('\n');

  expect(fileData.pop()).to.eq('');

  if (options.banner) {
    expect(fileData.shift()).to.eq('// auto-generated');
  }

  const quoteType = options.doubleQuotes ? '"' : '\'';

  if (options.es === 6) {
    const regex = new RegExp(
      `^export const \\w+ = ${quoteType}data:image\\/.+[;,].+${quoteType};$`
    );

    for (const line of fileData) {
      expect(line).to.match(regex);
    }
  } else {
    expect(fileData.shift()).to.eq('module.exports = {');
    expect(fileData.pop()).to.eq('};');

    const indent = options.indentType === 'tab' ? '\t' : ' ';
    const regex = new RegExp(
      `^${indent}\\w+: ${quoteType}data:image\\/.+${quoteType}(?:,)$`
    );

    for (const line of fileData) {
      expect(line).to.match(regex);
    }
  }

  let images = await import(outputFilePath);

  expect(images).to.be.instanceOf(Object);

  if (options.es === 5) {
    expect(images).to.have.deep.keys([...expectedKeys, 'default']);

    images = images.default;
  }

  expect(images).to.have.deep.keys(expectedKeys);

  for (const expectedKey of expectedKeys) {
    if (expectedKey === 'testSvg') {
      if (options.svgMode === 'uri') {
        expect(images[expectedKey]).to.eql(expectedImages.testSvgUri);
      } else if (options.svgMode === 'mini') {
        expect(images[expectedKey]).to.eql(expectedImages.testSvgMini);
      } else if (options.svgMode === 'mini-srcset') {
        expect(images[expectedKey]).to.eql(expectedImages.testSvgMiniSrcset);
      } else {
        expect(images[expectedKey]).to.eql(expectedImages.testSvgBase64);
      }
    } else {
      expect(images[expectedKey]).to.eql(expectedImages[expectedKey]);
    }
  }
};

describe('coa', function() {
  this.timeout(1000);
  this.slow(500);

  const consoleLog = global.console.log;
  const consoleError = global.console.error;
  const processExit = global.process.exit;

  before(() => {
    const noop = () => { };

    global.console.log = noop;
    global.console.error = noop;
    global.process.exit = noop;
  });

  after(() => {
    global.console.log = consoleLog;
    global.console.error = consoleError;
    global.process.exit = processExit;
  });

  describe('generates', async () => {
    it('with defaults', async () => {
      const options = { output: 'defaults' };

      await execute(options);
      await validate(options);
    });

    for (const es of [5, 6]) {
      for (const svgMode of ['base64', 'uri', 'mini', 'mini-srcset']) {
        for (const banner of [true, false]) {
          for (const doubleQuotes of [true, false]) {
            for (const indentType of ['space', 'tab']) {
              const args = [
                '--es', es,
                '--svg-mode', svgMode,
                '--indent-type', indentType
              ];

              if (!banner) {
                args.push('--no-banner');
              }

              if (doubleQuotes) {
                args.push('--double-quotes');
              }

              const output = [es, svgMode, banner, doubleQuotes, indentType];
              const options = {
                output: output.join('/'),
                args,
                doubleQuotes,
                svgMode,
                banner,
                indentType,
                es
              };

              it(`with options '${args.join(' ')}'`, async () => {
                await execute(options);
                await validate(options);
              });
            }
          }
        }
      }
    }
  });

  describe('errors', () => {
    const inputs = [{
      path: '../../.github/',
      type: Error
    }, {
      path: 'not a path',
      type: InvalidArgumentError
    }, {
      path: './coa.test.js',
      type: InvalidArgumentError
    }];

    for (const input of inputs) {
      it(`with bad input path '${input.path}'`, async () => {
        const options = { input: input.path };

        try {
          await execute(options);
        } catch (err) {
          expect(err).to.be.instanceOf(input.type);

          return;
        }

        throw new Error('failed');
      });
    }

    for (const indent of ['not a number', '-1', '']) {
      it(`with bad indent count '${indent}'`, async () => {
        const options = { args: ['--indent-count', indent] };

        try {
          await execute(options);
        } catch (err) {
          expect(err).to.be.instanceOf(InvalidArgumentError);

          return;
        }

        throw new Error('failed');
      });
    }

    for (const es of ['not a number', '-1', '4', '']) {
      it(`with bad es version '${es}'`, async () => {
        const options = { args: ['--es', es] };

        try {
          await execute(options);
        } catch (err) {
          expect(err).to.be.instanceOf(InvalidArgumentError);

          return;
        }

        throw new Error('failed');
      });
    }
  });
});
