document.addEventListener('DOMContentLoaded', () => {
  // Basic helpers
  const $ = id => document.getElementById(id);
  const reserved = new Set([
    'break','case','catch','class','const','continue','debugger','default','delete','do','else','export','extends',
    'finally','for','function','if','import','in','instanceof','let','new','return','super','switch','this','throw',
    'try','typeof','var','void','while','with','yield','await','enum','implements','interface','package','private',
    'protected','public','static','null','true','false','NaN','Infinity','undefined','console','window','document',
    'Array','Object','String','Number','Math','Date','RegExp','JSON','setTimeout','setInterval','clearTimeout','Promise'
  ]);

  function randName(seedIndex){
    const chars = 'abcdefghijklmnopqrstuvwxyz';
    let n = seedIndex;
    let name = '_';
    while(true){
      name += chars[n % chars.length];
      n = Math.floor(n / chars.length) - 1;
      if(n < 0) break;
    }
    return name;
  }

  function encodeStringLiterals(code){
    let strings = [];
    const re = /(['"`])((?:\\.|(?!\1).)*)\1/gm;
    let idx = 0;
    const out = code.replace(re, (m, quote, inner) => {
      if (quote === '`' && inner.includes('${')) return m;
      const raw = inner.replace(/\\n/g,'\n').replace(/\\r/g,'\r').replace(/\\t/g,'\t').replace(/\\"/g,'"').replace(/\\'/g,"'");
      const b64 = btoa(unescape(encodeURIComponent(raw)));
      strings.push(b64);
      return `__OBF_STR_${idx++}__`;
    });
    return { code: out, strings };
  }

  function rehydrateStrings(code, strings, useDecoder){
    if(strings.length === 0) return code;
    const decoderName = useDecoder ? '__obf_decode' : null;
    let out = code.replace(/__OBF_STR_(\d+)__/g, (m, n) => {
      const b64 = strings[Number(n)];
      return useDecoder ? `${decoderName}("${b64}")` : `decodeURIComponent(escape(atob("${b64}")))`;
    });
    if(useDecoder){
      const fn = `function ${decoderName}(s){try{return decodeURIComponent(escape(atob(s)));}catch(e){return atob(s);} }\n`;
      out = fn + out;
    }
    return out;
  }

  function renameIdentifiers(code){
    const tokenRe = /\b([A-Za-z_]\w*)\b/g;
    const counts = new Map();
    let m;
    while((m = tokenRe.exec(code)) !== null){
      const t = m[1];
      if(reserved.has(t)) continue;
      const prev = code.slice(Math.max(0, m.index-2), m.index);
      if(prev.endsWith('.') || prev.endsWith(".'") || prev.endsWith('."')) continue;
      counts.set(t, (counts.get(t)||0) + 1);
    }

    const items = [...counts.entries()].sort((a,b)=>b[1]-a[1]);
    const renameMap = new Map();
    const maxRename = Math.min(60, items.length);
    for(let i=0;i<maxRename;i++){
      renameMap.set(items[i][0], randName(i));
    }

    const parts = [];
    const pattern = /(['"`].*?(?:(?<!\\)\1))|(\/\*[\s\S]*?\*\/)|(\/\/[^\n]*)/g;
    let lastIndex = 0;
    while((m = pattern.exec(code)) !== null){
      if(m.index > lastIndex) parts.push({type:'code', text: code.slice(lastIndex, m.index)});
      if(m[1]) parts.push({type:'string', text: m[1]});
      else if(m[2]) parts.push({type:'comment_block', text: m[2]});
      else if(m[3]) parts.push({type:'comment_line', text: m[3]});
      lastIndex = pattern.lastIndex;
    }
    if(lastIndex < code.length) parts.push({type:'code', text: code.slice(lastIndex)});

    const replaceRe = new RegExp('\\b(' + [...renameMap.keys()].map(s=>s.replace(/[$^.*+?()[\]{}\\|]/g,'\\$&')).join('|') + ')\\b', 'g');
    for(let p of parts){
      if(p.type === 'code') p.text = p.text.replace(replaceRe, id => renameMap.get(id) || id);
    }
    return parts.map(p=>p.text).join('');
  }

  // Wire UI
  const btnObf = $('btn-obf'), btnClear = $('btn-clear'), btnCopy = $('btn-copy'), btnDownload = $('btn-download'), btnPreview = $('btn-preview');
  const input = $('obf-input'), output = $('obf-output');

  btnObf.addEventListener('click', ()=>{
    let code = input.value || '';
    if(!code.trim()){ output.value = '// paste code to obfuscate'; return; }

    const doStrings = $('opt-strings').checked;
    const doIdent = $('opt-ident').checked;
    const doWrap = $('opt-wrap').checked;

    let enc = { code, strings: [] };
    if(doStrings){ enc = encodeStringLiterals(code); code = enc.code; }
    if(doIdent){ try{ code = renameIdentifiers(code); }catch(e){ console.warn('rename failed', e); } }
    if(doStrings){ code = rehydrateStrings(code, enc.strings, doWrap); }

    output.value = code;
  });

  btnClear.addEventListener('click', ()=>{
    input.value = '';
    output.value = '';
  });

  btnCopy.addEventListener('click', ()=>{
    output.select();
    try{ document.execCommand('copy'); btnCopy.textContent='Copied ✓'; setTimeout(()=>btnCopy.textContent='Copy',900); }
    catch(e){ alert('Copy failed — select and copy manually.'); }
  });

  btnDownload.addEventListener('click', ()=>{
    const blob = new Blob([output.value || ''], {type:'text/javascript'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download='obfuscated.js';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  });

  btnPreview.addEventListener('click', ()=>{
    const code = output.value || '';
    if(!code.trim()){ alert('No obfuscated code to run'); return; }

    const existing = $('obf-preview-iframe');
    if(existing) existing.remove();

    const ifr = document.createElement('iframe');
    ifr.id = 'obf-preview-iframe';
    ifr.style='width:100%; height:300px; margin-top:8px; border:1px solid #222;';
    ifr.sandbox='allow-scripts';
    $('obf-preview-container').appendChild(ifr);

    const doc = ifr.contentWindow.document;
    doc.open();
    const wrapped = `
      <script>
        (function(){
          const log = (...args)=>{ parent.postMessage({type:'obf-log', log: args}, '*'); };
          console.log=console.info=console.warn=console.error=log;
          try{ ${code} } catch(e){ console.error('Runtime error:', e && e.message ? e.message : e); }
        })();
      <\/script>`;
    doc.write(wrapped);
    doc.close();

    window.addEventListener('message', ev=>{
      if(ev.data && ev.data.type==='obf-log'){ console.log('[OBF PREVIEW]', ...ev.data.log); }
    }, {once:false});
  });
});
