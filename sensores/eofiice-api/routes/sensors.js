const express = require("express");
const pool    = require("../db");
const router  = express.Router();

// GET /api/sensors?topic=...&limit=...
router.get("/", async (req, res) => {
  const { topic, limit = 100 } = req.query;
  const params = [];
  let where = "";
  if (topic) {
    where = "WHERE topic = $1";
    params.push(topic);
  }
  const sql = `
    SELECT * 
      FROM sensorizaciones 
    ${where} 
    ORDER BY ts DESC 
    LIMIT $${params.length + 1}`;
  params.push(parseInt(limit));
  const { rows } = await pool.query(sql, params);
  res.json(rows);
});

module.exports = router;
