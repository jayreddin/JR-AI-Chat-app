// DOM Elements
const chatHistory = document.getElementById('chat-history');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-btn');
const modelSelector = document.getElementById('model-selector');
const streamToggle = document.getElementById('stream-toggle');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const userInfo = document.getElementById('user-info');
const username = document.getElementById('username');
const txt2imgBtn = document.getElementById('txt2img-btn');
const img2txtBtn = document.getElementById('img2txt-btn');
const txt2speechBtn = document.getElementById('txt2speech-btn');
const uploadModal = document.getElementById('upload-modal');
const txt2imgModal = document.getElementById('txt2img-modal');
const renameModal = document.getElementById('rename-modal');
const settingsModal = document.getElementById('settings-modal');
const closeModalButtons = document.querySelectorAll('.close-modal');
const imageUpload = document.getElementById('image-upload');
const previewContainer = document.getElementById('preview-container');
const processImageBtn = document.getElementById('process-image-btn');
const imgPrompt = document.getElementById('img-prompt');
const generateImgBtn = document.getElementById('generate-img-btn');
const imgResult = document.getElementById('img-result');
const functionResult = document.getElementById('function-result');
const newChatBtn = document.getElementById('new-chat-btn');
// We removed the currentChatTitle element
// const currentChatTitle = document.getElementById('current-chat-title');
const exportChatBtn = document.getElementById('export-chat-btn');
const conversationName = document.getElementById('conversation-name');
const saveNameBtn = document.getElementById('save-name-btn');
const clearAllBtn = document.getElementById('clear-all-btn');
const themeToggle = document.getElementById('theme-toggle');
const settingsBtn = document.getElementById('settings-btn');
const saveSettingsBtn = document.getElementById('save-settings-btn');
const cancelSettingsBtn = document.getElementById('cancel-settings-btn');
const thinkingBox = document.getElementById('thinking-box');
const thinkingText = document.getElementById('thinking-text');
const minimizeThinkingBtn = document.getElementById('minimize-thinking-btn');
const micBtn = document.getElementById('mic-btn');
const thinkingIndicator = document.getElementById('thinking-indicator');
const thinkingModel = document.getElementById('thinking-model');

// App State
let isStreaming = false;
let currentUser = null;
let isProcessing = false;
let conversations = [];
let currentConversationId = null;
let recognition = null;
let isListening = false;

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    // Wait a short time to ensure Puter API has a chance to load
    setTimeout(() => {
        // Ensure puter object exists even if API fails to load
        if (typeof puter === 'undefined') {
            console.warn('Puter API not detected, creating fallback implementation');
            window.puter = {
                ai: {
                    chat: async function(message, options) {
                        console.log('Fallback chat called with:', message, options);
                        return {
                            message: {
                                content: "Puter API not available. This is a fallback response.",
                                role: "assistant"
                            }
                        };
                    },
                    txt2img: async function() { throw new Error("Image generation not available"); },
                    img2txt: async function() { throw new Error("Image text extraction not available"); },
                    txt2speech: async function() {
                        alert("Text to speech not available - Puter API could not be loaded");
                        throw new Error("Text to speech not available");
                    }
                },
                auth: {
                    // Support multiple possible auth method names
                    isLoggedIn: async function() { return false; },
                    getCurrentUser: async function() { return null; },
                    getUser: async function() { return null; },
                    login: async function() {
                        alert("Login not available - Puter API could not be loaded");
                        throw new Error("Puter API not available");
                    },
                    signIn: async function() {
                        alert("Login not available - Puter API could not be loaded");
                        throw new Error("Puter API not available");
                    },
                    logout: async function() { return true; },
                    signOut: async function() { return true; }
                },
                fs: {
                    mkdir: async function(path) {
                        console.log('Fallback mkdir called for path:', path);
                        return true;
                    },
                    write: async function(path, data) {
                        console.log('Fallback write called for path:', path);
                        // Store in localStorage as fallback
                        try {
                            localStorage.setItem('puter_fallback_' + path.replace(/\//g, '_'), data);
                        } catch (e) {
                            console.error('Error storing data in localStorage:', e);
                        }
                        return true;
                    },
                    read: async function(path) {
                        console.log('Fallback read called for path:', path);
                        // Try to read from localStorage
                        const data = localStorage.getItem('puter_fallback_' + path.replace(/\//g, '_'));
                        if (data) return data;
                        throw new Error("File not found");
                    }
                }
            };

            // Show a warning to the user
            const warningDiv = document.createElement('div');
            warningDiv.style.backgroundColor = '#fff3cd';
            warningDiv.style.color = '#856404';
            warningDiv.style.padding = '10px';
            warningDiv.style.margin = '10px 0';
            warningDiv.style.borderRadius = '4px';
            warningDiv.style.textAlign = 'center';
            warningDiv.innerHTML = 'Warning: Puter API failed to load. Some features may not work correctly. ' +
                                  'The app will run in offline mode with limited functionality.';
            document.body.insertBefore(warningDiv, document.body.firstChild);
        }

        // Initialize the app
        initApp();
    }, 500); // Wait 500ms to give the API a chance to load
});

function initApp() {
    console.log('Initializing app...');

    // Check if user is already logged in
    checkAuthStatus();

    // Load theme preference
    loadThemePreference();

    // Load conversations
    loadConversations();

    // Load knowledge base
    loadKnowledgeBase();

    // Load reasoning prompts
    loadReasoningPrompts();

    // Initialize agents
    initializeAgents();

    // Create a new conversation if none exists
    if (conversations.length === 0) {
        createNewConversation();
    } else {
        // Load the most recent conversation
        loadConversation(conversations[0].id);
    }

    // Add a welcome message regardless
    if (chatHistory.children.length === 0) {
        addAIMessage("Welcome to JR AI Chat! \n\nSelect a model from the dropdown above and start chatting. You can also try our other AI features like image generation, OCR, and text-to-speech by clicking the AI Features button.");
    }

    // Create tools and MCP info banner
    createInfoBanner();

    // Initialize dark mode
    initializeDarkMode();

    // Initialize text size slider
    initializeTextSizeSlider();

    // Initialize terminal calls
    initializeTerminalCalls();

    // Initialize compact mode
    initializeCompactMode();

    // Restore location coordinates if available
    restoreLocationCoordinates();

    // Event listeners
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keydown', handleEnterKey);
    messageInput.addEventListener('input', handleMessageInput);
    loginBtn.addEventListener('click', login);
    logoutBtn.addEventListener('click', logout);

    // Speech recognition
    micBtn.addEventListener('click', toggleSpeechRecognition);

    // Utility bar buttons
    document.getElementById('new-chat-btn').addEventListener('click', createNewConversation);
    document.getElementById('chat-history-btn').addEventListener('click', openChatHistoryModal);
    document.getElementById('image-upload-btn').addEventListener('click', openImageUploadModal);
    document.getElementById('file-upload-btn').addEventListener('click', openFileUploadModal);
    document.getElementById('knowledge-base-btn').addEventListener('click', openKnowledgeBaseModal);
    document.getElementById('reasoning-btn').addEventListener('click', openReasoningModal);
    document.getElementById('web-url-btn').addEventListener('click', openWebUrlModal);
    document.getElementById('tools-btn').addEventListener('click', openToolsModal);
    document.getElementById('mcp-btn').addEventListener('click', openMcpModal);
    document.getElementById('ai-features-btn').addEventListener('click', openAiFeaturesModal);
    document.getElementById('settings-btn').addEventListener('click', openSettingsModal);

    // Settings event listeners
    document.getElementById('dark-mode-toggle').addEventListener('change', toggleDarkMode);
    document.getElementById('text-size-slider').addEventListener('input', updateTextSize);
    document.getElementById('text-size-input').addEventListener('change', updateTextSizeFromInput);
    document.getElementById('terminal-calls-toggle').addEventListener('change', toggleTerminalCalls);
    document.getElementById('location-access-btn').addEventListener('click', requestLocationAccess);
    document.getElementById('compact-mode').addEventListener('change', toggleCompactMode);

    // Settings modal
    saveSettingsBtn.addEventListener('click', closeSettingsModal);
    cancelSettingsBtn.addEventListener('click', closeSettingsModal);

    // Feature buttons
    clearAllBtn.addEventListener('click', clearAllConversations);
    exportChatBtn.addEventListener('click', exportConversation);

    // AI Features modal buttons
    document.getElementById('stream-toggle-switch').addEventListener('change', toggleStreaming);
    document.getElementById('txt2img-feature-btn').addEventListener('click', openTxt2ImgModal);
    document.getElementById('img2txt-feature-btn').addEventListener('click', () => {
        // Open upload modal for OCR
        openUploadModal();
        // Set a flag to indicate we're doing OCR
        sessionStorage.setItem('upload-purpose', 'ocr');
    });
    document.getElementById('txt2speech-feature-btn').addEventListener('click', () => {
        // Get the last AI message
        const aiMessages = document.querySelectorAll('.ai-message');
        if (aiMessages.length > 0) {
            const lastAiMessage = aiMessages[aiMessages.length - 1];
            const text = lastAiMessage.textContent;
            textToSpeech(text);
        } else {
            addAIMessage("No messages to convert to speech.");
        }
    });
    document.getElementById('save-ai-features-btn').addEventListener('click', closeAiFeaturesModal);

    // Agents tab buttons
    document.getElementById('new-agent-btn').addEventListener('click', openNewAgentModal);
    document.getElementById('save-new-agent-btn').addEventListener('click', saveNewAgent);
    document.getElementById('cancel-new-agent-btn').addEventListener('click', () => {
        document.getElementById('new-agent-modal').style.display = 'none';
    });

    // Tab buttons in AI Features modal
    const aiFeaturesTabs = document.querySelectorAll('#ai-features-modal .tab-btn');
    aiFeaturesTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            aiFeaturesTabs.forEach(t => t.classList.remove('active'));

            // Add active class to clicked tab
            tab.classList.add('active');

            // Hide all tab content
            const tabContents = document.querySelectorAll('#ai-features-modal .tab-content');
            tabContents.forEach(content => content.classList.remove('active'));

            // Show content for active tab
            const tabId = tab.getAttribute('data-tab');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });

    // Utility modal save buttons
    document.getElementById('save-chat-history-btn').addEventListener('click', closeChatHistoryModal);
    document.getElementById('save-image-upload-btn').addEventListener('click', processUtilityImage);
    document.getElementById('save-file-upload-btn').addEventListener('click', processFileUpload);
    document.getElementById('save-knowledge-base-btn').addEventListener('click', saveKnowledgeBase);
    document.getElementById('save-reasoning-btn').addEventListener('click', saveReasoning);
    document.getElementById('save-web-url-btn').addEventListener('click', processWebUrl);
    document.getElementById('save-tools-btn').addEventListener('click', saveTools);
    document.getElementById('save-mcp-btn').addEventListener('click', saveMcp);

    // Knowledge Base buttons
    if (document.getElementById('upload-kb-file-btn')) {
        document.getElementById('upload-kb-file-btn').addEventListener('click', openKbFileUploadModal);
    }
    if (document.getElementById('input-kb-text-btn')) {
        document.getElementById('input-kb-text-btn').addEventListener('click', openKbTextInputModal);
    }

    // Web URL buttons
    if (document.getElementById('load-url-btn')) {
        document.getElementById('load-url-btn').addEventListener('click', loadWebUrl);
    }

    // Reasoning buttons
    if (document.getElementById('activate-reasoning')) {
        document.getElementById('activate-reasoning').addEventListener('click', activateReasoning);
    }
    if (document.getElementById('add-prompt-btn')) {
        document.getElementById('add-prompt-btn').addEventListener('click', openAddPromptModal);
    }

    // System prompt
    if (document.getElementById('save-system-prompt')) {
        document.getElementById('save-system-prompt').addEventListener('click', saveSystemPrompt);
    }

    // Thinking box
    minimizeThinkingBtn.addEventListener('click', minimizeThinking);

    // Modal event listeners
    closeModalButtons.forEach(btn => {
        btn.addEventListener('click', closeModals);
    });

    // Image upload preview
    imageUpload.addEventListener('change', previewImage);
    document.getElementById('utility-image-upload').addEventListener('change', previewUtilityImage);
    processImageBtn.addEventListener('click', processImage);

    // Text to image generation
    generateImgBtn.addEventListener('click', generateImage);

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModals();
        }
    });
}

// Load reasoning prompts from localStorage
function loadReasoningPrompts() {
    const savedPrompts = localStorage.getItem('reasoning-prompts');
    if (savedPrompts) {
        try {
            const parsedPrompts = JSON.parse(savedPrompts);
            if (Array.isArray(parsedPrompts) && parsedPrompts.length > 0) {
                reasoningPrompts = parsedPrompts;
                console.log(`Loaded ${reasoningPrompts.length} reasoning prompts`);
            }
        } catch (error) {
            console.error('Error loading reasoning prompts:', error);
        }
    }
}

// Authentication functions
function checkAuthStatus() {
    // Check if Puter API is available
    if (typeof puter === 'undefined' || !puter.auth) {
        console.error('Puter API not available for authentication');
        updateAuthUI(false);
        return;
    }

    console.log('Checking authentication status...');

    // Handle different API structures
    try {
        // First try signIn method (v2 API)
        if (typeof puter.auth.signIn === 'function') {
            console.log('Using v2 auth API methods');

            // In v2, we can't easily check if user is logged in without a token
            // So we'll try to get the token from localStorage
            const token = localStorage.getItem('puter_auth_token');

            if (token) {
                console.log('Found auth token in localStorage, assuming logged in');

                // Create a minimal user object since we can't get details
                // Use username from localStorage if available
                const username = localStorage.getItem('puter_username') || 'User';
                const user = { username: username };

                console.log('Using stored username:', username);
                currentUser = user;
                updateAuthUI(true);
            } else {
                console.log('No auth token found, assuming not logged in');
                updateAuthUI(false);
            }
        }
        // Try v1 API methods
        else if (typeof puter.auth.login === 'function' || typeof puter.auth.getCurrentUser === 'function') {
            console.log('Using v1 auth API methods');

            // Try to get the current user directly
            if (typeof puter.auth.getCurrentUser === 'function') {
                puter.auth.getCurrentUser()
                    .then(user => {
                        if (user) {
                            console.log('User info (v1):', user);
                            currentUser = user;
                            updateAuthUI(true);
                        } else {
                            console.log('No current user (v1)');
                            updateAuthUI(false);
                        }
                    })
                    .catch(error => {
                        console.error('Error getting current user (v1):', error);
                        updateAuthUI(false);
                    });
            }
            // Try the isLoggedIn method
            else if (typeof puter.auth.isLoggedIn === 'function') {
                puter.auth.isLoggedIn()
                    .then(isLoggedIn => {
                        console.log('Auth status (v1):', isLoggedIn ? 'Logged in' : 'Not logged in');

                        if (isLoggedIn) {
                            if (typeof puter.auth.getUser === 'function') {
                                return puter.auth.getUser();
                            } else {
                                return { username: 'User' };
                            }
                        } else {
                            return null;
                        }
                    })
                    .then(user => {
                        if (user) {
                            console.log('User info (v1):', user);
                            currentUser = user;
                            updateAuthUI(true);
                        } else {
                            updateAuthUI(false);
                        }
                    })
                    .catch(error => {
                        console.error('Auth check error (v1):', error);
                        updateAuthUI(false);
                    });
            }
            // If no auth methods are available, assume not logged in
            else {
                console.warn('No authentication methods available in Puter API v1');
                updateAuthUI(false);
            }
        }
        // If no auth methods are available at all
        else {
            console.warn('No authentication methods available in Puter API');
            updateAuthUI(false);
        }
    } catch (error) {
        console.error('Error checking auth status:', error);
        updateAuthUI(false);
    }
}

function login() {
    // Check if Puter API is available
    if (typeof puter === 'undefined' || !puter.auth) {
        console.error('Puter API not available for login');
        alert('Error: Puter API not available. Please check your connection and reload the page.');
        return;
    }

    console.log('Attempting to login...');

    try {
        // First try v2 API (signIn)
        if (typeof puter.auth.signIn === 'function') {
            console.log('Using signIn method (v2 API)');
            puter.auth.signIn()
                .then(user => {
                    console.log('SignIn successful:', user);

                    // Store auth info in localStorage for persistence
                    if (user.token) {
                        localStorage.setItem('puter_auth_token', user.token);
                    }
                    if (user.username) {
                        localStorage.setItem('puter_username', user.username);
                    }

                    currentUser = user;
                    updateAuthUI(true);

                    // Skip directory creation as it's causing errors
                    // ensureAppDirectory();

                    // Load user's conversations
                    loadConversations();
                })
                .catch(error => {
                    console.error('SignIn error:', error);
                    alert('Login failed: ' + (error.message || 'Unknown error'));
                });
        }
        // Try v1 API (login)
        else if (typeof puter.auth.login === 'function') {
            console.log('Using login method (v1 API)');
            puter.auth.login()
                .then(user => {
                    console.log('Login successful:', user);
                    currentUser = user;
                    updateAuthUI(true);

                    // Create directory for storing conversations
                    ensureAppDirectory();

                    // Load user's conversations
                    loadConversations();
                })
                .catch(error => {
                    console.error('Login error:', error);
                    alert('Login failed: ' + (error.message || 'Unknown error'));
                });
        } else {
            console.error('No login methods available in Puter API');
            alert('Error: Login function not available. The API might have changed or not fully loaded.');
        }
    } catch (error) {
        console.error('Error during login attempt:', error);
        alert('Login failed due to an unexpected error: ' + (error.message || 'Unknown error'));
    }
}

// Helper function to ensure the app directory exists
function ensureAppDirectory() {
    // Skip directory creation as it's causing 500 errors
    console.log('Skipping directory creation due to API limitations');

    // Instead, we'll rely on localStorage for storage
    // This is a workaround for the API limitations
    return Promise.resolve();
}

function logout() {
    // Check if Puter API is available
    if (typeof puter === 'undefined' || !puter.auth) {
        console.error('Puter API not available for logout');
        handleLogoutComplete();
        return;
    }

    console.log('Attempting to logout...');

    try {
        // First try v2 API (signOut)
        if (typeof puter.auth.signOut === 'function') {
            console.log('Using signOut method (v2 API)');
            puter.auth.signOut()
                .then(() => {
                    console.log('SignOut successful');
                    handleLogoutComplete();
                })
                .catch(error => {
                    console.error('SignOut error:', error);
                    // Still update UI to logged out state
                    handleLogoutComplete();
                });
        }
        // Try v1 API (logout)
        else if (typeof puter.auth.logout === 'function') {
            console.log('Using logout method (v1 API)');
            puter.auth.logout()
                .then(() => {
                    console.log('Logout successful');
                    handleLogoutComplete();
                })
                .catch(error => {
                    console.error('Logout error:', error);
                    // Still update UI to logged out state
                    handleLogoutComplete();
                });
        } else {
            console.warn('No logout method available in Puter API');
            // Just update UI to logged out state
            handleLogoutComplete();
        }
    } catch (error) {
        console.error('Error during logout attempt:', error);
        // Still update UI to logged out state
        handleLogoutComplete();
    }
}

