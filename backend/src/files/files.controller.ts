import {
    Controller,
    Post,
    Get,
    Param,
    UseInterceptors,
    UploadedFile,
    Res,
  } from '@nestjs/common';
  import { FileInterceptor } from '@nestjs/platform-express';
  import { FilesService } from './files.service';
  import * as express from 'express'; 
  
  @Controller('files')
  export class FilesController {
    constructor(private readonly filesService: FilesService) {}
  
    // POST http://localhost:3000/files/upload
    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(@UploadedFile() file: Express.Multer.File) {
      return this.filesService.uploadFile(file);
    }
  
    // GET http://localhost:3000/files/recent
    @Get('recent')
    async getRecentFiles() {
      return this.filesService.getRecentFiles();
    }
  
    // GET http://localhost:3000/files/download/:id
    @Get('download/:id')
    async downloadFile(@Param('id') id: string, @Res() res: express.Response) {
      const { stream, fileRecord } = await this.filesService.downloadFile(id);
  
      res.set({
        'Content-Type': fileRecord.mimeType,
        'Content-Disposition': `attachment; filename="${fileRecord.originalName}"`,
      });
  
      stream.pipe(res);
    }
  }