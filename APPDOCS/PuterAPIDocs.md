
IMPORTANT: This file contains the concatenated documentation for puter.js, a JavaScript SDK for the Puter Web OS. Use this documentation to answer questions about puter.js, its features, usage, and APIs. 
WAIT FOR MY QUESTIONS BEFORE PROVIDING ANY INFORMATION. DO NOT SAY ANYTHING UNTIL I START ASKING QUESTIONS.













--------------------------------------------
--------------------------------------------

The following document is licensed under the Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License. 

--------------------------------------------
--------------------------------------------

<!--
File: AI/chat.md
-->

Given a prompt returns the completion that best matches the prompt.

## Syntax
```js
puter.ai.chat(prompt)
puter.ai.chat(prompt, options = {})
puter.ai.chat(prompt, testMode = false, options = {})
puter.ai.chat(prompt, imageURL, testMode = false, options = {})
puter.ai.chat(prompt, [imageURLArray], testMode = false, options = {})
puter.ai.chat([messages], testMode = false, options = {})
```

## Parameters
#### `prompt` (String)
A string containing the prompt you want to complete.

#### `options` (Object) (Optional)
An object containing the following properties:
- `model` (String) - The model you want to use for the completion. Defaults to `gpt-4o-mini`. The following models are available:
    - `gpt-4o-mini` (default)
    - `gpt-4o`
    - `o3-mini`
    - `o1-mini`
    - `claude-3-7-sonnet`
    - `claude-3-5-sonnet`
    - `deepseek-chat`
    - `deepseek-reasoner`
    - `gemini-2.0-flash`
    - `gemini-1.5-flash`
    - `meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo`
    - `meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo`
    - `meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo`
    - `mistral-large-latest`
    - `pixtral-large-latest`
    - `codestral-latest`
    - `google/gemma-2-27b-it`
    - `grok-beta`
- `stream` (Boolean) - A boolean indicating whether you want to stream the completion. Defaults to `false`.
- `tools` (Array) (Optional) - An array of function definitions that the AI can call. Each function definition should have:
    - `type` (String) - Must be "function"
    - `function` (Object):
        - `name` (String) - The name of the function
        - `description` (String) - A description of what the function does
        - `parameters` (Object) - JSON Schema object describing the parameters
        - `strict` (Boolean) - Whether to enforce strict parameter validation

#### `testMode` (Boolean) (Optional)
A boolean indicating whether you want to use the test API. Defaults to `false`. This is useful for testing your code without using up API credits.

#### `imageURL` (String)
A string containing the URL of an image you want to provide as context for the completion. Also known as "GPT Vision".

#### `imageURLArray` (Array)
An array of strings containing the URLs of images you want to provide as context for the completion. 

#### `messages` (Array)
An array of objects containing the messages you want to complete. Each object must have a `role` and a `content` property. The `role` property must be one of `system`, `assistant`, `user`, or `function`. The `content` property must be a string containing the message. An example of a valid `messages` parameter is:

```js
[
    {
        role: 'system',
        content: 'Hello, how are you?'
    },
    {
        role: 'user',
        content: 'I am doing well, how are you?'
    },
]
```

Providing a messages array is especially useful for building chatbots where you want to provide context to the completion.

## Return value

When `stream` is set to `false` (default):
- Will resolve to a response object containing the completion message
- If a function call is made, the response will include `tool_calls` array containing:
  - `id` (String) - Unique identifier for the function call
  - `function` (Object):
    - `name` (String) - Name of function to call
    - `arguments` (String) - JSON string of function arguments

When `stream` is set to `true`:
- Returns an async iterable object that you can use with a `for await...of` loop to receive the response in parts as they become available.

In case of an error, the `Promise` will reject with an error message.

## Vendors

We use the following vendors to provide AI services:

- `gpt-4o-mini` (default): OpenAI
- `gpt-4o`: OpenAI 
- `o3-mini`: OpenAI
- `o1-mini`: OpenAI
- `claude-3-5-sonnet`: Anthropic
- `deepseek-chat`: High-Flyer (DeepSeek)
- `deepseek-reasoner`: High-Flyer (DeepSeek)
- `gemini-2.0-flash`: Google
- `gemini-1.5-flash`: Google
- `meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo`: Together.ai
- `meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo`: Together.ai
- `meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo`: Together.ai
- `mistral-large-latest`: Mistral AI
- `pixtral-large-latest`: Mistral AI 
- `codestral-latest`: Mistral AI
- `google/gemma-2-27b-it`: Groq
- `grok-beta`: xAI


## Examples

<strong class="example-title">Ask GPT-4o mini a question</strong>

```html;ai-chatgpt
<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <script>
        puter.ai.chat(`What is life?`).then(puter.print);
    </script>
</body>
</html>
```

<strong class="example-title">GPT-4 Vision</strong>

```html;ai-gpt-vision
<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <img src="https://assets.puter.site/doge.jpeg" style="display:block;">
    <script>
        puter.ai.chat(
            `What do you see?`, 
            `https://assets.puter.site/doge.jpeg`)
        .then(puter.print);
    </script>
</body>
</html>
```

<strong class="example-title">Stream the response</strong>

```html;ai-chat-stream
<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <script>
    (async () => {
        const resp = await puter.ai.chat('Tell me in detail what Rick and Morty is all about.', {model: 'claude', stream: true });
        for await ( const part of resp ) document.write(part?.text.replaceAll('\n', '<br>'));
    })();
    </script>
