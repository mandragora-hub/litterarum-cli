import inquirer from 'inquirer';
import inquirerPrompt from 'inquirer-autocomplete-prompt';
import { searchAuthors, deleteAuthor } from '../../utils/lApiClient.js';
import errorHandler from '../../utils/errorHandler.js';

export default async function removeAuthorPrompts() {
  inquirer.registerPrompt('autocomplete', inquirerPrompt);
  inquirer
    .prompt([
      {
        type: 'autocomplete',
        name: 'authorId',
        searchText: 'Searching...',
        emptyText: 'Nothing found!',
        message: 'What author do you want to delete?',
        source: async (_answers, input) =>
          (await searchAuthors(input)).map((el) => el.name),
        filter: async (val) => {
          const res = await searchAuthors(val);
          return res.shift()._id;
        },
      },
      {
        type: 'confirm',
        name: 'confirm',
        message: (answers) =>
          `Are you sure, delete author ${answers.authorId}?`,
      },
    ])
    .then(async (answers) => {
      if (!answers.confirm) return;
      const res = await deleteAuthor(answers.authorId);
      console.log(res);
    })
    .catch(errorHandler);
}
