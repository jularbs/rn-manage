import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { TZDate } from "@date-fns/tz";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function showCurrency(number: number): string {
  return `₱${number.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

export function UTCtoPH(date: Date): Date {
  const phTime = new TZDate(date, "Asia/Manila");

  return phTime;
}

export function obscureEmail(email: string): string {
  const [name, domain] = email.split("@");
  return `${name[0]}${name[1]}${new Array(name.length - 2).join("*")}${name[name.length - 1]}${
    domain ? `@${domain}` : ""
  }`;
}

export function unslugify(slug: string): string {
  if (slug) return slug.split("-").join(" ").split("_").join(" ");
  return "";
}

export function getInitials(name: string): string {
  const names = name.split(" ").splice(0, 1);
  const initials = names.map((item) => item[0]);

  return initials.join("");
}

export function getImageSource(media: { key?: string; bucket?: string; location?: string; url?: string }): string {
  if (media?.url) {
    return media.url;
  }

  if (media?.location) {
    return media.location;
  }

  if (media?.key && media?.bucket) {
    return `${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/media?key=${media.key}&bucket=${media.bucket}`;
  }

  return media?.location || "";
}

export function isAuthorized(role: string, requiredRoles: string[]): boolean {
  if (!role || !requiredRoles || requiredRoles.length === 0) {
    return false;
  }

  return requiredRoles.includes(role);
}

export const ReplaceHtmlEntities = (text: string) => {
  const translate_re = /&(nbsp|amp|quot|lt|gt);/g;
  const translate = { nbsp: " ", amp: "&", quot: '"', lt: "<", gt: ">" };

  return text.replace(translate_re, function (match, entity) {
    return translate[entity as keyof typeof translate];
  });
};
