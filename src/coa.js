import { name as cliName, version as cliVersion } from '../package.json';
import { InvalidArgumentError, Option } from 'commander';
import { statSync, writeFileSync } from 'fs';
import chalk from 'chalk';
import { codifyImagesSync } from './codify-images.js';
import { mkdirp } from 'mkdirp';
import { resolve } from 'path';

const { blue, green, red, yellow } = chalk;
const mkdirpSync = mkdirp.sync;

const generateStart = options => {
  let output = options.banner === true ? '// auto-generated\n' : '';

  if (options.es === 5) {
    output += 'module.exports = {\n';
  }

  return output;
};

const generateLine = (name, data, options) => {
  const adjustedData = options.doubleQuotes !== true ?
    `'${data.replace(/'/g, '\\\'')}'` :
    `"${data}"`;
  const indentType = options.indentType === 'tab' ? '\t' : ' ';
  const indent = indentType.repeat(options.indentCount);

  return options.es === 6 ?
    `export const ${name} = ${adjustedData};` :
    `${indent}${name}: ${adjustedData}`;
};

const generateLineEnding = (options, last) => {
  return options.es !== 6 && !last ? ',\n' : '\n';
};

const generateEnd = options => {
  return options.es !== 6 ? '};\n' : '';
};

const writeOutput = (outputPath, output, options) => {
  mkdirpSync(options.output);
  writeFileSync(outputPath, output, { encoding: 'utf-8' });
};

const logStart = message => {
  console.log(yellow(message));
  console.group();
};

const logInfo = message => {
  console.log(blue(message));
};

const logError = message => {
  console.groupEnd();
  console.log(red(`error: ${message}`));
};

const logProcessed = (path, name) => {
  logInfo(`processed image (${path} => ${name})`);
};

const logEnd = message => {
  console.groupEnd();
  console.log(green(message));
};

const generate = options => {
  logStart(yellow(`generating exports (${options.input}) ...`));

  let output = generateStart(options);
  const images = codifyImagesSync(
    options.input,
    { log: logProcessed, svgMode: options.svgMode }
  );

  if (Object.keys(images).length === 0) {
    throw new Error('no images available at input path.');
  }

  const keys = Object.keys(images);

  for (const index in keys) {
    const key = keys[index];
    const data = images[key];

    output += generateLine(key, data, options);
    output += generateLineEnding(options, index === keys.length - 1);

    logInfo(`writing export (${key})`);
  }

  output += generateEnd(options);

  const outputPath = resolve(options.output, 'images.js');

  writeOutput(outputPath, output, options);
  logEnd(`exports generated (${outputPath})`);
};

const customParseInt = value => {
  const parsedValue = parseInt(value, 10);

  if (isNaN(parsedValue)) {
    throw new InvalidArgumentError('Must be valid integer.');
  } else if (parsedValue <= 0) {
    throw new InvalidArgumentError('Must be positive integer.');
  }

  return parsedValue;
};

export const setUpProgram = program => {
  program
    .name(cliName)
    .version(cliVersion)
    .showHelpAfterError()
    .configureOutput({ outputError: (message, write) => write(red(message)) })
    .argument(
      '<input path>',
      'path to where image files reside',
      value => {
        try {
          const path = resolve(value);
          const stat = statSync(path);

          if (!stat.isDirectory()) {
            throw new InvalidArgumentError('Must be directory.');
          }

          return path;
        } catch {
          throw new InvalidArgumentError('Must exist.');
        }
      }
    )
    .option(
      '-d, --double-quotes',
      'Use double quotes for output instead of single quotes',
      false
    )
    .option(
      '-o, --output <path>',
      'path to write generated files',
      value => resolve(value),
      'generated'
    )
    .option(
      '-e, --es <version>',
      'version of ESM to generate',
      value => {
        const parsedValue = customParseInt(value);
        const choicesEs = [5, 6];

        if (!choicesEs.includes(parsedValue)) {
          const choices = choicesEs.join(', ');

          throw new InvalidArgumentError(`Allowed choices are ${choices}.`);
        }

        return parsedValue;
      },
      6
    )
    .option(
      '-c, --indent-count <count>',
      'number of indent elements to output',
      value => customParseInt(value),
      1
    )
    .option(
      '-B, --no-banner',
      'do not include banner comment at top of generated file'
    )
    .addOption(
      new Option('-t, --indent-type <type>', 'type of indent to output')
        .choices(['tab', 'space'])
        .default('tab')
    )
    .addOption(
      new Option('-s, --svg-mode <mode>', 'output mode to use for SVG images')
        .choices(['base64', 'uri', 'mini', 'mini-srcset'])
        .default('base64')
    )
    .action((input, opts) => {
      if (opts.output === 'generated') {
        opts.output = resolve(opts.output);
      }

      try {
        generate({ input, ...opts });
      } catch (err) {
        logError(err.message);

        throw err;
      }
    });
};
