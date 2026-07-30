# AI-Powered Development in Visual Studio Code

## Task Details & Hands-On Exercises

_A Beginner's Course to GitHub Copilot — No prior AI-tooling experience required_

---

## 1. Setting Up Your Environment

### 1.1 Prerequisites

- Visual Studio Code (latest stable release) installed.
- A GitHub account. A free account is enough to start — Copilot's free tier includes a limited number of monthly chat and agent requests, and unlimited basic code completions for individuals.
- Git installed locally, if you plan to work with real repositories.

### 1.2 Installing the GitHub Copilot extension

1. Open VS Code and go to the Extensions view (the icon on the left sidebar, or `Ctrl+Shift+X` / `Cmd+Shift+X`).
2. Search for "GitHub Copilot" and install the extension published by GitHub.
3. Also install "GitHub Copilot Chat" if it isn't bundled automatically — this adds the chat panel and agent capabilities.
4. Reload VS Code if prompted.

### 1.3 Signing in and activating Copilot

5. Click the Copilot icon in the VS Code status bar (bottom right) or Activity Bar.
6. Choose "Sign in with GitHub" and complete authentication in your browser.
7. If your account doesn't already have Copilot enabled, VS Code will prompt you to start a free trial or enable the free tier from your GitHub account settings.

> **Check it's working:** Open any code file and start typing a comment describing a simple function (e.g. `// function that reverses a string`). Gray "ghost text" suggesting code should appear — press Tab to accept it.

---

## 2. Using Inline Code Suggestions

- Keep typing normally — suggestions appear automatically.
- Press **Tab** to accept a full suggestion.
- Press **Ctrl+Right Arrow** (`Cmd+Right Arrow` on Mac) to accept just the next word.
- Press **Esc** to dismiss a suggestion you don't want.
- Open the suggestions panel (`Alt+\` / `Option+\`) to see alternative completions.

Example trigger:

```javascript
// Calculate the total price including a 10% service fee
function calculateTotal(items) {
  // <- Copilot will suggest an implementation here
}
```

---

## 3. Opening Copilot Chat

Open the Chat panel with `Ctrl+Alt+I` / `Cmd+Alt+I`, or the chat icon in the Activity Bar. Ask, Edit, and Agent modes are all selected from a dropdown at the bottom of the panel.

> **Try this:** Highlight a function you don't understand, open Chat, type `#selection`, and ask "Explain what this does and why it might be written this way."

---

## 4. Slash Commands Reference

Slash commands are shortcuts for common chat requests. Type `/` in the chat input to see the list.

| Command    | What it does                                                 |
| ---------- | ------------------------------------------------------------ |
| `/explain` | Explains the selected code or file in plain language         |
| `/fix`     | Proposes a fix for a problem or error in the selection       |
| `/tests`   | Generates unit tests for the selected code                   |
| `/doc`     | Adds documentation comments to the selection                 |
| `/new`     | Scaffolds a new project or file structure from a description |
| `/clear`   | Clears the current chat conversation                         |

---

## 5. Turning On Agent Mode

1. Open the Chat panel and select "Agent" from the mode dropdown.
2. Describe the task in as much detail as you can.
3. Review the plan and file changes Copilot proposes before accepting.

---

## 6. Setting Up Custom Instructions

Create a file at:

```
.github/copilot-instructions.md
```

and describe your team's conventions. Copilot reads this automatically for every chat and agent request in that workspace. Example:

```markdown
# Code Style

- Always use TypeScript strict mode
- Prefer functional patterns over class-based ones
- All new functions must have unit tests
- No direct database access in controllers
```

---

## 7. Hands-On Exercises

### Exercise 1 — Inline suggestions

Create a new file called `practice.js`. Write a comment describing a small function (e.g. a function that checks if a number is prime), and accept Copilot's suggestion with Tab. Modify the function slightly and see how the suggestion adapts.

### Exercise 2 — Ask mode

Open any file with a function you didn't write (or one from this course's code samples). Select it, open Chat in Ask mode, type `#selection`, and ask Copilot to explain it and suggest one potential edge case it might not handle.

### Exercise 3 — Edit mode

Pick a single file and ask Edit mode to rename a variable consistently throughout the file, or to add error handling to one function. Review the diff before accepting.

### Exercise 4 — Agent mode

In a small sample project, use Agent mode to add a new feature that spans at least two files (for example, adding a new API endpoint and its corresponding test). Write a prompt that states the goal, scope, and a stop condition ("stop once the new test passes").

### Exercise 5 — Custom instructions

Add a `.github/copilot-instructions.md` file to a project with two or three rules of your own (e.g. naming conventions, a testing requirement). Ask Copilot Chat to generate a new function and confirm it follows your rules.
