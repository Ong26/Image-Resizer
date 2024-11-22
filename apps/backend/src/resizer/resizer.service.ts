import {
  BufferWithMetadata,
  Dimension,
  ImageSpec,
} from '@image-resizer/tools/types';
import {
  convertImageFormat,
  cropImage,
  getImageDimension,
  getSharpInstance,
  resizeImage,
  sharpToBuffer,
  validateImageSpec,
} from '@image-resizer/tools/utils';
import { Injectable } from '@nestjs/common';
@Injectable()
export class ResizerService {
  async getModifiedImageBuffer(
    buffer: Buffer,
    originalDimension: Dimension,
    imageSpec: ImageSpec,
  ) {
    const { coordinate, dimension, resizeTo } = imageSpec;
    const { result } = validateImageSpec(
      coordinate,
      dimension,
      resizeTo,
      originalDimension,
    );
    if (!result) return false;
    const sharpInstance = getSharpInstance(buffer);
    const croppedInstance = cropImage(sharpInstance, coordinate, dimension);
    const { width: resizeWidth, height: resizeHeight } = resizeTo;
    const resizedInstance = resizeImage(
      croppedInstance,
      resizeWidth,
      resizeHeight,
    );
    const convertedInstance = convertImageFormat(
      resizedInstance,
      imageSpec.format,
      imageSpec.quality,
    );
    return await sharpToBuffer(convertedInstance);
  }

  async getImageBuffers(buffer, imageSpecs) {
    const dimension = await getImageDimension(buffer);
    const buffersWithMetadata: BufferWithMetadata[] = [];
    const invalidImageSpecs = [];
    const parsedimageSpecs = JSON.parse(imageSpecs);
    const bufferPromises = parsedimageSpecs.map((imageSpec) =>
      this.getModifiedImageBuffer(buffer, dimension, imageSpec),
    );
    const settledPromises = await Promise.allSettled(bufferPromises);
    settledPromises.forEach(async (x, i) => {
      if (x.status === 'rejected') {
        console.log(x.reason);
        invalidImageSpecs.push(x.reason);
      } else if (x.status === 'fulfilled') {
        buffersWithMetadata.push({
          buffer: x.value,
          metadata: parsedimageSpecs[i],
        });
      }
    });
    return { buffersWithMetadata, invalidSpecs: invalidImageSpecs };
  }
}
