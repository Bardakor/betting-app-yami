const sqlite3 = require('sqlite3').verbose();
const { promisify } = require('util');

let db;

const initDatabase = async (dbPath) => {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err.message);
        reject(err);
        return;
      }
      
      console.log('Connected to SQLite database');
      
      // Create tables
      const createTables = `
        CREATE TABLE IF NOT EXISTS team_stats (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          team_name TEXT NOT NULL,
          league_name TEXT NOT NULL,
          season TEXT NOT NULL,
          matches_played INTEGER DEFAULT 0,
          wins INTEGER DEFAULT 0,
          draws INTEGER DEFAULT 0,
          losses INTEGER DEFAULT 0,
          goals_for INTEGER DEFAULT 0,
          goals_against INTEGER DEFAULT 0,
          home_wins INTEGER DEFAULT 0,
          home_draws INTEGER DEFAULT 0,
          home_losses INTEGER DEFAULT 0,
          away_wins INTEGER DEFAULT 0,
          away_draws INTEGER DEFAULT 0,
          away_losses INTEGER DEFAULT 0,
          recent_form TEXT,
          avg_goals_scored REAL DEFAULT 0,
          avg_goals_conceded REAL DEFAULT 0,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(team_name, league_name, season)
        );

        CREATE TABLE IF NOT EXISTS head_to_head (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          team1 TEXT NOT NULL,
          team2 TEXT NOT NULL,
          league_name TEXT NOT NULL,
          total_matches INTEGER DEFAULT 0,
          team1_wins INTEGER DEFAULT 0,
          team2_wins INTEGER DEFAULT 0,
          draws INTEGER DEFAULT 0,
          last_5_results TEXT,
          avg_goals_team1 REAL DEFAULT 0,
          avg_goals_team2 REAL DEFAULT 0,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(team1, team2, league_name)
        );

        CREATE TABLE IF NOT EXISTS odds_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          fixture_id TEXT NOT NULL,
          home_team TEXT NOT NULL,
          away_team TEXT NOT NULL,
          league_name TEXT NOT NULL,
          home_win_odds REAL NOT NULL,
          draw_odds REAL NOT NULL,
          away_win_odds REAL NOT NULL,
          over_2_5_odds REAL,
          under_2_5_odds REAL,
          btts_yes_odds REAL,
          btts_no_odds REAL,
          calculation_method TEXT,
          confidence_score REAL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `;
      
      db.exec(createTables, (err) => {
        if (err) {
          console.error('Error creating tables:', err.message);
          reject(err);
        } else {
          console.log('Database tables created successfully');
          resolve();
        }
      });
    });
  });
};

const getDatabase = () => {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
};

// Promisified database methods
const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

module.exports = {
  initDatabase,
  getDatabase,
  dbGet,
  dbAll,
  dbRun
}; 