// Helper function to handle logout completion
function handleLogoutComplete() {
    // Clear auth data from localStorage
    localStorage.removeItem('puter_auth_token');
    localStorage.removeItem('puter_username');

    currentUser = null;
    updateAuthUI(false);

    // Clear conversations from memory and reload from localStorage
    loadFromLocalStorage();

    // Create a new conversation if needed
    if (conversations.length === 0) {
        createNewConversation();
    } else {
        // Load the most recent conversation
        loadConversation(conversations[0].id);
    }
}

function updateAuthUI(isLoggedIn) {
    if (isLoggedIn && currentUser) {
        loginBtn.style.display = 'none';
        userInfo.style.display = 'flex';
        username.textContent = currentUser.username || 'User';
    } else {
        loginBtn.style.display = 'block';
        userInfo.style.display = 'none';
    }
}

// Chat functions
function sendMessage() {
    const message = messageInput.value.trim();
    if (message === '' || isProcessing) return;

    // Check for tool commands (starting with !)
    if (message.startsWith('!')) {
        processToolCommand(message);
        return;
    }

    // Check for agent commands (starting with /)
    if (message.startsWith('/')) {
        if (processAgentCommand(message)) {
            return;
        }
    }

    // Get any attachments
    const attachmentsArea = document.querySelector('.message-attachments');
    let attachments = [];

    if (attachmentsArea) {
        const attachmentElements = attachmentsArea.querySelectorAll('.chat-attachment');
        attachmentElements.forEach(attachment => {
            const img = attachment.querySelector('img');
            const fileIcon = attachment.querySelector('.file-icon');

            if (img) {
                attachments.push({
                    type: 'image',
                    src: img.src,
                    filename: img.dataset.filename,
                    isBase64: img.dataset.isBase64 === 'true'
                });
            } else if (fileIcon) {
                attachments.push({
                    type: 'file',
                    filename: fileIcon.dataset.filename
                });
            }
        });

        // Clear attachments area
        attachmentsArea.innerHTML = '';
    }

    // Check for knowledge base references
    const processedMessage = processKnowledgeBaseReferences(message);

    // Add user message to chat with attachments
    addUserMessage(message, attachments);

    // Clear input
    messageInput.value = '';

    // Process the message
    processUserMessage(processedMessage, attachments);
}

function processKnowledgeBaseReferences(message) {
    // Check if the message contains any knowledge base references (@something)
    const regex = /@(\w+)/g;
    let matches = message.match(regex);

    if (!matches) return message;

    // Remove duplicates
    matches = [...new Set(matches)];

    let processedMessage = message;

    // For each reference, add the content from the knowledge base
    matches.forEach(match => {
        const callingName = match.substring(1); // Remove the @ symbol
        const kbItem = knowledgeBase.find(item => item.calling === callingName);

        if (kbItem) {
            // Add the content to the end of the message
            processedMessage += `\n\n--- Knowledge Base: ${kbItem.title} ---\n${kbItem.content}`;
        }
    });

    return processedMessage;
}

function handleEnterKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
}

async function processUserMessage(message, attachments = []) {
    isProcessing = true;

    // Get selected model - use reasoning model if active
    let selectedModel;
    let systemPrompt = '';

    if (isReasoningActive && activeReasoningModel) {
        selectedModel = activeReasoningModel.value;
        systemPrompt = activeReasoningModel.prompt.text;
        console.log(`Using reasoning model: ${activeReasoningModel.name}`);
        console.log(`Using reasoning prompt: ${systemPrompt}`);

        // Show thinking in the thinking box
        showThinking(`Using ${activeReasoningModel.name} with prompt: ${systemPrompt.substring(0, 100)}...`);
    } else {
        selectedModel = modelSelector.value;
    }

    // Add attachment information to the message if any
    if (attachments && attachments.length > 0) {
        let attachmentInfo = "\n\n[Attachments:\n";

        attachments.forEach((attachment, index) => {
            if (attachment.type === 'image') {
                if (attachment.isBase64) {
                    // For base64 images, include the data directly
                    attachmentInfo += `Image ${index + 1}: ${attachment.filename} (Base64 data included)\n`;
                    // In a real implementation, you would append the base64 data to the message
                    // message += `\n\n[Image data: ${attachment.src}]`;
                } else {
                    attachmentInfo += `Image ${index + 1}: ${attachment.filename}\n`;
                }
            } else if (attachment.type === 'file') {
                attachmentInfo += `File ${index + 1}: ${attachment.filename}\n`;
            }
        });

        attachmentInfo += "]";
        message += attachmentInfo;
    }

    // Create a placeholder for AI response
    const aiMessageElement = document.createElement('div');
    aiMessageElement.className = 'message ai-message';

    // Check if Puter API is available
    if (typeof puter === 'undefined') {
        aiMessageElement.innerHTML = 'Error: Puter API not available. Please check your connection and reload the page.';
        chatHistory.appendChild(aiMessageElement);
        addTimestampToMessage(aiMessageElement);
        console.error('Puter API not available');
        isProcessing = false;
        scrollToBottom();
        return;
    }

    // Check if AI chat function is available
    if (!puter.ai || typeof puter.ai.chat !== 'function') {
        console.error('Puter AI chat function not available');

        // Use fallback response
        aiMessageElement.innerHTML = formatMessage("I'm sorry, but the AI service is currently unavailable. This could be due to API changes or connection issues. Please try again later.");
        chatHistory.appendChild(aiMessageElement);
        const timestamp = new Date().toISOString();
        addTimestampToMessage(aiMessageElement, timestamp);

        // Save fallback response to conversation
        if (currentConversationId) {
            const conversation = conversations.find(c => c.id === currentConversationId);
            if (conversation) {
                conversation.messages.push({
                    role: 'assistant',
                    content: "I'm sorry, but the AI service is currently unavailable. This could be due to API changes or connection issues. Please try again later.",
                    timestamp: timestamp
                });
                saveConversations();
            }
        }

        isProcessing = false;
        scrollToBottom();
        return;
    }

    // Prepare API options based on the model
    const apiOptions = {
        model: selectedModel
    };

    // Special handling for DeepSeek models
    const isDeepSeekModel = selectedModel === 'deepseek-chat' || selectedModel === 'deepseek-reasoner';

    // Add thinking parameter for DeepSeek models
    if (isDeepSeekModel) {
        apiOptions.thinking = true;

        // Use the simple message format for DeepSeek models
        return sendSimpleMessage(message, apiOptions);
    }

    // Add streaming if enabled
    if (isStreaming) {
        apiOptions.stream = true;
    }

    // Special handling for models that don't support system messages or certain features
    const basicModels = ['o1-mini', 'pixtral-large-latest', 'deepseek-chat', 'deepseek-reasoner'];
    const isBasicModel = basicModels.includes(selectedModel);

    if (!isBasicModel) {
        // Only add tools for models that support them
        apiOptions.tools = getWeatherTools();
    }

    // Special handling for o1-mini
    if (selectedModel === 'o1-mini') {
        // o1-mini requires specific parameters
        apiOptions.temperature = 0.7;
        apiOptions.top_p = 0.95;

        // Create a simple message format for o1-mini
        return sendSimpleMessage(message, apiOptions);
    }

    // Special handling for Pixtral Large
    if (selectedModel === 'pixtral-large-latest') {
        // Pixtral may need specific parameters
        apiOptions.temperature = 0.7;
        apiOptions.max_tokens = 4096;

        // Create a simple message format for Pixtral
        return sendSimpleMessage(message, apiOptions);
    }

    if (isStreaming) {
        aiMessageElement.innerHTML = '<span class="typing-indicator"></span>';
        chatHistory.appendChild(aiMessageElement);
        scrollToBottom();

        try {
            console.log('Sending streaming message with model:', selectedModel, 'options:', apiOptions);

            // Use streaming API
            const response = await puter.ai.chat(message, apiOptions);

            // Clear the typing indicator
            aiMessageElement.innerHTML = '';

            // Process the stream
            let fullResponse = '';
            let thinkingContent = '';

            for await (const part of response) {
                // Handle thinking for DeepSeek models
                if (part?.thinking && isDeepSeekModel) {
                    thinkingContent += part.thinking;
                    showThinking(thinkingContent);
                }

                if (part?.text) {
                    fullResponse += part.text;
                    aiMessageElement.innerHTML = formatMessage(fullResponse);
                    applySyntaxHighlighting(aiMessageElement);
                    scrollToBottom();
                }

                // Check for function calls
                if (part?.tool_calls && part.tool_calls.length > 0) {
                    handleFunctionCalls(part.tool_calls, message);
                }
            }

            // Add timestamp
            const timestamp = new Date().toISOString();
            addTimestampToMessage(aiMessageElement, timestamp);

            // Save to conversation
            if (currentConversationId) {
                const conversation = conversations.find(c => c.id === currentConversationId);
                if (conversation) {
                    conversation.messages.push({
                        role: 'assistant',
                        content: fullResponse,
                        timestamp: timestamp
                    });
                    saveConversations();
                }
            }

        } catch (error) {
            aiMessageElement.textContent = `Error: ${error.message}`;
            console.error('AI chat error (streaming):', error);
        }
    } else {
        // Show loading message
        aiMessageElement.textContent = 'Thinking...';
        chatHistory.appendChild(aiMessageElement);
        scrollToBottom();

        try {
            console.log('Sending non-streaming message with model:', selectedModel, 'options:', apiOptions);

            // Use regular API
            const response = await puter.ai.chat(message, apiOptions);

            console.log('Received response:', response);

            // Handle thinking for DeepSeek models
            if (response.thinking && isDeepSeekModel) {
                showThinking(response.thinking);
            }

            // Update message with response
            let responseContent = 'No response content';

            // Handle different response formats
            if (response.message) {
                if (typeof response.message.content === 'string') {
                    responseContent = response.message.content;
                } else if (Array.isArray(response.message.content)) {
                    // Handle array of content parts (Claude format)
                    responseContent = response.message.content
                        .filter(part => part.type === 'text')
                        .map(part => part.text)
                        .join('\n');
                } else if (response.message.content === null && response.message.tool_calls) {
                    responseContent = "I'm processing your request...";
                }
            } else if (response.toString && typeof response.toString === 'function') {
                // Some APIs provide a toString method
                responseContent = response.toString();
            } else if (response.text) {
                // Some APIs provide a text property
                responseContent = response.text;
            }

            aiMessageElement.innerHTML = formatMessage(responseContent);
            applySyntaxHighlighting(aiMessageElement);

            // Add timestamp
            const timestamp = new Date().toISOString();
            addTimestampToMessage(aiMessageElement, timestamp);

            // Save to conversation
            if (currentConversationId) {
                const conversation = conversations.find(c => c.id === currentConversationId);
                if (conversation) {
                    conversation.messages.push({
                        role: 'assistant',
                        content: responseContent,
                        timestamp: timestamp
                    });
                    saveConversations();
                }
            }

            // Check for function calls
            if (response.message?.tool_calls && response.message.tool_calls.length > 0) {
                handleFunctionCalls(response.message.tool_calls, message);
            }

        } catch (error) {
            aiMessageElement.textContent = `Error: ${error.message}`;
            console.error('AI chat error (non-streaming):', error);
        }
    }

    isProcessing = false;
    scrollToBottom();
}

function addUserMessage(message, attachments = []) {
    const messageElement = document.createElement('div');
    messageElement.className = 'message user-message';

    // Add message content
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = formatMessage(message);
    messageElement.appendChild(contentDiv);

    // Add attachments if any
    if (attachments && attachments.length > 0) {
        const attachmentsDiv = document.createElement('div');
        attachmentsDiv.className = 'message-attachments-display';

        attachments.forEach(attachment => {
            if (attachment.type === 'image') {
                const img = document.createElement('img');
                img.src = attachment.src;
                img.className = 'message-attachment-img';
                img.title = attachment.filename;
                attachmentsDiv.appendChild(img);
            } else if (attachment.type === 'file') {
                const fileDiv = document.createElement('div');
                fileDiv.className = 'message-attachment-file';

                // Choose icon based on file extension
                let icon = 'fa-file';
                const filename = attachment.filename;
                if (filename.endsWith('.pdf')) icon = 'fa-file-pdf';
                else if (filename.endsWith('.doc') || filename.endsWith('.docx')) icon = 'fa-file-word';
                else if (filename.endsWith('.xls') || filename.endsWith('.xlsx')) icon = 'fa-file-excel';
                else if (filename.endsWith('.txt')) icon = 'fa-file-alt';
                else if (filename.endsWith('.zip') || filename.endsWith('.rar')) icon = 'fa-file-archive';
                else if (filename.endsWith('.mp3') || filename.endsWith('.wav')) icon = 'fa-file-audio';
                else if (filename.endsWith('.mp4') || filename.endsWith('.avi')) icon = 'fa-file-video';
                else if (filename.endsWith('.js') || filename.endsWith('.py') || filename.endsWith('.html')) icon = 'fa-file-code';

                fileDiv.innerHTML = `<i class="fas ${icon}"></i> ${filename}`;
                attachmentsDiv.appendChild(fileDiv);
            }
        });

        messageElement.appendChild(attachmentsDiv);
    }

    // Add message action buttons
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'message-actions';

    // Edit button
    const editBtn = document.createElement('button');
    editBtn.className = 'message-action-btn';
    editBtn.innerHTML = '<i class="fas fa-edit"></i>';
    editBtn.title = 'Edit';
    editBtn.onclick = () => editMessage(messageElement, message);

    // Copy button
    const copyBtn = document.createElement('button');
    copyBtn.className = 'message-action-btn';
    copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
    copyBtn.title = 'Copy';
    copyBtn.onclick = () => copyMessageText(message);

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'message-action-btn';
    deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
    deleteBtn.title = 'Delete';
    deleteBtn.onclick = () => deleteMessage(messageElement);

    actionsDiv.appendChild(editBtn);
    actionsDiv.appendChild(copyBtn);
    actionsDiv.appendChild(deleteBtn);
    messageElement.appendChild(actionsDiv);

    // Add timestamp
    const timestamp = new Date().toISOString();
    addTimestampToMessage(messageElement, timestamp);

    chatHistory.appendChild(messageElement);
    scrollToBottom();

    // Save to current conversation
    if (currentConversationId) {
        const conversation = conversations.find(c => c.id === currentConversationId);
        if (conversation) {
            // Create message object with attachments
            const messageObj = {
                role: 'user',
                content: message,
                timestamp: timestamp
            };

            // Add attachments if any
            if (attachments && attachments.length > 0) {
                messageObj.attachments = attachments;
            }

            conversation.messages.push(messageObj);
            saveConversations();

            // Auto-generate conversation title if it's the first message
            if (conversation.messages.length === 1) {
                const title = message.substring(0, 30) + (message.length > 30 ? '...' : '');
                conversation.title = title;
                updateConversationsList();
                saveConversations();
            }
        }
    }
}

// Process tool commands (starting with !)
function processToolCommand(message) {
    // Extract the command and arguments
    const parts = message.split(' ');
    const command = parts[0].substring(1).toLowerCase(); // Remove the ! and convert to lowercase
    const args = parts.slice(1).join(' ');

    // Add user message to chat
    addUserMessage(message);

    // Clear input
    messageInput.value = '';

    // Process different commands
    switch (command) {
        case 'websearch':
            if (!args) {
                addAIMessage("Please provide a search query after !websearch");
                return;
            }
            addAIMessage(`Searching the web for: "${args}"...`);
            // In a real implementation, you would call a web search API here
            setTimeout(() => {
                addAIMessage(`Here are the search results for "${args}":\n\n1. Example result 1\n2. Example result 2\n3. Example result 3`);
            }, 1500);
            break;

        case 'imagerecognition':
            // Check if there's an image attachment
            const attachmentsArea = document.querySelector('.message-attachments');
            if (attachmentsArea && attachmentsArea.querySelectorAll('.chat-attachment img').length > 0) {
                addAIMessage("Analyzing the attached image...");
                // In a real implementation, you would call an image recognition API here
                setTimeout(() => {
                    addAIMessage("Image analysis complete. I can see: a person standing near a mountain landscape.");
                }, 2000);
                // Clear attachments
                attachmentsArea.innerHTML = '';
            } else {
                addAIMessage("Please attach an image for me to analyze.");
            }
            break;

        case 'weather':
            if (!args) {
                addAIMessage("Please provide a location after !weather");
                return;
            }
            addAIMessage(`Checking the weather in ${args}...`);
            // In a real implementation, you would call a weather API here
            setTimeout(() => {
                addAIMessage(`Weather in ${args}: 72°F, Partly Cloudy`);
            }, 1000);
            break;

        case 'translate':
            if (!args) {
                addAIMessage("Please provide text to translate after !translate");
                return;
            }
            addAIMessage(`Translating: "${args}"...`);
            // In a real implementation, you would call a translation API here
            setTimeout(() => {
                addAIMessage(`Translation: "Hola mundo" (Spanish)`);
            }, 1000);
            break;

        case 'help':
            addAIMessage("Available commands:\n\n" +
                "!websearch [query] - Search the web\n" +
                "!imagerecognition - Analyze an attached image\n" +
                "!weather [location] - Get weather information\n" +
                "!translate [text] - Translate text\n" +
                "!help - Show this help message");
            break;

        default:
            addAIMessage(`Unknown command: ${command}. Type !help to see available commands.`);
    }
}

function addAIMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.className = 'message ai-message';
    messageElement.innerHTML = formatMessage(message);

    // Add message action buttons
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'message-actions';

    // Copy button
    const copyBtn = document.createElement('button');
    copyBtn.className = 'message-action-btn';
    copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
    copyBtn.title = 'Copy';
    copyBtn.onclick = () => copyMessageText(message);

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'message-action-btn';
    deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
    deleteBtn.title = 'Delete';
    deleteBtn.onclick = () => deleteMessage(messageElement);

    // Regenerate button
    const redoBtn = document.createElement('button');
    redoBtn.className = 'message-action-btn';
    redoBtn.innerHTML = '<i class="fas fa-redo"></i>';
    redoBtn.title = 'Regenerate';
    redoBtn.onclick = () => regenerateResponse(messageElement);

    actionsDiv.appendChild(copyBtn);
    actionsDiv.appendChild(deleteBtn);
    actionsDiv.appendChild(redoBtn);
    messageElement.appendChild(actionsDiv);

    // Add timestamp
    const timestamp = new Date().toISOString();
    addTimestampToMessage(messageElement, timestamp);

    chatHistory.appendChild(messageElement);

    // Apply syntax highlighting to code blocks
    applySyntaxHighlighting(messageElement);

    scrollToBottom();

    // Save to current conversation
    if (currentConversationId) {
        const conversation = conversations.find(c => c.id === currentConversationId);
        if (conversation) {
            conversation.messages.push({
                role: 'assistant',
                content: message,
                timestamp: timestamp
            });
            saveConversations();
        }
    }
}

