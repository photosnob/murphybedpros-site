function loadConversations() {
    var clientId = localStorage.getItem('wpaicg_chat_client_id');
    if (!clientId) {
        // Show conversation starters for each chat interface when there are no conversations
        showAllConversationStarters();
        return;
    }

    // Load conversations for both chat interfaces
    loadChatInterface('.wpaicg-chat-shortcode', 'shortcode', clientId);
    loadChatInterface('.wpaicg-chatbox', 'widget', clientId);
}

function showAllConversationStarters() {
    // Target both interfaces
    var containers = ['.wpaicg-chat-shortcode', '.wpaicg-chatbox'];
    containers.forEach(containerSelector => {
        var chatContainers = document.querySelectorAll(containerSelector);
        chatContainers.forEach(chatContainer => {
            showConversationStarters(chatContainer);
        });
    });
}

function loadChatInterface(containerSelector, type, clientId) {
    var chatContainers = document.querySelectorAll(containerSelector);
    console.log(`Loading chat history for ${type} interfaces...`);

    chatContainers.forEach(chatContainer => {

        // Read autoload chat conversations setting, default to '0' if not set
        var autoloadConversations = chatContainer.getAttribute('data-autoload_chat_conversations');
        console.log(`Autoload conversations setting for ${type} interface: ${autoloadConversations}`);
        if (autoloadConversations === null) {
            autoloadConversations = '1';  // Default value if attribute does not exist
        }

        // Fetch the bot ID based on the type
        var botId = chatContainer.getAttribute('data-bot-id') || '0';

        // Determine the history key based on whether it's a custom bot or not
        var historyKey = botId !== '0' 
            ? `wpaicg_chat_history_custom_bot_${botId}_${clientId}` 
            : `wpaicg_chat_history_${type}_${clientId}`;

        if (autoloadConversations === '0') {
            // Retrieve and display the chat history
            var chatHistory = localStorage.getItem(historyKey);
            if (chatHistory) {
                chatHistory = JSON.parse(chatHistory);
                var chatBox = chatContainer.querySelector('.wpaicg-chatbox-messages, .wpaicg-chat-shortcode-messages'); // Generalized selector
                if (!chatBox) {
                    console.error(`No chat box found within the ${type} container.`);
                    return;
                }
                chatBox.innerHTML = '';  // Clears the chat box
                chatHistory.forEach(message => {
                    reconstructMessage(chatBox, message, chatContainer);
                });
                chatBox.appendChild(document.createElement('br'));
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        chatBox.scrollTop = chatBox.scrollHeight; // Scrolls to the bottom
                    });
                });
                hideConversationStarter(chatContainer);

            } else {
                showConversationStarters(chatContainer);
            }
        } else {
            showConversationStarters(chatContainer);
        }
    });
}

function reconstructMessage(chatBox, message, chatContainer) {
    var messageElement = document.createElement('li');
    var isUserMessage = message.startsWith('Human:');
    var isWidget = chatContainer.classList.contains('wpaicg-chatbox');

    // Apply the correct class based on message source and container type
    if (isUserMessage) {
        messageElement.className = isWidget ? 'wpaicg-chat-user-message' : 'wpaicg-user-message';
    } else {
        messageElement.className = isWidget ? 'wpaicg-chat-ai-message' : 'wpaicg-ai-message';
    }
    
    // Format the message content
    message = message.replace('Human:', '').replace('AI:', '').replace(/\n/g, '<br>');
    var userBgColor = chatContainer.getAttribute('data-user-bg-color');
    var aiBgColor = chatContainer.getAttribute('data-ai-bg-color');
    var fontSize = chatContainer.getAttribute('data-fontsize');
    var fontColor = chatContainer.getAttribute('data-color');
    var useAvatar = parseInt(chatContainer.getAttribute('data-use-avatar')) || 0;
    var userAvatar = chatContainer.getAttribute('data-user-avatar');
    var aiAvatar = chatContainer.getAttribute('data-ai-avatar');
    var displayName = isUserMessage ? (useAvatar ? `<img src="${userAvatar}" height="40" width="40">` : 'You:') : (useAvatar ? `<img src="${aiAvatar}" height="40" width="40">` : 'AI:');

    messageElement.style.backgroundColor = isUserMessage ? userBgColor : aiBgColor;
    messageElement.style.color = fontColor;
    messageElement.style.fontSize = fontSize;
    messageElement.innerHTML = `<p style="width:100%"><strong class="wpaicg-chat-avatar">${displayName}</strong> <span class="wpaicg-chat-message">${message}</span></p>`;

    chatBox.appendChild(messageElement);
}
function hideConversationStarter(chatContainer) {
    var starters = chatContainer.querySelectorAll('.wpaicg-conversation-starters');
    starters.forEach(starter => starter.style.display = 'none');
}

function showConversationStarters(chatContainer) {
    const startersContainer = chatContainer.querySelector('.wpaicg-conversation-starters');
    if (startersContainer) {  // Check if the container exists
        startersContainer.style.visibility = 'visible'; // Make the container visible if it exists
        const starters = startersContainer.querySelectorAll('.wpaicg-conversation-starter');
        starters.forEach((starter, index) => {
            setTimeout(() => {
                starter.style.opacity = "1";
                starter.style.transform = "translateY(0)";
            }, index * 150); // Staggered appearance
        });
    }
}
function wpaicgChatShortcodeSize(){
    var wpaicgWindowWidth = window.innerWidth;
    var wpaicgWindowHeight = window.innerHeight;
    var chatShortcodes = document.getElementsByClassName('wpaicg-chat-shortcode');
    if(chatShortcodes !== null && chatShortcodes.length){
        for(var i=0;i<chatShortcodes.length;i++){
            var chatShortcode = chatShortcodes[i];
            var parentChat = chatShortcode.parentElement;
            var parentWidth = parentChat.offsetWidth;
            var chatWidth = chatShortcode.getAttribute('data-width');
            var chatHeight = chatShortcode.getAttribute('data-height');
            var chatFooter = chatShortcode.getAttribute('data-footer');
            var chatBar = chatShortcode.getAttribute('data-has-bar');
            var chatRounded = parseFloat(chatShortcode.getAttribute('data-chat_rounded'));
            var textRounded = parseFloat(chatShortcode.getAttribute('data-text_rounded'));
            var textHeight= parseFloat(chatShortcode.getAttribute('data-text_height'));
            var textInput = chatShortcode.getElementsByClassName('wpaicg-chat-shortcode-typing')[0];
            textInput.style.height =  textHeight+'px';
            textInput.style.borderRadius =  textRounded+'px';
            chatShortcode.style.borderRadius = chatRounded+'px';
            chatShortcode.style.overflow = 'hidden';
            chatWidth = chatWidth !== null ? chatWidth : '350';
            chatHeight = chatHeight !== null ? chatHeight : '400';
            if(chatShortcode.classList.contains('wpaicg-fullscreened')){
                parentWidth = wpaicgWindowWidth;
            }
            if(chatWidth.indexOf('%') < 0){
                if(chatWidth.indexOf('px') < 0){
                    chatWidth = parseFloat(chatWidth);
                }
                else{
                    chatWidth = parseFloat(chatWidth.replace(/px/g,''));
                }
            }
            else{
                chatWidth = parseFloat(chatWidth.replace(/%/g,''));
                if(chatWidth < 100) {
                    chatWidth = chatWidth * parentWidth / 100;
                }
                else{
                    chatWidth = '';
                }
            }
            var chatPreviewBot = chatShortcode.closest('.wpaicg-bot-preview');
            if(chatPreviewBot && chatPreviewBot.offsetWidth < chatWidth){
                chatWidth = chatPreviewBot.offsetWidth;
            }
            if(chatHeight.indexOf('%') < 0){
                if(chatHeight.indexOf('px') < 0){
                    chatHeight = parseFloat(chatHeight);
                }
                else{
                    chatHeight = parseFloat(chatHeight.replace(/px/g,''));
                }
            }
            else{
                chatHeight = parseFloat(chatHeight.replace(/%/g,''));
                chatHeight = chatHeight*wpaicgWindowHeight/100;
            }
            if(chatWidth !== '') {
                chatShortcode.style.width = chatWidth + 'px';
                chatShortcode.style.maxWidth = chatWidth+'px';
            }
            else{
                chatShortcode.style.width = '';
                chatShortcode.style.maxWidth = '';
            }
            if(chatShortcode.classList.contains('wpaicg-fullscreened')){
                chatShortcode.style.marginTop = 0;
            }
            else{
                chatShortcode.style.marginTop = '';
            }
            chatShortcode.getElementsByClassName('wpaicg-chat-shortcode-messages')[0].style.height = chatHeight+'px';
        }
    }
}
function wpaicgChatBoxSize() {
    var wpaicgWindowWidth = window.innerWidth;
    var wpaicgWindowHeight = window.innerHeight;
    var chatWidgets = document.getElementsByClassName('wpaicg_chat_widget_content');
    var chatPreviewBox = document.getElementsByClassName('wpaicg-chatbox-preview-box');

    if (chatWidgets.length) {
        for (var i = 0; i < chatWidgets.length; i++) {
            var chatWidget = chatWidgets[i];
            var chatbox = chatWidget.getElementsByClassName('wpaicg-chatbox')[0];
            var chatWidth = chatbox.getAttribute('data-width') || '350';
            var chatHeight = chatbox.getAttribute('data-height') || '400';
            var chatFooter = chatbox.getAttribute('data-footer');
            var chatboxBar = chatbox.getElementsByClassName('wpaicg-chatbox-action-bar');
            var textHeight = parseFloat(chatbox.getAttribute('data-text_height'));

            // Adjust dimensions for the preview box if present
            if (chatPreviewBox.length && chatPreviewBox[0].offsetWidth) {
                wpaicgWindowWidth = chatPreviewBox[0].offsetWidth;
            }

            // Calculate dimensions dynamically
            chatWidth = resolveDimension(chatWidth, wpaicgWindowWidth);
            chatHeight = resolveDimension(chatHeight, wpaicgWindowHeight);

            chatbox.style.width = chatWidth + 'px';
            chatbox.style.height = chatHeight + 'px';
            chatWidget.style.width = chatWidth + 'px';
            chatWidget.style.height = chatHeight + 'px';

            if (chatPreviewBox.length) {
                chatPreviewBox[0].style.height = (chatHeight + 125) + 'px'; // Adjusting preview box height
            }

            // Adjusting heights for content and message areas
            var actionBarHeight = chatboxBar.length ? 40 : 0; // Assuming action bar height is 40
            var footerHeight = chatFooter ? 60 : 0; // Adjusting footer height if enabled
            var contentHeight = chatHeight - textHeight - actionBarHeight - footerHeight - 20; // Including some padding
            var messagesHeight = contentHeight - 20; // Additional space for inner padding or margins

            var chatboxContent = chatWidget.getElementsByClassName('wpaicg-chatbox-content')[0];
            var chatboxMessages = chatWidget.getElementsByClassName('wpaicg-chatbox-messages')[0];
            chatboxContent.style.height = contentHeight + 'px';
            chatboxMessages.style.height = messagesHeight + 'px';

            // Ensure last message is visible
            chatboxMessages.scrollTop = chatboxMessages.scrollHeight;
        }
    }
}

