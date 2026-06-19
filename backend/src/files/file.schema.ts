import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FileDocument = FileRecord & Document;

@Schema()
export class FileRecord {
  @Prop({ required: true })
  originalName: string;

  @Prop({ required: true, unique: true })
  s3Key: string; 

  @Prop({ required: true })
  mimeType: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const FileSchema = SchemaFactory.createForClass(FileRecord);