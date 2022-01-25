import { removeTypes } from '../src';

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

  it('handles module declarations', async () => {
    const contents = `export default class Blah extends Service {}

// This comment is very important but not if you're using JS
declare module 'foo' {
  interface blah {
    thing: number;
  }

  type bar = 'baz' | 'baq';
}
`;

    const expected = `export default class Blah extends Service {}\n`;

    expect(await removeTypes(contents)).toEqual(expected);
  });

  it('handles interface implements', async () => {
    const contents = `interface ImplementMe {}

class Implemented implements ImplementMe {}
`;

    const expected = `class Implemented {}\n`;

    expect(await removeTypes(contents)).toEqual(expected);
  });

  it('handles type declarations', async () => {
    const contents = `
// this comment should disappear
type Foo = 'foo' | 'Foo';

const foo: Foo = 'foo';
`;
    const expected = `const foo = 'foo';
`;

    expect(await removeTypes(contents)).toEqual(expected);
  });

  it('handles class field declarations in constructor', async () => {
    const contents = `class Foo {
  constructor(public foo: string, private bar: number) {}
}`;

    const expected = `class Foo {
  constructor(foo, bar) {
    this.foo = foo;
    this.bar = bar;
  }
}
`;
    expect(await removeTypes(contents)).toEqual(expected);
  });

  it('handles all the stuff', async () => {
    const contents = `import Component from 'component';

type Bar = 'foo';

// sick interface bro
interface FooArgs {
  // this is a number
  someField: number
}

interface ImplementMe {}

// this comment should stay
export default class Foo extends Component<FooArgs> implements ImplementMe {
  // so should this one

  // decorators and class fields whoa
  @tracked
  foo: Bar = 'foo';

  constructor(public prop1: string, private prop2: number) {
    super();
  }
}
`;

    const expected = `import Component from 'component';

// this comment should stay
export default class Foo extends Component {
  // so should this one

  // decorators and class fields whoa
  @tracked
  foo = 'foo';

  constructor(prop1, prop2) {
    super();
    this.prop1 = prop1;
    this.prop2 = prop2;
  }
}
`;
    expect(await removeTypes(contents)).toEqual(expected);
  });
});
