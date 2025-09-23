---
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

<div class="terminal">
  <div class="output" id="terminal-output"></div>
  <div class="input-line">
    <span class="prompt">
      <span class="brackets">[</span>
      <span class="user">amiscreant</span>
      <span class="at">@</span>
      <span class="host">[blackbox]─[~/NullOrigin]</span>
      <span class="brackets">]</span>
      <span class="cursor">|</span>
    </span>
    <span id="typed-input"></span>
  </div>
</div>

<!-- Add this at the top of <body> -->
<div id="particle-bg"></div>

<style>
#particle-bg {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    pointer-events: none;
    background: url('/assets/particle.jpeg') repeat;
    opacity: 0.05;
    transition: opacity 1s ease-in-out, background 1s ease-in-out;
}
</style>

<script>
document.addEventListener("DOMContentLoaded", function() {
    // Steps of boot-up: command + simulated output
    const steps = [
        { cmd: 'Initializing NullOrigin', output: 'Initialized successfully...' },
        { cmd: 'Loading secure environment', output: 'Environment ready.' },
        { cmd: 'Activating virtual env', output: 'Virtual environment activated.' },
        { cmd: 'Connecting to network', output: 'Connected to: amiscreantxgdfer23wrw2adq.onion' },
        { cmd: 'System check', output: 'All systems operational.' }
    ];

    const terminalOutput = document.getElementById('terminal-output');
    const typedInput = document.getElementById('typed-input');
    const typingSpeed = 60 + Math.random()*30;
    const delayAfterCmd = 700;
    let stepIndex = 0;
    let charIndex = 0;

    function typeStep() {
        const step = steps[stepIndex];
        const command = step.cmd;

        if (charIndex < command.length) {
            typedInput.innerHTML += command[charIndex];
            charIndex++;
            setTimeout(typeStep, typingSpeed);
        } else {
            // Append command line
            const outputLine = document.createElement('p');
            outputLine.innerHTML = `
                <span class="brackets">[</span>
                <span class="user">amiscreant</span>
                <span class="at">@</span>
                <span class="host">[blackbox]─[~/NullOrigin]</span>
                <span class="brackets">]</span>$ ${command}`;
            outputLine.classList.add('glitch-text');
            terminalOutput.appendChild(outputLine);

            // Append "fake output"
            const fakeOutput = document.createElement('p');
            fakeOutput.textContent = step.output;
            fakeOutput.classList.add('glitch-text');
            terminalOutput.appendChild(fakeOutput);

            typedInput.innerHTML = '';
            charIndex = 0;
            stepIndex++;

            if (stepIndex < steps.length) {
                setTimeout(typeStep, delayAfterCmd);
            } else {
                // Final prompt
                const finalPrompt = document.createElement('p');
                finalPrompt.innerHTML = `
                    <span class="brackets">[</span>
                    <span class="user">amiscreant</span>
                    <span class="at">@</span>
                    <span class="host">[blackbox]─[~/NullOrigin]</span>
                    <span class="brackets">]</span>$`;
                terminalOutput.appendChild(finalPrompt);

                // Show neon buttons
                const buttons = document.createElement('div');
                buttons.classList.add('neon-buttons');
                buttons.innerHTML = `
                    <a href="/projects/" class="btn-neon">Projects</a>
                    <a href="/tutorials/" class="btn-neon">Tutorials</a>
                    <a href="/arduino/" class="btn-neon">Arduino</a>`;
                terminalOutput.appendChild(buttons);
            }

            // Scroll down automatically
            terminalOutput.scrollTop = terminalOutput.scrollHeight;
        }
    }

    typeStep();
});

document.addEventListener("DOMContentLoaded", function() {
    const particleImages = [
        '/assets/particle_1.jpeg',
        '/assets/particle_2.jpeg',
        '/assets/particle_3.jpeg',
        '/assets/particle_4.jpeg',
        '/assets/particle_5.jpeg',
        '/assets/particle.jpeg'
    ];

    let index = 0;
    const bgDiv = document.getElementById('particle-bg');
    const changeInterval = 8000; // 8 seconds per image

    setInterval(() => {
        index = (index + 1) % particleImages.length;
        // Fade out, change, fade in
        bgDiv.style.opacity = 0;
        setTimeout(() => {
            bgDiv.style.background = `url('${particleImages[index]}') repeat`;
            bgDiv.style.opacity = 0.05;
        }, 1000);
    }, changeInterval);
});
</script>