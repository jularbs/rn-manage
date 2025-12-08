import { IMedia } from "./media";
import { IUser } from "./user";

// Interface for Options
export interface IOptions {
  _id: Types.ObjectId;
  key: string;
  value: string;
  updatedBy: Partial<IUser>;
  media?: Partial<IMedia>;
  createdAt: Date;
  updatedAt: Date;
}
