import DataURIParser from "datauri/parser.js";
import path from "path";

export function getDataUri(file) {
  const parser = new DataURIParser(); //parsing an image file to extract metadata or file's extension
  const extName = path.extname(file.originalname).toString();
  return parser.format(extName, file.buffer);
}
