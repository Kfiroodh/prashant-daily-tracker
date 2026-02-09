// ========== CONFIG & DOM ELEMENTS ==========
const STORAGE_KEY = 'prashant_entries';
const SETTINGS_KEY = 'prashant_settings';

// Form elements
const entryForm = document.getElementById('entryForm');
const dateInput = document.getElementById('date');
const studySessionsDiv = document.getElementById('studySessions');
const addSessionBtn = document.getElementById('addSession');
const historyDiv = document.getElementById('history');
const summaryDiv = document.getElementById('summary');
const notesInput = document.getElementById('notes');
const phoneInput = document.getElementById('phoneHours');
const sleepInput = document.getElementById('sleepHours');
const moodInput = document.getElementById('mood');

// AI Dashboard elements
const aiDashboard = document.getElementById('aiDashboard');
const aiInsights = document.getElementById('aiInsights');
const weeklySummary = document.getElementById('weeklySummary');
const scoreNumber = document.getElementById('scoreNumber');
const motivationText = document.getElementById('motivationText');
const scoreCircle = document.getElementById('scoreCircle');

// ========== UTILITY FUNCTIONS ==========
function todayISO() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function createSessionRow(subject = '', hours = '') {
  const wrap = document.createElement('div');
  wrap.className = 'session';
  
  const sub = document.createElement('input');
  sub.type = 'text';
  sub.placeholder = 'विषय (e.g., Maths)';
  sub.className = 'subject';
  sub.value = subject;
  
  const hrs = document.createElement('input');
  hrs.type = 'number';
  hrs.min = '0';
  hrs.step = '0.25';
  hrs.placeholder = 'घंटे';
  hrs.className = 'hours';
  hrs.value = hours;
  
  const rem = document.createElement('button');
  rem.type = 'button';
  rem.className = 'removeSession';
  rem.textContent = '-';
  rem.addEventListener('click', () => wrap.remove());
  
  wrap.appendChild(sub);
  wrap.appendChild(hrs);
  wrap.appendChild(rem);
  return wrap;
}

// ========== STORAGE FUNCTIONS ==========
function loadEntries() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch (e) {
    return [];
  }
}

function saveEntries(arr) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}

function loadSettings() {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
  } catch (e) {
    return {};
  }
}

function saveSettings(s) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

// ========== PRODUCTIVITY SCORE ==========
function updateProductivityScore(entries) {
  if (!entries.length) {
    scoreNumber.textContent = '0';
    scoreCircle.style.strokeDasharray = '0';
    return;
  }

  const engine = new AIEngine(entries);
  const score = engine.getProductivityScore();
  
  scoreNumber.textContent = score;
  
  // Animate circle (565 is circumference of the circle)
  const circumference = 565;
  const offset = circumference - (score / 100) * circumference;
  scoreCircle.style.strokeDasharray = circumference;
  scoreCircle.style.strokeDashoffset = offset;
  
  // Update motivation message
  const motivation = engine.getDailyMotivation();
  motivationText.innerHTML = `<p>${motivation.hindi}</p><p class="small" style="color:#666;">${motivation.english}</p>`;
}

// ========== AI INSIGHTS RENDERING ==========
function renderAIInsights(entries) {
  if (!entries.length) {
    aiInsights.innerHTML = '<p class="small">डेटा जोड़ें और AI से अंतर्दृष्टि प्राप्त करें।</p>';
    return;
  }

  const engine = new AIEngine(entries);
  const insights = engine.insights;

  let html = '<div class="insights-grid">';
  insights.forEach(insight => {
    const bgClass = `insight-${insight.type}`;
    html += `
      <div class="insight-card ${bgClass}">
        <div class="insight-header">${insight.emoji} ${insight.title}</div>
        <div class="insight-message">${insight.message}</div>
      </div>
    `;
  });
  html += '</div>';

  aiInsights.innerHTML = html;
}

