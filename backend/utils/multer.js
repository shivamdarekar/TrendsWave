import multer from "multer";

// Store files in memory as buffer
const storage = multer.memoryStorage();

// Single file upload with field name "image"
export const upload = multer({ storage });
