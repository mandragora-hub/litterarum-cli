import inquirer from 'inquirer';
import inquirerPrompt from 'inquirer-autocomplete-prompt';
import {
  createAuthor,
} from '../../utils/lApiClient.js';
import errorHandler from '../../utils/errorHandler.js';

export default async function createAuthorPrompts() {
  inquirer.registerPrompt('autocomplete', inquirerPrompt);
  inquirer
    .prompt([
      {
        type: 'input',
        name: 'name',
        message: "What's the author name?",
        validate: (val) => {
          if (val) return true;
          return 'Cannot be empty.';
        },
      },
      {
        type: 'editor',
        name: 'biography',
        message: 'Write brief biography of author',
      },
      // {
      //   type: 'rawlist',
      //   name: 'coverUrl',
      //   message: 'Select a cover image',
      //   loop: false,
      //   choices: (answers) => searchBookCover(answers.title),
      // },
    ])
    .then(async (answers) => {
      console.log(JSON.stringify(answers, null, '  '));

      const { confirm } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: 'Do you want to create the author?',
        },
      ]);

      if (!confirm) return;
      const res = await createAuthor(answers);
      console.log(res);
    })
    .catch(errorHandler);
}
