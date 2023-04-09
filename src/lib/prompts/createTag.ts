import inquirer from 'inquirer';
import inquirerPrompt from 'inquirer-autocomplete-prompt';
import {
  searchTags,
  createTag,
} from '../../utils/lApiClient.js';
import errorHandler from '../../utils/errorHandler.js';

export default async function createTagPrompts() {
  inquirer.registerPrompt('autocomplete', inquirerPrompt);
  inquirer
    .prompt([
      {
        type: 'input',
        name: 'tag',
        message: "What's the tag name?",
        validate: async (val) => {
          const tags = await searchTags(val);
          if (tags.length < 1) return true;
          return `Cannot create new tag because already exist tag ${val}.`;
        },
        filter: (val) => val.toLowerCase(),
      },
    ])
    .then(async (answers) => {
      const res = await createTag(answers);
      console.log(res);
    })
    .catch(errorHandler);
}