// Function to apply syntax highlighting to code blocks
function applySyntaxHighlighting(element) {
    if (typeof hljs !== 'undefined') {
        const codeBlocks = element.querySelectorAll('pre code');
        codeBlocks.forEach(block => {
            hljs.highlightElement(block);
        });
    }
}

// Message action functions
function editMessage(messageElement, originalText) {
    // Put the message text in the input box
    messageInput.value = originalText;
    messageInput.focus();

    // Remove the message element
    deleteMessage(messageElement);
}

function copyMessageText(text) {
    // Strip HTML tags to get plain text
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = text;
    const plainText = tempDiv.textContent || tempDiv.innerText || '';

    navigator.clipboard.writeText(plainText)
        .then(() => {
            // Show a brief notification
            const notification = document.createElement('div');
            notification.textContent = 'Copied to clipboard!';
            notification.style.position = 'fixed';
            notification.style.bottom = '20px';
            notification.style.left = '50%';
            notification.style.transform = 'translateX(-50%)';
            notification.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            notification.style.color = 'white';
            notification.style.padding = '10px 20px';
            notification.style.borderRadius = '5px';
            notification.style.zIndex = '1000';

            document.body.appendChild(notification);

            // Remove after 2 seconds
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 2000);
        })
        .catch(err => {
            console.error('Could not copy text: ', err);
        });
}

function deleteMessage(messageElement) {
    // Remove from DOM
    chatHistory.removeChild(messageElement);

    // Find the index of this message in the conversation
    if (currentConversationId) {
        const conversation = conversations.find(c => c.id === currentConversationId);
        if (conversation) {
            // Get all message elements
            const messageElements = chatHistory.querySelectorAll('.message');
            const index = Array.from(messageElements).indexOf(messageElement);

            if (index !== -1 && index < conversation.messages.length) {
                // Remove from conversation data
                conversation.messages.splice(index, 1);
                saveConversations();
            }
        }
    }
}

function regenerateResponse(messageElement) {
    // Find the previous user message
    if (currentConversationId) {
        const conversation = conversations.find(c => c.id === currentConversationId);
        if (conversation) {
            // Get all message elements
            const messageElements = chatHistory.querySelectorAll('.message');
            const index = Array.from(messageElements).indexOf(messageElement);

            if (index > 0) {
                // Get the last user message before this AI message
                let userMessageIndex = -1;
                for (let i = index - 1; i >= 0; i--) {
                    if (conversation.messages[i].role === 'user') {
                        userMessageIndex = i;
                        break;
                    }
                }

                if (userMessageIndex !== -1) {
                    const userMessage = conversation.messages[userMessageIndex].content;

                    // Delete the AI message
                    deleteMessage(messageElement);

                    // Regenerate the response
                    processUserMessage(userMessage);
                }
            }
        }
    }
}

function formatMessage(message) {
    // Check if message is a string
    if (typeof message !== 'string') {
        console.warn('formatMessage received non-string input:', message);
        // Handle different types of input
        if (message === null || message === undefined) {
            return '';
        }
        if (typeof message === 'object') {
            try {
                // Try to convert object to string
                return JSON.stringify(message);
            } catch (e) {
                return 'Unable to display message content';
            }
        }
        // Convert to string
        message = String(message);
    }

    // Use the marked library for markdown rendering if available
    if (typeof marked !== 'undefined') {
        // Configure marked options
        marked.setOptions({
            highlight: function(code, lang) {
                if (typeof hljs !== 'undefined' && lang && hljs.getLanguage(lang)) {
                    try {
                        return hljs.highlight(code, { language: lang }).value;
                    } catch (e) {
                        console.error('Highlight error:', e);
                    }
                }
                return code;
            },
            breaks: true,
            gfm: true,
            headerIds: false,
            mangle: false
        });

        try {
            // Use marked to render markdown
            const formattedMessage = marked.parse(message);

            // Apply additional safety measures
            return formattedMessage
                // Open links in new tab
                .replace(/<a /g, '<a target="_blank" rel="noopener noreferrer" ');
        } catch (e) {
            console.error('Markdown parsing error:', e);
            // Fallback to basic formatting
            return basicFormatMessage(message);
        }
    } else {
        // Fallback to basic formatting if marked is not available
        return basicFormatMessage(message);
    }
}

// Basic message formatting without the marked library
function basicFormatMessage(message) {
    let formattedMessage = message;

    // Convert code blocks with syntax highlighting
    formattedMessage = formattedMessage.replace(/```(\w+)?\n([\s\S]*?)```/g, function(match, language, code) {
        const lang = language || '';
        return `<pre><code class="${lang}">${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;
    });

    // Convert inline code
    formattedMessage = formattedMessage.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Convert headers
    formattedMessage = formattedMessage.replace(/^### (.*$)/gm, '<h3>$1</h3>');
    formattedMessage = formattedMessage.replace(/^## (.*$)/gm, '<h2>$1</h2>');
    formattedMessage = formattedMessage.replace(/^# (.*$)/gm, '<h1>$1</h1>');

    // Convert bold and italic
    formattedMessage = formattedMessage.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    formattedMessage = formattedMessage.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    // Convert lists
    formattedMessage = formattedMessage.replace(/^\s*\d+\.\s+(.*$)/gm, '<ol><li>$1</li></ol>');
    formattedMessage = formattedMessage.replace(/^\s*[\-\*]\s+(.*$)/gm, '<ul><li>$1</li></ul>');

    // Fix duplicate list tags
    formattedMessage = formattedMessage.replace(/<\/ol><ol>/g, '');
    formattedMessage = formattedMessage.replace(/<\/ul><ul>/g, '');

    // Convert blockquotes
    formattedMessage = formattedMessage.replace(/^>\s+(.*$)/gm, '<blockquote>$1</blockquote>');
    formattedMessage = formattedMessage.replace(/<\/blockquote><blockquote>/g, '<br>');

    // Convert URLs to links
    const urlRegex = /(https?:\/\/[^\s<]+)/g;
    formattedMessage = formattedMessage.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');

    // Convert newlines to <br>
    formattedMessage = formattedMessage.replace(/\n/g, '<br>');

    return formattedMessage;
}

function addTimestampToMessage(messageElement, isoTimestamp) {
    const timestamp = document.createElement('div');
    timestamp.className = 'message-time';

    // Use provided timestamp if available, otherwise use current time
    if (isoTimestamp) {
        try {
            const date = new Date(isoTimestamp);
            // Check if date is valid
            if (!isNaN(date.getTime())) {
                timestamp.textContent = date.toLocaleTimeString();
            } else {
                console.warn('Invalid timestamp format:', isoTimestamp);
                timestamp.textContent = new Date().toLocaleTimeString();
            }
        } catch (e) {
            console.warn('Error parsing timestamp:', e);
            timestamp.textContent = new Date().toLocaleTimeString();
        }
    } else {
        timestamp.textContent = new Date().toLocaleTimeString();
    }

    messageElement.appendChild(timestamp);
}

function scrollToBottom() {
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

function toggleStreaming() {
    isStreaming = !isStreaming;
    streamToggle.textContent = isStreaming ? 'Disable Streaming' : 'Enable Streaming';
    streamToggle.classList.toggle('active', isStreaming);
}

// Text to Image functions
function openTxt2ImgModal() {
    txt2imgModal.style.display = 'block';
}

async function generateImage() {
    const prompt = imgPrompt.value.trim();
    if (prompt === '' || isProcessing) return;
    
    isProcessing = true;
    generateImgBtn.textContent = 'Generating...';
    imgResult.innerHTML = '<p>Creating your image, please wait...</p>';
    
    try {
        const image = await puter.ai.txt2img(prompt);
        
        // Display the generated image
        imgResult.innerHTML = '';
        const img = document.createElement('img');
        img.src = image;
        imgResult.appendChild(img);
        
        // Add a button to send to chat
        const sendBtn = document.createElement('button');
        sendBtn.textContent = 'Send to Chat';
        sendBtn.style.marginTop = '10px';
        sendBtn.onclick = () => {
            addUserMessage(`I generated this image with the prompt: "${prompt}"`);
            
            const aiMessageElement = document.createElement('div');
            aiMessageElement.className = 'message ai-message';
            
            const imgElement = document.createElement('img');
            imgElement.src = image;
            imgElement.style.maxWidth = '100%';
            imgElement.style.borderRadius = '4px';
            imgElement.style.marginTop = '10px';
            
            aiMessageElement.innerHTML = 'Here\'s the image I generated:';
            aiMessageElement.appendChild(imgElement);
            
            // Add timestamp
            addTimestampToMessage(aiMessageElement);
            
            chatHistory.appendChild(aiMessageElement);
            scrollToBottom();
            
            closeModals();
        };
        imgResult.appendChild(sendBtn);
        
    } catch (error) {
        imgResult.innerHTML = `<p>Error: ${error.message}</p>`;
        console.error('Image generation error:', error);
    }
    
    generateImgBtn.textContent = 'Generate';
    isProcessing = false;
}

// Image to Text (OCR) functions
function openUploadModal() {
    uploadModal.style.display = 'block';
}

function previewImage(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(event) {
        previewContainer.innerHTML = '';
        const img = document.createElement('img');
        img.src = event.target.result;
        previewContainer.appendChild(img);
    };
    reader.readAsDataURL(file);
}

async function processImage() {
    const file = imageUpload.files[0];
    if (!file || isProcessing) return;
    
    isProcessing = true;
    processImageBtn.textContent = 'Processing...';
    
    try {
        const extractedText = await puter.ai.img2txt(file);
        
        // Send to chat
        addUserMessage('I uploaded an image for text extraction');
        addAIMessage(`I extracted the following text from your image:\n\n${extractedText}`);
        
        // Close modal
        closeModals();
        
    } catch (error) {
        previewContainer.innerHTML += `<p>Error: ${error.message}</p>`;
        console.error('OCR error:', error);
    }
    
    processImageBtn.textContent = 'Process Image';
    isProcessing = false;
}

// Text to Speech function
async function convertLastMessageToSpeech() {
    // Get the last AI message
    const aiMessages = document.querySelectorAll('.ai-message');
    if (aiMessages.length === 0 || isProcessing) return;
    
    const lastAIMessage = aiMessages[aiMessages.length - 1];
    const messageText = lastAIMessage.innerText.split('\n')[0]; // Get only the message part, not timestamp
    
    if (messageText.trim() === '' || isProcessing) return;
    
    isProcessing = true;
    txt2speechBtn.textContent = 'Converting...';
    
    try {
        const audio = await puter.ai.txt2speech(messageText);
        audio.play();
        
        // Visual feedback
        lastAIMessage.style.backgroundColor = '#e8f7f0';
        setTimeout(() => {
            lastAIMessage.style.backgroundColor = '';
        }, 2000);
        
    } catch (error) {
        console.error('Text to speech error:', error);
        addAIMessage(`Sorry, I couldn't convert that to speech: ${error.message}`);
    }
    
    txt2speechBtn.textContent = 'Text to Speech';
    isProcessing = false;
}

// Function to handle models that don't support system messages
async function sendSimpleMessage(message, apiOptions) {
    isProcessing = true;

    // Create a placeholder for AI response
    const aiMessageElement = document.createElement('div');
    aiMessageElement.className = 'message ai-message';

    // Show loading message
    aiMessageElement.textContent = 'Thinking...';
    chatHistory.appendChild(aiMessageElement);
    scrollToBottom();

    // If we're using a reasoning model, add the system prompt
    if (isReasoningActive && activeReasoningModel && activeReasoningModel.prompt) {
        // Add the reasoning prompt as a system message or prepend to the user message
        message = `${activeReasoningModel.prompt.text}\n\nUser query: ${message}`;
    }

    try {
        console.log('Sending simple message with options:', apiOptions);

        // Create messages array based on the model
        let messages = [];

        // Special format for o1-mini
        if (apiOptions.model === 'o1-mini') {
            // Format for o1-mini with content array
            messages = [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: message
                        }
                    ]
                }
            ];

            // Get conversation history for context (last 5 messages)
            if (currentConversationId) {
                const conversation = conversations.find(c => c.id === currentConversationId);
                if (conversation && conversation.messages.length > 0) {
                    // Get the last 5 messages, excluding the current one
                    const recentMessages = conversation.messages.slice(-5);

                    // Add them to the messages array with the correct format
                    for (const msg of recentMessages) {
                        if (msg.role === 'user') {
                            messages.unshift({
                                role: 'user',
                                content: [
                                    {
                                        type: 'text',
                                        text: msg.content
                                    }
                                ]
                            });
                        } else if (msg.role === 'assistant') {
                            messages.unshift({
                                role: 'assistant',
                                content: [
                                    {
                                        type: 'text',
                                        text: msg.content
                                    }
                                ]
                            });
                        }
                    }
                }
            }
        } else {
            // Standard format for other models
            messages = [
                { role: 'user', content: message }
            ];

            // Get conversation history for context (last 5 messages)
            if (currentConversationId) {
                const conversation = conversations.find(c => c.id === currentConversationId);
                if (conversation && conversation.messages.length > 0) {
                    // Get the last 5 messages, excluding the current one
                    const recentMessages = conversation.messages.slice(-5);

                    // Add them to the messages array
                    for (const msg of recentMessages) {
                        messages.unshift({
                            role: msg.role,
                            content: msg.content
                        });
                    }
                }
            }
        }

        // Use the API with the messages array
        const response = await puter.ai.chat(messages, apiOptions);

        console.log('Received response from simple message:', response);

        // Handle the response
        let responseContent = 'No response content';

        // Handle different response formats
        if (response.message) {
            if (typeof response.message.content === 'string') {
                responseContent = response.message.content;
            } else if (Array.isArray(response.message.content)) {
                // Handle array of content parts (Claude format)
                responseContent = response.message.content
                    .filter(part => part.type === 'text')
                    .map(part => part.text)
                    .join('\n');
            }
        } else if (response.toString && typeof response.toString === 'function') {
            responseContent = response.toString();
        } else if (response.text) {
            responseContent = response.text;
        }

        // Update the message element
        aiMessageElement.innerHTML = formatMessage(responseContent);
        applySyntaxHighlighting(aiMessageElement);

        // Add timestamp
        const timestamp = new Date().toISOString();
        addTimestampToMessage(aiMessageElement, timestamp);

        // Save to conversation
        if (currentConversationId) {
            const conversation = conversations.find(c => c.id === currentConversationId);
            if (conversation) {
                conversation.messages.push({
                    role: 'assistant',
                    content: responseContent,
                    timestamp: timestamp
                });
                saveConversations();
            }
        }
    } catch (error) {
        aiMessageElement.textContent = `Error: ${error.message}`;
        console.error('Simple message error:', error);
    }

    isProcessing = false;
    scrollToBottom();
}

// Function calling
function getWeatherTools() {
    return [{
        type: "function",
        function: {
            name: "get_weather",
            description: "Get current weather for a given location",
            parameters: {
                type: "object",
                properties: {
                    location: {
                        type: "string",
                        description: "City name e.g. Paris, London"
                    }
                },
                required: ["location"],
                additionalProperties: false
            },
            strict: true
        }
    }];
}

async function handleFunctionCalls(toolCalls, originalMessage) {
    for (const toolCall of toolCalls) {
        if (toolCall.function && toolCall.function.name === 'get_weather') {
            try {
                const args = JSON.parse(toolCall.function.arguments);
                const weatherData = getWeatherData(args.location);
                
                // Display in the function result area
                functionResult.innerHTML = `<strong>Weather in ${args.location}:</strong> ${weatherData}`;
                
                // Send the function result back to the AI
                const selectedModel = modelSelector.value;
                const response = await puter.ai.chat([
                    { role: "user", content: originalMessage },
                    { 
                        role: "assistant", 
                        content: null,
                        tool_calls: [toolCall]
                    },
                    { 
                        role: "tool",
                        tool_call_id: toolCall.id,
                        content: weatherData
                    }
                ], {
                    model: selectedModel
                });
                
                // Add the AI's response to the chat
                addAIMessage(response.message.content);
                
            } catch (error) {
                console.error('Function calling error:', error);
                functionResult.innerHTML = `<strong>Error:</strong> ${error.message}`;
            }
        }
    }
}

// Mock weather data function
function getWeatherData(location) {
    const mockWeatherData = {
        'Paris': '22°C, Partly Cloudy',
        'London': '18°C, Rainy',
        'New York': '25°C, Sunny',
        'Tokyo': '28°C, Clear',
        'Berlin': '20°C, Cloudy',
        'Sydney': '26°C, Sunny',
        'Moscow': '15°C, Snowy',
        'Dubai': '35°C, Hot and Clear',
        'Rome': '24°C, Sunny with light breeze',
        'Amsterdam': '19°C, Light rain'
    };
    
    return mockWeatherData[location] || `20°C, Weather data not available for ${location}`;
}

// Conversation management functions
function createNewConversation() {
    console.log('Creating new conversation...');

    // Generate a unique ID
    const id = 'conv_' + Date.now();

    // Create a new conversation object
    const newConversation = {
        id: id,
        title: 'New Conversation',
        messages: [],
        model: modelSelector.value,
        createdAt: new Date().toISOString()
    };

    // Add to conversations array (at the beginning)
    conversations.unshift(newConversation);

    // Update UI
    currentConversationId = id;
    // We removed the currentChatTitle element, so we don't need to update it
    chatHistory.innerHTML = '';

    // Add welcome message
    addAIMessage("# Welcome to JR AI Chat! \n\nSelect a model from the dropdown above and start chatting. You can also try our other AI features like image generation, OCR, and text-to-speech by clicking the ⚙️ Settings button.");

    // Update conversations list
    updateConversationsList();

    // Save to storage
    saveConversations();

    console.log('New conversation created with ID:', id);
    return id;
}

