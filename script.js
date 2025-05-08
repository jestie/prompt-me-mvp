// script.js
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const loginOverlay = document.getElementById('login-overlay');
    const loginButton = document.getElementById('login-button');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const mfaSection = document.getElementById('mfa-section');
    const mfaCodeInput = document.getElementById('mfa-code');
    const loginError = document.getElementById('login-error');

    const appContainer = document.getElementById('app-container');
    const userGreeting = document.getElementById('user-greeting');
    const userProfileIcon = document.getElementById('user-profile-icon');
    const logoutButton = document.getElementById('logout-button');

    const leftFrameNavButtons = document.querySelectorAll('#left-frame ul li button');
    const mainContentTitle = document.getElementById('main-content-title');
    const promptListArea = document.getElementById('prompt-list-area');
    const dynamicContentArea = document.getElementById('dynamic-content-area');
    const sortBySelect = document.getElementById('sort-by');

    // App State (Client-Side Simulation)
    let currentUser = null;
    let currentView = 'my-prompts'; // Default view
    let prompts = []; // Will hold our prompt objects
    let loginStep = 1; // 1 for username/password, 2 for MFA

    // --- AUTHENTICATION (SIMULATED) ---
    const SIMULATED_USERS = {
        "user": { password: "password123", mfaCode: "123456", bioIcon: "https://via.placeholder.com/40x40.png?text=U", bioIconDataUrl: null, details: "A standard user." },
        "admin": { password: "secure", mfaCode: "654321", bioIcon: "https://via.placeholder.com/40x40.png?text=A", bioIconDataUrl: null, details: "System Administrator." } // USERNAME CHANGED
    };

    function handleLogin() {
        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        const mfaCode = mfaCodeInput.value.trim();
        loginError.textContent = '';

        if (loginStep === 1) {
            if (SIMULATED_USERS[username] && SIMULATED_USERS[username].password === password) {
                loginStep = 2;
                mfaSection.style.display = 'block';
                usernameInput.disabled = true;
                passwordInput.disabled = true;
                loginButton.textContent = 'Verify MFA';
                mfaCodeInput.focus();
            } else {
                loginError.textContent = 'Invalid username or password.';
            }
        } else if (loginStep === 2) {
            if (SIMULATED_USERS[username] && SIMULATED_USERS[username].mfaCode === mfaCode) {
                currentUser = { username, ...SIMULATED_USERS[username] };
                
                // Ensure profile properties exist from localStorage or defaults
                if (!currentUser.hasOwnProperty('bioIconDataUrl')) currentUser.bioIconDataUrl = SIMULATED_USERS[username].bioIconDataUrl || null;
                if (!currentUser.hasOwnProperty('bioIcon')) currentUser.bioIcon = SIMULATED_USERS[username].bioIcon || null;
                if (!currentUser.hasOwnProperty('details')) currentUser.details = SIMULATED_USERS[username].details || "";

                localStorage.setItem('promptMeUser', JSON.stringify(currentUser));
                initializeApp();
            } else {
                loginError.textContent = 'Invalid MFA code.';
                loginStep = 1;
                mfaSection.style.display = 'none';
                usernameInput.disabled = false;
                passwordInput.disabled = false;
                loginButton.textContent = 'Login / Next';
            }
        }
    }
    
    function updateTopBarUserIcon() {
        if (currentUser.bioIconDataUrl) {
            userProfileIcon.src = currentUser.bioIconDataUrl;
        } else if (currentUser.bioIcon && currentUser.bioIcon.trim() !== '') {
            userProfileIcon.src = currentUser.bioIcon;
        } else {
            userProfileIcon.src = `https://via.placeholder.com/40x40.png?text=${currentUser.username.charAt(0).toUpperCase()}`;
        }
    }

    function initializeApp() {
        loginOverlay.style.display = 'none';
        appContainer.style.display = 'flex'; 
        userGreeting.textContent = `Welcome, ${currentUser.username}!`;
        
        updateTopBarUserIcon(); // UPDATE USER ICON

        const yearSpan = document.querySelector('#bottom-frame p');
        if (yearSpan) yearSpan.innerHTML = yearSpan.innerHTML.replace('[Current Year]', new Date().getFullYear());
        
        loadPrompts();
        navigateTo('my-prompts');
    }

    function handleLogout() {
        currentUser = null;
        localStorage.removeItem('promptMeUser');
        loginOverlay.style.display = 'flex';
        appContainer.style.display = 'none';
        
        loginStep = 1;
        usernameInput.value = '';
        passwordInput.value = '';
        mfaCodeInput.value = '';
        mfaSection.style.display = 'none';
        usernameInput.disabled = false;
        passwordInput.disabled = false;
        loginButton.textContent = 'Login / Next';
        loginError.textContent = '';
    }

    function checkSession() {
        const savedUser = localStorage.getItem('promptMeUser');
        if (savedUser) {
            currentUser = JSON.parse(savedUser);
            // Ensure profile properties exist for users loaded from localStorage
            if (!currentUser.hasOwnProperty('bioIconDataUrl')) currentUser.bioIconDataUrl = null;
            if (!currentUser.hasOwnProperty('bioIcon')) currentUser.bioIcon = null;
            if (!currentUser.hasOwnProperty('details')) currentUser.details = "";
            initializeApp();
        } else {
            loginOverlay.style.display = 'flex';
        }
    }

    // --- NAVIGATION AND CONTENT DISPLAY ---
    function navigateTo(action) {
        currentView = action;
        promptListArea.style.display = 'none';
        dynamicContentArea.style.display = 'none';
        dynamicContentArea.innerHTML = ''; 

        leftFrameNavButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.action === action) {
                btn.classList.add('active');
            }
        });
        
        document.querySelector('.sort-options').style.display = 'none'; 

        switch (action) {
            case 'my-prompts':
                mainContentTitle.textContent = 'My Prompts';
                promptListArea.style.display = 'block';
                document.querySelector('.sort-options').style.display = 'flex';
                renderPrompts();
                break;
            case 'create':
                mainContentTitle.textContent = 'Create New Prompt';
                dynamicContentArea.style.display = 'block';
                renderCreatePromptForm();
                break;
            case 'search':
                mainContentTitle.textContent = 'Search Prompts';
                dynamicContentArea.style.display = 'block';
                renderSearchPromptsView();
                promptListArea.style.display = 'block';
                renderPrompts();
                break;
            case 'knowledge':
                mainContentTitle.textContent = 'Knowledge Base';
                dynamicContentArea.style.display = 'block';
                dynamicContentArea.innerHTML = `<h3>Knowledge Base</h3><p>Access articles, guides, and best practices for prompt engineering. (Content to be added)</p>
                                                <ul><li>Understanding LLMs</li><li>Crafting Effective Prompts</li><li>Advanced Prompting Techniques</li></ul>`;
                break;
            case 'tips':
                mainContentTitle.textContent = 'Tips & Tricks';
                dynamicContentArea.style.display = 'block';
                dynamicContentArea.innerHTML = `<h3>Tips & Tricks</h3><p>Quick tips to improve your prompts. (Content to be added)</p>
                                                <ol><li>Be specific and clear.</li><li>Provide context.</li><li>Experiment with phrasing.</li></ol>`;
                break;
            case 'profile':
                 mainContentTitle.textContent = 'User Profile';
                 dynamicContentArea.style.display = 'block';
                 renderUserProfile();
                 break;
            case 'settings':
                 mainContentTitle.textContent = 'Settings';
                 dynamicContentArea.style.display = 'block';
                 renderSettings();
                 break;
            case 'save': // Handle the "Save Current Prompt" button click if needed
                alert("To save a prompt, please use the 'Create New Prompt' or 'Edit' functionality and then click the save/create button within that form.");
                // Optionally, navigate to 'my-prompts' or stay on current view
                // navigateTo('my-prompts'); 
                break;
            default:
                mainContentTitle.textContent = 'Dashboard';
                promptListArea.style.display = 'block';
                renderPrompts();
        }
    }
    
    function renderUserProfile() {
        let currentIconSrc = `https://via.placeholder.com/40x40.png?text=${currentUser.username.charAt(0).toUpperCase()}`;
        if (currentUser.bioIconDataUrl) {
            currentIconSrc = currentUser.bioIconDataUrl;
        } else if (currentUser.bioIcon && currentUser.bioIcon.trim() !== '') {
            currentIconSrc = currentUser.bioIcon;
        }

        dynamicContentArea.innerHTML = `
            <h3>User Profile</h3>
            <div style="display: flex; align-items: center; margin-bottom: 20px;">
                <img id="profile-icon-preview" src="${currentIconSrc}" alt="Profile Preview"
                     style="width: 80px; height: 80px; border-radius: 50%; margin-right: 20px; border: 1px solid var(--border-color); object-fit: cover;">
                <div>
                    <p style="margin-top:0;"><strong>Username:</strong> ${currentUser.username}</p>
                    <label for="profile-icon-file" style="font-weight:normal; display:block; margin-bottom:5px;">Upload New Icon (Local File):</label>
                    <input type="file" id="profile-icon-file" accept="image/*" style="margin-bottom:10px;">
                    <button id="remove-profile-icon-button" type="button" style="font-size:0.8em; padding: 3px 6px;">Remove Custom Icon</button>
                </div>
            </div>

            <label for="profile-icon-url">Or set Icon from URL:</label>
            <input type="text" id="profile-icon-url" placeholder="https://example.com/icon.png" value="${(currentUser.bioIcon && !currentUser.bioIconDataUrl) ? currentUser.bioIcon : ''}">
            
            <label for="profile-details">Details / Bio:</label>
            <textarea id="profile-details" placeholder="Enter some details about yourself...">${currentUser.details || ''}</textarea>
            
            <button id="save-profile-button" type="button">Save Profile</button>
        `;

        const profileIconUrlInput = document.getElementById('profile-icon-url');
        const profileIconFileInput = document.getElementById('profile-icon-file');
        const profileIconPreview = document.getElementById('profile-icon-preview');
        const saveProfileButton = document.getElementById('save-profile-button');
        const removeProfileIconButton = document.getElementById('remove-profile-icon-button');

        let newBioIconDataUrlFromUpload = null; 

        profileIconFileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                if (file.size > 2 * 1024 * 1024) { // 2MB limit
                    alert('File is too large. Please select an image under 2MB.');
                    profileIconFileInput.value = '';
                    return;
                }
                const reader = new FileReader();
                reader.onload = (e) => {
                    profileIconPreview.src = e.target.result;
                    newBioIconDataUrlFromUpload = e.target.result; 
                    profileIconUrlInput.value = ''; // Clear URL if file chosen
                };
                reader.readAsDataURL(file);
            }
        });

        profileIconUrlInput.addEventListener('input', () => {
            const urlValue = profileIconUrlInput.value.trim();
            if (urlValue) {
                profileIconPreview.src = urlValue;
                newBioIconDataUrlFromUpload = null; 
                profileIconFileInput.value = '';
            } else if (!newBioIconDataUrlFromUpload) {
                let fallbackSrc = `https://via.placeholder.com/40x40.png?text=${currentUser.username.charAt(0).toUpperCase()}`;
                 if (currentUser.bioIconDataUrl) fallbackSrc = currentUser.bioIconDataUrl; // Check existing DataURL first
                profileIconPreview.src = fallbackSrc;
            }
        });
        
        removeProfileIconButton.addEventListener('click', () => {
            const defaultIconForPreview = `https://via.placeholder.com/40x40.png?text=${currentUser.username.charAt(0).toUpperCase()}`;
            profileIconPreview.src = defaultIconForPreview;
            profileIconUrlInput.value = '';
            profileIconFileInput.value = ''; 
            newBioIconDataUrlFromUpload = null;
            alert('Custom icon will be removed when you save. The default icon will be used.');
        });

        saveProfileButton.addEventListener('click', () => {
            currentUser.details = document.getElementById('profile-details').value.trim();
            const urlValue = profileIconUrlInput.value.trim();

            if (newBioIconDataUrlFromUpload) { 
                currentUser.bioIconDataUrl = newBioIconDataUrlFromUpload;
                currentUser.bioIcon = null; 
            } else if (urlValue) { 
                currentUser.bioIcon = urlValue;
                currentUser.bioIconDataUrl = null; 
            } else { 
                currentUser.bioIcon = null;
                currentUser.bioIconDataUrl = null;
            }

            localStorage.setItem('promptMeUser', JSON.stringify(currentUser));
            updateTopBarUserIcon(); 
            alert('Profile saved!');
        });
    }

    function renderSettings() {
         dynamicContentArea.innerHTML = `
            <h3>Settings</h3>
            <p>Application settings will go here.</p>
            <div>
                <label for="theme-select">Theme:</label>
                <select id="theme-select">
                    <option value="light">Light (Default)</option>
                    <option value="dark" disabled>Dark (Coming Soon)</option>
                </select>
            </div>
            <p><em>More settings related to prompt management, notifications, etc.</em></p>
        `;
    }

    // --- PROMPT MANAGEMENT ---
    function loadPrompts() {
        const storedPrompts = localStorage.getItem(`prompts_${currentUser.username}`);
        prompts = storedPrompts ? JSON.parse(storedPrompts) : getDefaultPrompts();
        sortPrompts();
    }

    function savePrompts() {
        localStorage.setItem(`prompts_${currentUser.username}`, JSON.stringify(prompts));
    }
    
    function getDefaultPrompts() {
        return [
            { id: Date.now() + 1, title: "Blog Post Idea Generator", content: "Generate 5 blog post ideas about [topic]. Focus on [angle] and target audience [audience].", tags: ["blogging", "ideas"], creationDate: new Date(Date.now() - 86400000 * 2).toISOString(), popularity: 5, starred: true },
            { id: Date.now() + 2, title: "Email Subject Line Crafter", content: "Write 3 compelling email subject lines for a newsletter about [product/service] announcing [feature/offer].", tags: ["email", "marketing"], creationDate: new Date().toISOString(), popularity: 10, starred: false },
            { id: Date.now() + 3, title: "Code Explainer", content: "Explain the following [language] code snippet in simple terms:\n\`\`\`\n[paste code here]\n\`\`\`", tags: ["code", "development"], creationDate: new Date(Date.now() - 86400000).toISOString(), popularity: 2, starred: true },
        ];
    }

    function renderPrompts(filteredPrompts = null) {
        promptListArea.innerHTML = '';
        const promptsToRender = filteredPrompts || prompts;

        if (promptsToRender.length === 0) {
            promptListArea.innerHTML = `<p>No prompts found. ${currentView === 'search' && document.getElementById('search-input')?.value ? 'Try a different search term or ' : ''}Try creating one!</p>`;
            return;
        }

        promptsToRender.forEach(prompt => {
            const promptEl = document.createElement('div');
            promptEl.className = 'prompt-item';
            promptEl.dataset.id = prompt.id;
            promptEl.innerHTML = `
                <h4>${prompt.title} ${prompt.starred ? '&#9733;' : ''}</h4>
                <div class="prompt-item-meta">
                    <span>Created: ${new Date(prompt.creationDate).toLocaleDateString()}</span>
                    <span>Tags: ${prompt.tags.map(tag => `<span class="tag">${tag}</span>`).join(' ')}</span>
                    <span>Used: ${prompt.popularity || 0} times</span>
                </div>
                <div class="prompt-item-content">${prompt.content.substring(0, 250)}${prompt.content.length > 250 ? '...' : ''}</div>
                <div class="prompt-item-actions">
                    <button class="view-edit" data-id="${prompt.id}">View/Edit</button>
                    <button class="star" data-id="${prompt.id}">${prompt.starred ? 'Unstar' : 'Star'}</button>
                    <button class="delete" data-id="${prompt.id}">Delete</button>
                </div>
            `;
            promptListArea.appendChild(promptEl);
        });
    }

    function renderCreatePromptForm(promptToEdit = null) {
        dynamicContentArea.innerHTML = `
            <h3>${promptToEdit ? 'Edit Prompt' : 'Create New Prompt'}</h3>
            <form id="prompt-form">
                <div>
                    <label for="prompt-title">Title:</label>
                    <input type="text" id="prompt-title" name="title" required value="${promptToEdit ? promptToEdit.title : ''}">
                </div>
                <div>
                    <label for="prompt-content">Prompt Content:</label>
                    <textarea id="prompt-content" name="content" required>${promptToEdit ? promptToEdit.content : ''}</textarea>
                </div>
                <div>
                    <label for="prompt-tags">Tags (comma-separated):</label>
                    <input type="text" id="prompt-tags" name="tags" value="${promptToEdit && promptToEdit.tags ? promptToEdit.tags.join(', ') : ''}">
                </div>
                <button type="submit">${promptToEdit ? 'Save Changes' : 'Create Prompt'}</button>
            </form>
        `;

        const promptForm = document.getElementById('prompt-form');
        promptForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const title = document.getElementById('prompt-title').value.trim();
            const content = document.getElementById('prompt-content').value.trim();
            const tags = document.getElementById('prompt-tags').value.split(',').map(tag => tag.trim()).filter(tag => tag);

            if (!title || !content) {
                alert("Title and Content are required.");
                return;
            }

            if (promptToEdit) {
                const index = prompts.findIndex(p => p.id === promptToEdit.id);
                if (index > -1) {
                    prompts[index] = { ...prompts[index], title, content, tags, lastModified: new Date().toISOString() };
                }
            } else {
                const newPrompt = {
                    id: Date.now(),
                    title,
                    content,
                    tags,
                    creationDate: new Date().toISOString(),
                    popularity: 0,
                    starred: false
                };
                prompts.push(newPrompt);
            }
            savePrompts();
            sortPrompts(); 
            navigateTo('my-prompts'); 
            alert(promptToEdit ? 'Prompt updated!' : 'Prompt created!');
        });
    }
    
    function renderSearchPromptsView() {
        dynamicContentArea.innerHTML = `
            <h3>Search Prompts</h3>
            <input type="text" id="search-input" placeholder="Search by title, content, or tag...">
        `;
        const searchInput = document.getElementById('search-input');
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            if (!searchTerm) {
                renderPrompts(); 
                return;
            }
            const filtered = prompts.filter(p => 
                p.title.toLowerCase().includes(searchTerm) ||
                p.content.toLowerCase().includes(searchTerm) ||
                p.tags.some(tag => tag.toLowerCase().includes(searchTerm))
            );
            renderPrompts(filtered);
        });
        searchInput.focus(); // Auto-focus on search input
    }


    function handlePromptAction(e) {
        if (!e.target.matches('button')) return; 

        const action = e.target.classList[0]; 
        const promptId = parseInt(e.target.dataset.id);
        const promptIndex = prompts.findIndex(p => p.id === promptId);

        if (promptIndex === -1) return;

        switch (action) {
            case 'view-edit':
                navigateTo('create'); 
                renderCreatePromptForm(prompts[promptIndex]);
                break;
            case 'star':
                prompts[promptIndex].starred = !prompts[promptIndex].starred;
                savePrompts();
                renderPrompts(currentView === 'search' ? getFilteredPrompts() : null); // Re-render current list
                break;
            case 'delete':
                if (confirm(`Are you sure you want to delete "${prompts[promptIndex].title}"?`)) {
                    prompts.splice(promptIndex, 1);
                    savePrompts();
                    renderPrompts(currentView === 'search' ? getFilteredPrompts() : null); // Re-render current list
                }
                break;
        }
    }
    
    // Helper for re-rendering search results after action
    function getFilteredPrompts() {
        const searchInput = document.getElementById('search-input');
        if (currentView === 'search' && searchInput && searchInput.value) {
            const searchTerm = searchInput.value.toLowerCase();
            return prompts.filter(p => 
                p.title.toLowerCase().includes(searchTerm) ||
                p.content.toLowerCase().includes(searchTerm) ||
                p.tags.some(tag => tag.toLowerCase().includes(searchTerm))
            );
        }
        return null; // Or prompts if you want to show all if not in search view
    }

    function sortPrompts() {
        const sortBy = sortBySelect.value;
        let promptsToSort = (currentView === 'search' && document.getElementById('search-input')?.value) ? getFilteredPrompts() : [...prompts]; // Sort a copy

        switch (sortBy) {
            case 'date-desc':
                promptsToSort.sort((a, b) => new Date(b.creationDate) - new Date(a.creationDate));
                break;
            case 'date-asc':
                promptsToSort.sort((a, b) => new Date(a.creationDate) - new Date(b.creationDate));
                break;
            case 'tag': 
                promptsToSort.sort((a, b) => (a.tags[0] || '').localeCompare(b.tags[0] || ''));
                break;
            case 'popularity':
                promptsToSort.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
                break;
            case 'alpha-asc':
                promptsToSort.sort((a,b) => a.title.localeCompare(b.title));
                break;
            case 'alpha-desc':
                promptsToSort.sort((a,b) => b.title.localeCompare(a.title));
                break;
        }

        if (currentView === 'my-prompts') {
             prompts = promptsToSort; // Update the main prompts array if sorting "My Prompts"
             renderPrompts();
        } else if (currentView === 'search') {
            renderPrompts(promptsToSort); // Render the sorted filtered list for search
        }
        // No need to call savePrompts() here as sorting doesn't change the data itself, just the order of display.
    }

    // --- EVENT LISTENERS ---
    loginButton.addEventListener('click', handleLogin);
    usernameInput.addEventListener('keypress', (e) => { if (e.key === 'Enter' && loginStep === 1) handleLogin(); });
    passwordInput.addEventListener('keypress', (e) => { if (e.key === 'Enter' && loginStep === 1) handleLogin(); });
    mfaCodeInput.addEventListener('keypress', (e) => { if (e.key === 'Enter' && loginStep === 2) handleLogin(); });

    logoutButton.addEventListener('click', handleLogout);

    leftFrameNavButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (button.dataset.action === "save") { // Special handling for the disabled save button
                navigateTo("save");
            } else {
                navigateTo(button.dataset.action);
            }
        });
    });
    
    promptListArea.addEventListener('click', handlePromptAction);

    sortBySelect.addEventListener('change', sortPrompts);

    document.getElementById('profile-link').addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo('profile');
    });
    document.getElementById('settings-link').addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo('settings');
    });

    // --- INITIALIZATION ---
    checkSession();

});