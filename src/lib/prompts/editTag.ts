import inquirer from 'inquirer';
import inquirerPrompt from 'inquirer-autocomplete-prompt';
import { searchTags, getTag, editTag } from '../../utils/lApiClient.js';
import errorHandler from '../../utils/errorHandler.js';

export default async function editTagPrompts() {
  inquirer.registerPrompt('autocomplete', inquirerPrompt);
  const tag = await inquirer
    .prompt([
      {
        type: 'autocomplete',
        name: 'tagId',
        searchText: 'Searching...',
        emptyText: 'Nothing found!',
        message: 'What tag do you want to edit?',
        source: async (_answers, input) =>
          (await searchTags(input)).map((el) => el.tag),
        filter: async (val) => {
          const res = await searchTags(val);
          return res.shift()._id;
        },
      },
    ])
    .then(async (answers) => await getTag(answers.tagId));

  inquirer
    .prompt([
      {
        type: 'input',
        name: 'tag',
        default: tag.tag,
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
      const res = await editTag(tag._id, answers);
      console.log(res);
    })
    .catch(errorHandler);
}
