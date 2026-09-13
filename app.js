    function getStore(k,f){try{var v=localStorage.getItem(k);return v?JSON.parse(v):f}catch(e){return f}}
    function setStore(k,v){localStorage.setItem(k,JSON.stringify(v))}
    function ensureDefaults(){
      var ver=localStorage.getItem('mo-data-ver');
      if(ver!=='2'){
        localStorage.removeItem('mo-projects');
        localStorage.removeItem('mo-files');
        localStorage.removeItem('mo-folders');
        localStorage.removeItem('mo-notes');
        localStorage.setItem('mo-data-ver','2');
      }
      if(!getStore('mo-projects',null)) setStore('mo-projects',[]);
      if(!getStore('mo-files',null)) setStore('mo-files',[
        {name:'readme.md',type:'file',content:'# MO OS\n\nA calm, editorial operating system for creators.\n\nCreated from scratch using HTML, CSS, and JavaScript.\nBuilt for Hack Club Stardance.\n\nDevelopment time: ~5.5 hours.\n  1.5 hr — Planning & compiling\n  3 hr — Coding & building\n  1 hr — Testing, fixing & polishing\n\nFeatures: Files, Terminal, Notes, Projects, Browser, Calculator,\nCalendar, Editor, Maps, Music, and more.'}
      ]);
      if(!getStore('mo-folders',null)) setStore('mo-folders',[]);
      if(!getStore('mo-notes',null)) setStore('mo-notes',[{title:'UNTITLED',body:'',date:new Date().toLocaleDateString()}]);
    }
    ensureDefaults();

    function updateClock(){
      var now=new Date(),days=['SUN','MON','TUE','WED','THU','FRI','SAT'],months=['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
      var d=days[now.getDay()]+' '+String(now.getDate()).padStart(2,'0')+' '+months[now.getMonth()];
      var t=String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0');
      document.getElementById('topbar-center').textContent=d+' \u00B7 '+t;
      document.getElementById('topbar-clock').textContent=t;
      var wifiOn=getStore('mo-wifi',true);
      var wifiEl=document.getElementById('topbar-wifi');
      if(wifiEl){wifiEl.innerHTML=(wifiOn?'<span class="topbar-dot"></span>ONLINE':'<span class="topbar-dot" style="background:#ff5f57"></span>OFFLINE');}
      var lockClock=document.getElementById('lock-clock');
      var lockDate=document.getElementById('lock-date');
      if(lockClock){
        var h=String(now.getHours()).padStart(2,'0');
        var m=String(now.getMinutes()).padStart(2,'0');
        lockClock.textContent=h+':'+m;
        var fullDays=['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'];
        var fullMonths=['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
        lockDate.textContent=fullDays[now.getDay()]+', '+fullMonths[now.getMonth()]+' '+now.getDate();
      }
    }
    updateClock(); setInterval(updateClock,1000);

    var notifTimer=null;
    function showNotification(msg){var el=document.getElementById('notification');el.querySelector('.n-msg').textContent=msg;el.classList.add('show');clearTimeout(notifTimer);notifTimer=setTimeout(function(){el.classList.remove('show')},2500);}

    function checkFullscreen(){
      var fw=document.getElementById('fullscreen-warn');
      if(!fw)return;
      if(!document.fullscreenElement&&!document.webkitFullscreenElement){fw.style.display='flex';}
      else{fw.style.display='none';}
    }
    (function(){
      var logo=document.getElementById('boot-logo'),subtitle=document.getElementById('boot-subtitle'),greeting=document.getElementById('boot-greeting'),progress=document.getElementById('boot-progress'),progressFill=document.getElementById('boot-progress-fill'),lines=document.querySelectorAll('#boot-log .line'),version=document.getElementById('boot-version'),bootScreen=document.getElementById('boot-screen');
      if(window.innerWidth<1024||/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)){
        document.getElementById('mobile-blocker').style.display='flex';
        bootScreen.remove();return;
      }
      document.getElementById('fsw-btn').addEventListener('click',function(){
        var el=document.documentElement;
        if(el.requestFullscreen)el.requestFullscreen();
        else if(el.webkitRequestFullscreen)el.webkitRequestFullscreen();
      });
      document.getElementById('fsw-dismiss').addEventListener('click',function(){document.getElementById('fullscreen-warn').style.display='none';});
      document.addEventListener('fullscreenchange',checkFullscreen);
      document.addEventListener('webkitfullscreenchange',checkFullscreen);
      var userName=getStore('mo-user-name','Developer');
      greeting.textContent='WELCOME BACK, '+userName.toUpperCase();
      setTimeout(function(){greeting.style.opacity='1'},800);
      setTimeout(function(){logo.classList.add('visible')},200);
      setTimeout(function(){subtitle.classList.add('visible')},600);
      setTimeout(function(){progress.classList.add('visible')},800);
      var td=1000,totalDur=0;
      var delays=[];
      lines.forEach(function(l){delays.push(parseInt(l.getAttribute('data-delay')));});
      totalDur=delays.reduce(function(a,b){return a+b;},0);
      var elapsed=0;
      lines.forEach(function(l,i){
        var d=delays[i];
        setTimeout(function(){l.classList.add('visible');elapsed+=d;progressFill.style.width=Math.min(100,Math.round((elapsed/totalDur)*100))+'%';},td);
        td+=d;
      });
      setTimeout(function(){lines[lines.length-1].classList.add('done')},td);
      setTimeout(function(){progressFill.style.width='100%'},td);
      setTimeout(function(){version.classList.add('visible')},td+300);
      setTimeout(function(){
        bootScreen.style.transition='opacity 0.8s ease';
        bootScreen.style.opacity='0';
        setTimeout(function(){bootScreen.remove();checkFullscreen();},800);
      },td+1600);
      checkFullscreen();
    })();
    initLockScreen();

    function moPrompt(title, fields){
      return new Promise(function(resolve){
        var overlay=document.getElementById('mo-modal-overlay');
        var modalTitle=document.getElementById('mo-modal-title');
        var modalBody=document.getElementById('mo-modal-body');
        var confirmBtn=document.getElementById('mo-modal-confirm');
        var cancelBtn=document.getElementById('mo-modal-cancel');
        modalTitle.textContent=title;
        modalBody.innerHTML='';
        fields.forEach(function(f,i){
          var lbl=document.createElement('label');lbl.textContent=f.label;
          var inp=document.createElement('input');inp.type=f.type||'text';inp.placeholder=f.placeholder||'';inp.id='mo-modal-field-'+i;
          modalBody.appendChild(lbl);modalBody.appendChild(inp);
        });
        overlay.classList.add('open');
        var firstInput=modalBody.querySelector('input');
        if(firstInput) setTimeout(function(){firstInput.focus()},50);
        function close(val){overlay.classList.remove('open');confirmBtn.onclick=null;cancelBtn.onclick=null;resolve(val);}
        confirmBtn.onclick=function(){
          var results=[];fields.forEach(function(f,i){var v=document.getElementById('mo-modal-field-'+i).value;results.push(v);});
          close(results);
        };
        cancelBtn.onclick=function(){close(null);};
        overlay.addEventListener('keydown',function handler(e){
          if(e.key==='Escape'){overlay.removeEventListener('keydown',handler);close(null);}
          if(e.key==='Enter'&&document.activeElement&&document.activeElement.tagName==='INPUT'){
            overlay.removeEventListener('keydown',handler);
            confirmBtn.click();
          }
        });
      });
    }

    var lockKeyHandler=null;
    function initLockScreen(){
      var lockScreen=document.getElementById('lock-screen');
      if(!lockScreen)return;
      var lockFunfact=document.getElementById('lock-funfact');
      var funFacts=[
        'The first computer bug was an actual moth found in a Harvard Mark II in 1947.',
        'The first programmer was Ada Lovelace, who wrote algorithms for Charles Babbage\'s Analytical Engine in the 1840s.',
        'JavaScript was created in just 10 days by Brendan Eich in 1995.',
        'The average programmer writes about 50 lines of production-quality code per day.',
        'There are over 700 programming languages in the world.',
        'The first computer mouse was made of wood.',
        'HTML is not a programming language — it\'s a markup language.',
        'The first website ever made is still online at info.cern.ch.',
        'The term "debugging" was popularized by Grace Hopper after finding a moth in a computer.',
        'Python is named after Monty Python, not the snake.',
        'A group of flamingos is called a "flamboyance."',
        'Honey never spoils. Archaeologists found 3,000-year-old honey in Egyptian tombs that was still edible.',
        'Octopuses have three hearts and blue blood.',
        'Bananas are berries, but strawberries are not.',
        'The shortest war in history lasted 38 to 45 minutes (between Britain and Zanzibar).',
        'A day on Venus is longer than a year on Venus.',
        'Your brain uses about 20% of your total energy.',
        'The moon is slowly drifting away from Earth at about 3.8 cm per year.',
        'Cows have best friends and get stressed when separated.',
        'The inventor of the Pringles can is buried in one.',
        'M x 42 = a well-known cultural reference — the answer to life, the universe, and everything.',
        'Walt Disney was afraid of mice.',
        'The dot over the letters i and j is called a tittle.',
        'A jiffy is an actual unit of time: 1/100th of a second.'
      ];
      var usedFacts=[];
      function pickFact(){
        if(usedFacts.length>=funFacts.length)usedFacts=[];
        var idx;
        do{idx=Math.floor(Math.random()*funFacts.length);}while(usedFacts.indexOf(idx)!==-1);
        usedFacts.push(idx);
        return funFacts[idx];
      }
      lockFunfact.textContent=pickFact();
      setInterval(function(){lockFunfact.style.opacity='0';setTimeout(function(){lockFunfact.textContent=pickFact();lockFunfact.style.opacity='1';},500);},8000);
      function doUnlock(){
        lockScreen.classList.remove('visible');
        lockScreen.classList.add('hidden');
        setTimeout(function(){lockScreen.remove();showDesktop();},800);
      }
      function showDesktop(){
        document.getElementById('desktop').classList.add('visible');
        document.getElementById('dock').classList.add('visible');
        checkFullscreen();
      }
      lockScreen.onclick=function(){doUnlock();};
      if(lockKeyHandler)document.removeEventListener('keydown',lockKeyHandler);
      lockKeyHandler=function(e){
        if(e.key==='Enter'||e.key===' '||e.key==='Escape'){
          if(lockScreen&&lockScreen.parentNode){
            doUnlock();
          }
        }
      };
      document.addEventListener('keydown',lockKeyHandler);
    }

    var windowZIndex=100,openWindows={};
    function createWindow(app,title,w,h,bodyHTML){
      if(openWindows[app]){var ex=openWindows[app];if(ex.classList.contains('minimized'))ex.classList.remove('minimized');bringToFront(ex);return ex;}
      var win=document.createElement('div');
      var cx=Math.max(0,(window.innerWidth-w)/2);
      var cy=Math.max(36,(window.innerHeight-h)/2);
      win.className='mo-window';win.style.width=w+'px';win.style.height=h+'px';win.style.left=cx+'px';win.style.top=cy+'px';
      win.innerHTML='<div class="win-titlebar"><div class="win-title">'+title+'</div><div class="win-controls"><button class="win-btn win-btn-min" data-action="minimize"></button><button class="win-btn win-btn-max" data-action="maximize"></button><button class="win-btn win-btn-close" data-action="close"></button></div></div><div class="win-body">'+bodyHTML+'</div>';
      document.getElementById('desktop').appendChild(win);openWindows[app]=win;
      requestAnimationFrame(function(){win.classList.add('open')});bringToFront(win);setupDrag(win);setupControls(win,app);return win;
    }
    function bringToFront(win){windowZIndex++;win.style.zIndex=windowZIndex;}
    function setupControls(win,app){
      win.querySelector('.win-controls').addEventListener('click',function(e){
        var btn=e.target.closest('.win-btn');if(!btn)return;
        var action=btn.getAttribute('data-action');
        if(action==='close'){win.classList.remove('open');setTimeout(function(){win.remove()},250);delete openWindows[app];}
        else if(action==='minimize'){win.classList.add('minimized');}
        else if(action==='maximize'){win.classList.toggle('maximized');}
      });
      win.addEventListener('mousedown',function(){bringToFront(win);});
    }
    function setupDrag(win){
      var tb=win.querySelector('.win-titlebar'),dragging=false,sx,sy,ox,oy;
      tb.addEventListener('mousedown',function(e){if(e.target.closest('.win-controls'))return;if(win.classList.contains('maximized'))return;dragging=true;sx=e.clientX;sy=e.clientY;ox=win.offsetLeft;oy=win.offsetTop;win.style.transition='none';e.preventDefault();});
      document.addEventListener('mousemove',function(e){if(!dragging)return;win.style.left=(ox+e.clientX-sx)+'px';win.style.top=(oy+e.clientY-sy)+'px';});
      document.addEventListener('mouseup',function(){if(dragging){dragging=false;win.style.transition='';}});
    }

    function buildSearchIndex(){
      var items=[];
      getStore('mo-notes',[{title:'UNTITLED',body:'',date:''}]).forEach(function(n,i){items.push({type:'note',name:n.title,app:'notes'});});
      getStore('mo-projects',[]).forEach(function(p){items.push({type:'project',name:p.name,app:'projects'});});
      getStore('mo-files',[]).forEach(function(f){items.push({type:'file',name:f.name,app:'files'});});
      getStore('mo-folders',[]).forEach(function(f){items.push({type:'folder',name:f.name,app:'files'});});
      return items;
    }

    function filesHTML(){
      var files=getStore('mo-files',[]),folders=getStore('mo-folders',[]);
      var fileGrid='';
      folders.forEach(function(f,i){fileGrid+='<div class="file-item" data-folder-idx="'+i+'"><div class="fi-icon">&#128193;</div><div class="fi-name">'+f.name+'</div><div class="fi-meta">'+f.files.length+' files</div></div>';});
      files.forEach(function(f,i){var icon=f.type==='folder'?'&#128193;':'&#128196;';var meta=f.content?f.content.length+' chars':'file';fileGrid+='<div class="file-item" data-file-idx="'+i+'"><div class="fi-icon">'+icon+'</div><div class="fi-name">'+f.name+'</div><div class="fi-meta">'+meta+'</div></div>';});
      return '<div class="files-layout"><div class="files-sidebar"><div class="section-label">LOCATIONS</div><div class="loc active">All Files</div></div><div class="files-main"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px"><h2 style="margin:0">ALL FILES</h2><div style="display:flex;gap:8px"><button class="mo-btn" id="files-new-folder">+ FOLDER</button><button class="mo-btn" id="files-new-file">+ FILE</button></div></div><div class="file-grid">'+fileGrid+'</div></div></div>';
    }
    function setupFiles(){
      var win=openWindows['files'];if(!win)return;
      var body=win.querySelector('.win-body');
      function renderFiles(){
        var files=getStore('mo-files',[]),folders=getStore('mo-folders',[]);
        var grid=body.querySelector('.file-grid');if(!grid)return;
        var html='';
        folders.forEach(function(f,i){html+='<div class="file-item" data-folder-idx="'+i+'"><div class="fi-icon">&#128193;</div><div class="fi-name">'+f.name+'</div><div class="fi-meta">'+f.files.length+' files</div></div>';});
        files.forEach(function(f,i){var icon=f.type==='folder'?'&#128193;':'&#128196;';html+='<div class="file-item" data-file-idx="'+i+'"><div class="fi-icon">'+icon+'</div><div class="fi-name">'+f.name+'</div><div class="fi-meta">'+(f.content?f.content.length+' chars':'file')+'</div></div>';});
        grid.innerHTML=html;
      }
      body.addEventListener('click',function(e){
        var folderItem=e.target.closest('[data-folder-idx]');
        if(folderItem){
          var idx=parseInt(folderItem.getAttribute('data-folder-idx'));
          var folders=getStore('mo-folders',[]);
          var folder=folders[idx];if(!folder)return;
          openFolderWindow(folder.name, folder.files);
          return;
        }
        var fileItem=e.target.closest('[data-file-idx]');
        if(fileItem){
          var idx=parseInt(fileItem.getAttribute('data-file-idx'));
          var files=getStore('mo-files',[]);
          var f=files[idx];if(!f||f.type==='folder')return;
          openFileViewer(f.name, f.content||'');
          return;
        }
      });
      var newFolderBtn=body.querySelector('#files-new-folder');
      if(newFolderBtn) newFolderBtn.addEventListener('click',async function(){
        var result=await moPrompt('NEW FOLDER',[{label:'FOLDER NAME',type:'text',placeholder:'Enter folder name...'}]);
        if(!result||!result[0].trim())return;
        var folders=getStore('mo-folders',[]);folders.push({name:result[0].trim(),files:[]});setStore('mo-folders',folders);
        renderFiles();showNotification('Folder created.');
      });
      var newFileBtn=body.querySelector('#files-new-file');
      if(newFileBtn) newFileBtn.addEventListener('click',async function(){
        var result=await moPrompt('NEW FILE',[{label:'FILE NAME (e.g. index.html)',type:'text',placeholder:'Enter file name...'}]);
        if(!result||!result[0].trim())return;
        var files=getStore('mo-files',[]);files.push({name:result[0].trim(),type:'file',content:''});setStore('mo-files',files);
        renderFiles();showNotification('File created.');
      });
    }
    function openFileViewer(name,content){
      var html='<div style="padding:4px 0"><div class="section-label" style="margin-bottom:12px">'+name+'</div><div style="background:#0e0e10;border:1px solid var(--border);border-radius:8px;padding:16px;font-size:12px;line-height:1.8;color:#c8c8c8;white-space:pre-wrap;max-height:300px;overflow-y:auto;user-select:text">'+content+'</div></div>';
      createWindow('file-'+name,name.toUpperCase(),500,360,html);
    }
    function openFolderWindow(name,files){
      var fileGrid='';
      if(!files||files.length===0) fileGrid='<div style="font-size:11px;color:var(--text-dim)">Empty folder</div>';
      else files.forEach(function(f,i){fileGrid+='<div class="file-item"><div class="fi-icon">&#128196;</div><div class="fi-name">'+f.name+'</div><div class="fi-meta">'+(f.content?f.content.length+' chars':'file')+'</div></div>';});
      var html='<div style="padding:4px 0"><div class="section-label" style="margin-bottom:12px">'+name+'</div><div class="file-grid">'+fileGrid+'</div></div>';
      createWindow('folder-'+name,name.toUpperCase(),500,360,html);
    }

    function terminalHTML(){
      return '<div class="terminal-body" id="term-output"><div class="term-line term-output">MO Terminal v01.0</div><div class="term-line term-output">Type "help" for available commands.</div><div class="term-line term-output">&nbsp;</div><div class="term-input-line"><span class="term-prompt">muhammad@mo-os ~ %&nbsp;</span><input class="term-input" id="term-input" type="text"></div></div>';
    }
    function setupTerminal(){
      var input=document.getElementById('term-input'),output=document.getElementById('term-output');if(!input)return;
      setTimeout(function(){input.focus()},100);
      input.addEventListener('keydown',function(e){
        if(e.key!=='Enter')return;
        var cmd=input.value.trim().toLowerCase(),inputLine=input.parentElement,result='';
        switch(cmd){
          case 'help':result='Available commands:\n  help      — Show this message\n  about     — About MO OS\n  projects  — List your projects\n  notes     — List your notes\n  files     — List your files\n  music     — Open Music player\n  maps      — Open Google Maps\n  date      — Current date/time\n  system    — System info\n  whoami    — Current user\n  neofetch  — System summary\n  code      — Open the Editor\n  coffee    — Coffee status\n  sudo mo   — Permission check\n  reset     — Clear all saved data\n  clear     — Clear terminal';break;
          case 'about':result='MO OS v01.0 — Developer Edition\n\nA calm, editorial operating system for software developers.\n\nMO OS was created from scratch using HTML, CSS, and a bit of JavaScript.\nAI was used only to assist with some of the JavaScript development.\nThe concept, design, features, and overall direction were created\nand put together by me.\n\nFeatures include: Files, Terminal, Notes, Projects, Browser,\nCalculator, Calendar, Editor, Music, Maps, and more.\n\nDevelopment time: ~5.5 hours\n  1.5 hr — Planning & compiling\n  3 hr — Coding & building\n  1 hr — Testing, fixing & polishing\n\nBuilt for Hack Club Stardance.';break;
          case 'projects':var p=getStore('mo-projects',[]);result=p.length?p.map(function(x){return'  '+x.name+' \u2014 '+x.desc}).join('\n'):'  No projects yet.';break;
          case 'notes':var n=getStore('mo-notes',[{title:'UNTITLED'}]);result=n.map(function(x){return'  '+x.title}).join('\n');break;
          case 'files':var f=getStore('mo-files',[]),fo=getStore('mo-folders',[]);result=fo.map(function(x){return'  [DIR] '+x.name}).join('\n')+'\n'+f.map(function(x){return'  '+x.name}).join('\n');break;
          case 'date':result=new Date().toString();break;
          case 'system':result='MO OS 01.0\nBrowser  Chromium\nMemory   16 GB\nStatus   ONLINE';break;
          case 'whoami':result='muhammad';break;
          case 'neofetch':result='        \u2588\u2588\u2588\u2588\n      \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588       MO OS\n    \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588      Version 01.0\n      \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588       HTML/CSS/JS\n        \u2588\u2588\u2588\u2588         Chromium\n                     16 GB MEMORY\n                     ONLINE';break;
          case 'code':openApp('editor');result='Opening Editor...';break;
          case 'music':openApp('music');result='Opening Music Player...';break;
          case 'maps':openApp('maps');result='Opening Maps...';break;
          case 'reset':localStorage.removeItem('mo-projects');localStorage.removeItem('mo-files');localStorage.removeItem('mo-folders');localStorage.removeItem('mo-notes');localStorage.removeItem('mo-music-tracks');musicTracks=defaultTracks();musicState.builderIdx=-1;musicState.track=0;result='All data cleared.\nProjects, files, folders, notes, and music have been reset.\nRefresh the page to start fresh.';break;
          case 'coffee':result='COFFEE STATUS\n\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588 82%\n\nContinue building.';break;
          case 'sudo mo':result='permission granted.\nyou already own the machine.';break;
          case 'clear':output.innerHTML='<div class="term-input-line"><span class="term-prompt">muhammad@mo-os ~ %&nbsp;</span><input class="term-input" id="term-input" type="text"></div>';setupTerminal();return;
          case '':break;
          default:result='command not found: '+cmd+'\nType "help" for available commands.';
        }
        var el=document.createElement('div');el.className='term-line';el.innerHTML='<span class="term-prompt">muhammad@mo-os ~ %&nbsp;</span>'+cmd;output.insertBefore(el,inputLine);
        if(result){var rl=document.createElement('div');rl.className='term-line term-output';rl.textContent=result;output.insertBefore(rl,inputLine);}
        var sp=document.createElement('div');sp.className='term-line';sp.innerHTML='&nbsp;';output.insertBefore(sp,inputLine);
        input.value='';output.scrollTop=output.scrollHeight;
      });
    }

    function notesHTML(){
      var notes=getStore('mo-notes',[{title:'UNTITLED',body:'',date:new Date().toLocaleDateString()}]);
      var listHTML='';notes.forEach(function(n,i){listHTML+='<div class="note-item'+(i===0?' active':'')+'" data-idx="'+i+'"><div class="ni-title">'+(n.title||'Untitled')+'</div><div class="ni-del" data-del="'+i+'">&times;</div></div>';});
      return '<div class="notes-body"><div class="notes-list" id="notes-list">'+listHTML+'</div><div class="notes-editor"><div style="display:flex;gap:8px;margin-bottom:12px"><button class="mo-btn" id="notes-new">+ NEW NOTE</button></div><textarea id="notes-textarea" placeholder="Start writing...">'+(notes[0]?notes[0].body:'')+'</textarea></div></div>';
    }
    function setupNotes(){
      var notes=getStore('mo-notes',[{title:'UNTITLED',body:'',date:new Date().toLocaleDateString()}]),currentIdx=0;
      function save(){setStore('mo-notes',notes);}
      function renderList(){
        var list=document.getElementById('notes-list');if(!list)return;list.innerHTML='';
        notes.forEach(function(n,i){
          var div=document.createElement('div');div.className='note-item'+(i===currentIdx?' active':'');div.setAttribute('data-idx',i);
          div.innerHTML='<div class="ni-title">'+(n.title||'Untitled')+'</div><div class="ni-del" data-del="'+i+'">&times;</div>';
          div.querySelector('.ni-title').addEventListener('click',function(){currentIdx=i;document.getElementById('notes-textarea').value=notes[i].body;renderList();});
          div.querySelector('.ni-del').addEventListener('click',function(e){e.stopPropagation();if(notes.length<=1){showNotification('Cannot delete last note.');return;}notes.splice(i,1);if(currentIdx>=notes.length)currentIdx=notes.length-1;save();renderList();document.getElementById('notes-textarea').value=notes[currentIdx].body;showNotification('Note deleted.');});
          list.appendChild(div);
        });
      }
      var ta=document.getElementById('notes-textarea');
      if(ta) ta.addEventListener('input',function(){notes[currentIdx].body=ta.value;var fl=ta.value.split('\n')[0].trim();notes[currentIdx].title=fl||'Untitled';notes[currentIdx].date=new Date().toLocaleDateString();save();renderList();});
      var nb=document.getElementById('notes-new');
      if(nb) nb.addEventListener('click',function(){notes.unshift({title:'UNTITLED',body:'',date:new Date().toLocaleDateString()});currentIdx=0;ta.value='';save();renderList();showNotification('New note created.');});
      renderList();
    }

    function projectsHTML(){
      var projects=getStore('mo-projects',[]);var cards='';
      projects.forEach(function(p,i){cards+='<div class="project-card" data-proj-idx="'+i+'"><div class="pc-num">'+String(i+1).padStart(2,'0')+'</div><div class="pc-name">'+p.name+'</div><div class="pc-desc">'+p.desc+'</div><div class="pc-del" data-del-proj="'+i+'">&times;</div></div>';});
      return '<div class="projects-body"><div class="projects-header"><h2>PROJECTS</h2><button class="mo-btn" id="proj-new">+ NEW PROJECT</button></div><div id="proj-list">'+cards+'</div></div>';
    }
    function setupProjects(){
      var win=openWindows['projects'];if(!win)return;var body=win.querySelector('.win-body');
      function render(){
        var projects=getStore('mo-projects',[]);var list=body.querySelector('#proj-list');if(!list)return;var cards='';
        projects.forEach(function(p,i){cards+='<div class="project-card" data-proj-idx="'+i+'"><div class="pc-num">'+String(i+1).padStart(2,'0')+'</div><div class="pc-name">'+p.name+'</div><div class="pc-desc">'+p.desc+'</div><div class="pc-del" data-del-proj="'+i+'">&times;</div></div>';});
        list.innerHTML=cards;
      }
      body.addEventListener('click',function(e){
        var del=e.target.closest('[data-del-proj]');if(del){e.stopPropagation();var idx=parseInt(del.getAttribute('data-del-proj'));var p=getStore('mo-projects',[]);p.splice(idx,1);setStore('mo-projects',p);render();showNotification('Project deleted.');return;}
        var card=e.target.closest('[data-proj-idx]');if(card){var idx=parseInt(card.getAttribute('data-proj-idx'));var p=getStore('mo-projects',[])[idx];if(p) openProjectDetail(p.name,p.desc,p.notes||'');}
      });
      var nb=body.querySelector('#proj-new');
      if(nb) nb.addEventListener('click',async function(){
        var result=await moPrompt('NEW PROJECT',[
          {label:'PROJECT NAME',type:'text',placeholder:'Enter project name...'},
          {label:'DESCRIPTION (e.g. WEB DEVELOPMENT)',type:'text',placeholder:'Enter description...'}
        ]);
        if(!result||!result[0].trim())return;
        var projects=getStore('mo-projects',[]);projects.push({name:result[0].trim().toUpperCase(),desc:(result[1]||'').toUpperCase(),notes:''});setStore('mo-projects',projects);render();showNotification('Project created.');
      });
    }
    function openProjectDetail(name,desc,notes){
      var html='<div class="project-detail"><div class="pd-back" id="pd-back">&larr; BACK</div><h3>'+name+'</h3><div class="pd-meta">'+desc+'</div><p style="margin-top:16px">'+(notes||'No notes yet.')+'</p></div>';
      createWindow('project-'+name,name,500,360,html);
      setTimeout(function(){var w=openWindows['project-'+name];if(w){var b=w.querySelector('#pd-back');if(b) b.addEventListener('click',function(){w.classList.remove('open');setTimeout(function(){w.remove()},250);delete openWindows['project-'+name];});}},50);
    }

    var aiDictionary={
      'hello':'Hello! I am MO AI. How can I help you build today?','hi':'Hey! Ready to create something amazing?','hey':'Hey there! What are you working on?','yo':'Yo! Need help with code or design?',
      'help':'Try asking about HTML, CSS, JavaScript, project ideas, or type "what can you do" for a full list.',
      'about':'MO OS is a calm, editorial operating system built for creators. It runs in the browser and was made for Hack Club Stardance by MO Digital. It features a window system, terminal, calculator, calendar, notes, browser with AI, maps, music, and a dino game.',
      'what is mo os':'MO OS is a browser-based operating system with a dark graphite theme, copper accents, and editorial design. It includes Files, Terminal, Notes, Projects, Browser, Calculator, Calendar, Maps, Music, Editor, and Settings.',
      'who made this':'Built by MO Digital for Hack Club Stardance. A browser-based OS experiment.',
      'what can you do':'I can answer questions about coding, design, MO OS features, suggest project ideas, explain tech concepts, and help you learn web development.',
      'html':'HTML (HyperText Markup Language) is the standard markup for web pages. It structures content using tags like <div>, <p>, <h1>, and <a>. Learn at MDN Web Docs.',
      'css':'CSS (Cascading Style Sheets) controls visual presentation. It handles layout (flexbox, grid), colors, typography, animations. MO OS uses CSS variables for theming.',
      'javascript':'JavaScript adds interactivity to websites. It handles DOM manipulation, events, API calls, and runs in browsers and servers (Node.js). Essential for web dev.',
      'react':'React is a JavaScript library by Meta for building UIs. Uses components, JSX, and virtual DOM. Very popular for modern web apps.',
      'python':'Python is a versatile language known for readability. Used in AI/ML, web dev (Django/Flask), data science, automation. Great first language.',
      'node':'Node.js is a JavaScript runtime for servers. Use npm for packages. Express.js is the most popular web framework for Node.',
      'git':'Git is version control. Commands: git init, git add, git commit, git push, git pull, git branch. GitHub hosts repos.',
      'api':'API (Application Programming Interface) lets software communicate. REST APIs use HTTP. GraphQL is a modern alternative.',
      'design':'Design is solving problems visually. MO OS follows editorial minimalism: 70% minimal, 20% technical, 10% futuristic.',
      'minimal':'Minimalism: less but better. MO OS uses empty space, thin borders, and restrained color. Every element feels intentional.',
      'portfolio':'A portfolio shows your best work. Build one with HTML/CSS/JS. Include projects, skills, about me, and contact info.',
      'project ideas':'Build: a weather app, portfolio site, task manager, music visualizer, chat app, browser extension, or a game like this dino runner.',
      'how to start coding':'Start with HTML + CSS for structure and style. Then JavaScript for interactivity. Use freeCodeCamp, MDN, or The Odin Project. Practice daily.',
      'learn to code':'Free resources: freeCodeCamp, The Odin Project, MDN Web Docs, Codecademy, CS50. Start with web basics (HTML/CSS/JS).',
      'what should i build':'Build something you would use. A personal dashboard, note app, habit tracker, or a tool that solves your own problem.',
      'best programming language':'For web: JavaScript (essential), Python (versatile), TypeScript (safer JS). Start with JavaScript — it runs everywhere.',
      'colors':'MO OS uses: dark graphite (#1c1c1e) background, warm off-white (#f0ebe3) text, copper/orange (#cc8844) accent.',
      'wallpaper':'Go to Settings > Appearance to choose from 5 wallpapers: MO Grid, Ocean, Dusk, Ember, and Slate.',
      'terminal':'MO OS Terminal supports: help, about, projects, notes, files, date, system, whoami, neofetch, coffee, sudo mo, clear.',
      'calculator':'The MO OS Calculator supports basic math, parentheses, decimals. Found in the dock and desktop.',
      'calendar':'The Calendar shows the current month with today highlighted. Navigate months with arrows.',
      'notes':'Notes auto-save to localStorage. Create, edit, delete notes. Title comes from the first line of text.',
      'projects':'Create and manage projects in the Projects app. Each project has a name, description, and notes.',
      'browser':'MO OS Browser has tabs, navigation controls, address bar, and an AI assistant. Type in the address bar to search.',
      'dino game':'Open Browser and click the Dino Game card. Press SPACE or click to jump. Avoid cacti. Score increases over time.',
      'easter egg':'Try "coffee" or "sudo mo" in the Terminal. Also try the Command Palette with Ctrl+K.',
      'shortcut':'Ctrl+K opens the Command Palette to search everything. Escape closes it.',
      'thank you':'You are welcome! Keep building great things.',
      'thanks':'Anytime! Let me know if you need more help.',
      'yes':'Great! What else can I help with?',
      'no':'Alright. Let me know when you need something!',
      'name':'I am MO AI, the assistant built into MO OS Browser.',
      'age':'I am as old as MO OS version 01.0!',
      'creator':'I was built into MO OS by MO Digital for Hack Club Stardance.',
      'music':'MO OS has a built-in Music player with a step sequencer builder. Open it from the dock.',
      'weather':'I do not have live weather data, but you could build a weather app using a free API like OpenWeatherMap.',
      'time':'Check the top bar — MO OS shows the current time and date there.',
      'date':'The calendar in MO OS shows today\'s date. Also visible in the top bar.',
      'help me':'I can help with coding questions, project ideas, design advice, or explain tech concepts. Just ask!',
      'problem':'Describe the problem and I will try to help. Include what you expected vs what happened.',
      'error':'Check the browser console (F12) for error details. Common issues: typos, missing brackets, undefined variables.',
      'bug':'Bugs happen! Use console.log() to debug, check line numbers, and test small pieces of code.',
      'code example':'Here is a simple HTML page:\n<html>\n<head><title>My Page</title></head>\n<body>\n<h1>Hello World</h1>\n</body>\n</html>',
      'css example':'body { background: #1c1c1e; color: #f0ebe3; font-family: sans-serif; }',
      'js example':'document.querySelector("h1").addEventListener("click", function() { alert("Clicked!"); });',
      'flexbox':'Flexbox is a CSS layout method. Key properties: display:flex, justify-content, align-items, flex-direction, gap.',
      'grid':'CSS Grid is for 2D layouts. Key properties: display:grid, grid-template-columns, grid-template-rows, gap.',
      'animation':'CSS animations use @keyframes and transition. Example: transition: transform 0.3s ease;',
      'responsive':'Use media queries: @media (max-width: 768px) { ... }. Or use flexbox/grid for automatic responsiveness.',
      'variable':'CSS variables: --name: value; Use with var(--name). MO OS uses them for consistent theming.',
      'function':'A function is reusable code. JS: function greet(name) { return "Hello " + name; }',
      'array':'An array stores multiple values. JS: let arr = [1, 2, 3]; Methods: push, pop, map, filter, forEach.',
      'object':'Objects store key-value pairs. JS: let user = {name: "Mo", age: 18}; Access: user.name or user["name"].',
      'loop':'Loops repeat code. JS: for(let i=0; i<5; i++) { ... } or arr.forEach(item => { ... }).',
      'string':'Text in programming. JS: "Hello World".length gives 11. Methods: toUpperCase, split, includes, replace.',
      'number':'Numeric values. JS: 42, 3.14, -7. Methods: toFixed(2), Math.round, Math.floor.',
      'boolean':'True or false values. Used in conditions: if(x > 5) { ... }.',
      'condition':'if/else statements control flow. Example: if(score > 100) { win(); } else { try(); }.',
      'dom':'Document Object Model. JS way to access HTML. Methods: getElementById, querySelector, addEventListener.',
      'event':'User actions: click, input, keydown, submit. Listen with: element.addEventListener("click", fn).',
      'local storage':'Browser storage that persists. MO OS uses it for notes, projects, files, wallpaper. setItem/getItem.',
      'json':'JSON.stringify(obj) converts to string. JSON.parse(str) converts back. Used for localStorage.',
      'fetch':'Fetch API gets data from URLs. fetch("url").then(r => r.json()).then(data => { ... }).',
      'promise':'An object representing future value. fetch returns a promise. Use .then() or async/await.',
      'async':'async/await makes async code readable. async function getData() { let r = await fetch(url); }',
      'npm':'Node Package Manager. Install packages: npm install package-name. package.json tracks dependencies.',
      'framework vs library':'A library you call. A framework calls you. React is a library; Angular is a framework.',
      'desktop':'MO OS desktop has wallpaper, top bar with clock, desktop icons, and a floating dock.',
      'window':'Windows can be dragged, minimized, maximized, closed. Multiple windows layer on top of each other.',
      'settings':'Settings > Appearance has 5 wallpapers. System section shows version and info.',
      'keyboard shortcut':'Ctrl+K opens Command Palette. Escape closes overlays.',
      'game':'The Dino game is in the Browser app. Press SPACE to jump, avoid cacti, and beat your high score!',
      'coffee':'Check the Terminal — type "coffee" to see your coffee status.',
      'who are you':'I am MO AI, built into MO OS Browser. I answer questions and help with coding.',
      'hack club':'Hack Club is a global community of teen coding clubs. MO OS was built for Hack Club Stardance.',
      'stardance':'Stardance is a Hack Club event. MO OS was created as a project for it.',
      'mo digital':'MO Digital is the creative identity behind MO OS. Focused on web development and design.',
      'brand':'MO OS brand: dark graphite, warm off-white, copper accent. Editorial and minimal.',
      'color scheme':'Dark graphite (#1c1c1e) + warm off-white (#f0ebe3) + copper accent (#cc8844).',
      'font':'MO OS uses Inter (display) and JetBrains Mono (code/labels).',
      'icon':'MO OS uses minimal Unicode/emoji icons. Clean and editorial.',
      'notification':'Notifications slide in from the top-right when you open apps or take actions.',
      'save':'MO OS auto-saves notes, projects, files, and wallpaper to localStorage.',
      'localStorage':'Browser feature for persistent data. MO OS uses it for notes, projects, files, folders, wallpaper.',
      'open source':'MO OS is built with open web standards: HTML, CSS, JavaScript. No frameworks.',
      'no framework':'MO OS is pure vanilla HTML/CSS/JS. No React, Vue, or jQuery. Just clean code.',
      'security':'MO OS runs entirely in your browser. No data is sent to any server.',
      'privacy':'All data stays in your browser localStorage. Nothing is uploaded anywhere.',
      'future':'Possible features: more apps, themes, multiplayer, real AI integration, plugin system.',
      'improve':'You can contribute to MO OS by adding new apps, improving existing ones, or enhancing the design.',
      'tutorial':'Open the Terminal and type "help" for available commands. Ctrl+K opens search.',
      'documentation':'MO OS docs are built into the system. Use Terminal commands and explore each app.',
      'welcome':'Welcome to MO OS! A calm workspace for creators. Explore the apps in the dock.',
      'good morning':'Good morning! Ready to build something today?',
      'good afternoon':'Good afternoon! What are you working on?',
      'good evening':'Good evening! Late night coding session?',
      'joke':'Why do programmers prefer dark mode? Because light attracts bugs! \uD83E\uDD23',
      'fun fact':'MO OS is built entirely in a single HTML file. No build tools, no server, just one file.',
      'motivation':'Every expert was once a beginner. Keep building, keep learning. You are doing great.',
      'advice':'Build things you care about. The best projects come from solving your own problems.',
      'version':'MO OS is at version 01.0. Check Settings > System for details.',
      'learn':'Start with HTML basics, then CSS, then JavaScript. Build small projects. MO OS is a great example of what you can create.',
      'challenge':'Try building: a pomodoro timer, a markdown editor, a kanban board, or a drawing app.',
      'secret':'Try typing "sudo mo" in the Terminal. Or "coffee" for a status update.',
      'music player':'MO OS has a Music app with a step sequencer. Open it from the dock or type "music" in Terminal.',
      'maps':'MO OS has a Maps app with Google Maps integration. You can search locations and get directions.',
      'editor':'MO OS has a VS Code-like editor with file explorer, tabs, line numbers. Open from dock or type "code" in Terminal.',
      'sleep':'Rest is important. But one more commit before bed won\'t hurt...',
      'create':'Create with intention. MO OS design: every element is placed, not generated.',
      'build':'Build things. MO OS was built for Hack Club Stardance. What will you build?',
      'ship':'Ship your work. Done is better than perfect. MO OS 01.0 is shipped and working.',
      'code life':'Coding is a superpower. You can build anything you imagine. Keep going.'
    };
    var browserState={tabs:[],activeTab:-1};

    function browserHTML(){
      var wifiOn=getStore('mo-wifi',true);
      if(!wifiOn)return '<div class="browser-layout"><div class="browser-bar"><input type="text" value="" placeholder="No connection..." id="browser-url" disabled></div><div class="browser-content" style="display:flex;align-items:center;justify-content:center"><div class="wifi-off-overlay" style="position:relative"><div class="wifi-icon">&#128246;</div><div class="wifi-text">NO INTERNET CONNECTION</div><div class="wifi-sub">Turn on WiFi in Settings to browse</div></div></div></div>';
      return '<div class="browser-layout">'+
        '<div class="browser-tabs" id="browser-tabs">'+
          '<div class="browser-tab active" data-btab="0"><span class="bt-title">New Tab</span><span class="bt-close" data-bclose="0">&times;</span></div>'+
          '<div class="browser-tab-add" id="browser-tab-add">+</div>'+
        '</div>'+
        '<div class="browser-nav">'+
          '<button class="browser-nav-btn" id="br-back" title="Back">&#9664;</button>'+
          '<button class="browser-nav-btn" id="br-forward" title="Forward">&#9654;</button>'+
          '<button class="browser-nav-btn" id="br-reload" title="Reload">&#8635;</button>'+
          '<button class="browser-nav-btn" id="br-home" title="Home">&#8962;</button>'+
          '<div class="browser-url-bar">'+
            '<span class="browser-lock" id="br-lock">&#128274;</span>'+
            '<input type="text" value="" placeholder="Search Google or type URL..." id="browser-url" autocomplete="off">'+
            '<div class="browser-loading" id="br-loading"></div>'+
          '</div>'+
          '<button class="browser-nav-btn browser-ai-btn" id="br-ai" title="AI Assistant">&#129302;</button>'+
        '</div>'+
        '<div class="browser-content" id="browser-content">'+
          '<iframe id="browser-frame" src="https://www.google.com" allow="geolocation" style="width:100%;height:100%;border:none;background:#fff"></iframe>'+
        '</div>'+
        '<div class="browser-ai-panel" id="browser-ai-panel">'+
          '<div class="browser-ai-header"><span>MO AI ASSISTANT</span><span class="browser-ai-close" id="br-ai-close">&times;</span></div>'+
          '<div class="browser-ai-chat" id="br-ai-chat"></div>'+
          '<div class="browser-ai-input-row"><input type="text" id="br-ai-input" placeholder="Ask me anything..."><button id="br-ai-send" class="mo-btn">SEND</button></div>'+
        '</div>'+
      '</div>';
    }

    function setupBrowser(){
      var win=openWindows['browser'];if(!win)return;
      var urlInput=win.querySelector('#browser-url'),frame=win.querySelector('#browser-frame');
      var backBtn=win.querySelector('#br-back'),fwdBtn=win.querySelector('#br-forward');
      var reloadBtn=win.querySelector('#br-reload'),homeBtn=win.querySelector('#br-home');
      var lockIcon=win.querySelector('#br-lock'),loadingEl=win.querySelector('#br-loading');
      var tabsEl=win.querySelector('#browser-tabs'),addTabBtn=win.querySelector('#browser-tab-add');
      var aiBtn=win.querySelector('#br-ai'),aiPanel=win.querySelector('#browser-ai-panel');
      var aiClose=win.querySelector('#br-ai-close'),aiChat=win.querySelector('#br-ai-chat');
      var aiInput=win.querySelector('#br-ai-input'),aiSend=win.querySelector('#br-ai-send');
      if(!urlInput||!frame)return;

      var expectedUrl='';
      var currentTab=0;
      var tabs=[{url:'https://www.google.com',title:'New Tab',history:[],historyIdx:-1}];

      function updateTabs(){
        var tabsHTML='';
        tabs.forEach(function(t,i){
          tabsHTML+='<div class="browser-tab'+(i===currentTab?' active':'')+'" data-btab="'+i+'"><span class="bt-title">'+t.title+'</span><span class="bt-close" data-bclose="'+i+'">&times;</span></div>';
        });
        tabsHTML+='<div class="browser-tab-add" id="browser-tab-add">+</div>';
        tabsEl.innerHTML=tabsHTML;
        tabsEl.querySelector('#browser-tab-add').addEventListener('click',addNewTab);
        tabsEl.querySelectorAll('.browser-tab').forEach(function(tab){
          tab.addEventListener('click',function(e){
            if(e.target.classList.contains('bt-close'))return;
            switchTab(parseInt(tab.getAttribute('data-btab')));
          });
        });
        tabsEl.querySelectorAll('.bt-close').forEach(function(btn){
          btn.addEventListener('click',function(e){
            e.stopPropagation();
            closeTab(parseInt(btn.getAttribute('data-bclose')));
          });
        });
      }

      function addNewTab(){
        tabs.push({url:'https://www.google.com',title:'New Tab',history:[],historyIdx:-1});
        switchTab(tabs.length-1);
      }

      function switchTab(idx){
        if(idx<0||idx>=tabs.length)return;
        tabs[currentTab].url=frame.src;
        tabs[currentTab].title=urlInput.value||'New Tab';
        currentTab=idx;
        expectedUrl=tabs[idx].url;
        frame.src=tabs[idx].url;
        urlInput.value=tabs[idx].url==='https://www.google.com'?'':tabs[idx].url;
        updateTabs();
        updateNavButtons();
      }

      function closeTab(idx){
        if(tabs.length<=1)return;
        tabs.splice(idx,1);
        if(currentTab>=tabs.length)currentTab=tabs.length-1;
        expectedUrl=tabs[currentTab].url;
        frame.src=tabs[currentTab].url;
        urlInput.value=tabs[currentTab].url==='https://www.google.com'?'':tabs[currentTab].url;
        updateTabs();
        updateNavButtons();
      }

      function navigateTo(url){
        if(!url)return;
        if(url.indexOf('http')===0){}
        else if(url.indexOf('www.')===0){url='https://'+url;}
        else{url='https://www.google.com/search?q='+encodeURIComponent(url);}
        tabs[currentTab].history=tabs[currentTab].history.slice(0,tabs[currentTab].historyIdx+1);
        tabs[currentTab].history.push(url);
        tabs[currentTab].historyIdx=tabs[currentTab].history.length-1;
        expectedUrl=url;
        frame.src=url;
        urlInput.value=url;
        loadingEl.classList.add('active');
        updateNavButtons();
      }

      function goBack(){
        var tab=tabs[currentTab];
        if(tab.historyIdx<=0)return;
        tab.historyIdx--;
        var url=tab.history[tab.historyIdx];
        expectedUrl=url;
        frame.src=url;
        urlInput.value=url;
        updateNavButtons();
      }

      function goForward(){
        var tab=tabs[currentTab];
        if(tab.historyIdx>=tab.history.length-1)return;
        tab.historyIdx++;
        var url=tab.history[tab.historyIdx];
        expectedUrl=url;
        frame.src=url;
        urlInput.value=url;
        updateNavButtons();
      }

      function goHome(){
        navigateTo('https://www.google.com');
      }

      function updateNavButtons(){
        var tab=tabs[currentTab];
        backBtn.style.opacity=tab.historyIdx>0?'1':'0.3';
        fwdBtn.style.opacity=tab.historyIdx<tab.history.length-1?'1':'0.3';
      }

      function updateLockIcon(){
        var url=frame.src||'';
        if(url.indexOf('https://')===0){lockIcon.innerHTML='&#128274;';lockIcon.style.color='';}
        else if(url.indexOf('http://')===0){lockIcon.innerHTML='&#128275;';lockIcon.style.color='#ff5f57';}
        else{lockIcon.innerHTML='&#128274;';lockIcon.style.color='';}
      }

      urlInput.addEventListener('keydown',function(e){
        if(e.key==='Enter'){
          var q=urlInput.value.trim();
          if(!q)return;
          navigateTo(q);
        }
      });
      urlInput.addEventListener('focus',function(){urlInput.select();});

      backBtn.addEventListener('click',goBack);
      fwdBtn.addEventListener('click',goForward);
      reloadBtn.addEventListener('click',function(){
        loadingEl.classList.add('active');
        expectedUrl=frame.src;
        frame.src=frame.src;
      });
      homeBtn.addEventListener('click',goHome);

      frame.addEventListener('load',function(){
        loadingEl.classList.remove('active');
        updateLockIcon();
        var currentUrl=frame.src||'';
        try{tabs[currentTab].title=frame.contentDocument.title||'';}catch(e){
          var p=currentUrl.split('/');tabs[currentTab].title=p[2]||currentUrl;
        }
        if(currentUrl&&currentUrl!=='about:blank'){
          urlInput.value=currentUrl;
          tabs[currentTab].url=currentUrl;
          if(currentUrl!==expectedUrl){
            var tab=tabs[currentTab];
            tab.history=tab.history.slice(0,tab.historyIdx+1);
            if(tab.history.length===0||tab.history[tab.history.length-1]!==currentUrl){
              tab.history.push(currentUrl);
              tab.historyIdx=tab.history.length-1;
            }
          }
          expectedUrl='';
        }
        updateTabs();
        updateNavButtons();
      });

      if(aiBtn){
        aiBtn.addEventListener('click',function(){aiPanel.classList.toggle('open');});
        aiClose.addEventListener('click',function(){aiPanel.classList.remove('open');});
        function sendAiMsg(){
          var msg=aiInput.value.trim();if(!msg)return;
          aiInput.value='';
          var userDiv=document.createElement('div');userDiv.className='ai-msg user';userDiv.textContent=msg;aiChat.appendChild(userDiv);
          var resp=lookupAI(msg);
          var aiDiv=document.createElement('div');aiDiv.className='ai-msg ai';aiDiv.textContent=resp;aiChat.appendChild(aiDiv);
          aiChat.scrollTop=aiChat.scrollHeight;
        }
        aiSend.addEventListener('click',sendAiMsg);
        aiInput.addEventListener('keydown',function(e){if(e.key==='Enter')sendAiMsg();});
      }

      navigateTo('https://www.google.com');
      updateTabs();
      updateNavButtons();
    }

    function lookupAI(msg){
      var q=msg.toLowerCase().trim();
      var keys=Object.keys(aiDictionary);
      for(var i=0;i<keys.length;i++){
        if(q===keys[i]||q.indexOf(keys[i])>-1||keys[i].indexOf(q)>-1)return aiDictionary[keys[i]];
      }
      var bestScore=0,bestMatch='';
      keys.forEach(function(k){
        var words=k.split(' ');
        var score=0;
        words.forEach(function(w){if(q.indexOf(w)>-1)score++;});
        if(score>bestScore){bestScore=score;bestMatch=k;}
      });
      if(bestScore>0&&aiDictionary[bestMatch])return aiDictionary[bestMatch];
      return 'I can help with coding, design, MO OS features, and tech concepts. Try asking about HTML, CSS, JavaScript, or type "what can you do" for a full list.';
    }

    /* ── DINO GAME ── */
    function openDinoGame(){
      var html='<div class="dino-wrap"><div class="dino-header">DINO RUNNER</div><canvas id="dino-canvas" width="480" height="160"></canvas><div class="dino-score" id="dino-score">PRESS START TO PLAY</div><div class="dino-info">SPACE or CLICK to jump</div><button class="mo-btn dino-start" id="dino-start">START</button></div>';
      createWindow('dino','DINO GAME',520,340,html);
      setTimeout(function(){
        var win=openWindows['dino'];if(!win)return;
        var canvas=win.querySelector('#dino-canvas');
        if(!canvas)return;
        var ctx=canvas.getContext('2d');
        var scoreEl=win.querySelector('#dino-score');
        var startBtn=win.querySelector('#dino-start');

        var state='idle'; // idle, running, over
        var score=0;
        var dino={x:50,y:120,w:18,h:22,vy:0};
        var ground=125;
        var obstacles=[];
        var spawnTimer=0;
        var animId=null;
        var cloudX=[160,300,420];

        function drawBg(){
          ctx.fillStyle='#0e0e10';
          ctx.fillRect(0,0,480,160);
          ctx.fillStyle='rgba(240,235,227,0.03)';
          for(var i=0;i<cloudX.length;i++){
            ctx.fillRect(cloudX[i],15+i*8,30+i*10,6);
            cloudX[i]-=0.3;
            if(cloudX[i]<-60) cloudX[i]=500+Math.random()*60;
          }
          ctx.fillStyle='rgba(240,235,227,0.12)';
          ctx.fillRect(0,ground+2,480,1);
        }

        function drawDino(){
          var dx=dino.x,dy=dino.y,dw=dino.w,dh=dino.h;
          // body
          ctx.fillStyle='#cc8844';
          ctx.fillRect(dx,dy-dh,dw,dh);
          // head bump
          ctx.fillRect(dx-4,dy-dh-6,dw+8,6);
          // eyes
          ctx.fillStyle='#0e0e10';
          ctx.fillRect(dx+4,dy-dh-4,3,3);
          ctx.fillRect(dx+dw-7,dy-dh-4,3,3);
          // mouth
          ctx.fillRect(dx-2,dy-dh+6,dw+4,2);
          // legs
          if(state!=='running'||Math.floor(score/8)%2===0){
            ctx.fillStyle='#cc8844';
            ctx.fillRect(dx+2,dy,4,5);
            ctx.fillRect(dx+dw-6,dy,4,5);
          }else{
            ctx.fillStyle='#cc8844';
            ctx.fillRect(dx+5,dy,4,5);
            ctx.fillRect(dx+dw-9,dy,4,5);
          }
        }

        function drawObstacles(){
          for(var i=0;i<obstacles.length;i++){
            var o=obstacles[i];
            ctx.fillStyle='rgba(204,100,68,0.85)';
            ctx.fillRect(o.x,ground-o.h,o.w,o.h);
            ctx.fillRect(o.x+2,ground-o.h-6,o.w-4,6);
            ctx.fillRect(o.x+o.w/2-2,ground-o.h-10,4,4);
          }
        }

        function drawScore(){
          ctx.fillStyle='rgba(240,235,227,0.15)';
          ctx.fillRect(480-80,8,72,18);
          ctx.fillStyle='rgba(204,136,68,0.8)';
          ctx.font='11px JetBrains Mono, monospace';
          ctx.textAlign='right';
          ctx.fillText(String(score).padStart(5,'0'),480-14,21);
          ctx.textAlign='left';
        }

        function spawnObstacle(){
          var w=8+Math.floor(Math.random()*14);
          var h=14+Math.floor(Math.random()*12);
          obstacles.push({x:490,w:w,h:h});
        }

        function checkCollision(){
          for(var i=0;i<obstacles.length;i++){
            var o=obstacles[i];
            var dx=dino.x,dy=dino.y-dino.h,dw=dino.w,dh=dino.h;
            var ox=o.x,oy=ground-o.h,ow=o.w,oh=o.h;
            if(dx<ox+ow&&dx+dw>ox&&dy<oy+oh&&dy+dh>oy) return true;
          }
          return false;
        }

        function tick(){
          if(state!=='running') return;

          // dino physics
          dino.vy+=0.55;
          dino.y+=dino.vy;
          if(dino.y>=ground){dino.y=ground;dino.vy=0;}

          // obstacles
          spawnTimer++;
          var gap=Math.max(45,80-M.floor(score/4));
          if(spawnTimer>gap){spawnObstacle();spawnTimer=0;}
          for(var i=obstacles.length-1;i>=0;i--){
            obstacles[i].x-=3;
            if(obstacles[i].x<-30) obstacles.splice(i,1);
          }

          // collision
          if(checkCollision()){
            state='over';
            if(animId) cancelAnimationFrame(animId);
            startBtn.style.display='';
            startBtn.textContent='RESTART';
            scoreEl.textContent='GAME OVER  \u2014  SCORE: '+score;
            return;
          }

          score++;
          drawBg();drawObstacles();drawDino();drawScore();
          animId=requestAnimationFrame(tick);
        }

        function startGame(){
          state='running';
          score=0;
          dino.y=ground;dino.vy=0;
          obstacles=[];
          spawnTimer=0;
          startBtn.style.display='none';
          scoreEl.textContent='';
          if(animId) cancelAnimationFrame(animId);
          drawBg();drawDino();drawScore();
          animId=requestAnimationFrame(tick);
        }

        function jump(){
          if(state==='running'&&dino.y>=ground){dino.vy=-9.5;}
          if(state==='idle') startGame();
        }

        startBtn.onclick=function(){startGame();};

        canvas.onclick=function(){jump();};

        var keyFn=function(e){
          if(e.code==='Space'){
            e.preventDefault();
            if(state==='over'){startGame();}
            else{jump();}
          }
        };
        document.addEventListener('keydown',keyFn);

        // draw initial frame
        drawBg();
        drawDino();
        scoreEl.textContent='PRESS START TO PLAY';

        win._dinoCleanup=function(){
          document.removeEventListener('keydown',keyFn);
          if(animId) cancelAnimationFrame(animId);
        };
      },60);
    }

    /* ══════════════════════════════════════
       APP: CALCULATOR
       ══════════════════════════════════════ */
    function calculatorHTML(){
      return '<div class="calc-body"><div class="calc-display"><div class="calc-expr" id="calc-expr"></div><div class="calc-result" id="calc-result">0</div></div><div class="calc-grid">'+
        '<button class="calc-btn clear" data-val="C">C</button><button class="calc-btn op" data-val="(">(</button><button class="calc-btn op" data-val=")">)</button><button class="calc-btn op" data-val="/">&divide;</button>'+
        '<button class="calc-btn" data-val="7">7</button><button class="calc-btn" data-val="8">8</button><button class="calc-btn" data-val="9">9</button><button class="calc-btn op" data-val="*">&times;</button>'+
        '<button class="calc-btn" data-val="4">4</button><button class="calc-btn" data-val="5">5</button><button class="calc-btn" data-val="6">6</button><button class="calc-btn op" data-val="-">&minus;</button>'+
        '<button class="calc-btn" data-val="1">1</button><button class="calc-btn" data-val="2">2</button><button class="calc-btn" data-val="3">3</button><button class="calc-btn op" data-val="+">+</button>'+
        '<button class="calc-btn" data-val="00">00</button><button class="calc-btn" data-val="0">0</button><button class="calc-btn" data-val=".">.</button><button class="calc-btn eq" data-val="=">=</button>'+
      '</div></div>';
    }
    function setupCalculator(){
      var win=openWindows['calculator'];if(!win)return;
      var exprEl=win.querySelector('#calc-expr'),resultEl=win.querySelector('#calc-result');
      var expr='',lastWasResult=false;
      win.querySelector('.calc-grid').addEventListener('click',function(e){
        var btn=e.target.closest('.calc-btn');if(!btn)return;
        var val=btn.getAttribute('data-val');
        if(val==='C'){expr='';exprEl.textContent='';resultEl.textContent='0';lastWasResult=false;return;}
        if(val==='='){try{var r=Function('"use strict";return ('+expr+')')();resultEl.textContent=Number.isFinite(r)?Math.round(r*1e10)/1e10:'Error';expr=String(r);exprEl.textContent=expr;lastWasResult=true;}catch(e){resultEl.textContent='Error';lastWasResult=true;}return;}
        if(lastWasResult&&!isNaN(val)){expr='';exprEl.textContent='';lastWasResult=false;}
        lastWasResult=false;expr+=val;exprEl.textContent=expr;
      });
    }

    /* ══════════════════════════════════════
       APP: CALENDAR
       ══════════════════════════════════════ */
    function calendarHTML(){
      return '<div class="cal-body"><div class="cal-header"><h3 id="cal-month-year"></h3><div class="cal-nav"><button id="cal-prev">&larr;</button><button id="cal-today">TODAY</button><button id="cal-next">&rarr;</button></div></div><div class="cal-weekdays"><div>SUN</div><div>MON</div><div>TUE</div><div>WED</div><div>THU</div><div>FRI</div><div>SAT</div></div><div class="cal-days" id="cal-days"></div></div>';
    }
    var calViewDate=new Date();
    function setupCalendar(){
      var win=openWindows['calendar'];if(!win)return;
      var daysEl=win.querySelector('#cal-days'),monthEl=win.querySelector('#cal-month-year');
      function renderCal(){
        var year=calViewDate.getFullYear(),month=calViewDate.getMonth();
        var monthNames=['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];
        monthEl.textContent=monthNames[month]+' '+year;
        var firstDay=new Date(year,month,1).getDay(),daysInMonth=new Date(year,month+1,0).getDate();
        var today=new Date(),html='';
        for(var i=0;i<firstDay;i++) html+='<div class="cal-day empty"></div>';
        for(var d=1;d<=daysInMonth;d++){
          var isToday=d===today.getDate()&&month===today.getMonth()&&year===today.getFullYear();
          html+='<div class="cal-day'+(isToday?' today':'')+'">'+d+'</div>';
        }
        daysEl.innerHTML=html;
      }
      win.querySelector('#cal-prev').addEventListener('click',function(){calViewDate.setMonth(calViewDate.getMonth()-1);renderCal();});
      win.querySelector('#cal-next').addEventListener('click',function(){calViewDate.setMonth(calViewDate.getMonth()+1);renderCal();});
      win.querySelector('#cal-today').addEventListener('click',function(){calViewDate=new Date();renderCal();});
      renderCal();
    }

    /* ══════════════════════════════════════
       APP: EDITOR (VS Code-like)
       ══════════════════════════════════════ */
    var editorFiles=[
      {name:'index.html',lang:'html',content:'<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>My Project</title>\n</head>\n<body>\n  \n</body>\n</html>'},
      {name:'readme.md',lang:'md',content:'# MO OS\n\nA calm, editorial operating system for creators.\n\n## About\n\nMO OS was created from scratch using HTML, CSS, and a bit of JavaScript.\nAI was used only to assist with some of the JavaScript development.\nThe concept, design, features, and overall direction were created and put together by me.\n\n## Development Time: ~5.5 hours\n\n- **1.5 hr** \u2014 Planning & compiling\n- **3 hr** \u2014 Coding & building\n- **1 hr** \u2014 Testing, fixing & polishing\n\n## Features\n\n- Boot sequence\n- Desktop with wallpaper system\n- Window manager (drag, minimize, maximize, close)\n- Files & Folders\n- Terminal with commands\n- Notes with auto-save\n- Projects manager\n- Browser with search & AI assistant\n- Dino game\n- Calculator\n- Calendar\n- Code editor (VS Code-like)\n- Maps (Google Maps integration)\n- Music player with step sequencer\n- Command palette (Ctrl+K)\n- Settings with wallpaper picker\n\n## Built With\n\n- HTML\n- CSS\n- JavaScript\n- No frameworks'}
    ];
    var editorCurrentFile=0;

    function editorHTML(){
      var tabs='',explorer='';
      editorFiles.forEach(function(f,i){
        var icon=f.lang==='html'?'&#128196;':f.lang==='css'?'&#127912;':f.lang==='js'?'&#9889;':f.lang==='json'?'&#128196;':'&#128196;';
        tabs+='<div class="editor-tab'+(i===editorCurrentFile?' active':'')+'" data-etab="'+i+'"><span>'+f.name+'</span><span class="et-close" data-eclose="'+i+'">&times;</span></div>';
        explorer+='<div class="ee-item'+(i===editorCurrentFile?' active':'')+'" data-eopen="'+i+'"><span class="ee-icon">'+icon+'</span><span>'+f.name+'</span></div>';
      });
      var lines='';
      var content=editorFiles[editorCurrentFile]?editorFiles[editorCurrentFile].content:'';
      var lineCount=content.split('\n').length;
      for(var i=1;i<=lineCount;i++) lines+='<div>'+i+'</div>';
      return '<div class="editor-layout"><div class="editor-tabs" id="editor-tabs">'+tabs+'</div><div class="editor-body"><div class="editor-sidebar"><div class="esb-btn active" title="Explorer">&#9776;</div><div class="esb-btn" title="Search">&#128269;</div><div class="esb-btn" title="Git">&#128025;</div><div class="esb-btn esb-btn-bottom" title="Settings">&#9881;</div></div><div class="editor-panel"><div class="editor-explorer" id="editor-explorer"><div class="ee-header">EXPLORER</div>'+explorer+'</div><div class="editor-main"><div class="editor-code-wrap"><div class="editor-lines" id="editor-lines">'+lines+'</div><textarea class="editor-textarea" id="editor-textarea" spellcheck="false">'+content+'</textarea></div><div class="editor-statusbar"><span>'+(editorFiles[editorCurrentFile]?editorFiles[editorCurrentFile].name:'')+' &mdash; '+editorFiles.length+' files</span><span>MO EDITOR v01.0</span></div></div></div></div></div>';
    }

    function setupEditor(){
      var win=openWindows['editor'];if(!win)return;
      var textarea=win.querySelector('#editor-textarea'),linesEl=win.querySelector('#editor-lines'),tabsEl=win.querySelector('#editor-tabs'),explorerEl=win.querySelector('#editor-explorer');

      function updateLines(){
        var content=textarea.value;var lineCount=content.split('\n').length;var html='';
        for(var i=1;i<=lineCount;i++) html+='<div>'+i+'</div>';
        linesEl.innerHTML=html;
      }
      function updateStatus(){
        var sb=win.querySelector('.editor-statusbar');
        if(sb) sb.querySelector('span').textContent=(editorFiles[editorCurrentFile]?editorFiles[editorCurrentFile].name:'')+' \u2014 '+editorFiles.length+' files';
      }
      function switchFile(idx){
        if(idx<0||idx>=editorFiles.length)return;
        editorFiles[editorCurrentFile].content=textarea.value;
        editorCurrentFile=idx;
        textarea.value=editorFiles[idx].content;
        updateLines();updateStatus();
        tabsEl.querySelectorAll('.editor-tab').forEach(function(t,i){t.classList.toggle('active',i===idx);});
        explorerEl.querySelectorAll('.ee-item').forEach(function(t,i){t.classList.toggle('active',i===idx);});
      }

      textarea.addEventListener('input',updateLines);
      textarea.addEventListener('scroll',function(){linesEl.scrollTop=textarea.scrollTop;});
      textarea.addEventListener('keydown',function(e){
        if(e.key==='Tab'){e.preventDefault();var s=textarea.selectionStart,end=textarea.selectionEnd;textarea.value=textarea.value.substring(0,s)+'  '+textarea.value.substring(end);textarea.selectionStart=textarea.selectionEnd=s+2;updateLines();}
      });

      tabsEl.addEventListener('click',function(e){
        var close=e.target.closest('[data-eclose]');
        if(close){
          var idx=parseInt(close.getAttribute('data-eclose'));
          if(editorFiles.length<=1)return;
          editorFiles.splice(idx,1);
          if(editorCurrentFile>=editorFiles.length)editorCurrentFile=editorFiles.length-1;
          textarea.value=editorFiles[editorCurrentFile].content;updateLines();updateStatus();
          var newTabs='';editorFiles.forEach(function(f,i){
            var icon=f.lang==='html'?'&#128196;':f.lang==='css'?'&#127912;':f.lang==='js'?'&#9889;':'&#128196;';
            newTabs+='<div class="editor-tab'+(i===editorCurrentFile?' active':'')+'" data-etab="'+i+'"><span>'+f.name+'</span><span class="et-close" data-eclose="'+i+'">&times;</span></div>';
          });tabsEl.innerHTML=newTabs;
          var newExp='<div class="ee-header">EXPLORER</div>';editorFiles.forEach(function(f,i){
            var icon=f.lang==='html'?'&#128196;':f.lang==='css'?'&#127912;':f.lang==='js'?'&#9889;':'&#128196;';
            newExp+='<div class="ee-item'+(i===editorCurrentFile?' active':'')+'" data-eopen="'+i+'"><span class="ee-icon">'+icon+'</span><span>'+f.name+'</span></div>';
          });explorerEl.innerHTML=newExp;
          return;
        }
        var tab=e.target.closest('[data-etab]');
        if(tab) switchFile(parseInt(tab.getAttribute('data-etab')));
      });

      explorerEl.addEventListener('click',function(e){
        var item=e.target.closest('[data-eopen]');
        if(item) switchFile(parseInt(item.getAttribute('data-eopen')));
      });
    }

    /* ══════════════════════════════════════
       APP: SETTINGS
       ══════════════════════════════════════ */
    function settingsHTML(){
      var wpId=localStorage.getItem('mo-wallpaper')||'wp-mo-grid';
      var wallpapers=[
        {id:'wp-mo-grid',name:'MO Grid',bg:'linear-gradient(135deg,#1a1d23,#222830)',pat:'linear-gradient(rgba(204,136,68,0.15) 1px,transparent 1px),linear-gradient(90deg,rgba(204,136,68,0.15) 1px,transparent 1px)',size:'16px 16px'},
        {id:'wp-ocean',name:'Ocean',bg:'linear-gradient(135deg,#0d1b2a,#1b3a5c)',pat:'',size:''},
        {id:'wp-dusk',name:'Dusk',bg:'linear-gradient(135deg,#1a1020,#3d1f5c)',pat:'',size:''},
        {id:'wp-ember',name:'Ember',bg:'linear-gradient(135deg,#1a1410,#5c3010)',pat:'',size:''},
        {id:'wp-slate',name:'Slate',bg:'linear-gradient(135deg,#1e2024,#2a2c30)',pat:'linear-gradient(rgba(240,235,227,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(240,235,227,0.06) 1px,transparent 1px)',size:'40px 40px'}
      ];
      var wpHTML='';wallpapers.forEach(function(w){
        var bg='background:'+w.bg;if(w.pat) bg+=';background-image:'+w.pat+';background-size:'+w.size;
        wpHTML+='<div class="wallpaper-opt'+(w.id===wpId?' active':'')+'" data-wp="'+w.id+'"><div style="width:100%;height:100%;'+bg+'"></div><div class="wp-label">'+w.name+'</div></div>';
      });
      var userName=getStore('mo-user-name','Developer');
      var userPw=getStore('mo-user-pw','');
      var wifiOn=getStore('mo-wifi',true);
      var alarmTime=getStore('mo-alarm','');
      var now=new Date();
      var timeStr=String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0');
      var dateStr=now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0')+'-'+String(now.getDate()).padStart(2,'0');
      return '<div class="settings-layout"><div class="settings-nav"><div class="sn-item active" data-stab="profile">Profile</div><div class="sn-item" data-stab="appearance">Appearance</div><div class="sn-item" data-stab="network">Network</div><div class="sn-item" data-stab="time">Time</div><div class="sn-item" data-stab="alarm">Alarm</div></div><div class="settings-panel"><h2>PROFILE</h2><div class="setting-section"><div class="setting-row"><span class="sr-label">Name</span><input class="sr-input" id="st-name" value="'+userName+'"></div><div class="setting-row"><span class="sr-label">Password</span><input class="sr-input" id="st-pw" type="password" value="'+userPw+'" placeholder="No password"></div><div class="setting-row"><span class="sr-label">Status</span><span class="sr-value">DEVELOPER</span></div><div style="margin-top:12px"><button class="mo-btn" id="st-save-profile">SAVE PROFILE</button></div></div><h2>APPEARANCE</h2><div class="setting-section"><div class="section-label">WALLPAPER</div><div class="wallpaper-grid" id="wp-grid">'+wpHTML+'</div></div><h2>NETWORK</h2><div class="setting-section"><div class="setting-row"><span class="sr-label">WiFi</span><div class="toggle-switch'+(wifiOn?' on':'')+'" id="st-wifi-toggle"><div class="toggle-knob"></div></div><span class="sr-value" id="st-wifi-status">'+(wifiOn?'ON':'OFF')+'</span></div></div><h2>TIME & DATE</h2><div class="setting-section"><div class="setting-row"><span class="sr-label">Time</span><input class="sr-input" id="st-time" type="time" value="'+timeStr+'"></div><div class="setting-row"><span class="sr-label">Date</span><input class="sr-input" id="st-date" type="date" value="'+dateStr+'"></div><div style="margin-top:12px"><button class="mo-btn" id="st-set-time">SET TIME</button></div><div class="setting-row" style="margin-top:8px"><span class="sr-label">Clock</span><span class="sr-value" id="st-live-clock">'+timeStr+'</span></div></div><h2>ALARM</h2><div class="setting-section"><div class="setting-row"><span class="sr-label">Alarm</span><input class="sr-input" id="st-alarm" type="time" value="'+alarmTime+'"></div><div class="setting-row"><span class="sr-label">Status</span><span class="sr-value" id="st-alarm-status">'+(alarmTime?'SET FOR '+alarmTime:'OFF')+'</span></div><div style="margin-top:12px"><button class="mo-btn" id="st-set-alarm">SET ALARM</button> <button class="mo-btn" id="st-clear-alarm">CLEAR</button></div></div></div></div>';
    }
    function setupSettings(){
      var win=openWindows['settings'];if(!win)return;var body=win.querySelector('.win-body');
      // tab switching
      body.addEventListener('click',function(e){
        var opt=e.target.closest('.wallpaper-opt');if(opt){
          var wpId=opt.getAttribute('data-wp');document.querySelectorAll('.wallpaper').forEach(function(w){w.style.display='none'});document.getElementById(wpId).style.display='';
          body.querySelectorAll('.wallpaper-opt').forEach(function(o){o.classList.remove('active')});opt.classList.add('active');
          localStorage.setItem('mo-wallpaper',wpId);showNotification('Wallpaper changed.');
        }
        var tab=e.target.closest('[data-stab]');
        if(tab){
          body.querySelectorAll('.sn-item').forEach(function(t){t.classList.remove('active')});tab.classList.add('active');
          var stab=tab.getAttribute('data-stab');
          body.querySelectorAll('.settings-panel h2').forEach(function(h){
            var next=h.nextElementSibling;
            if(!next||next.classList.contains('settings-panel'))return;
            var sectionText=h.textContent.toLowerCase();
            var match=(stab==='profile'&&sectionText.indexOf('profile')>-1)||(stab==='appearance'&&sectionText.indexOf('appearance')>-1)||(stab==='network'&&sectionText.indexOf('network')>-1)||(stab==='time'&&sectionText.indexOf('time')>-1)||(stab==='alarm'&&sectionText.indexOf('alarm')>-1);
            h.style.display=match?'':'none';
            while(next&&!next.classList.contains('settings-panel')&&next.tagName!=='H2'){next.style.display=match?'':'none';next=next.nextElementSibling;}
          });
        }
        // wifi toggle
        if(e.target.closest('#st-wifi-toggle')){
          var toggle=e.target.closest('#st-wifi-toggle');
          toggle.classList.toggle('on');
          var on=toggle.classList.contains('on');
          setStore('mo-wifi',on);
          body.querySelector('#st-wifi-status').textContent=on?'ON':'OFF';
          showNotification('WiFi turned '+(on?'ON':'OFF'));
        }
        // save profile
        if(e.target.id==='st-save-profile'){
          var name=(body.querySelector('#st-name')||{}).value||'Developer';
          var pw=(body.querySelector('#st-pw')||{}).value||'';
          setStore('mo-user-name',name);setStore('mo-user-pw',pw||null);
          showNotification('Profile saved: '+name);
        }
        // set time
        if(e.target.id==='st-set-time'){
          var timeVal=(body.querySelector('#st-time')||{}).value;
          var dateVal=(body.querySelector('#st-date')||{}).value;
          if(timeVal&&dateVal){
            var full=new Date(dateVal+'T'+timeVal+':00');
            showNotification('Time set to '+timeVal+' on '+dateVal);
          }
        }
        // set alarm
        if(e.target.id==='st-set-alarm'){
          var alarmVal=(body.querySelector('#st-alarm')||{}).value;
          if(alarmVal){setStore('mo-alarm',alarmVal);body.querySelector('#st-alarm-status').textContent='SET FOR '+alarmVal;showNotification('Alarm set for '+alarmVal);}
        }
        if(e.target.id==='st-clear-alarm'){
          localStorage.removeItem('mo-alarm');body.querySelector('#st-alarm').value='';body.querySelector('#st-alarm-status').textContent='OFF';showNotification('Alarm cleared.');
        }
      });
      // initial tab visibility
      var firstTab=body.querySelector('.sn-item.active');
      if(firstTab)firstTab.click();
      // live clock
      var liveClock=body.querySelector('#st-live-clock');
      if(liveClock){setInterval(function(){var n=new Date();liveClock.textContent=String(n.getHours()).padStart(2,'0')+':'+String(n.getMinutes()).padStart(2,'0')+':'+String(n.getSeconds()).padStart(2,'0');},1000);}
      // alarm check
      setInterval(function(){
        var alarm=getStore('mo-alarm',null);
        if(!alarm)return;
        var n=new Date();
        var now=String(n.getHours()).padStart(2,'0')+':'+String(n.getMinutes()).padStart(2,'0');
        if(now===alarm){showNotification('ALARM! WAKE UP!');try{var ctx=new(window.AudioContext||window.webkitAudioContext)();var o=ctx.createOscillator(),g=ctx.createGain();o.type='square';o.frequency.value=880;g.gain.setValueAtTime(0.3,ctx.currentTime);g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.5);o.connect(g);g.connect(ctx.destination);o.start();o.stop(ctx.currentTime+0.5);}catch(e){}}
      },10000);
      var saved=localStorage.getItem('mo-wallpaper')||'wp-mo-grid';document.querySelectorAll('.wallpaper').forEach(function(w){w.style.display='none'});document.getElementById(saved).style.display='';
    }

    /* ══════════════════════════════════════
       MAPS APP (with geolocation from parent)
       ══════════════════════════════════════ */
    function mapsHTML(){
      var wifiOn=getStore('mo-wifi',true);
      if(!wifiOn)return '<div class="maps-wrap" style="display:flex;align-items:center;justify-content:center"><div class="wifi-off-overlay" style="position:relative"><div class="wifi-icon">&#128246;</div><div class="wifi-text">NO INTERNET CONNECTION</div><div class="wifi-sub">Turn on WiFi in Settings to use Maps</div></div></div>';
      return '<div class="maps-wrap">'+
        '<div class="maps-bar">'+
          '<input id="maps-search" type="text" placeholder="Search location...">'+
          '<input id="maps-dest" type="text" placeholder="Destination (for directions)">'+
          '<button id="maps-go">GO</button>'+
          '<button id="maps-locate" class="maps-locate-btn" title="Use my location">&#128205; MY LOCATION</button>'+
          '<button id="maps-mode-toggle" class="maps-mode-btn" title="Toggle embed/full">&#128269; FULL</button>'+
        '</div>'+
        '<div class="maps-frame-wrap">'+
          '<iframe class="maps-frame" id="maps-frame" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d387193.3059353029!2d-74.25986432977598!3d40.69714941932609!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew%20York%2C%20NY!5e0!3m2!1sen!2sus!4v1699999999999!5m2!1sen!2sus" allow="geolocation" allowfullscreen loading="lazy"></iframe>'+
          '<iframe class="maps-frame maps-full-frame" id="maps-full-frame" style="display:none" allow="geolocation" allowfullscreen loading="lazy"></iframe>'+
        '</div>'+
        '<div class="maps-status" id="maps-status">Ready</div>'+
      '</div>';
    }
    function setupMaps(){
      var win=openWindows['maps'];if(!win)return;
      var input=win.querySelector('#maps-search'),dest=win.querySelector('#maps-dest');
      var goBtn=win.querySelector('#maps-go'),frame=win.querySelector('#maps-frame');
      var locateBtn=win.querySelector('#maps-locate'),modeBtn=win.querySelector('#maps-mode-toggle');
      var fullFrame=win.querySelector('#maps-full-frame'),statusEl=win.querySelector('#maps-status');
      var isFullMode=false;
      var currentCoords=null;

      function setStatus(msg){if(statusEl)statusEl.textContent=msg;}

      function search(){
        var q=input?input.value.trim():'';
        var d=dest?dest.value.trim():'';
        if(!q&&!d)return;
        setStatus('Searching...');
        if(isFullMode){
          if(d&&q){fullFrame.src='https://www.google.com/maps/dir/'+encodeURIComponent(q)+'/'+encodeURIComponent(d);}
          else if(d){fullFrame.src='https://www.google.com/maps/search/'+encodeURIComponent(d);}
          else{fullFrame.src='https://www.google.com/maps/search/'+encodeURIComponent(q);}
        }else{
          if(d&&q){frame.src='https://www.google.com/maps/dir/'+encodeURIComponent(q)+'/'+encodeURIComponent(d);}
          else if(d){frame.src='https://www.google.com/maps/search/'+encodeURIComponent(d);}
          else{frame.src='https://www.google.com/maps/search/'+encodeURIComponent(q);}
        }
      }

      function locateMe(){
        if(!navigator.geolocation){
          setStatus('Geolocation not supported');
          showNotification('Geolocation is not supported by your browser');
          return;
        }
        setStatus('Getting your location...');
        locateBtn.disabled=true;
        locateBtn.textContent='LOCATING...';
        navigator.geolocation.getCurrentPosition(
          function(pos){
            currentCoords={lat:pos.coords.latitude,lng:pos.coords.longitude};
            var embedUrl='https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d'+currentCoords.lng+'!3d'+currentCoords.lat+'!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjTCsDI0JzAwLjAiTiAiningJzAwLjAiVw!5e0!3m2!1sen!2sus';
            var fullUrl='https://www.google.com/maps/@'+currentCoords.lat+','+currentCoords.lng+',15z';
            if(isFullMode){fullFrame.src=fullUrl;}
            else{frame.src=embedUrl;}
            setStatus('Location found: '+currentCoords.lat.toFixed(4)+', '+currentCoords.lng.toFixed(4));
            locateBtn.disabled=false;
            locateBtn.textContent='MY LOCATION';
            showNotification('Location found');
          },
          function(err){
            setStatus('Location error: '+err.message);
            locateBtn.disabled=false;
            locateBtn.textContent='MY LOCATION';
            if(err.code===1){showNotification('Location permission denied. Enable it in browser settings.');}
            else if(err.code===2){showNotification('Location unavailable.');}
            else{showNotification('Location request timed out.');}
          },
          {enableHighAccuracy:true,timeout:10000,maximumAge:60000}
        );
      }

      function toggleMode(){
        isFullMode=!isFullMode;
        if(isFullMode){
          frame.style.display='none';
          fullFrame.style.display='';
          modeBtn.textContent='EMBED';
          if(currentCoords){
            fullFrame.src='https://www.google.com/maps/@'+currentCoords.lat+','+currentCoords.lng+',15z';
          }
          setStatus('Full mode - full Google Maps experience');
        }else{
          fullFrame.style.display='none';
          frame.style.display='';
          modeBtn.textContent='FULL';
          if(currentCoords){
            var embedUrl='https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d'+currentCoords.lng+'!3d'+currentCoords.lat+'!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjTCsDI0JzAwLjAiTiAiningJzAwLjAiVw!5e0!3m2!1sen!2sus';
            frame.src=embedUrl;
          }
          setStatus('Embed mode - limited iframe features');
        }
      }

      goBtn.addEventListener('click',search);
      if(input)input.addEventListener('keydown',function(e){if(e.key==='Enter')search();});
      if(dest)dest.addEventListener('keydown',function(e){if(e.key==='Enter')search();});
      if(locateBtn)locateBtn.addEventListener('click',locateMe);
      if(modeBtn)modeBtn.addEventListener('click',toggleMode);

      frame.addEventListener('load',function(){setStatus('Loaded');});
      if(fullFrame)fullFrame.addEventListener('load',function(){setStatus('Loaded');});
    }

    /* ══════════════════════════════════════
       MUSIC PLAYER + BUILDER
       ══════════════════════════════════════ */
    var NOTE_NAMES=['C4','D4','E4','F4','G4','A4','B4'];
    var NOTE_FREQS={C4:262,D4:294,E4:330,F4:349,G4:392,A4:440,B4:494};
    function defaultTracks(){
      return [
        {title:'Midnight Drive',artist:'MO',bpm:110,kick:[1,0,0,0,1,0,0,0],hat:[1,1,1,1,1,1,1,1],bass:[1,0,0,0,1,0,0,0],melody:[4,0,6,0,3,0,6,0]},
        {title:'Warm Signal',artist:'MO',bpm:90,kick:[1,0,0,0,0,0,1,0],hat:[0,1,0,1,0,1,0,1],bass:[1,0,0,1,0,0,1,0],melody:[5,0,0,3,0,0,6,0]},
        {title:'Grain',artist:'MO',bpm:120,kick:[1,0,1,0,1,0,1,0],hat:[1,0,1,0,1,0,1,0],bass:[1,0,1,0,0,1,0,1],melody:[4,3,0,5,0,3,4,0]},
        {title:'Copper Light',artist:'MO',bpm:85,kick:[1,0,0,0,0,0,1,0],hat:[0,0,1,0,0,0,1,0],bass:[1,0,0,0,0,1,0,0],melody:[1,0,5,0,4,0,0,5]},
        {title:'Soft Error',artist:'MO',bpm:100,kick:[1,0,0,1,0,0,1,0],hat:[1,1,0,1,1,0,1,1],bass:[1,0,0,1,0,0,0,1],melody:[0,6,0,4,0,6,0,0]},
        {title:'Slow Orbit',artist:'MO',bpm:75,kick:[1,0,0,0,0,0,0,0],hat:[0,0,1,0,0,1,0,0],bass:[1,0,0,0,1,0,0,0],melody:[2,0,0,4,0,0,6,0]}
      ];
    }
    function loadMusicTracks(){var s=getStore('mo-music-tracks',null);return s||defaultTracks();}
    function saveMusicTracks(){setStore('mo-music-tracks',musicTracks);}
    var musicTracks=loadMusicTracks();
    var musicState={playing:false,track:0,step:0,audioCtx:null,timer:null,elapsed:0,tab:'player',builderIdx:-1};

    function musicHTML(){
      var tracks='';
      musicTracks.forEach(function(t,i){
        tracks+='<div class="track'+(i===0?' active':'')+'" data-tidx="'+i+'"><span class="t-num">'+(i+1)+'</span><span class="t-title">'+t.title+'</span><span class="t-dur">'+Math.round(60/t.bpm*8*4)+'s</span><span class="t-del" data-del="'+i+'">&times;</span></div>';
      });
      var bars='';for(var i=0;i<16;i++)bars+='<div class="bar"></div>';
      var bRows=builderRows(-1);
      return '<div class="music-wrap"><div class="music-tabs"><div class="music-tab active" data-mtab="player">PLAYER</div><div class="music-tab" data-mtab="builder">BUILDER</div></div><div id="music-player-panel"><div class="music-art"><span class="music-icon">&#9835;</span><span class="music-art-label">MO RECORDS</span></div><div class="music-info"><div class="track-title">'+musicTracks[0].title+'</div><div class="track-artist">'+musicTracks[0].artist+'</div></div><div class="music-visualizer" id="music-vis">'+bars+'</div><div class="music-progress" id="music-prog"><div class="music-progress-fill" id="music-prog-fill"></div></div><div class="music-time"><span id="music-cur">0:00</span><span id="music-dur">0:00</span></div><div class="music-controls"><button id="music-prev">&#9664;</button><button class="play-btn" id="music-play">&#9654;</button><button id="music-next">&#9654;</button></div><div class="music-tracklist" id="music-list">'+tracks+'</div></div><div id="music-builder-panel" class="builder-panel">'+bRows+'</div></div>';
    }

    function builderRows(idx){
      var t=idx>=0?musicTracks[idx]:null;
      var kick=t?t.kick:[0,0,0,0,0,0,0,0];
      var hat=t?t.hat:[0,0,0,0,0,0,0,0];
      var bass=t?t.bass:[0,0,0,0,0,0,0,0];
      var melody=t?t.melody:[0,0,0,0,0,0,0,0];
      var bpm=t?t.bpm:100;
      var title=t?t.title:'';
      var html='<div class="builder-name"><label>NAME</label><input id="b-name" value="'+title+'" placeholder="Untitled"></div>';
      html+='<div class="builder-bpm"><label>BPM</label><input id="b-bpm" type="number" min="40" max="240" value="'+bpm+'"></div>';
      html+='<div class="builder-section-title">PATTERN (8 STEPS)</div>';
      html+='<div class="builder-row"><span class="br-label">KICK</span><div class="br-steps" id="b-kick">';
      for(var i=0;i<8;i++) html+='<div class="builder-step'+(kick[i]?' on':'')+'" data-ch="kick" data-s="'+i+'">'+(i+1)+'</div>';
      html+='</div></div>';
      html+='<div class="builder-row"><span class="br-label">HAT</span><div class="br-steps" id="b-hat">';
      for(var i=0;i<8;i++) html+='<div class="builder-step'+(hat[i]?' on':'')+'" data-ch="hat" data-s="'+i+'">'+(i+1)+'</div>';
      html+='</div></div>';
      html+='<div class="builder-row"><span class="br-label">BASS</span><div class="br-steps" id="b-bass">';
      for(var i=0;i<8;i++) html+='<div class="builder-step'+(bass[i]?' on':'')+'" data-ch="bass" data-s="'+i+'">'+(i+1)+'</div>';
      html+='</div></div>';
      html+='<div class="builder-section-title">MELODY</div>';
      html+='<div class="builder-row"><span class="br-label">NOTE</span><div class="br-steps" id="b-melody">';
      var noteLabels=['C','D','E','F','G','A','B'];
      for(var i=0;i<8;i++){
        var mVal=melody[i];
        html+='<div class="builder-note-btn'+(mVal?' on':'')+'" data-ch="melody" data-s="'+i+'" data-freq="'+mVal+'">'+(mVal?noteLabels[mVal]:'-')+'</div>';
      }
      html+='</div></div>';
      html+='<div class="builder-actions"><button class="ba-save" id="b-save">'+(idx>=0?'UPDATE':'SAVE NEW')+'</button><button id="b-play">PLAY</button><button id="b-clear">CLEAR</button></div>';
      return html;
    }

    function setupMusic(){
      var win=openWindows['music'];if(!win)return;
      var body=win.querySelector('.win-body');
      var playBtn=win.querySelector('#music-play'),prevBtn=win.querySelector('#music-prev'),nextBtn=win.querySelector('#music-next');
      var list=win.querySelector('#music-list');
      var titleEl=win.querySelector('.track-title'),artistEl=win.querySelector('.track-artist');
      var progFill=win.querySelector('#music-prog-fill'),curEl=win.querySelector('#music-cur'),durEl=win.querySelector('#music-dur');
      var bars=win.querySelectorAll('.bar');
      var progBar=win.querySelector('#music-prog');
      var playerPanel=win.querySelector('#music-player-panel');
      var builderPanel=win.querySelector('#music-builder-panel');
      var tabs=win.querySelectorAll('.music-tab');

      function initAudio(){if(!musicState.audioCtx) musicState.audioCtx=new(window.AudioContext||window.webkitAudioContext)();}

      function playSound(freq,type,dur,vol){
        initAudio();var ctx=musicState.audioCtx,now=ctx.currentTime;
        if(type==='kick'){var o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.setValueAtTime(150,now);o.frequency.exponentialRampToValueAtTime(30,now+0.12);g.gain.setValueAtTime(vol||0.7,now);g.gain.exponentialRampToValueAtTime(0.001,now+0.15);o.connect(g);g.connect(ctx.destination);o.start(now);o.stop(now+0.15);}
        else if(type==='hat'){var bufSize=ctx.sampleRate*0.05;var buf=ctx.createBuffer(1,bufSize,ctx.sampleRate);var data=buf.getChannelData(0);for(var i=0;i<bufSize;i++)data[i]=(Math.random()*2-1)*0.3;var s=ctx.createBufferSource();s.buffer=buf;var g=ctx.createGain();g.gain.setValueAtTime(0.15,now);g.gain.exponentialRampToValueAtTime(0.001,now+0.05);var f=ctx.createBiquadFilter();f.type='highpass';f.frequency.value=8000;s.connect(f);f.connect(g);g.connect(ctx.destination);s.start(now);s.stop(now+0.05);}
        else if(type==='bass'){var o=ctx.createOscillator(),g=ctx.createGain();o.type='triangle';o.frequency.value=freq;g.gain.setValueAtTime(0.25,now);g.gain.exponentialRampToValueAtTime(0.001,now+0.2);o.connect(g);g.connect(ctx.destination);o.start(now);o.stop(now+0.22);}
        else if(type==='melody'){var o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.value=freq;g.gain.setValueAtTime(0.12,now);g.gain.exponentialRampToValueAtTime(0.001,now+0.25);o.connect(g);g.connect(ctx.destination);o.start(now);o.stop(now+0.27);}
      }

      function playStep(){
        var t=musicTracks[musicState.track],s=musicState.step%8;
        if(t.kick[s]) playSound(0,'kick');
        if(t.hat[s]) playSound(0,'hat');
        if(t.bass[s]) playSound(NOTE_FREQS[NOTE_NAMES[t.bass[s]-1]]||NOTE_FREQS.C4,'bass');
        if(t.melody[s]) playSound(NOTE_FREQS[NOTE_NAMES[t.melody[s]-1]]||NOTE_FREQS.C4,'melody');
        bars.forEach(function(bar,i){var val=0;if(t.kick[i%8])val+=15;if(t.hat[i%8])val+=8;if(t.bass[i%8])val+=12;if(t.melody[i%8])val+=10;bar.style.height=Math.max(4,val+Math.random()*6)+'px';});
        // highlight builder step
        if(musicState.tab==='builder'){
          win.querySelectorAll('.builder-step[data-s="'+s+'"],.builder-note-btn[data-s="'+s+'"]').forEach(function(el){el.classList.add('playing-now');});
          setTimeout(function(){win.querySelectorAll('.playing-now').forEach(function(el){el.classList.remove('playing-now');});},150);
        }
      }

      function updateTrackInfo(){if(musicState.track>=musicTracks.length)return;titleEl.textContent=musicTracks[musicState.track].title;artistEl.textContent=musicTracks[musicState.track].artist;list.querySelectorAll('.track').forEach(function(t,i){t.classList.toggle('active',i===musicState.track);});durEl.textContent=Math.round(60/musicTracks[musicState.track].bpm*8*4)+'s';}

      function startPlayback(){
        initAudio();musicState.playing=true;playBtn.innerHTML='&#9646;&#9646;';
        var stepDur=60/musicTracks[musicState.track].bpm/2;
        musicState.timer=setInterval(function(){
          playStep();musicState.step++;musicState.elapsed+=stepDur;
          var total=60/musicTracks[musicState.track].bpm*8*4;
          if(total>0)progFill.style.width=Math.min(100,(musicState.elapsed/total)*100)+'%';
          var sec=Math.floor(musicState.elapsed);curEl.textContent=Math.floor(sec/60)+':'+String(sec%60).padStart(2,'0');
          if(musicState.elapsed>=total){stopPlayback();musicState.elapsed=0;musicState.step=0;progFill.style.width='0%';}
        },stepDur*1000);
      }

      function stopPlayback(){
        musicState.playing=false;if(playBtn)playBtn.innerHTML='&#9654;';clearInterval(musicState.timer);
        bars.forEach(function(b){b.style.height='4px';});
        win.querySelectorAll('.playing-now').forEach(function(el){el.classList.remove('playing-now');});
      }

      function playBuilder(){
        var idx=musicState.builderIdx;if(idx<0)return;
        stopPlayback();musicState.track=idx;musicState.step=0;musicState.elapsed=0;
        startPlayback();
      }

      function renderList(){
        var h='';musicTracks.forEach(function(t,i){h+='<div class="track'+(i===musicState.track?' active':'')+'" data-tidx="'+i+'"><span class="t-num">'+(i+1)+'</span><span class="t-title">'+t.title+'</span><span class="t-dur">'+Math.round(60/t.bpm*8*4)+'s</span><span class="t-del" data-del="'+i+'">&times;</span></div>';});
        list.innerHTML=h;
      }

      function renderBuilder(){
        var bRowsEl=builderPanel.querySelector('.builder-name')?builderPanel:null;
        builderPanel.innerHTML=builderRows(musicState.builderIdx);
      }

      // Tab switching
      tabs.forEach(function(tab){tab.addEventListener('click',function(){
        var mt=tab.getAttribute('data-mtab');
        musicState.tab=mt;
        tabs.forEach(function(t){t.classList.remove('active')});tab.classList.add('active');
        if(mt==='player'){playerPanel.style.display='';builderPanel.style.display='none';}
        else{playerPanel.style.display='none';builderPanel.style.display='';renderBuilder();}
      });});

      // Player controls
      playBtn.onclick=function(){if(musicState.playing)stopPlayback();else startPlayback();};
      nextBtn.onclick=function(){stopPlayback();musicState.track=(musicState.track+1)%musicTracks.length;musicState.step=0;musicState.elapsed=0;progFill.style.width='0%';curEl.textContent='0:00';updateTrackInfo();};
      prevBtn.onclick=function(){stopPlayback();musicState.track=(musicState.track-1+musicTracks.length)%musicTracks.length;musicState.step=0;musicState.elapsed=0;progFill.style.width='0%';curEl.textContent='0:00';updateTrackInfo();};
      list.addEventListener('click',function(e){
        var del=e.target.closest('.t-del');
        if(del){e.stopPropagation();var di=parseInt(del.getAttribute('data-del'));musicTracks.splice(di,1);saveMusicTracks();if(musicState.track>=musicTracks.length)musicState.track=0;renderList();updateTrackInfo();return;}
        var t=e.target.closest('.track');
        if(t){stopPlayback();musicState.track=parseInt(t.getAttribute('data-tidx'));musicState.step=0;musicState.elapsed=0;progFill.style.width='0%';curEl.textContent='0:00';updateTrackInfo();startPlayback();}
      });
      progBar.addEventListener('click',function(e){var rect=progBar.getBoundingClientRect();var pct=(e.clientX-rect.left)/rect.width;var total=60/musicTracks[musicState.track].bpm*8*4;musicState.elapsed=pct*total;musicState.step=Math.floor(pct*8);});

      // Builder events
      builderPanel.addEventListener('click',function(e){
        var stepBtn=e.target.closest('.builder-step');
        if(stepBtn){
          var ch=stepBtn.getAttribute('data-ch'),si=parseInt(stepBtn.getAttribute('data-s'));
          stepBtn.classList.toggle('on');
          // preview sound
          if(ch==='kick')playSound(0,'kick');
          else if(ch==='hat')playSound(0,'hat');
          else if(ch==='bass')playSound(NOTE_FREQS.C4,'bass');
          return;
        }
        var noteBtn=e.target.closest('.builder-note-btn');
        if(noteBtn){
          var si=parseInt(noteBtn.getAttribute('data-s'));
          var cur=parseInt(noteBtn.getAttribute('data-freq'))||0;
          var next=(cur+1)%7;
          noteBtn.setAttribute('data-freq',next);
          noteBtn.textContent=next?NOTE_NAMES[next].replace('4',''):'-';
          noteBtn.classList.toggle('on',next>0);
          if(next)playSound(NOTE_FREQS[NOTE_NAMES[next-1]],'melody');
          return;
        }
        if(e.target.id==='b-save'){
          var name=(win.querySelector('#b-name')||{}).value||'Untitled';
          var bpm=parseInt((win.querySelector('#b-bpm')||{}).value)||100;
          var kick=[],hat=[],bass=[],melody=[];
          builderPanel.querySelectorAll('.builder-step[data-ch="kick"]').forEach(function(s){kick.push(s.classList.contains('on')?1:0);});
          builderPanel.querySelectorAll('.builder-step[data-ch="hat"]').forEach(function(s){hat.push(s.classList.contains('on')?1:0);});
          builderPanel.querySelectorAll('.builder-step[data-ch="bass"]').forEach(function(s){bass.push(s.classList.contains('on')?1:0);});
          builderPanel.querySelectorAll('.builder-note-btn[data-ch="melody"]').forEach(function(s){melody.push(parseInt(s.getAttribute('data-freq'))||0);});
          var track={title:name,artist:'YOU',bpm:bpm,kick:kick,hat:hat,bass:bass,melody:melody};
          if(musicState.builderIdx>=0){musicTracks[musicState.builderIdx]=track;}
          else{musicTracks.push(track);musicState.builderIdx=musicTracks.length-1;}
          saveMusicTracks();renderList();updateTrackInfo();
          showNotification('Beat saved: '+name);
          return;
        }
        if(e.target.id==='b-play'){playBuilder();return;}
        if(e.target.id==='b-clear'){
          builderPanel.querySelectorAll('.builder-step').forEach(function(s){s.classList.remove('on');});
          builderPanel.querySelectorAll('.builder-note-btn').forEach(function(s){s.classList.remove('on');s.setAttribute('data-freq','0');s.textContent='-';});
          return;
        }
      });

      // Builder track select from player list
      list.addEventListener('dblclick',function(e){
        var t=e.target.closest('.track');
        if(t){
          musicState.builderIdx=parseInt(t.getAttribute('data-tidx'));
          var btab=win.querySelector('.music-tab[data-mtab="builder"]');
          if(btab)btab.click();
        }
      });

      updateTrackInfo();durEl.textContent=Math.round(60/musicTracks[0].bpm*8*4)+'s';
    }

    /* ══════════════════════════════════════
       OPEN APP DISPATCHER
       ══════════════════════════════════════ */
    function openApp(app){
      switch(app){
        case 'files':createWindow('files','FINDER',640,420,filesHTML());setTimeout(setupFiles,50);break;
        case 'terminal':createWindow('terminal','TERMINAL',560,380,terminalHTML());setTimeout(setupTerminal,50);break;
        case 'notes':createWindow('notes','NOTES',600,420,notesHTML());setTimeout(setupNotes,50);break;
        case 'projects':createWindow('projects','PROJECTS',520,440,projectsHTML());setTimeout(setupProjects,50);break;
        case 'browser':createWindow('browser','BROWSER',800,550,browserHTML());setTimeout(setupBrowser,50);break;
        case 'calculator':createWindow('calculator','CALCULATOR',300,400,calculatorHTML());setTimeout(setupCalculator,50);break;
        case 'calendar':createWindow('calendar','CALENDAR',400,380,calendarHTML());setTimeout(setupCalendar,50);break;
        case 'editor':createWindow('editor','EDITOR',750,500,editorHTML());setTimeout(setupEditor,50);break;
        case 'settings':createWindow('settings','SETTINGS',600,420,settingsHTML());setTimeout(setupSettings,50);break;
        case 'music':createWindow('music','MUSIC',380,620,musicHTML());setTimeout(setupMusic,50);break;
        case 'maps':createWindow('maps','MAPS',800,550,mapsHTML());setTimeout(setupMaps,50);break;
      }
      showNotification(app.charAt(0).toUpperCase()+app.slice(1)+' opened.');
    }

    /* ── CLICK HANDLERS ── */
    document.addEventListener('click',function(e){
      var t=e.target.closest('[data-app]');
      if(t&&!t.closest('.mo-window')&&!t.closest('.dock-item')&&t.classList.contains('desktop-icon')&&t.getAttribute('data-was-dragged')!=='true')openApp(t.getAttribute('data-app'));
      if(t&&t.closest('.dock-item'))openApp(t.closest('.dock-item').getAttribute('data-app'));
    });

    /* ── DESKTOP ICON DRAG ── */
    (function(){
      document.addEventListener('mousedown',function(e){
        var icon=e.target.closest('.desktop-icon');
        if(!icon)return;
        if(e.button!==0)return;
        var dragging=false,startX=e.clientX,startY=e.clientY,origLeft=icon.offsetLeft,origTop=icon.offsetTop;
        icon.setAttribute('data-was-dragged','false');
        function onMove(ev){
          var dx=ev.clientX-startX,dy=ev.clientY-startY;
          if(Math.abs(dx)>4||Math.abs(dy)>4)dragging=true;
          if(dragging){
            icon.style.position='absolute';
            icon.style.left=(origLeft+dx)+'px';
            icon.style.top=(origTop+dy)+'px';
            icon.style.zIndex='50';
            icon.setAttribute('data-was-dragged','true');
          }
        }
        function onUp(){
          document.removeEventListener('mousemove',onMove);
          document.removeEventListener('mouseup',onUp);
          if(dragging){
            icon.style.zIndex='';
            setTimeout(function(){icon.setAttribute('data-was-dragged','false');},50);
          }
        }
        document.addEventListener('mousemove',onMove);
        document.addEventListener('mouseup',onUp);
      });
    })();

    /* ── COMMAND PALETTE ── */
    function renderCmdResults(query){
      var container=document.getElementById('cmd-results');
      var apps=[{type:'app',name:'Open Terminal',app:'terminal'},{type:'app',name:'Open Files',app:'files'},{type:'app',name:'Open Projects',app:'projects'},{type:'app',name:'Open Settings',app:'settings'},{type:'app',name:'Open Notes',app:'notes'},{type:'app',name:'Open Browser',app:'browser'},{type:'app',name:'Open Calculator',app:'calculator'},{type:'app',name:'Open Calendar',app:'calendar'},{type:'app',name:'Open Editor',app:'editor'},{type:'app',name:'Open Music',app:'music'},{type:'app',name:'Open Maps',app:'maps'}];
      var all=apps.concat(buildSearchIndex());
      var q=query.toLowerCase();var filtered=q?all.filter(function(i){return i.name.toLowerCase().indexOf(q)>-1}).slice(0,10):apps;
      container.innerHTML='';filtered.forEach(function(item){
        var div=document.createElement('div');div.className='cmd-item';
        var icon=item.type==='note'?'&#9998;':item.type==='project'?'&#9632;':item.type==='file'?'&#128196;':item.type==='folder'?'&#128193;':'&#9654;';
        div.innerHTML='<span class="ci-icon">'+icon+'</span><span class="ci-label">'+item.name+'</span><span class="ci-type">'+item.type+'</span>';
        div.addEventListener('click',function(){document.getElementById('cmd-palette-overlay').classList.remove('open');openApp(item.app);});
        container.appendChild(div);
      });
    }
    document.addEventListener('keydown',function(e){
      if((e.ctrlKey||e.metaKey)&&e.key==='k'){e.preventDefault();var o=document.getElementById('cmd-palette-overlay');o.classList.toggle('open');if(o.classList.contains('open')){var i=document.getElementById('cmd-input');i.value='';renderCmdResults('');i.focus();}}
      if(e.key==='Escape')document.getElementById('cmd-palette-overlay').classList.remove('open');
    });
    document.getElementById('cmd-input').addEventListener('input',function(e){renderCmdResults(e.target.value);});
    document.getElementById('cmd-palette-overlay').addEventListener('click',function(e){if(e.target===this)this.classList.remove('open');});

    /* ── POWER MENU ── */
    (function(){
      var powerBtn=document.getElementById('topbar-power');
      var powerMenu=document.getElementById('power-menu');
      var shutdownScreen=document.getElementById('shutdown-screen');
      var sleepScreen=document.getElementById('sleep-screen');

      powerBtn.addEventListener('click',function(e){
        e.stopPropagation();
        powerMenu.classList.toggle('open');
      });
      document.addEventListener('click',function(e){
        if(!powerMenu.contains(e.target)&&e.target!==powerBtn){
          powerMenu.classList.remove('open');
        }
      });

      function closeAllWindows(){
        Object.keys(openWindows).forEach(function(app){
          var w=openWindows[app];
          if(w){w.classList.remove('open');setTimeout(function(){w.remove()},50);}
          if(w&&w._dinoCleanup)w._dinoCleanup();
        });
        openWindows={};
      }

      function doShutdown(){
        powerMenu.classList.remove('open');
        closeAllWindows();
        var desktop=document.getElementById('desktop');
        var dock=document.getElementById('dock');
        desktop.style.transition='opacity 1.5s ease';
        dock.style.transition='opacity 1.5s ease';
        desktop.style.opacity='0';
        dock.style.opacity='0';
        setTimeout(function(){
          shutdownScreen.classList.add('show');
          shutdownScreen.style.opacity='1';
        },1600);
      }

      function doRestart(){
        powerMenu.classList.remove('open');
        closeAllWindows();
        var desktop=document.getElementById('desktop');
        var dock=document.getElementById('dock');
        var topbar=document.getElementById('topbar');
        desktop.style.transition='opacity 0.8s ease';
        dock.style.transition='opacity 0.8s ease';
        topbar.style.transition='opacity 0.8s ease';
        desktop.style.opacity='0';
        dock.style.opacity='0';
        topbar.style.opacity='0';
        setTimeout(function(){
          desktop.classList.remove('visible');
          dock.classList.remove('visible');
          desktop.style.opacity='';
          dock.style.opacity='';
          topbar.style.opacity='';
          desktop.style.transition='';
          dock.style.transition='';
          topbar.style.transition='';
          document.querySelectorAll('.wallpaper').forEach(function(w){w.style.display='none';});
          var wp=localStorage.getItem('mo-wallpaper')||'wp-mo-grid';
          document.getElementById(wp).style.display='';
          replayBoot();
        },1000);
      }

      function replayBoot(){
        var bootDiv=document.createElement('div');
        bootDiv.id='boot-screen';
        bootDiv.innerHTML='<div id="boot-logo">MO OS</div><div id="boot-subtitle">DEVELOPER OS</div><div id="boot-greeting" style="font-size:12px;color:var(--text-dim);letter-spacing:2px;margin-bottom:24px;opacity:0;transition:opacity 0.5s ease 0.6s">WELCOME BACK</div><div id="boot-progress"><div id="boot-progress-fill"></div></div><div id="boot-log"><div class="line" data-delay="400">INITIALIZING KERNEL...</div><div class="line" data-delay="300">LOADING CORE MODULES...</div><div class="line" data-delay="350">MOUNTING FILESYSTEM...</div><div class="line" data-delay="250">LOADING INTERFACE...</div><div class="line" data-delay="300">CHECKING NETWORK...</div><div class="line" data-delay="200">PREPARING WORKSPACE...</div><div class="line" data-delay="150">LOADING WALLPAPERS...</div><div class="line" data-delay="200">SYSTEM READY</div></div><div id="boot-version">MO OS / 01.0</div>';
        bootDiv.style.cssText='position:fixed;inset:0;background:#0e0e0e;z-index:200000;display:flex;flex-direction:column;justify-content:center;align-items:center;transition:opacity 0.8s ease;';
        document.body.appendChild(bootDiv);

        var logo=document.getElementById('boot-logo');
        var subtitle=document.getElementById('boot-subtitle');
        var greeting=document.getElementById('boot-greeting');
        var progress=document.getElementById('boot-progress');
        var progressFill=document.getElementById('boot-progress-fill');
        var lines=bootDiv.querySelectorAll('#boot-log .line');
        var version=document.getElementById('boot-version');

        var userName=getStore('mo-user-name','Developer');
        greeting.textContent='WELCOME BACK, '+userName.toUpperCase();

        setTimeout(function(){logo.classList.add('visible')},200);
        setTimeout(function(){subtitle.classList.add('visible')},600);
        setTimeout(function(){progress.classList.add('visible')},800);
        setTimeout(function(){greeting.style.opacity='1'},800);

        var td=1000,totalDur=0;
        var delays=[];
        lines.forEach(function(l){delays.push(parseInt(l.getAttribute('data-delay')));});
        totalDur=delays.reduce(function(a,b){return a+b;},0);
        var elapsed=0;
        lines.forEach(function(l,i){
          var d=delays[i];
          setTimeout(function(){l.classList.add('visible');elapsed+=d;progressFill.style.width=Math.min(100,Math.round((elapsed/totalDur)*100))+'%';},td);
          td+=d;
        });
        setTimeout(function(){lines[lines.length-1].classList.add('done')},td);
        setTimeout(function(){progressFill.style.width='100%'},td);
        setTimeout(function(){version.classList.add('visible')},td+300);
        setTimeout(function(){
          bootDiv.classList.add('fade-out');
          bootDiv.style.opacity='0';
          setTimeout(function(){
            bootDiv.remove();
            var ls=document.createElement('div');
            ls.id='lock-screen';
            ls.innerHTML='<div class="lock-bg-overlay"></div><div class="lock-content"><div class="lock-time" id="lock-clock">00:00</div><div class="lock-date" id="lock-date">MONDAY, JAN 1</div><div class="lock-funfact" id="lock-funfact"></div><div class="lock-enter-hint" id="lock-enter-hint">CLICK TO OPEN</div></div>';
            document.body.appendChild(ls);
            initLockScreen();
            checkFullscreen();
          },800);
        },td+1600);
      }

      function doSleep(){
        powerMenu.classList.remove('open');
        closeAllWindows();
        var desktop=document.getElementById('desktop');
        var dock=document.getElementById('dock');
        var topbar=document.getElementById('topbar');
        desktop.style.transition='opacity 0.8s ease';
        dock.style.transition='opacity 0.8s ease';
        topbar.style.transition='opacity 0.8s ease';
        desktop.style.opacity='0';
        dock.style.opacity='0';
        topbar.style.opacity='0';
        setTimeout(function(){
          desktop.classList.remove('visible');
          dock.classList.remove('visible');
          desktop.style.opacity='';
          dock.style.opacity='';
          topbar.style.opacity='';
          desktop.style.transition='';
          dock.style.transition='';
          topbar.style.transition='';
          document.querySelectorAll('.wallpaper').forEach(function(w){w.style.display='none';});
          var wp=localStorage.getItem('mo-wallpaper')||'wp-mo-grid';
          document.getElementById(wp).style.display='';
          var ls=document.getElementById('lock-screen');
          if(!ls){
            ls=document.createElement('div');
            ls.id='lock-screen';
            ls.innerHTML='<div class="lock-bg-overlay"></div><div class="lock-content"><div class="lock-time" id="lock-clock">00:00</div><div class="lock-date" id="lock-date">MONDAY, JAN 1</div><div class="lock-funfact" id="lock-funfact"></div><div class="lock-enter-hint" id="lock-enter-hint">CLICK ANYWHERE TO OPEN</div></div>';
            document.body.appendChild(ls);
          }
          initLockScreen();
        },800);
      }

      powerMenu.addEventListener('click',function(e){
        var opt=e.target.closest('.power-option');
        if(!opt)return;
        var action=opt.getAttribute('data-power');
        if(action==='shutdown')doShutdown();
        else if(action==='restart')doRestart();
        else if(action==='sleep')doSleep();
      });
    })();

    /* ── WALLPAPER ON LOAD ── */
    (function(){var s=localStorage.getItem('mo-wallpaper')||'wp-mo-grid';document.querySelectorAll('.wallpaper').forEach(function(w){w.style.display='none'});document.getElementById(s).style.display='';})();