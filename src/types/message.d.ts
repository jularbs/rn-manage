import { IStation } from "./station";
import { IUser } from "./user";
export interface IMessage {
  _id: Types.ObjectId;
  stationId: Types.ObjectId | Partial<IStation>;
  reason: string;
  fullName: string;
  emailAddress: string;
  excerpt: string;
  contactNumber: string;
  message: string;
  status: "unread" | "read" | "replied" | "archived";
  readAt?: Date;
  readBy?: Types.ObjectId | Partial<IUser>;
  deletedAt?: Date;
  deletedBy?: Types.ObjectId | Partial<IUser>;
  createdAt: Date;
  updatedAt: Date;
}
