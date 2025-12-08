export interface IUser {
  _id: Types.ObjectId;
  fullName: string;
  email: string;
  password?: string;
  role: "admin" | "manager" | "managing-editor" | "digital-content-producer";
  deletedAt?: Date;
  deletedBy?: Types.ObjectId | IUser;
  lastLogin?: Date;
  accountVerified: boolean;
  emailVerified: boolean;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}