// ========== WEEKLY SUMMARY ==========
function renderWeeklySummary(entries) {
  if (entries.length < 2) {
    weeklySummary.innerHTML = '<p class="small">कम से कम 2 entries होनी चाहिएं।</p>';
    return;
  }

  const engine = new AIEngine(entries);
  const summary = engine.getWeeklySummary();

  let html = `
    <div class="summary-stats">
      <div class="summary-stat">
        <div class="stat-label">कुल घंटे (7 दिन)</div>
        <div class="stat-value">${summary.totalHours.toFixed(1)}h</div>
      </div>
      <div class="summary-stat">
        <div class="stat-label">औसत प्रति दिन</div>
        <div class="stat-value">${summary.avgPerDay}h</div>
      </div>
      <div class="summary-stat">
        <div class="stat-label">नींद (औसत)</div>
        <div class="stat-value">${summary.avgSleep}h</div>
      </div>
      <div class="summary-stat">
        <div class="stat-label">निरंतरता</div>
        <div class="stat-value">${summary.consistency}%</div>
      </div>
    </div>

    <div class="summary-text">
      <p><strong>📋 विश्लेषण:</strong> ${summary.summary}</p>
    </div>

    <div class="recommendations">
      <p><strong>💡 सुझाव:</strong></p>
      <ul>
        ${summary.recommendations.map(r => `<li>${r.emoji} ${r.hindi}</li>`).join('')}
      </ul>
    </div>

    ${summary.trend !== 0 ? `
    <div class="trend-box ${summary.trend > 0 ? 'positive' : 'negative'}">
      📊 <strong>Trend:</strong> ${Math.abs(summary.trend).toFixed(1)}% ${summary.trend > 0 ? '↑ (Improving)' : '↓ (Declining)'}
    </div>
    ` : ''}
  `;

  weeklySummary.innerHTML = html;
}

// ========== MAIN SUMMARY RENDERING ==========
function renderSummary(entries) {
  const settings = loadSettings();
  
  if (!entries.length) {
    summaryDiv.innerHTML = '<p class="small">कोई entries नहीं। पहला entry जोड़ें।</p>';
    updateProductivityScore([]);
    renderAIInsights([]);
    return;
  }

  let totalStudy = 0, totalPhone = 0, totalSleep = 0;
  const perSubject = {};

  entries.forEach(e => {
    e.sessions.forEach(s => {
      totalStudy += Number(s.hours) || 0;
      if (s.subject) {
        perSubject[s.subject] = (perSubject[s.subject] || 0) + Number(s.hours || 0);
      }
    });
    totalPhone += Number(e.phoneHours || 0);
    totalSleep += Number(e.sleepHours || 0);
  });

  const days = entries.length;
  const avgStudy = (totalStudy / days).toFixed(2);
  const avgSleep = (totalSleep / days).toFixed(2);

  let subjHtml = '';
  for (const k in perSubject) {
    subjHtml += `<div class="stat"><strong>${k}</strong>: ${perSubject[k].toFixed(1)} hrs</div>`;
  }

  summaryDiv.innerHTML = `
    <div class="stats-row">
      <div class="stat"><strong>Total study</strong><div>${totalStudy.toFixed(1)} hrs</div></div>
      <div class="stat"><strong>Avg/day</strong><div>${avgStudy} hrs</div></div>
      <div class="stat"><strong>Avg sleep/day</strong><div>${avgSleep} hrs</div></div>
    </div>
    <div style="margin-top:10px">Subjects: ${subjHtml || '<span class="small">नहीं</span>'}</div>
    <div style="margin-top:12px" class="goal-block">
      <label>Weekly study goal (hrs): <input type="number" id="weeklyGoal" min="0" step="0.5" value="${settings.weeklyStudyGoal || 0}"></label>
      <button id="saveGoal" class="btn-secondary">Save Goal</button>
      <div id="goalProgress" class="small" style="margin-top:6px"></div>
    </div>
    <div class="chart-controls" style="margin-top:12px">
      <button id="btnWeek" class="btn-secondary">Last 7 days</button>
      <button id="btnMonth" class="btn-secondary">Last 30 days</button>
    </div>
    <canvas id="activityChart" height="160" style="width:100%;margin-top:12px"></canvas>
    <div style="margin-top:12px">
      <h4 style="margin:8px 0 6px;font-size:14px">Subject-wise breakdown</h4>
      <canvas id="subjectChart" height="140" style="width:100%"></canvas>
    </div>
  `;

  // Update goal progress
  const weeklyGoal = Number(settings.weeklyStudyGoal || 0);
  const last7 = computeTotalsByDays(entries, 7);
  const last7Total = last7.data.reduce((a, b) => a + b, 0);
  const progEl = document.getElementById('goalProgress');
  
  if (weeklyGoal > 0) {
    const pct = Math.min(100, Math.round((last7Total / weeklyGoal) * 100));
    progEl.innerHTML = `Last 7 days: ${last7Total.toFixed(1)} hrs — Goal ${weeklyGoal} hrs — ${pct}%`;
  } else {
    progEl.innerHTML = 'Weekly goal not set.';
  }

  document.getElementById('saveGoal').addEventListener('click', () => {
    const val = Number(document.getElementById('weeklyGoal').value || 0);
    const s = loadSettings();
    s.weeklyStudyGoal = val;
    saveSettings(s);
    renderSummary(entries);
  });

  document.getElementById('btnWeek').addEventListener('click', () => renderAnalytics(entries, 'week'));
  document.getElementById('btnMonth').addEventListener('click', () => renderAnalytics(entries, 'month'));
  
  // Initial analytics render
  renderAnalytics(entries, 'week');

  // Update AI dashboard
  updateProductivityScore(entries);
  renderAIInsights(entries);
  renderWeeklySummary(entries);
}

