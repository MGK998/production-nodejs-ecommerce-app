import multer from "multer";

const storage = multer.memoryStorage(); //this is temporary storage

export const singleUpload = multer({ storage: storage }).single("file");
