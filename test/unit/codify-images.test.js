import * as errors from '../../src/errors.js';
import * as expectedImages from '../assets/images.js';
import { codifyImages, codifyImagesSync } from '../../src/codify-images.js';
import { expect } from 'chai';
import { join } from 'path';
import { spy } from 'sinon';

const { InvalidPathError, InvalidSvgModeError, UnsupportedTypeError } = errors;
const assetsPath = join(__dirname, '../assets/');
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
const invalidAssetPath = 'not a path';
const invalidOptions = 'not options';

const verifyImages = (images, svgMode) => {
  expect(images).to.be.instanceOf(Object);
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
  this.timeout(100);
  this.slow(50);

  describe('async', () => {
    describe('generates', () => {
      it('with defaults', async () => {
        verifyImages(await codifyImages(assetsPath));
      });

      describe('with svg', () => {
        for (const mode of svgModes) {
          it(`mode '${mode}'`, async () => {
            const images = await codifyImages(assetsPath, { svgMode: mode });

            verifyImages(images, mode);
          });
        }
      });
    });

    describe('errors', () => {
      it('with invalid svg mode', async () => {
        try {
          await codifyImages(assetsPath, { svgMode: 'not a mode' });
        } catch (err) {
          expect(err).to.be.instanceOf(InvalidSvgModeError);

          return;
        }

        throw new Error('fail');
      });

      it('with invalid path', async () => {
        try {
          await codifyImages(invalidAssetPath);
        } catch (err) {
          expect(err).to.be.instanceOf(InvalidPathError);

          return;
        }

        throw new Error('fail');
      });

      it('with unsupported type', async () => {
        try {
          await codifyImages(assetsPath, { ignoreUnsupportedTypes: false });
        } catch (err) {
          expect(err).to.be.instanceOf(UnsupportedTypeError);

          return;
        }

        throw new Error('fail');
      });
    });

    it('will log', async () => {
      const log = spy();

      verifyImages(await codifyImages(assetsPath, { log }));
      expect(log.callCount).to.eql(expectedKeys.length);
    });

    it('handles invalid options', async () => {
      verifyImages(await codifyImages(assetsPath, invalidOptions));
    });
  });

  describe('sync', () => {
    describe('generates', () => {
      it('with defaults', () => {
        verifyImages(codifyImagesSync(assetsPath));
      });

      describe('with svg', () => {
        for (const mode of svgModes) {
          it(`mode '${mode}'`, async () => {
            verifyImages(codifyImagesSync(assetsPath, { svgMode: mode }), mode);
          });
        }
      });
    });

    describe('errors', () => {
      it('with invalid svg mode', () => {
        try {
          codifyImagesSync(assetsPath, { svgMode: 'not a mode' });
        } catch (err) {
          expect(err).to.be.instanceOf(InvalidSvgModeError);

          return;
        }

        throw new Error('fail');
      });

      it('with invalid path', () => {
        try {
          codifyImagesSync(invalidAssetPath);
        } catch (err) {
          expect(err).to.be.instanceOf(InvalidPathError);

          return;
        }

        throw new Error('fail');
      });

      it('with unsupported type', () => {
        try {
          codifyImagesSync(assetsPath, { ignoreUnsupportedTypes: false });
        } catch (err) {
          expect(err).to.be.instanceOf(UnsupportedTypeError);

          return;
        }

        throw new Error('fail');
      });
    });

    it('will log', () => {
      const log = spy();

      verifyImages(codifyImagesSync(assetsPath, { log }));
      expect(log.callCount).to.eql(expectedKeys.length);
    });

    it('handles invalid options', () => {
      verifyImages(codifyImagesSync(assetsPath, invalidOptions));
    });
  });
});