function loadConversation(id) {
    const conversation = conversations.find(c => c.id === id);
    if (!conversation) return;

    // Update current conversation
    currentConversationId = id;
    // We removed the currentChatTitle element, so we don't need to update it

    // Set the model
    if (conversation.model) {
        modelSelector.value = conversation.model;
    }

    // Clear chat history
    chatHistory.innerHTML = '';

    // Load messages
    conversation.messages.forEach(msg => {
        const messageElement = document.createElement('div');
        messageElement.className = msg.role === 'user' ? 'message user-message' : 'message ai-message';
        messageElement.innerHTML = formatMessage(msg.content);

        // Add message action buttons
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'message-actions';

        if (msg.role === 'user') {
            // Edit button
            const editBtn = document.createElement('button');
            editBtn.className = 'message-action-btn';
            editBtn.innerHTML = '<i class="fas fa-edit"></i>';
            editBtn.title = 'Edit';
            editBtn.onclick = () => editMessage(messageElement, msg.content);

            // Copy button
            const copyBtn = document.createElement('button');
            copyBtn.className = 'message-action-btn';
            copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
            copyBtn.title = 'Copy';
            copyBtn.onclick = () => copyMessageText(msg.content);

            // Delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'message-action-btn';
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            deleteBtn.title = 'Delete';
            deleteBtn.onclick = () => deleteMessage(messageElement);

            actionsDiv.appendChild(editBtn);
            actionsDiv.appendChild(copyBtn);
            actionsDiv.appendChild(deleteBtn);
        } else {
            // Copy button
            const copyBtn = document.createElement('button');
            copyBtn.className = 'message-action-btn';
            copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
            copyBtn.title = 'Copy';
            copyBtn.onclick = () => copyMessageText(msg.content);

            // Delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'message-action-btn';
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            deleteBtn.title = 'Delete';
            deleteBtn.onclick = () => deleteMessage(messageElement);

            // Regenerate button
            const redoBtn = document.createElement('button');
            redoBtn.className = 'message-action-btn';
            redoBtn.innerHTML = '<i class="fas fa-redo"></i>';
            redoBtn.title = 'Regenerate';
            redoBtn.onclick = () => regenerateResponse(messageElement);

            actionsDiv.appendChild(copyBtn);
            actionsDiv.appendChild(deleteBtn);
            actionsDiv.appendChild(redoBtn);
        }

        messageElement.appendChild(actionsDiv);

        // Add timestamp
        addTimestampToMessage(messageElement, msg.timestamp);

        chatHistory.appendChild(messageElement);

        // Apply syntax highlighting to AI messages
        if (msg.role === 'assistant') {
            applySyntaxHighlighting(messageElement);
        }
    });

    // If empty, add welcome message
    if (conversation.messages.length === 0) {
        addAIMessage("# Welcome to JR AI Chat! \n\nSelect a model from the dropdown above and start chatting. You can also try our other AI features like image generation, OCR, and text-to-speech by clicking the ⚙️ Settings button.");
    }

    // Update UI to show active conversation
    updateConversationsList();

    // Scroll to bottom
    scrollToBottom();
}

function updateConversationsList() {
    // This function is now primarily used for the chat history modal
    // We could add a dropdown menu for conversation selection in the future if needed

    // Populate the conversations list in the chat history modal if it's open
    const conversationsList = document.getElementById('conversations-list');
    if (conversationsList) {
        conversationsList.innerHTML = '';

        conversations.forEach(conv => {
            const item = document.createElement('div');
            item.className = 'conversation-item';
            if (conv.id === currentConversationId) {
                item.classList.add('active');
            }

            item.textContent = conv.title;
            item.addEventListener('click', () => loadConversation(conv.id));

            conversationsList.appendChild(item);
        });
    }
}

function openRenameModal() {
    if (!currentConversationId) return;

    const conversation = conversations.find(c => c.id === currentConversationId);
    if (conversation) {
        conversationName.value = conversation.title;
        renameModal.style.display = 'block';
    }
}

function renameConversation() {
    const newName = conversationName.value.trim();
    if (!newName || !currentConversationId) return;

    const conversation = conversations.find(c => c.id === currentConversationId);
    if (conversation) {
        conversation.title = newName;
        // We removed the currentChatTitle element, so we don't need to update it
        updateConversationsList();
        saveConversations();
        closeModals();
    }
}

function deleteConversation(id) {
    if (confirm('Are you sure you want to delete this conversation?')) {
        // Remove from array
        const index = conversations.findIndex(c => c.id === id);
        if (index !== -1) {
            conversations.splice(index, 1);
        }

        // If we deleted the current conversation, load another one
        if (id === currentConversationId) {
            if (conversations.length > 0) {
                loadConversation(conversations[0].id);
            } else {
                createNewConversation();
            }
        }

        // Update UI and save
        updateConversationsList();
        saveConversations();
    }
}

function deleteCurrentConversation() {
    if (currentConversationId) {
        deleteConversation(currentConversationId);
    }
}

function clearAllConversations() {
    if (confirm('Are you sure you want to delete all conversations? This cannot be undone.')) {
        conversations = [];
        saveConversations();
        createNewConversation();
    }
}

function exportConversation() {
    if (!currentConversationId) return;

    const conversation = conversations.find(c => c.id === currentConversationId);
    if (!conversation) return;

    // Format the conversation as text
    let exportText = `# ${conversation.title}\n`;
    exportText += `# Model: ${conversation.model || 'Not specified'}\n`;
    exportText += `# Exported: ${new Date().toLocaleString()}\n\n`;

    conversation.messages.forEach(msg => {
        const role = msg.role === 'user' ? 'You' : 'AI';
        const time = msg.timestamp ? new Date(msg.timestamp).toLocaleString() : '';
        exportText += `## ${role} (${time}):\n${msg.content}\n\n`;
    });

    // Create a download link
    const blob = new Blob([exportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${conversation.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_export.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Storage functions
function saveConversations() {
    // Save to localStorage
    localStorage.setItem('puter_ai_chat_conversations', JSON.stringify(conversations));
    console.log('Conversations saved to localStorage');

    // Due to API limitations, we'll primarily use localStorage for storage
    // This is a workaround for the file system API issues

    // If we want to try Puter storage in the future, we can uncomment this code
    /*
    // If user is logged in, try to save to Puter storage
    if (currentUser && currentUser.username) {
        // Make sure the directory exists first
        if (puter.fs && typeof puter.fs.mkdir === 'function') {
            puter.fs.mkdir('/apps/ai-chat')
                .then(() => {
                    // Now try to write the file
                    return puter.fs.write(`/apps/ai-chat/conversations_${currentUser.username}.json`, JSON.stringify(conversations));
                })
                .then(() => {
                    console.log('Conversations saved to Puter storage');
                })
                .catch(error => {
                    console.error('Error saving conversations to Puter:', error);
                });
        } else {
            console.warn('puter.fs.mkdir not available, using localStorage only');
        }
    }
    */
}

function loadConversations() {
    // Always load from localStorage first
    loadFromLocalStorage();

    // Due to API limitations, we'll primarily use localStorage for storage
    // This is a workaround for the file system API issues
    console.log('Using localStorage for conversation storage due to API limitations');

    // If we want to try Puter storage in the future, we can uncomment this code
    /*
    // If user is logged in, try to load from Puter storage
    if (currentUser && currentUser.username && puter.fs && typeof puter.fs.read === 'function') {
        console.log('Attempting to load conversations from Puter storage');

        puter.fs.read(`/apps/ai-chat/conversations_${currentUser.username}.json`)
            .then(data => {
                if (!data) {
                    console.log('No data found in Puter storage');
                    return;
                }

                try {
                    const puterConversations = JSON.parse(data);
                    if (Array.isArray(puterConversations) && puterConversations.length > 0) {
                        console.log(`Loaded ${puterConversations.length} conversations from Puter storage`);
                        conversations = puterConversations;
                        updateConversationsList();

                        // If we have a current conversation, reload it
                        if (currentConversationId) {
                            const conversation = conversations.find(c => c.id === currentConversationId);
                            if (conversation) {
                                loadConversation(currentConversationId);
                            } else if (conversations.length > 0) {
                                loadConversation(conversations[0].id);
                            }
                        }
                    }
                } catch (e) {
                    console.error('Error parsing conversations from Puter storage:', e);
                }
            })
            .catch(error => {
                console.log('Could not load conversations from Puter storage:', error);
            });
    } else {
        console.log('User not logged in or Puter fs API not available, using localStorage only');
    }
    */
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem('puter_ai_chat_conversations');
    if (saved) {
        try {
            conversations = JSON.parse(saved);
            updateConversationsList();
        } catch (e) {
            console.error('Error parsing conversations from localStorage:', e);
            conversations = [];
        }
    } else {
        conversations = [];
    }
}

// Theme functions
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('puter_ai_chat_dark_mode', isDarkMode ? 'true' : 'false');
}

function loadThemePreference() {
    const darkMode = localStorage.getItem('puter_ai_chat_dark_mode');
    if (darkMode === 'true') {
        document.body.classList.add('dark-mode');
    }
}

// Code formatting function
function formatAndInsertCode() {
    const code = codeInput.value.trim();
    const language = languageSelector.value;

    if (!code) return;

    // Format the code with highlight.js
    const formattedCode = `<pre><code class="language-${language}">${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;

    // Add to chat as user message
    addUserMessage(`I'm sharing some ${language} code:`);

    // Create a special message for the code
    const codeMessage = document.createElement('div');
    codeMessage.className = 'message ai-message';
    codeMessage.innerHTML = `Here's the formatted code:<br>${formattedCode}`;

    // Add timestamp
    const timestamp = new Date().toISOString();
    addTimestampToMessage(codeMessage, timestamp);

    // Add to chat history
    chatHistory.appendChild(codeMessage);

    // Apply syntax highlighting
    document.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block);
    });

    // Save to conversation
    if (currentConversationId) {
        const conversation = conversations.find(c => c.id === currentConversationId);
        if (conversation) {
            conversation.messages.push({
                role: 'assistant',
                content: `Here's the formatted code:<br>${formattedCode}`,
                timestamp: timestamp
            });
            saveConversations();
        }
    }

    // Close modal and clear input
    closeModals();
    codeInput.value = '';
    scrollToBottom();
}

// Utility functions
// Utility bar modal functions
function openChatHistoryModal() {
    document.getElementById('chat-history-modal').style.display = 'block';

    // Populate the conversations list
    const conversationsList = document.getElementById('conversations-list');
    conversationsList.innerHTML = '';

    conversations.forEach(conv => {
        const item = document.createElement('div');
        item.className = 'conversation-item';
        if (conv.id === currentConversationId) {
            item.classList.add('active');
        }

        item.textContent = conv.title;
        item.addEventListener('click', () => loadConversation(conv.id));

        conversationsList.appendChild(item);
    });
}

function closeChatHistoryModal() {
    document.getElementById('chat-history-modal').style.display = 'none';
}

function openImageUploadModal() {
    document.getElementById('image-upload-modal').style.display = 'block';
}

function previewUtilityImage(e) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const previewContainer = document.getElementById('utility-preview-container');
    previewContainer.innerHTML = '';

    // Process each file
    Array.from(files).forEach((file, index) => {
        // Create thumbnail container
        const thumbnail = document.createElement('div');
        thumbnail.className = 'image-thumbnail uploading';
        thumbnail.dataset.filename = file.name;

        // Create image preview
        const img = document.createElement('img');

        // Create progress bar
        const progressContainer = document.createElement('div');
        progressContainer.className = 'image-progress';

        const progressBar = document.createElement('div');
        progressBar.className = 'image-progress-bar';
        progressContainer.appendChild(progressBar);

        // Create file name label
        const nameLabel = document.createElement('div');
        nameLabel.className = 'image-name';
        nameLabel.textContent = file.name;

        // Create remove button
        const removeBtn = document.createElement('div');
        removeBtn.className = 'image-remove';
        removeBtn.innerHTML = '&times;';
        removeBtn.addEventListener('click', () => {
            thumbnail.remove();
        });

        // Add elements to thumbnail
        thumbnail.appendChild(img);
        thumbnail.appendChild(nameLabel);
        thumbnail.appendChild(removeBtn);
        thumbnail.appendChild(progressContainer);

        // Add thumbnail to container
        previewContainer.appendChild(thumbnail);

        // Read the file
        const reader = new FileReader();
        reader.onload = function(event) {
            img.src = event.target.result;

            // Simulate upload progress
            simulateProgress(progressBar, () => {
                thumbnail.classList.remove('uploading');
            });
        };
        reader.readAsDataURL(file);
    });
}

function processUtilityImage() {
    const previewContainer = document.getElementById('utility-preview-container');
    const thumbnails = previewContainer.querySelectorAll('.image-thumbnail');
    const useBase64 = document.getElementById('base64-toggle').checked;

    if (thumbnails.length === 0) {
        alert('Please upload at least one image');
        return;
    }

    // Create message input attachments area if it doesn't exist
    let attachmentsArea = document.querySelector('.message-attachments');
    if (!attachmentsArea) {
        attachmentsArea = document.createElement('div');
        attachmentsArea.className = 'message-attachments';
        messageInput.parentNode.insertBefore(attachmentsArea, messageInput);
    }

    // Add each image as an attachment
    thumbnails.forEach(thumbnail => {
        const img = thumbnail.querySelector('img');
        const filename = thumbnail.dataset.filename;

        // Create attachment element
        const attachment = document.createElement('div');
        attachment.className = 'chat-attachment';

        // Create thumbnail
        const thumbImg = document.createElement('img');
        thumbImg.src = img.src;
        thumbImg.dataset.filename = filename;
        thumbImg.dataset.isBase64 = useBase64;

        // Create remove button
        const removeBtn = document.createElement('div');
        removeBtn.className = 'attachment-remove';
        removeBtn.innerHTML = '&times;';
        removeBtn.addEventListener('click', () => {
            attachment.remove();
        });

        // Add elements to attachment
        attachment.appendChild(thumbImg);
        attachment.appendChild(removeBtn);

        // Add attachment to area
        attachmentsArea.appendChild(attachment);
    });

    // Add a message about the images
    if (thumbnails.length === 1) {
        messageInput.value += `[Attached image: ${thumbnails[0].dataset.filename}] `;
    } else {
        messageInput.value += `[Attached ${thumbnails.length} images] `;
    }

    closeModals();
}

function openFileUploadModal() {
    document.getElementById('file-upload-modal').style.display = 'block';

    // Clear previous thumbnails
    const thumbnailsContainer = document.getElementById('file-thumbnails');
    if (thumbnailsContainer) {
        thumbnailsContainer.innerHTML = '';
    }

    // Set up file input change event
    const fileInput = document.getElementById('file-upload');
    fileInput.addEventListener('change', previewFiles);
}

function previewFiles(e) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const thumbnailsContainer = document.getElementById('file-thumbnails');
    thumbnailsContainer.innerHTML = '';

    // Process each file
    Array.from(files).forEach((file, index) => {
        // Create thumbnail container
        const thumbnail = document.createElement('div');
        thumbnail.className = 'file-thumbnail uploading';
        thumbnail.dataset.filename = file.name;

        // Create file icon or preview
        let preview;
        if (file.type.startsWith('image/')) {
            preview = document.createElement('img');
            const reader = new FileReader();
            reader.onload = function(event) {
                preview.src = event.target.result;
            };
            reader.readAsDataURL(file);
        } else {
            preview = document.createElement('div');
            preview.className = 'file-icon';

            // Choose icon based on file type
            let icon = 'fa-file';
            if (file.type.includes('pdf')) icon = 'fa-file-pdf';
            else if (file.type.includes('word') || file.name.endsWith('.doc') || file.name.endsWith('.docx')) icon = 'fa-file-word';
            else if (file.type.includes('excel') || file.name.endsWith('.xls') || file.name.endsWith('.xlsx')) icon = 'fa-file-excel';
            else if (file.type.includes('text') || file.name.endsWith('.txt')) icon = 'fa-file-alt';
            else if (file.type.includes('zip') || file.name.endsWith('.zip') || file.name.endsWith('.rar')) icon = 'fa-file-archive';
            else if (file.type.includes('audio')) icon = 'fa-file-audio';
            else if (file.type.includes('video')) icon = 'fa-file-video';
            else if (file.type.includes('code') || file.name.endsWith('.js') || file.name.endsWith('.py') || file.name.endsWith('.html')) icon = 'fa-file-code';

            preview.innerHTML = `<i class="fas ${icon}"></i>`;
        }

        // Create progress bar
        const progressContainer = document.createElement('div');
        progressContainer.className = 'file-progress';

        const progressBar = document.createElement('div');
        progressBar.className = 'file-progress-bar';
        progressContainer.appendChild(progressBar);

        // Create file name label
        const nameLabel = document.createElement('div');
        nameLabel.className = 'file-name';
        nameLabel.textContent = file.name;

        // Create remove button
        const removeBtn = document.createElement('div');
        removeBtn.className = 'file-remove';
        removeBtn.innerHTML = '&times;';
        removeBtn.addEventListener('click', () => {
            thumbnail.remove();
        });

        // Add elements to thumbnail
        thumbnail.appendChild(preview);
        thumbnail.appendChild(nameLabel);
        thumbnail.appendChild(removeBtn);
        thumbnail.appendChild(progressContainer);

        // Add thumbnail to container
        thumbnailsContainer.appendChild(thumbnail);

        // Simulate upload progress
        simulateProgress(progressBar, () => {
            thumbnail.classList.remove('uploading');
        });
    });
}

function simulateProgress(progressBar, callback) {
    let width = 0;
    const interval = setInterval(() => {
        if (width >= 100) {
            clearInterval(interval);
            if (callback) callback();
        } else {
            width += Math.random() * 10;
            if (width > 100) width = 100;
            progressBar.style.width = width + '%';
        }
    }, 200);
}

function processFileUpload() {
    const thumbnailsContainer = document.getElementById('file-thumbnails');
    const thumbnails = thumbnailsContainer.querySelectorAll('.file-thumbnail');

    if (thumbnails.length === 0) {
        alert('Please upload at least one file');
        return;
    }

    // Create message input attachments area if it doesn't exist
    let attachmentsArea = document.querySelector('.message-attachments');
    if (!attachmentsArea) {
        attachmentsArea = document.createElement('div');
        attachmentsArea.className = 'message-attachments';
        messageInput.parentNode.insertBefore(attachmentsArea, messageInput);
    }

    // Add each file as an attachment
    thumbnails.forEach(thumbnail => {
        const filename = thumbnail.dataset.filename;

        // Create attachment element
        const attachment = document.createElement('div');
        attachment.className = 'chat-attachment';

        // Create file icon
        const fileIcon = document.createElement('div');
        fileIcon.className = 'file-icon';

        // Choose icon based on file extension
        let icon = 'fa-file';
        if (filename.endsWith('.pdf')) icon = 'fa-file-pdf';
        else if (filename.endsWith('.doc') || filename.endsWith('.docx')) icon = 'fa-file-word';
        else if (filename.endsWith('.xls') || filename.endsWith('.xlsx')) icon = 'fa-file-excel';
        else if (filename.endsWith('.txt')) icon = 'fa-file-alt';
        else if (filename.endsWith('.zip') || filename.endsWith('.rar')) icon = 'fa-file-archive';
        else if (filename.endsWith('.mp3') || filename.endsWith('.wav')) icon = 'fa-file-audio';
        else if (filename.endsWith('.mp4') || filename.endsWith('.avi')) icon = 'fa-file-video';
        else if (filename.endsWith('.js') || filename.endsWith('.py') || filename.endsWith('.html')) icon = 'fa-file-code';

        fileIcon.innerHTML = `<i class="fas ${icon}"></i>`;
        fileIcon.dataset.filename = filename;

        // Create remove button
        const removeBtn = document.createElement('div');
        removeBtn.className = 'attachment-remove';
        removeBtn.innerHTML = '&times;';
        removeBtn.addEventListener('click', () => {
            attachment.remove();
        });

        // Add elements to attachment
        attachment.appendChild(fileIcon);
        attachment.appendChild(removeBtn);

        // Add attachment to area
        attachmentsArea.appendChild(attachment);
    });

    // Add a message about the files
    if (thumbnails.length === 1) {
        messageInput.value += `[Attached file: ${thumbnails[0].dataset.filename}] `;
    } else {
        messageInput.value += `[Attached ${thumbnails.length} files] `;
    }

    closeModals();
}

