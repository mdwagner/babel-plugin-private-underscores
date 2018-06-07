# babel-plugin-private-underscores

> Make _classMembers 'private' using symbols

## Install

```sh
npm i mdwagner/babel-plugin-private-underscores -D
yarn add mdwagner/babel-plugin-private-underscores -D
```

## Example

**Input**

```js
class Foo {
  constructor() {
    this._method();
  }

  _method() {
    // ...
  }
}
```

**Output**

```js
const _method = Symbol('_method');
class Foo {
  constructor() {
    this[_method]();
  }

  [_method]() {
    // ...
  }
}
```

## Usage

```js
{
  "plugins": [
    "private-underscores-const"
  ]
}
```

> **Note:** This is not *real* private, it just makes it a lot harder for
> people to accidentally use methods with underscores.
