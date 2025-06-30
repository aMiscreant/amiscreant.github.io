document.addEventListener("DOMContentLoaded", function() {
    // Select all code blocks
    const codeBlocks = document.querySelectorAll('pre code');
    codeBlocks.forEach(function(block) {
        // Create a container for the button if it doesn't exist
        const container = block.parentElement;
        if (!container.classList.contains('copy-btn-container')) {
            container.classList.add('copy-btn-container');
        }

        // Create the button
        const button = document.createElement('button');
        button.textContent = 'Copy';
        button.classList.add('copy-btn');

        // Append the button to the code block's parent container
        container.appendChild(button);

        // Add click event to copy code
        button.addEventListener('click', function() {
            const text = block.textContent;
            const textarea = document.createElement('textarea');
            document.body.appendChild(textarea);
            textarea.value = text;
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);

            // Optionally, change the button text temporarily
            button.textContent = 'Copied!';
            setTimeout(() => {
                button.textContent = 'Copy';
            }, 1000);
        });
    });
});
