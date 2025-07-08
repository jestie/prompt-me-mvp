# prompt.me - Client-Side MVP

A feature-rich client-side web application for creating, managing, and analyzing AI prompts. This is an MVP built with HTML, CSS, and vanilla JavaScript, storing all data in the browser's `localStorage`.

## Features (MVP v1.0.3)
- Simulated user login with MFA.
- **Create, View, Edit, & Delete Prompts**.
- **5-Star Prompt Rating System** to evaluate prompt quality.
- **Advanced Sorting**: Sort prompts by Rating, Popularity, Creation Date, or Alphabetically.
- **Import/Export**: Full backup and restore capability for your prompts via JSON, CSV, and TXT files.
- **Enhanced Dashboards**:
  - **Overview**: General summary of activity.
  - **Usage Statistics**: Analyze prompt popularity and tag frequency.
  - **Quality & Performance**: A detailed view with a rating distribution chart and actionable lists like "Hidden Gems" and "Needs Improvement".
- **AI-Powered "Improve Prompt" Feature**: Stubs for connecting to Ollama or OpenAI APIs to refine prompts.
- **User Profile & Settings**: Includes a Dark/Light theme switcher.
- **Comprehensive Admin Panel**: For managing global settings and auditing content.
- **Data persistence** via browser `localStorage`.

## How to Run
See the detailed `HowTo.md` file in this directory for instructions on running the application with a local web server, which is required for full functionality.

## Default Login Credentials (Simulated)
**Standard User:**
- Username: `user`
- Password: `password123`
- MFA Code: `123456`

**Admin User:**
- Username: `admin`
- Password: `secure`
- MFA Code: `654321`

## Future Development Goals
- Integration with a proper backend (Node.js/Express or Python/Flask).
- Real user management (Create, Update, Delete users).
- Real MFA implementation.
- Cloud storage for prompts and settings.