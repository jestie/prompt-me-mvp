# promptme HowTo Guide

## Setup

1. Clone the repo:
    ```
    git clone https://github.com/yourusername/promptme.git
    cd promptme
    ```

2. Create and activate a virtual environment:
    ```
    python3 -m venv venv
    source venv/bin/activate
    ```

3. Install dependencies:
    ```
    pip install -r requirements.txt
    ```

4. Initialize the database:
    ```
    python backend/init_db.py
    ```

5. Run the app:
    ```
    python backend/app.py
    ```

## Usage

- Visit `https://localhost:5000`
- Register or login (Google/LinkedIn)
- Save and manage prompts

## Contributing

- Fork and branch per feature
- Submit PRs with clear descriptions
