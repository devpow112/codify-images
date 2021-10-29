import * as expectedImages from '../assets/images.js';
import { codifyImages, codifyImagesSync } from '../../src/';
import { expect } from 'chai';
import { join } from 'path';
import sinon from 'sinon';

const assetsPath = join(__dirname, '../assets/');
const expectedKeys = Object.keys(expectedImages);

describe('codify-images', () => {
  let images;

  describe('generates async', () => {
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
    await codifyImages(assetsPath, 'not options');
  });

  it('will log', async () => {
    const log = sinon.spy();

    await codifyImages(assetsPath, { log });

    expect(log.callCount).to.eql(expectedKeys.length);
  });
});
