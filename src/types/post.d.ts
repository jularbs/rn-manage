import { IMedia } from "./media";

export enum PostType {
  VideoArticle = "video article",
  BasicArticle = "basic article",
}
export enum PostStatus {
  Draft = "draft",
  Published = "published",
}
import { Types } from "mongoose";
import { IUser } from "./user";

export interface IPost {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  author: Types.ObjectId | IUser;
  categories: Types.ObjectId[] | ICategory[];
  tags: Types.ObjectId[] | ITag[];
  type: PostType;
  featuredImage?: Types.ObjectId | IMedia;
  featuredImageCaption?: string;
  thumbnailImage?: Types.ObjectId | IMedia;
  videoSourceUrl?: string;
  videoDuration?: string;
  status: PostStatus;
  publishedAt?: Date;
  viewCount: number;
  isFeatured: boolean;
  metaTitle?: string;
  metaDescription?: string;

  // SEO Fields
  keywords?: string;
  canonicalUrl?: string;

  // Robots meta
  robotsIndex: boolean;
  robotsFollow: boolean;
  robotsArchive: boolean;
  robotsSnippet: boolean;
  robotsImageIndex: boolean;

  // Open Graph
  ogTitle?: string;
  ogDescription?: string;
  ogType?: string;
  ogUrl?: string;
  ogSiteName?: string;
  ogLocale?: string;
  ogImage?: Types.ObjectId | IMedia;
  ogImageAlt?: string;

  // Twitter Cards
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterSite?: string;
  twitterCreator?: string;
  twitterImage?: Types.ObjectId | IMedia;
  twitterImageAlt?: string;

  // Additional SEO
  seoAuthor?: string;
  publisher?: string;
  focusKeyword?: string;
  readingTime?: string;
  createdAt: Date;
  updatedAt: Date;
}
