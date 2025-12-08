import { IMedia } from "./media";
import { IStation } from "./station";

export interface IProgram {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  day: number[];
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  station: Types.ObjectId | Partial<IStation>; // Reference to Station model
  isActive: boolean;
  image?: Types.ObjectId | Partial<IMedia>; // Reference to Media model
}
