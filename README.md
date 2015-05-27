# CSS Modules: Extract Imports

Transforms:

```css
:local(.continueButton) {
  extends: button from "library/button.css";
  color: green;
}
```

into:

```css
:import("library/button.css") {
  button: __tmp_487387465fczSDGHSABb;
}
:local(.continueButton) {
  extends: __tmp_487387465fczSDGHSABb;
  color: green;
}
```

## Specification

- Only a certain whitelist of properties are inspected. Currently, that whitelist is `['extends']` alone.
- An extend-import has the following format:
```
extends: className [... className] from "path/to/file.css";
```

## Building

```
npm install
npm build
npm test
```

## Development

- `npm watch` will watch `index.src.js` for changes and rebuild
- `npm autotest` will watch `index.src.js` and `test.js` for changes and retest

## License

ISC

## With thanks

- Mark Dalgleish
- Tobias Koppers
- Guy Bedford

---
Glen Maddern, 2015.
