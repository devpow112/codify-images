import * as expectedImages from '../assets/images.js';
import { codifyImages, codifyImagesSync } from '../../src/';
import { expect } from 'chai';
import { join } from 'path';
import sinon from 'sinon';

const assetsPath = join(__dirname, '../assets/');
const expectedKeys = Object.keys(expectedImages).filter(e => e !== 'testSvg64');

describe('codify-images', () => {
  describe('generates async', () => {
    let images;

    before(async () => {
      images = await codifyImages(assetsPath);
    });

    for (const expectedKey of expectedKeys) {
      it(expectedKey, () => {
        expect(images[expectedKey]).to.eql(expectedImages[expectedKey]);
      });
    }
  });

  describe('generates sync', () => {
    let images;

    before(() => {
      images = codifyImagesSync(assetsPath);
    });

    for (const expectedKey of expectedKeys) {
      it(expectedKey, () => {
        expect(images[expectedKey]).to.eql(expectedImages[expectedKey]);
      });
    }
  });

  it('fails with bad path', async () => {
    try {
      await codifyImages('not a real path');
    } catch (_) {
      return;
    }

    throw new Error('fail');
  });

  it('handles bad options', async () => {
    const images = await codifyImages(assetsPath, 'not options');

    for (const expectedKey of expectedKeys) {
      expect(images[expectedKey]).to.eql(expectedImages[expectedKey]);
    }
  });

  it('will log', async () => {
    const log = sinon.spy();

    await codifyImages(assetsPath, { log });

    expect(log.callCount).to.eql(expectedKeys.length);
  });

  it('force base64', async () => {
    const images = await codifyImages(assetsPath, { forceBase64: true });

    for (const expectedKey of expectedKeys) {
      if (expectedKey === 'testSvg') {
        expect(images[expectedKey]).to.eql(expectedImages.testSvg64);
      } else {
        expect(images[expectedKey]).to.eql(expectedImages[expectedKey]);
      }
    }
  });
});