</body>
</html>
```

<strong class="example-title">Function Calling</strong>

```html;ai-function-calling
<!DOCTYPE html>
<html>
<head>
    <title>Weather Function Calling Demo</title>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://js.puter.com/v2/"></script>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 20px auto;
            padding: 20px;
        }
        .container {
            border: 1px solid #ccc;
            padding: 20px;
            border-radius: 5px;
        }
        input {
            width: 100%;
            padding: 10px;
            margin: 10px 0;
            box-sizing: border-box;
        }
        button {
            width: 100%;
            padding: 10px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        }
        button:disabled {
            background: #ccc;
        }
        #response {
            margin-top: 20px;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 5px;
            display: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Weather Function Calling Demo</h1>
        <input type="text" id="userInput" value="Paris" placeholder="Ask about the weather (e.g. What's the weather in Paris?)" />
        <button id="submit">Submit</button>
        <div id="response"></div>
    </div>

    <script>
        // Mock weather function - in a real app, this would call a weather API
        function getWeather(location) {
            const mockWeatherData = {
                'Paris': '22°C, Partly Cloudy',
                'London': '18°C, Rainy',
                'New York': '25°C, Sunny',
                'Tokyo': '28°C, Clear'
            };
            return mockWeatherData[location] || '20°C, Unknown';
        }

        // Define the tools (functions) available to the AI
        const tools = [{
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

        async function handleSubmit() {
            const userInput = $('#userInput').val();
            if (!userInput) return;

            // Disable button and show loading state
            $('#submit').prop('disabled', true).text('Loading...');
            $('#response').hide();

            try {
                // First message to get function call
                const completion = await puter.ai.chat(userInput, { tools });
                let finalResponse;

                // Check if we got a function call
                if (completion.message.tool_calls && completion.message.tool_calls.length > 0) {
                    const toolCall = completion.message.tool_calls[0];
                    if (toolCall.function.name === 'get_weather') {
                        // Parse the arguments and get weather data
                        const args = JSON.parse(toolCall.function.arguments);
                        const weatherData = getWeather(args.location);
                        // Send the result back to AI for final response
                        finalResponse = await puter.ai.chat([
                            { role: "user", content: userInput },
                            completion.message,
                            { 
                                role: "tool",
                                tool_call_id: toolCall.id,
                                content: weatherData
                            }
                        ]);
                    }
                } else {
                    finalResponse = completion;
                }

                // Display the response
                $('#response').html(`<strong>Response:</strong><br>${finalResponse}`).show();
            } catch (error) {
                $('#response').html(`<strong>Error:</strong><br>${error.message}`).show();
            }

            // Reset button state
            $('#submit').prop('disabled', false).text('Submit');
        }

        // Event handlers
        $(document).ready(function() {
            $('#submit').click(handleSubmit);
            $('#userInput').keypress(function(e) {
                if (e.which == 13) handleSubmit();
            });
        });
    </script>
</body>
</html>```


<!--
File: AI/img2txt.md
-->

Given an image will return the text contained in the image. Also known as OCR (Optical Character Recognition), this API can be used to extract text from images of printed text, handwriting, or any other text-based content.

## Syntax
```js
puter.ai.img2txt(image, testMode = false)
```

## Parameters
#### `image` (String|File|Blob) (required)
A string containing the URL, or path (on Puter) of the image you want to recognize, or a `File` or `Blob` object containing the image. 

#### `testMode` (Boolean) (Optional)
A boolean indicating whether you want to use the test API. Defaults to `false`. This is useful for testing your code without using up API credits.

## Return value
A `Promise` that will resolve to a string containing the text contained in the image.

In case of an error, the `Promise` will reject with an error message.

## Examples

<strong class="example-title">Extract the text contained in an image</strong>

```html;ai-img2txt
<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <script>
        puter.ai.img2txt('https://cdn.handwrytten.com/www/2020/02/home-hero-photo2%402x.png').then(puter.print);
    </script>
</body>
</html>
```


<!--
File: AI/txt2img.md
-->

Given a prompt, generate an image using AI.

## Syntax

```js
puter.ai.txt2img(prompt, testMode = false)
```

## Parameters
#### `prompt` (String) (required)
A string containing the prompt you want to generate an image from.

#### `testMode` (Boolean) (Optional)
A boolean indicating whether you want to use the test API. Defaults to `false`. This is useful for testing your code without using up API credits.

## Return value
A `Promise` that will resolve to an image data URL when the image has been generated.

## Examples

<strong class="example-title">Generate an image of a cat using DALL·E 3</strong>

```html;ai-txt2img
<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <script>
        // Generate an image of a cat using DALL·E 3. Please note that testMode is set to true so that you can test this code without using up API credits.
        puter.ai.txt2img('A picture of a cat.', true).then((image)=>{
            document.body.appendChild(image);
        });
    </script>
</body>
</html>
```


<!--
File: AI/txt2speech.md
-->

Converts text into speech using AI. Supports multiple languages and voices.

## Syntax

```js
puter.ai.txt2speech(text)
puter.ai.txt2speech(text, language = 'en-US')
puter.ai.txt2speech(text, language = 'en-US', testMode = false)
```

## Parameters
#### `text` (String) (required)
A string containing the text you want to convert to speech. The text must be less than 3000 characters long.

#### `language` (String) (optional)
The language to use for speech synthesis. Defaults to `en-US`. The following languages are supported:

- Arabic (`ar-AE`)
- Catalan (`ca-ES`)
- Chinese (Cantonese) (`yue-CN`)
- Chinese (Mandarin) (`cmn-CN`)
- Danish (`da-DK`)
- Dutch (Belgian) (`nl-BE`)
- Dutch (`nl-NL`)
- English (Australian) (`en-AU`)
- English (British) (`en-GB`)
- English (Indian) (`en-IN`)
- English (New Zealand) (`en-NZ`)
- English (South African) (`en-ZA`)
- English (US) (`en-US`)
- English (Welsh) (`en-GB-WLS`)
- Finnish (`fi-FI`)
- French (`fr-FR`)
- French (Belgian) (`fr-BE`)
- French (Canadian) (`fr-CA`)
- German (`de-DE`)
- German (Austrian) (`de-AT`)
- Hindi (`hi-IN`)
- Icelandic (`is-IS`)
- Italian (`it-IT`)
- Japanese (`ja-JP`)
- Korean (`ko-KR`)
- Norwegian (`nb-NO`)
- Polish (`pl-PL`)
- Portuguese (Brazilian) (`pt-BR`)
- Portuguese (European) (`pt-PT`)
- Romanian (`ro-RO`)
- Russian (`ru-RU`)
- Spanish (European) (`es-ES`)
- Spanish (Mexican) (`es-MX`)
- Spanish (US) (`es-US`)
- Swedish (`sv-SE`)
- Turkish (`tr-TR`)
- Welsh (`cy-GB`)

#### `testMode` (Boolean) (Optional)
A boolean indicating whether you want to use the test API. Defaults to `false`. This is useful for testing your code without using up API credits.

## Return value
A `Promise` that will resolve to an MP3 stream when the speech has been synthesized.

## Examples

<strong class="example-title">Convert text to speech</strong>

```html;ai-txt2speech
<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <button id="play">Speak!</button>
    <script>
        document.getElementById('play').addEventListener('click', ()=>{
            puter.ai.txt2speech(`Hello world! Puter is pretty amazing, don't you agree?`).then((audio)=>{
                audio.play();
            });
        });
    </script>
</body>
</html>
```


<!--
File: Apps/create.md
-->

Creates a Puter app with the given name. The app will be created in the user's apps, and will be accessible to this app. The app will be created with no permissions, and will not be able to access any data until permissions are granted to it.

## Syntax
```js
puter.apps.create(name, indexURL)
puter.apps.create(name, indexURL, title)
puter.apps.create(name, indexURL, title, description)
puter.apps.create(options)
```

## Parameters
#### `name` (required)
The name of the app to create. This name must be unique to the user's apps. If an app with this name already exists, the promise will be rejected.

#### `indexURL` (required)
The URL of the app's index page. This URL must be accessible to the user. If this parameter is not provided, the app will be created with no index page. The index page is the page that will be displayed when the app is started.

**IMPORTANT**: The URL *must* start with either `http://` or `https://`. Any other protocols (including `file://`, `ftp://`, etc.) are not allowed and will result in an error. For example:

✅ `https://example.com/app/index.html` <br>
✅ `http://localhost:3000/index.html` <br>
❌ `file:///path/to/index.html` <br>
❌ `ftp://example.com/index.html` <br>

#### `title` (required)
The title of the app. If this parameter is not provided, the app will be created with `name` as its title.

#### `description` (optional)
The description of the app aimed at the end user. If this parameter is not provided, the app will be created with no description.

#### `options` (required)
An object containing the options for the app to create. The object can contain the following properties:
- `name` (required): The name of the app to create. This name must be unique to the user's apps. If an app with this name already exists, the promise will be rejected.
- `indexURL` (required): The URL of the app's index page. This URL must be accessible to the user. If this parameter is not provided, the app will be created with no index page.
- `title` (optional): The human-readable title of the app. If this parameter is not provided, the app will be created with `name` as its title.
- `description` (optional): The description of the app aimed at the end user. If this parameter is not provided, the app will be created with no description.
- `icon` (optional): The new icon of the app.
- `maximizeOnStart` (optional): Whether the app should be maximized when it is started. Defaults to `false`.
- `filetypeAssociations` (optional): An array of strings representing the filetypes that the app can open. Defaults to `[]`. File extentions and MIME types are supported; For example, `[".txt", ".md", "application/pdf"]` would allow the app to open `.txt`, `.md`, and PDF files.

## Return value
A `Promise` that will resolve to the [`app`](/Objects/app/) that was created.

## Examples

<strong class="example-title">Create an app pointing to https://example.com</strong>

```html
<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <script>
        (async () => {
            // (1) Generate a random app name
            let appName = puter.randName();

            // (2) Create the app and prints its UID to the page
            let app = await puter.apps.create(appName, "https://example.com");
            puter.print(`Created app "${app.name}". UID: ${app.uid}`);

            // (3) Delete the app (cleanup)
            await puter.apps.delete(appName);
        })();
    </script>
</body>
</html>
```


<!--
File: Apps/delete.md
-->

Deletes an app with the given name.

## Syntax
```js
puter.apps.delete(name)
```

## Parameters
#### `name` (required)
The name of the app to delete.

## Return value
A `Promise` that will resolve to the app that was deleted.

## Examples

<strong class="example-title">Create a random app then delete it</strong>

```html
<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <script>
        (async () => {
            // (1) Generate a random app name to make sure it doesn't already exist
            let appName = puter.randName();

            // (2) Create the app
            await puter.apps.create(appName, "https://example.com");
            puter.print(`"${appName}" created<br>`);

            // (3) Delete the app
            await puter.apps.delete(appName);
            puter.print(`"${appName}" deleted<br>`);

            // (4) Try to retrieve the app (should fail)
            puter.print(`Trying to retrieve "${appName}"...<br>`);
            try {
                await puter.apps.get(appName);
            } catch (e) {
                puter.print(`"${appName}" could not be retrieved<br>`);
            }
        })();
    </script>
</body>
</html>
```


<!--
File: Apps/get.md
-->

Returns an app with the given name. If the app does not exist, the promise will be rejected.

## Syntax
```js
puter.apps.get(name)
puter.apps.get(name, options)
```

## Parameters
#### `name` (required)
The name of the app to get.

### options (optional)

An object containing the following properties:

- `stats_period` (optional): A string representing the period for which to get the user and open count. Possible values are `today`, `yesterday`, `7d`, `30d`, `this_month`, `last_month`, `this_year`, `last_year`, `month_to_date`, `year_to_date`, `last_12_months`. Default is `all` (all time).

- `icon_size` (optional): An integer representing the size of the icons to return. Possible values are `null`, `16`, `32`, `64`, `128`, `256`, and `512`. Default is `null` (the original size).

## Return value
A `Promise` that will resolve to the [`app`](/Objects/app/) with the given name.

## Examples

<strong class="example-title">Create a random app then get it</strong>

```html
<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <script>
        (async () => {
            // (1) Generate a random app name to make sure it doesn't already exist
            let appName = puter.randName();

            // (2) Create the app
            await puter.apps.create(appName, "https://example.com");
            puter.print(`"${appName}" created<br>`);

            // (3) Retrieve the app using get()
            let app = await puter.apps.get(appName);
            puter.print(`"${appName}" retrieved using get(): id: ${app.uid}<br>`);

            // (4) Delete the app (cleanup)
            await puter.apps.delete(appName);
        })();
    </script>
</body>
</html>
```


<!--
File: Apps/list.md
-->

Returns an array of all apps belonging to the user and that this app has access to. If the user has no apps, the array will be empty.

## Syntax
```js
puter.apps.list()
puter.apps.list(options)
```

## Parameters

### options (optional)

An object containing the following properties:

- `stats_period` (optional): A string representing the period for which to get the user and open count. Possible values are `today`, `yesterday`, `7d`, `30d`, `this_month`, `last_month`, `this_year`, `last_year`, `month_to_date`, `year_to_date`, `last_12_months`. Default is `all` (all time).

- `icon_size` (optional): An integer representing the size of the icons to return. Possible values are `null`, `16`, `32`, `64`, `128`, `256`, and `512`. Default is `null` (the original size).

## Return value
A `Promise` that will resolve to an array of all [`app`s](/Objects/app/) belonging to the user that this app has access to.

## Examples

<strong class="example-title">Create 3 random apps and then list them</strong>
```html
<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <script>
        (async () => {
            // (1) Generate 3 random app names
            let appName_1 = puter.randName();
            let appName_2 = puter.randName();
            let appName_3 = puter.randName();

            // (2) Create 3 apps
            await puter.apps.create(appName_1, 'https://example.com');
            await puter.apps.create(appName_2, 'https://example.com');
            await puter.apps.create(appName_3, 'https://example.com');

            // (3) Get all apps (list)
            let apps = await puter.apps.list();

            // (4) Display the names of the apps
            puter.print(JSON.stringify(apps.map(app => app.name)));

            // (5) Delete the 3 apps we created earlier (cleanup)
            await puter.apps.delete(appName_1);
            await puter.apps.delete(appName_2);
            await puter.apps.delete(appName_3);
        })();
    </script>
</body>
</html>
```


<!--
File: Apps/update.md
-->

Updates attributes of the app with the given name.

## Syntax
```js
puter.apps.update(name, attributes)
```

## Parameters
#### `name` (required)
The name of the app to update.

#### `attributes` (required)
An object containing the attributes to update. The object can contain the following properties:
- `name` (optional): The new name of the app. This name must be unique to the user's apps. If an app with this name already exists, the promise will be rejected.
- `indexURL` (optional): The new URL of the app's index page. This URL must be accessible to the user.
- `title` (optional): The new title of the app.
- `description` (optional): The new description of the app aimed at the end user.
- `icon` (optional): The new icon of the app.
- `maximizeOnStart` (optional): Whether the app should be maximized when it is started. Defaults to `false`.
- `filetypeAssociations` (optional): An array of strings representing the filetypes that the app can open. Defaults to `[]`. File extentions and MIME types are supported; For example, `[".txt", ".md", "application/pdf"]` would allow the app to open `.txt`, `.md`, and PDF files.

## Return value
A `Promise` that will resolve to the [`app`](/Objects/app/) that was updated.

## Examples

<strong class="example-title">Create a random app then change its title</strong>

```html
<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <script>
        (async () => {
            // (1) Create a random app
            let appName = puter.randName();
            await puter.apps.create(appName, "https://example.com")
            puter.print(`"${appName}" created<br>`);

            // (2) Update the app
            let updated_app = await puter.apps.update(appName, {title: "My Updated Test App!"})
            puter.print(`Changed title to "${updated_app.title}"<br>`);

            // (3) Delete the app (cleanup)
            await puter.apps.delete(appName)
        })();
    </script>
</body>
</html>
```


<!--
File: Auth/getUser.md
-->

Returns the user's basic information.


## Syntax

```js
puter.auth.getUser();
```

## Parameters

None

## Return value

A promise that resolves to an object containing the user's basic information. The user's basic information is an object with the following properties:

- `uuid` - The user's UUID. This is a unique identifier that can be used to identify the user.
- `username` - The user's username.
- `email_confirmed` - Whether the user has confirmed their email address.

## Example

```html;auth-get-user
<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <script>
        puter.auth.getUser().then(function(user) {
            puter.print(JSON.stringify(user));
        });
    </script>
</body>
</html>
```


<!--
File: Auth/isSignedIn.md
-->

Checks whether the user is signed into the application.

## Syntax

```js
puter.auth.isSignedIn();
```

## Parameters

None

## Return value

Returns `true` if the user is signed in, `false` otherwise.

## Example

```html
<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <script>
        puter.print(puter.auth.isSignedIn());
    </script>
</body>
</html>
```

<!--
File: Auth/signIn.md
-->

Initiates the sign in process for the user. This will open a popup window with the appropriate authentication method. Puter automatically handles the authentication process and will resolve the promise when the user has signed in.

It is important to note that all essential methods in Puter handle authentication automatically. This method is only necessary if you want to handle authentication manually, for example if you want to build your own custom authentication flow.

## Syntax

```js
puter.auth.signIn();
```

## Parameters

None

## Return value

A `Promise` that will resolve to `true` when the user has signed in. The promise will never reject.

## Example

```html;auth-sign-in
<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <button id="sign-in">Sign in</button>
    <script>
        // Because signIn() opens a popup window, it must be called from a user action.
        document.getElementById('sign-in').addEventListener('click', async () => {
            // signIn() will resolve when the user has signed in.
            await puter.auth.signIn().then((res) => {
                puter.print('Signed in<br>' + JSON.stringify(res));
            });
        });
    </script>
</body>
</html>
```


<!--
File: Auth/signOut.md
-->

Signs the user out of the application.


## Syntx

```js
puter.auth.signOut();
```

## Parameters

None

## Return value

None

## Example

```html;auth-sign-out
<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <script>
        puter.auth.signOut();
    </script>
</body>
</html>
```


<!--
File: Drivers/call.md
-->

A low-level function that allows you to call any driver on any interface. This function is useful when you want to call a driver that is not directly exposed by Puter.js's high-level API or for when you need more control over the driver call.

## Syntax
```js
puter.drivers.call(interface, driver, method)
puter.drivers.call(interface, driver, method, args = {})
```

## Parameters
#### `interface` (String) (Required)
The name of the interface you want to call.

#### `driver` (String) (Required)
The name of the driver you want to call.

#### `method` (String) (Required)
The name of the method you want to call on the driver.

#### `args` (Array) (Optional)
An object containing the arguments you want to pass to the driver.

## Return value

A `Promise` that will resolve to the result of the driver call. The result can be of any type, depending on the driver you are calling.

In case of an error, the `Promise` will reject with an error message.


<!--
File: FS/copy.md
-->

Copies a file or directory from one location to another. 

## Syntax

```js
puter.fs.copy(source, destination)
puter.fs.copy(source, destination, options)
```

## Parameters
#### `source` (String) (Required)
The path to the file or directory to copy.

#### `destination` (String) (Required)
The path to the destination directory. If destination is a directory then the file or directory will be copied into that directory using the same name as the source file or directory. If the destination is a file, we overwrite if overwrite is `true`, otherwise we error.

#### `options` (Object) (Optional)
The options for the `copy` operation. The following options are supported:
- `overwrite` (Boolean) - Whether to overwrite the destination file or directory if it already exists. Defaults to `false`.
- `dedupeName` (Boolean) - Whether to deduplicate the file or directory name if it already exists. Defaults to `false`.
- `newName` (String) - The new name to use for the copied file or directory. Defaults to `undefined`.


## Return value
A `Promise` that will resolve to the copied file or directory. If the source file or directory does not exist, the promise will be rejected with an error.

## Examples

<strong class="example-title"> Copy a file</strong>

```html;fs-copy
<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <script>
    (async () => {
        // (1) Create a random text file
        let filename = puter.randName() + '.txt';
        await puter.fs.write(filename, 'Hello, world!');
        puter.print(`Created file: "${filename}"<br>`);

        // (2) create a random directory
        let dirname = puter.randName();
        await puter.fs.mkdir(dirname);
        puter.print(`Created directory: "${dirname}"<br>`);

        // (3) Copy the file into the directory
        puter.fs.copy(filename, dirname).then((file)=>{
            puter.print(`Copied file: "${filename}" to directory "${dirname}"<br>`);
        }).catch((error)=>{
            puter.print(`Error copying file: "${error}"<br>`);
        });
    })()
    </script>
</body>
</html>
```


<!--
File: FS/delete.md
-->

Deletes a file or directory.

## Syntax
```js
puter.fs.delete(path)
puter.fs.delete(path, options)
```

## Parameters
#### `path` (String) (required)
Path of the file or directory to delete.
If `path` is not absolute, it will be resolved relative to the app's root directory.

#### `options` (Object) (optional)
The options for the `delete` operation. The following options are supported:
- `recursive` (Boolean) - Whether to delete the directory recursively. Defaults to `true`.
- `descendantsOnly` (Boolean) - Whether to delete only the descendants of the directory and not the directory itself. Defaults to `false`.


## Return value
A `Promise` that will resolve when the file or directory is deleted.

## Examples


<strong class="example-title">Delete a file</strong>

```html;fs-delete
<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <script>
        (async () => {
            // (1) Create a random file
            let filename = puter.randName();
            await puter.fs.write(filename, 'Hello, world!');
            puter.print('File created successfully<br>');

            // (2) Delete the file
            await puter.fs.delete(filename);
            puter.print('File deleted successfully');
        })();
    </script>
</body>
</html>
```

<strong class="example-title">Delete a directory</strong>

```html;fs-delete-directory
<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <script>
        (async () => {
            // (1) Create a random directory
            let dirname = puter.randName();
            await puter.fs.mkdir(dirname);
            puter.print('Directory created successfully<br>');

            // (2) Delete the directory
            await puter.fs.delete(dirname);
            puter.print('Directory deleted successfully');
        })();
    </script>
</body>
</html>
```


<!--
File: FS/mkdir.md
-->

Allows you to create a directory.

## Syntax
```js
puter.fs.mkdir(path)
puter.fs.mkdir(path, options)
```

## Parameters
#### `path` (string) (required)
The path to the directory to create.
If path is not absolute, it will be resolved relative to the app's root directory.

#### `options` (object)
The options for the `mkdir` operation. The following options are supported:
- `overwrite` (boolean) - Whether to overwrite the directory if it already exists. Defaults to `false`.
- `dedupeName` (boolean) - Whether to deduplicate the directory name if it already exists. Defaults to `false`.
- `createMissingParents` (boolean) - Whether to create missing parent directories. Defaults to `false`.

## Return value
Returns a promise that resolves to the directory object of the created directory.

## Examples

<strong class="example-title">Create a new directory</strong>

```html;fs-mkdir
<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <script>
        // Create a directory with random name
        let dirName = puter.randName();
        puter.fs.mkdir(dirName).then((directory) => {
            puter.print(`"${dirName}" created at ${directory.path}`);
        }).catch((error) => {
            puter.print('Error creating directory:', error);
        });
    </script>
</body>
</html>
```

<strong class="example-title">Demonstrate the use of `dedupeName`</strong>

```html;fs-mkdir-dedupe
<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <script>
        (async () => {
            // create a directory named 'hello'
            let dir_1 = await puter.fs.mkdir('hello');
            puter.print(`Directory 1: ${dir_1.name}<br>`);
            // create a directory named 'hello' again, it should be automatically renamed to 'hello (n)' where n is the next available number
            let dir_2 = await puter.fs.mkdir('hello', { dedupeName: true });
            puter.print(`Directory 2: ${dir_2.name}<br>`);
        })();
    </script>
</body>
</html>
```

<strong class="example-title">Demonstrate the use of `createMissingParents`</strong>

```html;fs-mkdir-create-missing-parents
<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <script>
        (async () => {
            // Create a directory named 'hello' in a directory that does not exist
            let dir = await puter.fs.mkdir('my-directory/another-directory/hello', { createMissingParents: true });
            puter.print(`Directory created at: ${dir.path}<br>`);
        })();
    </script>
</body>
</html>
```


<!--
File: FS/move.md
-->

Moves a file or a directory from one location to another.

## Syntax

```js
puter.fs.move(source, destination)
puter.fs.move(source, destination, options)
```

## Parameters
#### `source` (String) (Required)
The path to the file or directory to move.

#### `destination` (String) (Required)
The path to the destination directory. If destination is a directory then the file or directory will be moved into that directory using the same name as the source file or directory. If the destination is a file, we overwrite if overwrite is `true`, otherwise we error.

#### `options` (Object) (Optional)
The options for the `move` operation. The following options are supported:
- `overwrite` (Boolean) - Whether to overwrite the destination file or directory if it already exists. Defaults to `false`.
- `dedupeName` (Boolean) - Whether to deduplicate the file or directory name if it already exists. Defaults to `false`.
- `createMissingParents` (Boolean) - Whether to create missing parent directories. Defaults to `false`.

## Return value
A `Promise` that will resolve to the moved file or directory. If the source file or directory does not exist, the promise will be rejected with an error.

## Examples

<strong class="example-title"> Move a file</strong>

```html;fs-move
<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <script>
    (async () => {
        // (1) Create a random text file
        let filename = puter.randName() + '.txt';
        await puter.fs.write(filename, 'Hello, world!');
        puter.print(`Created file: ${filename}<br>`);

        // (2) create a random directory
        let dirname = puter.randName();
        await puter.fs.mkdir(dirname);
        puter.print(`Created directory: ${dirname}<br>`);

        // (3) Move the file into the directory
        await puter.fs.move(filename, dirname);
        puter.print(`Moved file: ${filename} to directory ${dirname}<br>`);

        // (4) Delete the file and directory (cleanup)
        await puter.fs.delete(dirname + '/' + filename);
        await puter.fs.delete(dirname);
    })();
    </script>
</body>
</html>
```

<strong class="example-title"> Demonstrate the `createMissingParents` option</strong>

```html;fs-move-create-missing-parents
<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <script>
    (async () => {
        // (1) Create a random file
        let filename = puter.randName() + '.txt';
        await puter.fs.write(filename, 'Hello, world!');
        puter.print('Created file: ' + filename + '<br>');

        // (2) Move the file into a non-existent directory
        let dirname = puter.randName();
        await puter.fs.move(filename, dirname + '/' + filename, { createMissingParents: true });
        puter.print(`Moved ${filename} to ${dirname}<br>`);

        // (3) Delete the file and directory (cleanup)
        await puter.fs.delete('non-existent-directory/' + filename);
        await puter.fs.delete('non-existent-directory');
    })();
    </script>
</body>
</html>
```


<!--
File: FS/read.md
-->

Reads data from a file.

## Syntax
```js
puter.fs.read(path)
```

## Parameters
#### `path` (String) (required)
Path of the file to read.
If `path` is not absolute, it will be resolved relative to the app's root directory.

## Return value
A `Promise` that will resolve to a `Blob` object containing the contents of the file.

## Examples

<strong class="example-title">Read a file</strong>

```html;fs-read
<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <script>
        (async () => {
            // (1) Create a random text file
            let filename = puter.randName() + ".txt";
            await puter.fs.write(filename, "Hello world! I'm a file!");
            puter.print(`"${filename}" created<br>`);

            // (2) Read the file and print its contents
            let blob = await puter.fs.read(filename);
            let content = await blob.text();
            puter.print(`"${filename}" read (content: "${content}")<br>`);
        })();
    </script>
</body>
</html>
```


<!--
File: FS/readdir.md
-->

Reads the contents of a directory, returning an array of items (files and directories) within it. This method is useful for listing all items in a specified directory in the Puter cloud storage.

## Syntax
```js
puter.fs.readdir(path)
```

## Parameters
`path` (string)
The path to the directory to read.
If `path` is not absolute, it will be resolved relative to the app's root directory.

## Return value
A `Promise` that resolves to an array of [`fsitem`s](/Objects/fsitem/) (files and directories) within the specified directory.

## Examples

<strong class="example-title">Read a directory</strong>

```html;fs-readdir
<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <script>
        puter.fs.readdir('./').then((items) => {
            // print the path of each item in the directory
            puter.print(`Items in the directory:<br>${items.map((item) => item.path)}<br>`);
        }).catch((error) => {
            puter.print(`Error reading directory: ${error}`);
        });
    </script>
</body>
</html>
```


<!--
File: FS/rename.md
-->

Renames a file or directory to a new name. This method allows you to change the name of a file or directory in the Puter cloud storage.

## Syntax
```js
puter.fs.rename(path, newName)
```

## Parameters
#### `path` (string)
The path to the file or directory to rename.
If `path` is not absolute, it will be resolved relative to the app's root directory.

#### `newName` (string)
The new name of the file or directory.

## Return value
Returns a promise that resolves to the file or directory object of the renamed file or directory.

## Examples

<strong class="example-title">Rename a file</strong>

```html;fs-rename
<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <script>
        (async () => {
            // Create hello.txt
            await puter.fs.write('hello.txt', 'Hello, world!');
            puter.print(`"hello.txt" created<br>`);

            // Rename hello.txt to hello-world.txt
            await puter.fs.rename('hello.txt', 'hello-world.txt')
            puter.print(`"hello.txt" renamed to "hello-world.txt"<br>`);
        })();
    </script>
</body>
</html>
```


<!--
File: FS/space.md
-->

Returns the storage space capacity and usage for the current user.

<div class="info">
<svg style="margin-right:15px;" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="48px" height="48px" viewBox="0 0 48 48" stroke-width="2"><g stroke-width="2" transform="translate(0, 0)"><circle data-color="color-2" data-stroke="none" cx="24" cy="35" r="1" fill="#ffffff"></circle><circle cx="24" cy="24" r="22" fill="none" stroke="#fff" stroke-linecap="square" stroke-miterlimit="10" stroke-width="2" stroke-linejoin="miter"></circle><line data-color="color-2" x1="24" y1="12" x2="24" y2="28" fill="none" stroke="#ffffff" stroke-linecap="square" stroke-miterlimit="10" stroke-width="2" stroke-linejoin="miter"></line><circle data-color="color-2" cx="24" cy="35" r="1" fill="none" stroke="#ffffff" stroke-linecap="square" stroke-miterlimit="10" stroke-width="2" stroke-linejoin="miter"></circle></g></svg>
This method requires permission to access the user's storage space. If the user has not granted permission, the method will return an error.</div>

## Syntax
```js
puter.fs.space()
```

## Parameters
None.

## Return value
A `Promise` that will resolve to an object with the following properties:
- `capacity` (Number): The total amount of storage capacity available to the user, in bytes.
- `used` (Number): The amount of storage space used by the user, in bytes.


## Examples

```html
<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <script>
        // Retrieves the storage space capacity and usage for the current user, and prints them to the browser console
        puter.space().then((space)=>{
            console.log(space)
        });
    </script>
</body>
</html>
```

<!--
File: FS/stat.md
-->

This method allows you to get information about a file or directory.

## Syntax

```js
puter.fs.stat(path)
```

## Parameters
#### `path` (string) (required)
The path to the file or directory to get information about.
If `path` is not absolute, it will be resolved relative to the app's root directory.

## Return value
A `Promise` that resolves to the [`fsitem`](/Objects/fsitem/) of the specified file or directory.

## Examples

<strong class="example-title">Get information about a file</strong>

```html;fs-stat
<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <script>
        (async () => {
            // () create a file
            await puter.fs.write('hello.txt', 'Hello, world!');
            puter.print('hello.txt created<br>');

            // (2) get information about hello.txt
            const file = await puter.fs.stat('hello.txt');
            puter.print(`hello.txt name: ${file.name}<br>`);
            puter.print(`hello.txt path: ${file.path}<br>`);
            puter.print(`hello.txt size: ${file.size}<br>`);
            puter.print(`hello.txt created: ${file.created}<br>`);
        })()
    </script>
</body>
</html>
```


<!--
File: FS/upload.md
-->

Given a number of local items, upload them to the Puter filesystem.

## Syntax

```js
puter.fs.upload(items)
puter.fs.upload(items, dirPath)
puter.fs.upload(items, dirPath, options)
```

## Parameters
#### `items` (Array) (required)
The items to upload to the Puter filesystem. `items` can be an `InputFileList`, `FileList`, `Array` of `File` objects, or an `Array` of `Blob` objects.

#### `dirPath` (String) (optional)
The path of the directory to upload the items to. If not set, the items will be uploaded to the app's root directory.

#### `options` (Object) (optional)
A set of key/value pairs that configure the upload process. 


## Return value
Returns a promise that resolves to an array of file objects of the uploaded files.

## Examples

<strong class="example-title">Upload a file from a file input</strong>

```html;fs-upload
<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <input type="file" id="file-input" />
    <script>
        // File input
        let fileInput = document.getElementById('file-input');

        // Upload the file when the user selects it
        fileInput.onchange = () => {
            puter.fs.upload(fileInput.files).then((file) => {
                puter.print(`File uploaded successfully to: ${file.path}`);                
            })
        };
    </script>
</body>
</html>
```


<!--
File: FS/write.md
-->

Writes data to a specified file path. This method is useful for creating new files or modifying existing ones in the Puter cloud storage.

## Syntax

```js
puter.fs.write(path)
puter.fs.write(path, data)
puter.fs.write(path, data, options)
```

## Parameters
#### `path` (string) (required)
The path to the file to write to.
If path is not absolute, it will be resolved relative to the app's root directory.

#### `data` (string|File|Blob)
The data to write to the file.

#### `options` (object)
The options for the `write` operation. The following options are supported:
- `overwrite` (boolean) - Whether to overwrite the file if it already exists. Defaults to `true`.
- `dedupeName` (boolean) - Whether to deduplicate the file name if it already exists. Defaults to `false`.
- `createMissingParents` (boolean) - Whether to create missing parent directories. Defaults to `false`.

## Return value
Returns a promise that resolves to the file object of the written file.

## Examples

<strong class="example-title">Create a new file containing "Hello, world!"</strong>

```html;fs-write
<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <script>
        // Create a new file called "hello.txt" containing "Hello, world!"
        puter.fs.write('hello.txt', 'Hello, world!').then(() => {
            puter.print('File written successfully');
        })
    </script>
</body>
</html>
```

<strong class="example-title">Create a new file with input coming from a file input</strong>

```html;fs-write-from-input
<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <input type="file" id="file-input">
    <script>
        // Example: Writing a file with input coming from a file input
        document.getElementById('file-input').addEventListener('change', (event) => {
            puter.fs.write('hello.txt', event.target.files[0]).then(() => {
                puter.print('File written successfully');
            }).catch((error) => {
                puter.print('Error writing file:', error);
            });
        });
    </script>
</body>
</html>
```

<strong class="example-title">Demonstrate the use of `dedupeName`</strong>

```html;fs-write-dedupe
<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <script>
        (async () => {
            // create a file named 'hello.txt'
            let file_1 = await puter.fs.write('hello.txt', 'Hello, world!');
            puter.print(`File 1: ${file_1.name}<br>`);
            // create a file named 'hello.txt' again, it should be automatically renamed to 'hello (n).txt' where n is the next available number
            let file_2 = await puter.fs.write('hello.txt', 'Hello, world!', { dedupeName: true });
            puter.print(`File 2: ${file_2.name}<br>`);
        })();
    </script>
</body>
</html>
```

<strong class="example-title">Demonstrate the use of `createMissingParents`</strong>

```html;fs-write-create-missing-parents
<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <script>
        (async () => {
            // create a file named 'hello.txt' in a directory that does not exist
            let file = await puter.fs.write('my-directory/another-directory/hello.txt', 'Hello, world!', { createMissingParents: true });
            puter.print(`File created at: ${file.path}<br>`);
        })();
    </script>
</body>
</html>
```


<!--
File: Hosting/create.md
-->

Will create a new subdomain that will be served by the hosting service. Optionally, you can specify a path to a directory that will be served by the subdomain.

## Syntax

```js
puter.hosting.create(subdomain, dirPath)
```

## Parameters
#### `subdomain` (String) (required)
A string containing the name of the subdomain you want to create.

#### `dirPath` (String) (optional)
A string containing the path to the directory you want to serve. If not specified, the subdomain will be created without a directory.

## Return value
A `Promise` that will resolve to a [`subdomain`](/Objects/subdomain/) object when the subdomain has been created. If a subdomain with the given name already exists, the promise will be rejected with an error. If the path does not exist, the promise will be rejected with an error.

## Examples

<strong class="example-title">Create a simple website displaying "Hello world!"</strong>

```html;hosting-create
<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <script>
        (async () => {
            // (1) Create a random directory
            let dirName = puter.randName();
            await puter.fs.mkdir(dirName)

            // (2) Create 'index.html' in the directory with the contents "Hello, world!"
            await puter.fs.write(`${dirName}/index.html`, '<h1>Hello, world!</h1>');

            // (3) Host the directory under a random subdomain
            let subdomain = puter.randName();
            const site = await puter.hosting.create(subdomain, dirName)

            puter.print(`Website hosted at: <a href="https://${site.subdomain}.puter.site" target="_blank">https://${site.subdomain}.puter.site</a>`);
        })();
    </script>
