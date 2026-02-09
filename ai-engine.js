/**
 * PRASHANT AI Engine
 * Generates insights, suggestions, and motivational messages based on user data
 */

class AIEngine {
  constructor(entries, settings = {}) {
    this.entries = entries;
    this.settings = settings;
    this.analyze();
  }

  analyze() {
    this.stats = this.computeStats();
    this.patterns = this.detectPatterns();
    this.insights = this.generateInsights();
  }

  // Compute comprehensive statistics
  computeStats() {
    if (!this.entries.length) return null;

    const last7 = this.entries.slice(-7);
    const last30 = this.entries.slice(-30);

    let totalStudy = 0, totalSleep = 0, totalPhone = 0, moodScores = [];
    let subjectHours = {}, studyByDay = {};

    this.entries.forEach((e) => {
      e.sessions.forEach((s) => {
        totalStudy += Number(s.hours) || 0;
        subjectHours[s.subject] = (subjectHours[s.subject] || 0) + Number(s.hours || 0);
      });
      totalSleep += Number(e.sleepHours) || 0;
      totalPhone += Number(e.phoneHours) || 0;
      if (e.mood) moodScores.push(e.mood);
      studyByDay[e.date] = e.sessions.reduce((sum, s) => sum + (Number(s.hours) || 0), 0);
    });

    const avgStudy = (totalStudy / this.entries.length).toFixed(2);
    const avgSleep = (totalSleep / this.entries.length).toFixed(2);
    const avgPhone = (totalPhone / this.entries.length).toFixed(2);
    const avgMood = moodScores.length ? (moodScores.reduce((a, b) => a + b) / moodScores.length).toFixed(1) : 0;

    // Last 7 days stats
    const last7Study = last7.reduce((sum, e) => sum + e.sessions.reduce((s, ss) => s + (Number(ss.hours) || 0), 0), 0);
    const last7Sleep = last7.reduce((sum, e) => sum + (Number(e.sleepHours) || 0), 0);
    const last7Avg = (last7Study / Math.min(7, last7.length)).toFixed(2);

    // Find best and worst days
    const dayValues = Object.values(studyByDay).sort((a, b) => b - a);
    const bestDay = dayValues[0] || 0;
    const worstDay = dayValues[dayValues.length - 1] || 0;
    const avgDay = (dayValues.reduce((a, b) => a + b, 0) / dayValues.length).toFixed(2);

    return {
      totalStudy: parseFloat(totalStudy.toFixed(2)),
      totalSleep: parseFloat(totalSleep.toFixed(2)),
      totalPhone: parseFloat(totalPhone.toFixed(2)),
      avgStudy: parseFloat(avgStudy),
      avgSleep: parseFloat(avgSleep),
      avgPhone: parseFloat(avgPhone),
      avgMood: parseFloat(avgMood),
      bestDay: parseFloat(bestDay.toFixed(2)),
      worstDay: parseFloat(worstDay.toFixed(2)),
      avgDayStudy: parseFloat(avgDay),
      daysLogged: this.entries.length,
      topSubject: Object.entries(subjectHours).sort((a, b) => b[1] - a[1])[0] || null,
      last7Study: parseFloat(last7Study.toFixed(2)),
      last7Sleep: parseFloat(last7Sleep.toFixed(2)),
      last7DaysCount: Math.min(7, last7.length),
    };
  }

  // Detect patterns in user behavior
  detectPatterns() {
    if (!this.entries.length) return {};

    const last7 = this.entries.slice(-7);
    const studyHours = last7.map(e => e.sessions.reduce((sum, s) => sum + (Number(s.hours) || 0), 0));
    const sleepHours = last7.map(e => Number(e.sleepHours) || 0);
    const phoneHours = last7.map(e => Number(e.phoneHours) || 0);

    // Consistency score (lower variance = more consistent)
    const variance = (arr) => {
      if (arr.length < 2) return 0;
      const mean = arr.reduce((a, b) => a + b) / arr.length;
      return arr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / arr.length;
    };

    const studyConsistency = Math.max(0, 100 - variance(studyHours) * 10);
    const sleepRegularity = Math.max(0, 100 - variance(sleepHours.filter(h => h > 0)) * 10);

    // Trend detection (is user improving?)
    const trend = (arr) => {
      if (arr.length < 2) return 0;
      const first = arr.slice(0, Math.ceil(arr.length / 2)).reduce((a, b) => a + b) / Math.ceil(arr.length / 2);
      const second = arr.slice(Math.ceil(arr.length / 2)).reduce((a, b) => a + b) / (arr.length - Math.ceil(arr.length / 2));
      return ((second - first) / first * 100).toFixed(1);
    };

    const studyTrend = trend(studyHours);
    const sleepTrend = trend(sleepHours.filter(h => h > 0));

    return {
      studyConsistency: Math.round(studyConsistency),
      sleepRegularity: Math.round(sleepRegularity),
      studyTrend: parseFloat(studyTrend),
      sleepTrend: parseFloat(sleepTrend),
      isDecreasingSleep: sleepTrend < -10,
      isIncreasingPhone: trend(phoneHours) > 10,
      isConsistent: studyConsistency > 70,
    };
  }

