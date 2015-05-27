# CSS Modules: Extract Imports

Transforms:

```css
:local(.continueButton) {
  extends: button from "library/button.css";
  background: red;
}
```

into:

```css
:import("library/button.css") {
  button: __tmp_487387465fczSDGHSABb;
}
:local(.continueButton) {
  extends: __tmp_487387465fczSDGHSABb;
  background: red;
}
```

## Development

```
npm install
npm run watch
npm test
```