</body>
</html>
```


<!--
File: Hosting/delete.md
-->

Deletes a subdomain from your account. The subdomain will no longer be served by the hosting service. If the subdomain has a directory, it will be disconnected from the subdomain. The associated directory will not be deleted.

## Syntax

```js
puter.hosting.delete(subdomain)
```

## Parameters
#### `subdomain` (String) (required)
A string containing the name of the subdomain you want to delete.

## Return value
A `Promise` that will resolve to `true` when the subdomain has been deleted. If a subdomain with the given name does not exist, the promise will be rejected with an error.

## Examples

<strong class="example-title">Create a random website then delete it</strong>

```html;hosting-delete
<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <script>
        (async () => {
            // (1) Create a random website
            let subdomain = puter.randName();
            const site = await puter.hosting.create(subdomain)
            puter.print(`Website hosted at: ${site.subdomain}.puter.site (This is an empty website with no files)<br>`);

            // (2) Delete the website using delete()
            const site2 = await puter.hosting.delete(site.subdomain);
            puter.print('Website deleted<br>');

            // (3) Try to retrieve the website (should fail)
            puter.print('Trying to retrieve website... (should fail)<br>');
            try {
                await puter.hosting.get(site.subdomain);
            } catch (e) {
                puter.print('Website could not be retrieved<br>');
            }
        })();
    </script>
