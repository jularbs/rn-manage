export interface ITag {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  usageCount: number;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}
