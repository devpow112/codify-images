import * as expectedImages from '../assets/images.js';
import { codifyImages, codifyImagesSync } from '../../src/';
import { InvalidPathError, UnsupportedTypeError } from '../../src/errors.js';
import { expect } from 'chai';
import { join } from 'path';
import { spy } from 'sinon';

const assetsPath = join(__dirname, '../assets/');
const expectedKeys = Object
  .keys(expectedImages)
  .filter(e => e !== 'testSvgNotBase64');
const invalidAssetPath = 'not a path';
const invalidOptions = 'not options';

const verifyImages = (images, svgDisableBase64) => {
  expect(images).to.be.instanceOf(Object);
  expect(Object.keys(images).length).to.eql(expectedKeys.length);

  for (const expectedKey of expectedKeys) {
    if (expectedKey === 'testSvg' && svgDisableBase64 === true) {
      expect(images[expectedKey]).to.eql(expectedImages.testSvgNotBase64);
    } else {
      expect(images[expectedKey]).to.eql(expectedImages[expectedKey]);
    }
  }
};

describe('codify-images', () => {
  describe('async', () => {
    it('generates', async () => {
      verifyImages(await codifyImages(assetsPath));
    });

    it('will log', async () => {
      const log = spy();

      verifyImages(await codifyImages(assetsPath, { log }));
      expect(log.callCount).to.eql(expectedKeys.length);
    });

    it('disable base64', async () => {
      verifyImages(
        await codifyImages(assetsPath, { svgDisableBase64: true }),
        true
      );
    });

    it('handles invalid options', async () => {
      verifyImages(await codifyImages(assetsPath, invalidOptions));
    });

    it('fails with invalid path', async () => {
      try {
        await codifyImages(invalidAssetPath);
      } catch (err) {
        expect(err).to.be.instanceOf(InvalidPathError);

        return;
      }

      throw new Error('fail');
    });

    it('fails with unsupported type', async () => {
      try {
        await codifyImages(assetsPath, { ignoreUnsupportedTypes: false });
      } catch (err) {
        expect(err).to.be.instanceOf(UnsupportedTypeError);

        return;
      }

      throw new Error('fail');
    });
  });

  describe('sync', () => {
    it('generates', () => {
      verifyImages(codifyImagesSync(assetsPath));
    });

    it('will log', () => {
      const log = spy();

      verifyImages(codifyImagesSync(assetsPath, { log }));
      expect(log.callCount).to.eql(expectedKeys.length);
    });

    it('disable base64', () => {
      verifyImages(
        codifyImagesSync(assetsPath, { svgDisableBase64: true }),
        true
      );
    });

    it('handles invalid options', () => {
      verifyImages(codifyImagesSync(assetsPath, invalidOptions));
    });

    it('fails with invalid path', () => {
      try {
        codifyImagesSync(invalidAssetPath);
      } catch (err) {
        expect(err).to.be.instanceOf(InvalidPathError);

        return;
      }

      throw new Error('fail');
    });

    it('fails with unsupported type', () => {
      try {
        codifyImagesSync(assetsPath, { ignoreUnsupportedTypes: false });
      } catch (err) {
        expect(err).to.be.instanceOf(UnsupportedTypeError);

        return;
      }

      throw new Error('fail');
    });
  });
});
