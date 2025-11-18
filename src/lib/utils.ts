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
export const PRICE_ID: string = "price_1SUtbRDJtFkaXjyB9vlKKD7M"; // Premium Student Plan - $4.99/month
//export const PRICE_ID: string = "price_1Rr03LDE6ktIMFgV30vmtxCH"; // Old test price ID

// Fisher-Yates shuffle algorithm to randomize array order
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}