import removeTypes from '../src';
import fs from 'fs-extra';
import path from 'path';

function file(filePath: string) {
  expect(fs.pathExistsSync(filePath)).toBe(true);
  return fs.readFileSync(filePath, { encoding: 'utf-8' });
}

function fixture(filePath: string) {
  return file(path.join(process.cwd(), 'test/fixtures', filePath));
}

describe('removeTypes', () => {
  it('works', async () => {
    const code = await removeTypes(fixture('class.ts'));
    const expected = fixture('class.js');
    console.log(code.split('\n').length);
    console.log(expected.split('\n').length);
    expect(code).toEqual(expected);
  });
});