  // Generate AI insights and recommendations
  generateInsights() {
    if (!this.stats) return [];

    const insights = [];
    const s = this.stats;
    const p = this.patterns;

    // Insight 1: Study consistency
    if (p.isConsistent) {
      insights.push({
        type: 'positive',
        emoji: '⭐',
        title: 'Excellent Consistency!',
        message: `आप पिछले ${s.last7DaysCount} दिनों में बहुत नियमित हैं। औसतन ${s.last7Study} घंटे पढ़ाई प्रति दिन।`,
        english: `You're very consistent! Average ${s.avgStudy}h study per day.`
      });
    } else if (p.studyConsistency > 50) {
      insights.push({
        type: 'good',
        emoji: '👍',
        title: 'Good Progress',
        message: `अच्छा प्रयास! पढ़ाई में थोड़ी सुधार करने की गुंजाइश है।`,
        english: `Good effort! Work on being more consistent.`
      });
    } else {
      insights.push({
        type: 'warning',
        emoji: '⚠️',
        title: 'Inconsistent Pattern',
        message: 'आपकी पढ़ाई में उतार-चढ़ाव है। एक स्थिर दिनचर्या बनाएं।',
        english: 'Your study is irregular. Build a stable routine.'
      });
    }

    // Insight 2: Sleep analysis
    if (s.avgSleep < 6) {
      insights.push({
        type: 'warning',
        emoji: '😴',
        title: 'Insufficient Sleep',
        message: `औसतन ${s.avgSleep} घंटे की नींद। कम से कम 7 घंटे का लक्ष्य रखें।`,
        english: `You're sleeping only ${s.avgSleep}h/day. Aim for 7h.`
      });
    } else if (s.avgSleep > 9) {
      insights.push({
        type: 'info',
        emoji: '🛌',
        title: 'Excessive Sleep',
        message: `${s.avgSleep} घंटे की नींद अधिक हो सकती है। अपने लक्ष्य को ट्रैक करें।`,
        english: `${s.avgSleep}h sleep might be excessive. Maintain balance.`
      });
    } else {
      insights.push({
        type: 'positive',
        emoji: '✅',
        title: 'Perfect Sleep',
        message: `बेहतरीन! ${s.avgSleep} घंटे की नींद आपके लिए आदर्श है।`,
        english: `Great! ${s.avgSleep}h sleep is healthy for you.`
      });
    }

    // Insight 3: Phone usage
    if (s.avgPhone > 4) {
      insights.push({
        type: 'warning',
        emoji: '📱',
        title: 'High Phone Usage',
        message: `दैनिक ${s.avgPhone} घंटे फोन। पढ़ाई के समय इसे दूर रखें।`,
        english: `${s.avgPhone}h phone daily. Reduce during study time.`
      });
    } else {
      insights.push({
        type: 'positive',
        emoji: '📱',
        title: 'Good Digital Balance',
        message: `प्रति दिन ${s.avgPhone} घंटे फोन। अच्छा संतुलन रखें।`,
        english: `${s.avgPhone}h phone usage is balanced.`
      });
    }

    // Insight 4: Subject focus
    if (s.topSubject) {
      const [subject, hours] = s.topSubject;
      insights.push({
        type: 'info',
        emoji: '📚',
        title: 'Top Subject',
        message: `${subject} पर सबसे ज्यादा फोकस (${ hours.toFixed(1)} घंटे)`,
        english: `You focus most on ${subject} (${hours.toFixed(1)}h).`
      });
    }

    // Insight 5: Weekly trend
    if (p.studyTrend > 10) {
      insights.push({
        type: 'positive',
        emoji: '📈',
        title: 'Improving Trend',
        message: `बधाई! आपकी पढ़ाई में ${p.studyTrend}% की बढ़ोतरी हुई है।`,
        english: `Excellent! Your study increased by ${p.studyTrend}%.`
      });
    } else if (p.studyTrend < -10) {
      insights.push({
        type: 'warning',
        emoji: '📉',
        title: 'Declining Study',
        message: `ध्यान दें: पिछले सप्ताह पढ़ाई में ${Math.abs(p.studyTrend)}% की गिरावट।`,
        english: `Alert: Study declined by ${Math.abs(p.studyTrend)}% this week.`
      });
    }

    return insights;
  }