// ========== ANALYTICS FUNCTIONS ==========
function computeTotalsByDays(entries, days) {
  const labels = [];
  const data = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    labels.push(key);
    
    let total = 0;
    entries.forEach(e => {
      if (e.date === key) {
        e.sessions.forEach(s => {
          total += Number(s.hours) || 0;
        });
      }
    });
    data.push(total);
  }
  
  return { labels, data };
}

function renderAnalytics(entries, mode) {
  const cfg = mode === 'month' ? computeTotalsByDays(entries, 30) : computeTotalsByDays(entries, 7);
  const ctx = document.getElementById('activityChart').getContext('2d');
  
  if (window.activityChart) window.activityChart.destroy();
  
  window.activityChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: cfg.labels.map(l => l.slice(5)),
      datasets: [
        {
          label: 'Study hours',
          data: cfg.data,
          backgroundColor: '#4f46e5',
          borderColor: '#4338ca',
          borderWidth: 1,
          borderRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 2 }
        }
      },
      plugins: {
        legend: {
          display: true
        }
      }
    }
  });

  renderSubjectChart(entries, mode);
}

function computeSubjectTotals(entries, days) {
  const since = new Date();
  since.setDate(since.getDate() - (days - 1));
  const totals = {};
  
  entries.forEach(e => {
    const ed = new Date(e.date);
    if (ed >= new Date(since.toDateString())) {
      e.sessions.forEach(s => {
        if (s.subject) {
          totals[s.subject] = (totals[s.subject] || 0) + Number(s.hours || 0);
        }
      });
    }
  });
  
  return totals;
}

