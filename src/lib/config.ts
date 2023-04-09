import { parse, stringify } from 'envfile';
import fs from 'fs';
import os from 'os';

export const CONFIG_FILE = `${os.homedir()}/.lcli`;

export function set(key: string, value: string) {
  const data = fs.readFileSync(CONFIG_FILE);
  const env = parse(data);
  env[key] = value;
  const newData = stringify(env);
  fs.writeFileSync(CONFIG_FILE, newData, { flag: 'w' });
}

export function get(key: string) {
  const data = fs.readFileSync(CONFIG_FILE);
  const variable = parse(data);
  console.log(variable[key]);
}

export function list() {
  const data = fs.readFileSync(CONFIG_FILE);
  const env = parse(data);
  console.table(env);
}

export function hasMinimumConfiguration() {
  if (!process.env.API_URL) {
    console.error('API_URL not specified.');
    return false;
  }
  if (!process.env.API_TOKEN) {
    console.error('API_TOKEN not specified.');
    return false;
  }

  return true;
}
