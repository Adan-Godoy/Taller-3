import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FileRecord, FileDocument } from './file.schema';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';

@Injectable()
export class FilesService {
  private s3Client: S3Client;
  private bucketName = 'taller3-drive-bucket';

  constructor(
    @InjectModel(FileRecord.name) private fileModel: Model<FileDocument>,
  ) {
    this.s3Client = new S3Client({
      region: 'us-east-1',
      credentials: {
        accessKeyId: 'test',
        secretAccessKey: 'test',
      },
      endpoint: 'http://localhost:4566',
      forcePathStyle: true,
    });
  }

  async uploadFile(file: Express.Multer.File): Promise<FileRecord> {
    const s3Key = `${Date.now()}-${file.originalname}`;

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: s3Key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    const newFile = new this.fileModel({
      originalName: file.originalname,
      s3Key: s3Key,
      mimeType: file.mimetype,
    });

    return newFile.save();
  }

  async getRecentFiles(): Promise<FileRecord[]> {
    return this.fileModel
      .find()
      .sort({ createdAt: -1 })
      .limit(3)
      .exec();
  }

  async downloadFile(id: string): Promise<{ stream: Readable; fileRecord: FileRecord }> {
    const fileRecord = await this.fileModel.findById(id).exec();
    if (!fileRecord) {
      throw new NotFoundException('Archivo no encontrado en la base de datos');
    }

    try {
      const s3Response = await this.s3Client.send(
        new GetObjectCommand({
          Bucket: this.bucketName,
          Key: fileRecord.s3Key,
        }),
      );

      return {
        stream: s3Response.Body as Readable,
        fileRecord,
      };
    } catch (error) {
      if (error.name === 'NoSuchKey' || error.name === 'NoSuchBucket') {
        
        await this.fileModel.findByIdAndDelete(id).exec();
        
        throw new NotFoundException(
          'El archivo físico ya no existe en el almacenamiento. El registro ha sido eliminado de la base de datos para sincronizar los sistemas.',
        );
      }
      
      throw error;
    }
  }
}