function openKnowledgeBaseModal() {
    document.getElementById('knowledge-base-modal').style.display = 'block';
}

function saveKnowledgeBase() {
    // Placeholder for knowledge base functionality
    closeModals();
}

function openReasoningModal() {
    document.getElementById('reasoning-modal').style.display = 'block';

    // Update the reasoning prompts list
    updateReasoningPromptsList();

    // Set up search functionality
    const searchInput = document.getElementById('prompt-search');
    if (searchInput) {
        searchInput.addEventListener('input', searchReasoningPrompts);
        searchInput.value = ''; // Clear search on open
    }

    // Set up fetch prompts button
    const fetchPromptsBtn = document.getElementById('fetch-prompts-btn');
    if (fetchPromptsBtn) {
        fetchPromptsBtn.addEventListener('click', fetchReasoningPrompts);
    }

    // Set up edit buttons
    setupEditPromptButtons();
}

function saveReasoning() {
    // Placeholder for reasoning settings
    closeModals();
}

function openWebUrlModal() {
    document.getElementById('web-url-modal').style.display = 'block';
}

function processWebUrl() {
    const urlInput = document.getElementById('web-url-input');
    const url = urlInput.value.trim();
    if (!url) return;

    // Add user message about the URL
    addUserMessage(`I want to analyze this URL: ${url}`);

    // For now, just acknowledge the URL
    addAIMessage(`I'll analyze the content at ${url} for you. What specific information are you looking for?`);

    closeModals();
}

// Tools database from RapidAPI Hub
const toolsDatabase = [
    {
        name: "Weather",
        description: "Get current weather for any location",
        category: "Information",
        endpoint: "weather-api",
        isActive: true
    },
    {
        name: "Calculator",
        description: "Perform complex calculations",
        category: "Utility",
        endpoint: "calculator-api",
        isActive: false
    },
    {
        name: "Web Search",
        description: "Search the web for information",
        category: "Information",
        endpoint: "search-api",
        isActive: false
    },
    {
        name: "Calendar",
        description: "Manage calendar events",
        category: "Productivity",
        endpoint: "calendar-api",
        isActive: false
    },
    {
        name: "Translation",
        description: "Translate text between languages",
        category: "Language",
        endpoint: "translation-api",
        isActive: false
    },
    {
        name: "Stock Prices",
        description: "Get real-time stock market data",
        category: "Finance",
        endpoint: "stocks-api",
        isActive: false
    },
    {
        name: "News",
        description: "Get the latest news articles",
        category: "Information",
        endpoint: "news-api",
        isActive: false
    },
    {
        name: "Image Recognition",
        description: "Identify objects in images",
        category: "AI",
        endpoint: "image-recognition-api",
        isActive: false
    },
    {
        name: "Text Analysis",
        description: "Analyze sentiment and entities in text",
        category: "AI",
        endpoint: "text-analysis-api",
        isActive: false
    },
    {
        name: "Maps",
        description: "Get directions and location information",
        category: "Navigation",
        endpoint: "maps-api",
        isActive: false
    }
];

function openToolsModal() {
    const modal = document.getElementById('tools-modal');
    modal.style.display = 'block';

    // Populate the tools list
    populateToolsList();

    // Set up search functionality
    const searchInput = document.getElementById('tools-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', searchTools);
        searchInput.value = ''; // Clear search on open
    }

    // Set up install tool button
    const installToolBtn = document.getElementById('install-tool-btn');
    if (installToolBtn) {
        installToolBtn.addEventListener('click', openInstallToolModal);
    }
}

function populateToolsList() {
    const toolsList = document.querySelector('.tools-list');
    if (!toolsList) return;

    toolsList.innerHTML = '';

    toolsDatabase.forEach(tool => {
        const item = document.createElement('div');
        item.className = 'tool-item';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `tool-${tool.endpoint}`;
        checkbox.checked = tool.isActive;
        checkbox.addEventListener('change', () => {
            tool.isActive = checkbox.checked;
        });

        const label = document.createElement('label');
        label.htmlFor = checkbox.id;
        label.textContent = tool.name;

        const description = document.createElement('span');
        description.className = 'tool-description';
        description.textContent = tool.description;

        const category = document.createElement('span');
        category.className = 'tool-category';
        category.textContent = tool.category;

        item.appendChild(checkbox);
        item.appendChild(label);
        item.appendChild(description);
        item.appendChild(category);

        toolsList.appendChild(item);
    });
}

function searchTools() {
    const searchInput = document.getElementById('tools-search-input');
    const searchTerm = searchInput.value.toLowerCase();

    const toolItems = document.querySelectorAll('.tool-item');

    toolItems.forEach(item => {
        const toolName = item.querySelector('label').textContent.toLowerCase();
        const toolDescription = item.querySelector('.tool-description').textContent.toLowerCase();
        const toolCategory = item.querySelector('.tool-category').textContent.toLowerCase();

        if (toolName.includes(searchTerm) ||
            toolDescription.includes(searchTerm) ||
            toolCategory.includes(searchTerm)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

function openInstallToolModal() {
    // Create a modal for installing a new tool
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'install-tool-modal';

    const content = document.createElement('div');
    content.className = 'modal-content';

    const closeBtn = document.createElement('span');
    closeBtn.className = 'close-modal';
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', () => document.body.removeChild(modal));

    const title = document.createElement('h3');
    title.textContent = 'Install New Tool';

    const form = document.createElement('div');
    form.className = 'form-group';

    const nameLabel = document.createElement('label');
    nameLabel.htmlFor = 'tool-name';
    nameLabel.textContent = 'Tool Name:';

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.id = 'tool-name';
    nameInput.placeholder = 'Enter tool name';

    const descLabel = document.createElement('label');
    descLabel.htmlFor = 'tool-description';
    descLabel.textContent = 'Description:';

    const descInput = document.createElement('input');
    descInput.type = 'text';
    descInput.id = 'tool-description';
    descInput.placeholder = 'Enter tool description';

    const categoryLabel = document.createElement('label');
    categoryLabel.htmlFor = 'tool-category';
    categoryLabel.textContent = 'Category:';

    const categorySelect = document.createElement('select');
    categorySelect.id = 'tool-category';

    const categories = ['Information', 'Utility', 'Productivity', 'Language', 'Finance', 'AI', 'Navigation', 'Other'];
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });

    const endpointLabel = document.createElement('label');
    endpointLabel.htmlFor = 'tool-endpoint';
    endpointLabel.textContent = 'API Endpoint:';

    const endpointInput = document.createElement('input');
    endpointInput.type = 'text';
    endpointInput.id = 'tool-endpoint';
    endpointInput.placeholder = 'Enter API endpoint (e.g., https://api.example.com/tool)';

    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'modal-buttons';

    const installButton = document.createElement('button');
    installButton.textContent = 'Install Tool';
    installButton.addEventListener('click', () => {
        const name = nameInput.value.trim();
        const description = descInput.value.trim();
        const category = categorySelect.value;
        const endpoint = endpointInput.value.trim();

        if (!name || !endpoint) {
            alert('Please enter a name and API endpoint for the tool.');
            return;
        }

        // Add the new tool
        toolsDatabase.push({
            name,
            description: description || 'Custom tool',
            category,
            endpoint,
            isActive: true
        });

        // Update the UI
        populateToolsList();

        // Close the modal
        document.body.removeChild(modal);
    });

    form.appendChild(nameLabel);
    form.appendChild(nameInput);
    form.appendChild(descLabel);
    form.appendChild(descInput);
    form.appendChild(categoryLabel);
    form.appendChild(categorySelect);
    form.appendChild(endpointLabel);
    form.appendChild(endpointInput);

    buttonContainer.appendChild(installButton);

    content.appendChild(closeBtn);
    content.appendChild(title);
    content.appendChild(form);
    content.appendChild(buttonContainer);

    modal.appendChild(content);

    document.body.appendChild(modal);
}

function saveTools() {
    // Save the active state of each tool
    toolsDatabase.forEach(tool => {
        const checkbox = document.getElementById(`tool-${tool.endpoint}`);
        if (checkbox) {
            tool.isActive = checkbox.checked;
        }
    });

    // Get active tools
    const activeTools = toolsDatabase
        .filter(tool => tool.isActive)
        .map(tool => tool.name);

    // Save to localStorage
    saveActiveTools(activeTools);

    console.log('Active tools saved:', activeTools);

    closeModals();
}

// MCP server list from GitHub
const mcpServers = [
    {
        name: "Local MCP",
        description: "Process data locally on your device",
        url: "local://mcp",
        isDefault: true
    },
    {
        name: "MCP.ai",
        description: "Official MCP.ai server with high performance",
        url: "https://api.mcp.ai",
        isDefault: false
    },
    {
        name: "OpenMCP",
        description: "Open-source MCP server implementation",
        url: "https://openmcp.org/api",
        isDefault: false
    },
    {
        name: "ModelContext Hub",
        description: "Specialized in multi-model context processing",
        url: "https://hub.modelcontext.ai",
        isDefault: false
    },
    {
        name: "MCP Connect",
        description: "Enterprise-grade MCP server with advanced security",
        url: "https://connect.mcpprotocol.com",
        isDefault: false
    }
];

// Active MCP server
let activeMcpServer = mcpServers[0];

function openMcpModal() {
    const modal = document.getElementById('mcp-modal');
    modal.style.display = 'block';

    // Set up tab functionality
    const tabButtons = modal.querySelectorAll('.mcp-tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all tabs
            tabButtons.forEach(btn => btn.classList.remove('active'));

            // Add active class to clicked tab
            button.classList.add('active');

            // Hide all tab content
            const tabContents = modal.querySelectorAll('.mcp-tab-content');
            tabContents.forEach(content => content.classList.remove('active'));

            // Show the corresponding tab content
            const tabId = button.getAttribute('data-tab');
            document.getElementById(`${tabId}-tab`).classList.add('active');

            // If search tab is active, populate search results
            if (tabId === 'search') {
                searchMcpServers();
            }
        });
    });

    // Populate the MCP server lists
    populateMcpServerLists();

    // Set up search functionality
    const searchInput = document.getElementById('mcp-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', searchMcpServers);
        searchInput.value = ''; // Clear search on open
    }

    // Set up add server button
    const addServerBtn = document.getElementById('add-mcp-server-btn');
    if (addServerBtn) {
        addServerBtn.addEventListener('click', openAddMcpServerModal);
    }

    // Set up toggle switches and delete buttons for installed servers
    setupInstalledServerControls();
}

function populateMcpServerLists() {
    // Populate search results
    populateSearchResults();

    // Populate installed servers
    populateInstalledServers();
}

function populateSearchResults() {
    const searchResults = document.getElementById('mcp-search-results');
    if (!searchResults) return;

    // Clear previous results
    searchResults.innerHTML = '';

    // Simulate searching for MCP servers from GitHub
    searchResults.innerHTML = '<div class="mcp-loading">Searching for available MCP servers...</div>';

    // Simulate API call to GitHub
    setTimeout(() => {
        searchResults.innerHTML = '';

        // Sample search results (in a real app, these would come from the GitHub API)
        const availableServers = [
            {
                name: 'Web Search MCP',
                description: 'Provides web search capabilities to your AI models',
                url: 'https://github.com/example/web-search-mcp',
                stars: 245
            },
            {
                name: 'Database MCP',
                description: 'Connect to various databases including MySQL, PostgreSQL, and MongoDB',
                url: 'https://github.com/example/database-mcp',
                stars: 189
            },
            {
                name: 'File System MCP',
                description: 'Access and manipulate files on the local file system',
                url: 'https://github.com/example/filesystem-mcp',
                stars: 156
            },
            {
                name: 'API Gateway MCP',
                description: 'Connect to various APIs and web services',
                url: 'https://github.com/example/api-gateway-mcp',
                stars: 132
            },
            {
                name: 'Vector Database MCP',
                description: 'Store and query vector embeddings for semantic search',
                url: 'https://github.com/example/vector-db-mcp',
                stars: 98
            }
        ];

        availableServers.forEach(server => {
            const item = document.createElement('div');
            item.className = 'mcp-item';

            const info = document.createElement('div');
            info.className = 'mcp-info';

            const nameLabel = document.createElement('label');
            nameLabel.textContent = server.name;

            const description = document.createElement('span');
            description.className = 'mcp-description';
            description.textContent = server.description;

            const stars = document.createElement('div');
            stars.className = 'mcp-stars';
            stars.innerHTML = `<i class="fas fa-star"></i> ${server.stars}`;
            stars.style.fontSize = '12px';
            stars.style.color = '#f1c40f';
            stars.style.marginLeft = '10px';

            const installBtn = document.createElement('button');
            installBtn.className = 'mcp-connect-btn';
            installBtn.textContent = 'Install';
            installBtn.addEventListener('click', () => installMcpServer(server));

            info.appendChild(nameLabel);
            info.appendChild(description);

            item.appendChild(info);
            item.appendChild(stars);
            item.appendChild(installBtn);

            searchResults.appendChild(item);
        });
    }, 1500);
}

function populateInstalledServers() {
    const installedList = document.getElementById('mcp-installed-list');
    if (!installedList) return;

    // In a real app, this would be loaded from localStorage or a database
    // For now, we'll use the static list from the HTML
}

function setupInstalledServerControls() {
    // Set up toggle switches
    const toggles = document.querySelectorAll('.mcp-controls .switch input');
    toggles.forEach(toggle => {
        toggle.addEventListener('change', function() {
            const serverItem = this.closest('.mcp-item');
            const serverName = serverItem.querySelector('label').textContent;

            if (this.checked) {
                console.log(`Activated MCP server: ${serverName}`);
                // In a real app, you would activate the server here
            } else {
                console.log(`Deactivated MCP server: ${serverName}`);
                // In a real app, you would deactivate the server here
            }
        });
    });

    // Set up delete buttons
    const deleteButtons = document.querySelectorAll('.mcp-delete-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const serverItem = this.closest('.mcp-item');
            const serverName = serverItem.querySelector('label').textContent;

            if (confirm(`Are you sure you want to delete the "${serverName}" MCP server?`)) {
                console.log(`Deleted MCP server: ${serverName}`);
                serverItem.remove();
                // In a real app, you would remove the server from storage here
            }
        });
    });
}

