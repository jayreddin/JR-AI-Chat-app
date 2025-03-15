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

    // Create a new conversation if none exists
    if (conversations.length === 0) {
        createNewConversation();
    } else {
        // Load the most recent conversation
        loadConversation(conversations[0].id);
    }

    // Add a welcome message regardless
    if (chatHistory.children.length === 0) {
        addAIMessage("# Welcome to JR AI Chat! \n\nSelect a model from the dropdown above and start chatting. You can also try our other AI features like image generation, OCR, and text-to-speech by clicking the ⚙️ Settings button.");
    }

    // Event listeners
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keydown', handleEnterKey);
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
    document.getElementById('settings-btn').addEventListener('click', openSettingsModal);

    // Settings modal
    saveSettingsBtn.addEventListener('click', closeSettingsModal);
    cancelSettingsBtn.addEventListener('click', closeSettingsModal);

    // Feature buttons (now in settings modal)
    streamToggle.addEventListener('click', toggleStreaming);
    txt2imgBtn.addEventListener('click', openTxt2ImgModal);
    img2txtBtn.addEventListener('click', openUploadModal);
    txt2speechBtn.addEventListener('click', convertLastMessageToSpeech);
    themeToggle.addEventListener('click', toggleTheme);
    clearAllBtn.addEventListener('click', clearAllConversations);
    exportChatBtn.addEventListener('click', exportConversation);

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

    // Check for knowledge base references
    const processedMessage = processKnowledgeBaseReferences(message);

    // Add user message to chat
    addUserMessage(message);

    // Clear input
    messageInput.value = '';

    // Process the message
    processUserMessage(processedMessage);
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

async function processUserMessage(message) {
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

function addUserMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.className = 'message user-message';
    messageElement.innerHTML = formatMessage(message);

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
            conversation.messages.push({
                role: 'user',
                content: message,
                timestamp: timestamp
            });
            saveConversations();

            // Auto-generate conversation title if it's the first message
            if (conversation.messages.length === 1) {
                const title = message.substring(0, 30) + (message.length > 30 ? '...' : '');
                conversation.title = title;
                // We removed the currentChatTitle element, so we don't need to update it
                updateConversationsList();
                saveConversations();
            }
        }
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
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        const previewContainer = document.getElementById('utility-preview-container');
        previewContainer.innerHTML = '';
        const img = document.createElement('img');
        img.src = event.target.result;
        img.style.maxWidth = '100%';
        img.style.maxHeight = '300px';
        previewContainer.appendChild(img);
    };
    reader.readAsDataURL(file);
}

function processUtilityImage() {
    const fileInput = document.getElementById('utility-image-upload');
    const file = fileInput.files[0];
    if (!file) return;

    // Add user message about the image
    addUserMessage('I uploaded an image');

    // Process the image (similar to processImage function)
    if (typeof puter !== 'undefined' && puter.ai && typeof puter.ai.img2txt === 'function') {
        puter.ai.img2txt(file)
            .then(extractedText => {
                addAIMessage(`I extracted the following text from your image:\n\n${extractedText}`);
            })
            .catch(error => {
                addAIMessage(`Error processing image: ${error.message}`);
            });
    } else {
        addAIMessage("Image processing is not available. The API might not be loaded correctly.");
    }

    closeModals();
}

function openFileUploadModal() {
    document.getElementById('file-upload-modal').style.display = 'block';
}

function processFileUpload() {
    const fileInput = document.getElementById('file-upload');
    const file = fileInput.files[0];
    if (!file) return;

    // Add user message about the file
    addUserMessage(`I uploaded a file: ${file.name}`);

    // For now, just acknowledge the upload
    addAIMessage(`I see you've uploaded a file named "${file.name}". What would you like me to do with it?`);

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

    // Log active tools
    const activeTools = toolsDatabase.filter(tool => tool.isActive);
    console.log('Active tools:', activeTools);

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

    // Populate the MCP server list
    populateMcpServerList();

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
}

function populateMcpServerList() {
    const mcpList = document.querySelector('.mcp-list');
    if (!mcpList) return;

    mcpList.innerHTML = '';

    mcpServers.forEach(server => {
        const item = document.createElement('div');
        item.className = 'mcp-item';

        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'mcp-server';
        radio.id = `mcp-${server.name.toLowerCase().replace(/\s+/g, '-')}`;
        radio.checked = server.url === activeMcpServer.url;
        radio.value = server.url;

        const label = document.createElement('label');
        label.htmlFor = radio.id;
        label.textContent = server.name;

        const description = document.createElement('span');
        description.className = 'mcp-description';
        description.textContent = server.description;

        const connectBtn = document.createElement('button');
        connectBtn.className = 'mcp-connect-btn';
        connectBtn.textContent = server.url === activeMcpServer.url ? 'Connected' : 'Connect';
        connectBtn.disabled = server.url === activeMcpServer.url;
        connectBtn.addEventListener('click', () => connectToMcpServer(server));

        item.appendChild(radio);
        item.appendChild(label);
        item.appendChild(description);
        item.appendChild(connectBtn);

        mcpList.appendChild(item);
    });
}

function searchMcpServers() {
    const searchInput = document.getElementById('mcp-search-input');
    const searchTerm = searchInput.value.toLowerCase();

    const mcpItems = document.querySelectorAll('.mcp-item');

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

function connectToMcpServer(server) {
    // In a real implementation, we would establish a connection to the server
    console.log(`Connecting to MCP server: ${server.name} at ${server.url}`);

    // Update active server
    activeMcpServer = server;

    // Show a success message
    alert(`Connected to ${server.name} MCP server!`);

    // Update the UI
    populateMcpServerList();
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

        // Add the new server
        mcpServers.push({
            name,
            description: description || 'Custom MCP server',
            url,
            isDefault: false
        });

        // Update the UI
        populateMcpServerList();

        // Close the modal
        document.body.removeChild(modal);
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
    // Save MCP settings
    const selectedRadio = document.querySelector('input[name="mcp-server"]:checked');
    if (selectedRadio) {
        const serverUrl = selectedRadio.value;
        const server = mcpServers.find(s => s.url === serverUrl);

        if (server) {
            activeMcpServer = server;
            console.log(`Selected MCP server: ${server.name}`);
        }
    }

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

        // Close the modal
        document.body.removeChild(modal);
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

        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'reasoning-prompt';
        radio.id = prompt.id;

        const label = document.createElement('label');
        label.htmlFor = prompt.id;
        label.textContent = prompt.title;

        const editBtn = document.createElement('button');
        editBtn.className = 'prompt-edit-btn';
        editBtn.innerHTML = '<i class="fas fa-edit"></i>';
        editBtn.title = 'Edit Prompt';
        editBtn.addEventListener('click', () => {
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