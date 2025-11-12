const connection = require('../db/connection');

class EventModel {
  static logEvent(email, event) {
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO events (email, event, event_time) VALUES (?, ?, NOW())`;
      connection.query(sql, [email, event], (err, result) => {
        if (err) return reject(err);
        resolve({ id: result.insertId });
      });
    });
  }

  static getEvents({ limit = 100, offset = 0, email, event, from, to } = {}) {
    return new Promise((resolve, reject) => {
      let sql = `SELECT id, email, event, event_time FROM events`;
      const clauses = [];
      const params = [];

      if (email) {
        clauses.push('email = ?');
        params.push(email);
      }
      if (event) {
        clauses.push('event LIKE ?');
        params.push(`%${event}%`);
      }
      if (from) {
        clauses.push('event_time >= ?');
        params.push(from);
      }
      if (to) {
        clauses.push('event_time <= ?');
        params.push(to);
      }

      if (clauses.length > 0) sql += ' WHERE ' + clauses.join(' AND ');

      sql += ' ORDER BY event_time DESC LIMIT ? OFFSET ?';
      params.push(limit);
      params.push(offset);

      connection.query(sql, params, (err, results) => {
        if (err) return reject(err);
        resolve(results || []);
      });
    });
  }
}

module.exports = EventModel;
