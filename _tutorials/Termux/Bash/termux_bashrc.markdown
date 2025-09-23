---
layout: page
title: Bashrc
published: 2025-09-22
description: "Termux Modified .bashrc"
permalink: /tor/termux/bashrc
category: termux
subcategory: bash
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
<script src="{{ 'assets/js/copy-to-clipboard.js' | relative_url }}"></script>


---

<div class="post-meta">
  <p>Published: {{ page.published | date: "%a, %b %d, %y" }}</p>
  <p>{{ page.description }}</p>
</div>


---

<h1>Credits: KNIGHTFALL</h1>

<p>Modified .bashrc file</p>

---

```bash
##########################################
#            Termux bash.bashrc          #
#       Remodeled by: aMiscreant (2025)  #
#         Original Mod: KNIGHTFALL       #
##########################################

########## Global Variables ##############
user_name="miscreant"  # Change your user name here
editor="nano"

########## Environment Variables #########
export GREP_COLOR="1;32"
export MANPAGER="less -R --use-color -Dd+g -Du+b"
export EDITOR=$editor
export SUDO_EDITOR=$editor
export VISUAL="vim"
export USER=$user_name
export ETC="/data/data/com.termux/files/usr/etc"

########## History Settings ##############
shopt -s histappend histverify extglob autocd
HISTCONTROL=ignoreboth
HISTSIZE=1000
HISTFILESIZE=2000

########## Prompt Configuration ##########
sym="㉿"
hostname="phantomgate"  # Custom hostname
bar_cr="34"
name_cr="37"
end_cr="37"
dir_cr="36"

PS1='\[\033[0;${bar_cr}m\]┌──(\[\033[1;${name_cr}m\]${user_name}${sym}'"${hostname}"'\[\033[0;${bar_cr}m\])-[\[\033[0;${dir_cr}m\]\w\[\033[0;${bar_cr}m\]]\n└─\[\033[1;${end_cr}m\]\$\[\033[0m\] '

########## Autocompletion #################
bind 'TAB:menu-complete'

########## Aliases ########################
if [[ -x /usr/bin/dircolors ]]; then
    eval "$(dircolors -b ~/.dircolors 2>/dev/null || dircolors -b)"
    alias ls='ls --color=auto'
    alias grep='grep --color=auto'
    alias diff='diff --color=auto'
    alias ip='ip -color'
fi

# Navigation
alias ..='cd ..'
for i in {2..5}; do alias .$i="cd $(printf '../%.0s' $(seq 1 $i))"; done
alias lm='ls | more'

# Listing
alias ll='ls -lFh'
alias la='ls -alFh --group-directories-first'
alias l1='ls -1F --group-directories-first'
alias l1m='ls -1F --group-directories-first | more'
alias lh='ls -ld .??*'
alias lsn='ls | cat -n'

# File operations
alias mkdir='mkdir -p -v'
alias cp='cp --preserve=all'
alias cpv='cp --preserve=all -v'
alias cpr='cp --preserve=all -R'
alias cpp='rsync -ahW --info=progress2'

# Misc
alias cs='printf "\033c"'
alias q='exit'
alias c='clear'
alias count='find . -type f | wc -l'
alias fbig="find . -size +128M -type f -printf '%s %p\n' | sort -nr | head -16"

# System
alias df='df -Tha --total'
alias free='free -mt'
alias psa='ps auxf'
alias cputemp='sensors | grep Core'

# Apps & Tools
alias myip='curl -s -m 5 https://ipleak.net/json/'
alias e=$editor
alias p='python3'
alias edit-bashrc="$editor $ETC/bash.bashrc"
alias timenow='date +"%T"'
alias datenow='date +"%d-%m-%Y"'
alias untar='tar -zxvf '
alias wget='wget -c '
alias genpass='openssl rand -base64 12'

# Pkg & Apt Through Tor
alias update='proxychains4 pkg update'
alias upgrade='proxychains4 pkg upgrade -y '
alias _install='proxychains4 pkg install -y '

# Termux Easy Dir & Commands
alias etc='cd /data/data/com.termux/files/usr/etc'
alias bin='cd /data/data/com.termux/files/usr/bin'
alias usr='/data/data/com.termux/files/usr/local/bin'
alias startp='privoxy /data/data/com.termux/files/usr/etc/privoxy/config &'
alias torrc='nano /data/data/com.termux/files/usr/etc/tor/torrc'
alias start_tor='tor -f ~/.tor/torrc &'

########## Functions #####################

# Fallback for missing commands
if [ -x /data/data/com.termux/files/usr/libexec/termux/command-not-found ]; then
	command_not_found_handle() {
		/data/data/com.termux/files/usr/libexec/termux/command-not-found "$1"
	}
fi

# nnn with directory tracking
n() {
    if [ -n "$NNNVL" ] && [ "${NNNVL:-0}" -ge 1 ]; then
        echo "nnn is already running"
        return
    fi

    export NNN_TMPFILE="${XDG_CONFIG_HOME:-$HOME/.config}/nnn/.lastd"
    nnn "$@"

    if [ -f "$NNN_TMPFILE" ]; then
        . "$NNN_TMPFILE"
        rm -f "$NNN_TMPFILE" > /dev/null
    fi
}

########## Login Banner ##################
echo -e "\e[0;37m"
clear
cat << "EOF"


████████╗███████╗██████╗ ███╗   ███╗██╗   ██╗██╗  ██╗
╚══██╔══╝██╔════╝██╔══██╗████╗ ████║██║   ██║╚██╗██╔╝
   ██║   █████╗  ██████╔╝██╔████╔██║██║   ██║ ╚███╔╝ 
   ██║   ██╔══╝  ██╔══██╗██║╚██╔╝██║██║   ██║ ██╔██╗ 
   ██║   ███████╗██║  ██║██║ ╚═╝ ██║╚██████╔╝██╔╝ ██╗
   ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═╝

         	KNIGHTFALL - aMiscreant
EOF
```

---

<style>
  footer {
    display: none;
  }
</style>