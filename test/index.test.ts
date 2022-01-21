import removeTypes from '../src';
import fs from 'fs-extra';
import path from 'path';

function file(filePath: string) {
  expect(fs.pathExistsSync(filePath)).toBe(true);
  return fs.readFileSync(filePath, { encoding: 'utf-8' });
}

function fixture(filePath: string) {
  return file(path.join(process.cwd(), 'test/fixtures', filePath)).trimEnd();
}

describe('removeTypes', () => {
  it(`preserves default exports`, async () => {
    const contents = `export default class Foo {}\n`;

    expect(await removeTypes(contents)).toEqual(contents);
  });

  it('preserves commented function arguments', async () => {
    const contents = `function foo(params /*, namedParams */) {}\n`;

    expect(await removeTypes(contents)).toEqual(contents);
  });

  it('leaves decorators alone', async () => {
    const contents = `class Foo {
  @blah
  foo() {}
}
`;

    expect(await removeTypes(contents)).toEqual(contents);
  });

  it('works with numeric enums?', async () => {
    const contents = `enum LogLevel {
  ERROR,
  WARN,
  INFO,
  DEBUG,
}

function f(obj: { X: number }) {
  return obj.X;
}

f(E);
`;

    expect(await removeTypes(contents)).toEqual('foo');
  });

  it('works with string enums?', async () => {
    const contents = ``;
  });

  it('handles all the stuff', async () => {
    const contents = `import Component from 'component';

// sick interface bro
interface FooArgs {
  // this is a number
  someField: number
}

// this comment should stay
export default class Foo extends Component<FooArgs> {
  // so should this one

  // decorators and class fields whoa
  @tracked
  foo = 'foo';
}
`;

    const expected = `import Component from 'component';

// this comment should stay
export default class Foo extends Component {
  // so should this one

  // decorators and class fields whoa
  @tracked
  foo = 'foo';
}
`;
    expect(await removeTypes(contents)).toEqual(expected);
  });
});
