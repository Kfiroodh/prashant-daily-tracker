const STORAGE_KEY='prashant_entries';
const SETTINGS_KEY='prashant_settings';
const entryForm=document.getElementById('entryForm');
const dateInput=document.getElementById('date');
const studySessionsDiv=document.getElementById('studySessions');
const addSessionBtn=document.getElementById('addSession');
const historyDiv=document.getElementById('history');
const summaryDiv=document.getElementById('summary');
const notesInput=document.getElementById('notes');
const phoneInput=document.getElementById('phoneHours');
const sleepInput=document.getElementById('sleepHours');

function todayISO(){const d=new Date();return d.toISOString().slice(0,10)}

function createSessionRow(subject='',hours=''){
  const wrap=document.createElement('div');wrap.className='session';
  const sub=document.createElement('input');sub.type='text';sub.placeholder='विषय (e.g., Maths)';sub.className='subject';sub.value=subject;
  const hrs=document.createElement('input');hrs.type='number';hrs.min='0';hrs.step='0.25';hrs.placeholder='घंटे';hrs.className='hours';hrs.value=hours;
  const rem=document.createElement('button');rem.type='button';rem.className='removeSession';rem.textContent='-';
  rem.addEventListener('click',()=>wrap.remove());
  wrap.appendChild(sub);wrap.appendChild(hrs);wrap.appendChild(rem);
  return wrap;
}

function loadEntries(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]')}catch(e){return []}}
function saveEntries(arr){localStorage.setItem(STORAGE_KEY,JSON.stringify(arr))}

function loadSettings(){try{return JSON.parse(localStorage.getItem(SETTINGS_KEY)||'{}')}catch(e){return {}}}
function saveSettings(s){localStorage.setItem(SETTINGS_KEY,JSON.stringify(s))}

function renderSummary(entries){
  const settings = loadSettings();
  if(!entries.length){
    summaryDiv.innerHTML='<p class="small">कोई entries नहीं। पहला entry जोड़ें।</p>';
    return
  }
  let totalStudy=0,totalPhone=0,totalSleep=0;const perSubject={};
  entries.forEach(e=>{e.sessions.forEach(s=>{totalStudy+=Number(s.hours)||0; if(s.subject){perSubject[s.subject]=(perSubject[s.subject]||0)+Number(s.hours||0)}}); totalPhone+=Number(e.phoneHours||0); totalSleep+=Number(e.sleepHours||0)});
  const days=entries.length; const avgStudy=(totalStudy/days).toFixed(2); const avgSleep=(totalSleep/days).toFixed(2);
  let subjHtml=''; for(const k in perSubject){subjHtml+=`<div class="stat"><strong>${k}</strong>: ${perSubject[k]} hrs</div>`}

  // Build goal controls + chart area
  summaryDiv.innerHTML = `
    <div class="stats-row">
      <div class="stat"><strong>Total study</strong><div>${totalStudy} hrs</div></div>
      <div class="stat"><strong>Avg/day</strong><div>${avgStudy} hrs</div></div>
      <div class="stat"><strong>Avg sleep/day</strong><div>${avgSleep} hrs</div></div>
    </div>
    <div style="margin-top:10px">Subjects: ${subjHtml||'<span class="small">नहीं</span>'}</div>
    <div style="margin-top:12px" class="goal-block">
      <label>Weekly study goal (hrs): <input type="number" id="weeklyGoal" min="0" step="0.5" value="${settings.weeklyStudyGoal||0}"></label>
      <button id="saveGoal" class="ghost">Save Goal</button>
      <div id="goalProgress" class="small" style="margin-top:6px"></div>
    </div>
    <div class="chart-controls" style="margin-top:12px">
      <button id="btnWeek" class="ghost">Last 7 days</button>
      <button id="btnMonth" class="ghost">Last 30 days</button>
    </div>
      <canvas id="activityChart" height="160" style="width:100%;margin-top:12px"></canvas>
      <div style="margin-top:12px">
        <h4 style="margin:8px 0 6px;font-size:14px">Subject-wise breakdown</h4>
        <canvas id="subjectChart" height="140" style="width:100%"></canvas>
      </div>
  `;

  // update progress based on weekly goal
  const weeklyGoal = Number(settings.weeklyStudyGoal||0);
  const last7 = computeTotalsByDays(entries,7);
  const last7Total = last7.data.reduce((a,b)=>a+b,0);
  const progEl = document.getElementById('goalProgress');
  if(weeklyGoal>0){
    const pct = Math.min(100, Math.round((last7Total/weeklyGoal)*100));
    progEl.innerHTML = `Last 7 days: ${last7Total} hrs — Goal ${weeklyGoal} hrs — ${pct}%`;
  } else { progEl.innerHTML = 'Weekly goal not set.' }

  document.getElementById('saveGoal').addEventListener('click',()=>{
    const val = Number(document.getElementById('weeklyGoal').value||0);
    const s = loadSettings(); s.weeklyStudyGoal = val; saveSettings(s);
    renderSummary(entries);
  });

  document.getElementById('btnWeek').addEventListener('click',()=>renderAnalytics(entries,'week'));
  document.getElementById('btnMonth').addEventListener('click',()=>renderAnalytics(entries,'month'));
  renderAnalytics(entries,'week');
}

