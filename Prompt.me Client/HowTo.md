# prompt.me - Your Prompt Engineering Hub - How To Run

This document provides instructions on how to set up and run the prompt.me client-side application.

## Prerequisites

*   A modern web browser (e.g., Chrome, Firefox, Edge, Safari).
*   (Optional, for running locally with full functionality) Node.js and npm (or npx) if you choose to use `live-server` via Node. See "Running the Application" section.

## Application Structure

The application consists of the following core files:

*   `index.html`: The main HTML structure of the application.
*   `style.css`: Contains all the styling rules.
*   `script.js`: Handles all the application logic, interactions, and data management (client-side).
*   `J_dev.png`: Logo image.
*   `favicon.ico`: (Optional) Application icon.
*   `/data/` (folder):
    *   `knowledge_base.json`: Contains the content for the Knowledge Base section.
    *   `tips_and_tricks.json`: Contains the content for the Tips & Tricks section.

## Running the Application

This application is a client-side demo and relies on browser features like `localStorage` for data persistence and `fetch` for loading local JSON data (for the Knowledge Base and Tips & Tricks sections).

**IMPORTANT: Using a Local Web Server (Recommended for Full Functionality)**

Due to browser security restrictions (CORS policy), directly opening `index.html` from your file system (i.e., via the `file:///` protocol) will prevent certain features from working correctly, specifically the loading of content for the "Knowledge Base" and "Tips & Tricks" sections from their respective JSON files.

To ensure all features work as intended, you **must serve the files using a local web server.** Here are a few easy ways to do this:

**1. Using VS Code Live Server Extension (Easiest if using VS Code):**

   a. Open the project folder in Visual Studio Code.
   b. If you don't have it already, install the "Live Server" extension by Ritwick Dey from the VS Code Extensions marketplace.
   c. In the VS Code Explorer, right-click on the `index.html` file.
   d. Select "Open with Live Server".
   e. Your default web browser will open automatically, displaying the application (usually at an address like `http://127.0.0.1:5500/index.html`).

**2. Using `live-server` with Node.js (Cross-platform):**

   a. Ensure you have Node.js and npm installed. You can download them from [nodejs.org](https://nodejs.org/).
   b. Open your terminal or command prompt.
   c. Navigate to the root directory of the `prompt.me` project (the folder containing `index.html`).
      ```bash
      cd path/to/your/prompt.me-client-folder
      ```
   d. Run the following command:
      ```bash
      npx live-server
      ```
      (If `npx` is not available or you prefer to install it globally first: `npm install -g live-server`, then run `live-server`).
   e. Your default web browser should open, or the terminal will display an address (like `Listening on port 8080`, `Serving "J:\Scripts\Promptme\Prompt.me Client" at http://127.0.0.1:8080`). Open this address in your browser.

**3. Other Local Server Options:**

   *   Python's built-in HTTP server:
      *   Python 3: `python -m http.server`
      *   Python 2: `python -m SimpleHTTPServer`
      (Run this command in the project's root directory and then navigate to `http://localhost:8000` in your browser).
   *   Many other simple static server tools are available for different platforms and environments.

**Why is a local server needed?**
Web browsers implement a security feature called the Same-Origin Policy. When you open an HTML file directly using `file:///`, `fetch` requests to other local files (like `data/knowledge_base.json`) are often blocked to prevent malicious scripts from accessing your local file system. Serving the files via `http://localhost` makes the browser treat your project as a legitimate (though local) website, allowing these `fetch` requests to proceed correctly.

## Using the Application

1.  Once the application is running in your browser (via a local server), you will be presented with a login screen.
2.  Use the following demo credentials:
    *   **Standard User:**
        *   Username: `user`
        *   Password: `password123`
        *   MFA Code: `123456`
    *   **Admin User:**
        *   Username: `admin`
        *   Password: `secure`
        *   MFA Code: `654321`
3.  After logging in, you can navigate through the different sections using the left-hand menu.
4.  Explore creating, viewing, searching, and managing your prompts.
5.  Admin users have access to an "Admin Panel" for global settings and audit logs.
6.  Check out the "Knowledge Base" and "Tips & Tricks" for helpful information.

## Customizing Content

*   **Knowledge Base:** Edit the `data/knowledge_base.json` file to add, remove, or modify articles. Follow the existing JSON structure.
*   **Tips & Tricks:** Edit the `data/tips_and_tricks.json` file.
*   **Default Prompts (for new users/admin reset):** Admins can modify the default prompts via the "Admin Panel" > "Global Settings". This data is then stored in `localStorage`.

## Notes

*   This is a client-side demonstration. All data (prompts, user settings, AI settings) is stored in your browser's `localStorage`. Clearing your browser's site data for this application will erase all stored information.
*   The AI "Improve" feature requires configuration in the "Settings" panel. For local models like Ollama, ensure your Ollama server is running and accessible. For OpenAI, a valid API key is required.

---

Happy Prompting!