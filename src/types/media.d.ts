export interface IMedia {
  _id: Types.ObjectId;
  originalName: string;
  key: string;
  bucket: string;
  url?: string;
  mimeType: string;
  size: number;
  alt?: string;
  caption?: string;
  createdAt: Date;
  updatedAt: Date;

  // Virtual fields
  extension: string;
  isImage: boolean;
  isVideo: boolean;
  isAudio: boolean;
  isDocument: boolean;
}
