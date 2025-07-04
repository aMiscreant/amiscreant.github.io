---
# Feel free to add content and custom Front Matter to this file.
# To modify the layout, see https://jekyllrb.com/docs/themes/#overriding-theme-defaults

layout: home
---
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; img-src 'self' https:; script-src 'self'; style-src 'self' 'unsafe-inline';">
<meta http-equiv="X-Content-Type-Options" content="nosniff">
<meta http-equiv="Strict-Transport-Security" content="max-age=31536000; includeSubDomains; preload">
<meta name="referrer" content="no-referrer">
<meta http-equiv="X-Frame-Options" content="DENY">
<meta http-equiv="Permissions-Policy" content="geolocation=(), microphone=(), camera=()">
<meta http-equiv="X-XSS-Protection" content="1; mode=block">
<meta http-equiv="Access-Control-Allow-Origin" content="*">
<meta http-equiv="Cross-Origin-Embedder-Policy" content="require-corp">
<meta http-equiv="Cross-Origin-Opener-Policy" content="same-origin">
<meta http-equiv="Cross-Origin-Resource-Policy" content="same-origin">
<meta http-equiv="Expect-CT" content="max-age=86400, enforce">

<link rel="icon" href="/favicon.png" type="image/png">
<link rel="stylesheet" href="{{ 'css/main.css' | relative_url }}">

---

<div class="terminal">
  <div class="output" id="terminal-output">
    <!-- Command outputs will appear here -->
  </div>
  <div class="input-line">
    <span class="prompt">
      <span class="brackets">[</span>
      <span class="user">amiscreant</span>
      <span class="at">@</span>
      <span class="host">[blackbox]─[~/NullOrigin]</span>
      <span class="brackets">]</span>
      <span class="cursor">|</span> <!-- Blinking cursor -->
    </span>
    <span id="typed-input"></span>
  </div>
</div>

<script>
document.addEventListener("DOMContentLoaded", function() {
    const commands = [
        'source .venv/bin/activate',
        'python null_origin.py -c --token=a54GhhE%Hw3MN',
        'Receiving authentication...',
        '',
        'CONNECTING...',
        '',
        'Connected to: amiscreantxgdfer23wrw2adq.onion',
        '',
        'miscreant@tormail.onion> help',
        '',
    ];

    let index = 0;
    let charIndex = 0;
    const typingSpeed = 85;
    const delayBetweenCommands = 800;
    const terminalOutput = document.getElementById('terminal-output');
    const typedInput = document.getElementById('typed-input');

    function typeCommand() {
        const command = commands[index];

        if (charIndex < command.length) {
            typedInput.innerHTML += command[charIndex];
            charIndex++;
            setTimeout(typeCommand, typingSpeed);
        } else {
            const outputLine = document.createElement('p');
            outputLine.innerHTML = `
                <span class="brackets">[</span>
                <span class="user">amiscreant</span>
                <span class="at">@</span>
                <span class="host">[blackbox]─[~/NullOrigin]</span>
                <span class="brackets">]</span>$ ${command}`;
            terminalOutput.appendChild(outputLine);
            typedInput.innerHTML = '';
            charIndex = 0;
            index++;

            if (index < commands.length) {
                setTimeout(typeCommand, delayBetweenCommands);
            } else {
                const finalPrompt = document.createElement('p');
                finalPrompt.innerHTML = `
                    <span class="brackets">[</span>
                    <span class="user">amiscreant</span>
                    <span class="at">@</span>
                    <span class="host">[blackbox]─[~/NullOrigin]</span>
                    <span class="brackets">]</span>$`;
                terminalOutput.appendChild(finalPrompt);
            }
        }
    }

    typeCommand();
});
</script>