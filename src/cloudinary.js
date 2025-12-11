export const CLOUD_NAME = "dlrxomdfh";
export const UPLOAD_PRESET = "Shop-preset";
export const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

export const uploadImageToCloudinary = async (uri) => {
  try {
    const isWeb = typeof window !== "undefined";

    const formData = new FormData();

    if (isWeb) {
      // Always convert the local URI to blob on web
      const response = await fetch(uri);
      const blob = await response.blob();

      const file = new File([blob], "image.jpg", { type: blob.type || "image/jpeg" });

      formData.append("file", file);
    } else {
      // Native upload format
      formData.append("file", {
        uri,
        type: "image/jpeg",
        name: "upload.jpg",
      });
    }

    formData.append("upload_preset", UPLOAD_PRESET);

    const response = await fetch(CLOUDINARY_URL, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Upload failed");
    }

    return data.secure_url;
  } catch (error) {
    console.error("Error uploading image to Cloudinary:", error);
    throw error;
  }
};