</body>
</html>
```


<!--
File: Hosting/get.md
-->

Returns a subdomain. If the subdomain does not exist, the promise will be rejected with an error.

## Syntax

```js
puter.hosting.get(subdomain)
```

## Parameters
#### `subdomain` (String) (required)
A string containing the name of the subdomain you want to retrieve.

## Return value
A `Promise` that will resolve to a [`subdomain`](/Objects/subdomain/) object when the subdomain has been retrieved. If a subdomain with the given name does not exist, the promise will be rejected with an error.

## Examples

<strong class="example-title">Get a subdomain</strong>

```html;hosting-get
<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <script>
        (async () => {
            // (1) Create a random website
            let subdomain = puter.randName();
            const site = await puter.hosting.create(subdomain)
            puter.print(`Website hosted at: ${site.subdomain}.puter.site (This is an empty website with no files)<br>`);

            // (2) Retrieve the website using get()
            const site2 = await puter.hosting.get(site.subdomain);
            puter.print(`Website retrieved: subdomain=${site2.subdomain}.puter.site UID=${site2.uid}<br>`);

            // (3) Delete the website (cleanup)
            await puter.hosting.delete(subdomain);
        })();
    </script>
</body>
</html>
```


<!--
File: Hosting/list.md
-->

Returns an array of all subdomains in the user's subdomains that this app has access to. If the user has no subdomains, the array will be empty.

## Syntax
```js
puter.hosting.list()
```

## Parameters
None

## Return value
A `Promise` that will resolve to an array of all [`subdomain`s](/Objects/subdomain/) belonging to the user that this app has access to. 

## Examples

<strong class="example-title">Create 3 random websites and then list them</strong>

```html;hosting-list
<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <script>
        (async () => {
            // (1) Generate 3 random subdomains
            let site_1 = puter.randName();
            let site_2 = puter.randName();
            let site_3 = puter.randName();

            // (2) Create 3 empty websites with the subdomains we generated
            await puter.hosting.create(site_1);
            await puter.hosting.create(site_2);
            await puter.hosting.create(site_3);

            // (3) Get all subdomains
            let sites = await puter.hosting.list();

            // (4) Display the names of the websites
            puter.print(sites.map(site => site.subdomain));

            // Delete all sites (cleanup)
            await puter.hosting.delete(site_1);
            await puter.hosting.delete(site_2);
            await puter.hosting.delete(site_3);
        })();
    </script>
</body>
</html>
```


<!--
File: Hosting/update.md
-->

Updates a subdomain to point to a new directory. If directory is not specified, the subdomain will be disconnected from its directory.

## Syntax

```js
puter.hosting.update(subdomain, dirPath)
```

## Parameters
#### `subdomain` (String) (required)
A string containing the name of the subdomain you want to update.

#### `dirPath` (String) (optional)
A string containing the path to the directory you want to serve. If not specified, the subdomain will be disconnected from its directory.

## Return value
A `Promise` that will resolve to a [`subdomain`](/Objects/subdomain/) object when the subdomain has been updated. If a subdomain with the given name does not exist, the promise will be rejected with an error. If the path does not exist, the promise will be rejected with an error.

## Examples

<strong class="example-title">Update a subdomain to point to a new directory</strong>

```html;hosting-update
<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <script>
        (async () => {
            // (1) Create a random website
            let subdomain = puter.randName();
            const site = await puter.hosting.create(subdomain)
            puter.print(`Website hosted at: ${site.subdomain}.puter.site<br>`);

            // (2) Create a random directory
            let dirName = puter.randName();
            let dir = await puter.fs.mkdir(dirName)
            puter.print(`Created directory "${dir.path}"<br>`);

            // (3) Update the site with the new random directory
            await puter.hosting.update(subdomain, dirName)
            puter.print(`Changed subdomain's root directory to "${dir.path}"<br>`);

            // (4) Delete the app (cleanup)
            await puter.hosting.delete(updatedSite.subdomain)
        })();
    </script>
</body>
</html>
```


<!--
File: KV/decr.md
-->

Decrements the value of a key. If the key does not exist, it is initialized with 0 before performing the operation. An error is returned if the key contains a value of the wrong type or contains a string that can not be represented as integer.


## Syntax

```js
puter.kv.decr(key)
puter.kv.decr(key, amount)
```

## Parameters

#### `key` (string) (required)

The key of the value to decrement.

#### `amount` (integer) (optional)

The amount to decrement the value by. Defaults to 1.

## Return Value

Returns the new value of the key after the decrement operation.

## Examples

<strong class="example-title">Decrement the value of a key</strong>

```html;kv-decr
<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <script>
        puter.kv.decr('testIncrKey').then((newValue) => {
            puter.print(`New value: ${newValue}`);
        });
    </script>
</body>
</html>
```


<!--
File: KV/del.md
-->

When passed a key, will remove that key from the key-value storage. If there is no key with the given name in the key-value storage, nothing will happen.

## Syntax
```js
puter.kv.del(key)
```

## Parameters
#### `key` (String) (required)
A string containing the name of the key you want to remove.

## Return value 
A `Promise` that will resolve to `true` when the key has been removed.

## Examples

<strong class="example-title">Delete the key 'name'</strong>

```html;kv-del
<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <script>
        (async () => {
            // create a new key-value pair
            await puter.kv.set('name', 'Puter Smith');
            puter.print("Key-value pair 'name' created/updated<br>");

            // delete the key 'name'
            await puter.kv.del('name');
            puter.print("Key-value pair 'name' deleted<br>");

            // try to retrieve the value of key 'name'
            const name = await puter.kv.get('name');
            puter.print(`Name is now: ${name}`);
        })();
    </script>
</body>
</html>
```


<!--
File: KV/flush.md
-->

Will remove all key-value pairs from the user's key-value store for the current app.

## Syntax
```js
puter.kv.flush()
```

## Parameters
None

## Return value
A `Promise` that will resolve to `true` when the key-value store has been flushed (emptied). The promise will never reject.

## Examples

```html;kv-flush
<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <script>
        (async () => {
            // (1) Create a number of key-value pairs
            await puter.kv.set('name', 'Puter Smith');
            await puter.kv.set('age', 21);
            await puter.kv.set('isCool', true);
            puter.print("Key-value pairs created/updated<br>");

            // (2) Rretrieve all keys
            const keys = await puter.kv.list();
            puter.print(`Keys are: ${keys}<br>`);

            // (3) Flush the key-value store
            await puter.kv.flush();
            puter.print('Key-value store flushed<br>');

            // (4) Retrieve all keys again, should be empty
            const keys2 = await puter.kv.list();
            puter.print(`Keys are now: ${keys2}<br>`);
        })();
    </script>
</body>
```


<!--
File: KV/get.md
-->

When passed a key, will return that key's value, or `null` if the key does not exist.

## Syntax
```js
puter.kv.get(key)
```

## Parameters
#### `key` (String) (required)
A string containing the name of the key you want to retrieve the value of.

## Return value 
A `Promise` that will resolve to a string containing the value of the key. If the key does not exist, it will resolve to `null`.

## Examples

<strong class="example-title">Retrieve the value of key 'name'</strong>

```html;kv-get
<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <script>
        (async () => {
            // (1) Create a new key-value pair
            await puter.kv.set('name', 'Puter Smith');
            puter.print("Key-value pair 'name' created/updated<br>");

            // (2) Retrieve the value of key 'name'
            const name = await puter.kv.get('name');
            puter.print(`Name is: ${name}`);
        })();
    </script>
