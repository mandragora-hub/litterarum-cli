#!/usr/bin/env node

import * as dotenv from 'dotenv';

import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import printList from './lib/printList.js';
import { Assets, assetsChoice } from '../types.js';
import { isRunning } from './utils/lApiClient.js';
import terminalLink from 'terminal-link';
import * as config from './lib/config.js';
import createBookPrompts from './lib/prompts/createBooks.js';
import removeBookPrompts from './lib/prompts/removeBooks.js';
import editBookPrompts from './lib/prompts/editBooks.js';
import createTagPrompts from './lib/prompts/createTag.js';
import removeTagPrompts from './lib/prompts/removeTag.js';
import editTagPrompts from './lib/prompts/editTag.js';
import createAuthorPrompts from './lib/prompts/createAuthor.js';
import editAuthorPrompts from './lib/prompts/editAuthor.js';
import removeAuthorPrompts from './lib/prompts/removeAuthor.js';

dotenv.config({ path: config.CONFIG_FILE });

if (!config.hasMinimumConfiguration()) {
  // cannot run without a minimum configuration
  process.exit(1);
}

if (!(await isRunning())) {
  const healthcheckLink = terminalLink(
    'Healthcheck',
    `${process.env.API_URL}/healthcheck`,
  );
  console.error(
    `${healthcheckLink} failed. Please make sure the api is running.`,
  );
  process.exit(1);
}

await yargs(hideBin(process.argv))
  .command(
    'list <assets>',
    'List litterarum resources.',
    (yargs) => {
      return yargs.positional('assets', {
        describe: 'type of assets',
        type: 'string',
        choices: assetsChoice,
      });
    },
    async (argv) => {
      await printList(argv.assets as Assets, argv.verbose as boolean);
    },
  )
  .command(
    'create <assets>',
    'Create a resources.',
    (yargs) => {
      return yargs.positional('assets', {
        describe: 'type of assets',
        type: 'string',
        choices: assetsChoice,
      });
    },
    async (argv) => {
      argv.assets === 'book' && (await createBookPrompts());
      argv.assets === 'tag' && (await createTagPrompts());
      argv.assets === 'author' && (await createAuthorPrompts());
    },
  )
  .command(
    'edit <assets>',
    'Edit a resources.',
    (yargs) => {
      return yargs.positional('assets', {
        describe: 'type of assets',
        type: 'string',
        choices: assetsChoice,
      });
    },
    async (argv) => {
      argv.assets === 'book' && (await editBookPrompts());
      argv.assets === 'tag' && (await editTagPrompts());
      argv.assets === 'author' && (await editAuthorPrompts());
    },
  )
  .command(
    'remove <assets>',
    'Remove a resources.',
    (yargs) => {
      return yargs.positional('assets', {
        describe: 'type of assets',
        type: 'string',
        choices: assetsChoice,
      });
    },
    async (argv) => {
      argv.assets === 'book' && (await removeBookPrompts());
      argv.assets === 'tag' && (await removeTagPrompts());
      argv.assets === 'author' && (await removeAuthorPrompts());
    },
  )
  .command(
    'config <action> [key] [value]',
    'config.',
    (yargs) => {
      return yargs
        .positional('action', {
          describe: 'type of action',
          type: 'string',
          choices: ['set', 'get', 'list'],
        })
        .positional('key', {
          type: 'string',
        })
        .positional('value', {
          type: 'string',
        });
    },
    (argv) => {
      argv.action === 'set' && config.set(argv.key, argv.value);
      argv.action === 'get' && config.get(argv.key);
      argv.action === 'list' && config.list();
    },
  )
  .option('verbose', {
    alias: 'v',
    type: 'boolean',
    description: 'Run with verbose logging',
  })
  .parse();
