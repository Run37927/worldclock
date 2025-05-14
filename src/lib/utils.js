import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * @param {number} price
 * @returns {string}
 * @example
 *  formatPrice(10.99)    // Returns "CA$10.99"
 *  formatPrice(1000)     // Returns "CA$1,000.00"
 *  formatPrice(50.5)     // Returns "CA$50.50"
 */
export const formatPrice = (price) => {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "CAD",
  });

  return formatter.format(price);
};

export const capitalizeFirstLetter = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function constructMetadata({
  title = "World Clock",
  description = "",
  image = "/",
  icons = "/favicon.ico",
} = {}) {
  return {
    title,
    description,
    icons,
    openGraph: {
      title,
      description,
      siteName: "",
      url: "https://www.example.com",
      type: "website",
      images: [{ url: image }]
    },
    metadataBase: new URL('https://example.xyz')
  };
}