</body>
</html>
```


<!--
File: KV/incr.md
-->

Increments the value of a key. If the key does not exist, it is initialized with 0 before performing the operation. An error is returned if the key contains a value of the wrong type or contains a string that can not be represented as integer. This operation is limited to 64 bit signed integers.

## Syntax

```js
puter.kv.incr(key)
puter.kv.incr(key, amount)
```

## Parameters

#### `key` (string) (required)

The key of the value to increment.

#### `amount` (integer) (optional)

The amount to increment the value by. Defaults to 1.


## Return Value

Returns the new value of the key after the increment operation.

## Examples

<strong class="example-title">Increment the value of a key</strong>

```html;kv-incr
<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <script>
        puter.kv.incr('testIncrKey').then((newValue) => {
            puter.print(`New value: ${newValue}`);
        });
    </script>
</body>
</html>
```


<!--
File: KV/list.md
-->

Returns an array of all keys in the user's key-value store for the current app. If the user has no keys, the array will be empty.

## Syntax
```js
puter.kv.list()
puter.kv.list(pattern)
puter.kv.list(returnValues = false)
puter.kv.list(pattern, returnValues = false)
```

## Parameters
#### `pattern` (String) (optional)
If set, only keys that match the given pattern will be returned. The pattern can contain the `*` wildcard character, which matches any number of characters. For example, `abc*` will match all keys that start with `abc`, such as `abc`, `abc123`, `abc123xyz`, etc. Default is `*`, which matches all keys.

#### `returnValues` (Boolean) (optional)
If set to `true`, the returned array will contain objects with both `key` and `value` properties. If set to `false`, the returned array will contain only the keys. Default is `false`.

## Return value
A `Promise` that will resolve to an array of all keys (and values, if `returnValues` is set to `true`) the user's key-value store for the current app. If the user has no keys, the array will be empty. 

## Examples

<strong class="example-title">Retrieve all keys in the user's key-value store for the current app</strong>

```html;kv-list
<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <script>
        (async () => {
            // (1) Create a number of key-value pairs
            await puter.kv.set('name', 'Puter Smith');
            await puter.kv.set('age', 21);
            await puter.kv.set('isCool', true);
            puter.print("Key-value pairs created/updated<br><br>");

            // (2) Retrieve all keys
            const keys = await puter.kv.list();
            puter.print(`Keys are: ${keys}<br><br>`);

            // (3) Retrieve all keys and values
            const key_vals = await puter.kv.list(true);
            puter.print(`Keys and values are: ${(key_vals).map((key_val) => key_val.key + ' => ' + key_val.value)}<br><br>`);

            // (4) Match keys with a pattern
            const keys_matching_pattern = await puter.kv.list('is*');
            puter.print(`Keys matching pattern are: ${keys_matching_pattern}<br>`);

            // (5) Delete all keys (cleanup)
            await puter.kv.del('name');
            await puter.kv.del('age');
            await puter.kv.del('isCool');
        })();
    </script>
</body>
```


<!--
File: KV/set.md
-->

When passed a key and a value, will add it to the user's key-value store, or update that key's value if it already exists.

<div class="info">Each app gets its own sandboxed key-value store in each user's account. Apps cannot access each other's key-value stores.</div>

## Syntax
```js
puter.kv.set(key, value)
```

## Parameters

#### `key` (String) (required)
A string containing the name of the key you want to create/update. The maximum allowed `key` size is **1 KB**.

#### `value` (String | Number | Boolean)
A string containing the value you want to give the key you are creating/updating. The maximum allowed `value` size is **400 KB**.

## Return value 
A `Promise` that will resolves to `true` when the key-value pair has been created or the existing key's value has been updated.

## Examples

<strong class="example-title">Create a new key-value pair</strong>

```html;kv-set
<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <script>
        puter.kv.set('name', 'Puter Smith').then((success) => {
            puter.print(`Key-value pair created/updated: ${success}`);
        });
    </script>