function searchMcpServers() {
    const searchInput = document.getElementById('mcp-search-input');
    const searchTerm = searchInput.value.toLowerCase();

    // If search term is empty, show all available servers
    if (searchTerm === '') {
        populateSearchResults();
        return;
    }

    // Filter the search results
    const mcpItems = document.querySelectorAll('#mcp-search-results .mcp-item');

    mcpItems.forEach(item => {
        const serverName = item.querySelector('label').textContent.toLowerCase();
        const serverDescription = item.querySelector('.mcp-description').textContent.toLowerCase();

        if (serverName.includes(searchTerm) || serverDescription.includes(searchTerm)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

function installMcpServer(server) {
    console.log(`Installing MCP server: ${server.name} from ${server.url}`);

    // Show installation progress
    const searchResults = document.getElementById('mcp-search-results');
    const progressItem = document.createElement('div');
    progressItem.className = 'mcp-item';
    progressItem.innerHTML = `
        <div class="mcp-info">
            <label>Installing ${server.name}...</label>
            <div class="progress-bar">
                <div class="progress-fill"></div>
            </div>
        </div>
    `;

    // Add some basic styling for the progress bar
    const progressBar = progressItem.querySelector('.progress-bar');
    progressBar.style.width = '100%';
    progressBar.style.height = '10px';
    progressBar.style.backgroundColor = '#f0f0f0';
    progressBar.style.borderRadius = '5px';
    progressBar.style.overflow = 'hidden';
    progressBar.style.marginTop = '5px';

    const progressFill = progressItem.querySelector('.progress-fill');
    progressFill.style.width = '0%';
    progressFill.style.height = '100%';
    progressFill.style.backgroundColor = '#4CAF50';
    progressFill.style.transition = 'width 1.5s ease-in-out';

    // Replace the server item with the progress item
    const serverItems = searchResults.querySelectorAll('.mcp-item');
    serverItems.forEach(item => {
        const itemName = item.querySelector('label').textContent;
        if (itemName === server.name) {
            searchResults.replaceChild(progressItem, item);
        }
    });

    // Simulate installation progress
    setTimeout(() => {
        progressFill.style.width = '100%';
    }, 100);

    // Simulate installation completion
    setTimeout(() => {
        // Add to installed servers
        const installedList = document.getElementById('mcp-installed-list');

        const newServer = document.createElement('div');
        newServer.className = 'mcp-item';
        newServer.innerHTML = `
            <div class="mcp-status-indicator green"></div>
            <div class="mcp-info">
                <label>${server.name}</label>
                <span class="mcp-description">${server.description}</span>
            </div>
            <div class="mcp-controls">
                <label class="switch">
                    <input type="checkbox" checked>
                    <span class="slider round"></span>
                </label>
                <button class="mcp-delete-btn"><i class="fas fa-trash"></i></button>
            </div>
        `;

        // Add event listeners to the new controls
        const toggle = newServer.querySelector('.switch input');
        toggle.addEventListener('change', function() {
            if (this.checked) {
                console.log(`Activated MCP server: ${server.name}`);
            } else {
                console.log(`Deactivated MCP server: ${server.name}`);
            }
        });

        const deleteBtn = newServer.querySelector('.mcp-delete-btn');
        deleteBtn.addEventListener('click', function() {
            if (confirm(`Are you sure you want to delete the "${server.name}" MCP server?`)) {
                console.log(`Deleted MCP server: ${server.name}`);
                newServer.remove();
            }
        });

        installedList.appendChild(newServer);

        // Switch to the installed tab
        const installedTabBtn = document.querySelector('.mcp-tab-btn[data-tab="installed"]');
        installedTabBtn.click();

        // Show success message
        alert(`Successfully installed ${server.name} MCP server!`);

        // Remove the progress item
        progressItem.remove();
    }, 2000);
}

function openAddMcpServerModal() {
    // Create a modal for adding a new MCP server
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'add-mcp-server-modal';

    const content = document.createElement('div');
    content.className = 'modal-content';

    const closeBtn = document.createElement('span');
    closeBtn.className = 'close-modal';
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', () => document.body.removeChild(modal));

    const title = document.createElement('h3');
    title.textContent = 'Add MCP Server';

    const form = document.createElement('div');
    form.className = 'form-group';

    const nameLabel = document.createElement('label');
    nameLabel.htmlFor = 'mcp-server-name';
    nameLabel.textContent = 'Server Name:';

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.id = 'mcp-server-name';
    nameInput.placeholder = 'Enter server name';

    const descLabel = document.createElement('label');
    descLabel.htmlFor = 'mcp-server-description';
    descLabel.textContent = 'Description:';

    const descInput = document.createElement('input');
    descInput.type = 'text';
    descInput.id = 'mcp-server-description';
    descInput.placeholder = 'Enter server description';

    const urlLabel = document.createElement('label');
    urlLabel.htmlFor = 'mcp-server-url';
    urlLabel.textContent = 'Server URL:';

    const urlInput = document.createElement('input');
    urlInput.type = 'url';
    urlInput.id = 'mcp-server-url';
    urlInput.placeholder = 'Enter server URL (e.g., https://api.mcp.example.com)';

    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'modal-buttons';

    const addButton = document.createElement('button');
    addButton.textContent = 'Add Server';
    addButton.addEventListener('click', () => {
        const name = nameInput.value.trim();
        const description = descInput.value.trim();
        const url = urlInput.value.trim();

        if (!name || !url) {
            alert('Please enter a name and URL for the server.');
            return;
        }

        // Add the new server to the installed list
        const installedList = document.getElementById('mcp-installed-list');

        const newServer = document.createElement('div');
        newServer.className = 'mcp-item';
        newServer.innerHTML = `
            <div class="mcp-status-indicator green"></div>
            <div class="mcp-info">
                <label>${name}</label>
                <span class="mcp-description">${description || 'Custom MCP server'}</span>
            </div>
            <div class="mcp-controls">
                <label class="switch">
                    <input type="checkbox" checked>
                    <span class="slider round"></span>
                </label>
                <button class="mcp-delete-btn"><i class="fas fa-trash"></i></button>
            </div>
        `;

        // Add event listeners to the new controls
        const toggle = newServer.querySelector('.switch input');
        toggle.addEventListener('change', function() {
            if (this.checked) {
                console.log(`Activated MCP server: ${name}`);
            } else {
                console.log(`Deactivated MCP server: ${name}`);
            }
        });

        const deleteBtn = newServer.querySelector('.mcp-delete-btn');
        deleteBtn.addEventListener('click', function() {
            if (confirm(`Are you sure you want to delete the "${name}" MCP server?`)) {
                console.log(`Deleted MCP server: ${name}`);
                newServer.remove();
            }
        });

        installedList.appendChild(newServer);

        // Close the modal
        document.body.removeChild(modal);

        // Switch to the installed tab
        const installedTabBtn = document.querySelector('.mcp-tab-btn[data-tab="installed"]');
        installedTabBtn.click();
    });

    form.appendChild(nameLabel);
    form.appendChild(nameInput);
    form.appendChild(descLabel);
    form.appendChild(descInput);
    form.appendChild(urlLabel);
    form.appendChild(urlInput);

    buttonContainer.appendChild(addButton);

    content.appendChild(closeBtn);
    content.appendChild(title);
    content.appendChild(form);
    content.appendChild(buttonContainer);

    modal.appendChild(content);

    document.body.appendChild(modal);
}

function saveMcp() {
    // Get all MCP server checkboxes
    const mcpItems = document.querySelectorAll('#mcp-installed-list .mcp-item');
    const activeMcpServers = [];

    mcpItems.forEach(item => {
        const checkbox = item.querySelector('input[type="checkbox"]');
        const label = item.querySelector('label').textContent;

        if (checkbox && checkbox.checked) {
            activeMcpServers.push(label);
        }
    });

    // Save to localStorage
    saveActiveMcpServers(activeMcpServers);

    console.log('Active MCP servers saved:', activeMcpServers);

    closeModals();
}

// Knowledge Base functions
let knowledgeBase = [];

// Load knowledge base from localStorage
function loadKnowledgeBase() {
    const savedKb = localStorage.getItem('knowledge-base');
    if (savedKb) {
        try {
            knowledgeBase = JSON.parse(savedKb);
            console.log(`Loaded ${knowledgeBase.length} knowledge base items`);
        } catch (error) {
            console.error('Error loading knowledge base:', error);
            knowledgeBase = [];
        }
    }
}

// Save knowledge base to localStorage
function saveKnowledgeBaseToStorage() {
    localStorage.setItem('knowledge-base', JSON.stringify(knowledgeBase));
    console.log(`Saved ${knowledgeBase.length} knowledge base items to localStorage`);
}

function openKnowledgeBaseModal() {
    document.getElementById('knowledge-base-modal').style.display = 'block';

    // Load knowledge base if not already loaded
    if (knowledgeBase.length === 0) {
        loadKnowledgeBase();
    }

    // Update the KB list
    updateKnowledgeBaseList();
}

function updateKnowledgeBaseList() {
    const kbList = document.querySelector('.kb-list');
    if (!kbList) return;

    kbList.innerHTML = '';

    if (knowledgeBase.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'kb-empty';
        emptyMessage.textContent = 'No knowledge base items yet. Add some using the buttons above.';
        kbList.appendChild(emptyMessage);
        return;
    }

    knowledgeBase.forEach((item, index) => {
        const kbItem = document.createElement('div');
        kbItem.className = 'kb-item';

        const kbInfo = document.createElement('div');
        kbInfo.className = 'kb-info';

        const kbTitle = document.createElement('div');
        kbTitle.className = 'kb-title';
        kbTitle.textContent = item.title;

        const kbCalling = document.createElement('div');
        kbCalling.className = 'kb-calling';
        kbCalling.textContent = `@${item.calling}`;

        kbInfo.appendChild(kbTitle);
        kbInfo.appendChild(kbCalling);

        const kbActions = document.createElement('div');
        kbActions.className = 'kb-actions';

        const viewBtn = document.createElement('button');
        viewBtn.className = 'kb-view-btn';
        viewBtn.textContent = 'View';
        viewBtn.addEventListener('click', () => viewKnowledgeBaseItem(item));

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'kb-delete-btn';
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => deleteKnowledgeBaseItem(index));

        kbActions.appendChild(viewBtn);
        kbActions.appendChild(deleteBtn);

        kbItem.appendChild(kbInfo);
        kbItem.appendChild(kbActions);

        kbList.appendChild(kbItem);
    });
}

function openKbFileUploadModal() {
    document.getElementById('kb-file-upload-modal').style.display = 'block';

    // Set up the save button
    const saveKbFileBtn = document.getElementById('save-kb-file-btn');
    if (saveKbFileBtn) {
        saveKbFileBtn.addEventListener('click', saveKnowledgeBaseFile);
    }
}

function openKbTextInputModal() {
    document.getElementById('kb-text-input-modal').style.display = 'block';

    // Set up the save button
    const saveKbTextBtn = document.getElementById('save-kb-text-btn');
    if (saveKbTextBtn) {
        saveKbTextBtn.addEventListener('click', saveKnowledgeBaseText);
    }
}

function saveKnowledgeBaseFile() {
    const callingInput = document.getElementById('kb-calling');
    const titleInput = document.getElementById('kb-title');
    const fileInput = document.getElementById('kb-file-upload');

    const calling = callingInput.value.trim();
    const title = titleInput.value.trim();
    const file = fileInput.files[0];

    if (!calling || !title || !file) {
        alert('Please fill in all fields and select a file');
        return;
    }

    // Check if calling name already exists
    if (knowledgeBase.some(item => item.calling === calling)) {
        alert(`A knowledge base item with calling name @${calling} already exists. Please choose a different name.`);
        return;
    }

    // Read the file
    const reader = new FileReader();
    reader.onload = function(event) {
        const content = event.target.result;

        // Add to knowledge base
        knowledgeBase.push({
            calling,
            title,
            content,
            type: 'file',
            fileName: file.name,
            dateAdded: new Date().toISOString()
        });

        // Save to localStorage
        saveKnowledgeBaseToStorage();

        // Update the UI
        updateKnowledgeBaseList();

        // Close the modal
        closeModals();

        // Clear the inputs
        callingInput.value = '';
        titleInput.value = '';
        fileInput.value = '';

        // Show success message
        alert(`Added "${title}" to knowledge base. You can reference it with @${calling} in your messages.`);
    };

    reader.onerror = function() {
        alert('Error reading file');
    };

    reader.readAsText(file);
}

function saveKnowledgeBaseText() {
    const callingInput = document.getElementById('kb-text-calling');
    const titleInput = document.getElementById('kb-text-title');
    const contentInput = document.getElementById('kb-text-content');

    const calling = callingInput.value.trim();
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();

    if (!calling || !title || !content) {
        alert('Please fill in all fields');
        return;
    }

    // Check if calling name already exists
    if (knowledgeBase.some(item => item.calling === calling)) {
        alert(`A knowledge base item with calling name @${calling} already exists. Please choose a different name.`);
        return;
    }

    // Add to knowledge base
    knowledgeBase.push({
        calling,
        title,
        content,
        type: 'text',
        dateAdded: new Date().toISOString()
    });

    // Save to localStorage
    saveKnowledgeBaseToStorage();

    // Update the UI
    updateKnowledgeBaseList();

    // Close the modal
    closeModals();

    // Clear the inputs
    callingInput.value = '';
    titleInput.value = '';
    contentInput.value = '';

    // Show success message
    alert(`Added "${title}" to knowledge base. You can reference it with @${calling} in your messages.`);
}

function viewKnowledgeBaseItem(item) {
    // Create a modal to show the KB item
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'view-kb-modal';

    const content = document.createElement('div');
    content.className = 'modal-content';

    const closeBtn = document.createElement('span');
    closeBtn.className = 'close-modal';
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', () => document.body.removeChild(modal));

    const title = document.createElement('h3');
    title.textContent = item.title;

    const calling = document.createElement('div');
    calling.className = 'kb-calling-display';
    calling.textContent = `Reference with: @${item.calling}`;
    calling.style.marginBottom = '15px';
    calling.style.color = '#3498db';

    const textArea = document.createElement('textarea');
    textArea.value = item.content;
    textArea.readOnly = true;
    textArea.rows = 15;
    textArea.style.width = '100%';
    textArea.style.marginBottom = '15px';

    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'modal-buttons';

    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.addEventListener('click', () => document.body.removeChild(modal));

    buttonContainer.appendChild(closeButton);

    content.appendChild(closeBtn);
    content.appendChild(title);
    content.appendChild(calling);
    content.appendChild(textArea);
    content.appendChild(buttonContainer);

    modal.appendChild(content);

    document.body.appendChild(modal);
}

function deleteKnowledgeBaseItem(index) {
    if (confirm('Are you sure you want to delete this knowledge base item?')) {
        // Remove the item
        knowledgeBase.splice(index, 1);

        // Save to localStorage
        saveKnowledgeBaseToStorage();

        // Update the UI
        updateKnowledgeBaseList();
    }
}

function saveKnowledgeBase() {
    // This function is called when the user clicks the Save button in the KB modal
    closeModals();
}

// Web URL functions
function loadWebUrl() {
    const urlInput = document.getElementById('web-url-input');
    const url = urlInput.value.trim();

    if (!url) return;

    // Add http:// if missing
    let processedUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        processedUrl = 'https://' + url;
        urlInput.value = processedUrl;
    }

    // Show loading state
    const previewContainer = document.getElementById('url-preview-container');
    previewContainer.style.display = 'block';
    previewContainer.innerHTML = '<div class="loading">Loading preview...</div>';

    // Get the favicon URL
    const domain = new URL(processedUrl).hostname;
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

    // In a real implementation, we would fetch the URL and extract metadata
    // For now, just show the favicon and domain
    setTimeout(() => {
        previewContainer.innerHTML = '';
        previewContainer.appendChild(createUrlPreview(processedUrl, faviconUrl, domain));
    }, 1000);
}

function createUrlPreview(url, faviconUrl, domain) {
    const container = document.createElement('div');

    const preview = document.createElement('div');
    preview.className = 'url-preview';

    const img = document.createElement('img');
    img.id = 'url-thumbnail';
    img.src = faviconUrl || 'https://www.google.com/s2/favicons?domain=example.com&sz=128';
    img.alt = 'Website icon';
    img.style.width = '64px';
    img.style.height = '64px';

    const title = document.createElement('div');
    title.id = 'url-title';
    title.textContent = domain || url;
    title.style.fontWeight = 'bold';
    title.style.marginTop = '10px';

    const urlText = document.createElement('div');
    urlText.className = 'url-full';
    urlText.textContent = url;
    urlText.style.fontSize = '12px';
    urlText.style.color = '#666';
    urlText.style.marginTop = '5px';

    preview.appendChild(img);
    preview.appendChild(title);
    preview.appendChild(urlText);

    const actions = document.createElement('div');
    actions.className = 'url-actions';

    const scrapeBtn = document.createElement('button');
    scrapeBtn.id = 'scrape-url-btn';
    scrapeBtn.className = 'feature-btn';
    scrapeBtn.textContent = 'Scrape Webpage';
    scrapeBtn.addEventListener('click', () => scrapeWebpage(url));

    const addBtn = document.createElement('button');
    addBtn.id = 'add-url-to-chat-btn';
    addBtn.className = 'feature-btn';
    addBtn.textContent = 'Add to Chat';
    addBtn.addEventListener('click', () => addUrlToChat(url));

    const downloadBtn = document.createElement('button');
    downloadBtn.id = 'download-url-text-btn';
    downloadBtn.className = 'feature-btn';
    downloadBtn.textContent = 'Download Text';
    downloadBtn.addEventListener('click', () => downloadUrlText(url));

    actions.appendChild(scrapeBtn);
    actions.appendChild(addBtn);
    actions.appendChild(downloadBtn);

    container.appendChild(preview);
    container.appendChild(actions);

    return container;
}

function scrapeWebpage(url) {
    addUserMessage(`Please analyze the content at ${url}`);
    processUserMessage(`Please analyze the content at ${url}`);
    closeModals();
}

function addUrlToChat(url) {
    addUserMessage(`I want to discuss this webpage: ${url}`);
    closeModals();
}

function downloadUrlText(url) {
    // In a real implementation, we would fetch the text and offer it for download
    alert(`Downloading text from ${url} (placeholder)`);
}

// Reasoning functions
let isReasoningActive = false;
let activeReasoningModel = null;
let reasoningPrompts = [
    {
        id: 'prompt-1',
        title: 'Step-by-step thinking',
        text: 'Think through this problem step-by-step. First, understand what is being asked. Second, identify the key information. Third, plan your approach. Fourth, execute the plan. Finally, verify your answer.'
    },
    {
        id: 'prompt-2',
        title: 'Chain of thought',
        text: 'Let\'s work through this by creating a chain of thought. Start with the initial information, then build on each step with logical reasoning until you reach a conclusion.'
    },
    {
        id: 'prompt-3',
        title: 'Detailed analysis',
        text: 'Perform a detailed analysis of this problem. Consider multiple perspectives, evaluate different approaches, and provide a comprehensive explanation of your reasoning process.'
    }
];

function activateReasoning() {
    const reasoningModelSelect = document.getElementById('reasoning-model');
    const reasoningModel = reasoningModelSelect.value;
    const reasoningModelName = reasoningModelSelect.options[reasoningModelSelect.selectedIndex].text;

    // Get the selected prompt
    const selectedPromptRadio = document.querySelector('input[name="reasoning-prompt"]:checked');
    if (!selectedPromptRadio) {
        alert('Please select a reasoning prompt');
        return;
    }

    const promptId = selectedPromptRadio.id;
    const prompt = reasoningPrompts.find(p => p.id === promptId);

    if (!prompt) {
        alert('Error: Selected prompt not found');
        return;
    }

    // Show the thinking indicator
    const thinkingIndicator = document.getElementById('thinking-indicator');
    const thinkingModelText = document.getElementById('thinking-model');

    if (thinkingIndicator && thinkingModelText) {
        // Extract the model name from the value
        const modelName = reasoningModelName.split(' ')[0];
        thinkingModelText.textContent = `Think: ${modelName}`;
        thinkingIndicator.style.display = 'block';

        // Add a pulsing green dot
        const dot = document.createElement('span');
        dot.className = 'thinking-dot';
        thinkingModelText.appendChild(dot);

        // Make the indicator clickable to deactivate
        thinkingIndicator.style.cursor = 'pointer';
        thinkingIndicator.addEventListener('click', deactivateReasoning);
    }

    // Highlight the reasoning icon
    const reasoningBtn = document.getElementById('reasoning-btn');
    if (reasoningBtn) {
        reasoningBtn.classList.add('active-reasoning');
    }

    // Set the active reasoning state
    isReasoningActive = true;
    activeReasoningModel = {
        value: reasoningModel,
        name: reasoningModelName,
        prompt: prompt
    };

    // Show a confirmation
    console.log(`Activated reasoning with model: ${reasoningModel} and prompt: ${prompt.title}`);

    // Show the prompt in an expandable text area
    showReasoningPrompt(prompt);

    closeModals();
}

function deactivateReasoning() {
    // Hide the thinking indicator
    const thinkingIndicator = document.getElementById('thinking-indicator');
    if (thinkingIndicator) {
        thinkingIndicator.style.display = 'none';
    }

    // Remove highlight from the reasoning icon
    const reasoningBtn = document.getElementById('reasoning-btn');
    if (reasoningBtn) {
        reasoningBtn.classList.remove('active-reasoning');
    }

    // Reset the active reasoning state
    isReasoningActive = false;
    activeReasoningModel = null;

    console.log('Deactivated reasoning mode');
}

function showReasoningPrompt(prompt) {
    // Create a modal to show the prompt
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'reasoning-prompt-modal';
    modal.style.display = 'block'; // Make sure it's visible

    const content = document.createElement('div');
    content.className = 'modal-content';

    const closeBtn = document.createElement('span');
    closeBtn.className = 'close-modal';
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', () => document.body.removeChild(modal));

    const title = document.createElement('h3');
    title.textContent = `Reasoning Prompt: ${prompt.title}`;

    const form = document.createElement('div');
    form.className = 'form-group';

    const textArea = document.createElement('textarea');
    textArea.id = 'reasoning-prompt-text';
    textArea.value = prompt.text;
    textArea.rows = 10;
    textArea.style.width = '100%';

    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'modal-buttons';

    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save Changes';
    saveButton.addEventListener('click', () => {
        // Update the prompt text
        prompt.text = textArea.value;

        // If this is the active reasoning prompt, update it
        if (activeReasoningModel && activeReasoningModel.prompt.id === prompt.id) {
            activeReasoningModel.prompt.text = textArea.value;
        }

        // Save to localStorage
        localStorage.setItem('reasoning-prompts', JSON.stringify(reasoningPrompts));

        // Close the modal
        document.body.removeChild(modal);

        // Show confirmation
        alert('Prompt updated successfully!');
    });

    form.appendChild(textArea);

    buttonContainer.appendChild(saveButton);

    content.appendChild(closeBtn);
    content.appendChild(title);
    content.appendChild(form);
    content.appendChild(buttonContainer);

    modal.appendChild(content);

    document.body.appendChild(modal);
}

function openAddPromptModal() {
    document.getElementById('add-prompt-modal').style.display = 'block';

    // Set up the save button
    const savePromptBtn = document.getElementById('save-prompt-btn');
    if (savePromptBtn) {
        savePromptBtn.addEventListener('click', saveNewPrompt);
    }
}

function saveNewPrompt() {
    const titleInput = document.getElementById('prompt-title');
    const textInput = document.getElementById('prompt-text');

    const title = titleInput.value.trim();
    const text = textInput.value.trim();

    if (!title || !text) {
        alert('Please enter both a title and text for the prompt');
        return;
    }

    // Generate a unique ID
    const id = 'prompt-' + (reasoningPrompts.length + 1);

    // Add the new prompt
    reasoningPrompts.push({
        id,
        title,
        text
    });

    // Save to localStorage
    localStorage.setItem('reasoning-prompts', JSON.stringify(reasoningPrompts));

    // Update the UI
    updateReasoningPromptsList();

    // Close the modal
    closeModals();

    // Clear the inputs
    titleInput.value = '';
    textInput.value = '';
}

function updateReasoningPromptsList() {
    const promptsContainer = document.querySelector('.reasoning-prompts');
    if (!promptsContainer) return;

    // Clear existing prompts
    promptsContainer.innerHTML = '';

    // Add each prompt
    reasoningPrompts.forEach(prompt => {
        const promptDiv = document.createElement('div');
        promptDiv.className = 'reasoning-prompt';
        promptDiv.dataset.title = prompt.title.toLowerCase();
        promptDiv.dataset.id = prompt.id;

        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'reasoning-prompt';
        radio.id = prompt.id;

        const label = document.createElement('label');
        label.htmlFor = prompt.id;
        label.textContent = prompt.title;

        const editBtn = document.createElement('button');
        editBtn.className = 'edit-prompt-btn';
        editBtn.innerHTML = '<i class="fas fa-edit"></i>';
        editBtn.title = 'Edit Prompt';
        editBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const promptObj = reasoningPrompts.find(p => p.id === prompt.id);
            if (promptObj) {
                showReasoningPrompt(promptObj);
            }
        });

        promptDiv.appendChild(radio);
        promptDiv.appendChild(label);
        promptDiv.appendChild(editBtn);

        promptsContainer.appendChild(promptDiv);
    });

    // Select the first prompt by default
    const firstRadio = document.querySelector('input[name="reasoning-prompt"]');
    if (firstRadio) {
        firstRadio.checked = true;
    }
}

