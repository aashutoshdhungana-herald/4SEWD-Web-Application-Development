# Using ES Modules, npm Packages, and Nodemon

## Step 1: Check Requirements

- Open a terminal and run the following command:

  ```bash
  node -v
  ```

- If the command returns an error, install the LTS version of Node.js from the official Node.js website.

---

## Step 2: Create a New Project

- Create a new folder named `love-calculator`.
- Open the folder in VS Code.
- Open a terminal inside the project folder.

---

## Step 3: Initialize a Node.js Project

Run the following command:

```bash
npm init -y
```

- This creates a `package.json` file.
- Open the file and examine the properties that were automatically generated.

---

## Step 4: Enable ES Modules

Open the `package.json` file.

Add the following property:

```json
"type": "module"
```

This enables the use of the `import` and `export` keywords instead of `require()`.

---

## Step 5: Install Dependencies

Install the **chalk** package.

```bash
npm install chalk
```

- The package will be added to the `dependencies` section of `package.json`.

Next, install **nodemon** as a development dependency.

```bash
npm install --save-dev nodemon
```

- Notice that `nodemon` is added to the `devDependencies` section.

Try to understand the difference between `dependencies` and `devDependencies`.

---

## Step 6: Add npm Scripts

Inside the `scripts` section of `package.json`, add the following scripts.

```json
"scripts": {
  "start": "node index.js",
  "dev": "nodemon index.js"
}
```

These scripts allow you to start the application using npm commands.

---

## Step 7: Create the Project Files

Create the following files.

```text
love-calculator
│
├── index.js
├── utils.js
└── package.json
```

---

## Step 8: Create Utility Functions

Inside `utils.js`, create a function that generates a random love score between 1 and 100.

Export this function as the **default export**.

Next, create another function that accepts a score and returns a message based on the score.

For example:

- 1–30 → "Not a great match 😢"
- 31–70 → "Could work 🙂"
- 71–100 → "Perfect match ❤️"

Export this function as a **named export**.

---

## Step 9: Import the Utility Functions

Inside `index.js`:

- Import the default export.
- Import the named export.
- Import the `chalk` package.

Create two variables representing two people's names.

Generate a random love score.

Display the names, score, and message using colored output with the `chalk` package.

---

## Step 10: Run the Application

Run the following command.

```bash
npm run dev
```

Your output should look similar to:

```text
Alice ❤️ Bob
Love Score: 82%
Perfect match ❤️
```

Modify the code and save the file.

Notice that **nodemon** automatically restarts the application whenever a file is saved.

Try changing the name of the two person to see

---

## Challenge

Instead of hardcoding the names, prompt the user to enter two names.

Display a different message every time the application runs.

Try adding additional messages or emojis for different score ranges.

---

## Final Project Structure

```text
love-calculator
│
├── node_modules
├── index.js
├── utils.js
├── package.json
└── package-lock.json
```
