import inquirer from 'inquirer';
import inquirerPrompt from 'inquirer-autocomplete-prompt';
import { searchTags, deleteTag } from '../../utils/lApiClient.js';
import errorHandler from '../../utils/errorHandler.js';

export default async function removeTagPrompts() {
  inquirer.registerPrompt('autocomplete', inquirerPrompt);
  inquirer
    .prompt([
      {
        type: 'autocomplete',
        name: 'tagId',
        searchText: 'Searching...',
        emptyText: 'Nothing found!',
        message: 'What tag do you want to delete?',
        source: async (_answers, input) =>
          (await searchTags(input)).map((el) => el.tag),
        filter: async (val) => {
          const res = await searchTags(val);
          return res.shift()._id;
        },
      },
      {
        type: 'confirm',
        name: 'confirm',
        message: (answers) => `Are you sure, delete book ${answers.tagId}?`,
      },
    ])
    .then(async (answers) => {
      if (!answers.confirm) return;
      const res = await deleteTag(answers.tagId);
      console.log(res);
    })
    .catch(errorHandler);
}
