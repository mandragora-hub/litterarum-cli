/* eslint-disable @typescript-eslint/no-explicit-any */
import wretch from 'wretch';
import fuzzy from 'fuzzy';

const handle403 = () => {
  console.log('403 Forbidden');
};

export const lApiClient = () => {
  return wretch(process.env.API_URL)
    .auth(`Bearer ${process.env.API_TOKEN}`)
    .options({ credentials: 'include', mode: 'cors' })
    .resolve((_) => _.forbidden(handle403));
};

export const isRunning = async () => {
  try {
    await lApiClient().get('/healthcheck').json();
    return true;
  } catch (err) {
    // console.error(err);
    return false;
  }
};

export const searchBooks = async (q = '') => {
  const result = await lApiClient()
    .get(`/search/books?q=${q}&limit=100`)
    .json<any>();
  return result.data;
};

export const searchAuthors = async (q = '') => {
  const result = await lApiClient()
    .get(`/search/authors?q=${q}&limit=100`)
    .json<any>();
  return result.data;
};

export const searchTags = async (q = '') => {
  const result = await lApiClient()
    .get(`/search/tags?q=${q}&limit=100`)
    .json<any>();
  return result.data;
};

export const createBook = async (book) => {
  const result = await lApiClient()
    .url('/books')
    .post(book)
    .json((res) => res)
    .catch((err) => err);
  return result;
};

export const createTag = async (tag) => {
  const result = await lApiClient()
    .url('/tags')
    .post(tag)
    .json((res) => res)
    .catch((err) => err);
  return result;
};

export const editBook = async (bookId: string, book) => {
  const result = await lApiClient()
    .url(`/books/${bookId}`)
    .put(book)
    .json((res) => res)
    .catch((err) => err);
  return result;
};

export const editTag = async (tagId: string, tag) => {
  const result = await lApiClient()
    .url(`/tags/${tagId}`)
    .put(tag)
    .json((res) => res)
    .catch((err) => err);
  return result;
};

export const getBook = async (bookId: string) => {
  const result = await lApiClient()
    .get(`/books/${bookId}`)
    .json((res) => res.data);
  return result;
};

export const getTag = async (tagId: string) => {
  const result = await lApiClient()
    .get(`/tags/${tagId}`)
    .json((res) => res.data);
  return result;
};

export const deleteBook = async (bookId: string) => {
  const result = await lApiClient()
    .url(`/books/${bookId}`)
    .delete()
    .json((res) => res)
    .catch((err) => err);
  return result;
};

export const deleteTag = async (tagId: string) => {
  const result = await lApiClient()
    .url(`/tags/${tagId}`)
    .delete()
    .json((res) => res)
    .catch((err) => err);
  return result;
};

export const getTagsIdFromName = async (tags: string[]) => {
  const ids: string[] = [];
  for (const el of tags) {
    const result = await searchTags(el);
    ids.push(result.shift()._id);
  }
  return ids;
};

export async function searchFiles(
  _answers,
  input = '' /*type: 'pdf' | 'epub'*/,
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await lApiClient().get('/files').json<any>();
  const files = result.data.map((file) => file.basename);

  return fuzzy.filter(input, files).map((el) => el.original);
}
