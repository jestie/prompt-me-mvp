// version 1.0.1
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
    const navList = document.getElementById('nav-list'); 

    const leftFrameNavButtons = () => document.querySelectorAll('#left-frame ul li button'); 
    const mainContentTitle = document.getElementById('main-content-title');
    const promptListArea = document.getElementById('prompt-list-area');
    const dynamicContentArea = document.getElementById('dynamic-content-area');
    const sortBySelect = document.getElementById('sort-by');
    const loadingIndicator = document.getElementById('loading-indicator');
    const currentYearSpan = document.getElementById('current-year');

    // App State
    let currentUser = null;
    let currentView = 'my-prompts'; 
    let prompts = []; 
    let loginStep = 1; 
    let auditLog = [];
    let lastAiConnectionTestResult = { status: null, message: '' }; 

    let aiImproverSettings = {
        enabled: false,
        serviceType: 'ollama', 
        ollamaApiEndpoint: 'http://localhost:11434/api/generate',
        ollamaModelName: 'llama3', 
        openaiApiKey: '',
        openaiModelName: 'gpt-3.5-turbo',
    };
    let appGlobalSettings = { disableAiForNonAdmins: false };
    let appDefaultPrompts = []; 

    // Constants for localStorage keys
    const THEME_KEY = 'promptMeTheme';
    const AI_SETTINGS_KEY_PREFIX = 'promptMeAiSettings_';
    const APP_GLOBAL_SETTINGS_KEY = 'promptMeAppGlobalSettings';
    const APP_DEFAULT_PROMPTS_KEY = 'promptMeAppDefaultPrompts';
    const AUDIT_LOG_KEY = 'promptMeAuditLog';
    const EXPORT_OPTIONS_CONTAINER_ID = 'export-options-container';

    // --- UTILITY FUNCTIONS ---
    function showLoading(message = "Processing, please wait...") { if (loadingIndicator) { loadingIndicator.querySelector('p').textContent = message; loadingIndicator.style.display = 'flex'; } }
    function hideLoading() { if (loadingIndicator) { loadingIndicator.style.display = 'none'; } }

    // --- THEME MANAGEMENT ---
    function applyTheme(theme) { if (theme === 'dark') document.body.classList.add('dark-theme'); else document.body.classList.remove('dark-theme'); const ts = document.getElementById('theme-select'); if (ts) ts.value = theme; }
    function saveThemePreference(theme) { localStorage.setItem(THEME_KEY, theme); }
    function loadThemePreference() { const st = localStorage.getItem(THEME_KEY) || 'light'; applyTheme(st); return st; }

    // --- AI SETTINGS MANAGEMENT ---
    function saveAiImproverSettings() { if (currentUser) localStorage.setItem(AI_SETTINGS_KEY_PREFIX + currentUser.username, JSON.stringify(aiImproverSettings)); }
    function loadAiImproverSettings() {
        const defaultSettings = { enabled: false, serviceType: 'ollama', ollamaApiEndpoint: 'http://localhost:11434/api/generate', ollamaModelName: 'llama3', openaiApiKey: '', openaiModelName: 'gpt-3.5-turbo' };
        if (currentUser && currentUser.username) {
            const savedSettings = localStorage.getItem(AI_SETTINGS_KEY_PREFIX + currentUser.username);
            if (savedSettings) aiImproverSettings = { ...defaultSettings, ...JSON.parse(savedSettings) };
            else { aiImproverSettings = { ...defaultSettings }; saveAiImproverSettings(); }
        } else {
            aiImproverSettings = { ...defaultSettings }; // Reset if no user
        }
    }
    
    // --- APP GLOBAL & DEFAULT PROMPT SETTINGS (ADMIN) ---
    function saveAppGlobalSettings() { localStorage.setItem(APP_GLOBAL_SETTINGS_KEY, JSON.stringify(appGlobalSettings)); }
    function loadAppGlobalSettings() { const s = localStorage.getItem(APP_GLOBAL_SETTINGS_KEY); const d = {disableAiForNonAdmins:false}; if(s) appGlobalSettings={...d,...JSON.parse(s)}; else appGlobalSettings={...d}; }
    function saveAppDefaultPrompts() { localStorage.setItem(APP_DEFAULT_PROMPTS_KEY, JSON.stringify(appDefaultPrompts)); }
    function loadAppDefaultPrompts() { const s = localStorage.getItem(APP_DEFAULT_PROMPTS_KEY); if(s)appDefaultPrompts=JSON.parse(s); else appDefaultPrompts=getHardcodedDefaultPrompts(); }

    // --- AUDIT LOG MANAGEMENT ---
    function loadAuditLog() { const sl=localStorage.getItem(AUDIT_LOG_KEY); auditLog=sl?JSON.parse(sl):[]; }
    function saveAuditLog() { localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(auditLog)); }
    function logAuditEvent(action, promptId, promptTitleSnapshot = '', details = {}) {
        if (!currentUser || !currentUser.username) return; 
        const logEntry = { logId: Date.now()+'-'+Math.random().toString(36).substr(2,9), timestamp: new Date().toISOString(), userId: currentUser.username, action, promptId: promptId||'N/A', promptTitleSnapshot: promptTitleSnapshot||(promptId?(prompts.find(p=>p.id===promptId)?.title||'N/A'):'N/A'), details };
        auditLog.unshift(logEntry); if (auditLog.length > 200) auditLog.pop(); saveAuditLog();
    }

    // --- EXPORT FUNCTIONALITY ---
    function triggerDownload(filename,content,mimeType){const b=new Blob([content],{type:mimeType}),u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download=filename;document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(u);}
    function escapeCSVField(field){if(field===null||field===undefined)return'';let sF=String(field);if(sF.includes(',')||sF.includes('"')||sF.includes('\n')||sF.includes('\r'))sF='"'+sF.replace(/"/g,'""')+'"';return sF;}
    function exportToCSV(){if(prompts.length===0){alert("No prompts to export.");return;}const h=["ID","Title","Content","Tags","Creation Date","Last Modified","Popularity","Starred"];let cC=h.map(escapeCSVField).join(",")+"\n";prompts.forEach(p=>{const r=[p.id,p.title,p.content,p.tags.join('|'),p.creationDate,p.lastModified,p.popularity||0,p.starred].map(escapeCSVField).join(",");cC+=r+"\n";});triggerDownload(`prompt_me_export_${currentUser.username}_${new Date().toISOString().slice(0,10)}.csv`,cC,'text/csv;charset=utf-8;');}
    function exportToTXT(){if(prompts.length===0){alert("No prompts to export.");return;}let tC=`Prompts Export for ${currentUser.username} - ${new Date().toLocaleDateString()}\n\n`;prompts.forEach((p,i)=>{tC+=`-------------------- Prompt ${i+1} --------------------\nID: ${p.id}\nTitle: ${p.title}\nContent:\n${p.content}\n\nTags: ${p.tags.join(', ')}\nCreation Date: ${new Date(p.creationDate).toLocaleString()}\nLast Modified: ${new Date(p.lastModified).toLocaleString()}\nPopularity: ${p.popularity||0}\nStarred: ${p.starred?'Yes':'No'}\n--------------------------------------------------\n\n`;});triggerDownload(`prompt_me_export_${currentUser.username}_${new Date().toISOString().slice(0,10)}.txt`,tC,'text/plain;charset=utf-8;');}
    function exportToJSON(){if(prompts.length===0){alert("No prompts to export.");return;}const jC=JSON.stringify(prompts,null,2);triggerDownload(`prompt_me_export_${currentUser.username}_${new Date().toISOString().slice(0,10)}.json`,jC,'application/json;charset=utf-8;');}

    // --- AUTHENTICATION ---
    const SIMULATED_USERS = { 
        "user": { password: "password123", mfaCode: "123456", bioIcon: "https://via.placeholder.com/40x40.png?text=U", bioIconDataUrl: null, details: "A standard user." }, 
        "admin": { password: "secure", mfaCode: "654321", bioIcon: "https://via.placeholder.com/40x40.png?text=A", bioIconDataUrl: null, details: "System Administrator." } 
    };

    function handleLogin() {
        const u = usernameInput.value.trim();
        const p = passwordInput.value; 
        const m = mfaCodeInput.value.trim();
        loginError.textContent='';

        if (loginStep === 1) {
            if (SIMULATED_USERS[u] && SIMULATED_USERS[u].password === p) {
                loginStep = 2;
                mfaSection.style.display = 'block';
                usernameInput.disabled = true; passwordInput.disabled = true;
                loginButton.textContent = 'Verify MFA'; mfaCodeInput.focus();
            } else {
                loginError.textContent = 'Invalid username or password.';
            }
        } else if (loginStep === 2) {
            if (SIMULATED_USERS[u] && SIMULATED_USERS[u].mfaCode === m) {
                const sUS = localStorage.getItem('promptMeUser');
                let eSU = null;
                if (sUS) {
                    try { const tU = JSON.parse(sUS); if (tU.username === u) eSU = tU; } 
                    catch (e) { console.error("Error parsing saved user data:", e); }
                }
                
                currentUser = { username: u, ...SIMULATED_USERS[u] }; 
                if (eSU) {
                    currentUser.bioIcon = eSU.bioIcon !== undefined ? eSU.bioIcon : SIMULATED_USERS[u].bioIcon;
                    currentUser.bioIconDataUrl = eSU.bioIconDataUrl !== undefined ? eSU.bioIconDataUrl : SIMULATED_USERS[u].bioIconDataUrl;
                    currentUser.details = eSU.details !== undefined ? eSU.details : SIMULATED_USERS[u].details;
                } else { // Ensure defaults if no specific saved user data
                    currentUser.bioIconDataUrl = SIMULATED_USERS[u].bioIconDataUrl || null;
                    currentUser.bioIcon = SIMULATED_USERS[u].bioIcon || null;
                    currentUser.details = SIMULATED_USERS[u].details || "";
                }
                localStorage.setItem('promptMeUser', JSON.stringify(currentUser)); 
                
                // Load user-specific and app settings AFTER currentUser is fully defined
                loadAiImproverSettings();
                loadAppGlobalSettings(); 
                loadAppDefaultPrompts();
                loadAuditLog();
                
                initializeApp(); 
                logAuditEvent("USER_LOGIN", null, 'System Access');
            } else {
                loginError.textContent = 'Invalid MFA code.';
                loginStep = 1;
                mfaSection.style.display = 'none';
                usernameInput.disabled = false; passwordInput.disabled = false;
                loginButton.textContent = 'Login / Next';
            }
        }
    }
    
    function updateTopBarUserIcon() { 
        if(!currentUser) return;
        if(currentUser.bioIconDataUrl) userProfileIcon.src=currentUser.bioIconDataUrl;
        else if(currentUser.bioIcon && currentUser.bioIcon.trim()!=='') userProfileIcon.src=currentUser.bioIcon;
        else userProfileIcon.src=`https://via.placeholder.com/40x40.png?text=${currentUser.username.charAt(0).toUpperCase()}`; 
    }

    function updateAdminNav() { 
        const existingAdminLink = document.getElementById('admin-panel-link'); 
        if(currentUser && currentUser.username === 'admin'){
            if(!existingAdminLink){
                const adminLi = document.createElement('li');
                adminLi.innerHTML = `<button data-action="admin-panel" id="admin-panel-link">⚙️ Admin Panel</button>`;
                navList.appendChild(adminLi);
                attachNavButtonListeners(); 
            }
        } else {
            if(existingAdminLink) existingAdminLink.parentElement.remove();
        }
    }

    function attachNavButtonListeners() { 
        // Detach and re-attach to all to include new buttons
        leftFrameNavButtons().forEach(button => {
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            newButton.addEventListener('click', () => navigateTo(newButton.dataset.action));
        });
    }

    function initializeApp() { 
        if (!currentUser || !currentUser.username) { 
            console.error("initializeApp: Critical error - currentUser not properly set.");
            // Potentially force logout or show error
            handleLogout(); // Or a more graceful error state
            return;
        }
        loadThemePreference();
        loginOverlay.style.display='none';
        appContainer.style.display='flex';
        userGreeting.textContent=`Welcome, ${currentUser.username}!`;
        updateTopBarUserIcon();
        updateAdminNav(); 
        if(currentYearSpan) currentYearSpan.textContent=new Date().getFullYear();
        loadPrompts(); 
        navigateTo(currentView||'my-prompts');
    }

    function handleLogout() { 
        if (currentUser) { 
            logAuditEvent("USER_LOGOUT",null,'System Access');
            saveAiImproverSettings(); 
        }
        saveAppGlobalSettings(); 
        saveAppDefaultPrompts(); 
        currentUser=null; // Clear current user
        // Reset AI settings to default when no user is logged in
        aiImproverSettings = { enabled: false, serviceType: 'ollama', ollamaApiEndpoint: 'http://localhost:11434/api/generate', ollamaModelName: 'llama3', openaiApiKey: '', openaiModelName: 'gpt-3.5-turbo' };
        lastAiConnectionTestResult = { status: null, message: '' }; // Reset test status

        loginOverlay.style.display='flex';
        appContainer.style.display='none';
        loginStep=1;
        usernameInput.value=''; passwordInput.value=''; mfaCodeInput.value='';
        mfaSection.style.display='none';
        usernameInput.disabled=false; passwordInput.disabled=false;
        loginButton.textContent='Login / Next';
        loginError.textContent='';
        updateAdminNav(); 
    }

    function checkSession() { 
        // Load non-user-specific settings first
        loadThemePreference();
        loadAppGlobalSettings();
        loadAppDefaultPrompts();
        loadAuditLog();

        const savedUserString = localStorage.getItem('promptMeUser');
        if(savedUserString){
            try{
                const parsedUser = JSON.parse(savedUserString);
                if (!parsedUser || !parsedUser.username || !SIMULATED_USERS[parsedUser.username]) {
                     throw new Error("Invalid or unrecognized saved user data.");
                }
                currentUser = { ...SIMULATED_USERS[parsedUser.username], ...parsedUser }; // Merge, SIMULATED_USERS provides base, parsedUser overrides profile
                // Ensure critical auth fields are from SIMULATED_USERS, not localStorage
                currentUser.password = SIMULATED_USERS[currentUser.username].password;
                currentUser.mfaCode = SIMULATED_USERS[currentUser.username].mfaCode;

                loadAiImproverSettings(); // Now load user-specific AI settings
                initializeApp();
            }catch(e){
                console.error("Error during session restoration:",e);
                localStorage.removeItem('promptMeUser'); 
                currentUser = null; 
                loginOverlay.style.display='flex'; 
            }
        }else{
            loginOverlay.style.display='flex';
        }
    }

    // --- NAVIGATION AND CONTENT DISPLAY ---
    function manageHeaderActions(showSort,showExport){const sOE=document.querySelector('.sort-options'),mFH=document.querySelector('#main-frame .main-frame-header');let hA=mFH?mFH.querySelector('.header-actions'):null,eC=document.getElementById(EXPORT_OPTIONS_CONTAINER_ID);if(!mFH)return;if((showSort||showExport)&&!hA){hA=document.createElement('div');hA.className='header-actions';mFH.appendChild(hA);}if(sOE&&hA&&sOE.parentElement!==hA)hA.appendChild(sOE);if(!showSort&&!showExport&&hA){if(sOE)sOE.style.display='none';if(eC)eC.style.display='none';}if(sOE)sOE.style.display=showSort?'flex':'none';if(showExport&&hA){if(!eC){eC=document.createElement('div');eC.id=EXPORT_OPTIONS_CONTAINER_ID;eC.className='export-options';hA.appendChild(eC);}renderExportButtonsDOM(eC);eC.style.display='flex';}else if(eC){eC.style.display='none';eC.innerHTML='';}}
    function renderExportButtonsDOM(container){container.innerHTML=`<button id="export-csv-button" class="header-button">Export CSV</button><button id="export-txt-button" class="header-button">Export TXT</button><button id="export-json-button" class="header-button">Export JSON</button>`;const eCB=document.getElementById('export-csv-button');if(eCB)eCB.addEventListener('click',exportToCSV);const eTB=document.getElementById('export-txt-button');if(eTB)eTB.addEventListener('click',exportToTXT);const eJB=document.getElementById('export-json-button');if(eJB)eJB.addEventListener('click',exportToJSON);}
    function navigateTo(action){currentView=action;promptListArea.style.display='none';dynamicContentArea.style.display='none';dynamicContentArea.innerHTML='';leftFrameNavButtons().forEach(b=>{b.classList.remove('active');if(b.dataset.action===action)b.classList.add('active');});switch(action){case 'dashboards':mainContentTitle.textContent='Dashboards Hub';manageHeaderActions(false,false);dynamicContentArea.style.display='block';renderDashboardHub();break;case 'my-prompts':mainContentTitle.textContent='My Prompts';manageHeaderActions(true,true);promptListArea.style.display='block';renderPrompts();break;case 'create':mainContentTitle.textContent='Create New Prompt';manageHeaderActions(false,false);dynamicContentArea.style.display='block';renderCreatePromptForm();break;case 'search':mainContentTitle.textContent='Search Prompts';manageHeaderActions(true,false);dynamicContentArea.style.display='block';renderSearchPromptsView();promptListArea.style.display='block';renderPrompts();break;case 'knowledge':mainContentTitle.textContent='Knowledge Base';manageHeaderActions(false,false);dynamicContentArea.style.display='block';dynamicContentArea.innerHTML=`<h3>Knowledge Base</h3><p>(Content to be added)</p>`;break;case 'tips':mainContentTitle.textContent='Tips & Tricks';manageHeaderActions(false,false);dynamicContentArea.style.display='block';dynamicContentArea.innerHTML=`<h3>Tips & Tricks</h3><p>(Content to be added)</p>`;break;case 'profile':mainContentTitle.textContent='User Profile';manageHeaderActions(false,false);dynamicContentArea.style.display='block';renderUserProfile();break;case 'settings':mainContentTitle.textContent='Settings';manageHeaderActions(false,false);dynamicContentArea.style.display='block';renderSettings();break;case 'admin-panel':if(currentUser&&currentUser.username==='admin'){mainContentTitle.textContent='Admin Panel';manageHeaderActions(false,false);dynamicContentArea.style.display='block';renderAdminPanel();}else{navigateTo('my-prompts');}break;case 'save':alert("To save a prompt, use the 'Create/Edit' form.");manageHeaderActions(false,false);break;default:navigateTo('my-prompts');}}
    
    function renderUserProfile(){ 
        let cIS = `https://via.placeholder.com/40x40.png?text=${currentUser.username.charAt(0).toUpperCase()}`;
        if (currentUser.bioIconDataUrl) cIS = currentUser.bioIconDataUrl;
        else if (currentUser.bioIcon && currentUser.bioIcon.trim() !== '') cIS = currentUser.bioIcon;
        dynamicContentArea.innerHTML = `<h3>User Profile</h3><div style="display: flex; align-items: center; margin-bottom: 20px;"><img id="profile-icon-preview" src="${cIS}" alt="Preview" style="width: 80px; height: 80px; border-radius: 50%; margin-right: 20px; border: 1px solid var(--app-border-color); object-fit: cover;"><div><p style="margin-top:0;"><strong>Username:</strong> ${currentUser.username}</p><label for="profile-icon-file" style="font-weight:normal; display:block; margin-bottom:5px;">Upload Icon:</label><input type="file" id="profile-icon-file" accept="image/*" style="margin-bottom:10px;"><button id="remove-profile-icon-button" type="button" style="font-size:0.8em; padding: 3px 6px;">Remove Icon</button></div></div><label for="profile-icon-url">Or Icon URL:</label><input type="text" id="profile-icon-url" placeholder="https://example.com/icon.png" value="${(currentUser.bioIcon && !currentUser.bioIconDataUrl) ? currentUser.bioIcon : ''}"><label for="profile-details">Details/Bio:</label><textarea id="profile-details" placeholder="Details...">${currentUser.details || ''}</textarea><button id="save-profile-button" type="button">Save Profile</button>`;
        const pUI=document.getElementById('profile-icon-url'),pFI=document.getElementById('profile-icon-file'),pP=document.getElementById('profile-icon-preview'),pSB=document.getElementById('save-profile-button'),pRB=document.getElementById('remove-profile-icon-button');let nBU=null;
        if(pFI)pFI.addEventListener('change',e=>{const f=e.target.files[0];if(f){if(f.size>2*1024*1024){alert('Max 2MB');pFI.value='';return;}const r=new FileReader();r.onload=ev=>{pP.src=ev.target.result;nBU=ev.target.result;if(pUI)pUI.value='';};r.readAsDataURL(f);}});
        if(pUI)pUI.addEventListener('input',()=>{const v=pUI.value.trim();if(v){pP.src=v;nBU=null;if(pFI)pFI.value='';}else if(!nBU){let fS=`https://via.placeholder.com/40x40.png?text=${currentUser.username.charAt(0).toUpperCase()}`;if(currentUser.bioIconDataUrl)fS=currentUser.bioIconDataUrl;pP.src=fS;}});
        if(pRB)pRB.addEventListener('click',()=>{const dP=`https://via.placeholder.com/40x40.png?text=${currentUser.username.charAt(0).toUpperCase()}`;pP.src=dP;if(pUI)pUI.value='';if(pFI)pFI.value='';nBU=null;alert('Icon removed on save.');});
        if(pSB)pSB.addEventListener('click',()=>{currentUser.details=document.getElementById('profile-details').value.trim();const urlV=pUI?pUI.value.trim():'';if(nBU){currentUser.bioIconDataUrl=nBU;currentUser.bioIcon=null;}else if(urlV){currentUser.bioIcon=urlV;currentUser.bioIconDataUrl=null;}else{currentUser.bioIcon=null;currentUser.bioIconDataUrl=null;}localStorage.setItem('promptMeUser',JSON.stringify(currentUser));updateTopBarUserIcon();alert('Profile saved!');});
    }

    function renderSettings() { 
        loadAiImproverSettings(); 
        const currentTheme = localStorage.getItem(THEME_KEY) || 'light';
        const isAiGloballyDisabled = appGlobalSettings.disableAiForNonAdmins && (!currentUser || currentUser.username !== 'admin'); // Check currentUser exists
        const aiFeatureAllowed = !isAiGloballyDisabled; 

        let ollamaFieldsDisplay = (aiImproverSettings.enabled && aiImproverSettings.serviceType === 'ollama' && aiFeatureAllowed) ? 'block' : 'none';
        let openaiFieldsDisplay = (aiImproverSettings.enabled && aiImproverSettings.serviceType === 'openai' && aiFeatureAllowed) ? 'block' : 'none';
        let aiServiceConfigAreaDisplay = (aiImproverSettings.enabled && aiFeatureAllowed) ? 'block' : 'none';
        
        let aiImproverSectionHTML = `<h4 class="settings-subtitle">AI Prompt Improver / Analyzer</h4> ${isAiGloballyDisabled ? "<p style='color:var(--app-text-secondary);'><em>This feature is currently disabled by the administrator.</em></p>" : `<div class="toggle-switch-container"><label for="enable-ai-improver">Enable AI Features:</label><label class="switch"> <input type="checkbox" id="enable-ai-improver" ${aiImproverSettings.enabled ? 'checked' : ''}> <span class="slider"></span> </label></div><div id="ai-service-config-area" style="display: ${aiServiceConfigAreaDisplay};"><div><label for="ai-service-type">AI Service Provider:</label><select id="ai-service-type"><option value="ollama" ${aiImproverSettings.serviceType === 'ollama' ? 'selected' : ''}>Ollama (Local)</option><option value="openai" ${aiImproverSettings.serviceType === 'openai' ? 'selected' : ''}>OpenAI (ChatGPT)</option></select></div><div id="ollama-settings-fields" style="display: ${ollamaFieldsDisplay};"><div> <label for="ollama-api-endpoint">Ollama API Endpoint:</label> <input type="url" id="ollama-api-endpoint" value="${aiImproverSettings.ollamaApiEndpoint}"> </div><div> <label for="ollama-model-name">Ollama Model Name:</label> <input type="text" id="ollama-model-name" placeholder="e.g., llama3" value="${aiImproverSettings.ollamaModelName}"> </div></div><div id="openai-settings-fields" style="display: ${openaiFieldsDisplay};"><div> <label for="openai-api-key">OpenAI API Key:</label> <input type="password" id="openai-api-key" value="${aiImproverSettings.openaiApiKey}"> </div><div> <label for="openai-model-name">OpenAI Model Name:</label> <input type="text" id="openai-model-name" placeholder="e.g., gpt-3.5-turbo" value="${aiImproverSettings.openaiModelName}"> </div></div><button id="save-ai-settings-button" type="button" style="margin-top:10px;">Save AI Settings</button><button id="test-ai-connection-button" type="button" class="test-ai-button" style="margin-top:10px; margin-left:5px;">Test Connection</button><div id="ai-connection-status" class="ai-connection-status" style="margin-top:10px;"></div></div><p style="font-size:0.8em;color:var(--app-text-secondary);margin-top:10px;">Note: For local models, ensure server is running. For OpenAI, a valid API key is required. Test connection after saving settings.</p>`}`;
        dynamicContentArea.innerHTML = `<h3>Settings</h3> <h4 class="settings-subtitle">Appearance</h4> <div> <label for="theme-select">Theme:</label> <select id="theme-select"> <option value="light">Light</option> <option value="dark">Dark</option> </select> </div> ${aiImproverSectionHTML}`;
        
        const themeSelect = document.getElementById('theme-select');
        if(themeSelect){themeSelect.value=currentTheme;themeSelect.addEventListener('change',(e)=>{applyTheme(e.target.value);saveThemePreference(e.target.value);});}

        if (aiFeatureAllowed) { 
            const enAiToggle = document.getElementById('enable-ai-improver');
            const aiServiceConfigAreaEl = document.getElementById('ai-service-config-area'); 
            const aiServiceTypeSelect = document.getElementById('ai-service-type');
            const ollamaFieldsEl = document.getElementById('ollama-settings-fields'); 
            const openaiFieldsEl = document.getElementById('openai-settings-fields'); 
            const saveAiBtn = document.getElementById('save-ai-settings-button');
            const testAiBtn = document.getElementById('test-ai-connection-button');

            function toggleServiceFieldsVisibilityAndUpdateState() { 
                const isEnabled = enAiToggle ? enAiToggle.checked : false; // Handle case where toggle might not exist yet
                const selectedService = aiServiceTypeSelect ? aiServiceTypeSelect.value : 'ollama';
                
                aiImproverSettings.enabled = isEnabled; 
                aiImproverSettings.serviceType = selectedService; 

                if (aiServiceConfigAreaEl) aiServiceConfigAreaEl.style.display = isEnabled ? 'block' : 'none';
                if (ollamaFieldsEl) ollamaFieldsEl.style.display = (isEnabled && selectedService === 'ollama') ? 'block' : 'none';
                if (openaiFieldsEl) openaiFieldsEl.style.display = (isEnabled && selectedService === 'openai') ? 'block' : 'none';
            }
            
            if(enAiToggle) enAiToggle.addEventListener('change', toggleServiceFieldsVisibilityAndUpdateState);
            if(aiServiceTypeSelect) aiServiceTypeSelect.addEventListener('change', toggleServiceFieldsVisibilityAndUpdateState);
            if(saveAiBtn) saveAiBtn.addEventListener('click', () => {
                // Read current values from form to ensure they are captured before save
                aiImproverSettings.enabled = enAiToggle ? enAiToggle.checked : false;
                aiImproverSettings.serviceType = aiServiceTypeSelect ? aiServiceTypeSelect.value : 'ollama';
                aiImproverSettings.ollamaApiEndpoint = document.getElementById('ollama-api-endpoint').value.trim();
                aiImproverSettings.ollamaModelName = document.getElementById('ollama-model-name').value.trim();
                aiImproverSettings.openaiApiKey = document.getElementById('openai-api-key').value; 
                aiImproverSettings.openaiModelName = document.getElementById('openai-model-name').value.trim();
                
                if (aiImproverSettings.enabled) { 
                    if (aiImproverSettings.serviceType === 'ollama' && (!aiImproverSettings.ollamaApiEndpoint || !aiImproverSettings.ollamaModelName)) { alert("Ollama API Endpoint and Model Name are required."); return; }
                    if (aiImproverSettings.serviceType === 'openai' && (!aiImproverSettings.openaiApiKey || !aiImproverSettings.openaiModelName)) { alert("OpenAI API Key and Model Name are required."); return; }
                }
                saveAiImproverSettings(); 
                alert('AI settings saved!');
                if (currentView === 'my-prompts') renderPrompts();
                updateConnectionStatusDisplay(null, ''); 
                lastAiConnectionTestResult = { status: null, message: '' }; 
            });
            if(testAiBtn) testAiBtn.addEventListener('click', testAiConnection);
            toggleServiceFieldsVisibilityAndUpdateState(); 
            updateConnectionStatusDisplay(lastAiConnectionTestResult.status, lastAiConnectionTestResult.message);
        }
    }

    async function testAiConnection() { 
        const statusDisplay = document.getElementById('ai-connection-status');
        if (!statusDisplay) return;
        
        // Use current form values for the test, not necessarily saved state
        const currentEnabled = document.getElementById('enable-ai-improver')?.checked;
        const currentServiceType = document.getElementById('ai-service-type')?.value;
        const currentOllamaEndpoint = document.getElementById('ollama-api-endpoint')?.value.trim();
        const currentOllamaModel = document.getElementById('ollama-model-name')?.value.trim();
        const currentOpenAiKey = document.getElementById('openai-api-key')?.value; // No trim for API key
        const currentOpenAiModel = document.getElementById('openai-model-name')?.value.trim();

        if (!currentEnabled) { 
            updateConnectionStatusDisplay('neutral', "AI features are disabled. Enable to test."); 
            lastAiConnectionTestResult = { status: 'neutral', message: "AI features are disabled. Enable to test." };
            return; 
        }

        let endpoint, model, apiKey, body, headers;
        const testPrompt = "Hello AI, respond with only the word 'OK' if you are operational.";
        updateConnectionStatusDisplay('neutral', "Testing connection to " + currentServiceType + "...");
        showLoading("Testing AI Connection...");
        logAuditEvent("AI_CONNECTION_TEST_STARTED", null, "AI Service Test", {service: currentServiceType});
        try { 
            if (currentServiceType === 'ollama') { if (!currentOllamaEndpoint || !currentOllamaModel) throw new Error("Ollama Endpoint and Model Name are required."); endpoint = currentOllamaEndpoint; model = currentOllamaModel; headers = {'Content-Type':'application/json'}; body = JSON.stringify({ model, prompt: testPrompt, stream: false }); } 
            else if (currentServiceType === 'openai') { if (!currentOpenAiKey || !currentOpenAiModel) throw new Error("OpenAI API Key and Model Name are required."); apiKey = currentOpenAiKey; model = currentOpenAiModel; endpoint = 'https://api.openai.com/v1/chat/completions'; headers = {'Content-Type':'application/json', 'Authorization':`Bearer ${apiKey}`}; body = JSON.stringify({ model, messages:[{"role":"user", "content":testPrompt}], max_tokens:10, temperature: 0.1 }); } 
            else { throw new Error("Invalid AI service type selected."); }
            const response = await fetch(endpoint, { method: 'POST', headers, body }); let responseBodyText = await response.text(); 
            if (!response.ok) { let errorDetail = response.statusText; try { const errData = JSON.parse(responseBodyText); errorDetail = errData.error?.message || errData.error || JSON.stringify(errData); } catch (e) { errorDetail = responseBodyText || errorDetail; } throw new Error(`API Error (${response.status}): ${errorDetail}`); }
            const data = JSON.parse(responseBodyText); let aiResponseText = '';
            if (currentServiceType === 'ollama') aiResponseText = data.response?.trim(); else if (currentServiceType === 'openai') aiResponseText = data.choices?.[0]?.message?.content?.trim();
            if (aiResponseText && aiResponseText.toUpperCase() === 'OK') { const successMsg = `Connection successful! ${currentServiceType} responded: "${aiResponseText}"`; updateConnectionStatusDisplay('success', successMsg); lastAiConnectionTestResult = { status: 'success', message: successMsg}; logAuditEvent("AI_CONNECTION_TEST_SUCCESS", null, "AI Service Test", {service: currentServiceType, response: aiResponseText}); } 
            else { throw new Error(`Unexpected AI response: "${aiResponseText || '(empty response)'}". Expected "OK".`); }
        } catch (error) { console.error("AI Connection Test Error:", error); const errorMsg = `Connection failed: ${error.message}`; updateConnectionStatusDisplay('error', errorMsg); lastAiConnectionTestResult = { status: 'error', message: errorMsg}; logAuditEvent("AI_CONNECTION_TEST_FAILED", null, "AI Service Test", {service: currentServiceType, error: error.message}); } 
        finally { hideLoading(); }
    }

    function updateConnectionStatusDisplay(status, message = '') { 
        const statusDisplay = document.getElementById('ai-connection-status');
        if (!statusDisplay) return;
        statusDisplay.className = 'ai-connection-status'; 
        if (status) statusDisplay.classList.add(`status-${status}`);
        statusDisplay.textContent = message;
        statusDisplay.style.display = message ? 'block' : 'none';
    }

    // --- PROMPT MANAGEMENT --- 
    function getHardcodedDefaultPrompts() { const n=new Date().toISOString(),y=new Date(Date.now()-86400000).toISOString(),d=new Date(Date.now()-86400000*2).toISOString(); return[ {id:Date.now()+1,title:"Blog Post Idea Generator",content:"Generate 5 blog post ideas about [topic]. Focus on [angle] for [audience].",tags:["blogging","ideas"],creationDate:d,lastModified:y,popularity:5,starred:true}, {id:Date.now()+2,title:"Email Subject Line Crafter",content:"Write 3 compelling email subject lines for a newsletter about [product/service] announcing [feature/offer].",tags:["email","marketing"],creationDate:n,lastModified:n,popularity:10,starred:false}, {id:Date.now()+3,title:"Code Explainer",content:"Explain the following [language] code snippet in simple terms:\n\`\`\`\n[paste code here]\n\`\`\`",tags:["code","development"],creationDate:y,lastModified:d,popularity:2,starred:true} ]; }
    function loadPrompts() { const sP=localStorage.getItem(`prompts_${currentUser.username}`); const dTU=appDefaultPrompts.length>0?appDefaultPrompts:getHardcodedDefaultPrompts(); prompts=sP?JSON.parse(sP):JSON.parse(JSON.stringify(dTU)); prompts=prompts.map(p=>({...p,lastModified:p.lastModified||p.creationDate,popularity:p.popularity||0,starred:p.starred||false})); savePrompts();sortPrompts(); }
    function savePrompts() { localStorage.setItem(`prompts_${currentUser.username}`, JSON.stringify(prompts)); }
    function renderPrompts(promptsToRenderArg = null) {  promptListArea.innerHTML=''; const pTD=promptsToRenderArg||(currentView==='search'?getFilteredPrompts(document.getElementById('search-input')?.value.toLowerCase()||''):prompts); if(pTD.length===0){promptListArea.innerHTML=`<p>No prompts found. ${currentView==='search'&&document.getElementById('search-input')?.value?'Try different search or ':''}Create one!</p>`;return;} const cUAI = aiImproverSettings.enabled && !(appGlobalSettings.disableAiForNonAdmins && (!currentUser || currentUser.username!=='admin')); pTD.forEach(p=>{ const pE=document.createElement('div');pE.className='prompt-item';pE.dataset.id=p.id; let aBHTML=''; if(cUAI)aBHTML=`<button class="ai-improve" data-id="${p.id}" title="Improve with AI">Improve ✨</button>`; pE.innerHTML=`<h4>${p.title} ${p.starred?'★':''}</h4><div class="prompt-item-meta"><span>Created: ${new Date(p.creationDate).toLocaleDateString()}</span><span>Modified: ${new Date(p.lastModified).toLocaleDateString()}</span><span>Tags: ${p.tags.map(t=>`<span class="tag">${t}</span>`).join(' ')}</span><span>Used: ${p.popularity||0}</span></div><div class="prompt-item-content">${p.content.substring(0,250)}${p.content.length>250?'...':''}</div><div class="prompt-item-actions"><button class="view-edit" data-id="${p.id}">View/Edit</button>${aBHTML}<button class="star" data-id="${p.id}">${p.starred?'Unstar':'Star'}</button><button class="delete" data-id="${p.id}">Delete</button></div>`; promptListArea.appendChild(pE); }); }
    function renderCreatePromptForm(promptToEdit = null, aiSuggestion = null) { let aSHTML='';if(aiSuggestion)aSHTML=`<div id="ai-suggestion-note"><strong>AI Suggestion:</strong> Review the content below and save if you like the changes.</div>`; let iBHTML=''; const cUAI=aiImproverSettings.enabled && !(appGlobalSettings.disableAiForNonAdmins && (!currentUser || currentUser.username!=='admin')); if(promptToEdit&&cUAI)iBHTML=`<button type="button" id="improve-in-form-button" class="ai-improve" style="margin-left:10px;background-color:var(--button-ai-background);color:var(--button-primary-text);">Improve ✨</button>`; dynamicContentArea.innerHTML=`<h3>${promptToEdit?'Edit Prompt':'Create New Prompt'}</h3>${aSHTML}<form id="prompt-form"><div><label for="prompt-title">Title:</label><input type="text" id="prompt-title" name="title" required value="${promptToEdit?promptToEdit.title:''}"></div><div><label for="prompt-content">Prompt Content:</label><textarea id="prompt-content" name="content" required>${aiSuggestion?aiSuggestion:(promptToEdit?promptToEdit.content:'')}</textarea></div><div><label for="prompt-tags">Tags (comma-separated):</label><input type="text" id="prompt-tags" name="tags" value="${promptToEdit&&promptToEdit.tags?promptToEdit.tags.join(', '):''}"></div><button type="submit">${promptToEdit?'Save Changes':'Create Prompt'}</button>${iBHTML}</form>`; const pF=document.getElementById('prompt-form'); if(pF)pF.addEventListener('submit',e=>{ e.preventDefault(); const t=document.getElementById('prompt-title').value.trim(); const c=document.getElementById('prompt-content').value.trim(); const tags=document.getElementById('prompt-tags').value.split(',').map(tg=>tg.trim()).filter(tg=>tg); const n=new Date().toISOString(); if(!t||!c){alert("Title and Content are required.");return;} if(promptToEdit){ const i=prompts.findIndex(pr=>pr.id===promptToEdit.id); if(i>-1){prompts[i]={...prompts[i],title:t,content:c,tags,lastModified:n};logAuditEvent("PROMPT_MODIFIED",promptToEdit.id);} }else{ const nP={id:Date.now(),title:t,content:c,tags,creationDate:n,lastModified:n,popularity:0,starred:false}; prompts.push(nP);logAuditEvent("PROMPT_CREATED",nP.id); } savePrompts();navigateTo('my-prompts');alert(promptToEdit?'Prompt updated!':'Prompt created!'); }); const iIFB=document.getElementById('improve-in-form-button'); if(iIFB&&promptToEdit)iIFB.addEventListener('click',async()=>await handleImprovePromptRequest(promptToEdit.id,true)); }
    function renderSearchPromptsView(){ dynamicContentArea.innerHTML=`<h3>Search Prompts</h3><input type="text" id="search-input" placeholder="Search by title, content, or tag...">`; const sI=document.getElementById('search-input'); if(sI){ sI.addEventListener('input',e=>{ const sT=e.target.value.toLowerCase(); const f=getFilteredPrompts(sT); renderPrompts(f); if(sortBySelect && sortBySelect.parentElement.style.display==='flex')sortPrompts(f); }); sI.focus(); } }
    function handlePromptAction(e){ if(!e.target.matches('button'))return; const b=e.target; const a=b.classList[0]; const pI=parseInt(b.dataset.id); const pIdx=prompts.findIndex(p=>p.id===pI); if(pIdx===-1)return; const pAO=prompts[pIdx]; let cDP = currentView === 'search' ? getFilteredPrompts(document.getElementById('search-input')?.value.toLowerCase() || '') : prompts; switch(a){ case 'view-edit':pAO.popularity=(pAO.popularity||0)+1;pAO.lastModified=new Date().toISOString();savePrompts();navigateTo('create');renderCreatePromptForm(pAO);break; case 'ai-improve':handleImprovePromptRequest(pI);break; case 'star':pAO.starred=!pAO.starred;pAO.lastModified=new Date().toISOString();logAuditEvent(pAO.starred?"PROMPT_STARRED":"PROMPT_UNSTARRED",pI);savePrompts();renderPrompts(cDP);if(sortBySelect && sortBySelect.parentElement.style.display==='flex')sortPrompts(cDP);break; case 'delete':if(confirm(`Are you sure you want to delete "${pAO.title}"?`)){const dT=pAO.title;prompts.splice(pIdx,1);logAuditEvent("PROMPT_DELETED",pI,dT);savePrompts();cDP=currentView==='search'?getFilteredPrompts(document.getElementById('search-input')?.value.toLowerCase()||''):prompts;renderPrompts(cDP);if(sortBySelect && sortBySelect.parentElement.style.display==='flex')sortPrompts(cDP);}break; } }
    async function handleImprovePromptRequest(promptId, updateInPlace = false) { const canUseAi = aiImproverSettings.enabled && !(appGlobalSettings.disableAiForNonAdmins && (!currentUser || currentUser.username !== 'admin')); if (!canUseAi) { alert("AI features are currently disabled."); return; } const service = aiImproverSettings.serviceType; let endpoint, model, apiKey, requestBody, headersConfig; const promptToImprove = prompts.find(p => p.id === promptId); if (!promptToImprove) { alert("Prompt not found."); return; } const improverMetaPromptOllama = `You are an AI assistant...User's original prompt:\n"${promptToImprove.content}"\nPlease provide an improved version...Return ONLY improved prompt text...`; showLoading("Improving with AI ("+service+")..."); const improveButton = document.querySelector(`.ai-improve[data-id="${promptId}"]`) || document.getElementById('improve-in-form-button'); if (improveButton) improveButton.disabled = true; try { if (service === 'ollama') { if (!aiImproverSettings.ollamaApiEndpoint || !aiImproverSettings.ollamaModelName) throw new Error("Ollama settings incomplete."); endpoint = aiImproverSettings.ollamaApiEndpoint; model = aiImproverSettings.ollamaModelName; headersConfig = {'Content-Type':'application/json'}; requestBody = JSON.stringify({ model, prompt: improverMetaPromptOllama, stream: false }); } else if (service === 'openai') { if (!aiImproverSettings.openaiApiKey || !aiImproverSettings.openaiModelName) throw new Error("OpenAI settings incomplete."); apiKey = aiImproverSettings.openaiApiKey; model = aiImproverSettings.openaiModelName; endpoint = 'https://api.openai.com/v1/chat/completions'; headersConfig = {'Content-Type':'application/json', 'Authorization':`Bearer ${apiKey}`}; requestBody = JSON.stringify({ model, messages:[ {"role":"system", "content": "You are an expert prompt engineer...Return only improved prompt text..."}, {"role":"user", "content": promptToImprove.content} ], temperature: 0.5 }); } else { throw new Error("Invalid AI service type."); } const response = await fetch(endpoint, { method: 'POST', headers: headersConfig, body: requestBody }); let responseBodyText = await response.text(); if (!response.ok) { let errorDetail = response.statusText; try { const errD = JSON.parse(responseBodyText); errorDetail = errD.error?.message || errD.error || JSON.stringify(errD); } catch (e) { errorDetail = responseBodyText || errorDetail; } throw new Error(`API Error (${response.status}): ${errorDetail}`); } const data = JSON.parse(responseBodyText); let improvedText = ""; if (service === 'ollama') improvedText = data.response ? data.response.trim() : "AI could not provide improvement."; else if (service === 'openai') improvedText = data.choices?.[0]?.message?.content?.trim() || "AI could not provide improvement."; logAuditEvent("PROMPT_AI_IMPROVED_REQUEST", promptId, promptToImprove.title, { modelUsed: model, serviceUsed: service }); if (updateInPlace && currentView === 'create') { renderCreatePromptForm(promptToImprove, improvedText); } else { navigateTo('create'); renderCreatePromptForm(promptToImprove, improvedText); } } catch (error) { console.error("AI Improve Error:", error); alert(`Failed to improve prompt: ${error.message}`); } finally { hideLoading(); if (improveButton) improveButton.disabled = false; } }
    function getFilteredPrompts(searchTerm){ if(!searchTerm||searchTerm.trim()==='')return[...prompts]; const sT = searchTerm.toLowerCase(); return prompts.filter(p=>p.title.toLowerCase().includes(sT)||p.content.toLowerCase().includes(sT)||p.tags.some(t=>t.toLowerCase().includes(sT)));}
    function sortPrompts(promptsToSortArg){ const sortVal=sortBySelect?sortBySelect.value:'date-desc'; let listToSort=promptsToSortArg?[...promptsToSortArg]:(currentView==='search'?getFilteredPrompts(document.getElementById('search-input')?.value.toLowerCase()||''):[...prompts]); switch(sortVal){ case 'date-desc':listToSort.sort((a,b)=>new Date(b.creationDate)-new Date(a.creationDate));break; case 'date-asc':listToSort.sort((a,b)=>new Date(a.creationDate)-new Date(b.creationDate));break; case 'tag':listToSort.sort((a,b)=>(a.tags[0]||'').localeCompare(b.tags[0]||''));break; case 'popularity':listToSort.sort((a,b)=>(b.popularity||0)-(a.popularity||0));break; case 'alpha-asc':listToSort.sort((a,b)=>a.title.localeCompare(b.title));break; case 'alpha-desc':listToSort.sort((a,b)=>b.title.localeCompare(a.title));break; } renderPrompts(listToSort);}

    // --- DASHBOARD FUNCTIONS --- 
    function renderDashboardHub(){ dynamicContentArea.innerHTML=`<div class="dashboard-hub-container"><div class="dashboard-card" data-dashboard="overview"><span class="dashboard-card-icon">📈</span><h3>Overview Dashboard</h3><p>Get a general summary of your prompt activity.</p></div><div class="dashboard-card" data-dashboard="usage-stats"><span class="dashboard-card-icon">📊</span><h3>Usage Statistics</h3><p>Analyze prompt popularity and tag distribution.</p></div></div>`; dynamicContentArea.querySelectorAll('.dashboard-card').forEach(c=>c.addEventListener('click',()=>loadSpecificDashboard(c.dataset.dashboard))); }
    function loadSpecificDashboard(type){ dynamicContentArea.innerHTML=''; promptListArea.style.display='none'; manageHeaderActions(false,false); switch(type){ case 'overview':mainContentTitle.textContent='Overview Dashboard';renderOverviewDashboard();break; case 'usage-stats':mainContentTitle.textContent='Usage Statistics Dashboard';renderUsageStatsDashboard();break; default:mainContentTitle.textContent='Dashboards Hub';renderDashboardHub(); } dynamicContentArea.style.display='block'; }
    function getTagFrequencies(){ const freqs={}; prompts.forEach(p=>{p.tags.forEach(t=>{freqs[t]=(freqs[t]||0)+1;});}); return Object.entries(freqs).sort(([,a],[,b])=>b-a); }
    function renderOverviewDashboard(){ const tP=prompts.length,sP=prompts.filter(p=>p.starred).length,uT=getTagFrequencies().length; const rMP=[...prompts].sort((a,b)=>new Date(b.lastModified)-new Date(a.lastModified)).slice(0,5); const pT=getTagFrequencies().slice(0,5); let rPHTML=rMP.map(p=>`<li><span class="prompt-title">${p.title}</span><span class="prompt-detail">(Modified: ${new Date(p.lastModified).toLocaleDateString()})</span></li>`).join('')||'<li>No recent activity.</li>'; let pTHTML=pT.map(([t,c])=>`<li><span class="tag">${t}</span><span class="prompt-detail">(${c} prompts)</span></li>`).join('')||'<li>No tags used yet.</li>'; dynamicContentArea.innerHTML=`<div class="dashboard-content"><div class="metrics-grid"><div class="metric-card"><span class="value">${tP}</span><span class="label">Total Prompts</span></div><div class="metric-card"><span class="value">${sP}</span><span class="label">Starred Prompts</span></div><div class="metric-card"><span class="value">${uT}</span><span class="label">Unique Tags</span></div></div><div class="dashboard-section"><h4>Recently Modified Prompts</h4><ul class="dashboard-list">${rPHTML}</ul></div><div class="dashboard-section"><h4>Most Popular Tags</h4><ul class="dashboard-list tag-list">${pTHTML}</ul></div></div>`; }
    function renderUsageStatsDashboard(){ const pBP=[...prompts].sort((a,b)=>(b.popularity||0)-(a.popularity||0)).slice(0,10); const tFs=getTagFrequencies(); const pNT=prompts.filter(p=>p.tags.length===0); let pPHTML=pBP.map(p=>`<li><span class="prompt-title">${p.title}</span><span class="prompt-detail">(Used: ${p.popularity||0} times)</span></li>`).join('')||'<li>No prompt usage data available.</li>'; let tFHTML=tFs.map(([t,c])=>`<li><span class="tag">${t}</span><span class="prompt-detail">(${c} prompts)</span></li>`).join('')||'<li>No tags found.</li>'; let nTHTML=pNT.map(p=>`<li><span class="prompt-title">${p.title}</span></li>`).join('')||(prompts.length>0?'<li>All prompts have tags!</li>':'<li>No prompts to analyze.</li>'); dynamicContentArea.innerHTML=`<div class="dashboard-content"><div class="dashboard-section"><h4>Top Prompts by Usage</h4><ul class="dashboard-list">${pPHTML}</ul></div><div class="dashboard-section"><h4>Tag Frequency</h4><ul class="dashboard-list tag-list">${tFHTML}</ul></div><div class="dashboard-section"><h4>Prompts Without Tags (${pNT.length})</h4><ul class="dashboard-list">${nTHTML}</ul></div></div>`; }

    // --- ADMIN PANEL FUNCTIONS --- 
    function renderAdminPanel(){ dynamicContentArea.innerHTML=`<h3>Admin Panel</h3><div id="admin-panel-nav"><button data-admin-view="global-settings" class="header-button">Global Settings</button><button data-admin-view="content-audit" class="header-button">Content Audit</button><button data-admin-view="audit-log" class="header-button">Audit Log</button></div><div id="admin-panel-view-area"><p>Select an admin function from above.</p></div>`; document.querySelectorAll('#admin-panel-nav button').forEach(b=>b.addEventListener('click',()=>renderAdminSubView(b.dataset.adminView))); renderAdminSubView('global-settings'); }
    function renderAdminSubView(viewName){ const vA=document.getElementById('admin-panel-view-area'); if(!vA)return; switch(viewName){ case 'global-settings': vA.innerHTML=`<div class="admin-section"><h5>Global AI Improver Settings</h5><div class="toggle-switch-container"><label for="admin-disable-ai">Disable AI Features for Non-Admins:</label><label class="switch"><input type="checkbox" id="admin-disable-ai" ${appGlobalSettings.disableAiForNonAdmins?'checked':''}> <span class="slider"></span></label></div><button id="save-global-toggles-btn" type="button">Save Global Toggles</button></div><div class="admin-section"><h5>Manage Default Prompts</h5><p>Edit the JSON below to change default prompts. Ensure valid JSON array format.</p><textarea id="default-prompts-editor">${JSON.stringify(appDefaultPrompts,null,2)}</textarea><button id="save-default-prompts-btn" type="button" style="margin-top:10px;">Save Default Prompts</button></div>`; document.getElementById('save-global-toggles-btn').addEventListener('click',()=>{ appGlobalSettings.disableAiForNonAdmins=document.getElementById('admin-disable-ai').checked; saveAppGlobalSettings();logAuditEvent("ADMIN_GLOBAL_SETTINGS_UPDATED",null,"Global Toggles");alert('Global toggles saved!'); }); document.getElementById('save-default-prompts-btn').addEventListener('click',()=>{ try{ const nD=JSON.parse(document.getElementById('default-prompts-editor').value); if(Array.isArray(nD)){appDefaultPrompts=nD;saveAppDefaultPrompts();logAuditEvent("ADMIN_DEFAULT_PROMPTS_UPDATED");alert('Default prompts saved!');} else{alert('Invalid format. Default prompts must be a JSON array.');} }catch(e){alert('Error parsing JSON for default prompts: '+e.message);} }); break; case 'content-audit': vA.innerHTML=`<div class="admin-section"><h5>Content Keyword Search</h5><p>Search all users' prompts for specific keywords (comma-separated).</p><input type="text" id="audit-keywords" placeholder="e.g., confidential, secret, inappropriate"><button id="run-audit-search-btn" type="button">Search Prompts</button><div id="content-audit-results" style="margin-top:15px;">Results will appear here...</div></div>`; document.getElementById('run-audit-search-btn').addEventListener('click',runContentAuditSearch); break; case 'audit-log': vA.innerHTML=`<div class="admin-section"><h5>System Audit Log</h5><div id="audit-log-viewer"></div></div>`; renderAuditLogViewer(document.getElementById('audit-log-viewer')); break; default:vA.innerHTML=`<p>Select an admin function.</p>`; } }
    function runContentAuditSearch(){ const kI=document.getElementById('audit-keywords'),rA=document.getElementById('content-audit-results'); if(!kI||!rA)return; const kws=kI.value.toLowerCase().split(',').map(k=>k.trim()).filter(k=>k); if(kws.length===0){rA.innerHTML='<p>Please enter keywords to search.</p>';return;} logAuditEvent("ADMIN_CONTENT_AUDIT_SEARCH",null,"Keyword Search",{keywords:kws.join(', ')}); rA.innerHTML='<p>Searching...</p>';let find=[]; for(let i=0;i<localStorage.length;i++){ const key=localStorage.key(i); if(key.startsWith('prompts_')){ const uN=key.substring('prompts_'.length); try{ const uP=JSON.parse(localStorage.getItem(key)); if(Array.isArray(uP)){ uP.forEach(p=>{ const cL=p.content.toLowerCase(),tL=p.title.toLowerCase();let mK=null; for(const kw of kws){if(cL.includes(kw)||tL.includes(kw)){mK=kw;break;}} if(mK)find.push({username:uN,promptId:p.id,promptTitle:p.title,matchedKeyword:mK,snippet:p.content.substring(0,100)+'...'}); }); } }catch(e){console.error(`Error parsing prompts for user ${uN}:`,e);} } } if(find.length>0)rA.innerHTML=find.map(f=>`<div class="audit-result-item"><p><strong>User:</strong> ${f.username}</p><p><strong>Prompt Title:</strong> ${f.promptTitle} (ID: ${f.promptId})</p><p><strong>Matched Keyword:</strong> <span class="tag">${f.matchedKeyword}</span></p><p><strong>Snippet:</strong> <span class="snippet">${f.snippet}</span></p></div>`).join(''); else rA.innerHTML='<p>No prompts found matching the specified keywords.</p>'; }
    function renderAuditLogViewer(cont){ if(!cont)return; if(auditLog.length===0){cont.innerHTML="<p>Audit log is empty.</p>";return;} cont.innerHTML=`<div class="audit-log-header">Displaying last ${auditLog.length} events (most recent first):</div> ${auditLog.map(e=>`<div class="audit-log-entry"><p><strong>Timestamp:</strong> ${new Date(e.timestamp).toLocaleString()}</p><p><strong>User:</strong> ${e.userId}</p><p><strong>Action:</strong> ${e.action}</p><p><strong>Prompt ID:</strong> ${e.promptId} ${e.promptTitleSnapshot&&e.promptTitleSnapshot!=='N/A'?`(Title: ${e.promptTitleSnapshot})`:''}</p>${Object.keys(e.details).length>0?`<p><strong>Details:</strong> ${JSON.stringify(e.details)}</p>`:''}</div>`).join('')}`; }

    // --- EVENT LISTENERS & INITIALIZATION ---
    if(loginButton)loginButton.addEventListener('click',handleLogin);
    if(usernameInput)usernameInput.addEventListener('keypress',e=>{if(e.key==='Enter'&&loginStep===1)handleLogin();});
    if(passwordInput)passwordInput.addEventListener('keypress',e=>{if(e.key==='Enter'&&loginStep===1)handleLogin();});
    if(mfaCodeInput)mfaCodeInput.addEventListener('keypress',e=>{if(e.key==='Enter'&&loginStep===2)handleLogin();});
    if(logoutButton)logoutButton.addEventListener('click',handleLogout);
    
    attachNavButtonListeners(); 
    
    if(promptListArea)promptListArea.addEventListener('click',handlePromptAction);
    if(sortBySelect)sortBySelect.addEventListener('change',()=>sortPrompts());

    const pL=document.getElementById('profile-link');if(pL)pL.addEventListener('click',e=>{e.preventDefault();navigateTo('profile');});
    const sL=document.getElementById('settings-link');if(sL)sL.addEventListener('click',e=>{e.preventDefault();navigateTo('settings');});
    
    checkSession(); 
});