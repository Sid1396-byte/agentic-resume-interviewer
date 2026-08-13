import templates from '/static/js/templates.js';
        
        // UI Logic Setup
        function setupInputTabs(tabSelector, containerPrefix) {
            const tabs = document.querySelectorAll(tabSelector);
            tabs.forEach(tab => {
                tab.addEventListener('click', (e) => {
                    tabs.forEach(t => { t.classList.remove('active'); t.classList.add('text-slate-500'); });
                    e.target.classList.add('active'); e.target.classList.remove('text-slate-500');
                    document.querySelectorAll(`[id^="${containerPrefix}"]`).forEach(c => { c.classList.add('hidden'); c.classList.remove('animate-fade-in'); });
                    const target = document.getElementById(e.target.dataset.target);
                    target.classList.remove('hidden');
                    void target.offsetWidth; 
                    target.classList.add('animate-fade-in');
                });
            });
        }
        setupInputTabs('.jd-tab', 'jd-');
        setupInputTabs('.resume-tab', 'resume-');

        const resultTabs = document.querySelectorAll('.result-tab');
        resultTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                resultTabs.forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                document.getElementById('panel-draft').classList.add('hidden');
                document.getElementById('panel-gap').classList.add('hidden');
                const target = document.getElementById(e.target.dataset.target);
                target.classList.remove('hidden');
                target.classList.remove('animate-fade-in');
                void target.offsetWidth; 
                target.classList.add('animate-fade-in');
            });
        });

        const startBtn = document.getElementById('startBtn');
        const logsDiv = document.getElementById('logs');
        const previewDiv = document.getElementById('preview');
        const gapPlaceholder = document.getElementById('gap-placeholder');
        const gapResults = document.getElementById('gap-results');
        const gapGreenList = document.getElementById('gap-green-list');
        const gapRedList = document.getElementById('gap-red-list');
        const downloadPdfBtn = document.getElementById('downloadPdfBtn');
        const atsMeterContainer = document.getElementById('ats-meter-container');
        
        let ws;
        let finalMarkdown = ""; // Store for PDF parsing

        function appendLog(msg) {
            if (msg.includes("--- Iteration")) {
                logsDiv.innerHTML += `<div class="mt-2 mb-1 text-cyan-400 font-bold border-b border-slate-800 pb-1 animate-fade-in">${msg}</div>`;
            } else if (msg.includes("Critic Score:")) {
                const scoreMatch = msg.match(/Critic Score: (\d+)/);
                if(scoreMatch) updateAtsMeter(parseInt(scoreMatch[1]));
                
                const color = msg.includes("Score: 8") || msg.includes("Score: 9") || msg.includes("Score: 100") ? "text-emerald-400" : "text-rose-400";
                logsDiv.innerHTML += `<div class="${color} font-bold animate-fade-in">${msg}</div>\n`;
            } else if (msg.includes("revisions") || msg.includes("Forcing another revision")) {
                logsDiv.innerHTML += `<div class="text-amber-400 font-bold animate-pulse mt-2">${msg}</div>\n`;
                
                // Show recalculating state on the ATS meter
                const text = document.getElementById('ats-text');
                const desc = document.getElementById('ats-desc');
                const circle = document.getElementById('ats-circle');
                if (text && desc && circle) {
                    text.innerHTML = `<svg class="animate-spin h-6 w-6 text-amber-400 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>`;
                    desc.textContent = "Recalculating...";
                    desc.className = "text-sm text-amber-400 animate-pulse";
                    circle.classList.remove('ats-green', 'ats-yellow', 'ats-red');
                    circle.classList.add('ats-yellow');
                }
            } else {
                logsDiv.innerHTML += `<div class="animate-fade-in">${msg}</div>`;
            }
            logsDiv.scrollTop = logsDiv.scrollHeight;
        }

        
        function initializeAtsMeter() {
            atsMeterContainer.classList.remove('hidden');
            const circle = document.getElementById('ats-circle');
            const text = document.getElementById('ats-text');
            const desc = document.getElementById('ats-desc');
            
            text.textContent = '...';
            circle.setAttribute('stroke-dasharray', '0, 100');
            circle.classList.remove('ats-green', 'ats-yellow', 'ats-red');
            circle.classList.add('ats-yellow');
            circle.style.transition = 'stroke-dasharray 1.5s ease-out, stroke 0.5s ease-out';
            
            desc.textContent = "Calculating compatibility...";
            desc.className = "text-sm text-slate-400 animate-pulse";
        }

        function updateAtsMeter(score) {
            sessionStorage.setItem("atsScore", score);
            atsMeterContainer.classList.remove('hidden');
            const circle = document.getElementById('ats-circle');
            const text = document.getElementById('ats-text');
            const desc = document.getElementById('ats-desc');
            
            text.textContent = `${score}%`;
            circle.setAttribute('stroke-dasharray', `${score}, 100`);
            
            circle.classList.remove('ats-green', 'ats-yellow', 'ats-red');
            if(score >= 80) { circle.classList.add('ats-green'); desc.textContent = "Excellent Match!"; desc.className = "text-sm text-emerald-400 font-medium"; }
            else if (score >= 50) { circle.classList.add('ats-yellow'); desc.textContent = "Needs Improvement"; desc.className = "text-sm text-yellow-400 font-medium"; }
            else { circle.classList.add('ats-red'); desc.textContent = "Major Reality Gap"; desc.className = "text-sm text-rose-400 font-medium"; }
        }

        function createGapBadge(skill, type, index) {
            const span = document.createElement('span');
            span.textContent = skill;
            span.style.animationDelay = `${index * 60}ms`;
            
            if (type === 'green') {
                span.className = 'badge-animate px-3 py-1.5 bg-emerald-900/30 text-emerald-300 text-xs font-medium rounded-lg border border-emerald-700/50 shadow-sm cursor-default';
            } else {
                span.className = 'badge-animate px-3 py-1.5 bg-rose-900/30 text-rose-300 text-xs font-medium rounded-lg border border-rose-700/50 shadow-sm cursor-pointer transition-transform hover:scale-110 hover:bg-rose-800/80';
                span.onclick = () => openStudyModal(skill);
            }
            return span;
        }

        async function openStudyModal(skill) {
            const modal = document.getElementById('studyModal');
            const content = document.getElementById('studyModalContent');
            document.getElementById('studySkillName').textContent = skill;
            modal.classList.remove('hidden');
            content.innerHTML = '<div class="flex justify-center py-10"><svg class="w-8 h-8 animate-spin text-violet-500" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg></div>';
            
            try {
                const jdText = document.getElementById('jdText').value || "Check job requirements"; // fallback
                const tavilyKey = document.getElementById('tavilyApiKey') ? document.getElementById('tavilyApiKey').value : "";
                const res = await fetch('/explain-skill', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        api_key: document.getElementById('apiKey').value,
                        tavily_key: tavilyKey,
                        skill: skill,
                        jd: jdText
                    })
                });
                const data = await res.json();
                content.innerHTML = `<div class="markdown-preview text-slate-200" style="font-size:14px">${marked.parse(data.explanation)}</div>`;
            } catch(e) {
                content.innerHTML = `<div class="text-rose-400 p-4 bg-rose-900/20 rounded">Failed to load study guide. Check API Key.</div>`;
            }
        }

        async function extractFileText(file) {
            const formData = new FormData(); formData.append("file", file);
            const res = await fetch('/extract-file', { method: 'POST', body: formData });
            if (!res.ok) throw new Error('Failed to extract file');
            return (await res.json()).text;
        }

        startBtn.addEventListener('click', async () => {
            const apiKey = document.getElementById('apiKey').value.trim();

            const activeJdTab = document.querySelector('.jd-tab.active').dataset.target;
            let jdUrl = "", jdText = "";
            if (activeJdTab === 'jd-url-container') { jdUrl = document.getElementById('jdUrl').value.trim(); if (!jdUrl) return; } 
            else { jdText = document.getElementById('jdText').value.trim(); if (!jdText) return; }

            const activeResumeTab = document.querySelector('.resume-tab.active').dataset.target;
            let baseResume = "";
            
            startBtn.disabled = true;
            startBtn.innerHTML = `<svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Processing...`;
            startBtn.classList.remove('btn-glow');
            logsDiv.innerHTML = '';
            downloadPdfBtn.classList.add('hidden');
            atsMeterContainer.classList.add('hidden');
            finalMarkdown = "";
            
            previewDiv.innerHTML = '<div class="flex items-center justify-center h-full pt-20 animate-fade-in"><p class="text-slate-500">Analyzing dependencies...</p></div>';
            gapPlaceholder.classList.remove('hidden'); gapResults.classList.add('hidden');
            gapGreenList.innerHTML = ''; gapRedList.innerHTML = '';
            document.querySelector('[data-target="panel-gap"]').click();

            if (activeResumeTab === 'resume-upload-container') {
                const fileInput = document.getElementById('resumeFile');
                if (fileInput.files.length === 0) { resetStartBtn(); return; }
                try { baseResume = await extractFileText(fileInput.files[0]); } catch (e) { resetStartBtn(); return; }
            } else {
                baseResume = document.getElementById('baseResumeText').value.trim();
                if (!baseResume) { resetStartBtn(); return; }
            }

            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            ws = new WebSocket(`${protocol}//${window.location.host}/ws`);

            ws.onopen = () => { initializeAtsMeter(); ws.send(JSON.stringify({ api_key: apiKey, jd_url: jdUrl, jd_text: jdText, base_resume: baseResume })); };
            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.type === 'log') { 
                    appendLog(data.message); 
                    const logContainer = document.getElementById('log-container');
                    if (logContainer) sessionStorage.setItem('agentLogs', logContainer.innerHTML);
                } 
                else if (data.type === 'draft' || data.type === 'final') {
                    if(data.type === 'draft' && document.querySelector('.result-tab.active').dataset.target !== 'panel-draft') document.querySelector('[data-target="panel-draft"]').click();
                    previewDiv.innerHTML = marked.parse(data.content);
                    sessionStorage.setItem('draftMarkdown', data.content);
                    previewDiv.classList.remove('animate-fade-in'); void previewDiv.offsetWidth; previewDiv.classList.add('animate-fade-in');
                    if (data.type === 'final') {
                        finalMarkdown = data.content;
                        sessionStorage.setItem('finalMarkdown', data.content);
                        downloadPdfBtn.classList.remove('hidden');
                    }
                } else if (data.type === 'gap_analysis') {
                    gapPlaceholder.classList.add('hidden'); gapResults.classList.remove('hidden');
                    sessionStorage.setItem('gapAnalysisObj', JSON.stringify(data.content));
                    const green = data.content.green_list || [], red = data.content.red_list || [];
                    if(green.length === 0) gapGreenList.innerHTML = '<span class="text-slate-500 text-sm">No matches</span>';
                    green.forEach((s, i) => gapGreenList.appendChild(createGapBadge(s, 'green', i)));
                    if(red.length === 0) gapRedList.innerHTML = '<span class="text-slate-500 text-sm">Perfect match!</span>';
                    red.forEach((s, i) => gapRedList.appendChild(createGapBadge(s, 'red', i)));
                }
            };
            ws.onclose = () => resetStartBtn();
            ws.onerror = () => resetStartBtn();
        });
        
        function resetStartBtn() { startBtn.disabled = false; startBtn.innerHTML = "Start Tailoring"; startBtn.classList.add('btn-glow'); }

        // PDF Export Logic
        let selectedTemplate = "clean_minimalist";
        
        function renderLivePreview() {
            const currentMarkdown = finalMarkdown || sessionStorage.getItem('finalMarkdown');
            if(!currentMarkdown) return;
            const sections = parseMarkdownToSections(currentMarkdown);
            const previewContainer = document.getElementById('live-pdf-preview');
            previewContainer.innerHTML = templates[selectedTemplate];
            
            const safeSet = (id, html) => {
                const el = previewContainer.querySelector('#' + id);
                if(el) {
                    if(!html || html.trim() === '') el.closest('section') ? el.closest('section').style.display = 'none' : el.style.display = 'none';
                    else el.innerHTML = html;
                }
            };
            
            safeSet('tpl-name', sections.name);
            safeSet('tpl-contact', sections.contact);
            safeSet('tpl-summary', sections.summary);
            safeSet('tpl-experience', sections.experience);
            safeSet('tpl-projects', sections.projects);
            safeSet('tpl-education', sections.education);
            safeSet('tpl-skills', sections.skills);
            
            // Render Dynamic Sections (cloning experience styling)
            const expSection = previewContainer.querySelector('#tpl-section-experience');
            if (expSection && sections.dynamic_sections.length > 0) {
                // Insert after projects if it exists, else after experience
                const projSection = previewContainer.querySelector('#tpl-section-projects');
                let insertAfterEl = projSection && projSection.style.display !== 'none' ? projSection : expSection;
                
                for (let dyn of sections.dynamic_sections) {
                    const cloned = expSection.cloneNode(true);
                    cloned.id = `tpl-section-dynamic-${dyn.title.replace(/\s+/g, '-').toLowerCase()}`;
                    
                    // Replace text in H2 while keeping inline SVGs/styles intact
                    const h2 = cloned.querySelector('h2');
                    if (h2) {
                        for (let node of h2.childNodes) {
                            if (node.nodeType === 3 && node.textContent.trim().toLowerCase() === 'experience') {
                                node.textContent = dyn.title;
                            }
                        }
                    }
                    
                    const div = cloned.querySelector('div');
                    if (div) {
                        div.id = `tpl-dynamic-${dyn.title.replace(/\s+/g, '-').toLowerCase()}`;
                        div.innerHTML = dyn.html;
                    }
                    
                    insertAfterEl.parentNode.insertBefore(cloned, insertAfterEl.nextSibling);
                    insertAfterEl = cloned; // chain them
                }
            }
            
            const titleEl = previewContainer.querySelector('#tpl-title');
            if(titleEl) {
                const roleMatch = document.getElementById('jdText').value.match(/title:?\s*(.*)/i);
                titleEl.textContent = roleMatch ? roleMatch[1].trim() : "Professional";
            }
        }

        document.querySelectorAll('.tpl-select-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const btnEl = e.currentTarget;
                document.querySelectorAll('.tpl-select-btn').forEach(b => {
                    b.classList.remove('active', 'border-violet-500', 'bg-violet-500/20');
                    b.classList.add('border-slate-700');
                    b.querySelector('span:first-child').classList.remove('text-white');
                    b.querySelector('span:first-child').classList.add('text-slate-300');
                });
                btnEl.classList.add('active', 'border-violet-500', 'bg-violet-500/20');
                btnEl.classList.remove('border-slate-700');
                btnEl.querySelector('span:first-child').classList.add('text-white');
                btnEl.querySelector('span:first-child').classList.remove('text-slate-300');
                selectedTemplate = btnEl.dataset.tpl;
                renderLivePreview();
            });
        });

        downloadPdfBtn.addEventListener('click', () => {
            document.getElementById('exportModal').classList.remove('hidden');
            renderLivePreview();
        });

        function parseMarkdownToSections(md) {
            let sections = { name: '', contact: '', summary: '', experience: '', projects: '', education: '', skills: '', dynamic_sections: [] };
            let current = 'header', buffer = [];
            let dynamicTitle = '';
            const lines = md.split('\n');
            
            for(let line of lines) {
                if(line.startsWith('## ')) {
                    if(current === 'header' && buffer.length > 0) {
                        sections.name = buffer[0].replace(/[#\*]/g, '').trim();
                        sections.contact = buffer.slice(1).join('<br>').replace(/\|/g, '&bull;');
                    } else if (current !== 'header') {
                        if (current === 'other') {
                            sections.dynamic_sections.push({ title: dynamicTitle, html: marked.parse(buffer.join('\n')) });
                        } else {
                            sections[current] = marked.parse(buffer.join('\n'));
                        }
                    }
                    buffer = [];
                    let h = line.toLowerCase();
                    dynamicTitle = line.replace('## ', '').trim();
                    if(h.includes('summary') || h.includes('objective') || h.includes('about')) current = 'summary';
                    else if(h.includes('project')) current = 'projects';
                    else if(h.includes('experience') || h.includes('work')) current = 'experience';
                    else if(h.includes('education')) current = 'education';
                    else if(h.includes('skill')) current = 'skills';
                    else current = 'other';
                } else {
                    if(line.trim() !== '') buffer.push(line);
                }
            }
            if(buffer.length > 0) {
                if(current === 'header') {
                    sections.name = buffer[0].replace(/[#\*]/g, '').trim();
                    sections.contact = buffer.slice(1).join('<br>').replace(/\|/g, '&bull;');
                } else {
                    if (current === 'other') {
                        sections.dynamic_sections.push({ title: dynamicTitle, html: marked.parse(buffer.join('\n')) });
                    } else {
                        sections[current] = marked.parse(buffer.join('\n'));
                    }
                }
            }
            return sections;
        }

        document.getElementById('confirmDownloadBtn').addEventListener('click', async () => {
            const btn = document.getElementById('confirmDownloadBtn');
            btn.disabled = true;
            btn.innerHTML = `<svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Generating PDF...`;
            
            const currentMarkdown = finalMarkdown || sessionStorage.getItem('finalMarkdown');
            const sections = parseMarkdownToSections(currentMarkdown);
            const container = document.getElementById('pdf-export-container');
            container.innerHTML = templates[selectedTemplate];
            
            // Map data
            const safeSet = (id, html) => {
                const el = container.querySelector('#' + id);
                if(el) {
                    if(!html || html.trim() === '') el.closest('section') ? el.closest('section').style.display = 'none' : el.style.display = 'none';
                    else el.innerHTML = html;
                }
            };
            
            safeSet('tpl-name', sections.name);
            safeSet('tpl-contact', sections.contact);
            safeSet('tpl-summary', sections.summary);
            safeSet('tpl-experience', sections.experience);
            safeSet('tpl-projects', sections.projects);
            safeSet('tpl-education', sections.education);
            safeSet('tpl-skills', sections.skills);
            
            // Render Dynamic Sections (cloning experience styling)
            const expSection = container.querySelector('#tpl-section-experience');
            if (expSection && sections.dynamic_sections.length > 0) {
                const projSection = container.querySelector('#tpl-section-projects');
                let insertAfterEl = projSection && projSection.style.display !== 'none' ? projSection : expSection;
                
                for (let dyn of sections.dynamic_sections) {
                    const cloned = expSection.cloneNode(true);
                    cloned.id = `tpl-section-dynamic-${dyn.title.replace(/\s+/g, '-').toLowerCase()}`;
                    
                    const h2 = cloned.querySelector('h2');
                    if (h2) {
                        for (let node of h2.childNodes) {
                            if (node.nodeType === 3 && node.textContent.trim().toLowerCase() === 'experience') {
                                node.textContent = dyn.title;
                            }
                        }
                    }
                    
                    const div = cloned.querySelector('div');
                    if (div) {
                        div.id = `tpl-dynamic-${dyn.title.replace(/\s+/g, '-').toLowerCase()}`;
                        div.innerHTML = dyn.html;
                    }
                    
                    insertAfterEl.parentNode.insertBefore(cloned, insertAfterEl.nextSibling);
                    insertAfterEl = cloned; // chain them
                }
            }
            
            const titleEl = container.querySelector('#tpl-title');
            if(titleEl) {
                const roleMatch = document.getElementById('jdText').value.match(/title:?\s*(.*)/i);
                titleEl.textContent = roleMatch ? roleMatch[1].trim() : "Professional";
            }

            const opt = {
                margin: 0,
                filename: 'Tailored_Resume.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true, scrollY: 0, scrollX: 0 },
                jsPDF: { unit: 'px', format: [794, 1123], orientation: 'portrait' }
            };

            await html2pdf().set(opt).from(container.children[0]).save();
            
            btn.innerHTML = "Generate PDF";
            btn.disabled = false;
            document.getElementById('exportModal').classList.add('hidden');
        });

        // ==========================================
        // App Level Tab Switching
        // ==========================================
        const appTabs = document.querySelectorAll('.app-tab');
        appTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                appTabs.forEach(t => { 
                    t.classList.remove('active', 'text-white', 'bg-violet-600/80', 'shadow-lg'); 
                    t.classList.add('text-slate-400'); 
                });
                e.target.classList.add('active', 'text-white', 'bg-violet-600/80', 'shadow-lg');
                e.target.classList.remove('text-slate-400');
                
                document.getElementById('app-resume').classList.add('hidden');
                document.getElementById('app-interview').classList.add('hidden');
                
                const target = document.getElementById(e.target.dataset.target);
                target.classList.remove('hidden');
            });
        });

        // ==========================================
        // AI Mock Interview Logic (Gemini Live API Native Audio)
        // ==========================================
        const startInterviewBtn = document.getElementById('startInterviewBtn');
        const micBtn = document.getElementById('micBtn');
        const webcamVideo = document.getElementById('webcamVideo');
        const webcamOverlay = document.getElementById('webcamOverlay');
        const transcriptDiv = document.getElementById('interviewTranscript');
        
        let interviewWs;
        let isInterviewActive = false;
        
        // Web Audio Context vars
        let audioContext;
        let audioQueueTime = 0;
        let audioStream;
        let processor;
        let isMuted = false;

        let lastRole = null;
        let lastMsgDiv = null;

        function appendTranscript(role, text) {
            if(transcriptDiv.innerHTML.includes('Click "Start Interview"')) transcriptDiv.innerHTML = '';
            if(transcriptDiv.innerHTML.includes('Connecting to Live AI Interviewer...')) transcriptDiv.innerHTML = '';

            if (role === lastRole && lastMsgDiv) {
                lastMsgDiv.innerHTML += " " + text.trim();
            } else {
                const isAI = role === 'interviewer';
                
                const wrapper = document.createElement('div');
                wrapper.className = isAI 
                    ? "bg-cyan-950/20 border border-cyan-900/50 rounded-2xl p-4 flex gap-4 animate-fade-in"
                    : "bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 flex gap-4 relative overflow-hidden animate-fade-in";
                
                const avatar = document.createElement('div');
                avatar.className = isAI
                    ? "w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center shrink-0 shadow-lg shadow-cyan-900/50 text-xs font-bold text-white"
                    : "w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-900/50 text-xs font-bold text-white";
                avatar.innerText = isAI ? "AI" : "YOU";

                const contentDiv = document.createElement('div');
                
                const roleP = document.createElement('p');
                roleP.className = isAI
                    ? "text-[10px] font-bold text-cyan-400 uppercase tracking-wider mb-1.5"
                    : "text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1.5";
                
                if (isAI) {
                    window.questionCounter = (window.questionCounter || 0) + 1;
                    roleP.innerText = `Question ${window.questionCounter}`;
                } else {
                    roleP.innerText = "Candidate";
                }

                const textP = document.createElement('p');
                textP.className = isAI
                    ? "text-sm text-slate-200 leading-relaxed"
                    : "text-sm text-slate-300 leading-relaxed";
                textP.innerText = text.trim();

                contentDiv.appendChild(roleP);
                contentDiv.appendChild(textP);
                wrapper.appendChild(avatar);
                wrapper.appendChild(contentDiv);
                
                transcriptDiv.appendChild(wrapper);
                
                lastRole = role;
                lastMsgDiv = textP;
            }
            transcriptDiv.scrollTop = transcriptDiv.scrollHeight;
        }

        let playbackContext;
        let playbackScriptNode;
        let pcmQueue = [];

        function initPlayback() {
            if (!playbackContext) {
                playbackContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
                playbackScriptNode = playbackContext.createScriptProcessor(4096, 0, 1);
                playbackScriptNode.onaudioprocess = (e) => {
                    const channelData = e.outputBuffer.getChannelData(0);
                    let outIndex = 0;
                    
                    while (outIndex < channelData.length && pcmQueue.length > 0) {
                        const chunk = pcmQueue[0];
                        const space = channelData.length - outIndex;
                        const available = chunk.length;
                        
                        if (available <= space) {
                            channelData.set(chunk, outIndex);
                            outIndex += available;
                            pcmQueue.shift();
                        } else {
                            channelData.set(chunk.subarray(0, space), outIndex);
                            pcmQueue[0] = chunk.subarray(space);
                            outIndex += space;
                        }
                    }
                    
                    // Fill remaining with silence if underrun
                    for (; outIndex < channelData.length; outIndex++) {
                        channelData[outIndex] = 0;
                    }
                };
                playbackScriptNode.connect(playbackContext.destination);
            }
            if (playbackContext.state === 'suspended') {
                playbackContext.resume();
            }
        }

        async function playPcm(arrayBuffer) {
            try {
                initPlayback();
                const int16Array = new Int16Array(arrayBuffer);
                const float32Array = new Float32Array(int16Array.length);
                for (let i = 0; i < int16Array.length; i++) {
                    float32Array[i] = int16Array[i] / 32768.0;
                }
                pcmQueue.push(float32Array);
            } catch (err) {
                console.error("Audio playback error:", err);
            }
        }

        let volumeMeterBar;

        async function startAudioStreaming() {
            try {
                audioStream = await navigator.mediaDevices.getUserMedia({ video: false, audio: {
                    echoCancellation: true, noiseSuppression: true, autoGainControl: true
                }});
                
                audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
                const source = audioContext.createMediaStreamSource(audioStream);
                
                const workletCode = `
                class AudioProcessingWorklet extends AudioWorkletProcessor {
                  buffer = new Int16Array(512);
                  bufferWriteIndex = 0;
                  
                  process(inputs) {
                    if (inputs[0].length) {
                      const channel0 = inputs[0][0];
                      this.processChunk(channel0);
                    }
                    return true;
                  }
                  
                  sendAndClearBuffer(){
                    this.port.postMessage({
                      event: "chunk",
                      data: { int16arrayBuffer: this.buffer.slice(0, this.bufferWriteIndex).buffer }
                    });
                    this.bufferWriteIndex = 0;
                  }
                  
                  processChunk(float32Array) {
                    const l = float32Array.length;
                    for (let i = 0; i < l; i++) {
                      // Apply 3x software boost and clamp to int16 limits
                      let val = float32Array[i] * 32768 * 3.0;
                      val = Math.max(-32768, Math.min(32767, val));
                      this.buffer[this.bufferWriteIndex++] = val;
                      if(this.bufferWriteIndex >= this.buffer.length) {
                        this.sendAndClearBuffer();
                      }
                    }
                  }
                }
                registerProcessor("audio-recorder-worklet", AudioProcessingWorklet);
                `;

                const blob = new Blob([workletCode], { type: "application/javascript" });
                const workletUrl = URL.createObjectURL(blob);
                await audioContext.audioWorklet.addModule(workletUrl);
                
                processor = new AudioWorkletNode(audioContext, "audio-recorder-worklet");
                source.connect(processor);
                processor.connect(audioContext.destination);
                
                volumeMeterBar = document.getElementById('volumeMeterBar');
                
                processor.port.onmessage = (event) => {
                    if (!isInterviewActive || isMuted || !interviewWs || interviewWs.readyState !== WebSocket.OPEN) {
                        if (volumeMeterBar) volumeMeterBar.style.width = '0%';
                        return;
                    }
                    
                    if (event.data.event === "chunk") {
                        const buffer = event.data.data.int16arrayBuffer;
                        
                        // Calculate volume for UI
                        const int16Array = new Int16Array(buffer);
                        let sum = 0;
                        for (let i = 0; i < int16Array.length; i++) {
                            const normalized = int16Array[i] / 32768.0;
                            sum += normalized * normalized;
                        }
                        let rms = Math.sqrt(sum / int16Array.length);
                        let displayVolume = Math.min(100, rms * 1000);
                        if (volumeMeterBar) volumeMeterBar.style.width = displayVolume + '%';
                        
                        interviewWs.send(buffer);
                    }
                };
            } catch (err) {
                console.error("Audio streaming error:", err);
                alert("Microphone access is required for the Live AI Interview. Please ensure your microphone is plugged in and Chrome has permission.");
                stopInterview();
            }
        }

        function updateStatus(connected) {
            const statusDot = document.getElementById("status-dot");
            const statusText = document.getElementById("status-text");
            if (connected) {
                statusDot.classList.remove("bg-slate-500", "bg-zinc-400");
                statusDot.classList.add("bg-emerald-400", "animate-pulse");
                statusText.textContent = "Live Session Active";
                statusText.classList.remove("text-zinc-500");
                statusText.classList.add("text-slate-300");
            } else {
                statusDot.classList.remove("bg-emerald-400", "animate-pulse");
                statusDot.classList.add("bg-slate-500");
                statusText.textContent = "Disconnected";
                statusText.classList.remove("text-slate-300");
                statusText.classList.add("text-zinc-500");
            }
        }

        function stopInterview() {
            if (!isInterviewActive) return;
            
            pcmQueue = []; // Clear any pending audio chunks
            
            let fullTranscript = "";
            const transcriptElements = transcriptDiv.children;
            for (let el of transcriptElements) {
                if (el.children.length >= 2 && el.children[1].children.length >= 2) {
                    const role = el.children[1].children[0].textContent.trim();
                    const text = el.children[1].children[1].textContent.trim();
                    fullTranscript += `${role}: ${text}\n`;
                }
            }

            isInterviewActive = false;
            
            if (fullTranscript.length > 50) {
                triggerScoring(fullTranscript);
            }
            
            // Restore UI
            startInterviewBtn.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Start Interview`;
            startInterviewBtn.classList.remove('bg-rose-600', 'hover:bg-rose-500', 'shadow-rose-900/20');
            startInterviewBtn.classList.add('bg-emerald-600', 'hover:bg-emerald-500', 'shadow-emerald-900/20');
            document.getElementById('videoControls').classList.add('hidden');
            const volContainer = document.getElementById('volumeMeterContainer');
            if (volContainer) volContainer.classList.add('hidden');
            
            if (volumeMeterBar) volumeMeterBar.style.width = '0%'; // For the horizontal bar
            if (volumeMeterBar) volumeMeterBar.style.transform = 'scale(0.5)'; // For the circular ring (if it exists)
            
            updateStatus(false);
            
            if (webcamVideo.srcObject) {
                webcamVideo.srcObject.getTracks().forEach(track => track.stop());
            }
            if (audioStream) {
                audioStream.getTracks().forEach(track => track.stop());
            }
            if (processor) {
                processor.disconnect();
            }
            if (audioContext) {
                audioContext.close();
            }
            webcamOverlay.classList.remove('hidden');
            if (interviewWs) interviewWs.close();
        }

        // Setup Backend Logs Streaming - Removed by Request
        let logsWs;

        let isCameraOff = false;
        const cameraBtn = document.getElementById('cameraBtn');

        // Handle Mute
        micBtn.addEventListener('click', () => {
            isMuted = !isMuted;
            
            if (typeof audioStream !== 'undefined' && audioStream) {
                audioStream.getAudioTracks().forEach(track => {
                    track.enabled = !isMuted;
                });
            }
            
            if (isMuted) {
                micBtn.innerHTML = `<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path><line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" stroke-width="2"></line></svg>`;
                micBtn.classList.remove('bg-slate-700/50', 'hover:bg-slate-600');
                micBtn.classList.add('bg-rose-600', 'hover:bg-rose-500');
            } else {
                micBtn.innerHTML = `<svg class="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path></svg>`;
                micBtn.classList.add('bg-slate-700/50', 'hover:bg-slate-600');
                micBtn.classList.remove('bg-rose-600', 'hover:bg-rose-500');
            }
        });

        if (cameraBtn) {
            cameraBtn.addEventListener('click', () => {
                isCameraOff = !isCameraOff;
                if (isCameraOff) {
                    cameraBtn.innerHTML = `<svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path><line x1="3" y1="3" x2="21" y2="21" stroke="currentColor" stroke-width="2"></line></svg>`;
                    cameraBtn.classList.remove('bg-slate-700/50', 'hover:bg-slate-600');
                    cameraBtn.classList.add('bg-rose-600', 'hover:bg-rose-500');
                    if (webcamVideo.srcObject) {
                        webcamVideo.srcObject.getVideoTracks().forEach(track => track.enabled = false);
                    }
                } else {
                    cameraBtn.innerHTML = `<svg class="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>`;
                    cameraBtn.classList.add('bg-slate-700/50', 'hover:bg-slate-600');
                    cameraBtn.classList.remove('bg-rose-600', 'hover:bg-rose-500');
                    if (webcamVideo.srcObject) {
                        webcamVideo.srcObject.getVideoTracks().forEach(track => track.enabled = true);
                    }
                }
            });
        }

        document.getElementById('startInterviewBtn').addEventListener('click', async () => {
            if (isInterviewActive) {
                stopInterview();
                return;
            }

            const apiKey = document.getElementById('apiKey').value.trim();
            
            const jdText = document.getElementById('jdText').value.trim() || document.getElementById('jdUrl').value.trim();
            const baseResume = document.getElementById('baseResumeText').value.trim();
            
            const jdContextElem = document.getElementById('jdContextText');
            if (jdContextElem) {
                jdContextElem.textContent = jdText ? (jdText.length > 200 ? jdText.substring(0, 200) + '...' : jdText) : "No Job Description provided.";
            }
            
            transcriptDiv.innerHTML = '<div class="text-center text-slate-500 mt-10 animate-pulse">Connecting to Live AI Interviewer...</div>';
            
            // Update UI
            startInterviewBtn.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"></path></svg> End Interview`;
            startInterviewBtn.classList.remove('bg-emerald-600', 'hover:bg-emerald-500', 'shadow-emerald-900/20');
            startInterviewBtn.classList.add('bg-rose-600', 'hover:bg-rose-500', 'shadow-rose-900/20');
            document.getElementById('videoControls').classList.remove('hidden');
            const volContainer = document.getElementById('volumeMeterContainer');
            if (volContainer) volContainer.classList.remove('hidden');
            
            isInterviewActive = true;
            window.questionCounter = 0;
            
            // Start Camera
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                webcamVideo.srcObject = stream;
                webcamOverlay.classList.add('hidden');
            } catch(e) {
                console.error("Camera access denied", e);
            }

            // Start Audio Mic Stream
            await startAudioStreaming();
            
            let resumeContext = baseResume;
            const fileInput = document.getElementById('resumeFile');
            if(fileInput.files.length > 0 && !resumeContext) {
                try { resumeContext = await extractFileText(fileInput.files[0]); } catch(e){}
            }

            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            interviewWs = new WebSocket(`${protocol}//${window.location.host}/ws/interview`);
            interviewWs.binaryType = "arraybuffer";

            interviewWs.onopen = () => {
                updateStatus(true);
                micBtn.classList.remove('hidden');
                
                const voiceSelect = document.getElementById('voiceSelect');
                const voice = voiceSelect ? voiceSelect.value : "Aoede";
                
                // Send Initial Text Config to start session
                interviewWs.send(JSON.stringify({ 
                    api_key: apiKey, 
                    base_resume: resumeContext,
                    jd: jdText,
                    voice: voice
                }));
            };

            interviewWs.onclose = () => {
                updateStatus(false);
                stopInterview();
            }

            interviewWs.onmessage = async (event) => {
                if (event.data instanceof ArrayBuffer) {
                    // It's raw PCM audio from Gemini
                    playPcm(event.data);
                } else if (typeof event.data === "string") {
                    try {
                        const data = JSON.parse(event.data);
                        if (data.transcript) {
                            appendTranscript(data.role, data.transcript);
                        } else if (data.error) {
                            appendTranscript('interviewer', `Error: ${data.error}`);
                        }
                    } catch (e) {}
                }
            };
            
            interviewWs.onerror = () => {
                appendTranscript('interviewer', "WebSocket Error.");
                stopInterview();
            }
        });





        // Scorecard Logic
        document.getElementById('closeScorecardBtn').addEventListener('click', () => {
            document.getElementById('scorecardModal').classList.add('hidden');
        });
        document.getElementById('doneScorecardBtn').addEventListener('click', () => {
            document.getElementById('scorecardModal').classList.add('hidden');
        });

        async function triggerScoring(transcript) {
            const apiKey = document.getElementById('apiKey').value.trim();

            let jdText = document.getElementById('jdText').value.trim() || document.getElementById('jdUrl').value.trim();
            let baseResume = document.getElementById('baseResumeText').value.trim();

            document.getElementById('scorecardModal').classList.remove('hidden');
            document.getElementById('scorecardLoading').classList.remove('hidden');
            document.getElementById('scorecardLoading').innerHTML = `
                <div class="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p class="text-slate-300">Evaluating your interview performance...</p>
            `;
            document.getElementById('scorecardResults').classList.add('hidden');

            try {
                const res = await fetch('/api/score', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        api_key: apiKey,
                        jd: jdText,
                        resume: baseResume,
                        transcript: transcript
                    })
                });

                if (!res.ok) {
                    const errData = await res.json();
                    throw new Error(errData.detail || "Scoring failed");
                }
                const data = await res.json();

                // Animate Score
                document.getElementById('scoreValue').textContent = data.score || 0;
                const circle = document.getElementById('scoreCircle');
                const circumference = 2 * Math.PI * 46; // r=46 for 50% cx/cy, viewBox implies 100x100 relative. Actually wait, SVG is 100% w/h. r=46%. circumference = 2*PI*46 = 289.02
                const offset = 290 - ((data.score || 0) / 100) * 290;
                
                // Color based on score
                circle.classList.remove('text-emerald-500', 'text-yellow-500', 'text-rose-500');
                if (data.score >= 80) circle.classList.add('text-emerald-500');
                else if (data.score >= 60) circle.classList.add('text-yellow-500');
                else circle.classList.add('text-rose-500');

                // Trigger animation after a small delay
                setTimeout(() => {
                    circle.style.strokeDashoffset = offset;
                }, 100);

                document.getElementById('scoreFeedback').textContent = data.feedback || "No feedback provided.";
                
                const strUl = document.getElementById('scoreStrengths');
                strUl.innerHTML = '';
                (data.strengths || []).forEach(s => {
                    strUl.innerHTML += `<li>${s}</li>`;
                });

                const weakUl = document.getElementById('scoreWeaknesses');
                weakUl.innerHTML = '';
                (data.weaknesses || []).forEach(w => {
                    weakUl.innerHTML += `<li>${w}</li>`;
                });

                document.getElementById('scorecardLoading').classList.add('hidden');
                document.getElementById('scorecardResults').classList.remove('hidden');
            } catch (err) {
                console.error(err);
                document.getElementById('scorecardLoading').innerHTML = `<p class="text-rose-400">Error generating score: ${err.message}</p>`;
            }
        }
        document.getElementById('tabTranscriptBtn').addEventListener('click', () => {
            // UI tab is purely decorative now since backend logs were removed
        });

        function checkInterviewUnlock() {
            const hasJd = document.getElementById('jdUrl').value.trim() !== '' || document.getElementById('jdText').value.trim() !== '';
            const hasResume = document.getElementById('baseResumeText').value.trim() !== '' || document.getElementById('resumeFile').files.length > 0;
            const startBtn = document.getElementById('startInterviewBtn');
            const warning = document.getElementById('interviewWarning');
            
            // Do not run check if interview is active because button is "End Interview"
            if (window.isInterviewActive) return;

            if (hasJd && hasResume) {
                startBtn.classList.remove('cursor-not-allowed', 'opacity-50');
                startBtn.removeAttribute('disabled');
                warning.classList.add('hidden');
            } else {
                startBtn.classList.add('cursor-not-allowed', 'opacity-50');
                startBtn.setAttribute('disabled', 'true');
                warning.classList.remove('hidden');
                
                if (!hasJd && !hasResume) {
                    warning.textContent = "Please fill JD and Resume";
                } else if (!hasJd) {
                    warning.textContent = "Please fill JD";
                } else {
                    warning.textContent = "Please fill Resume";
                }
            }
        }

        ['jdUrl', 'jdText', 'baseResumeText'].forEach(id => {
            document.getElementById(id).addEventListener('input', checkInterviewUnlock);
        });
        document.getElementById('resumeFile').addEventListener('change', checkInterviewUnlock);


