import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CommandBus } from '@nestjs/cqrs';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { CreatePresignedUploadCommand } from '../../application/commands/create-presigned-upload.command';
import { CreatePresignedUploadRequestDto } from './request/upload.request';

@ApiTags('uploads')
@Controller('admin/uploads')
export class UploadsController {
  constructor(private readonly commandBus: CommandBus) {}

  /** Admin asks for a presigned URL, PUTs the file straight to object
   *  storage from the browser, then sends the returned publicUrl back as
   *  part of a product's imageUrls — the API never touches the file bytes. */
  @Roles('ADMIN')
  @Post('presign')
  presign(@Body() dto: CreatePresignedUploadRequestDto) {
    return this.commandBus.execute(new CreatePresignedUploadCommand(dto.fileName, dto.contentType));
  }
}