function renderSubjectChart(entries, mode) {
  const days = mode === 'month' ? 30 : 7;
  const totals = computeSubjectTotals(entries, days);
  const labels = Object.keys(totals);
  const data = labels.map(l => totals[l]);
  const ctx = document.getElementById('subjectChart').getContext('2d');
  
  if (window.subjectChart) window.subjectChart.destroy();
  
  if (!labels.length) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    return;
  }

  const colors = labels.map((_, i) => ['#6366f1', '#06b6d4', '#f97316', '#ef4444', '#10b981'][i % 5]);
  
  window.subjectChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [
        {
          data,
          backgroundColor: colors,
          borderColor: '#fff',
          borderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}

// ========== HISTORY RENDERING ==========
function renderHistory() {
  const entries = loadEntries();
  historyDiv.innerHTML = '';
  
  if (!entries.length) {
    historyDiv.innerHTML = '<p class="small">कोई history नहीं</p>';
    return;
  }

  entries.slice().reverse().forEach(entry => {
    const el = document.createElement('div');
    el.className = 'entry';
    
    const meta = document.createElement('div');
    meta.className = 'meta';
    
    const moodEmoji = ['😢', '😕', '😐', '🙂', '😄'][entry.mood - 1] || '';
    
    meta.innerHTML = `
      <div>
        <strong>${entry.date}</strong>
        <div class="small">${entry.sessions.length} study sessions ${moodEmoji}</div>
      </div>
    `;
    
    const del = document.createElement('button');
    del.className = 'deleteBtn';
    del.textContent = 'Delete';
    del.addEventListener('click', () => {
      if (confirm('Delete this entry?')) {
        let arr = loadEntries();
        arr = arr.filter(x => x.id !== entry.id);
        saveEntries(arr);
        renderHistory();
        renderSummary(arr);
      }
    });
    
    meta.appendChild(del);
    el.appendChild(meta);
    
    const list = document.createElement('div');
    entry.sessions.forEach(s => {
      const p = document.createElement('div');
      p.textContent = `${s.subject || '(subject)'} — ${s.hours} hrs`;
      list.appendChild(p);
    });
    el.appendChild(list);
    
    const misc = document.createElement('div');
    misc.className = 'small';
    misc.innerHTML = `📱 ${entry.phoneHours} hrs • 😴 ${entry.sleepHours} hrs`;
    el.appendChild(misc);
    
    if (entry.notes) {
      const n = document.createElement('div');
      n.textContent = 'Notes: ' + entry.notes;
      el.appendChild(n);
    }
    
    historyDiv.appendChild(el);
  });
}

// ========== EVENT LISTENERS ==========
addSessionBtn.addEventListener('click', () => {
  studySessionsDiv.appendChild(createSessionRow());
});

// Mood tracking
document.querySelectorAll('.mood-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    
    // Remove active from all
    document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
    
    // Add active to clicked
    btn.classList.add('active');
    moodInput.value = btn.dataset.mood;
  });
});

// Form submission
entryForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const sessions = [];
  document.querySelectorAll('.session').forEach(row => {
    const subject = row.querySelector('.subject').value.trim();
    const hours = parseFloat(row.querySelector('.hours').value) || 0;
    if (subject && hours > 0) {
      sessions.push({ subject, hours });
    }
  });

  if (!sessions.length) {
    alert('कम से कम एक study session जोड़ें।');
    return;
  }

  const entry = {
    id: Date.now(),
    date: dateInput.value,
    sessions,
    phoneHours: parseFloat(phoneInput.value) || 0,
    sleepHours: parseFloat(sleepInput.value) || 0,
    mood: parseInt(moodInput.value) || 0,
    notes: notesInput.value.trim(),
    timestamp: new Date().toISOString()
  };

  let arr = loadEntries();
  
  // Update if same date exists
  const idx = arr.findIndex(e => e.date === entry.date);
  if (idx >= 0) {
    arr[idx] = entry;
  } else {
    arr.push(entry);
  }

  saveEntries(arr);

  // Reset form
  entryForm.reset();
  document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('active'));
  moodInput.value = '0';
  dateInput.value = todayISO();
  
  // Clear sessions
  studySessionsDiv.innerHTML = '<h3>Study Sessions</h3>';
  studySessionsDiv.appendChild(createSessionRow());

  renderHistory();
  renderSummary(loadEntries());
});

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', () => {
  dateInput.value = todayISO();
  studySessionsDiv.appendChild(createSessionRow());
  renderHistory();
  renderSummary(loadEntries());
});;

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
