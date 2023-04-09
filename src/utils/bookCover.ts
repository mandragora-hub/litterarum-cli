import wretch from 'wretch';

export async function searchBookCover(bookName: string) {
  const openLibraryResult = await searchOpenLibrary(bookName);
  const googleBooksResult = await searchGoogleBooks(bookName);
  return [...openLibraryResult, ...googleBooksResult];
}

export async function searchOpenLibrary(bookName: string) {
  const openLibraryUrl = `https://openlibrary.org/search.json?title=${bookName}`;

  const result = await wretch(openLibraryUrl).get().json<any>();
  if (result.numFound === 0) return [];

  const coverUrls = result.docs
    .filter((doc) => doc.cover_i)
    .map((doc) => {
      return `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`;
    });
  return coverUrls;
}

export async function searchGoogleBooks(bookName: string) {
  const googleBooksUrl = `https://www.googleapis.com/books/v1/volumes?q=${bookName}`;
  const result = await wretch(googleBooksUrl).get().json<any>();
  if (result.totalItems === 0) return [];

  const coverUrls = result.items
    .filter((item) => item.volumeInfo.imageLinks)
    .map((item) => item.volumeInfo.imageLinks.thumbnail);

  return coverUrls;
}