function resolveDimension(value, totalSize) {
    if (value.includes('%')) {
        return parseFloat(value) / 100 * totalSize;
    } else if (value.includes('px')) {
        return parseFloat(value.replace('px', ''));
    }
    return parseFloat(value); // Default to parsing the value as pixels if no units are specified
}

function wpaicgChatInit() {
    let wpaicgMicIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M176 0C123 0 80 43 80 96V256c0 53 43 96 96 96s96-43 96-96V96c0-53-43-96-96-96zM48 216c0-13.3-10.7-24-24-24s-24 10.7-24 24v40c0 89.1 66.2 162.7 152 174.4V464H104c-13.3 0-24 10.7-24 24s10.7 24 24 24h72 72c13.3 0 24-10.7 24-24s-10.7-24-24-24H200V430.4c85.8-11.7 152-85.3 152-174.4V216c0-13.3-10.7-24-24-24s-24 10.7-24 24v40c0 70.7-57.3 128-128 128s-128-57.3-128-128V216z"/></svg>';
    let wpaicgStopIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm256-96a96 96 0 1 1 0 192 96 96 0 1 1 0-192zm0 224a128 128 0 1 0 0-256 128 128 0 1 0 0 256zm0-96a32 32 0 1 0 0-64 32 32 0 1 0 0 64z"/></svg>';
    var wpaicgChatStream;
    var wpaicgChatRec;
    var wpaicgInput;
    var wpaicgChatAudioContext = window.AudioContext || window.webkitAudioContext;
    var wpaicgaudioContext;
    var wpaicgMicBtns = document.querySelectorAll('.wpaicg-mic-icon');
    var wpaicgChatTyping = document.querySelectorAll('.wpaicg-chatbox-typing');
    var wpaicgShortcodeTyping = document.querySelectorAll('.wpaicg-chat-shortcode-typing');
    var wpaicgChatSend = document.querySelectorAll('.wpaicg-chatbox-send');
    var wpaicgShortcodeSend = document.querySelectorAll('.wpaicg-chat-shortcode-send');
    var wpaicgChatFullScreens = document.getElementsByClassName('wpaicg-chatbox-fullscreen');
    var wpaicgChatCloseButtons = document.getElementsByClassName('wpaicg-chatbox-close-btn');
    var wpaicgChatDownloadButtons = document.getElementsByClassName('wpaicg-chatbox-download-btn');
    var wpaicg_chat_widget_toggles = document.getElementsByClassName('wpaicg_toggle');
    var wpaicg_chat_widgets = document.getElementsByClassName('wpaicg_chat_widget');
    var imageInputThumbnail = null; // Variable to store the image thumbnail
    function setupConversationStarters() {
        const starters = document.querySelectorAll('.wpaicg-conversation-starter');
        starters.forEach(starter => {
            starter.addEventListener('click', function() {
                const messageText = starter.innerText || starter.textContent;
                const chatContainer = starter.closest('.wpaicg-chat-shortcode') || starter.closest('.wpaicg-chatbox');
                const type = chatContainer.classList.contains('wpaicg-chat-shortcode') ? 'shortcode' : 'widget';
                const typingInput = type === 'shortcode' ? chatContainer.querySelector('.wpaicg-chat-shortcode-typing') : chatContainer.querySelector('.wpaicg-chatbox-typing');
    
                typingInput.value = messageText;
                wpaicgSendChatMessage(chatContainer, typingInput, type);
    
                // Hide all starters
                starters.forEach(starter => {
                    starter.style.display = 'none';
                });
            });
        });
    }
    
    setupConversationStarters();


    var imageIcon = document.querySelector('.wpaicg-img-icon');
    var spinner = document.querySelector('.wpaicg-img-spinner');
    var thumbnailPlaceholder = document.querySelector('.wpaicg-thumbnail-placeholder');

    if (imageIcon) {
        imageIcon.addEventListener('click', function() {
            var imageInput = document.getElementById('imageUpload');
            imageInput.click();
        });
    }

    var imageInput = document.getElementById('imageUpload');
    if (imageInput) {
        imageInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                var file = this.files[0];  // Store the file reference here
    
                // Show the spinner and hide the image icon
                imageIcon.style.display = 'none';
                spinner.style.display = 'inline-block';
                
                console.log("Image selected: ", file.name);
                imageIcon.title = file.name; // Optional: show image name on hover
    
                // Hide the spinner and show the image icon and thumbnail after a delay
                setTimeout(function() {
                    spinner.style.display = 'none';
                    imageIcon.style.display = 'inline-block'; // Re-display image icon
                    
                    // Now set the thumbnail image using the stored file reference
                    thumbnailPlaceholder.style.backgroundImage = `url(${URL.createObjectURL(file)})`;
                    thumbnailPlaceholder.style.backgroundSize = 'cover';
                    thumbnailPlaceholder.style.backgroundPosition = 'center';
                    thumbnailPlaceholder.style.backgroundRepeat = 'no-repeat';
                    thumbnailPlaceholder.style.display = 'inline-block'; // Display thumbnail
                }, 2000);
            }
        });
    }
    
    // Function to set up event listeners on all clear chat buttons
    function setupClearChatButtons() {
        var wpaicgChatClearButtons = document.querySelectorAll('.wpaicg-chatbox-clear-btn');
        wpaicgChatClearButtons.forEach(button => {
            button.addEventListener('click', function() {
                var chatContainer = button.closest('[data-bot-id]'); // Finds the nearest parent with 'data-bot-id'
                if (chatContainer) {
                    var botId = chatContainer.getAttribute('data-bot-id') || '0';
                    var clientId = localStorage.getItem('wpaicg_chat_client_id');
                    clearChatHistory(botId, clientId, chatContainer);
                }
            });
        });
    }

    // Function to clear the chat history from local storage and the display
    function clearChatHistory(botId, clientId, chatContainer) {
        var isCustomBot = botId !== '0';
        var type = chatContainer.classList.contains('wpaicg-chat-shortcode') ? 'shortcode' : 'widget'; // Determine the type based on class
        var historyKey = isCustomBot 
            ? `wpaicg_chat_history_custom_bot_${botId}_${clientId}` 
            : `wpaicg_chat_history_${type}_${clientId}`; // Adjust history key based on type

        // Remove the item from local storage
        localStorage.removeItem(historyKey);
        console.log(`Chat history cleared for bot ID ${botId} and client ID ${clientId}.`);

        // Clear the chat display
        var chatBoxSelector = '.wpaicg-chatbox-messages, .wpaicg-chat-shortcode-messages'; // Generalized selector for both types
        var chatBox = chatContainer.querySelector(chatBoxSelector);
        if (chatBox) {
            chatBox.innerHTML = ''; // Clear the chat box visually
        }
    }

    // Call this function once your DOM is fully loaded or at the end of your script
    setupClearChatButtons();


    if(wpaicg_chat_widget_toggles !== null && wpaicg_chat_widget_toggles.length){
        for(var i=0;i<wpaicg_chat_widget_toggles.length;i++){
            var wpaicg_chat_widget_toggle = wpaicg_chat_widget_toggles[i];
            var wpaicg_chat_widget = wpaicg_chat_widget_toggle.closest('.wpaicg_chat_widget');
            wpaicg_chat_widget_toggle.addEventListener('click', function (e){
                e.preventDefault();
                wpaicg_chat_widget_toggle = e.currentTarget;
                if(wpaicg_chat_widget_toggle.classList.contains('wpaicg_widget_open')){
                    wpaicg_chat_widget_toggle.classList.remove('wpaicg_widget_open');
                    wpaicg_chat_widget.classList.remove('wpaicg_widget_open');
                }
                else{
                    wpaicg_chat_widget.classList.add('wpaicg_widget_open');
                    wpaicg_chat_widget_toggle.classList.add('wpaicg_widget_open');
                }
            });
        }
    }
    if(wpaicgChatDownloadButtons.length){
        for(var i=0;i < wpaicgChatDownloadButtons.length;i++){
            var wpaicgChatDownloadButton = wpaicgChatDownloadButtons[i];
            wpaicgChatDownloadButton.addEventListener('click', function (e){
                wpaicgChatDownloadButton = e.currentTarget;
                var type = wpaicgChatDownloadButton.getAttribute('data-type');
                var wpaicgWidgetContent,listMessages;
                if(type === 'shortcode') {
                    wpaicgWidgetContent = wpaicgChatDownloadButton.closest('.wpaicg-chat-shortcode');
                    listMessages = wpaicgWidgetContent.getElementsByClassName('wpaicg-chat-shortcode-messages');
                }
                else{
                    wpaicgWidgetContent = wpaicgChatDownloadButton.closest('.wpaicg_chat_widget_content');
                    listMessages = wpaicgWidgetContent.getElementsByClassName('wpaicg-chatbox-messages');
                }
                if(listMessages.length) {
                    var listMessage = listMessages[0];
                    var messages = [];
                    var chatMessages = listMessage.getElementsByTagName('li');
                    if (chatMessages.length) {
                        for (var i = 0; i < chatMessages.length; i++) {
                            messages.push(chatMessages[i].innerText.replace("\n",' '));
                        }
                    }
                    var messagesDownload = messages.join("\n");
                    var element = document.createElement('a');
                    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(messagesDownload));
                    element.setAttribute('download', 'chat.txt');

                    element.style.display = 'none';
                    document.body.appendChild(element);

                    element.click();

                    document.body.removeChild(element);
                }
            })
        }
    }
    if(wpaicgChatCloseButtons.length){
        for(var i = 0; i < wpaicgChatCloseButtons.length;i++){
            var wpaicgChatCloseButton = wpaicgChatCloseButtons[i];
            wpaicgChatCloseButton.addEventListener('click', function (e){
                wpaicgChatCloseButton = e.currentTarget;
                var wpaicgWidgetContent = wpaicgChatCloseButton.closest('.wpaicg_chat_widget_content');
                var chatbox = wpaicgWidgetContent.closest('.wpaicg_chat_widget');
                if(wpaicgWidgetContent.classList.contains('wpaicg-fullscreened')){
                    var fullScreenBtn = wpaicgWidgetContent.getElementsByClassName('wpaicg-chatbox-fullscreen')[0];
                    wpaicgFullScreen(fullScreenBtn);
                }
                chatbox.getElementsByClassName('wpaicg_toggle')[0].click();

            })
        }
    }
    
    function wpaicgFullScreen(btn){
        var type = btn.getAttribute('data-type');
        if(type === 'shortcode'){
            var wpaicgChatShortcode = btn.closest('.wpaicg-chat-shortcode');
            if (btn.classList.contains('wpaicg-fullscreen-box')) {
                btn.classList.remove('wpaicg-fullscreen-box');
                var chatWidth = wpaicgChatShortcode.getAttribute('data-old-width');
                var chatHeight = wpaicgChatShortcode.getAttribute('data-old-height');
                wpaicgChatShortcode.setAttribute('data-width', chatWidth);
                wpaicgChatShortcode.setAttribute('data-height', chatHeight);
                wpaicgChatShortcode.style.position = '';
                wpaicgChatShortcode.style.top = '';
                wpaicgChatShortcode.style.left = '';
                wpaicgChatShortcode.style.zIndex = '';
                wpaicgChatShortcode.classList.remove('wpaicg-fullscreened');
            }
            else{
                var newChatBoxWidth = document.body.offsetWidth;
                var chatWidth = wpaicgChatShortcode.getAttribute('data-width');
                var chatHeight = wpaicgChatShortcode.getAttribute('data-height');
                wpaicgChatShortcode.setAttribute('data-old-width', chatWidth);
                wpaicgChatShortcode.setAttribute('data-old-height', chatHeight);
                wpaicgChatShortcode.setAttribute('data-width', newChatBoxWidth);
                wpaicgChatShortcode.setAttribute('data-height', '100%');
                btn.classList.add('wpaicg-fullscreen-box');
                wpaicgChatShortcode.style.position = 'fixed';
                wpaicgChatShortcode.style.top = 0;
                wpaicgChatShortcode.style.left = 0;
                wpaicgChatShortcode.style.zIndex = 999999999;
                wpaicgChatShortcode.classList.add('wpaicg-fullscreened');
                const demoContent = document.querySelector('.demo-page-fixed-content');
                if (demoContent) {
                    demoContent.style.position = 'static'; // Temporarily adjust position
                }
            }
            wpaicgChatShortcodeSize();

        }
        else {
            var wpaicgWidgetContent = btn.closest('.wpaicg_chat_widget_content');
            var chatbox = wpaicgWidgetContent.getElementsByClassName('wpaicg-chatbox')[0];
            if (btn.classList.contains('wpaicg-fullscreen-box')) {
                btn.classList.remove('wpaicg-fullscreen-box');
                var chatWidth = chatbox.getAttribute('data-old-width');
                var chatHeight = chatbox.getAttribute('data-old-height');
                chatbox.setAttribute('data-width', chatWidth);
                chatbox.setAttribute('data-height', chatHeight);
                wpaicgWidgetContent.style.position = 'absolute';
                wpaicgWidgetContent.style.bottom = '';
                wpaicgWidgetContent.style.left = '';
                wpaicgWidgetContent.classList.remove('wpaicg-fullscreened');
            } else {
                var newChatBoxWidth = document.body.offsetWidth;
                var chatWidth = chatbox.getAttribute('data-width');
                var chatHeight = chatbox.getAttribute('data-height');
                chatbox.setAttribute('data-old-width', chatWidth);
                chatbox.setAttribute('data-old-height', chatHeight);
                chatbox.setAttribute('data-width', newChatBoxWidth);
                chatbox.setAttribute('data-height', '100%');
                btn.classList.add('wpaicg-fullscreen-box');
                wpaicgWidgetContent.style.position = 'fixed';
                wpaicgWidgetContent.style.bottom = 0;
                wpaicgWidgetContent.style.left = 0;
                wpaicgWidgetContent.classList.add('wpaicg-fullscreened');
                const demoContent = document.querySelector('.demo-page-fixed-content');
                if (demoContent) {
                    demoContent.style.position = 'static'; // Temporarily adjust position
                }
            }
            wpaicgChatBoxSize();
        }
    }
    if(wpaicgChatFullScreens.length){
        for(var i=0; i < wpaicgChatFullScreens.length; i++){
            var wpaicgChatFullScreen = wpaicgChatFullScreens[i];
            wpaicgChatFullScreen.addEventListener('click', function (e){
                wpaicgFullScreen(e.currentTarget);
            })
        }
    }
    window.addEventListener('resize', function (){
        wpaicgChatBoxSize();
        wpaicgChatShortcodeSize();
        if(wpaicg_chat_widgets !== null && wpaicg_chat_widgets.length){
            for(var i =0;i<wpaicg_chat_widgets.length;i++){
                if(window.innerWidth < 350){
                    var wpaicg_chat_widget = wpaicg_chat_widgets[i];
                }
            }
        }
    })
    wpaicgChatShortcodeSize();
    wpaicgChatBoxSize();

    function wpaicgescapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function wpaicgstartChatRecording() {
        let constraints = {audio: true, video: false}
        navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
            wpaicgaudioContext = new wpaicgChatAudioContext();
            wpaicgChatStream = stream;
            wpaicgInput = wpaicgaudioContext.createMediaStreamSource(stream);
            wpaicgChatRec = new Recorder(wpaicgInput, {numChannels: 1});
            wpaicgChatRec.record();
        })
    }

    function wpaicgstopChatRecording(mic) {
        wpaicgChatRec.stop();
        wpaicgChatStream.getAudioTracks()[0].stop();
        wpaicgChatRec.exportWAV(function (blob) {
            let type = mic.getAttribute('data-type');
            let parentChat;
            let chatContent;
            let chatTyping;
            if (type === 'widget') {
                parentChat = mic.closest('.wpaicg-chatbox');
                chatContent = parentChat.querySelectorAll('.wpaicg-chatbox-content')[0];
                chatTyping = parentChat.querySelectorAll('.wpaicg-chatbox-typing')[0];
            } else {
                parentChat = mic.closest('.wpaicg-chat-shortcode');
                chatContent = parentChat.querySelectorAll('.wpaicg-chat-shortcode-content')[0];
                chatTyping = parentChat.querySelectorAll('.wpaicg-chat-shortcode-typing')[0];
            }
            wpaicgSendChatMessage(parentChat, chatTyping, type, blob);
        });
    }

    // Function to generate a random string
    function generateRandomString(length) {
        let result = '';
        let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }
    

    function wpaicgSendChatMessage(chat, typing, type, blob) {
        hideConversationStarters();
        let wpaicg_box_typing = typing;
        let wpaicg_ai_thinking, wpaicg_messages_box, class_user_item, class_ai_item;
        let wpaicgMessage = '';
        let wpaicgData = new FormData();
        let wpaicg_you = chat.getAttribute('data-you') + ':';
        let wpaicg_ai_name = chat.getAttribute('data-ai-name') + ':';
        let wpaicg_nonce = chat.getAttribute('data-nonce');
        let wpaicg_use_avatar = parseInt(chat.getAttribute('data-use-avatar'));
        let wpaicg_bot_id = parseInt(chat.getAttribute('data-bot-id'));
        let wpaicg_user_avatar = chat.getAttribute('data-user-avatar');
        let wpaicg_ai_avatar = chat.getAttribute('data-ai-avatar');
        let wpaicg_user_bg = chat.getAttribute('data-user-bg-color');
        let wpaicg_font_size = chat.getAttribute('data-fontsize');
        let wpaicg_speech = chat.getAttribute('data-speech');
        let wpaicg_voice = chat.getAttribute('data-voice');
        let elevenlabs_model = chat.getAttribute('data-elevenlabs-model');
        if (elevenlabs_model === null || elevenlabs_model === undefined) {
            elevenlabs_model = chat.getAttribute('data-elevenlabs_model');
        }
        let elevenlabs_voice = chat.getAttribute('data-elevenlabs-voice');
        if (elevenlabs_voice === null || elevenlabs_voice === undefined) {
            elevenlabs_voice = chat.getAttribute('data-elevenlabs_voice');
        }
        let wpaicg_voice_error = chat.getAttribute('data-voice-error');
        let wpaicg_typewriter_effect = chat.getAttribute('data-typewriter-effect');
        let wpaicg_typewriter_speed = chat.getAttribute('data-typewriter-speed');

        let url = chat.getAttribute('data-url');
        let post_id = chat.getAttribute('data-post-id');
        let wpaicg_ai_bg = chat.getAttribute('data-ai-bg-color');
        let wpaicg_font_color = chat.getAttribute('data-color');
        let voice_service = chat.getAttribute('data-voice_service');

        let voice_language = chat.getAttribute('data-voice_language');
        let voice_name = chat.getAttribute('data-voice_name');
        let voice_device = chat.getAttribute('data-voice_device');
        let openai_model = chat.getAttribute('data-openai_model');

        let openai_voice = chat.getAttribute('data-openai_voice');

        let openai_output_format = chat.getAttribute('data-openai_output_format');

        let openai_voice_speed = chat.getAttribute('data-openai_voice_speed');

        let openai_stream_nav = chat.getAttribute('data-openai_stream_nav');

        let voice_speed = chat.getAttribute('data-voice_speed');
        let voice_pitch = chat.getAttribute('data-voice_pitch');
        var chat_pdf = chat.getAttribute('data-pdf');

        // Handle image upload
        var imageInput = document.getElementById('imageUpload');
        var imageUrl = ''; // Variable to store the URL of the uploaded image for preview
        if(imageInput){
            if (imageInput.files && imageInput.files[0]) {
                // Append image file to FormData object
                wpaicgData.append('image', imageInput.files[0], imageInput.files[0].name);
                // Create a URL for the uploaded image file for preview
                imageUrl = URL.createObjectURL(imageInput.files[0]);
            }
        }

        if (type === 'widget') {
            wpaicg_ai_thinking = chat.getElementsByClassName('wpaicg-bot-thinking')[0];
            wpaicg_messages_box = chat.getElementsByClassName('wpaicg-chatbox-messages')[0];
            class_user_item = 'wpaicg-chat-user-message';
            class_ai_item = 'wpaicg-chat-ai-message';
            wpaicg_messages_box.scrollTop = wpaicg_messages_box.scrollHeight;
            // Retrieve all message elements
            const messages = wpaicg_messages_box.querySelectorAll('li');
            // Ensure messages exist and scroll to the last message
            if (messages.length > 0) {
                messages[messages.length - 1].scrollIntoView();
            } 
            
        } else {
            wpaicg_ai_thinking = chat.getElementsByClassName('wpaicg-bot-thinking')[0];
            wpaicg_messages_box = chat.getElementsByClassName('wpaicg-chat-shortcode-messages')[0];
            class_user_item = 'wpaicg-user-message';
            class_ai_item = 'wpaicg-ai-message';
        }
        if (wpaicg_use_avatar) {
            wpaicg_you = '<img src="' + wpaicg_user_avatar + '" height="40" width="40">';
            wpaicg_ai_name = '<img src="' + wpaicg_ai_avatar + '" height="40" width="40">';
        }
        wpaicg_ai_thinking.style.display = 'block';
        let wpaicg_question = wpaicgescapeHtml(wpaicg_box_typing.value);
        if (!wpaicg_question.trim() && blob === undefined) {
            console.log('Empty message. Not sending.');
            wpaicg_ai_thinking.style.display = 'none';
            return; // Exit the function if no message or blob is provided
        }
        wpaicgMessage += '<li class="' + class_user_item + '" style="background-color:' + wpaicg_user_bg + ';font-size: ' + wpaicg_font_size + 'px;color: ' + wpaicg_font_color + '">';
        wpaicgMessage += '<strong class="wpaicg-chat-avatar">' + wpaicg_you + '</strong>';
        wpaicgData.append('_wpnonce', wpaicg_nonce);
        wpaicgData.append('post_id', post_id);
        if(chat_pdf && chat_pdf !== null) {
            wpaicgData.append('namespace', chat_pdf);
        }
        wpaicgData.append('url', url);
        if (type === 'widget') {
            wpaicgData.append('action', 'wpaicg_chatbox_message');
        } else {
            wpaicgData.append('action', 'wpaicg_chat_shortcode_message');
        }
        if (blob !== undefined) {
            let url = URL.createObjectURL(blob);
            wpaicgMessage += '<audio src="' + url + '" controls="true"></audio>';
            wpaicgData.append('audio', blob, 'wpaicg-chat-recording.wav');
        } else if (wpaicg_question !== '') {
            wpaicgData.append('message', wpaicg_question);
            wpaicgMessage += wpaicg_question.replace(/\n/g,'<br>');

        }
       
        wpaicgData.append('bot_id',wpaicg_bot_id);
        wpaicgMessage += '</li>';
        // If an image URL is available, add an <img> tag to display the image
        if (imageUrl !== '') {
            wpaicgMessage += '<li class="' + class_user_item + '" style="background-color:' + wpaicg_user_bg + ';font-size: ' + wpaicg_font_size + 'px;color: ' + wpaicg_font_color + '">';
            wpaicgMessage += '<div style="max-width: 300px; height: auto; display: flex;">';
            wpaicgMessage += '<img src="' + imageUrl + '" style="max-width: 100%; height: auto;" onload="this.parentElement.parentElement.parentElement.scrollTop = this.parentElement.parentElement.parentElement.scrollHeight;">';
            wpaicgMessage += '</div>'; // Closing the div tag
            wpaicgMessage += '</li>';
        }
        wpaicg_messages_box.innerHTML += wpaicgMessage;
        wpaicg_messages_box.scrollTop = wpaicg_messages_box.scrollHeight;

        // Hide the thumbnail placeholder
        var thumbnailPlaceholder = document.querySelector('.wpaicg-thumbnail-placeholder');
        if (thumbnailPlaceholder) {
            thumbnailPlaceholder.style.display = 'none'; // Hide the thumbnail after message is sent
        }

        // Reset the image input after sending the message if imageInput exists first
        if (imageInput) {
            imageInput.value = '';
        }
                
        let chat_type = chat.getAttribute('data-type');
        
        let stream_nav;
        let chatbot_identity;

        // Check if it's a bot with dynamic ID
        if (wpaicg_bot_id && wpaicg_bot_id !== "0") {
            stream_nav = openai_stream_nav;
            chatbot_identity = 'custom_bot_' + wpaicg_bot_id;
        } else {
            // Check if it's a shortcode or widget based on chat_type
            if (chat_type === "shortcode") {
                stream_nav = chat.getAttribute('data-openai_stream_nav');
                chatbot_identity = 'shortcode';
            } else if (chat_type === "widget") {
                stream_nav = chat.getAttribute('data-openai_stream_nav');
                chatbot_identity = 'widget';
            }
        }
        wpaicgData.append('chatbot_identity', chatbot_identity);

        // Check for existing client_id in localStorage
        let clientID = localStorage.getItem('wpaicg_chat_client_id');
        if (!clientID) {
            // Generate and store a new client ID if not found
            clientID = generateRandomString(10); // Generate a 10 character string
            localStorage.setItem('wpaicg_chat_client_id', clientID);
        }

        //append client_id to wpaicgData
        wpaicgData.append('wpaicg_chat_client_id', clientID);

        // Hide the image thumbnail after sending the message
        if (imageInputThumbnail) {
            imageInputThumbnail.style.display = 'none';
        }

        // Function to update chat history in local storage for a specific bot identity
        function updateChatHistory(message, sender) {
            let chatHistoryKey = 'wpaicg_chat_history_' + chatbot_identity + '_' + clientID;
            let chatHistory = localStorage.getItem(chatHistoryKey);
            chatHistory = chatHistory ? JSON.parse(chatHistory) : [];
        
            // Format and add the new message
            let formattedMessage = (sender === 'user' ? "Human: " : "AI: ") + message.trim();
            chatHistory.push(formattedMessage);
        
            // Keep only the last 10 messages if there are more than 5
            if (chatHistory.length > 10) {
                chatHistory = chatHistory.slice(-10);
            }
        
            // Calculate total character count
            let totalCharCount = chatHistory.reduce((total, msg) => total + msg.length, 0);
        
            // Clear chat history if total character count exceeds 20000
            if (totalCharCount > 20000) {
                chatHistory = [];
            }
        
            localStorage.setItem(chatHistoryKey, JSON.stringify(chatHistory));
        }
        
        if (stream_nav === "1") {
            updateChatHistory(wpaicg_question, 'user');
            wpaicgData.append('wpaicg_chat_history', localStorage.getItem('wpaicg_chat_history_' + chatbot_identity + '_' + clientID));
            handleStreaming(wpaicgData,wpaicg_messages_box,wpaicg_box_typing,wpaicg_ai_thinking,class_ai_item,chat, chatbot_identity, clientID, wpaicg_use_avatar, wpaicg_ai_avatar);
        }
        else {

            updateChatHistory(wpaicg_question, 'user');
            // append chat history to wpaicgData
            wpaicgData.append('wpaicg_chat_history', localStorage.getItem('wpaicg_chat_history_' + chatbot_identity + '_' + clientID));

            const xhttp = new XMLHttpRequest();
            wpaicg_box_typing.value = '';
            xhttp.open('POST', wpaicgParams.ajax_url, true);
            xhttp.send(wpaicgData);
            xhttp.onreadystatechange = function (oEvent) {
                if (xhttp.readyState === 4) {
                    var wpaicg_message = '';
                    var wpaicg_response_text = '';
                    var wpaicg_randomnum = Math.floor((Math.random() * 100000) + 1);
                    if (xhttp.status === 200) {
                        var wpaicg_response = this.responseText;
                        if (wpaicg_response !== '') {
                            wpaicg_response = JSON.parse(wpaicg_response);
                            wpaicg_ai_thinking.style.display = 'none'
                            if (wpaicg_response.status === 'success') {
                                wpaicg_response_text = wpaicg_response.data;
                                wpaicg_message = '<li class="' + class_ai_item + '" style="background-color:' + wpaicg_ai_bg + ';font-size: ' + wpaicg_font_size + 'px;color: ' + wpaicg_font_color + '"><p style="width:100%"><strong class="wpaicg-chat-avatar">' + wpaicg_ai_name + '</strong><span class="wpaicg-chat-message" id="wpaicg-chat-message-' + wpaicg_randomnum + '"></span>';
                            } else {
                                wpaicg_response_text = wpaicg_response.msg;
                                wpaicg_message = '<li class="' + class_ai_item + '" style="background-color:' + wpaicg_ai_bg + ';font-size: ' + wpaicg_font_size + 'px;color: ' + wpaicg_font_color + '"><p style="width:100%"><strong class="wpaicg-chat-avatar">' + wpaicg_ai_name + '</strong><span class="wpaicg-chat-message wpaicg-chat-message-error" id="wpaicg-chat-message-' + wpaicg_randomnum + '"></span>';
                            }
                        }
                    } else {
                        wpaicg_message = '<li class="' + class_ai_item + '" style="background-color:' + wpaicg_ai_bg + ';font-size: ' + wpaicg_font_size + 'px;color: ' + wpaicg_font_color + '"><p style="width:100%"><strong class="wpaicg-chat-avatar">' + wpaicg_ai_name + '</strong><span class="wpaicg-chat-message wpaicg-chat-message-error" id="wpaicg-chat-message-' + wpaicg_randomnum + '"></span>';
                        wpaicg_response_text = 'Something went wrong. Please clear your cache and try again.';
                        wpaicg_ai_thinking.style.display = 'none';
                    }
                    if (wpaicg_response_text === 'null' || wpaicg_response_text === null) {
                        wpaicg_response_text = 'Empty response from api. Check your server logs for more details.';
                    }
                    updateChatHistory(wpaicg_response_text, 'ai');
                    if (wpaicg_response_text !== '' && wpaicg_message !== '') {
                        if(parseInt(wpaicg_speech) == 1){
                            if(voice_service === 'google'){
                                wpaicg_ai_thinking.style.display = 'block';
                                let speechData = new FormData();
                                speechData.append('nonce', wpaicg_nonce);
                                speechData.append('action', 'wpaicg_google_speech');
                                speechData.append('language', voice_language);
                                speechData.append('name', voice_name);
                                speechData.append('device', voice_device);
                                speechData.append('speed', voice_speed);
                                speechData.append('pitch', voice_pitch);
                                speechData.append('text', wpaicg_response_text);
                                var speechRequest = new XMLHttpRequest();
                                speechRequest.open("POST", wpaicgParams.ajax_url);
                                speechRequest.onload = function () {
                                    var result = speechRequest.responseText;
                                    try {
                                        result = JSON.parse(result);
                                        if(result.status === 'success'){
                                            var byteCharacters = atob(result.audio);
                                            const byteNumbers = new Array(byteCharacters.length);
                                            for (let i = 0; i < byteCharacters.length; i++) {
                                                byteNumbers[i] = byteCharacters.charCodeAt(i);
                                            }
                                            const byteArray = new Uint8Array(byteNumbers);
                                            const blob = new Blob([byteArray], {type: 'audio/mp3'});
                                            const blobUrl = URL.createObjectURL(blob);
                                            wpaicg_message += '<audio style="margin-top:2px;width: 100%" controls="controls"><source type="audio/mpeg" src="' + blobUrl + '"></audio>';
                                            wpaicg_message += '</p></li>';
                                            wpaicg_ai_thinking.style.display = 'none';
                                            wpaicgWriteMessage(wpaicg_messages_box, wpaicg_message, wpaicg_randomnum, wpaicg_response_text, wpaicg_typewriter_effect, wpaicg_typewriter_speed);
                                        }
                                        else{
                                            var errorMessageDetail = 'Google: ' + result.msg;
                                            wpaicg_ai_thinking.style.display = 'none';
                                            if (parseInt(wpaicg_voice_error) !== 1) {
                                                wpaicg_message += '<span style="width: 100%;display: block;font-size: 11px;">' + errorMessageDetail + '</span>';
                                            }
                                            else if (typeof wpaicg_response !== 'undefined' && typeof wpaicg_response.log !== 'undefined' && wpaicg_response.log !== '') {
                                                var speechLogMessage = new FormData();
                                                speechLogMessage.append('nonce', wpaicg_nonce);
                                                speechLogMessage.append('log_id', wpaicg_response.log);
                                                speechLogMessage.append('message', errorMessageDetail);
                                                speechLogMessage.append('action', 'wpaicg_speech_error_log');
                                                var speechErrorRequest = new XMLHttpRequest();
                                                speechErrorRequest.open("POST", wpaicgParams.ajax_url);
                                                speechErrorRequest.send(speechLogMessage);
                                            }
                                            wpaicg_message += '</p></li>';
                                            wpaicgWriteMessage(wpaicg_messages_box, wpaicg_message, wpaicg_randomnum, wpaicg_response_text, wpaicg_typewriter_effect, wpaicg_typewriter_speed);
                                        }
                                    }
                                    catch (errorSpeech){

                                    }
                                }
                                speechRequest.send(speechData);
                            }
                            else if (voice_service === 'openai') {
                                // OpenAI TTS code
                                let speechData = new FormData();
                                speechData.append('action', 'wpaicg_openai_speech');
                                speechData.append('nonce', wpaicg_nonce);
                                speechData.append('text', wpaicg_response_text);
                            

                                speechData.append('model', openai_model);
                                speechData.append('voice', openai_voice);
                                speechData.append('output_format', openai_output_format);
                                speechData.append('speed', openai_voice_speed);
                            
                                // Display some sort of loading indicator
                                wpaicg_ai_thinking.style.display = 'block';
                            
                                var speechRequest = new XMLHttpRequest();
                                speechRequest.open("POST", wpaicgParams.ajax_url);
                                speechRequest.responseType = "arraybuffer"; // Expecting raw audio data
                            
                                speechRequest.onload = function () {
                                    if (speechRequest.status === 200) {
                                        wpaicg_ai_thinking.style.display = 'none';
                            
                                        const audioData = speechRequest.response;
                                        const blobMimeType = getBlobMimeType(openai_output_format); // Get the MIME type based on the format
                                        const blob = new Blob([audioData], { type: blobMimeType });
                                        const blobUrl = URL.createObjectURL(blob);
                            
                                        // Update your message UI here
                                        wpaicg_message += '<audio style="margin-top:2px;width: 100%" controls="controls"><source type="audio/mpeg" src="' + blobUrl + '"></audio>';
                                        wpaicgWriteMessage(wpaicg_messages_box, wpaicg_message, wpaicg_randomnum, wpaicg_response_text, wpaicg_typewriter_effect, wpaicg_typewriter_speed);
                                    } else {
                                        // Handle HTTP errors
                                        wpaicg_ai_thinking.style.display = 'none';
                                        console.error('Error generating speech with OpenAI:', speechRequest.statusText);
                                        // Update your message UI to show the error
                                        wpaicg_message += '<span style="width: 100%;display: block;font-size: 11px;">Error generating speech with OpenAI</span>';
                                        wpaicgWriteMessage(wpaicg_messages_box, wpaicg_message, wpaicg_randomnum, wpaicg_response_text, wpaicg_typewriter_effect, wpaicg_typewriter_speed);
                                    }
                                };
                            
                                speechRequest.onerror = function () {
                                    // Handle network errors
                                    wpaicg_ai_thinking.style.display = 'none';
                                    console.error('Network error during speech generation with OpenAI');
                                    // Update your message UI to show the network error
                                    wpaicg_message += '<span style="width: 100%;display: block;font-size: 11px;">Network error during speech generation</span>';
                                    wpaicgWriteMessage(wpaicg_messages_box, wpaicg_message, wpaicg_randomnum, wpaicg_response_text, wpaicg_typewriter_effect, wpaicg_typewriter_speed);
                                };
                            
                                speechRequest.send(speechData);
                                // Utility function to get the correct MIME type
                                function getBlobMimeType(format) {
                                    switch (format) {
                                        case 'opus':
                                            return 'audio/opus';
                                        case 'aac':
                                            return 'audio/aac';
                                        case 'flac':
                                            return 'audio/flac';
                                        default:
                                            return 'audio/mpeg'; // Default to MP3
                                    }
                                }
                            }
                            
                            else {
                                let speechData = new FormData();
                                speechData.append('nonce', wpaicg_nonce);
                                speechData.append('message', wpaicg_response_text);
                                speechData.append('voice', wpaicg_voice);
                                speechData.append('elevenlabs_model', elevenlabs_model);
                                speechData.append('action', 'wpaicg_text_to_speech');
                                wpaicg_ai_thinking.style.display = 'block';
                                var speechRequest = new XMLHttpRequest();
                                speechRequest.open("POST", wpaicgParams.ajax_url);
                                speechRequest.responseType = "arraybuffer";
                                speechRequest.onload = function () {
                                    wpaicg_ai_thinking.style.display = 'none';
                                    var blob = new Blob([speechRequest.response], {type: "audio/mpeg"});
                                    var fr = new FileReader();
                                    fr.onload = function () {
                                        var fileText = this.result;
                                        try {
                                            var errorMessage = JSON.parse(fileText);
                                            var errorMessageDetail = 'ElevenLabs: ' + errorMessage.detail.message;
                                            if (parseInt(wpaicg_voice_error) !== 1) {
                                                wpaicg_message += '<span style="width: 100%;display: block;font-size: 11px;">' + errorMessageDetail + '</span>';
                                            } else if (typeof wpaicg_response !== 'undefined' && typeof wpaicg_response.log !== 'undefined' && wpaicg_response.log !== '') {
                                                var speechLogMessage = new FormData();
                                                speechLogMessage.append('nonce', wpaicg_nonce);
                                                speechLogMessage.append('log_id', wpaicg_response.log);
                                                speechLogMessage.append('message', errorMessageDetail);
                                                speechLogMessage.append('action', 'wpaicg_speech_error_log');
                                                var speechErrorRequest = new XMLHttpRequest();
                                                speechErrorRequest.open("POST", wpaicgParams.ajax_url);
                                                speechErrorRequest.send(speechLogMessage);
                                            }
                                            wpaicg_message += '</p></li>';
                                            wpaicgWriteMessage(wpaicg_messages_box, wpaicg_message, wpaicg_randomnum, wpaicg_response_text, wpaicg_typewriter_effect, wpaicg_typewriter_speed);
                                        } catch (errorBlob) {
                                            var blobUrl = URL.createObjectURL(blob);
                                            wpaicg_message += '<audio style="margin-top:2px;width: 100%" controls="controls"><source type="audio/mpeg" src="' + blobUrl + '"></audio>';
                                            wpaicg_message += '</p></li>';
                                            wpaicgWriteMessage(wpaicg_messages_box, wpaicg_message, wpaicg_randomnum, wpaicg_response_text, wpaicg_typewriter_effect, wpaicg_typewriter_speed);
                                        }
                                    }
                                    fr.readAsText(blob);
                                }
                                speechRequest.send(speechData);
                            }
                        }
                        else{
                            wpaicg_message += '</p></li>';
                            wpaicgWriteMessage(wpaicg_messages_box,wpaicg_message,wpaicg_randomnum,wpaicg_response_text, wpaicg_typewriter_effect, wpaicg_typewriter_speed);
                        }
                    }
                }
            }
        }
    }

    // Function to hide all conversation starters
    function hideConversationStarters() {
        const starters = document.querySelectorAll('.wpaicg-conversation-starters');
        starters.forEach(starter => {
            starter.style.display = 'none';
        });
    }
    function wpaicgFormatter(inputText) {

        inputText = inputText !== '' ? inputText.trim() : '';

        // Markdown Links
        inputText = inputText.replace(/\[(.*?)\]\((https?:\/\/.*?)\)/g, '<a href="$2" target="_blank">$1</a>');
        
        // Make URLs clickable
        inputText = inputText.replace(/(?<!<a href=")(https?:\/\/[^\s]+)(?!"<\/a>)/g, '<a href="$1" target="_blank">$1</a>');

        // **Bold** 
        inputText = inputText.replace(/\*\*(.*?)\*\*/g, '$1');

        // *Italic* 
        inputText = inputText.replace(/\*(.*?)\*/g, '$1');

        // parse code blocks.
        inputText = inputText.replace(/```([\s\S]*?)```/g,'<code>$1</code>');

        // parse `code` code blocks.
        inputText = inputText.replace(/`([\s\S]*?)`/g,'<code>$1</code>');

        // make emails clickable
        inputText = inputText.replace(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/g, '<a href="mailto:$1">$1</a>');
        
        // replace /n with <br>
        inputText = inputText.replace(/(?:\r\n|\r|\n)/g, '<br>');

        return inputText;
        
    }

    function handleStreaming(wpaicgData, wpaicg_messages_box, wpaicg_box_typing, wpaicg_ai_thinking, class_ai_item, chat, chatbot_identity, clientID, wpaicg_use_avatar, wpaicg_ai_avatar) {
        let wpaicg_ai_name = wpaicg_use_avatar ? '<img src="' + wpaicg_ai_avatar + '" height="40" width="40">' : chat.getAttribute('data-ai-name') + ':';
        let wpaicg_font_size = chat.getAttribute('data-fontsize');
        let wpaicg_ai_bg = chat.getAttribute('data-ai-bg-color');
        let wpaicg_font_color = chat.getAttribute('data-color');
        
        wpaicg_box_typing.value = '';

        const queryString = new URLSearchParams(wpaicgData).toString();
        const urlWithParams = wpaicgParams.ajax_url + '?' + queryString;
        const eventSource = new EventSource(urlWithParams);

        let wpaicg_randomnum = Math.floor((Math.random() * 100000) + 1);
        let chatids = 'wpaicg-chat-message-' + wpaicg_randomnum;

        let wpaicg_message = 
        '<li class="'
        + class_ai_item 
        + '" style="background-color:' 
        + wpaicg_ai_bg
        + ';font-size: ' 
        + wpaicg_font_size 
        + 'px;color: ' 
        + wpaicg_font_color 
        + '"><p style="width:100%"><strong class="wpaicg-chat-avatar">' 
        + wpaicg_ai_name + '</strong><span class="wpaicg-chat-message" id="' 
        + chatids 
        + '"></span></p></li>';

        function streamFormatter(text) {
            // Regular expression to detect URLs
            const urlRegex = /(\b(http|https):\/\/\S*\b)/g;

            // Regular expression to detect URL in this format: https://www.
            const urlRegex2 = /(\b(www\.\S*)\b)/g;
            
            // Regular expression to detect email addresses
            const emailRegex = /(\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b)/g;

            // Regular expression to detect markdown links
            const markdownLinkRegex = /\[(.*?)\]\((https?:\/\/.*?)\)/g;

            // Regular expression to detect code blocks
            const codeBlockRegex = /```([\s\S]*?)```/g;

            // Regular expression to detect single `code` blocks
            const singleCodeBlockRegex = /`([\s\S]*?)`/g;
        
            // Return true if text contains a URL, email, markdown link, code block, single code block
            return urlRegex.test(text) || emailRegex.test(text) || markdownLinkRegex.test(text) || codeBlockRegex.test(text) || singleCodeBlockRegex.test(text) || urlRegex2.test(text);
        }

        function flashMessage(chatids) {
            let chatMessage = document.getElementById(chatids);
            chatMessage.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
            setTimeout(() => {
                chatMessage.style.backgroundColor = wpaicg_ai_bg;
            }, 100);

            // now check entire message and parse if there is any link
            let chatMessageText = chatMessage.innerHTML;
            chatMessage.innerHTML = wpaicgFormatter(chatMessageText);

        }

        // Function to update chat history in local storage for a specific bot identity
        function updateChatHistory(message, sender) {
            let chatHistoryKey = 'wpaicg_chat_history_' + chatbot_identity + '_' + clientID;
            let chatHistory = localStorage.getItem(chatHistoryKey);
            chatHistory = chatHistory ? JSON.parse(chatHistory) : [];
        
            let formattedMessage = (sender === 'user' ? "Human: " : "AI: ") + message.trim();
            chatHistory.push(formattedMessage);
        
            localStorage.setItem(chatHistoryKey, JSON.stringify(chatHistory));

        }

        // Queue to store incoming data chunks
        let dataQueue = [];

        // Processing flag to prevent overlapping
        let isProcessing = false;

        // Typewriter effect function
        function typeWriter(text, i, elementId, callback) {
            toggleBlinkingCursor(false); // Remove cursor while typing
            if (i < text.length) {
                var charToAdd = text.charAt(i);
                if (charToAdd === '<') {
                    // If the character is '<', include the entire '<br>' tag
                    var tag = text.slice(i, i+4);
                    if (tag === '<br>') {
                        jQuery('#' + elementId).append(tag);
                        i += 4; // Skip past the '<br>' tag
                    } else {
                        jQuery('#' + elementId).append(charToAdd);
                        i++;
                    }
                } else {
                    jQuery('#' + elementId).append(charToAdd);
                    i++;
                }
                setTimeout(function() {
                    typeWriter(text, i, elementId, callback);
                }, 1); // Typing speed in milliseconds
            } else if (callback) {
                callback();
                scrollToBottom(); // Scroll to bottom after each completed chunk
            }
        }

        // Function to scroll to the bottom of the chat box
        function scrollToBottom() {
            wpaicg_messages_box.scrollTop = wpaicg_messages_box.scrollHeight;
        }

        // Initialize a variable to store the complete AI response
        let completeAIResponse = '';

        // Process the next item in the queue
        function processQueue() {
            if (dataQueue.length > 0 && !isProcessing) {
                isProcessing = true;
                let nextChunk = dataQueue.shift();
                typeWriter(nextChunk, 0, chatids, function() {
                    isProcessing = false;
                    processQueue();
                });
            } else {
                // No more data to process, remove the cursor
                toggleBlinkingCursor(false);
            }
        }
        eventSource.onopen = function(e) {
            toggleBlinkingCursor(true);
            wpaicg_messages_box.innerHTML += wpaicg_message;
        };
        eventSource.onmessage = function(e) {
            wpaicg_ai_thinking.style.display = 'none';

            // Check if the message is the '[DONE]' signal
            if (e.data === "[DONE]") {
                console.log('Received the [DONE] signal');
                eventSource.close();
                toggleBlinkingCursor(false); // Ensure cursor is removed when done
                updateChatHistory(completeAIResponse, 'ai');
                return; // Exit the function to avoid further processing
            }
            
            var resultData = JSON.parse(e.data);
            
            // Check for token limit message
            if (resultData.tokenLimitReached) {
                // Create the message element for token limit
                var tokenLimitMessage = '<span class="wpaicg-chat-message">' + resultData.msg + '</span>';

                // Append the token limit message to the messages box
                document.getElementById(chatids).innerHTML = tokenLimitMessage;

                wpaicg_ai_thinking.style.display = 'none';
                eventSource.close();
                toggleBlinkingCursor(false);
                return;
            }

            // Check for banned message
            if (resultData.messageFlagged) {
                // Create the message element for token limit
                var tokenLimitMessage = '<span class="wpaicg-chat-message">' + resultData.msg + '</span>';

                // Append the token limit message to the messages box
                document.getElementById(chatids).innerHTML = tokenLimitMessage;

                wpaicg_ai_thinking.style.display = 'none';
                eventSource.close();
                toggleBlinkingCursor(false);
                return;
            }

            // Check for banned message
            if (resultData.pineconeError) {
                // Create the message element for token limit
                var pineconeMessage = '<span class="wpaicg-chat-message">' + resultData.msg + '</span>';

                // Append the token limit message to the messages box
                document.getElementById(chatids).innerHTML = pineconeMessage;

                wpaicg_ai_thinking.style.display = 'none';
                eventSource.close();
                toggleBlinkingCursor(false);
                return;
            }

            // Check for ip limit message
            if (resultData.ipBanned) {
                // Create the message element for token limit
                var tokenLimitMessage = '<span class="wpaicg-chat-message">' + resultData.msg + '</span>';

                // Append the token limit message to the messages box
                document.getElementById(chatids).innerHTML = tokenLimitMessage;

                wpaicg_ai_thinking.style.display = 'none';
                eventSource.close();
                toggleBlinkingCursor(false);
                return;
            }

            // Check for ip limit message
            if (resultData.modflag) {
                // Create the message element for token limit
                var tokenLimitMessage = '<span class="wpaicg-chat-message">' + resultData.msg + '</span>';

                // Append the token limit message to the messages box
                document.getElementById(chatids).innerHTML = tokenLimitMessage;

                wpaicg_ai_thinking.style.display = 'none';
                eventSource.close();
                toggleBlinkingCursor(false);
                return;
            }

            var hasFinishReason = resultData.choices && 
            resultData.choices[0] && 
            (resultData.choices[0].finish_reason === "stop" || 
            resultData.choices[0].finish_reason === "length")||
            (resultData.choices[0].finish_details && 
            resultData.choices[0].finish_details.type === "stop");

            if (hasFinishReason || e.data === "[DONE]") {
                eventSource.close();
                toggleBlinkingCursor(false); // Ensure cursor is removed when done
                updateChatHistory(completeAIResponse, 'ai');

                if (streamFormatter(completeAIResponse)) {
                    console.log('URL or email found in the response');
                    flashMessage(chatids); // Call flashMessage only if a URL or an email address is found
                }

            } else {
                var result = resultData;
                if (result.error !== undefined) {
                    dataQueue.push(result.error.message);
                } else {
                    var content_generated = result.choices[0].delta !== undefined ? (result.choices[0].delta.content !== undefined ? result.choices[0].delta.content : '') : result.choices[0].text;
                    content_generated = formatContent(content_generated);
                    dataQueue.push(content_generated);
                    completeAIResponse += content_generated;
                }
                processQueue();
                // Scroll to bottom when new data arrives
                scrollToBottom();
            }
        };

        eventSource.onerror = function(error) {
            console.log("EventSource failed: ", error);
            toggleBlinkingCursor(false);
            // stop the typing indicator
            wpaicg_ai_thinking.style.display = 'none';
            // stop the event source
            eventSource.close();
        };

        // Function to format content, replacing newlines appropriately
        function formatContent(text) {

            // Replace newlines with <br> tags
            text = text.replace(/(?:\r\n|\r|\n)/g, '<br>');

            // remove **
            text = text.replace(/\*\*/g, '');

            // return the formatted text
            return text;
        }

        function toggleBlinkingCursor(isVisible) {
            const cursorElement = jQuery('#' + chatids + ' .blinking-cursor');
            if (isVisible) {
                if (cursorElement.length === 0) {
                    jQuery('#' + chatids).append('<span class="blinking-cursor">|</span>');
                }
            } else {
                cursorElement.remove();
            }
        }
    }

    // Scroll function to adjust.
    function scrollToAdjust(wpaicg_messages_box) {
        requestAnimationFrame(() => {
            wpaicg_messages_box.scrollTop = wpaicg_messages_box.scrollHeight;
        });
    }
    
    function wpaicgWriteMessage(wpaicg_messages_box,wpaicg_message,wpaicg_randomnum,wpaicg_response_text, wpaicg_typewriter_effect, wpaicg_typewriter_speed){
        wpaicg_messages_box.innerHTML += wpaicg_message;
        var wpaicg_current_message = document.getElementById('wpaicg-chat-message-' + wpaicg_randomnum);
        var parentMessage = wpaicg_current_message.parentElement;
        var audio = parentMessage.getElementsByTagName('audio');
        if(audio && audio.length){
            audio[0].play();
        }

        // Apply formatting to the entire response text first
        var formattedText = wpaicgFormatter(wpaicg_response_text);

        if (wpaicg_typewriter_effect) {
            let index = 0; // Starting index of the substring
            function typeWriter() {
                if (index < formattedText.length) {
                    wpaicg_current_message.innerHTML = formattedText.slice(0, index+1);
                    index++;
                    setTimeout(typeWriter, wpaicg_typewriter_speed);
                    //scroll to the latest message if needed
                    scrollToAdjust(wpaicg_messages_box);
                } else {
                    // Once complete, ensure scrolling if needed
                    scrollToAdjust(wpaicg_messages_box);
                }
            }
            typeWriter(); // Start the typewriter effect

        } else {
            wpaicg_current_message.innerHTML = formattedText;
            // Scroll to the latest message if needed
            scrollToAdjust(wpaicg_messages_box);
        }
    }

    function wpaicgMicEvent(mic) {
        if (mic.classList.contains('wpaicg-recording')) {
            mic.innerHTML = '';
            mic.innerHTML = wpaicgMicIcon;
            mic.classList.remove('wpaicg-recording');
            wpaicgstopChatRecording(mic)
        } else {
            let checkRecording = document.querySelectorAll('.wpaicg-recording');
            if (checkRecording && checkRecording.length) {
                alert('Please finish previous recording');
            } else {
                mic.innerHTML = '';
                mic.innerHTML = wpaicgStopIcon;
                mic.classList.add('wpaicg-recording');
                wpaicgstartChatRecording();
            }
        }
    }
    if (wpaicgChatTyping && wpaicgChatTyping.length) {
        for (let i = 0; i < wpaicgChatTyping.length; i++) {
            wpaicgChatTyping[i].addEventListener('keyup', function (event) {
                if ((event.which === 13 || event.keyCode === 13) && !event.shiftKey) {
                    let parentChat = wpaicgChatTyping[i].closest('.wpaicg-chatbox');
                    let chatTyping = parentChat.querySelectorAll('.wpaicg-chatbox-typing')[0];
                    wpaicgSendChatMessage(parentChat, chatTyping, 'widget');
                }
            })
        }
    }
    if (wpaicgShortcodeTyping && wpaicgShortcodeTyping.length) {
        for (let i = 0; i < wpaicgShortcodeTyping.length; i++) {
            wpaicgShortcodeTyping[i].addEventListener('keyup', function (event) {
                if ((event.which === 13 || event.keyCode === 13) && !event.shiftKey) {
                    let parentChat = wpaicgShortcodeTyping[i].closest('.wpaicg-chat-shortcode');
                    let chatTyping = parentChat.querySelectorAll('.wpaicg-chat-shortcode-typing')[0];
                    wpaicgSendChatMessage(parentChat, chatTyping, 'shortcode');
                }
            })
        }
    }
    if (wpaicgChatSend && wpaicgChatSend.length) {
        for (let i = 0; i < wpaicgChatSend.length; i++) {
            wpaicgChatSend[i].addEventListener('click', function (event) {
                let parentChat = wpaicgChatSend[i].closest('.wpaicg-chatbox');
                let chatTyping = parentChat.querySelectorAll('.wpaicg-chatbox-typing')[0];
                wpaicgSendChatMessage(parentChat, chatTyping, 'widget');
            })
        }
    }
    if (wpaicgShortcodeSend && wpaicgShortcodeSend.length) {
        for (let i = 0; i < wpaicgShortcodeSend.length; i++) {
            wpaicgShortcodeSend[i].addEventListener('click', function (event) {
                let parentChat = wpaicgShortcodeSend[i].closest('.wpaicg-chat-shortcode');
                let chatTyping = parentChat.querySelectorAll('.wpaicg-chat-shortcode-typing')[0];
                wpaicgSendChatMessage(parentChat, chatTyping, 'shortcode');
            })
        }
    }

    if (wpaicgMicBtns && wpaicgMicBtns.length) {
        for (let i = 0; i < wpaicgMicBtns.length; i++) {
            wpaicgMicBtns[i].addEventListener('click', function () {
                wpaicgMicEvent(wpaicgMicBtns[i]);
            });
        }
    }
}
wpaicgChatInit();
// Call the init function when the document is ready
document.addEventListener('DOMContentLoaded', loadConversations);
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Recorder = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
        "use strict";

        module.exports = require("./recorder").Recorder;

    },{"./recorder":2}],2:[function(require,module,exports){
        'use strict';

        var _createClass = (function () {
            function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                    var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
                }
            }return function (Constructor, protoProps, staticProps) {
                if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
            };
        })();

        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        exports.Recorder = undefined;

        var _inlineWorker = require('inline-worker');

        var _inlineWorker2 = _interopRequireDefault(_inlineWorker);

        function _interopRequireDefault(obj) {
            return obj && obj.__esModule ? obj : { default: obj };
        }

        function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor)) {
                throw new TypeError("Cannot call a class as a function");
            }
        }

        var Recorder = exports.Recorder = (function () {
            function Recorder(source, cfg) {
                var _this = this;

                _classCallCheck(this, Recorder);

                this.config = {
                    bufferLen: 4096,
                    numChannels: 2,
                    mimeType: 'audio/wav'
                };
                this.recording = false;
                this.callbacks = {
                    getBuffer: [],
                    exportWAV: []
                };

                Object.assign(this.config, cfg);
                this.context = source.context;
                this.node = (this.context.createScriptProcessor || this.context.createJavaScriptNode).call(this.context, this.config.bufferLen, this.config.numChannels, this.config.numChannels);

                this.node.onaudioprocess = function (e) {
                    if (!_this.recording) return;

                    var buffer = [];
                    for (var channel = 0; channel < _this.config.numChannels; channel++) {
                        buffer.push(e.inputBuffer.getChannelData(channel));
                    }
                    _this.worker.postMessage({
                        command: 'record',
                        buffer: buffer
                    });
                };

                source.connect(this.node);
                this.node.connect(this.context.destination); //this should not be necessary

                var self = {};
                this.worker = new _inlineWorker2.default(function () {
                    var recLength = 0,
                        recBuffers = [],
                        sampleRate = undefined,
                        numChannels = undefined;

                    self.onmessage = function (e) {
                        switch (e.data.command) {
                            case 'init':
                                init(e.data.config);
                                break;
                            case 'record':
                                record(e.data.buffer);
                                break;
                            case 'exportWAV':
                                exportWAV(e.data.type);
                                break;
                            case 'getBuffer':
                                getBuffer();
                                break;
                            case 'clear':
                                clear();
                                break;
                        }
                    };

                    function init(config) {
                        sampleRate = config.sampleRate;
                        numChannels = config.numChannels;
                        initBuffers();
                    }

                    function record(inputBuffer) {
                        for (var channel = 0; channel < numChannels; channel++) {
                            recBuffers[channel].push(inputBuffer[channel]);
                        }
                        recLength += inputBuffer[0].length;
                    }

                    function exportWAV(type) {
                        var buffers = [];
                        for (var channel = 0; channel < numChannels; channel++) {
                            buffers.push(mergeBuffers(recBuffers[channel], recLength));
                        }
                        var interleaved = undefined;
                        if (numChannels === 2) {
                            interleaved = interleave(buffers[0], buffers[1]);
                        } else {
                            interleaved = buffers[0];
                        }
                        var dataview = encodeWAV(interleaved);
                        var audioBlob = new Blob([dataview], { type: type });

                        self.postMessage({ command: 'exportWAV', data: audioBlob });
                    }

                    function getBuffer() {
                        var buffers = [];
                        for (var channel = 0; channel < numChannels; channel++) {
                            buffers.push(mergeBuffers(recBuffers[channel], recLength));
                        }
                        self.postMessage({ command: 'getBuffer', data: buffers });
                    }

                    function clear() {
                        recLength = 0;
                        recBuffers = [];
                        initBuffers();
                    }

                    function initBuffers() {
                        for (var channel = 0; channel < numChannels; channel++) {
                            recBuffers[channel] = [];
                        }
                    }

                    function mergeBuffers(recBuffers, recLength) {
                        var result = new Float32Array(recLength);
                        var offset = 0;
                        for (var i = 0; i < recBuffers.length; i++) {
                            result.set(recBuffers[i], offset);
                            offset += recBuffers[i].length;
                        }
                        return result;
                    }

                    function interleave(inputL, inputR) {
                        var length = inputL.length + inputR.length;
                        var result = new Float32Array(length);

                        var index = 0,
                            inputIndex = 0;

                        while (index < length) {
                            result[index++] = inputL[inputIndex];
                            result[index++] = inputR[inputIndex];
                            inputIndex++;
                        }
                        return result;
                    }

                    function floatTo16BitPCM(output, offset, input) {
                        for (var i = 0; i < input.length; i++, offset += 2) {
                            var s = Math.max(-1, Math.min(1, input[i]));
                            output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
                        }
                    }

                    function writeString(view, offset, string) {
                        for (var i = 0; i < string.length; i++) {
                            view.setUint8(offset + i, string.charCodeAt(i));
                        }
                    }

                    function encodeWAV(samples) {
                        var buffer = new ArrayBuffer(44 + samples.length * 2);
                        var view = new DataView(buffer);

                        /* RIFF identifier */
                        writeString(view, 0, 'RIFF');
                        /* RIFF chunk length */
                        view.setUint32(4, 36 + samples.length * 2, true);
                        /* RIFF type */
                        writeString(view, 8, 'WAVE');
                        /* format chunk identifier */
                        writeString(view, 12, 'fmt ');
                        /* format chunk length */
                        view.setUint32(16, 16, true);
                        /* sample format (raw) */
                        view.setUint16(20, 1, true);
                        /* channel count */
                        view.setUint16(22, numChannels, true);
                        /* sample rate */
                        view.setUint32(24, sampleRate, true);
                        /* byte rate (sample rate * block align) */
                        view.setUint32(28, sampleRate * 4, true);
                        /* block align (channel count * bytes per sample) */
                        view.setUint16(32, numChannels * 2, true);
                        /* bits per sample */
                        view.setUint16(34, 16, true);
                        /* data chunk identifier */
                        writeString(view, 36, 'data');
                        /* data chunk length */
                        view.setUint32(40, samples.length * 2, true);

                        floatTo16BitPCM(view, 44, samples);

                        return view;
                    }
                }, self);

                this.worker.postMessage({
                    command: 'init',
                    config: {
                        sampleRate: this.context.sampleRate,
                        numChannels: this.config.numChannels
                    }
                });

                this.worker.onmessage = function (e) {
                    var cb = _this.callbacks[e.data.command].pop();
                    if (typeof cb == 'function') {
                        cb(e.data.data);
                    }
                };
            }

            _createClass(Recorder, [{
                key: 'record',
                value: function record() {
                    this.recording = true;
                }
            }, {
                key: 'stop',
                value: function stop() {
                    this.recording = false;
                }
            }, {
                key: 'clear',
                value: function clear() {
                    this.worker.postMessage({ command: 'clear' });
                }
            }, {
                key: 'getBuffer',
                value: function getBuffer(cb) {
                    cb = cb || this.config.callback;
                    if (!cb) throw new Error('Callback not set');

                    this.callbacks.getBuffer.push(cb);

                    this.worker.postMessage({ command: 'getBuffer' });
                }
            }, {
                key: 'exportWAV',
                value: function exportWAV(cb, mimeType) {
                    mimeType = mimeType || this.config.mimeType;
                    cb = cb || this.config.callback;
                    if (!cb) throw new Error('Callback not set');

                    this.callbacks.exportWAV.push(cb);

                    this.worker.postMessage({
                        command: 'exportWAV',
                        type: mimeType
                    });
                }
            }], [{
                key: 'forceDownload',
                value: function forceDownload(blob, filename) {
                    var url = (window.URL || window.webkitURL).createObjectURL(blob);
                    var link = window.document.createElement('a');
                    link.href = url;
                    link.download = filename || 'output.wav';
                    var click = document.createEvent("Event");
                    click.initEvent("click", true, true);
                    link.dispatchEvent(click);
                }
            }]);

            return Recorder;
        })();

        exports.default = Recorder;

    },{"inline-worker":3}],3:[function(require,module,exports){
        "use strict";

        module.exports = require("./inline-worker");
    },{"./inline-worker":4}],4:[function(require,module,exports){
        (function (global){
            "use strict";

            var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

            var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

            var WORKER_ENABLED = !!(global === global.window && global.URL && global.Blob && global.Worker);

            var InlineWorker = (function () {
                function InlineWorker(func, self) {
                    var _this = this;

                    _classCallCheck(this, InlineWorker);

                    if (WORKER_ENABLED) {
                        var functionBody = func.toString().trim().match(/^function\s*\w*\s*\([\w\s,]*\)\s*{([\w\W]*?)}$/)[1];
                        var url = global.URL.createObjectURL(new global.Blob([functionBody], { type: "text/javascript" }));

                        return new global.Worker(url);
                    }

                    this.self = self;
                    this.self.postMessage = function (data) {
                        setTimeout(function () {
                            _this.onmessage({ data: data });
                        }, 0);
                    };

                    setTimeout(function () {
                        func.call(self);
                    }, 0);
                }

                _createClass(InlineWorker, {
                    postMessage: {
                        value: function postMessage(data) {
                            var _this = this;

                            setTimeout(function () {
                                _this.self.onmessage({ data: data });
                            }, 0);
                        }
                    }
                });

                return InlineWorker;
            })();

            module.exports = InlineWorker;
        }).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
    },{}]},{},[1])(1)
});
