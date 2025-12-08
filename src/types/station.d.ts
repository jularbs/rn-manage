import { IMedia } from "./media";

export interface IStation {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  frequency: string;
  address?: string;
  locationGroup: "luzon" | "visayas" | "mindanao";
  logoImage?: Types.ObjectId | Partial<IMedia>; // TODOS: Change to reference to
  contactNumber?: string;
  email?: string;
  mapEmbedCode?: string;
  audioStreamURL?: string;
  videoStreamURL?: string;
  status: "active" | "inactive";
  default: boolean;
  socialLinks?: {
    facebook?: string;
    youtube?: string;
    twitter?: string;
    instagram?: string;
    tiktok?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
