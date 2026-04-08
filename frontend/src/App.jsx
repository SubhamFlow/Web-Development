import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Clock, Calendar, Activity, Zap, MapPin, CheckCircle
} from 'lucide-react';

const SOCKET_SERVER_URL = 'http://localhost:5000';

function App() {
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState({});
  const [activeMatchId, setActiveMatchId] = useState(null);
  const [lastUpdate, setLastUpdate] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    fetch('http://localhost:5000/api/init')
      .then(res => res.json())
      .then(data => {
        setTeams(data.teams);
        setMatches(data.matches);
        setLastUpdate(data.timestamp);
        if (data.matches.length > 0 && !activeMatchId) {
          setActiveMatchId(data.matches[0].id);
        }
      })
      .catch(err => console.error("Could not fetch initial data", err));

    const socket = io(SOCKET_SERVER_URL);
    
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    
    socket.on('match_update', (data) => {
      setTeams(data.teams);
      setMatches(data.matches);
      setLastUpdate(data.timestamp);
    });

    return () => socket.disconnect();
  }, []);

  const activeMatch = matches.find(m => m.id === activeMatchId) || matches[0];

  if (!activeMatch) {
    return (
      <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="pulse-dot" style={{ transform: 'scale(2)' }}></div>
        <p style={{ marginTop: '2rem' }}>Initializing AI Predictor Engine...</p>
      </div>
    );
  }

  const team1 = teams[activeMatch.team1];
  const team2 = teams[activeMatch.team2];
  const isMatchLive = activeMatch.status === 'live';
  const isMatchCompleted = activeMatch.status === 'completed';

  const getBallClass = (b) => {
    if (b === 'W') return 'ball wicket';
    if (b === '4') return 'ball boundary';
    if (b === '6') return 'ball six';
    return 'ball';
  };

  const groupedMatches = matches.reduce((acc, m) => {
    if (!acc[m.date]) acc[m.date] = [];
    acc[m.date].push(m);
    return acc;
  }, {});

  return (
    <div className="app-container">
      <header className="header animate-fade-in">
        <div>
          <h1><Zap className="text-gradient" size={36} fill="#3A86FF" /> AI Cricket Predictor</h1>
          <div className="header-meta" style={{ marginTop: '0.5rem' }}>
            <span>IPL 2026 Live Forecasting</span>
            <span>Last Updated: {lastUpdate}</span>
          </div>
        </div>
        <div className="live-indicator">
          {isConnected ? (
            <>
              <div className="pulse-dot"></div>
              <span>System Online</span>
            </>
          ) : (
             <span style={{ color: 'var(--text-secondary)' }}>Connecting...</span>
          )}
        </div>
      </header>

      <main className="dashboard-grid">
        
        {/* LEFT COLUMN: ACTIVE MATCH */}
        <div className="main-content">
          <motion.div 
            key={activeMatch.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="match-card glass-panel"
            style={{ 
              boxShadow: isMatchLive ? '0 0 40px rgba(6, 214, 160, 0.1)' : 'var(--glass-shadow)'
            }}
          >
            <div className="match-header">
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={16} /> {activeMatch.date} <Clock size={16} style={{ marginLeft: '8px' }} /> {activeMatch.time}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={16} /> {activeMatch.venue}
              </span>
            </div>

            <div className="match-teams">
              <div className="team">
                <div className="team-logo-container" style={{ borderColor: team1.color, borderWidth: '2px', borderStyle: 'solid' }}>
                  <img src={team1.logo} alt={team1.name} />
                </div>
                <div className="team-name">{team1.name}</div>
                
                {isMatchLive && activeMatch.state.batting_team === activeMatch.team1 && (
                  <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="team-score text-gradient">
                    {activeMatch.state.score}/{activeMatch.state.wickets}
                    <div style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 500, display: 'flex', justifyContent: 'center' }}>
                      Overs: {activeMatch.state.overs} / 20.0
                    </div>
                  </motion.div>
                )}
                {isMatchLive && activeMatch.state.batting_team !== activeMatch.team1 && activeMatch.state.innings === 2 && (
                    <div className="team-score" style={{ fontSize: '2rem', color: 'var(--text-muted)' }}>
                       {activeMatch.state.target - 1}
                       <div style={{ fontSize: '0.8rem', fontWeight: 500 }}>Target: {activeMatch.state.target}</div>
                    </div>
                )}
                {!isMatchLive && !isMatchCompleted && activeMatch.predictions.predicted_score_team1 && (
                    <div className="team-score" style={{ fontSize: '2rem', color: 'var(--text-secondary)' }}>
                       Est: {activeMatch.predictions.predicted_score_team1}
                    </div>
                )}
              </div>

              <div className="match-vs">VS</div>

              <div className="team">
                <div className="team-logo-container" style={{ borderColor: team2.color, borderWidth: '2px', borderStyle: 'solid' }}>
                  <img src={team2.logo} alt={team2.name} />
                </div>
                <div className="team-name">{team2.name}</div>
                
                {isMatchLive && activeMatch.state.batting_team === activeMatch.team2 && (
                  <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="team-score text-gradient">
                    {activeMatch.state.score}/{activeMatch.state.wickets}
                    <div style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 500, display: 'flex', justifyContent: 'center' }}>
                      Overs: {activeMatch.state.overs} / 20.0
                    </div>
                  </motion.div>
                )}
                 {isMatchLive && activeMatch.state.batting_team !== activeMatch.team2 && activeMatch.state.innings === 2 && (
                    <div className="team-score" style={{ fontSize: '2rem', color: 'var(--text-muted)' }}>
                       {activeMatch.state.target - 1}
                       <div style={{ fontSize: '0.8rem', fontWeight: 500 }}>Target: {activeMatch.state.target}</div>
                    </div>
                )}
                {!isMatchLive && !isMatchCompleted && activeMatch.predictions.predicted_score_team2 && (
                    <div className="team-score" style={{ fontSize: '2rem', color: 'var(--text-secondary)' }}>
                       Est: {activeMatch.predictions.predicted_score_team2}
                    </div>
                )}
              </div>
            </div>

            {/* BATTER STATS FOR LIVE MATCH */}
            {isMatchLive && activeMatch.state.batter_1 && (
              <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--bg-primary)', borderRadius: '12px' }}>
                 <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: '10px', fontSize: '0.85rem', color: 'var(--text-secondary)', paddingBottom: '8px', borderBottom: '1px solid var(--glass-border)', marginBottom: '8px' }}>
                    <div>Batter</div>
                    <div style={{ textAlign: 'center' }}>R</div>
                    <div style={{ textAlign: 'center' }}>B</div>
                    <div style={{ textAlign: 'center' }}>4s</div>
                    <div style={{ textAlign: 'center' }}>6s</div>
                 </div>
                 
                 {/* Batter 1 */}
                 <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: '10px', fontSize: '0.95rem', fontWeight: 600, color: '#fff', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ color: activeMatch.state.on_strike === 1 ? 'var(--accent-blue)' : 'transparent' }}>▶</span>
                      {activeMatch.state.batter_1.name}
                    </div>
                    <div style={{ textAlign: 'center', color: 'var(--accent-blue)' }}>{activeMatch.state.batter_1.runs}</div>
                    <div style={{ textAlign: 'center' }}>{activeMatch.state.batter_1.balls}</div>
                    <div style={{ textAlign: 'center' }}>{activeMatch.state.batter_1.fours}</div>
                    <div style={{ textAlign: 'center' }}>{activeMatch.state.batter_1.sixes}</div>
                 </div>

                 {/* Batter 2 */}
                 <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: '10px', fontSize: '0.95rem', fontWeight: 600, color: '#fff', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ color: activeMatch.state.on_strike === 2 ? 'var(--accent-blue)' : 'transparent' }}>▶</span>
                      {activeMatch.state.batter_2.name}
                    </div>
                    <div style={{ textAlign: 'center', color: 'var(--accent-blue)' }}>{activeMatch.state.batter_2.runs}</div>
                    <div style={{ textAlign: 'center' }}>{activeMatch.state.batter_2.balls}</div>
                    <div style={{ textAlign: 'center' }}>{activeMatch.state.batter_2.fours}</div>
                    <div style={{ textAlign: 'center' }}>{activeMatch.state.batter_2.sixes}</div>
                 </div>
              </div>
            )}

            {isMatchLive && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                   {activeMatch.state.target ? `Target: ${activeMatch.state.target}` : activeMatch.toss}
                </div>
                <div className="recent-balls" style={{ flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginRight: '8px' }}>Recent:</span>
                  <AnimatePresence>
                    {activeMatch.state.recent_balls.map((b, idx) => (
                      <motion.div 
                        key={`${activeMatch.state.overs}-${idx}`}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={getBallClass(b)}
                      >
                        {b}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
            
            {!isMatchLive && (
              <div style={{ textAlign: 'center', marginTop: '1rem', padding: '1rem', background: 'var(--glass-bg)', borderRadius: '12px' }}>
                <div style={{ color: activeMatch.status === 'completed' ? 'var(--accent-green)' : 'var(--accent-blue)', fontWeight: 600, fontSize: '1.1rem' }}>
                  {activeMatch.status.toUpperCase()}
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '8px' }}>{activeMatch.toss}</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div className="ai-prediction-panel glass-panel">
            <h3 className="panel-title">
              <Activity size={20} /> AI Real-Time Insights
            </h3>
            
            <div className="prediction-stats">
              {isMatchLive && activeMatch.state.innings === 1 && (
                <div className="prediction-item">
                  <div className="pred-label">
                    <span>Predicted 1st Innings Score</span>
                    <span className="pred-value text-gradient-purple">{activeMatch.predictions.predicted_score}</span>
                  </div>
                </div>
              )}
              
              <div className="prediction-item">
                <div className="pred-label" style={{ marginBottom: '8px' }}>
                  <span>{isMatchLive ? "Live Win Probability" : "Pre-Match Win Probability"}</span>
                </div>
                
                <div className="pred-label" style={{ fontSize: '0.8rem', paddingBottom: '4px' }}>
                  <span style={{ color: team1.color }}>{team1.name}: {activeMatch.predictions.win_probability_team1}%</span>
                  <span style={{ color: team2.color }}>{team2.name}: {activeMatch.predictions.win_probability_team2}%</span>
                </div>

                <div className="prob-bar-container">
                  <div 
                    className="prob-bar" 
                    style={{ 
                      width: `${activeMatch.predictions.win_probability_team1}%`, 
                      background: team1.color 
                    }} 
                  />
                  <div 
                    className="prob-bar" 
                    style={{ 
                      width: `${activeMatch.predictions.win_probability_team2}%`, 
                      background: team2.color 
                    }} 
                  />
                </div>
              </div>

              <div className="prediction-item" style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px dashed rgba(255,255,255,0.1)' }}>
                  <div className="pred-label" style={{ alignItems: 'center' }}>
                    <span>AI Predicted Winner</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: teams[activeMatch.predictions.predicted_winner]?.color || '#fff', fontWeight: 'bold' }}>
                      {teams[activeMatch.predictions.predicted_winner]?.name} <CheckCircle size={16} />
                    </span>
                  </div>
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', flex: 1, overflowY: 'auto', maxHeight: '500px' }}>
            <h3 className="panel-title" style={{ marginBottom: '1.5rem', position: 'sticky', top: 0, background: 'var(--bg-primary)', paddingBottom: '10px', zIndex: 10 }}>
              <Trophy size={20} /> Match Center
            </h3>
            
            <div className="matches-list">
              {Object.keys(groupedMatches).map(date => (
                <div key={date} style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                     {date === '2026-04-08' ? "Today's Matches" : date}
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    {groupedMatches[date].map(m => {
                      const t1 = teams[m.team1];
                      const t2 = teams[m.team2];
                      return (
                        <div 
                          key={m.id} 
                          className={`mini-match glass-panel ${activeMatchId === m.id ? 'active' : ''}`}
                          onClick={() => setActiveMatchId(m.id)}
                          style={{ borderColor: m.status === 'live' ? 'rgba(6, 214, 160, 0.4)' : '' }}
                        >
                          <div className="mini-team">
                            <img src={t1.logo} alt={t1.name} className="mini-logo" />
                            <span className="mini-score">
                              {m.status === 'live' && m.state?.batting_team === m.team1 ? `${m.state.score}/${m.state.wickets}` : ''}
                            </span>
                          </div>
                          
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                             <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>VS</span>
                             {m.status === 'live' && <span style={{ fontSize: '0.65rem', color: 'var(--accent-green)', fontWeight: 'bold' }}>LIVE</span>}
                          </div>

                          <div className="mini-team" style={{ flexDirection: 'row-reverse' }}>
                            <img src={t2.logo} alt={t2.name} className="mini-logo" />
                            <span className="mini-score">
                              {m.status === 'live' && m.state?.batting_team === m.team2 ? `${m.state.score}/${m.state.wickets}` : ''}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default App;
