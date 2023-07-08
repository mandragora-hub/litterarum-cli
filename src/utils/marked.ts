
import { marked } from 'marked';
import TerminalRenderer from 'marked-terminal';

marked.setOptions({
  mangle: false,
  headerIds: false,
  // @ts-expect-error no idea why, but works
  // Define custom renderer
  renderer: new TerminalRenderer(),
});

export default function (text: string) {
  return marked(text);
}
