import * as babel from 'babel-core';
import stripIndent from 'strip-indent';
import classProperties from 'babel-plugin-syntax-class-properties';
import plugin from '../src';

function testPlugin({ input, expected }) {
  input = stripIndent(input).trim();
  expected = stripIndent(expected).trim();

  const code = babel.transform(input, {
    plugins: [plugin, classProperties],
  }).code.trim();

  expect(code).toBe(expected);
}

test('none', () => {
  testPlugin({
    input: `
      class Foo {}
    `,
    expected: `
      class Foo {}
    `
  });
});

test('normal', () => {
  testPlugin({
    input: `
      class Foo {
        constructor() {
          this.method();
        }

        method() {
          // ...
        }
      }
    `,
    expected: `
      class Foo {
        constructor() {
          this.method();
        }

        method() {
          // ...
        }
      }
    `
  });
});

test('method', () => {
  testPlugin({
    input: `
      class Foo {
        constructor() {
          this._method();
        }

        _method() {
          // ...
        }
      }
    `,
    expected: `
      const _method = Symbol("_method");

      class Foo {
        constructor() {
          this[_method]();
        }

        [_method]() {
          // ...
        }
      }
    `
  });
});

test('property', () => {
  testPlugin({
    input: `
      class Foo {
        constructor() {
          this._prop;
        }

        _prop = true;
      }
    `,
    expected: `
      const _prop = Symbol("_prop");

      class Foo {
        constructor() {
          this[_prop];
        }

        [_prop] = true;
      }
    `
  });
});

test('expression', () => {
  testPlugin({
    input: `
      function createFoo() {
        return class Foo {
          constructor() {
            this._method();
          }

          _method() {
            // ...
          }
        };
      }
    `,
    expected: `
      const _method = Symbol("_method");

      function createFoo() {
        return class Foo {
          constructor() {
            this[_method]();
          }

          [_method]() {
            // ...
          }
        };
      }
    `
  });
});

test('missing refs', () => {
  testPlugin({
    input: `
      class Foo {
        constructor() {
          this._method();
        }
      }
    `,
    expected: `
      class Foo {
        constructor() {
          this._method();
        }
      }
    `
  });
});

test('subclass', () => {
  testPlugin({
    input: `
      class Foo {
        constructor() {
          this._method();
        }

        _method() {
          // ...
        }
      }

      class Bar extends Foo {
        constructor() {
          this._method();
        }
      }
    `,
    expected: `
      const _method = Symbol("_method");

      class Foo {
        constructor() {
          this[_method]();
        }

        [_method]() {
          // ...
        }
      }

      class Bar extends Foo {
        constructor() {
          this._method();
        }
      }
    `
  });
});
