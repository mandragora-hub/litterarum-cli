import * as emoji from 'node-emoji';
import terminalLink from 'terminal-link';

export async function farewell() {
  console.log('\n');
  const username = terminalLink(
    'mandragora-hub.',
    'https://github.com/mandragora-hub/',
  );
  console.log(`Made we ${emoji.get('heart')} by ${username}.`);
}
