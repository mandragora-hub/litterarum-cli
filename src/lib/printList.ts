/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { Assets } from '../../types.js';
import { lApiClient } from '../utils/lApiClient.js';

const printBooks = async (_verbose: boolean) => {
  const result = await lApiClient().get(`/books`).json<any>();
  console.table(result.data, ['_id', 'title', 'pages']);
};

const printAuthors = async (_verbose: boolean) => {
  const result = await lApiClient().get(`/authors`).json<any>();
  console.table(result.data, ['_id', 'name']);
};

const printTags = async (_verbose: boolean) => {
  const result = await lApiClient().get(`/tags`).json<any>();
  console.table(result.data, ['_id', 'tag']);
};

const printList = async (assets: Assets, verbose: boolean) => {
  if (assets === 'book') return await printBooks(verbose);
  if (assets === 'author') return await printAuthors(verbose);
  if (assets === 'tag') return await printTags(verbose);
};

export default printList;
