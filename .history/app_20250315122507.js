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
const codeModal = document.getElementById('code-modal');
const closeModalButtons = document.querySelectorAll('.close-modal');
const imageUpload = document.getElementById('image-upload');
const previewContainer = document.getElementById('preview-container');
const processImageBtn = document.getElementById('process-image-btn');
const imgPrompt = document.getElementById('img-prompt');
const generateImgBtn = document.getElementById('generate-img-btn');
const imgResult = document.getElementById('img-result');
const functionResult = document.getElementById('function-result');
const conversationsList = document.getElementById('conversations-list');
const newChatBtn = document.getElementById('new-chat-btn');
const currentChatTitle = document.getElementById('current-chat-title');
const renameChatBtn = document.getElementById('rename-chat-btn');
const exportChatBtn = document.getElementById('export-chat-btn');
const deleteChatBtn = document.getElementById('delete-chat-btn');
const conversationName = document.getElementById('conversation-name');
const saveNameBtn = document.getElementById('save-name-btn');
const clearAllBtn = document.getElementById('clear-all-btn');
const themeToggle = document.getElementById('theme-toggle');
const codeBtn = document.getElementById('code-btn');
const codeInput = document.getElementById('code-input');
const languageSelector = document.getElementById('language-selector');
const formatCodeBtn = document.getElementById('format-code-btn');

// App State
let isStreaming = false;
let currentUser = null;
let isProcessing = false;
let conversations = [];
let currentConversationId = null;

// Initialize the app
document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
    console.log('Initializing app...');

    // Check if user is already logged in
    checkAuthStatus();

    // Load theme preference
    loadThemePreference();

    // Load conversations
    loadConversations();

    // Create a new conversation if none exists
    if (conversations.length === 0) {
        createNewConversation();
    } else {
        // Load the most recent conversation
        loadConversation(conversations[0].id);
    }

    // Add a welcome message regardless
    if (chatHistory.children.length === 0) {
        addAIMessage("Welcome to Puter AI Chat! Select a model and start chatting. You can also try our other AI features like image generation, OCR, and text-to-speech.");
    }

    // Event listeners
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keydown', handleEnterKey);
    streamToggle.addEventListener('click', toggleStreaming);
    loginBtn.addEventListener('click', login);
    logoutBtn.addEventListener('click', logout);
    txt2imgBtn.addEventListener('click', openTxt2ImgModal);
    img2txtBtn.addEventListener('click', openUploadModal);
    txt2speechBtn.addEventListener('click', convertLastMessageToSpeech);

    // Conversation management
    newChatBtn.addEventListener('click', createNewConversation);
    renameChatBtn.addEventListener('click', openRenameModal);
    saveNameBtn.addEventListener('click', renameConversation);
    exportChatBtn.addEventListener('click', exportConversation);
    deleteChatBtn.addEventListener('click', deleteCurrentConversation);
    clearAllBtn.addEventListener('click', clearAllConversations);

    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);

    // Code formatting
    codeBtn.addEventListener('click', () => codeModal.style.display = 'block');
    formatCodeBtn.addEventListener('click', formatAndInsertCode);

    // Modal event listeners
    closeModalButtons.forEach(btn => {
        btn.addEventListener('click', closeModals);
    });

    // Image upload preview
    imageUpload.addEventListener('change', previewImage);
    processImageBtn.addEventListener('click', processImage);

    // Text to image generation
    generateImgBtn.addEventListener('click', generateImage);

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === uploadModal || e.target === txt2imgModal || e.target === renameModal || e.target === codeModal) {
            closeModals();
        }
    });
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

    // Check if user is logged in with Puter
    puter.auth.isLoggedIn().then(isLoggedIn => {
        console.log('Auth status:', isLoggedIn ? 'Logged in' : 'Not logged in');

        if (isLoggedIn) {
            puter.auth.getUser().then(user => {
                console.log('User info:', user);
                currentUser = user;
                updateAuthUI(true);
            }).catch(error => {
                console.error('Error getting user info:', error);
                updateAuthUI(false);
            });
        } else {
            updateAuthUI(false);
        }
    }).catch(error => {
        console.error('Auth check error:', error);
        updateAuthUI(false);
    });
}

function login() {
    // Check if Puter API is available
    if (typeof puter === 'undefined' || !puter.auth) {
        console.error('Puter API not available for login');
        alert('Error: Puter API not available. Please check your connection and reload the page.');
        return;
    }

    console.log('Attempting to login...');

    puter.auth.login().then(user => {
        console.log('Login successful:', user);
        currentUser = user;
        updateAuthUI(true);

        // Load user's conversations
        loadConversations();

        // Create directory for storing conversations if it doesn't exist
        if (puter.fs && typeof puter.fs.mkdir === 'function') {
            puter.fs.mkdir('/apps/ai-chat').catch(error => {
                // Directory might already exist, that's fine
                console.log('Directory already exists or error creating it:', error);
            });
        } else {
            console.warn('puter.fs.mkdir not available');
        }
    }).catch(error => {
        console.error('Login error:', error);
        alert('Login failed: ' + (error.message || 'Unknown error'));
    });
}

function logout() {
    puter.auth.logout().then(() => {
        currentUser = null;
        updateAuthUI(false);
    }).catch(error => {
        console.error('Logout error:', error);
    });
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
    
    // Add user message to chat
    addUserMessage(message);
    
    // Clear input
    messageInput.value = '';
    
    // Process the message
    processUserMessage(message);
}

function handleEnterKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
}

