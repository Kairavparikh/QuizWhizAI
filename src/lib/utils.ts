import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function roundStringNumber(value: string | number | null): string | number | null {
  if (typeof value === "number") {
    return parseFloat(value.toFixed(2));
  }
  if (typeof value === "string") {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? value : parseFloat(parsed.toFixed(2));
  }
  return null;
}

export function convertDateToString(date: Date) : string{
  const timeStampDate = new Date(date);
  const year = timeStampDate.getFullYear();
  const month = timeStampDate.getMonth() + 1;
  const day = timeStampDate.getDate();

  const formattedDate = `${year}/${month}/${day}`;
  return formattedDate;

}

export const PRICE_ID: string = "price_1Rr03LDE6ktIMFgV30vmtxCH";
