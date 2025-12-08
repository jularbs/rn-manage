export interface IRecepient {
  _id: Types.ObjectId;
  reason: string;
  email?: string;
  isActive: boolean;
  description?: string;
  deletedAt?: Date;
  deletedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
