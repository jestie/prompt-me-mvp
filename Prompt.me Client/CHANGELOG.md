# Changelog

W A R N I N G !!!!
PS: As this is stil under MVP relase, there will be a lot of changes, and features added.
BACKUP ANY AND ALL PROMPTS BEFORE YOU DO ANY UPGRADES FOR NOW!!! EXPORT THEM, BEFORE YOU REPLACE THESE FILES!!!!
You will loose your prompts if you do not do this - Until we have a more robust and relaible solutution within a dbase of some sort.

## [v1.0.3] - 2024-05-24

### Added
- **5-Star Prompt Rating System**: Replaced the binary favorite star with a more nuanced 1-5 star rating system for better prompt evaluation.
- **Enhanced Quality & Performance Dashboard**: Added a new dashboard to provide insights into prompt quality. Includes a rating distribution bar chart and lists for "Highest Rated", "Lowest Rated", "Hidden Gems", and "Needs Improvement" prompts.
- **Main UI Prompt Import**: Added an "Import" button to the main header, allowing users to import prompts from JSON, CSV, and TXT files directly into their collection.

### Changed
- The "Sort by" option now defaults to "Rating (Highest First)" to prioritize the best prompts.
- The `handlePromptAction` logic was refactored to accommodate the new 5-star rating clicks instead of the old star button.
- The prompt data model now uses a `rating` property (0-5) instead of the old boolean `starred` property. Data is automatically migrated on load.

## [v1.0.2] - 2025-05-09

### Fixed scripts
- script.js - The login issue is resolved.It seems that CUT and PASTE introduced a new character "¤"
    "'admin-panel':if(currentUser& ¤ tUser.username==='admin')"  - this was wrong and code is now fixed.
- Import function, for TXT, CSV and JSON files - incorporated the new parseJsonPrompts function, the isValidDateString helper, and updated handleFileImport to use them.

## [v1.0.1] - 2025-05-09

### Added Admin Panel
- Admin Panel Global Settings
- Admin Panel Content Auditing
- Admin Panel Audit Log
- Admin Panel Disable AI Features for NMon-Admin
- Admin Panel Save Global Toggles
- Manage Default Promtps: JSON format to change default prompts: If some prompt is NSFW.

### Added
- Admin Dashboard update, added -
- Top Prompts by Usage,
- Tag Frequency,
- Prompts without Tags

### Added GenAI integration
- ChatGPT API key for improving prompts.
- Local Ollama config, if you rather prefer your own personal GenAI to improve the prompts
- Test button to check connectivity
- Green "Improve" button to show that we can improve prompt, after enabling the AI integration config

### Added Export capability
- Export to CSV,
- Export to TXT,
- Export to JSON

### User Profile
- Different Icons for different users
- Dark Theme now enabled, and works

### Fixed
- Login was stuborn and did not work sometimes after updates.
- Floating Profile settings CSS styles, not enabling Profile user settings
- Fixed Icon issue, more than one person can use differnt icon.