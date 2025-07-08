# prompt.me - How To Run the Application

This document provides instructions on how to set up and run the `prompt.me` client-side application, both for local development and for deployment on a web server.

## Overview

This application is a "client-side" or "static" web app. This means it runs entirely in your web browser using HTML, CSS, and JavaScript. It does not require a complex backend like Python or PHP to run.

However, to load its data files (like the Knowledge Base), it **must be served by a web server**. You cannot simply open the `index.html` file from your file explorer.

---

## Method 1: Running Locally for Development (on Windows/Mac)

This is the best method for making changes to the code and testing them quickly on your personal computer. Choose one of the options below.

### Option A: Using Visual Studio Code (Easiest)

This is the recommended method for most users.

**1. Install Visual Studio Code:**
   - Go to the official website: [https://code.visualstudio.com/](https://code.visualstudio.com/)
   - Download and run the installer for your operating system (Windows or Mac).

**2. Install the "Live Server" Extension:**
   - Open Visual Studio Code.
   - Click the "Extensions" icon on the left-hand sidebar (it looks like four squares).
   - In the search bar, type `Live Server`.
   - Find the extension by **Ritwick Dey** and click the "Install" button.

**3. Run the Application:**
   - In VS Code, go to `File > Open Folder...` and select the project's root folder (`Promptme`).
   - In the VS Code Explorer panel on the left, navigate into the `Prompt.me Client` folder.
   - Right-click on the `index.html` file inside that folder.
   - Select **"Open with Live Server"**.
   - Your default web browser will open automatically to the correct address (e.g., `http://127.0.0.1:5500/Prompt.me%20Client/index.html`).

### Option B: Using Node.js (For Terminal Users)

This is a great alternative if you are comfortable with the command line.

**1. Install Node.js and npm:**
   - Go to the official website: [https://nodejs.org/](https://nodejs.org/)
   - Download and install the **LTS (Long Term Support)** version for your operating system. The installer will include both `node` and `npm`.
   - To verify the installation, open a new terminal (PowerShell on Windows, or Terminal on Mac) and run `node -v` and `npm -v`. You should see version numbers for both.

**2. Run the Application:**
   - Open a terminal.
   - Navigate to the project's root directory: `cd path/to/your/Promptme`.
   - Run the following command. `npx` is a tool that comes with `npm` and runs packages without a global installation.
     ```bash
     npx live-server "Prompt.me Client/"
     ```
   - This will start the server, and your browser should open automatically. If not, the terminal will give you the address to open (e.g., `Serving "Prompt.me Client/" at http://127.0.0.1:8080`).

---

## Method 2: Deploying to a Web Server (e.g., Synology NAS)

This is the method for making the application accessible on your network. This guide assumes you have already set up your server.

1.  **Upload Files:** Copy all the files and folders from **inside** the `Prompt.me Client` directory to the folder on your web server that is designated as the "web root" or "document root".
2.  **Configure the Web Server:**
    *   On a Synology NAS, use the **Web Station** package to create a new **Web Service Portal**.
    *   Configure this portal to serve **static files**.
    *   Set the **Document Root** to the folder where you uploaded the files.
    - Ensure the **HTTP Backend Server** is set to Nginx or Apache.
    - Ensure that **no script language** (like PHP) is enabled for this portal.
3.  **Access the Application:** Access the application using the IP address or domain name configured for your web server (e.g., `http://your.nas.ip:port`).

---

## Using the Application

Once the application is running, use the following demo credentials to log in:

- **Standard User:**
  - Username: `user`
  - Password: `password123`
  - MFA Code: `123456`
- **Admin User:**
  - Username: `admin`
  - Password: `secure`
  - MFA Code: `654321`

### Important Note on Data Storage

This is a client-side demonstration. All of your data (prompts, ratings, settings) is stored in your specific web browser's `localStorage`. **Clearing your browser's site data will erase all your prompts.** Use the Export feature to create backups.