</body>
</html>
```


<!--
File: Objects/AppConnection.md
-->

Provides an interface for interaction with another app.

## Attributes

#### `usesSDK` (Boolean)
Whether the target app is using Puter.js. If not, then some features of `AppConnection` will not be available.

## Methods

#### `on(eventName, handler)`
Listen to an event from the target app. Possible events are:

- `message` - The target app sent us a message with `postMessage()`. The handler receives the message.
- `close` - The target app has closed. The handler receives an object with an `appInstanceID` field of the closed app.

#### `off(eventName, handler)`
Remove an event listener added with `on(eventName, handler)`.

#### `postMessage(message)`
Send a message to the target app. Think of it as a more limited version of [`window.postMessage()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage). `message` can be anything that [`window.postMessage()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) would accept for its `message` parameter.

If the target app is not using the SDK, or the connection is not open, then nothing will happen.

#### `close()`
Attempt to close the target app. If you do not have permission to close it, or the target app is already closed, then nothing will happen.

An app has permission to close apps that it has launched with [`puter.ui.launchApp()`](/UI/launchApp).

## Examples

### Interacting with another app

This example demonstrates two apps, `parent` and `child`, communicating with each other over using `AppConnection`.

In order:
1. `parent` launches `child`
2. `parent` sends a message, `"Hello!"`, to `child`
3. `child` shows that message in an alert dialog.
4. `child` sends a message back.
5. `parent` receives the message and logs it.
6. `parent` closes the child app.

```html
<html>
<head>
    <title>Parent app</title>
</head>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <script>
        // This app is the parent
        
        // Launch child (1)
        const child = await puter.ui.launchApp('child');
        
        // Listen to messages from the child app. (5)
        child.on('message', msg => {
            console.log('Parent app received a message from child:', msg);
            console.log('Closing child app.');
            
            // Close the child (6)
            child.close();
        });
        
        // Send a message to the child (2)
        child.postMessage('Hello!');
    </script>
</body>
</html>

<!------------------->

<html>
<head>
    <title>Child app</title>
</head>
<body>
<script src="https://js.puter.com/v2/"></script>
<script>
    // This app is the child
    
    // Get a connection to our parent.
    const parent = puter.ui.parentApp();
    if (!parent) {
        // We were not launched by the parent.
        // For this example, we'll just exit.
        puter.exit();
    } else {
        // We were launched by the parent, and can communicate with it.
        
        // Any time we get a message from the parent, show it in an alert dialog. (3)
        parent.on('message', msg => {
            puter.ui.alert(msg);
            
            // Send a message back (4)
            // Messages can be any JS object that can be cloned.
            parent.postMessage({
                name: 'Nyan Cat',
                age: 13
            });
        });
    }
</script>
</body>
</html>
```

### Single app with multiple windows

Multi-window applications can also be implemented with a single app, by launching copies of itself that check if they have a parent and wait for instructions from it.

In this example, a parent app (with the name `traffic-light`) launches three children that display the different colors of a traffic light.

```html
<html>
<head>
    <title>Traffic light</title>
    <script src="https://js.puter.com/v2/"></script>
    <script>
        const parent = puter.ui.parentApp();
        if (parent) {
            // We have a parent, so wait for it to tell us what to do.
            // In this example, just change the background color and display a message.
            parent.on('message', msg => {
                document.bgColor = msg.color;
                document.body.innerText = msg.text;
            });
        } else {
            // `parent` is null, so we are the instance that should create and direct the child apps.
            const trafficLight = [
                {
                    color: 'red',
                    text: 'STOP',
                }, {
                    color: 'yellow',
                    text: 'WAIT',
                }, {
                    color: 'green',
                    text: 'GO',
                },
            ];
            for (const data of trafficLight) {
                // Launch a child app for each task.
                puter.ui.launchApp('traffic-light').then(child => {
                    child.postMessage(data);
                });
            }
        }
    </script>
</head>
</html>
```



<!--
File: Objects/app.md
-->


## Attributes

#### `uid` (String)

A string containing the unique identifier of the app. This is a unique identifier generated by Puter when the app is created.

#### `name` (String)

A string containing the name of the app. 

#### `icon` (String)

A string containing the Data URL of the icon of the app. This is a base64 encoded image.

#### `description` (String)

A string containing the description of the app.


#### `title` (String)

A string containing the title of the app.

#### `maximize_on_start` (Boolean) (default: `false`)

A boolean value indicating whether the app should be maximized when it is started.

#### `index_url` (String)

A string containing the URL of the index file of the app. This is the file that will be loaded when the app is started.

#### `created_at` (String)

A string containing the date and time when the app was created. The format of the date and time is `YYYY-MM-DDTHH:MM:SSZ`.

#### `background` (Boolean) (default: `false`)

A boolean value indicating whether the app should run in the background. If this is set to `true`.

#### `filetype_associations` (Array)

An array of strings containing the file types that the app can open. Each string should be in the format `".<extension>"` or `"mime/type"`. e.g. `[".txt", "image/png"]`. For a directory association, the string should be `.directory`.

#### `open_count` (Number)

A number containing the number of times the app has been opened. If the `stats_period` option is set to a value other than `all`, this will be the number of times the app has been opened in that period.

#### `user_count` (Number)

A number containing the number of users that have access to the app. If the `stats_period` option is set to a value other than `all`, this will be the number of users that have access to the app in that period.

<!--
File: Objects/fsitem.md
-->


An fsitem object represents a file or a directory in the file system of a Puter. 

## Attributes

#### `id` (String)

A string containing the unique identifier of the item. This is a unique identifier generated by Puter when the item is created.

#### `uid` (String)

This is an alias for `id`.

#### `name` (String)

A string containing the name of the item.

#### `path` (String)

A string containing the path of the item. This is the path of the item relative to the root directory of the file system.

#### `is_dir` (Boolean)

A boolean value indicating whether the item is a directory. If this is set to `true`, the item is a directory. If this is set to `false`, the item is a file.

#### `parent_id` (String)

A string containing the unique identifier of the parent directory of the item.

#### `parent_uid` (String)

This is an alias for `parent_id`.

#### `created` (Integer)

An integer containing the Unix timestamp of the date and time when the item was created.

#### `modified` (Integer)

An integer containing the Unix timestamp of the date and time when the item was last modified.

#### `accessed` (Integer)

An integer containing the Unix timestamp of the date and time when the item was last accessed.


#### `size` (Integer)

An integer containing the size of the item in bytes. If the item is a directory, this will be `null`.


#### `writable` (Boolean)

A boolean value indicating whether the item is writable. If this is set to `true`, the item is writable. If this is set to `false`, the item is not writable. If the item is a directory and `writable` is `false`, it means new items cannot be added to the directory;
however, it is possible that subdirectories may be writable or contain writable files.

<!--
File: Objects/subdomain.md
-->


## Attributes

#### `uid` (String)

A string containing the unique identifier of the subdomain.

#### `subdomain` (String)

A string containing the name of the subdomain. This is the part of the domain that comes before the main domain name.
e.g. in `example.puter.site`, `example` is the subdomain.

#### `root_dir` (FSItem)

An FSItem object representing the root directory of the subdomain. This is the directory where the files of the subdomain are stored.

<!--
File: UI/alert.md
-->


Displays an alert dialog by Puter. Puter improves upon the traditional browser alerts by providing more flexibility. For example, you can customize the buttons displayed.

`puter.ui.alert()` will block the parent window until user responds by pressing a button.

## Syntax
```js
puter.ui.alert(message)
puter.ui.alert(message, buttons)
```

## Parameters

#### `message` (optional)
A string to be displayed in the alert dialog. If not set, the dialog will be empty. 

#### `buttons` (optional)
An array of objects that define the buttons to be displayed in the alert dialog. Each object must have a `label` property. The `value` property is optional. If it is not set, the `label` property will be used as the value. The `type` property is optional and can be set to `primary`, `success`, `info`, `warning`, or `danger`. If it is not set, the default type will be used.


## Return value 
A `Promise` that resolves to the value of the button pressed. If the `value` property of button is set it is returned, otherwise `label` property will be returned.

## Examples
```html
<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <script>
        // display an alert with a message and three different types of buttons
        puter.ui.alert('Please press a button!', [
            {
                label: 'Hello :)',
                value: 'hello',
                type: 'primary',
            },
            {
                label: 'Bye :(',
                type: 'danger',
            },
            {
                label: 'Cancel',
            },
        ]).then((resp) => {
            // print user's response to console
            console.log(resp);
        });
    </script>
</body>
</html>
```

<!--
File: UI/authenticateWithPuter.md
-->

Presents a dialog to the user to authenticate with their Puter account.

## Syntax

```js
puter.ui.authenticateWithPuter()
```

## Parameters
None.

## Return value
A `Promise` that will resolve to `true`. If the user cancels the dialog, the promise will be rejected with an error.

## Examples

```html
<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <script>
        // Presents a dialog to the user to authenticate with their Puter account.
        puter.ui.authenticateWithPuter().then((user)=>{
            console.log(user)
        });
    </script>
</body>
</html>
```

<!--
File: UI/createWindow.md
-->

Creates and displays a window.

## Syntax
```js
puter.ui.createWindow()
puter.ui.createWindow(options)
```

## Parameters

#### `options` (optional)
A set of key/value pairs that configure the window.
    
* `center` (Boolean): if set to `true`, window will be placed at the center of the screen.
* `content` (String): content of the window.
* `disable_parent_window` (Boolean): if set to `true`, the parent window will be blocked until current window is closed. 
* `has_head` (Boolean): if set to `true`, window will have a head which contains the icon and close, minimize, and maximize buttons.
* `height` (Float): height of window in pixels.
* `is_resizable` (Boolean): if set to `true`, user will be able to resize the window.
* `show_in_taskbar` (Boolean): if set to `true`, window will be represented in the taskbar.
* `title` (String): title of the window.
* `width` (Float): width of window in pixels.

## Examples
```html
<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <script>
        // create the window
        puter.ui.createWindow({
            title: 'Cool Title',
            content: `<h1 style="text-align:center;">My little test window!</h1>`, 
            disable_parent_window: true,
            width: 300,
            height: 300,
            is_resizable: false,
            has_head: true,
            center: true,
            show_in_taskbar: false,
        })
    </script>
</body>
</html>
```

<!--
File: UI/exit.md
-->

Will terminate the running application and close its window.

## Syntax
```js
puter.exit()
```

## Parameters
`puter.exit()` does not accept any parameters.

## Examples

```html
<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <button id="exit-button">Exit App</button>
    <script>
        const exit_button = document.getElementById('exit-button');
        exit_button.addEventListener('click', () => {
            puter.exit();
        });
    </script>
</body>
</html>
```


<!--
File: UI/launchApp.md
-->

Allows you to dynamically launch another app from within your app.

## Syntax
```js
puter.ui.launchApp()
puter.ui.launchApp(appName)
puter.ui.launchApp(appName, args)
puter.ui.launchApp(args)
```

## Parameters
#### `appName` (String)
Name of the app. If not provided, a new instance of the current app will be launched.

#### `args` (Object)
Arguments to pass to the app. If `appName` is not provided, these arguments will be passed to the current app.

## Return value 
A `Promise` that will resolve to an [`AppConnection`](/Objects/AppConnection) once the app is launched.

## Examples

```html
<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <script>
        // launches the Editor app
        puter.ui.launchApp('editor');
    </script>
</body>
</html>
```


<!--
File: UI/on.md
-->

Listen to broadcast events from Puter. If the broadcast was received before attaching the handler, then the handler is called immediately with the most recent value.


## Syntax
```js
puter.ui.on(eventName, handler)
```

## Parameters

#### `eventName` (String)
Name of the event to listen to.

#### `handler` (Function)
Callback function run when the broadcast event is received.

## Broadcasts
Possible broadcasts are:

#### `localeChanged`
Sent on app startup, and whenever the user's locale on Puter is changed. The value passed to `handler` is:
```js
{
    language, // (String) Language identifier, such as 'en' or 'pt-BR'
}
```

#### `themeChanged`
Sent on app startup, and whenever the user's desktop theme on Puter is changed. The value passed to `handler` is:
```js
{
    palette: {
        primaryHue,         // (Float) Hue of the theme color
        primarySaturation,  // (String) Saturation of the theme color as a percentage, with % sign
        primaryLightness,   // (String) Lightness of the theme color as a percentage, with % sign
        primaryAlpha,       // (Float) Opacity of the theme color from 0 to 1
        primaryColor,       // (String) CSS color value for text
    }
}
```

## Examples

```html
<html>
<body>
<script src="https://js.puter.com/v2/"></script>
<script>
    puter.ui.on('localeChanged', function(locale) {
        alert(`User's preferred language code is: ${locale.language}!`);
    })
</script>
</body>
</html>
```


<!--
File: UI/onItemsOpened.md
-->

Specify a function to execute when the one or more items have been opened. Items can be opened via a variety of methods such as: drag and dropping onto the app, double-clicking on an item, right-clicking on an item and choosing an app from the 'Open With...' submenu.

**Note** `onItemsOpened` is not called when items are opened using `showOpenFilePicker()`.

## Syntax
```js
puter.ui.onItemsOpened(handler)
```

## Parameters
#### `handler` (Function)
A function to execute after items are opened by user action.

## Examples

```html
<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <script>
        puter.ui.onItemsOpened(function(items){
            document.body.innerHTML = JSON.stringify(items);
        })
    </script>
</body>
</html>
```

<!--
File: UI/onLaunchedWithItems.md
-->

Specify a callback function to execute if the app is launched with items. `onLaunchedWithItems` will be called if one or more items are opened via double-clicking on items, right-clicking on items and choosing the app from the 'Open With...' submenu.

## Syntax
```js
puter.ui.onLaunchedWithItems(handler)
```

## Parameters
#### `handler` (Function)
A function to execute after items are opened by user action. The function will be passed an array of items. Each items is either a file or a directory.

## Examples

```html
<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <script>
        puter.ui.onLaunchedWithItems(function(items){
            document.body.innerHTML = JSON.stringify(items);
        })
    </script>
</body>
</html>
```

<!--
File: UI/onWindowClose.md
-->

Specify a function to execute when the window is about to close. For example the provided function will run right after  the 'X' button of the window has been pressed.

**Note** `onWindowClose` is not called when app is closed using `puter.exit()`.

## Syntax
```js
puter.ui.onWindowClose(handler)
```

## Parameters
#### `handler` (Function)
A function to execute when the window is going to close.


## Examples
```html
<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <script>
        puter.ui.onWindowClose(function(){
            alert('Window is about to close!')
            puter.exit();
        })
    </script>
</body>
</html>
```

<!--
File: UI/parentApp.md
-->

Obtain a connection to the app that launched this app.

## Syntax
```js
puter.ui.parentApp()
```

## Parameters
`puter.ui.parentApp()` does not accept any parameters.

## Return value 
An [`AppConnection`](/Objects/AppConnection) to the parent, or null if there is no parent app.

## Examples

```html
<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <script>
        const parent = puter.ui.parentApp();
        if (!parent) {
            alert('This app was launched directly');
        } else {
            alert('This app was launched by another app');
            parent.postMessage("Hello, parent!");
        }
    </script>
</body>
</html>
```


<!--
File: UI/setMenubar.md
-->


Creates a menubar in the UI. The menubar is a horizontal bar at the top of the window that contains menus.

## Syntax

```js
puter.ui.setMenubar(options)
```

## Parameters

#### `options.items` (Array)

An array of menu items. Each item can be a menu or a menu item. Each menu item can have a label, an action, and a submenu.

#### `options.items.label` (String)

The label of the menu item.

#### `options.items.action` (Function)

A function to execute when the menu item is clicked.

#### `options.items.items` (Array)

An array of submenu items.

## Examples

```html
<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <script>
        puter.ui.setMenubar({
            items: [
                {
                    label: 'File',
                    items: [
                        {
                            label: 'Action',
                            action: () => {
                                alert('Action was clicked!');
                            }
                        },
                        {
                            label: 'Sub-Menu',
                            items: [
                                {
                                    label: 'Action 1',
                                    action: () => {
                                        alert('Action 1 was clicked!');
                                    }
                                },
                                {
                                    label: 'Action 2',
                                    action: () => {
                                        alert('Action 2 was clicked!');
                                    }
                                },
                            ]
                        },
                    ]
                },
            ]
        });
    </script>
</body>
</html>
```

<!--
File: UI/setWindowHeight.md
-->

Allows the user to dynamically set the height of the window.

## Syntax
```js
puter.ui.setWindowHeight(height)
```

## Parameters

#### `height` (Float)
The new height for this window. Must be a positive number. Minimum height is 200px, if a value less than 200 is provided, the height will be set to 200px.

## Examples

```html
<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <script>
        // sets the height of the window to 800px
        puter.ui.setWindowHeight(800);
    </script>
</body>
</html>
```

<!--
File: UI/setWindowPosition.md
-->

Allows the user to set the position of the window.

## Syntax
```js
puter.ui.setWindowPosition(x, y)
```

## Parameters

#### `x` (Float)
The new x position for this window. Must be a positive number.

#### `y` (Float)
The new y position for this window. Must be a positive number.

## Examples

```html
<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <script>
        // sets the position of the window to 100px from the left and 200px from the top
        puter.ui.setWindowPosition(100, 200);
    </script>
</body>
</html>
```

<!--
File: UI/setWindowSize.md
-->

Allows the user to dynamically set the width and height of the window.

## Syntax
```js
puter.ui.setWindowSize(width, height)
```

## Parameters

#### `width` (Float)
The new width for this window. Must be a positive number. Minimum width is 200px, if a value less than 200 is provided, the width will be set to 200px.

#### `height` (Float)
The new height for this window. Must be a positive number. Minimum height is 200px, if a value less than 200 is provided, the height will be set to 200px.

## Examples

```html
<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <script>
        // sets the width and height of the window to 800px x 600px
        puter.ui.setWindowSize(800, 600);
    </script>
</body>
```


<!--
File: UI/setWindowTitle.md
-->

Allows the user to dynamically set the title of the window.

## Syntax
```js
puter.ui.setWindowTitle(title)
```

## Parameters

#### `title` (String)
The new title for this window.

## Examples

```html
<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <script>
        puter.ui.setWindowTitle('Fancy New Title');
    </script>
</body>
</html>
```

<!--
File: UI/setWindowWidth.md
-->

Allows the user to dynamically set the width of the window.

## Syntax
```js
puter.ui.setWindowWidth(width)
```

## Parameters

#### `width` (Float)
The new width for this window. Must be a positive number. Minimum width is 200px, if a value less than 200 is provided, the width will be set to 200px.

## Examples

```html
<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <script>
        // sets the width of the window to 800px
        puter.ui.setWindowWidth(800);
    </script>
</body>
</html>
```

<!--
File: UI/setWindowX.md
-->

Sets the X position of the window.

## Syntax
```js
puter.ui.setWindowX(x)
```

## Parameters

#### `x` (Float) (Required)
The new x position for this window.


## Examples

```html
<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <script>
        // sets the position of the window to 100px from the left
        puter.ui.setWindowX(100);
    </script>
</body>
```

<!--
File: UI/setWindowY.md
-->

Sets the y position of the window.

## Syntax
```js
puter.ui.setWindowY(y)
```

## Parameters

#### `y` (Float) (Required)
The new y position for this window.

## Examples

```html
<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <script>
        // sets the position of the window to 200px from the top
        puter.ui.setWindowY(200);
    </script>
</body>
```

<!--
File: UI/showColorPicker.md
-->

Presents the user with a color picker dialog allowing them to select a color.

## Syntax
```js
puter.ui.showColorPicker()
puter.ui.showColorPicker(defaultColor)
puter.ui.showColorPicker(options)
```

## Examples

```html
<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <script>
        puter.ui.showColorPicker().then((color)=>{
            document.body.style.backgroundColor = color;
        })
    </script>
</body>
</html>
```

<!--
File: UI/showDirectoryPicker.md
-->

Presents the user with a directory picker dialog allowing them to pick a directory from their Puter cloud storage.

## Syntax
```js
puter.ui.showDirectoryPicker()
puter.ui.showDirectoryPicker(options)
```

## Parameters

#### `options` (optional)
A set of key/value pairs that configure the directory picker dialog.
* `multiple` (Boolean): if set to `true`, user will be able to select multiple directories. Default is `false`.

## Return value 
A `Promise` that resolves to either one <code>FSItem</code> or an array of <code>FSItem</code> objects, depending on how many directories were selected by the user. 

## Examples

```html
<html>
<body>
    <script src="https://js.puter.com/v2/"></script>

    <button id="open-directory">Open directory</button>

    <h1 id="directory-name"></h1>
    <pre><code id="directory-content"></code></pre>

    <script>
        document.getElementById('open-directory').addEventListener('click', ()=>{
            puter.ui.showDirectoryPicker().then(async (directory)=>{
                // print directory name
                document.getElementById('directory-name').innerHTML = directory.name;
                // print directory content
                const children = await directory.readdir();
                if(children.length){
                    let content = '';
                    for(let child of children){
                        content += child.name + '\n';
                    }
                    document.getElementById('directory-content').innerText = content;
                }else{
                    document.getElementById('directory-content').innerText = 'Empty directory';
                }
            });
        });
    </script>
</body>
</html>
```

<!--
File: UI/showFontPicker.md
-->

Presents the user with a list of fonts allowing them to preview and select a font.

## Syntax
```js
puter.ui.showFontPicker()
puter.ui.showFontPicker(defaultFont)
puter.ui.showFontPicker(options)
```

## Parameters
#### `defaultFont` (String)
The default font to select when the font picker is opened.


## Examples

```html
<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <h1>A cool Font Picker demo!</h1>

    <script>
        puter.ui.showFontPicker().then((font)=>{
            document.body.style.fontFamily = font.fontFamily;
        })
    </script>
</body>
</html>
```

<!--
File: UI/showOpenFilePicker.md
-->

Presents the user with a file picker dialog allowing them to pick a file from their Puter cloud storage.

## Syntax
```js
puter.ui.showOpenFilePicker()
puter.ui.showOpenFilePicker(options)
```

## Parameters

#### `options` (optional)
A set of key/value pairs that configure the file picker dialog.
* `multiple` (Boolean): if set to `true`, user will be able to select multiple files. Default is `false`.
* `accept` (String): The list of MIME types or file extensions that are accepted by the file picker. Default is `*/*`.
    - Example: `image/*` will allow the user to select any image file.
    - Example: `['.jpg', '.png']` will allow the user to select files with `.jpg` or `.png` extensions.

## Return value 
A `Promise` that resolves to either one <code>FSItem</code> or an array of <code>FSItem</code> objects, depending on how many files were selected by the user. 

## Examples

```html
<html>
<body>
    <script src="https://js.puter.com/v2/"></script>

    <h1 id="file-name"></h1>

    <button id="open-file-picker">Open file picker</button>
    <pre><code id="file-content"></code></pre>

    <script>
        document.getElementById('open-file-picker').addEventListener('click', ()=>{
            puter.ui.showOpenFilePicker().then(async (file)=>{
                // print file name
                document.getElementById('file-name').innerHTML = file.name;
                // print file content
                document.getElementById('file-content').innerText = await (await file.read()).text();
            });
        });
    </script>
</body>
</html>
```

<!--
File: UI/showSaveFilePicker.md
-->

Presents the user with a file picker dialog allowing them to specify where and with what name to save a file.

## Syntax
```js
puter.ui.showSaveFilePicker()
puter.ui.showSaveFilePicker(data, defaultFileName)
```

## Parameters
#### `defaultFileName` (String)
The default file name to use.

## Examples

```html
<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <h1 id="file-name"></h1>

    <button id="save-file">Save file</button>
    <pre><code id="file-content"></code></pre>

    <script>
        document.getElementById('save-file').addEventListener('click', ()=>{
            puter.ui.showSaveFilePicker("Hello world! I'm the content of this file.", 'Untitled.txt').then(async (file)=>{
                // print file name
                document.getElementById('file-name').innerHTML = file.name;
                // print file content
                document.getElementById('file-content').innerText = await (await file.read()).text();
            });
        });
    </script>
</body>
</html>
```


<!--
File: UI/socialShare.md
-->

Presents a dialog to the user allowing them to share a link on various social media platforms.

## Syntax

```js
puter.ui.socialShare(url)
puter.ui.socialShare(url, message)
puter.ui.socialShare(url, message, options)
```

## Parameters

#### `url` (required)

The URL to share.


#### `message` (optional)

The message to prefill in the social media post. This parameter is only supported by some social media platforms.

#### `options` (optional)

A set of key/value pairs that configure the social share dialog. The following options are supported:

* `left` (Number): The distance from the left edge of the window to the dialog. Default is `0`.
* `top` (Number): The distance from the top edge of the window to the dialog. Default is `0`.

<!--
File: UI/wasLaunchedWithItems.md
-->

Returns whether the app was launched to open one or more items. Use this in conjunction with `onLaunchedWithItems()` to, for example, determine whether to display an empty state or wait for items to be provided.

## Syntax
```js
puter.ui.wasLaunchedWithItems()
```

## Return value
Returns `true` if the app was launched to open items (via double-clicking, 'Open With...' menu, etc.), `false` otherwise.


<!--
File: Utils/appID.md
-->

A property of the `puter` object that returns the App ID of the running application.

## Syntax

```js
puter.appID
```

## Examples

<strong class="example-title">Get the ID of the current application</strong>

<div style="position: relative;">


```html
<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <script>
        puter.print("App ID: " + puter.appID);
    </script>
</body>
</html>
```

</div>

<!--
File: Utils/env.md
-->

A property of the `puter` object that returns the environment in which Puter.js is being used.

## Syntax

```js
puter.env
```

## Return value

A string containing the environment in which Puter.js is being used:

- `app` - Puter.js is running inside a Puter application. e.g. `https://puter.com/app/editor` 

- `web` - Puter.js is running inside a web page outside of the Puter environment. e.g. `https://example.com/index.html`

- `gui` - Puter.js is running inside the Puter GUI. e.g. `https://puter.com/`

## Examples

<strong class="example-title">Get the environment in which Puter.js is running</strong>

<div style="position: relative;">


```html
<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <script>
        puter.print("Environment: " + puter.env);
    </script>
</body>
</html>
```

</div>

<!--
File: Utils/print.md
-->

Prints a string by appending it to the body of the document. This is useful for debugging and testing purposes and is not recommended for production use.

## Syntax

```js
puter.print(text);
```

## Parameters

#### `text` (String)
The text to print.

## Examples

<strong class="example-title">Print "Hello, world!"</strong>

<div style="position: relative;">


```html
<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <script>
        puter.print("Hello, world!");
    </script>
</body>
</html>
```

</div>

<!--
File: Utils/randName.md
-->

A function that generates a domain-safe name by combining a random adjective, a random noun, and a random number (between 0 and 9999). The result is returned as a string with components separated by hyphens by default. You can change the separator by passing a string as the first argument to the function.

## Syntax

```js
puter.randName()
puter.randName(separator)
```

## Parameters

#### `separator` (String)
The separator to use between components. Defaults to `-`.

## Examples

<strong class="example-title">Generate a random name</strong>

<div style="position: relative;">


```html
<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <script>
        puter.print(puter.randName());
    </script>
</body>
</html>
```

</div>

<!--
File: examples.md
-->

<div style="">

<div class="example-card">
    <a href="/playground/?example=app-ai-chat&autorun=1" target="_blank">
        <figure>
            <div class="example-thumb" style="background-image:url(/assets/img/example-ai-chat.png);"></div>
        </figure>
    </a>
    <div class="example-card-desc">
        <h2><a href="/playground/?example=app-ai-chat&autorun=1" target="_blank">AI Chat</a></h2>
        <p>A chat app with AI using the Puter AI module. This app is powered by OpenAI GPT-4o mini.</p>
    </div>
</div>

<div class="example-card">
    <a href="/playground/?example=app-todo&autorun=1" target="_blank">
        <figure>
            <div class="example-thumb" style="background-image:url(/assets/img/example-todo.png);"></div>
        </figure>
    </a>
    <div class="example-card-desc">
        <h2><a href="/playground/?example=app-todo&autorun=1" target="_blank">To Do List</a></h2>
        <p>A simple to do list app with cloud functionalities powered by the Puter Key-Value Store.</p>
    </div>
</div>

<div class="example-card">
    <a href="https://puter.com/app/notepad-example" target="_blank">
        <figure>
            <div class="example-thumb" style="background-image:url(/assets/img/example-notepad.png);"></div>
        </figure>
    </a>
    <div class="example-card-desc">
        <h2><a href="https://puter.com/app/notepad-example" target="_blank">Notepad</a></h2>
        <p>A simple notepad app with cloud functionalities.</p>
        <p><a href="https://github.com/HeyPuter/notepad" target="_blank">Source Code</a></p>
    </div>
</div>

<div class="example-card">
    <a href="/playground/?example=app-camera&autorun=1" target="_blank">
        <figure>
            <div class="example-thumb" style="background-image:url(/assets/img/example-camera.png);"></div>
        </figure>
    </a>
    <div class="example-card-desc">
        <h2><a href="/playground/?example=app-camera&autorun=1" target="_blank">Image Describer</a></h2>
        <p>Allows you take a picture and describe it using the Puter AI module. This app is powered by OpenAI GPT-4 Vision.</p>
    </div>
</div>

<div class="example-card">
    <a href="/playground/?example=app-summarizer&autorun=1" target="_blank">
        <figure>
            <div class="example-thumb" style="background-image:url(/assets/img/example-summarizer.png); background-position: initial;"></div>
        </figure>
    </a>
    <div class="example-card-desc">
        <h2><a href="/playground/?example=app-summarizer&autorun=1" target="_blank">Text Summarizer</a></h2>
        <p>Uses the Puter AI module to summarize a given long text. The model used in the background is GPT-4o mini.</p>
    </div>
</div>

</div>

<!--
File: getting-started.md
-->


## Installation

To begin using Puter.js, simply add it to your HTML file using the following script tag:

```html
<script src="https://js.puter.com/v2/"></script>
```

That's it! You're now ready to start using Puter.js in your web application. No need to install any dependencies or set up a server. No API keys or configuration required.

## Basic Usage
Once you've added the Puter.js script to your web application, a global `puter` object will be available for you to use. This object contains all of the functionality provided by Puter.js. For example, to use GPT-4o mini, you can call the `puter.ai.chat` function:

```html
<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <script>
        puter.ai.chat(`Why did the chicken cross the road?`).then(puter.print);
    </script>
</body>
</html>
```

This is all you need to use GPT-4o mini in your app. No backend code, no configuration, and no API keys. Just include the Puter.js script, and you're ready to start.

## Where to Go From Here

To learn more about the capabilities of Puter.js and how to use them in your web application, check out

- [Tutorials](https://developer.puter.com/tutorials): Step-by-step guides to help you get started with Puter.js and build powerful applications.

- [Playground](https://docs.puter.com/playground): Experiment with Puter.js in your browser and see the results in real-time. Many examples are available to help you understand how to use Puter.js effectively.

- [Examples](https://docs.puter.com/examples): A collection of code snippets and full applications that demonstrate how to use Puter.js to solve common problems and build innovative applications.

<!--
File: introduction.md
-->

## Puter.js

Puter.js brings serverless auth, cloud, and AI services directly to your browser-side JavaScript with no backend code or configuration required. Just include a single `<script>` tag and you can instantly use file storage, databases, GPT-4, DALL-E, and more right from your frontend code. Puter is forever free for developers!

<div class="browser-window">
    <div class="titlebar">
        <div class="buttons">
            <div class="button close"></div>
            <div class="button minimize"></div>
            <div class="button maximize"></div>
        </div>
    </div>
    <div class="address-bar" style="display: flex; align-items: center;">
        <svg style="margin-right: 15px; width: 15px;" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="24px" height="24px" viewBox="0 0 24 24"><g transform="translate(0, 0)"><path d="M8.293,4.293l-7,7a1,1,0,0,0,0,1.414l7,7a1,1,0,0,0,1.414-1.414L4.414,13H22a1,1,0,0,0,0-2H4.414L9.707,5.707A1,1,0,1,0,8.293,4.293Z" fill="#444444"></path></g></svg>
        <svg style="width: 15px; margin-right: 20px;" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="24px" height="24px" viewBox="0 0 24 24"><g transform="translate(0, 0)"><path d="M15.707,19.707l7-7a1,1,0,0,0,0-1.414l-7-7a1,1,0,0,0-1.414,1.414L19.586,11H2a1,1,0,0,0,0,2H19.586l-5.293,5.293a1,1,0,0,0,1.414,1.414Z" fill="#444444"></path></g></svg>
        <svg style="margin-right: 15px; width: 15px;" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="24px" height="24px" viewBox="0 0 24 24" stroke-width="2"><g stroke-width="2" transform="translate(0, 0)"><polyline points="21.034 1.13 21.763 6.927 16.071 5.341" fill="none" stroke="#444444" stroke-linecap="square" stroke-miterlimit="10" stroke-width="2" stroke-linejoin="miter"></polyline><path data-cap="butt" d="M21.763,6.927A11,11,0,1,0,23,12" fill="none" stroke="#444444" stroke-miterlimit="10" stroke-width="2" stroke-linecap="butt" stroke-linejoin="miter"></path></g></svg>
        <span style="flex-grow: 1; padding: 5px; background: white; border-radius: 15px; padding-left: 20px; display: flex; align-items: center; font-size: 13px;">
            <svg style="width:15px; height:15px; margin-right: 5px;" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="24px" height="24px" viewBox="0 0 24 24"><g transform="translate(0, 0)"><path d="M20,10H4c-1.105,0-2,.895-2,2v10c0,1.105,.895,2,2,2H20c1.105,0,2-.895,2-2V12c0-1.105-.895-2-2-2Zm-8,9c-1.105,0-2-.895-2-2s.895-2,2-2,2,.895,2,2-.895,2-2,2Z" fill="#00bc2f"></path><path data-color="color-2" d="M18,8h-2v-2c.023-2.184-1.727-3.974-3.911-4h-.042c-2.197-.038-4.009,1.711-4.047,3.908,0,.001,0,.002,0,.003v2.089h-2v-2.1C6.033,2.636,8.685,.006,11.949,0h.061c3.302-.006,5.984,2.666,5.99,5.968,0,.014,0,.028,0,.042v1.99Z" fill="#00bc2f"></path></g></svg>
            https://super-magical-website.com
        </span>
    </div>
    <div class="content" style="position: relative; margin-top: 20px; display: flex; flex-direction: column; justify-content: center; align-items: center; margin-bottom: 40px;">
        <div style="width: 620px; height: 120px; position: relative; font-weight: 500;">
            <div style="width: 100px; height: 100px; position: absolute; left:10px;">
                <div class="feature-name-top">GPT-4o</div>
                <div  class="feature-line-top"></div><div></div>
            </div>
            <div style="width: 100px; height: 65px; position: absolute; left: 120px; bottom: 20px;">
                <div class="feature-name-top">Cloud Storage</div>
                <div  class="feature-line-top"></div><div></div>
            </div>
            <div style="width: 150px; height: 100px; position: absolute; left: 230px;">
                <div class="feature-name-top">Claude 3.5 Sonnet</div>
                <div  class="feature-line-top"></div><div></div>
            </div>
            <div style="width: 100px; height: 70px; position: absolute; left: 400px; bottom: 20px;">
                <div class="feature-name-top">DALL·E 3</div>
                <div  class="feature-line-top"></div><div></div>
            </div>
            <div style="width: 100px; height: 100px; position: absolute; left: 500px;">
                <div class="feature-name-top">NoSQL</div>
                <div  class="feature-line-top"></div><div></div>
            </div>
        </div>
        <p class="script-tag">&lt;script src=&quot;<span class="url">https://js.puter.com/v2/</span>&quot;&gt;&lt;/script&gt;</p>
        <div style="width: 620px; height: 120px; position: relative; font-weight: 500;">
            <div style="width: 150px; height: 100px; position: absolute; left:10px;">
                <div>
                    <div style="width: 50%; float: left; border-right: 1px dotted; height: calc(100% - 30px);"></div>
                    <div></div>
                </div>
                <div style="width: 100%; text-align:center; position: absolute; bottom: 0;">Publish web pages</div>
            </div>
            <div style="width: 100px; height: 130px; position: absolute; left:160px;">
                <div>
                    <div style="width: 50%; float: left; border-right: 1px dotted; height: calc(100% - 30px);"></div>
                    <div></div>
                </div>
                <div style="width: 100%; text-align:center; position: absolute; bottom: 0;">Auth</div>
            </div>
            <div style="width: 150px; height: 100px; position: absolute; left:250px;">
                <div>
                    <div style="width: 50%; float: left; border-right: 1px dotted; height: calc(100% - 30px);"></div>
                    <div></div>
                </div>
                <div style="width: 100%; text-align:center; position: absolute; bottom: 0;">UI Components</div>
            </div>
            <div style="width: 100px; height: 150px; position: absolute; left:400px;">
                <div>
                    <div style="width: 50%; float: left; border-right: 1px dotted; height: calc(100% - 30px);"></div>
                    <div></div>
                </div>
                <div style="width: 100%; text-align:center; position: absolute; bottom: 0;">Text to Image</div>
            </div>
            <div style="width: 100px; height: 100px; position: absolute; left:500px;">
                <div>
                    <div style="width: 50%; float: left; border-right: 1px dotted; height: calc(100% - 30px);"></div>
                    <div></div>
                </div>
                <div style="width: 100%; text-align:center; position: absolute; bottom: 0;">Text to Speech</div>
            </div>
        </div>
    </div>
</div>

Additionally, Puter.js works in a way that every user of your app will cover their own costs, so whether you have 1 user or 1 million users, your app won't cost you anything to run. In other words, Puter.js gives your app infinitely scalable Cloud and AI for free.

Puter.js is powered by [Puter](https://github.com/HeyPuter/puter), the open-source cloud operating system with a heavy focus on privacy. Puter does not use tracking technologies and does not monetize or even collect personal information.

<h2 style="margin-top: 60px;">Examples</h2>
<div style="overflow:hidden; margin-bottom: 30px;">
    <div class="example-group active" data-section="ai" data-icon="ai_outline" data-icon-active="ai_active"><i class="icon"></i><span>AI</span></div>
    <div class="example-group" data-section="fs" data-icon="fs_outline" data-icon-active="fs_active"><i class="icon"></i><span>Cloud Storage</span></div>
    <div class="example-group" data-section="kv" data-icon="kv_outline" data-icon-active="kv_active"><i class="icon"></i><span>NoSQL</span></div>
    <div class="example-group" data-section="hosting" data-icon="hosting_outline" data-icon-active="hosting_active"><i class="icon"></i><span>Hosting</span></div>
    <div class="example-group" data-section="auth" data-icon="auth_outline" data-icon-active="auth_active"><i class="icon"></i><span>Auth</span></div>
</div>

<div class="example-content" data-section="fs">

#### Write a file to the cloud

```html;intro-fs-write
<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <script>
        // Create a new file called "hello.txt" containing "Hello, world!"
        puter.fs.write('hello.txt', 'Hello, world!').then((file) => {
            puter.print(`File written successfully at: ${file.path}`);
        })
    </script>
</body>
</html>
```

<strong class="example-title" style="margin-top: 40px;">Read a file from the cloud</strong>

```html;fs-read
<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <script>
        (async () => {
            // (1) Create a random text file
            let filename = puter.randName() + ".txt";
            await puter.fs.write(filename, "Hello world! I'm a file!");
            puter.print(`"${filename}" created<br>`);

            // (2) Read the file and print its contents
            let blob = await puter.fs.read(filename);
            let content = await blob.text();
            puter.print(`"${filename}" read (content: "${content}")<br>`);
        })();
    </script>
</body>
</html>
```

</div>

<div class="example-content" data-section="kv">

#### Save user preference in the cloud Key-Value Store

```html;intro-kv-set
<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <script>
        // (1) Save user preference
        puter.kv.set('userPreference', 'darkMode').then(() => {
            // (2) Get user preference
            puter.kv.get('userPreference').then(value => {
                puter.print(`User preference: ${value}`);
            });
        })
    </script>
</body>
</html>
```

</div>


<div class="example-content" data-section="ai" style="display:block;">


#### Chat with GPT-4o mini

```html;intro-chatgpt
<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <script>
        // Chat with GPT-4o mini
        puter.ai.chat(`What is life?`).then(puter.print);
    </script>
</body>
</html>
```

<p><strong class="example-title" style="margin-top:40px;">GPT-4 Vision</strong></p>

```html;intro-gpt-vision
<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <img src="https://assets.puter.site/doge.jpeg" style="display:block;">
    <script>
        puter.ai.chat(
            `What do you see?`, 
            `https://assets.puter.site/doge.jpeg`)
        .then(puter.print);
    </script>
</body>
</html>
```

<strong class="example-title" style="margin-top:40px;">Generate an image of a cat using DALL·E 3</strong>

```html;ai-txt2img
<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <script>
        // Generate an image of a cat using DALL·E 3. Please note that testMode is set to true so that you can test this code without using up API credits.
        puter.ai.txt2img('A picture of a cat.', true).then((image)=>{
            document.body.appendChild(image);
        });
    </script>
</body>
</html>
```


<p><strong class="example-title" style="margin-top:40px;">Stream the response</strong></p>

```html;ai-chat-stream
<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <script>
    (async () => {
        const resp = await puter.ai.chat('Tell me in detail what Rick and Morty is all about.', {model: 'claude', stream: true });
        for await ( const part of resp ) puter.print(part?.text?.replaceAll('\n', '<br>'));
    })();
    </script>
</body>
</html>
```


</div>

<div class="example-content" data-section="hosting"> 

#### Publish a static website

```html;intro-hosting
<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <script>
        (async () => {
            // (1) Create a random directory
            let dirName = puter.randName();
            await puter.fs.mkdir(dirName)

            // (2) Create 'index.html' in the directory with the contents "Hello, world!"
            await puter.fs.write(`${dirName}/index.html`, '<h1>Hello, world!</h1>');

            // (3) Host the directory under a random subdomain
            let subdomain = puter.randName();
            const site = await puter.hosting.create(subdomain, dirName)

            puter.print(`Website hosted at: <a href="https://${site.subdomain}.puter.site" target="_blank">https://${site.subdomain}.puter.site</a>`);
        })();
    </script>
</body>
</html>
```

</div>

<div class="example-content" data-section="auth">

#### Authenticate a user

```html;intro-auth
<html>
<body>
    <script src="https://js.puter.com/v2/"></script>
    <button id="sign-in">Sign in</button>
    <script>
        // Because signIn() opens a popup window, it must be called from a user action.
        document.getElementById('sign-in').addEventListener('click', async () => {
            // signIn() will resolve when the user has signed in.
            await puter.auth.signIn().then((res) => {
                puter.print('Signed in<br>' + JSON.stringify(res));
            });
        });
    </script>
</body>
</html>
```

</div>

<!--
File: security.md
-->

In this document we will cover the security model of Puter.js and how it manages apps' access to user data and cloud resources.

## Authentication

If Puter.js is being used in a website, as opposed to a puter.com app, the user will have to authenticate with Puter.com first, or in other words, the user needs to give your website permission before you can use any of the cloud services on their behalf. 

Fortunately, Puter.js handles this automatically and the user will be prompted to sign in with their Puter.com account when your code tries to access any cloud services. If the user is already signed in, they will not be prompted to sign in again. You can build your app as if the user is already signed in, and Puter.js will handle the authentication process for you whenever it's needed.

<figure style="margin: 40px 0;">
    <img src="/assets/img/auth.png" style="width: 100%; max-width: 600px; margin: 0px auto; display:block;">
    <figcaption style="text-align: center; font-size: 13px; color: #777;">The user will be automatically prompted to sign in with their Puter.com account when your code tries to access any cloud services or resources.</figcaption>
</figure>

If Puter.js is being used in an app published on Puter.com, the user will be automatically signed in and your app will have full access to all cloud services. 

## Default permissions

Once the user has been authenticated, your app will get a few things by default:

- **An app directory** in the user's cloud storage. This is where your app can freely store files and directories. The path to this directory will look like `~/AppData/<your-app-id>/`. This directory is automatically created for your app when the user has been authenticated the first time. Your app will not be able to access any files or data outside of this directory by default.

- **A key-value store** in the user's space. Your app will have its own sandboxed key-value store that it can freely write to and read from. Only your app will be able to access this key-value store, and no other apps will be able to access it. Your app will not be able to access any other key-value stores by default either.

<div class="info"><strong>Apps are sandboxed by default!</strong> Apps are not able to access any files, directories, or data outside of their own directory and key-value store within a user's account. This is to ensure that apps can't access any data or resources that they shouldn't have access to.</div>

Your app will also be able to use the following services by default:

- **AI**: Your app will be able to use the AI services provided by Puter.com. This includes chat, txt2img, img2txt, and more.

- **Hosting**: Your app will be able to use puter to create and publish websites on the user's behalf.


<!--
File: user-pays-model.md
-->

The User Pays Model is the underlying business and operational approach that allows Puter.js to offer its services for free to developers. Under this model, each user of your application pays for their own consumption of resources (storage, AI requests, computing power) through their Puter account, rather than the developer bearing these costs.

When a user interacts with your Puter.js-powered application, they authenticate with their Puter account, and any resources consumed (such as cloud storage used or AI API calls made) are charged to their account—not to you as the developer.

<br><br>

# Advantages of the User Pays Model

## 1. Zero Infrastructure Costs for Developers

Perhaps the most significant advantage is that you, as a developer, don't pay anything for infrastructure costs when using Puter.js for your infrastructure. Whether your app serves one user or one million users, your costs remain the same: zero.

## 2. No Need for API Key Management

You don't need to:
- Register for various AI and cloud service providers
- Manage and rotate API keys
- Worry about securing your API keys
- Monitor usage and billing for each service
- Pay for services that you don't use


## 3. Built-in Security

The authentication and authorization are handled by Puter's infrastructure:
- Users authenticate directly with Puter
- Your app operates within the permissions granted by the user
- Data is protected through Puter's security mechanisms

## 4. No Anti-Abuse Implementation Required

You don't need to implement:
- Rate limiting
- CAPTCHA verification
- IP blocking
- Usage quotas
- Fraud detection

Bad actors have no incentive to abuse the system because they are paying for their own usage.

## 5. Simpler Codebase

Since authentication, storage, and API access are all handled through Puter.js:
- Your codebase is significantly simpler
- You can focus entirely on your application's unique functionality
- Frontend-only development is possible for many applications

## 6. No Need to Ask Users for Their API Keys

Many AI applications require users to provide their own API keys for services like OpenAI. With Puter.js:
- Users don't need to have their own API keys
- Users don't need to understand how to get or manage API keys
- You avoid the security and UX concerns of handling user API keys

## 7. Simplified User Experience

For your users:
- Single sign-on through Puter
- Unified billing through their existing Puter account
- No need to create accounts with multiple service providers

<br>

## Everybody wins!

The User Pays Model enables Puter.js to provide a truly serverless development experience where you can build sophisticated applications with AI, cloud storage, and authentication—all from the frontend—without worrying about infrastructure costs, security, or scaling. It creates a win-win situation where developers can build without overhead costs, and users pay only for the resources they actually consume.