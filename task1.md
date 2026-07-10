# Running a simple application using node

## Step 1: Check Requirements

- Open terminal and run the following commands:

  ```bash
  node -v
  ```

- If the command returns an error install the LTS version of node from the official node.js website

## Step 2: Create a .js file

- Open your workspace folder
- Create a file named `index.js`

## Step 3: Using js open a file and write content to the file

- `require` the built-in `fs` module, this. The `fs` module provides us with utilities for file handling

  ```js
  const fs = require("fs");
  ```

- Use the `fs.writeFile(...)` function to write to a file

  ```js
  fs.writeFile("output.txt", "Hello, world", (err) => {
    if (err) {
      console.error("Error writing file:", err);
    }

    console.log("File written successfully");
  });
  ```

- Run the code using the following command to test.

  ```bash
  node index.js
  ```

## Step 4: Inside the callback of `fs.writeFile`, read the contents of the file and print it to the console

- Use `fs.readFile` function to read the file
- Add the `fs.readFile` function inside the callback of fs.writeFile

  ```js
  fs.readFile("output.txt", "utf8", (err, data) => {
    if (err) {
      console.error("Error reading file:", err);
      return;
    }

    console.log("File contents:");
    console.log(data);
  });
  ```

- Try to understand why the file is read inside the callback

- Run and test the application
  ```bash
  node index.js
  ```

## Final Code

**index.js**

```js
const fs = require("fs");

fs.writeFile("output.txt", "Hello, world", (err) => {
  if (err) {
    console.error("Error writing file", err);
    return;
  }

  console.log("File written successfully");

  fs.readFile("output.txt", "utf-8", (err, data) => {
    if (err) {
      console.error("Error reading file", err);
    }

    console.log("File contents:");
    console.log(data);
  });
});
```
