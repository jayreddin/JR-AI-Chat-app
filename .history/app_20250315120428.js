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
const closeModalButtons = document.querySelectorAll('.close-modal');
const imageUpload = document.getElementById('image-upload');
const previewContainer = document.getElementById('preview-container');
const processImageBtn = document.getElementById('process-image-btn');
const imgPrompt = document.getElementById('img-prompt');
const generateImgBtn = document.getElementById('generate-img-btn');
const imgResult = document.getElementById('img-result');
const functionResult = document.getElementById('function-result');

// App State
let isStreaming = false;
let currentUser = null;
let isProcessing = false;

// Initialize the app
document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
    // Check if user is already logged in
    checkAuthStatus();
    
    // Event listeners
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keydown', handleEnterKey);
    streamToggle.addEventListener('click', toggleStreaming);
    loginBtn.addEventListener('click', login);
    logoutBtn.addEventListener('click', logout);
    txt2imgBtn.addEventListener('click', openTxt2ImgModal);
    img2txtBtn.addEventListener('click', openUploadModal);
    txt2speechBtn.addEventListener('click', convertLastMessageToSpeech);
    
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
        if (e.target === uploadModal || e.target === txt2imgModal) {
            closeModals();
        }
    });
    
    // Add a welcome message
    addAIMessage("Welcome to Puter AI Chat! Select a model and start chatting. You can also try our other AI features like image generation, OCR, and text-to-speech.");
}

// Authentication functions
function checkAuthStatus() {
    // Check if user is logged in with Puter
    puter.auth.isLoggedIn().then(isLoggedIn => {
        if (isLoggedIn) {
            puter.auth.getUser().then(user => {
                currentUser = user;
                updateAuthUI(true);
            });
        } else {
            updateAuthUI(false);
        }
    }).catch(error => {
        console.error('Auth check error:', error);
    });
}

function login() {
    puter.auth.login().then(user => {
        currentUser = user;
        updateAuthUI(true);
    }).catch(error => {
        console.error('Login error:', error);
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
    
    if (isStreaming) {
        aiMessageElement.innerHTML = '<span class="typing-indicator"></span>';
        chatHistory.appendChild(aiMessageElement);
        scrollToBottom();
        
        try {
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
            addTimestampToMessage(aiMessageElement);
            
        } catch (error) {
            aiMessageElement.textContent = `Error: ${error.message}`;
            console.error('AI chat error:', error);
        }
    } else {
        // Show loading message
        aiMessageElement.textContent = 'Thinking...';
        chatHistory.appendChild(aiMessageElement);
        scrollToBottom();
        
        try {
            // Use regular API
            const response = await puter.ai.chat(message, {
                model: selectedModel,
                tools: getWeatherTools() // Add function calling capability
            });
            
            // Update message with response
            aiMessageElement.innerHTML = formatMessage(response.message.content);
            
            // Add timestamp
            addTimestampToMessage(aiMessageElement);
            
            // Check for function calls
            if (response.message.tool_calls && response.message.tool_calls.length > 0) {
                handleFunctionCalls(response.message.tool_calls, message);
            }
            
        } catch (error) {
            aiMessageElement.textContent = `Error: ${error.message}`;
            console.error('AI chat error:', error);
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
    addTimestampToMessage(messageElement);
    
    chatHistory.appendChild(messageElement);
    scrollToBottom();
}

function addAIMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.className = 'message ai-message';
    messageElement.innerHTML = formatMessage(message);
    
    // Add timestamp
    addTimestampToMessage(messageElement);
    
    chatHistory.appendChild(messageElement);
    scrollToBottom();
}

function formatMessage(message) {
    // Convert URLs to links
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return message.replace(/\n/g, '<br>').replace(urlRegex, '<a href="$1" target="_blank">$1</a>');
}

function addTimestampToMessage(messageElement) {
    const timestamp = document.createElement('div');
    timestamp.className = 'message-time';
    timestamp.textContent = new Date().toLocaleTimeString();
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

// Utility functions
function closeModals() {
    uploadModal.style.display = 'none';
    txt2imgModal.style.display = 'none';
    
    // Reset modal content
    previewContainer.innerHTML = '';
    imgResult.innerHTML = '';
    imageUpload.value = '';
    imgPrompt.value = '';
}