// --- State Persistence Logic ---

    const isReload = performance.getEntriesByType("navigation").some(nav => nav.type === "reload");
    
    if (isReload) {
        // Clear all state on refresh
        sessionStorage.clear();
    } else {
        // Restore state if returning from Home
        
        if (sessionStorage.getItem('atsScore')) {
            // Need to wait slightly for elements to exist? No, we are inline now.
            updateAtsMeter(parseInt(sessionStorage.getItem('atsScore')));
        }
        if (sessionStorage.getItem('jdText')) {
            const jdEl = document.getElementById('jdText');
            if(jdEl) { jdEl.value = sessionStorage.getItem('jdText'); jdEl.dispatchEvent(new Event('input')); }
        }
        if (sessionStorage.getItem('baseResume')) {
            const resumeEl = document.getElementById('baseResumeText');
            if(resumeEl) { resumeEl.value = sessionStorage.getItem('baseResume'); resumeEl.dispatchEvent(new Event('input')); }
        }
        
        // Restore Logs
        if (sessionStorage.getItem('agentLogs')) {
            const logContainer = document.getElementById('log-container');
            if(logContainer) {
                logContainer.innerHTML = sessionStorage.getItem('agentLogs');
            }
        }
        
        // Restore Draft Markdown
        if (sessionStorage.getItem('draftMarkdown')) {
            const previewDiv = document.getElementById('preview');
            if(previewDiv) {
                // Ensure preview div has initial state hidden removed
                previewDiv.innerHTML = marked.parse(sessionStorage.getItem('draftMarkdown'));
            }
        }
        
        // Restore Final Markdown & Export Button
        if (sessionStorage.getItem('finalMarkdown')) {
            window.finalMarkdown = sessionStorage.getItem('finalMarkdown');
            const btn = document.getElementById('downloadPdfBtn');
            if (btn) btn.classList.remove('hidden');
        }
        
        // Restore Gap Analysis
        if (sessionStorage.getItem('gapAnalysisObj')) {
            const gapData = JSON.parse(sessionStorage.getItem('gapAnalysisObj'));
            const gapPlaceholder = document.getElementById('gap-placeholder');
            const gapResults = document.getElementById('gap-results');
            const gapGreenList = document.getElementById('gap-green-list');
            const gapRedList = document.getElementById('gap-red-list');
            
            if (gapPlaceholder && gapResults) {
                gapPlaceholder.classList.add('hidden'); 
                gapResults.classList.remove('hidden');
                const green = gapData.green_list || [], red = gapData.red_list || [];
                
                // Helper to recreate badges (similar to original logic)
                const createBadge = (text, type, delay) => {
                    const el = document.createElement('div');
                    el.className = `inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm animate-fade-in ${type === 'green' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`;
                    el.style.animationDelay = `${delay * 0.05}s`;
                    el.innerHTML = type === 'green' ? `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>${text}` : `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>${text}`;
                    return el;
                };

                if(green.length === 0) gapGreenList.innerHTML = '<span class="text-slate-500 text-sm">No matches</span>';
                else gapGreenList.innerHTML = '';
                green.forEach((s, i) => gapGreenList.appendChild(createBadge(s, 'green', i)));
                
                if(red.length === 0) gapRedList.innerHTML = '<span class="text-slate-500 text-sm">Perfect match!</span>';
                else gapRedList.innerHTML = '';
                red.forEach((s, i) => gapRedList.appendChild(createBadge(s, 'red', i)));
            }
        }
    }

// Auto-save inputs when they change
document.addEventListener('input', (e) => {
    if (e.target.id === 'jdText') sessionStorage.setItem('jdText', e.target.value);
    if (e.target.id === 'baseResumeText') sessionStorage.setItem('baseResume', e.target.value);
});

// We should also hook into the WebSocket logic to save the final gap analysis and draft