function searchReasoningPrompts() {
    const searchInput = document.getElementById('prompt-search');
    const searchTerm = searchInput.value.toLowerCase();

    const promptItems = document.querySelectorAll('.reasoning-prompt');

    promptItems.forEach(item => {
        const promptTitle = item.dataset.title;

        if (promptTitle.includes(searchTerm)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

function setupEditPromptButtons() {
    const editButtons = document.querySelectorAll('.edit-prompt-btn');

    editButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            const promptItem = this.closest('.reasoning-prompt');
            const promptId = promptItem.dataset.id;

            const promptObj = reasoningPrompts.find(p => p.id === promptId);
            if (promptObj) {
                showReasoningPrompt(promptObj);
            }
        });
    });
}

function fetchReasoningPrompts() {
    // Show loading state
    const promptsContainer = document.querySelector('.reasoning-prompts');
    promptsContainer.innerHTML = '<div class="loading-prompts">Fetching prompts...</div>';

    // Simulate API call to fetch prompts
    setTimeout(() => {
        // Sample prompts from an API
        const apiPrompts = [
            {
                id: 'prompt-api-1',
                title: 'Critical Thinking Framework',
                text: 'When analyzing this problem, I will:\n1. Identify the core issue\n2. Consider multiple perspectives\n3. Evaluate evidence and assumptions\n4. Develop logical arguments\n5. Consider implications and consequences\n6. Propose well-reasoned solutions'
            },
            {
                id: 'prompt-api-2',
                title: 'Scientific Method Approach',
                text: 'I will approach this question using the scientific method:\n1. Observe the problem and gather information\n2. Formulate a hypothesis\n3. Design and conduct thought experiments\n4. Analyze the results\n5. Draw conclusions\n6. Communicate findings clearly'
            },
            {
                id: 'prompt-api-3',
                title: 'Socratic Questioning',
                text: 'I will use Socratic questioning to explore this topic:\n1. Clarify the question: What exactly are we asking?\n2. Challenge assumptions: What assumptions underlie this question?\n3. Examine evidence: What evidence supports or contradicts our ideas?\n4. Consider alternatives: What other perspectives exist?\n5. Explore implications: What are the consequences of different viewpoints?\n6. Question the question: Is this the right question to ask?'
            },
            {
                id: 'prompt-api-4',
                title: 'First Principles Analysis',
                text: 'I will break down this problem to first principles:\n1. Identify and question all assumptions\n2. Break down the problem into fundamental truths\n3. Rebuild a solution from the ground up\n4. Eliminate unnecessary complexity\n5. Focus on what is provably true rather than conventional wisdom'
            },
            {
                id: 'prompt-api-5',
                title: 'Systems Thinking',
                text: 'I will analyze this using systems thinking:\n1. Identify the system boundaries and components\n2. Map relationships and interactions between components\n3. Identify feedback loops and emergent properties\n4. Consider how changes propagate through the system\n5. Look for leverage points where small changes can have large effects\n6. Consider both short-term and long-term consequences'
            }
        ];

        // Add the new prompts to our existing prompts
        const newPrompts = apiPrompts.filter(apiPrompt =>
            !reasoningPrompts.some(existingPrompt => existingPrompt.title === apiPrompt.title)
        );

        if (newPrompts.length > 0) {
            reasoningPrompts = [...reasoningPrompts, ...newPrompts];

            // Save to localStorage
            localStorage.setItem('reasoning-prompts', JSON.stringify(reasoningPrompts));

            // Update the UI
            updateReasoningPromptsList();

            // Show success message
            alert(`Successfully added ${newPrompts.length} new prompts!`);
        } else {
            // Update the UI anyway (to remove loading state)
            updateReasoningPromptsList();

            // Show message
            alert('No new prompts found. All available prompts are already installed.');
        }
    }, 1500);
}

// System prompt function
function saveSystemPrompt() {
    const systemPrompt = document.getElementById('system-prompt').value;

    // In a real implementation, we would save this to be used in API calls
    console.log('Saved system prompt:', systemPrompt);

    alert('System prompt saved!');
}

function openSettingsModal() {
    settingsModal.style.display = 'block';

    // Set up tab functionality
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked button
            button.classList.add('active');

            // Show corresponding content
            const tabId = button.getAttribute('data-tab');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
}

function closeSettingsModal() {
    settingsModal.style.display = 'none';
}

function minimizeThinking() {
    thinkingBox.style.display = 'none';
}

function showThinking(text) {
    thinkingText.textContent = text;
    thinkingBox.style.display = 'block';
}

// Speech Recognition
function toggleSpeechRecognition() {
    if (!isListening) {
        startSpeechRecognition();
    } else {
        stopSpeechRecognition();
    }
}

function startSpeechRecognition() {
    // Check if the browser supports speech recognition
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert('Your browser does not support speech recognition. Please try using Chrome or Edge.');
        return;
    }

    // Initialize speech recognition
    if (!recognition) {
        recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onstart = function() {
            isListening = true;
            micBtn.classList.add('active');
            messageInput.placeholder = 'Listening...';
        };

        recognition.onresult = function(event) {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;

                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }

            // Update the input field with the transcription
            if (finalTranscript) {
                messageInput.value = finalTranscript;
            } else {
                messageInput.value = interimTranscript;
            }
        };

        recognition.onerror = function(event) {
            console.error('Speech recognition error:', event.error);
            stopSpeechRecognition();
        };

        recognition.onend = function() {
            stopSpeechRecognition();
        };
    }

    try {
        recognition.start();
    } catch (error) {
        console.error('Error starting speech recognition:', error);
    }
}

function stopSpeechRecognition() {
    if (recognition) {
        recognition.stop();
    }

    isListening = false;
    micBtn.classList.remove('active');
    messageInput.placeholder = 'Type your message here...';
}

function closeModals() {
    // Close all modals
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.style.display = 'none';
    });

    // Reset modal content
    previewContainer.innerHTML = '';
    imgResult.innerHTML = '';
    imageUpload.value = '';
    imgPrompt.value = '';
    conversationName.value = '';

    // Reset utility modal content
    document.getElementById('utility-preview-container').innerHTML = '';
    document.getElementById('utility-image-upload').value = '';
    document.getElementById('file-upload').value = '';
    document.getElementById('web-url-input').value = '';
}

// Create info banner with active tools and MCP servers
function createInfoBanner() {
    // Create the banner container
    const bannerContainer = document.createElement('div');
    bannerContainer.className = 'info-banner';

    // Add tools info
    const toolsInfo = document.createElement('div');
    toolsInfo.className = 'tools-info';
    toolsInfo.innerHTML = '<span class="info-label">Tools:</span> <span class="info-value">websearch, imagerecognition, weather, translate</span>';

    // Add MCP info
    const mcpInfo = document.createElement('div');
    mcpInfo.className = 'mcp-info';
    mcpInfo.innerHTML = '<span class="info-label">MCP:</span> <span class="info-value">Local MCP</span>';

    // Add to banner
    bannerContainer.appendChild(toolsInfo);
    bannerContainer.appendChild(mcpInfo);

    // Add banner to the page after the input container
    const inputContainer = document.querySelector('.input-container');
    inputContainer.parentNode.insertBefore(bannerContainer, inputContainer.nextSibling);

    // Update the banner when tools or MCP servers change
    updateInfoBanner();
}

// Update the info banner with current tools and MCP servers
function updateInfoBanner() {
    const toolsValue = document.querySelector('.tools-info .info-value');
    const mcpValue = document.querySelector('.mcp-info .info-value');

    if (toolsValue) {
        // Get active tools from localStorage
        const activeTools = getActiveTools();
        if (activeTools.length > 0) {
            toolsValue.textContent = activeTools.join(', ');
        } else {
            toolsValue.textContent = 'None';
        }
    }

    if (mcpValue) {
        // Get active MCP servers from localStorage
        const activeMcpServers = getActiveMcpServers();
        if (activeMcpServers.length > 0) {
            mcpValue.textContent = activeMcpServers.join(', ');
        } else {
            mcpValue.textContent = 'None';
        }
    }

    // Adjust the layout of the info banner
    const infoBanner = document.querySelector('.info-banner');
    if (infoBanner) {
        infoBanner.style.display = 'flex';
        infoBanner.style.justifyContent = 'center'; // Center the banner
    }
}

// Get active tools from localStorage
function getActiveTools() {
    const savedTools = localStorage.getItem('active-tools');
    if (savedTools) {
        return JSON.parse(savedTools);
    }

    // Default tools
    const defaultTools = ['websearch', 'imagerecognition', 'weather', 'translate'];
    localStorage.setItem('active-tools', JSON.stringify(defaultTools));
    return defaultTools;
}

// Get active MCP servers from localStorage
function getActiveMcpServers() {
    const savedMcpServers = localStorage.getItem('active-mcp-servers');
    if (savedMcpServers) {
        return JSON.parse(savedMcpServers);
    }

    // Default MCP server
    const defaultMcpServers = ['Local MCP'];
    localStorage.setItem('active-mcp-servers', JSON.stringify(defaultMcpServers));
    return defaultMcpServers;
}

// Save active tools to localStorage
function saveActiveTools(tools) {
    localStorage.setItem('active-tools', JSON.stringify(tools));
    updateInfoBanner();
}

// Save active MCP servers to localStorage
function saveActiveMcpServers(mcpServers) {
    localStorage.setItem('active-mcp-servers', JSON.stringify(mcpServers));
    updateInfoBanner();
}

// Handle message input for tool suggestions and agent commands
function handleMessageInput(e) {
    const input = e.target;
    const value = input.value;

    // Check if the user just typed "!"
    if (value.endsWith('!')) {
        showToolSuggestions();
        hideAgentSuggestions();
    }
    // Check if the user just typed "/"
    else if (value.endsWith('/')) {
        showAgentSuggestions();
        hideToolSuggestions();
    }
    else {
        hideToolSuggestions();
        hideAgentSuggestions();
    }
}

// Show tool suggestions
function showToolSuggestions() {
    // Remove existing suggestions
    hideToolSuggestions();

    // Create suggestions container
    const suggestionsContainer = document.createElement('div');
    suggestionsContainer.className = 'tool-suggestions';
    suggestionsContainer.id = 'tool-suggestions';

    // Add suggestions
    const tools = [
        { name: 'websearch', description: 'Search the web' },
        { name: 'imagerecognition', description: 'Analyze an image' },
        { name: 'weather', description: 'Get weather information' },
        { name: 'translate', description: 'Translate text' },
        { name: 'help', description: 'Show available commands' }
    ];

    tools.forEach(tool => {
        const suggestion = document.createElement('div');
        suggestion.className = 'tool-suggestion';
        suggestion.innerHTML = `<strong>!${tool.name}</strong> - ${tool.description}`;

        suggestion.addEventListener('click', () => {
            // Replace the "!" with the full command
            messageInput.value = messageInput.value.replace(/!$/, `!${tool.name} `);
            messageInput.focus();
            hideToolSuggestions();
        });

        suggestionsContainer.appendChild(suggestion);
    });

    // Add to the page
    const inputContainer = document.querySelector('.input-container');
    inputContainer.appendChild(suggestionsContainer);

    // Position the suggestions
    positionToolSuggestions();
}

// Hide tool suggestions
function hideToolSuggestions() {
    const suggestionsContainer = document.getElementById('tool-suggestions');
    if (suggestionsContainer) {
        suggestionsContainer.remove();
    }
}

// Position tool suggestions
function positionToolSuggestions() {
    const suggestionsContainer = document.getElementById('tool-suggestions');
    const inputContainer = document.querySelector('.message-input-area');

    if (suggestionsContainer && inputContainer) {
        const inputRect = inputContainer.getBoundingClientRect();

        suggestionsContainer.style.position = 'absolute';
        suggestionsContainer.style.bottom = `${inputRect.height + 5}px`;
        suggestionsContainer.style.left = '0';
        suggestionsContainer.style.width = `${inputRect.width}px`;
        suggestionsContainer.style.zIndex = '1000';
    }
}

// New Settings Functions
function initializeDarkMode() {
    // Check if dark mode is enabled in localStorage
    const isDarkMode = localStorage.getItem('puter_ai_chat_dark_mode') === 'true';

    // Set the dark mode toggle switch
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModeToggle) {
        darkModeToggle.checked = isDarkMode;
    }

    // Apply dark mode if enabled
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    }
}

function toggleDarkMode(e) {
    const isDarkMode = e.target.checked;

    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }

    // Save preference to localStorage
    localStorage.setItem('puter_ai_chat_dark_mode', isDarkMode ? 'true' : 'false');
}

function initializeTextSizeSlider() {
    const slider = document.getElementById('text-size-slider');
    const input = document.getElementById('text-size-input');

    if (!slider || !input) return;

    // Get saved text size from localStorage or use default
    const savedSize = localStorage.getItem('text-size') || '100';

    // Set initial values
    slider.value = savedSize;
    input.value = savedSize;

    // Apply the text size
    applyTextSize(savedSize);
}

function updateTextSize(e) {
    const size = e.target.value;

    // Update the number input
    const input = document.getElementById('text-size-input');
    input.value = size;

    // Apply the text size
    applyTextSize(size);

    // Save to localStorage
    localStorage.setItem('text-size', size);
}

function updateTextSizeFromInput(e) {
    let size = e.target.value;

    // Validate the input
    if (size < 60) {
        size = 60;
        e.target.value = 60;
    }
    if (size > 200) {
        size = 200;
        e.target.value = 200;
    }

    // Update the slider
    const slider = document.getElementById('text-size-slider');
    slider.value = size;

    // Apply the text size
    applyTextSize(size);

    // Save to localStorage
    localStorage.setItem('text-size', size);
}

function applyTextSize(sizePercent) {
    // Base font size is 16px
    const baseFontSize = 16;
    const newSize = (baseFontSize * sizePercent / 100).toFixed(2);

    // Apply to root element
    document.documentElement.style.fontSize = `${newSize}px`;

    // Log the change
    console.log(`Text size set to ${sizePercent}% (${newSize}px)`);
}

function initializeTerminalCalls() {
    // Check if terminal calls are enabled in localStorage
    const isTerminalEnabled = localStorage.getItem('terminal-calls') === 'true';

    // Set the terminal toggle switch
    const terminalToggle = document.getElementById('terminal-calls-toggle');
    if (terminalToggle) {
        terminalToggle.checked = isTerminalEnabled;
    }

    // Show terminal if enabled
    if (isTerminalEnabled) {
        document.getElementById('terminal-box').style.display = 'block';
    }

    // Set up terminal minimize button
    const minimizeTerminalBtn = document.getElementById('minimize-terminal-btn');
    if (minimizeTerminalBtn) {
        minimizeTerminalBtn.addEventListener('click', minimizeTerminal);
    }

    // Set up terminal clear button
    const clearTerminalBtn = document.getElementById('clear-terminal-btn');
    if (clearTerminalBtn) {
        clearTerminalBtn.addEventListener('click', clearTerminal);
    }
}

function toggleTerminalCalls(e) {
    const isEnabled = e.target.checked;

    // Show or hide the terminal
    document.getElementById('terminal-box').style.display = isEnabled ? 'block' : 'none';

    // Save preference to localStorage
    localStorage.setItem('terminal-calls', isEnabled);

    // Add a log message
    if (isEnabled) {
        logToTerminal('Terminal calls enabled');
    }
}

function logToTerminal(message) {
    const terminalText = document.getElementById('terminal-text');
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

    terminalText.innerHTML += `[${timestamp}] ${message}\n`;

    // Auto-scroll to bottom
    terminalText.scrollTop = terminalText.scrollHeight;
}

function minimizeTerminal() {
    const terminalBox = document.getElementById('terminal-box');

    if (terminalBox.classList.contains('minimized')) {
        terminalBox.classList.remove('minimized');
        document.getElementById('minimize-terminal-btn').textContent = 'Minimize';
    } else {
        terminalBox.classList.add('minimized');
        document.getElementById('minimize-terminal-btn').textContent = 'Expand';
    }
}

function clearTerminal() {
    document.getElementById('terminal-text').innerHTML = '';
}

function requestLocationAccess() {
    const locationBtn = document.getElementById('location-access-btn');
    const locationBox = document.createElement('div');
    locationBox.id = 'location-box';
    locationBox.className = 'location-box';

    // Remove existing box if any
    const existingBox = document.getElementById('location-box');
    if (existingBox) {
        existingBox.remove();
    }

    if (navigator.geolocation) {
        locationBtn.disabled = true;
        locationBtn.textContent = 'Requesting location...';

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude.toFixed(6);
                const lng = position.coords.longitude.toFixed(6);

                // Save to localStorage
                localStorage.setItem('location-access', 'true');
                localStorage.setItem('location-coords', JSON.stringify({lat, lng}));

                // Update button
                locationBtn.disabled = false;
                locationBtn.textContent = 'Enable Precise Location';

                // Create coordinates display
                const coordsText = document.createElement('div');
                coordsText.className = 'location-coordinates';
                coordsText.textContent = `Coordinates: ${lat}, ${lng}`;

                // Create map button
                const mapBtn = document.createElement('button');
                mapBtn.className = 'feature-btn map-btn';
                mapBtn.innerHTML = '<i class="fas fa-map-marker-alt"></i> Display on Map';
                mapBtn.addEventListener('click', () => showLocationMap(lat, lng));

                // Add to location box
                locationBox.appendChild(coordsText);
                locationBox.appendChild(mapBtn);

                // Add location box to DOM
                locationBtn.parentNode.appendChild(locationBox);

                console.log(`Location access granted! Latitude: ${lat}, Longitude: ${lng}`);
            },
            (error) => {
                // Update button
                locationBtn.disabled = false;
                locationBtn.textContent = 'Enable Precise Location';

                // Add error message
                const errorText = document.createElement('div');
                errorText.className = 'location-error';
                errorText.textContent = `Error: ${error.message}`;
                locationBox.appendChild(errorText);

                // Add location box to DOM
                locationBtn.parentNode.appendChild(locationBox);

                localStorage.setItem('location-access', 'false');
                console.error(`Error getting location: ${error.message}`);
            }
        );
    } else {
        const errorText = document.createElement('div');
        errorText.className = 'location-error';
        errorText.textContent = 'Geolocation is not supported by this browser.';
        locationBox.appendChild(errorText);

        // Add location box to DOM
        locationBtn.parentNode.appendChild(locationBox);

        console.error('Geolocation is not supported by this browser.');
    }
}

