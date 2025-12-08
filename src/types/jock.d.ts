import { IMedia } from "./media";
import { IProgram } from "./program";

export interface IJock {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  bio?: string;
  image?: Types.ObjectId | Partial<IMedia>;
  station?: Types.ObjectId | Partial<IStation>; // Reference to Station model
  socialLinks?: {
    facebook?: string;
    youtube?: string;
    twitter?: string;
    instagram?: string;
    tiktok?: string;
  };
  isActive: boolean;
  programs: Types.ObjectId[] | Partial<IProgram>[]; // References to Program model
}
