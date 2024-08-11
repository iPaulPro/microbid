import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const truncateAddress = (
  address: string | undefined,
  maxLength: number = 8,
): string => {
  if (!address) {
    return "";
  }
  if (address.length <= maxLength) {
    return address;
  }
  const ellipsis = "…";
  const startLength = Math.ceil((maxLength + ellipsis.length) / 2) + 1;
  const endLength = Math.floor((maxLength + ellipsis.length) / 2);
  return (
    address.slice(0, startLength) +
    ellipsis +
    address.slice(address.length - endLength)
  );
};
