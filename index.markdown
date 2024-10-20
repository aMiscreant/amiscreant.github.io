---
# Feel free to add content and custom Front Matter to this file.
# To modify the layout, see https://jekyllrb.com/docs/themes/#overriding-theme-defaults

layout: home
---
<link rel="stylesheet" href="{{ 'css/custom.css' | relative_url }}">

<div class="terminal">
  <div class="output" id="terminal-output">
    <!-- Command outputs will appear here -->
  </div>
  <div class="input-line">
    <span class="prompt">
      <span class="brackets">[</span>
      <span class="user">amiscreant</span>
      <span class="at">@</span>
      <span class="host">blackbox</span>
      <span class="brackets">]</span>$&nbsp;
    </span>
    <span id="typed-input"></span><span class="cursor">|</span>
  </div>
</div>

<script>
  document.addEventListener("DOMContentLoaded", function() {
  const commands = [
    'source myenv/bin/activate',
    'python miscreant.py ...',
    'Loading Config...',
    'Running analysis...',
    'Receiving data...',
  ];

  let index = 0;
  let charIndex = 0;
  const typingSpeed = 100;  
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
        <span class="host">blackbox</span>
        <span class="brackets">]</span>$ ${command}`;
      terminalOutput.appendChild(outputLine);
      typedInput.innerHTML = ''; 
      charIndex = 0;
      index++;
      if (index < commands.length) {
        setTimeout(typeCommand, delayBetweenCommands);
      }
    }
  }

  typeCommand();
});

</script>