function showLocationMap(lat, lng) {
    // Create map modal
    const mapModal = document.createElement('div');
    mapModal.className = 'modal';
    mapModal.id = 'map-modal';
    mapModal.style.display = 'block';

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';

    const closeBtn = document.createElement('span');
    closeBtn.className = 'close-modal';
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', () => document.body.removeChild(mapModal));

    const title = document.createElement('h3');
    title.textContent = 'Your Location';

    const mapContainer = document.createElement('div');
    mapContainer.id = 'map-container';
    mapContainer.style.width = '100%';
    mapContainer.style.height = '400px';
    mapContainer.style.marginTop = '15px';

    // Create iframe with OpenStreetMap
    const mapIframe = document.createElement('iframe');
    mapIframe.width = '100%';
    mapIframe.height = '100%';
    mapIframe.frameBorder = '0';
    mapIframe.scrolling = 'no';
    mapIframe.marginHeight = '0';
    mapIframe.marginWidth = '0';
    mapIframe.src = `https://www.openstreetmap.org/export/embed.html?bbox=${lng-0.01},${lat-0.01},${lng+0.01},${lat+0.01}&layer=mapnik&marker=${lat},${lng}`;

    mapContainer.appendChild(mapIframe);

    // Add link to open in full map
    const mapLink = document.createElement('a');
    mapLink.href = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=15/${lat}/${lng}`;
    mapLink.target = '_blank';
    mapLink.textContent = 'View on OpenStreetMap';
    mapLink.style.display = 'block';
    mapLink.style.marginTop = '10px';
    mapLink.style.textAlign = 'center';

    modalContent.appendChild(closeBtn);
    modalContent.appendChild(title);
    modalContent.appendChild(mapContainer);
    modalContent.appendChild(mapLink);

    mapModal.appendChild(modalContent);
    document.body.appendChild(mapModal);
}

// Initialize compact mode
function initializeCompactMode() {
    const compactModeToggle = document.getElementById('compact-mode');
    if (!compactModeToggle) return;

    // Check if compact mode is enabled in localStorage
    const isCompactMode = localStorage.getItem('compact-mode') === 'true';

    // Set the toggle
    compactModeToggle.checked = isCompactMode;

    // Apply compact mode if enabled
    if (isCompactMode) {
        document.body.classList.add('compact-mode');
    }

    // Add event listener
    compactModeToggle.addEventListener('change', toggleCompactMode);
}

// Toggle compact mode
function toggleCompactMode(e) {
    const isEnabled = e.target.checked;

    if (isEnabled) {
        document.body.classList.add('compact-mode');
    } else {
        document.body.classList.remove('compact-mode');
    }

    // Save preference to localStorage
    localStorage.setItem('compact-mode', isEnabled);
}

// Restore location coordinates if available
function restoreLocationCoordinates() {
    const locationBtn = document.getElementById('location-access-btn');
    if (!locationBtn) return;

    // Check if location access was granted
    const locationAccess = localStorage.getItem('location-access') === 'true';
    const locationCoords = localStorage.getItem('location-coords');

    if (locationAccess && locationCoords) {
        try {
            const coords = JSON.parse(locationCoords);

            // Create location box
            const locationBox = document.createElement('div');
            locationBox.id = 'location-box';
            locationBox.className = 'location-box';

            // Create coordinates display
            const coordsText = document.createElement('div');
            coordsText.className = 'location-coordinates';
            coordsText.textContent = `Coordinates: ${coords.lat}, ${coords.lng}`;

            // Create map button
            const mapBtn = document.createElement('button');
            mapBtn.className = 'feature-btn map-btn';
            mapBtn.innerHTML = '<i class="fas fa-map-marker-alt"></i> Display on Map';
            mapBtn.addEventListener('click', () => showLocationMap(coords.lat, coords.lng));

            // Add to location box
            locationBox.appendChild(coordsText);
            locationBox.appendChild(mapBtn);

            // Add to DOM
            locationBtn.parentNode.appendChild(locationBox);

            console.log(`Restored location coordinates: ${coords.lat}, ${coords.lng}`);
        } catch (error) {
            console.error('Error restoring location coordinates:', error);
        }
    }
}

function openAiFeaturesModal() {
    document.getElementById('ai-features-modal').style.display = 'block';

    // Set the streaming toggle based on current state
    document.getElementById('stream-toggle-switch').checked = isStreaming;
}

function closeAiFeaturesModal() {
    document.getElementById('ai-features-modal').style.display = 'none';
}

// Open text-to-image modal on top of AI features modal
function openTxt2ImgModal() {
    // Don't close the AI features modal
    document.getElementById('txt2img-modal').style.display = 'block';

    // Set z-index higher than the AI features modal
    document.getElementById('txt2img-modal').style.zIndex = '101';
}

// Extract text from image
function extractTextFromImage(imageElement) {
    // Show loading state
    addAIMessage("Extracting text from image...");

    // In a real implementation, you would call an OCR API here
    // For now, we'll simulate a response
    setTimeout(() => {
        const aiMessages = document.querySelectorAll('.ai-message');
        const lastAiMessage = aiMessages[aiMessages.length - 1];

        // Sample extracted text
        const extractedText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. " +
            "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. " +
            "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris " +
            "nisi ut aliquip ex ea commodo consequat.";

        // Create text display box
        const textBox = document.createElement('div');
        textBox.className = 'extracted-text-box';

        // Add header
        const header = document.createElement('div');
        header.className = 'extracted-text-header';
        header.textContent = 'Extracted Text';

        // Add text area
        const textArea = document.createElement('textarea');
        textArea.className = 'extracted-text-content';
        textArea.value = extractedText;
        textArea.readOnly = true;

        // Add copy button
        const copyBtn = document.createElement('button');
        copyBtn.className = 'feature-btn';
        copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy Text';
        copyBtn.addEventListener('click', () => {
            textArea.select();
            document.execCommand('copy');
            copyBtn.textContent = 'Copied!';
            setTimeout(() => {
                copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy Text';
            }, 2000);
        });

        // Add elements to text box
        textBox.appendChild(header);
        textBox.appendChild(textArea);
        textBox.appendChild(copyBtn);

        // Update message
        lastAiMessage.innerHTML = formatMessage("Text extracted from image:");
        lastAiMessage.appendChild(textBox);

        // Close the modal
        closeAiFeaturesModal();
    }, 2000);
}

// Text to speech variables
let isTtsActive = false;
let ttsForAiResponses = false;

// Text to speech function
function textToSpeech(text) {
    if (!text) {
        // Ask user to type a message
        addAIMessage("Please type a message that you'd like me to read aloud.");

        // Set flag to activate TTS for next user message
        isTtsActive = true;

        // Add TTS indicator to the UI
        addTtsIndicator();

        // Close the modal
        closeAiFeaturesModal();
        return;
    }

    // Show loading state
    addAIMessage("Converting text to speech...");

    // In a real implementation, you would call a text-to-speech API here
    // For now, we'll simulate a response
    setTimeout(() => {
        const aiMessages = document.querySelectorAll('.ai-message');
        const lastAiMessage = aiMessages[aiMessages.length - 1];

        // Create audio element (in a real implementation, this would have a real audio source)
        const audioElement = document.createElement('audio');
        audioElement.controls = true;
        audioElement.src = 'data:audio/mp3;base64,AAAAAAAA'; // Placeholder

        // Create TTS controls
        const ttsControls = document.createElement('div');
        ttsControls.className = 'tts-controls';

        const readAiResponsesLabel = document.createElement('label');
        readAiResponsesLabel.innerHTML = `
            <input type="checkbox" id="tts-ai-responses" ${ttsForAiResponses ? 'checked' : ''}>
            Also read AI responses
        `;

        const stopTtsBtn = document.createElement('button');
        stopTtsBtn.className = 'feature-btn';
        stopTtsBtn.innerHTML = '<i class="fas fa-stop"></i> Stop TTS';
        stopTtsBtn.addEventListener('click', stopTextToSpeech);

        ttsControls.appendChild(readAiResponsesLabel);
        ttsControls.appendChild(stopTtsBtn);

        // Update message
        lastAiMessage.innerHTML = formatMessage("Text converted to speech:");
        lastAiMessage.appendChild(audioElement);
        lastAiMessage.appendChild(ttsControls);

        // Set up event listener for the checkbox
        const aiResponsesCheckbox = document.getElementById('tts-ai-responses');
        if (aiResponsesCheckbox) {
            aiResponsesCheckbox.addEventListener('change', (e) => {
                ttsForAiResponses = e.target.checked;
                localStorage.setItem('tts-for-ai-responses', ttsForAiResponses);
            });
        }

        // Close the modal
        closeAiFeaturesModal();
    }, 2000);
}

// Add TTS indicator to the UI
function addTtsIndicator() {
    // Remove existing indicator if any
    const existingIndicator = document.getElementById('tts-indicator');
    if (existingIndicator) {
        existingIndicator.remove();
    }

    // Create indicator
    const indicator = document.createElement('div');
    indicator.id = 'tts-indicator';
    indicator.className = 'tts-indicator';
    indicator.innerHTML = '<i class="fas fa-volume-up"></i> TTS Active';

    // Add stop button
    const stopBtn = document.createElement('button');
    stopBtn.className = 'tts-stop-btn';
    stopBtn.innerHTML = '<i class="fas fa-stop"></i>';
    stopBtn.title = 'Stop TTS';
    stopBtn.addEventListener('click', stopTextToSpeech);

    indicator.appendChild(stopBtn);

    // Add to DOM
    document.querySelector('.chat-container').appendChild(indicator);
}

// Stop text to speech
function stopTextToSpeech() {
    isTtsActive = false;
    ttsForAiResponses = false;

    // Remove TTS indicator
    const indicator = document.getElementById('tts-indicator');
    if (indicator) {
        indicator.remove();
    }

    // Add message
    addAIMessage("Text-to-speech has been deactivated.");
}

// Agent functions
let agents = [
    { calling: '/fix', name: 'Fix', description: 'Fixes code problems or questions', prompt: 'You are a code fixing assistant. Help the user fix their code problems.' },
    { calling: '/review', name: 'Review', description: 'Reviews text, files or images', prompt: 'You are a review assistant. Help the user review content.' },
    { calling: '/plan', name: 'Plan', description: 'Plans around questions, code, trips, etc.', prompt: 'You are a planning assistant. Help the user create detailed plans.' },
    { calling: '/suggest', name: 'Suggest', description: 'Suggests improvements for code, writing, etc.', prompt: 'You are a suggestion assistant. Help the user improve their work.' },
    { calling: '/find', name: 'Find', description: 'Finds information from knowledge base, chat or web', prompt: 'You are a search assistant. Help the user find information.' },
    { calling: '/code', name: 'Code', description: 'Codes a task as requested', prompt: 'You are a coding assistant. Help the user write code.' },
    { calling: '/edit', name: 'Edit', description: 'Edits text, prompts, code or files', prompt: 'You are an editing assistant. Help the user edit content.' },
    { calling: '/generate', name: 'Generate', description: 'Generates code, stories, images, etc.', prompt: 'You are a generation assistant. Help the user generate content.' },
    { calling: '/note', name: 'Note', description: 'Takes notes and adds to knowledge base', prompt: 'You are a note-taking assistant. Help the user take and organize notes.' },
    { calling: '/knowledge', name: 'Knowledge', description: 'Refers to knowledge base for answers', prompt: 'You are a knowledge assistant. Help the user access information.' },
    { calling: '/tool', name: 'Tool', description: 'Uses appropriate tools for requests', prompt: 'You are a tool-using assistant. Help the user by using appropriate tools.' },
    { calling: '/build', name: 'Build', description: 'Acts upon previous planned messages', prompt: 'You are a building assistant. Help the user implement plans.' },
    { calling: '/talk', name: 'Talk', description: 'Uses text-to-speech to read messages', prompt: 'You are a speaking assistant. Help the user by reading content aloud.' }
];

// Initialize agents from localStorage
function initializeAgents() {
    const savedAgents = localStorage.getItem('agents');
    if (savedAgents) {
        const parsedAgents = JSON.parse(savedAgents);
        // Merge with default agents, keeping user-created ones
        agents = [...agents, ...parsedAgents.filter(agent =>
            !agents.some(defaultAgent => defaultAgent.calling === agent.calling)
        )];
    }

    // Save back to localStorage
    localStorage.setItem('agents', JSON.stringify(agents));
}

// Show agent suggestions
function showAgentSuggestions() {
    // Remove existing suggestions
    hideAgentSuggestions();

    // Create suggestions container
    const suggestionsContainer = document.createElement('div');
    suggestionsContainer.className = 'agent-suggestions';
    suggestionsContainer.id = 'agent-suggestions';

    // Add suggestions
    agents.forEach(agent => {
        const suggestion = document.createElement('div');
        suggestion.className = 'agent-suggestion';

        const nameSpan = document.createElement('span');
        nameSpan.className = 'agent-suggestion-name';
        nameSpan.textContent = agent.calling;

        const descSpan = document.createElement('span');
        descSpan.className = 'agent-suggestion-description';
        descSpan.textContent = agent.description;

        suggestion.appendChild(nameSpan);
        suggestion.appendChild(descSpan);

        suggestion.addEventListener('click', () => {
            // Replace the "/" with the full command
            messageInput.value = messageInput.value.replace(/\/$/, `${agent.calling} `);
            messageInput.focus();
            hideAgentSuggestions();
        });

        suggestionsContainer.appendChild(suggestion);
    });

    // Add to the page
    const inputContainer = document.querySelector('.input-container');
    inputContainer.appendChild(suggestionsContainer);
}

// Hide agent suggestions
function hideAgentSuggestions() {
    const suggestionsContainer = document.getElementById('agent-suggestions');
    if (suggestionsContainer) {
        suggestionsContainer.remove();
    }
}

// Process agent commands
function processAgentCommand(message) {
    // Extract the command and arguments
    const commandMatch = message.match(/^(\/\w+)\s*(.*)/);
    if (!commandMatch) return false;

    const [, command, args] = commandMatch;

    // Find the agent
    const agent = agents.find(a => a.calling === command);
    if (!agent) return false;

    // Add user message to chat
    addUserMessage(message);

    // Clear input
    messageInput.value = '';

    // Process with the agent's prompt
    const systemPrompt = agent.prompt;
    const userPrompt = args || "Please help me with this task.";

    // Add AI thinking message
    addAIMessage(`Processing ${agent.name} command...`);

    // In a real implementation, you would use the agent's prompt as a system prompt
    // For now, we'll just simulate a response
    setTimeout(() => {
        let response;
        switch (command) {
            case '/fix':
                response = "I've analyzed your code and fixed the issues. The main problem was...";
                break;
            case '/review':
                response = "I've reviewed your content. Here's my feedback...";
                break;
            case '/plan':
                response = "Here's a detailed plan for your request:\n\n1. First step\n2. Second step\n3. Third step";
                break;
            case '/suggest':
                response = "Here are some suggestions to improve your work...";
                break;
            case '/find':
                response = "I found the following information related to your query...";
                break;
            case '/code':
                response = "Here's the code you requested:\n\n```javascript\nfunction example() {\n  console.log('Hello world');\n}\n```";
                break;
            case '/edit':
                response = "I've edited your content. Here's the revised version...";
                break;
            case '/generate':
                response = "I've generated the content you requested...";
                break;
            case '/note':
                response = "I've added this to your knowledge base. You can access it later with /knowledge.";
                break;
            case '/knowledge':
                response = "Based on your knowledge base, here's what I found...";
                break;
            case '/tool':
                response = "I'm using the appropriate tool for your request...";
                break;
            case '/build':
                response = "I'm implementing the plan we discussed earlier...";
                break;
            case '/talk':
                response = "I'm reading this message aloud for you now.";
                // In a real implementation, you would call a text-to-speech function here
                break;
            default:
                response = "I'm processing your request with the " + agent.name + " agent.";
        }

        // Update the AI message
        const aiMessages = document.querySelectorAll('.ai-message');
        const lastAiMessage = aiMessages[aiMessages.length - 1];
        lastAiMessage.innerHTML = formatMessage(response);
        applySyntaxHighlighting(lastAiMessage);

        // Save to conversation
        if (currentConversationId) {
            const conversation = conversations.find(c => c.id === currentConversationId);
            if (conversation) {
                // Update the last AI message
                const lastMessage = conversation.messages[conversation.messages.length - 1];
                if (lastMessage && lastMessage.role === 'assistant') {
                    lastMessage.content = response;
                    saveConversations();
                }
            }
        }
    }, 2000);

    return true;
}

// Open new agent modal
function openNewAgentModal() {
    document.getElementById('new-agent-modal').style.display = 'block';

    // Clear form fields
    document.getElementById('agent-calling').value = '/';
    document.getElementById('agent-name').value = '';
    document.getElementById('agent-instructions').value = '';
    document.getElementById('agent-prompt').value = '';
}

// Save new agent
function saveNewAgent() {
    const calling = document.getElementById('agent-calling').value.trim();
    const name = document.getElementById('agent-name').value.trim();
    const instructions = document.getElementById('agent-instructions').value.trim();
    const prompt = document.getElementById('agent-prompt').value.trim();

    // Validate inputs
    if (!calling.startsWith('/')) {
        alert('Agent calling must start with /');
        return;
    }

    if (!name || !instructions || !prompt) {
        alert('All fields are required');
        return;
    }

    // Check if agent already exists
    if (agents.some(agent => agent.calling === calling)) {
        alert('An agent with this calling already exists');
        return;
    }

    // Create new agent
    const newAgent = {
        calling,
        name,
        description: instructions,
        prompt
    };

    // Add to agents array
    agents.push(newAgent);

    // Save to localStorage
    localStorage.setItem('agents', JSON.stringify(agents));

    // Close modal
    document.getElementById('new-agent-modal').style.display = 'none';

    // Show success message
    alert('Agent created successfully!');
}