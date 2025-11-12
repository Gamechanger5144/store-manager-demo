const EventModel = require('../models/eventModel');

class EventController {
  // GET /api/events - list events (admin/main only)
  static async listEvents(req, res) {
    try {
      // only admin (1) or main (2) can view logs
      if (!req.user || !(req.user.user_type >= 1)) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const { limit = 100, offset = 0, email, event, from, to } = req.query;
      const events = await EventModel.getEvents({ limit: parseInt(limit), offset: parseInt(offset), email, event, from, to });
      res.json({ success: true, events });
    } catch (err) {
      console.error('List events error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  }

  // GET /api/events/export - CSV export
  static async exportCSV(req, res) {
    try {
      if (!req.user || !(req.user.user_type >= 1)) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const { email, event, from, to } = req.query;
      const events = await EventModel.getEvents({ limit: 10000, offset: 0, email, event, from, to });

      // Build CSV
      let csv = 'id,email,event,event_time\n';
      events.forEach(row => {
        csv += `${row.id},"${row.email}","${row.event}","${row.event_time}"\n`;
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="events.csv"');
      res.send(csv);
    } catch (err) {
      console.error('Export events error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  }
}

module.exports = EventController;