  // Generate daily motivation message
  getDailyMotivation() {
    if (!this.stats) return "शुरुआत करें! आज का पहला एंट्री जोड़ें।";

    const messages = [
      {
        condition: this.stats.avgStudy > 5,
        hindi: "🎯 आप एक शिक्षार्थी हैं, लेकिन एक होशियार नहीं। अपने लक्ष्य को आगे बढ़ाएं।",
        english: "You're dedicated. Keep pushing towards your goals!"
      },
      {
        condition: this.patterns.isConsistent,
        hindi: "⭐ आपकी निरंतरता ही आपकी ताकत है। इसी तरह चलते रहें।",
        english: "Your consistency is your superpower. Keep it up!"
      },
      {
        condition: this.stats.avgSleep >= 7 && this.stats.avgStudy >= 4,
        hindi: "😊 बेहतरीन संतुलन! पढ़ाई और आराम दोनों सही है।",
        english: "Perfect balance! Study and rest are both good."
      },
      {
        condition: this.stats.avgPhone > 4,
        hindi: "📱 कम फोन, ज्यादा किताब। आप कर सकते हैं!",
        english: "Less phone, more books. You've got this!"
      },
      {
        condition: true,
        hindi: "💪 आज का दिन आपका है। कुछ बेहतरीन सीखें।",
        english: "Make today count. Learn something amazing!"
      }
    ];

    const applicable = messages.filter(m => m.condition);
    const msg = applicable[Math.floor(Math.random() * applicable.length)];
    return { hindi: msg.hindi, english: msg.english };
  }

  // AI Weekly Summary
  getWeeklySummary() {
    if (!this.stats) return null;

    const s = this.stats;
    const p = this.patterns;

    return {
      title: "सप्ताह का विश्लेषण",
      titleEng: "Weekly Analysis",
      totalHours: s.last7Study,
      avgPerDay: (s.last7Study / s.last7DaysCount).toFixed(2),
      avgSleep: (s.last7Sleep / s.last7DaysCount).toFixed(2),
      consistency: p.studyConsistency,
      trend: p.studyTrend,
      summary: this.generateWeeklySummaryText(),
      recommendations: this.generateRecommendations()
    };
  }

  // Generate human-like weekly summary
  generateWeeklySummaryText() {
    const s = this.stats;
    const p = this.patterns;

    let text = '';

    if (p.studyConsistency > 80) {
      text = `आप इस सप्ताह बहुत नियमित रहे। ${s.last7Study} घंटे की पढ़ाई की। `;
    } else if (p.studyConsistency > 50) {
      text = `अच्छा सप्ताह रहा। ${s.last7Study} घंटे पढ़ाई के साथ कुछ दिन कम थे। `;
    } else {
      text = `यह सप्ताह अनियमित रहा। केवल ${s.last7Study} घंटे पढ़ाई। `;
    }

    if (s.last7Sleep / 7 < 6) {
      text += `नींद कम थी - ध्यान दें। `;
    } else {
      text += `नींद अच्छी रही। `;
    }

    return text;
  }

  // AI Recommendations
  generateRecommendations() {
    const recs = [];
    const s = this.stats;
    const p = this.patterns;

    if (s.avgSleep < 7) {
      recs.push({
        emoji: '😴',
        hindi: 'रात 11 बजे तक सो जाएं',
        english: 'Sleep by 11 PM'
      });
    }

    if (s.avgPhone > 3) {
      recs.push({
        emoji: '📵',
        hindi: 'पढ़ाई के दौरान फोन दूर रखें',
        english: 'Keep phone away during study'
      });
    }

    if (p.studyConsistency < 60) {
      recs.push({
        emoji: '⏰',
        hindi: 'एक निश्चित समय पर पढ़ाई करें',
        english: 'Study at fixed hours'
      });
    }

    if (s.avgStudy < 3) {
      recs.push({
        emoji: '📚',
        hindi: 'दैनिक 3 घंटे का लक्ष्य रखें',
        english: 'Aim for 3 hours daily'
      });
    }

    return recs.slice(0, 3); // Top 3 recommendations
  }

  // Get overall productivity score (0-100)
  getProductivityScore() {
    if (!this.stats) return 0;

    const weights = {
      study: 0.35,
      sleep: 0.25,
      consistency: 0.25,
      phone: 0.15
    };

    let score = 0;

    // Study score (0-35): based on avg hours
    const studyScore = Math.min(35, (this.stats.avgStudy / 5) * 35);

    // Sleep score (0-25): normalize to 7-8 hours
    const sleepScore = Math.min(25, Math.abs(25 - Math.abs((this.stats.avgSleep - 7.5) * 4)));

    // Consistency score (0-25): use pattern consistency
    const consistencyScore = (this.patterns.studyConsistency / 100) * 25;

    // Phone score (0-15): lower is better
    const phoneScore = Math.max(0, 15 - (this.stats.avgPhone / 6) * 15);

    score = studyScore + sleepScore + consistencyScore + phoneScore;
    return Math.round(score);
  }
}

// Helper function to format insights for UI
function formatInsight(insight, mode = 'hindi') {
  const text = mode === 'hindi' ? insight.message : insight.english;
  return `${insight.emoji} <strong>${insight.title}</strong><br/>${text}`;
}
