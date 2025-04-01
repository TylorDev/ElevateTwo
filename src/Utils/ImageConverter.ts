import { ImageData } from "src/types/global";

export const dataToImageUrl = (
  input: null | undefined | Uint8Array | ImageData,
  mimeType: string = "image/png"
): string => {
  const DEFAULT_IMAGE =
    "https://i.pinimg.com/736x/ef/23/25/ef2325cedb047b8ac24fc2b718c15a30.jpg";

  // Handle null or undefined input
  if (input == null) {
    return DEFAULT_IMAGE;
  }

  try {
    // Handle Uint8Array input
    if (input instanceof Uint8Array) {
      return URL.createObjectURL(new Blob([input], { type: mimeType }));
    }

    // Handle ImageData object input
    if ("data" in input && input.type !== "Other") {
      return URL.createObjectURL(new Blob([input.data], { type: mimeType }));
    }

    // Return default image if no conditions match
    return DEFAULT_IMAGE;
  } catch (error) {
    console.error("Error converting data to image URL:", error);
    return DEFAULT_IMAGE;
  }
};
