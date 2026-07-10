# Setup and Usage Guide: Postman & Thunder Client

## Overview

To test the Todo REST API you built in the previous tutorial, you need a tool that can send HTTP requests (`GET`, `POST`, `PUT`, `DELETE`) with custom headers and JSON bodies — a web browser alone can't easily do this for anything beyond a simple `GET`.

This guide covers two popular options:

- **Postman** — a standalone desktop application, widely used, with lots of extra features (collections, environments, automated tests).
- **Thunder Client** — a lightweight VS Code extension, ideal if you want to stay inside your editor without switching apps.

You only need one of these to follow along — pick whichever fits your workflow.

**What you'll learn:**

- How to install Postman and/or Thunder Client
- How to send `GET`, `POST`, `PUT`, and `DELETE` requests
- How to send a JSON body with the correct headers
- How to save requests into a collection for reuse
- How to use variables so you don't retype the base URL every time

---

## Prerequisites

- Your Todo API from the previous tutorial (`todo-api`) running locally with `npm run dev`
- VS Code installed (only required for Thunder Client)

---

# Part 1: Postman

## Step 1: Install Postman

1. Go to [postman.com/downloads](https://www.postman.com/downloads/).
2. Download the desktop app for your operating system (Windows, macOS, or Linux).
3. Run the installer and open Postman.
4. You'll be prompted to sign in or create a free account. Signing in lets you sync collections across devices, but you can also skip this and use Postman locally.

## Step 2: Create a Workspace and Collection

A **collection** is a saved group of requests — perfect for keeping all your Todo API requests together.

1. In the left sidebar, click **Collections**.
2. Click **+ Create Collection** (or the **New** button, then choose **Collection**).
3. Name it `Todo API`.

## Step 3: Set Up a Base URL Variable

Instead of typing `http://localhost:3000` into every request, save it once as a variable.

1. Click on your `Todo API` collection, then open the **Variables** tab.
2. Add a variable:

   | Variable  | Initial Value           | Current Value           |
   | --------- | ----------------------- | ----------------------- |
   | `baseUrl` | `http://localhost:3000` | `http://localhost:3000` |

3. Save. You can now reference it in any request URL as `{{baseUrl}}`.

## Step 4: Send a GET Request

1. Inside the `Todo API` collection, click **Add a request**.
2. Name it `Get All Todos`.
3. Set the method dropdown to `GET`.
4. Enter the URL: `{{baseUrl}}/api/todos`.
5. Click **Send**.
6. You should see a `200 OK` status and a JSON array of todos in the response panel below.

## Step 5: Send a POST Request with a JSON Body

1. Add a new request named `Create Todo`.
2. Set the method to `POST`.
3. Enter the URL: `{{baseUrl}}/api/todos`.
4. Go to the **Body** tab, select **raw**, then choose **JSON** from the dropdown on the right (this automatically sets the `Content-Type: application/json` header for you).
5. Enter a JSON body:

   ```json
   {
     "title": "Read a chapter",
     "deadline": "2026-07-20",
     "isUrgent": false
   }
   ```

6. Click **Send**. You should see a `201 Created` status with the newly created todo, including its assigned `id`.

## Step 6: Send a PUT Request

1. Add a new request named `Update Todo`.
2. Set the method to `PUT`.
3. Enter the URL: `{{baseUrl}}/api/todos/1` (replace `1` with a real id from your `GET` response).
4. In the **Body** tab, select **raw** → **JSON**, and enter only the fields you want to change:

   ```json
   {
     "isUrgent": true
   }
   ```

5. Click **Send**. You should see a `200 OK` status with the updated todo.

## Step 7: Send a DELETE Request

1. Add a new request named `Delete Todo`.
2. Set the method to `DELETE`.
3. Enter the URL: `{{baseUrl}}/api/todos/1`.
4. Click **Send**. You should see a `200 OK` status with a confirmation message.

## Step 8: Verify Validation Errors

Try sending a `POST` request with a missing field to confirm your backend validation works:

```json
{
  "deadline": "2026-07-20",
  "isUrgent": false
}
```

You should get a `400 Bad Request` status with an error message about the missing `title`.

## Step 9: Save and Reuse

Every request you send inside the collection is automatically saved. You can:

- Click **Save** (`Ctrl+S` / `Cmd+S`) after editing a request to update it.
- Re-run any saved request anytime by clicking on it and pressing **Send** again.
- Duplicate a request (right-click → **Duplicate**) to quickly create variations, like `Get Todo By Id`.

---

# Part 2: Thunder Client

Thunder Client lives inside VS Code, so there's no separate app to open — useful if you want your code and your API tests side by side.

## Step 1: Install the Extension

1. Open VS Code.
2. Go to the **Extensions** view (`Ctrl+Shift+X` / `Cmd+Shift+X`).
3. Search for **Thunder Client**.
4. Click **Install** on the extension by Ranga Vadhineni.
5. A new lightning-bolt icon will appear in the left sidebar — click it to open Thunder Client.

## Step 2: Create a Collection

1. In the Thunder Client sidebar, click the **Collections** tab.
2. Click **New Collection**, and name it `Todo API`.

## Step 3: Set Up an Environment (Base URL Variable)

1. Click the **Env** tab in the Thunder Client sidebar.
2. Click **New Environment**, name it `Local`.
3. Add a variable:

   | Name      | Value                   |
   | --------- | ----------------------- |
   | `baseUrl` | `http://localhost:3000` |

4. Save, then make sure `Local` is selected as the active environment (dropdown at the top of the Thunder Client panel).
5. You can now use `{{baseUrl}}` inside any request URL.

## Step 4: Send a GET Request

1. In your `Todo API` collection, click **New Request**.
2. Name it `Get All Todos`.
3. Set the method to `GET`.
4. Enter the URL: `{{baseUrl}}/api/todos`.
5. Click **Send**.
6. Check the response panel on the right for a `200` status and the JSON array of todos.

## Step 5: Send a POST Request with a JSON Body

1. Create a new request named `Create Todo`.
2. Set the method to `POST`.
3. Enter the URL: `{{baseUrl}}/api/todos`.
4. Go to the **Body** tab, choose **JSON**, and enter:

   ```json
   {
     "title": "Read a chapter",
     "deadline": "2026-07-20",
     "isUrgent": false
   }
   ```

5. Click **Send**. Thunder Client automatically sets the `Content-Type: application/json` header when you choose the JSON body type.
6. Confirm you get a `201` status with the created todo.

## Step 6: Send a PUT Request

1. Create a new request named `Update Todo`.
2. Set the method to `PUT`.
3. Enter the URL: `{{baseUrl}}/api/todos/1`.
4. In the **Body** tab, choose **JSON** and enter the fields to update:

   ```json
   {
     "isUrgent": true
   }
   ```

5. Click **Send** and confirm a `200` status with the updated todo.

## Step 7: Send a DELETE Request

1. Create a new request named `Delete Todo`.
2. Set the method to `DELETE`.
3. Enter the URL: `{{baseUrl}}/api/todos/1`.
4. Click **Send** and confirm a `200` status with a confirmation message.

## Step 8: Verify Validation Errors

Send a `POST` request with a missing required field (e.g. no `title`) and confirm the API responds with a `400` status and a descriptive error message.

## Step 9: Save and Reuse

Thunder Client automatically saves each request in the collection as you create it. Requests can be reordered by dragging them, and the whole collection can be exported (right-click the collection → **Export**) if you want to share it with a classmate or back it up.

---

## Quick Comparison

| Feature                    | Postman                          | Thunder Client                     |
| -------------------------- | -------------------------------- | ---------------------------------- |
| Runs inside VS Code        | No (separate app)                | Yes                                |
| Account required           | Optional                         | Not required                       |
| Collections & environments | Yes                              | Yes                                |
| Automated test scripts     | Yes (advanced, JavaScript-based) | Yes (simpler, built-in assertions) |
| Best for                   | Larger projects, teams, API docs | Quick local testing while coding   |

---

## Full Request Reference for the Todo API

Use this table in either tool to quickly test every endpoint from the previous tutorial:

| Method   | URL                       | Body                                                              | Expected Status |
| -------- | ------------------------- | ----------------------------------------------------------------- | --------------- |
| `GET`    | `{{baseUrl}}/api/todos`   | —                                                                 | `200`           |
| `GET`    | `{{baseUrl}}/api/todos/1` | —                                                                 | `200` or `404`  |
| `POST`   | `{{baseUrl}}/api/todos`   | `{ "title": "...", "deadline": "2026-07-20", "isUrgent": false }` | `201` or `400`  |
| `PUT`    | `{{baseUrl}}/api/todos/1` | `{ "isUrgent": true }`                                            | `200` or `404`  |
| `DELETE` | `{{baseUrl}}/api/todos/1` | —                                                                 | `200` or `404`  |

---

## Troubleshooting

- **`ECONNREFUSED` or "Could not send request"** — make sure your Express server is actually running (`npm run dev`) before sending requests.
- **`404` on a route you expect to exist** — double-check the URL path and that you mounted the router correctly in `server.js`.
- **Body seems to be ignored (`req.body` is `undefined`)** — confirm you selected **JSON** as the body type (not "text" or "form"), and that `express.json()` middleware is registered in `server.js`.
- **`400` validation errors when you didn't expect them** — check that `deadline` is a valid date string and `isUrgent` is a real boolean (`true`/`false`), not the string `"true"`.
