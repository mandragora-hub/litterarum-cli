import inquirer from 'inquirer';
import inquirerPrompt from 'inquirer-autocomplete-prompt';
import chalk from 'chalk';
import { searchAuthors, getAuthor } from '../../utils/lApiClient.js';
import errorHandler from '../../utils/errorHandler.js';
import ora from 'ora';

export default async function createAuthorPrompts() {
  inquirer.registerPrompt('autocomplete', inquirerPrompt);
  inquirer
    .prompt([
      {
        type: 'autocomplete',
        name: 'authorId',
        searchText: 'Searching...',
        emptyText: 'Nothing found!',
        message: 'What author do you want to preview?',
        source: async (_answers, input) =>
          (await searchAuthors(input)).map((el) => el.name),
        filter: async (val) => {
          const res = await searchAuthors(val);
          return res.shift()._id;
        },
      },
    ])
    .then(async (answers) => {
      const spinner = ora('Fetching author.').start();
      const author = await getAuthor(answers.authorId);
      spinner.stop();
      
      // console.clear();
      console.log(`Name: ${chalk.green(author.name)}.`);
      console.log(`Photo url: ${chalk.green(author.photoUrl)}.`);
      
    })
    .catch(errorHandler);
}
