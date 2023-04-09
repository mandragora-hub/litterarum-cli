import inquirer from 'inquirer';
import inquirerPrompt from 'inquirer-autocomplete-prompt';
import { searchBooks, deleteBook } from '../../utils/lApiClient.js';
import errorHandler from '../../utils/errorHandler.js';

export default async function removeBookPrompts() {
  inquirer.registerPrompt('autocomplete', inquirerPrompt);
  inquirer
    .prompt([
      {
        type: 'autocomplete',
        name: 'bookId',
        searchText: 'Searching...',
        emptyText: 'Nothing found!',
        message: 'What book do you want to delete?',
        source: async (_answers, input) =>
          (await searchBooks(input)).map((el) => el.title),
        filter: async (val) => {
          const res = await searchBooks(val);
          return res.shift()._id;
        },
      },
      {
        type: 'confirm',
        name: 'confirm',
        message: (answers) => `Are you sure, delete book ${answers.bookId}?`,
      },
    ])
    .then(async (answers) => {
      if (!answers.confirm) return;
      const res = await deleteBook(answers.bookId);
      console.log(res);
    })
    .catch(errorHandler);
}
