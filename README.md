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
