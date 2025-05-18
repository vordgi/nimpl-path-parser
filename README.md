# @nimpl/path-parser

Helper for next.js-styled pathname parsing (f.e. /(site)/docs/[key]) to get dynamic params

Visit https://nimpl.dev/docs/path-parser to view the full documentation.

## Installation

**Using npm:**

```bash
npm i @nimpl/path-parser
```

**Using yarn:**

```bash
yarn add @nimpl/path-parser
```

## Usage

```ts
import { parse } from "@nimpl/path-parser";

// ...

const params = parse("/docs/path-parser", "/(site)/docs/[key]"); // { key: 'path-parser' }
const { segments } = parse("/docs/path-parser", "/(site)/[[...segments]]"); // { segments: ['docs', 'path-parser'] }
```

## Additional

Please consider giving a star if you like it, it will help promote the implementation in the eyes of the Next.js team. This also motivates the author to continue working on this and other solutions ❤️

Create issues with wishes, ideas, difficulties, etc. All of them will definitely be considered and thought over.
