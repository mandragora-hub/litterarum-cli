import { loadDocument } from 'pdf-metadata';

export const getPdfInfo = async (filename: string) => {
  try {
    const url = `${process.env.API_URL}/files/${filename}`;
    const document = await loadDocument(url);
    const info = await document.getInfo();
    return info;
  } catch (error) {
    console.error(error);
    return undefined;
  }
};
