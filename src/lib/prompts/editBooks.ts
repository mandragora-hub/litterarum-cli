import inquirer from 'inquirer';
import inquirerPrompt from 'inquirer-autocomplete-prompt';
import {
  searchAuthors,
  searchTags,
  editBook,
  searchBooks,
  getBook,
  searchFiles,
  getTagsIdFromName,
} from '../../utils/lApiClient.js';
import { searchBookCover } from '../../utils/bookCover.js';
import errorHandler from '../../utils/errorHandler.js';
import { getPdfInfo } from '../../utils/metadata.js';
import ora from 'ora';

export default async function editBookPrompts() {
  inquirer.registerPrompt('autocomplete', inquirerPrompt);
  const book = await inquirer
    .prompt([
      {
        type: 'autocomplete',
        name: 'bookId',
        searchText: 'Searching...',
        emptyText: 'Nothing found!',
        message: 'What book do you want to edit?',
        source: async (_answers, input) =>
          (await searchBooks(input)).map((el) => el.title),
        filter: async (val) => {
          const res = await searchBooks(val);
          return res.shift()._id;
        },
      },
    ])
    .then(async (answers) => await getBook(answers.bookId));

  inquirer
    .prompt([
      {
        type: 'input',
        name: 'title',
        message: "What's the book title?",
        default: book.title,
        validate: (val) => {
          if (val) return true;
          return 'Cannot be empty.';
        },
      },
      {
        type: 'confirm',
        name: 'newCover',
        message: `Do you want to looking for a new cover? Current cover: ${book.coverUrl}`,
      },
      {
        type: 'rawlist',
        name: 'coverUrl',
        default: book.coverUrl,
        when: (answers) => answers.newCover,
        message: 'Select a cover image',
        loop: false,
        choices: (answers) => searchBookCover(answers.title),
      },
      {
        type: 'editor',
        name: 'description',
        default: book.description,
        message: 'Write brief description about the book',
      },
      {
        type: 'confirm',
        name: 'newAuthor',
        message: `Do you want to select a new author? Current author: ${book?.author?.name}`,
      },
      {
        type: 'autocomplete',
        name: 'author',
        searchText: 'Searching...',
        emptyText: 'Nothing found!',
        message: 'Select the author',
        when: (answers) => answers.newAuthor,
        source: (_answers, input) => searchAuthors(input),
        filter: async (val) => {
          const res = await searchAuthors(val);
          return res.shift()._id;
        },
      },
      {
        type: 'checkbox',
        name: 'tags',
        message: 'Select tags of books.',
        choices: async () =>
          (await searchTags()).map((tags) => {
            return {
              name: tags.tag,
              checked: book.tags.some((el) => el.tag === tags.tag),
            };
          }),
        validate: (input) => {
          if (!input.length) return 'Select unless one or more tags';
          return input.length > 6
            ? 'Do not select more than 5 tags per book'
            : true;
        },
        filter: async (val) => {
          return await getTagsIdFromName(val);
        },
      },
      {
        type: 'input',
        name: 'publicationDate',
        message: "What's the publication date?",
        prefix: ' 🌎 ',
        suffix: ' E.g. 378-321 BC, 1987',
        default: book.publicationDate,
      },
      {
        type: 'input',
        name: 'isbn',
        message: "What's the book isbn? ",
        suffix: "If you don't have, leave it blank",
        default: book.isbn,
      },
      {
        type: 'confirm',
        name: 'newPdfFile',
        message: `Do you want to select a new pdf file? Current: ${book.pdfFile}`,
      },
      {
        type: 'autocomplete',
        name: 'pdfFile',
        when: (answers) => answers.newPdfFile,
        searchText: 'Searching...',
        emptyText: 'Nothing found!',
        message: 'Select PDF file',
        source: searchFiles,
      },
      {
        type: 'confirm',
        name: 'newEPubFile',
        message: `Do you want to select a new epub file? Current: ${book.ePubFile}`,
      },
      {
        type: 'autocomplete',
        name: 'ePubFile',
        when: (answers) => answers.newEPubFile,
        searchText: 'Searching...',
        emptyText: 'Nothing found!',
        message: 'Select EPub file',
        source: searchFiles,
      },
    ])
    .then(async (answers) => {
      if (answers.newPdfFile) {
        const spinner = ora('Generating metadata...').start();
        const metadata = await getPdfInfo(answers.pdfFile);
        if (metadata) answers = { ...answers, ...metadata };
        spinner.stop();
      }

      // clean answers
      delete answers['newCover'];
      delete answers['newEPubFile'];
      delete answers['newPdfFile'];
      delete answers['newAuthor'];
      !answers['isbn'] && delete answers['isbn'];
      !answers['publicationDate'] && delete answers['publicationDate'];

      // show resume information
      console.log(JSON.stringify(answers, null, '  '));

      const { confirm } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: 'Do you want to edit the book?',
        },
      ]);

      if (!confirm) return;
      const res = await editBook(book._id, answers);
      console.log(res);
    })
    .catch(errorHandler);
}
