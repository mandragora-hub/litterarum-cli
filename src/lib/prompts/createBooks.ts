import inquirer from 'inquirer';
import inquirerPrompt from 'inquirer-autocomplete-prompt';
import {
  searchAuthors,
  searchTags,
  createBook,
  searchFiles,
  getTagsIdFromName,
} from '../../utils/lApiClient.js';
import { searchBookCover } from '../../utils/bookCover.js';
import errorHandler from '../../utils/errorHandler.js';
import { getPdfInfo } from '../../utils/metadata.js';
import ora from 'ora';

export default async function createBookPrompts() {
  inquirer.registerPrompt('autocomplete', inquirerPrompt);
  inquirer
    .prompt([
      {
        type: 'input',
        name: 'title',
        message: "What's the book title?",
        validate: (val) => {
          if (val) return true;
          return 'Cannot be empty.';
        },
      },
      {
        type: 'rawlist',
        name: 'coverUrl',
        message: 'Select a cover image',
        loop: false,
        choices: (answers) => searchBookCover(answers.title),
      },
      {
        type: 'editor',
        name: 'description',
        message: 'Write brief description about the book',
      },
      {
        type: 'autocomplete',
        name: 'author',
        searchText: 'Searching...',
        emptyText: 'Nothing found!',
        message: 'Select the author',
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
        choices: async () => (await searchTags()).map((tags) => tags.tag),
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
        prefix: " 🌎 ",
        suffix: " E.g. 378-321 BC, 1987",
      },
      {
        type: 'input',
        name: 'isbn',
        message: "What's the book isbn? ",
        suffix: "If you don't have, leave it blank"
      },
      {
        type: 'autocomplete',
        name: 'pdfFile',
        searchText: 'Searching...',
        emptyText: 'Nothing found!',
        message: 'Select PDF file',
        source: searchFiles,
      },
      {
        type: 'confirm',
        name: 'hasEPubFile',
        message: 'Has EPub file?',
      },
      {
        type: 'autocomplete',
        name: 'ePubFile',
        when: (answers) => answers.hasEPubFile,
        searchText: 'Searching...',
        emptyText: 'Nothing found!',
        message: 'Select EPub file',
        source: searchFiles,
      },
    ])
    .then(async (answers) => {
      // clean answers
      delete answers['hasEPubFile'];
      !answers['isbn'] && delete answers['isbn'];
      !answers['publicationDate'] && delete answers['publicationDate'];
      
      const spinner = ora('Generating metadata...').start();
      const metadata = await getPdfInfo(answers.pdfFile);
      if (metadata) answers = { ...answers, ...metadata };
      spinner.stop();

      // show resume information
      console.log(JSON.stringify(answers, null, '  '));

      const { confirm } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: 'Do you want to create the book?',
        },
      ]);

      if (!confirm) return;
      const res = await createBook(answers);
      console.log(res);
    })
    .catch(errorHandler);
}
