export interface Program {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  day: number[];
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  station: Types.ObjectId; // Reference to Station model
  isActive: boolean;
  image?: Types.ObjectId; // Reference to Media model
  createdAt: Date;
  updatedAt: Date;

  // Virtual fields
  isOnAir: boolean;
  timeSlot: string;
  formattedDuration: string;
}
