import inquirer from 'inquirer';
import inquirerPrompt from 'inquirer-autocomplete-prompt';
import chalk from 'chalk';
import { searchBooks, getBook } from '../../utils/lApiClient.js';
import errorHandler from '../../utils/errorHandler.js';
import ora from 'ora';

export default async function createBookPrompts() {
  inquirer.registerPrompt('autocomplete', inquirerPrompt);
  inquirer
    .prompt([
      {
        type: 'autocomplete',
        name: 'bookId',
        searchText: 'Searching...',
        emptyText: 'Nothing found!',
        message: 'What book do you want to preview?',
        source: async (_answers, input) =>
          (await searchBooks(input)).map((el) => el.title),
        filter: async (val) => {
          const res = await searchBooks(val);
          return res.shift()._id;
        },
      },
    ])
    .then(async (answers) => {
      const spinner = ora('Fetching book.').start();
      const book = await getBook(answers.bookId);
      spinner.stop();
      
      // console.clear();
      console.log(`Book name: ${chalk.green(book.title)}.`);
      console.log(`Author: ${chalk.green(book.author.name)}.`);
      console.log(`Downloaded: ${chalk.yellow(book.downloaded)}.`);
      console.log(`Views: ${chalk.yellow(book.views)}.`);
      console.log(`Cover url: ${chalk.green(book.coverUrl)}.`);
      console.log(`Pdf file: ${chalk.green(book.pdfFile)}.`);
      console.log(
        `Tags: ${chalk.green(book.tags.map((el) => el.tag)).toString()}.`,
      );
      // console.log(`description: ${book.description}.`);

      console.log(`\nThe next attributes should be set automatically.`);

      console.log(`Pages: ${chalk.yellow(book.pages)}.`);
      console.log(`Word count: ${chalk.yellow(book.wordCount)}.`);
      console.log(`Read time: ${chalk.yellow(book.readTime)}.`);
      console.log(`Updated at: ${chalk.yellow(book.updatedAt)}.`);
    })
    .catch(errorHandler);
}
