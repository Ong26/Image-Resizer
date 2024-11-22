import { archiveImages } from '@image-resizer/tools/utils/archive';
import {
  BadRequestException,
  Body,
  Controller,
  FileTypeValidator,
  Header,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { Response } from 'express';
import { ImagePayloadSpecDto } from 'src/dto/upload-image.dto';
import { ResizerService } from './resizer.service';
@Controller('resizer')
export class ResizerController {
  constructor(private readonly resizerService: ResizerService) {}
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('image', {
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB file size limit
    }),
  )
  @Header('Content-Type', 'application/zip')
  @Header('Content-Disposition', 'attachment; filename="images.zip"')
  async uploadImage(
    @Body('imageSpecs') imageSpecs,
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
  ) {
    const validator = new FileTypeValidator({
      fileType: /(jpg|jpeg|png|webp|avif)$/,
    });
    if (!file) {
      throw new BadRequestException('File is required!');
    }
    if (!validator.isValid(file)) {
      throw new BadRequestException('Invalid file type!');
    }
    try {
      const parsedimageSpecs = JSON.parse(imageSpecs);
      const imageSpecsPayload = { imageSpecs: parsedimageSpecs };
      const imageSpecsInstance = plainToInstance(
        ImagePayloadSpecDto,
        imageSpecsPayload,
      );
      const ans = await validate(imageSpecsInstance);
      if (ans.length > 0) throw ans;
      const buffer = file.buffer;
      const { buffersWithMetadata } = await this.resizerService.getImageBuffers(
        buffer,
        imageSpecs,
      );
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename="images.zip"');
      archiveImages(buffersWithMetadata, res);
    } catch (error) {
      if (Array.isArray(error) && error[0] instanceof ValidationError) {
        throw new BadRequestException('Invalid Image Spec format');
      }
      throw new BadRequestException('Invalid JSON format');
    }
  }
}
