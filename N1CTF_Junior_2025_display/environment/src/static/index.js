function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Sanitize content using DOMPurify
function sanitizeContent(text) {
    // Only allow <h1>, <h2>, tags and plain text
    const config = {
        ALLOWED_TAGS: ['h1', 'h2']
    };
    return DOMPurify.sanitize(text, config);
}

document.addEventListener("DOMContentLoaded", function() {
    const textInput = document.getElementById('text-input');
    const insertButton = document.getElementById('insert-btn');
    const contentDisplay = document.getElementById('content-display');

    const queryText = getQueryParam('text');

    if (queryText) {
        const sanitizedText = sanitizeContent(atob(decodeURI(queryText)));

        if (sanitizedText.length > 0) {
            textInput.innerHTML = sanitizedText;             // 写入预览区
            contentDisplay.innerHTML = textInput.innerText;  // 写入效果显示区

            insertButton.disabled = false;    
        } else {
            textInput.innerText = "Only allow h1, h2 tags and plain text";
        }
    }
});
