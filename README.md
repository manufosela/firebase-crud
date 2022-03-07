# \<firebase-crud>

This webcomponent follows the [open-wc](https://github.com/open-wc/open-wc) recommendation.

## Installation

```bash
npm i firebase-crud
```

## Usage

```html
<script type="module">
  import 'firebase-crud/firebase-crud.js';
</script>

<firebase-loginbutton
  id="FirebaseLogginbutton-ID"
  [FIREBASE
  CONFIG
  ATTRIBUTES]
></firebase-loginbutton>
<!-- This component works with firebase-loginbutton or setting firebaseapp property -->
<firebase-crud reference-id="FirebaseLogginbutton-ID"></firebase-crud>
```

## Methods

- **listenData(path, callbackExists, [callbackNotExists])**: Listen to firebase data changes from path. When changes are made, callbackExists is called. When data is deleted, callbackNotExists is called.
- **deleteData(path, [callbackTrue])**: Delete data from firebase path. When data is deleted, callbackTrue is called.
- **insertData(jsonData, path, [callbackTrue])**: Insert jsonData to firebase path. When data is inserted, callbackTrue is called.
- **updateData(jsonData, path, [callbackTrue])**: Update jsonData to firebase path. When data is updated, callbackTrue is called.
- **getData(path, callbackTrue)**: Get data from firebase path. When data is retrieved, callbackTrue is called.
- \*\*getNewId(path): Get a new id from firebase path.
- **uploadFSFile(blob, pathAndFileName)**: Upload blob to firebase pathAndFileName.
- **downloadFSFile(path)**: Return a promise to retrieve the url file from firebase path.

## Linting and formatting

To scan the project for linting and formatting errors, run

```bash
npm run lint
```

To automatically fix linting and formatting errors, run

```bash
npm run format
```

## Testing with Web Test Runner

To execute a single test run:

```bash
npm run test
```

To run the tests in interactive watch mode run:

```bash
npm run test:watch
```

## Demoing with Storybook

To run a local instance of Storybook for your component, run

```bash
npm run storybook
```

To build a production version of Storybook, run

```bash
npm run storybook:build
```

## Tooling configs

For most of the tools, the configuration is in the `package.json` to minimize the amount of files in your project.

If you customize the configuration a lot, you can consider moving them to individual files.

## Local Demo with `web-dev-server`

```bash
npm start
```

To run a local development server that serves the basic demo located in `demo/index.html`
