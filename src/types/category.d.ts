export interface ICategory {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}
