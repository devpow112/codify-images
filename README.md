# Codify Images

[![License][License Badge]](LICENSE)
[![Version][Version Badge]][Version Package]
[![CI][CI Badge]][CI Workflow]
[![Release][Release Badge]][Release Workflow]
[![Coverage][Coverage Badge]][Coverage Report]
[![Vulnerabilities][Vulnerabilities Badge]][Vulnerabilities Report]
[![Node Version][Node Version Badge]](package.json#L43)

Quick and easy tool for converting a set of images into inline JavaScript.

## Installation

```bash
npm i -D codify-images
```

## Usage

There are 2 uses of this package either as a library or a command line interface
(CLI).

### Library

An example of typical usage as a library can be found below.

```js
import { codifyImages, codifyImagesSync } from 'codify-images';

const options = {
  svgDisableBase64: false,
  ignoreUnsupportedTypes: true,
  log: (name, path) => {...}
};
let images = await codifyImages('path/to/assets', options); // asynchronous

images = codifyImagesSync('path/to/assets', options); // synchronous
```

The `images` object returned will have a member for each file, of supported
type, found at the location `path/to/assets` formatted as camel case. Assuming
`path/to/assets` has 3 files in that location (`test.gif`, `test.png` and
`test.svg`) the resulting `images` would look like the following.

```js
const images = {
  testGif: 'data:image/gif;base64,...',
  testPng: 'data:image/png;base64,...',
  testSvg: 'data:image/svg+xml;base64,...'
};
```

#### Options

* `svgDisableBase64`: This will disable `base64` encoding of SVG images. It is
  recommended to leave `base64` encoding of SVG images on as it increases
  compatibility with certain use cases. The default for this setting is `false`.
* `ignoreUnsupportedTypes`: This will allow files of unsupported types to be
  simply skipped instead of throwing an `UnsupportedTypeError` error. The
  default for this setting is `true`.
* `log`: This allows you to add a custom logger that will be called after each
  file is processed. The callback provides the arguments `name` and `path`.

### CLI

Below is the output of `codify-images --help`.

```sh
Usage: codify-images [options] <input path>

Arguments:
  input path                  path to where image files reside

Options:
  -V, --version               output the version number
  -s, --svg-disable-base64    This will allow SVG images to be output as not base64 (default: false)
  -d, --double-quotes         Use double quotes for output instead of single quotes (default: false)
  -o, --output <path>         path to write generated files (default: "generated")
  -e, --es <version>          ESM version to generate (default: 6)
  -c, --indent-count <count>  number of indent elements to output (default: 1)
  -t, --indent-type <type>    type of indent to output (choices: "tab", "space", default: "tab")
  -h, --help                  display help for command
```

## Development

Development can be done on any machine that can install **Node.js**.

### Install Dependencies

Install dependencies via `npm`.

```bash
npm i
```

### Linting

Execute linters via `npm`.

```bash
# git, javascript and markdown
npm run lint

# git only
npm run lint:git

# javascript only
npm run lint:js

# markdown only
npm run lint:md
```

### Testing

Execute tests via `npm`.

```bash
# lint and unit tests
npm test

# unit tests only
npm run test:unit
```

### Formatting

Execute formatters via `npm`.

```bash
# javascript and markdown
npm run format

# javascript only
npm run format:js

# markdown only
npm run format:md
```

### Building

Run a build via `npm`.

```bash
npm run build
```

<!-- links -->
[License Badge]: https://img.shields.io/github/license/devpow112/codify-images?label=License
[Version Badge]: https://img.shields.io/npm/v/codify-images?label=Version
[Version Package]: https://www.npmjs.com/codify-images
[Node Version Badge]: https://img.shields.io/node/v/codify-images
[CI Badge]: https://github.com/devpow112/codify-images/actions/workflows/ci.yml/badge.svg?branch=main
[CI Workflow]: https://github.com/devpow112/codify-images/actions/workflows/ci.yml?query=branch%3Amain
[Release Badge]: https://github.com/devpow112/codify-images/actions/workflows/release.yml/badge.svg?branch=main
[Release Workflow]: https://github.com/devpow112/codify-images/actions/workflows/release.yml?query=branch%3Amain
[Coverage Badge]: https://img.shields.io/coveralls/github/devpow112/codify-images/main?label=Coverage
[Coverage Report]: https://coveralls.io/github/devpow112/codify-images?branch=main
[Vulnerabilities Badge]: https://img.shields.io/snyk/vulnerabilities/github/devpow112/codify-images?label=Vulnerabilities
[Vulnerabilities Report]: https://snyk.io/test/github/devpow112/codify-images
