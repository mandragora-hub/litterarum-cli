import inquirer from 'inquirer';
import inquirerPrompt from 'inquirer-autocomplete-prompt';
import {
  searchAuthors,
  getAuthor,
  editAuthor,
} from '../../utils/lApiClient.js';
import errorHandler from '../../utils/errorHandler.js';

export default async function editAuthorPrompts() {
  inquirer.registerPrompt('autocomplete', inquirerPrompt);
  const author = await inquirer
    .prompt([
      {
        type: 'autocomplete',
        name: 'authorId',
        searchText: 'Searching...',
        emptyText: 'Nothing found!',
        message: 'What author do you want to edit?',
        source: async (_answers, input) =>
          (await searchAuthors(input)).map((el) => el.name),
        filter: async (val) => {
          const res = await searchAuthors(val);
          return res.shift()._id;
        },
      },
    ])
    .then(async (answers) => await getAuthor(answers.authorId));

  inquirer
    .prompt([
      {
        type: 'input',
        name: 'name',
        default: author.name,
        message: "What's the author name?",
        validate: (val) => {
          if (val) return true;
          return 'Cannot be empty.';
        },
      },
      {
        type: 'editor',
        name: 'biography',
        default: author.biography,
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
          message: 'Do you want to edit the author?',
        },
      ]);

      if (!confirm) return;
      const res = await editAuthor(author._id, answers);
      console.log(res);
    })
    .catch(errorHandler);
}