function computeTotalsByDays(entries,days){
  const labels=[]; const data=[];
  for(let i=days-1;i>=0;i--){
    const d=new Date(); d.setDate(d.getDate()-i); const key=d.toISOString().slice(0,10); labels.push(key);
    let total=0; entries.forEach(e=>{ if(e.date===key){ e.sessions.forEach(s=>{ total+=Number(s.hours)||0 }) } }); data.push(total);
  }
  return {labels,data};
}

function renderAnalytics(entries,mode){
  const cfg = (mode==='month') ? computeTotalsByDays(entries,30) : computeTotalsByDays(entries,7);
  const ctx = document.getElementById('activityChart').getContext('2d');
  if(window.activityChart) window.activityChart.destroy();
  window.activityChart = new Chart(ctx,{type:'bar',data:{labels:cfg.labels.map(l=>l.slice(5)),datasets:[{label:'Study hours',data:cfg.data,backgroundColor:'#4f46e5'}]},options:{responsive:true,maintainAspectRatio:false,scales:{y:{beginAtZero:true}}}});
  // also render subject-wise breakdown for the same period
  renderSubjectChart(entries, mode);
}

function computeSubjectTotals(entries,days){
  const since = new Date(); since.setDate(since.getDate()- (days-1));
  const totals = {};
  entries.forEach(e=>{
    const ed = new Date(e.date);
    if(ed >= new Date(since.toDateString())){
      e.sessions.forEach(s=>{ if(s.subject){ totals[s.subject] = (totals[s.subject]||0) + Number(s.hours||0) } });
    }
  });
  return totals;
}

function renderSubjectChart(entries,mode){
  const days = (mode==='month')?30:7;
  const totals = computeSubjectTotals(entries,days);
  const labels = Object.keys(totals);
  const data = labels.map(l=>totals[l]);
  const ctx = document.getElementById('subjectChart').getContext('2d');
  if(window.subjectChart) window.subjectChart.destroy();
  if(!labels.length){
    // clear canvas
    ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
    return;
  }
  const colors = labels.map((_,i)=>['#6366f1','#06b6d4','#f97316','#ef4444','#10b981'][i%5]);
  window.subjectChart = new Chart(ctx,{type:'pie',data:{labels, datasets:[{data, backgroundColor:colors}]},options:{responsive:true,maintainAspectRatio:false}});
}

function renderHistory(){const entries=loadEntries();historyDiv.innerHTML=''; if(!entries.length){historyDiv.innerHTML='<p class="small">कोई history नहीं</p>';return}
  entries.slice().reverse().forEach(entry=>{
    const el=document.createElement('div');el.className='entry';
    const meta=document.createElement('div');meta.className='meta';
    meta.innerHTML=`<div><strong>${entry.date}</strong><div class="small">${entry.sessions.length} study sessions</div></div>`;
    const del=document.createElement('button');del.className='deleteBtn';del.textContent='Delete';del.addEventListener('click',()=>{if(confirm('Delete this entry?')){let arr=loadEntries();arr=arr.filter(x=>x.id!==entry.id);saveEntries(arr);renderHistory();renderSummary(arr)}});
    meta.appendChild(del);el.appendChild(meta);
    const list=document.createElement('div');entry.sessions.forEach(s=>{const p=document.createElement('div');p.textContent=`${s.subject||'(subject)'} — ${s.hours} hrs`;list.appendChild(p)});
    el.appendChild(list);
    const misc=document.createElement('div');misc.className='small';misc.innerHTML=`Phone: ${entry.phoneHours} hrs • Sleep: ${entry.sleepHours} hrs`;
    el.appendChild(misc);
    if(entry.notes){const n=document.createElement('div');n.textContent='Notes: '+entry.notes;el.appendChild(n)}
    historyDiv.appendChild(el);
  });
  renderSummary(loadEntries());
}

addSessionBtn.addEventListener('click',()=>{studySessionsDiv.appendChild(createSessionRow())});

entryForm.addEventListener('submit',e=>{e.preventDefault();const date=dateInput.value||todayISO();
  const sessionEls=studySessionsDiv.querySelectorAll('.session');const sessions=[];
  sessionEls.forEach(s=>{const subj=s.querySelector('.subject').value.trim();const hrs=s.querySelector('.hours').value; if(subj||hrs){sessions.push({subject:subj,hours:hrs||0})}});
  const phone=Number(phoneInput.value||0);const sleep=Number(sleepInput.value||0);const notes=notesInput.value.trim();
  const entry={id:Date.now(),date, sessions, phoneHours:phone, sleepHours:sleep, notes};
  const arr=loadEntries();arr.push(entry);saveEntries(arr);renderHistory();entryForm.reset();studySessionsDiv.innerHTML='';studySessionsDiv.appendChild(document.createElement('h3'));
  studySessionsDiv.appendChild(createSessionRow());dateInput.value=todayISO();
});

// init
window.addEventListener('DOMContentLoaded',()=>{dateInput.value=todayISO();studySessionsDiv.appendChild(createSessionRow());renderHistory();});