async function processUserMessage(message) {
    isProcessing = true;

    // Get selected model
    const selectedModel = modelSelector.value;

    // Create a placeholder for AI response
    const aiMessageElement = document.createElement('div');
    aiMessageElement.className = 'message ai-message';

    // Check if Puter API is available
    if (typeof puter === 'undefined' || !puter.ai) {
        aiMessageElement.innerHTML = 'Error: Puter API not available. Please check your connection and reload the page.';
        chatHistory.appendChild(aiMessageElement);
        addTimestampToMessage(aiMessageElement);
        console.error('Puter API not available');
        isProcessing = false;
        scrollToBottom();
        return;
    }

    if (isStreaming) {
        aiMessageElement.innerHTML = '<span class="typing-indicator"></span>';
        chatHistory.appendChild(aiMessageElement);
        scrollToBottom();

        try {
            console.log('Sending streaming message with model:', selectedModel);

            // Use streaming API
            const response = await puter.ai.chat(message, {
                model: selectedModel,
                stream: true,
                tools: getWeatherTools() // Add function calling capability
            });

            // Clear the typing indicator
            aiMessageElement.innerHTML = '';

            // Process the stream
            let fullResponse = '';
            for await (const part of response) {
                if (part?.text) {
                    fullResponse += part.text;
                    aiMessageElement.innerHTML = formatMessage(fullResponse);
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
            console.log('Sending non-streaming message with model:', selectedModel);

            // Use regular API
            const response = await puter.ai.chat(message, {
                model: selectedModel,
                tools: getWeatherTools() // Add function calling capability
            });

            console.log('Received response:', response);

            // Update message with response
            const responseContent = response.message?.content || 'No response content';
            aiMessageElement.innerHTML = formatMessage(responseContent);

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

            // Update conversation title if it's the first message
            if (conversation.messages.length === 1) {
                const title = message.substring(0, 30) + (message.length > 30 ? '...' : '');
                conversation.title = title;
                currentChatTitle.textContent = title;
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
                role: 'assistant',
                content: message,
                timestamp: timestamp
            });
            saveConversations();
        }
    }
}

function formatMessage(message) {
    // Convert URLs to links
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return message.replace(/\n/g, '<br>').replace(urlRegex, '<a href="$1" target="_blank">$1</a>');
}

function addTimestampToMessage(messageElement, isoTimestamp) {
    const timestamp = document.createElement('div');
    timestamp.className = 'message-time';

    // Use provided timestamp or current time
    const date = isoTimestamp ? new Date(isoTimestamp) : new Date();
    timestamp.textContent = date.toLocaleTimeString();

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
    currentChatTitle.textContent = newConversation.title;
    chatHistory.innerHTML = '';

    // Add welcome message
    addAIMessage("Welcome to Puter AI Chat! Select a model and start chatting. You can also try our other AI features like image generation, OCR, and text-to-speech.");

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
    currentChatTitle.textContent = conversation.title;

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

        // Add timestamp
        addTimestampToMessage(messageElement, msg.timestamp);

        chatHistory.appendChild(messageElement);
    });

    // If empty, add welcome message
    if (conversation.messages.length === 0) {
        addAIMessage("Welcome to Puter AI Chat! Select a model and start chatting. You can also try our other AI features like image generation, OCR, and text-to-speech.");
    }

    // Update UI to show active conversation
    updateConversationsList();

    // Scroll to bottom
    scrollToBottom();
}

function updateConversationsList() {
    // Clear the list
    conversationsList.innerHTML = '';

    // Add each conversation
    conversations.forEach(conv => {
        const item = document.createElement('div');
        item.className = 'conversation-item';
        if (conv.id === currentConversationId) {
            item.classList.add('active');
        }

        const title = document.createElement('div');
        title.className = 'conversation-title';
        title.textContent = conv.title;

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-conversation';
        deleteBtn.innerHTML = '&times;';
        deleteBtn.title = 'Delete conversation';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            deleteConversation(conv.id);
        };

        item.appendChild(title);
        item.appendChild(deleteBtn);

        // Add click event to load conversation
        item.addEventListener('click', () => loadConversation(conv.id));

        conversationsList.appendChild(item);
    });
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
        currentChatTitle.textContent = newName;
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
    if (currentUser) {
        // If logged in, save to Puter storage
        puter.fs.write(`/apps/ai-chat/conversations_${currentUser.username}.json`, JSON.stringify(conversations))
            .catch(error => {
                console.error('Error saving conversations to Puter:', error);
                // Fallback to localStorage
                localStorage.setItem('puter_ai_chat_conversations', JSON.stringify(conversations));
            });
    } else {
        // Otherwise use localStorage
        localStorage.setItem('puter_ai_chat_conversations', JSON.stringify(conversations));
    }
}

function loadConversations() {
    if (currentUser) {
        // Try to load from Puter storage first
        puter.fs.read(`/apps/ai-chat/conversations_${currentUser.username}.json`)
            .then(data => {
                try {
                    conversations = JSON.parse(data);
                    updateConversationsList();
                } catch (e) {
                    console.error('Error parsing conversations:', e);
                    // Fallback to localStorage
                    loadFromLocalStorage();
                }
            })
            .catch(error => {
                console.log('No conversations found in Puter storage, checking localStorage');
                loadFromLocalStorage();
            });
    } else {
        // Load from localStorage
        loadFromLocalStorage();
    }
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
function closeModals() {
    uploadModal.style.display = 'none';
    txt2imgModal.style.display = 'none';
    renameModal.style.display = 'none';
    codeModal.style.display = 'none';

    // Reset modal content
    previewContainer.innerHTML = '';
    imgResult.innerHTML = '';
    imageUpload.value = '';
    imgPrompt.value = '';
    conversationName.value = '';
    codeInput.value = '';
}