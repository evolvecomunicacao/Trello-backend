const express = require(“express”);
const cors = require(“cors”);
const fetch = require(“node-fetch”);

const app = express();

app.use(cors({ origin: "*", methods: ["GET","POST","PUT","DELETE"] }));

app.use(express.json());

const TRELLO = “https://api.trello.com/1”;
const KEY = process.env.TRELLO_KEY;
const TOKEN = process.env.TRELLO_TOKEN;

app.get(”/boards”, async (req, res) => {
try {
const r = await fetch(`${TRELLO}/members/me/boards?key=${KEY}&token=${TOKEN}`);
const data = await r.json();
res.json(data.filter(b => !b.closed).map(b => ({ id: b.id, name: b.name })));
} catch (e) { res.status(500).json({ error: e.message }); }
});

app.get(”/boards/:id/lists”, async (req, res) => {
try {
const r = await fetch(`${TRELLO}/boards/${req.params.id}/lists?key=${KEY}&token=${TOKEN}`);
const data = await r.json();
res.json(data.filter(l => !l.closed).map(l => ({ id: l.id, name: l.name })));
} catch (e) { res.status(500).json({ error: e.message }); }
});

app.get(”/lists/:id/cards”, async (req, res) => {
try {
const r = await fetch(`${TRELLO}/lists/${req.params.id}/cards?key=${KEY}&token=${TOKEN}`);
const data = await r.json();
res.json(data.map(c => ({ id: c.id, name: c.name, desc: c.desc, due: c.due, url: c.shortUrl })));
} catch (e) { res.status(500).json({ error: e.message }); }
});

app.post(”/cards”, async (req, res) => {
try {
const { name, idList, desc, due } = req.body;
const params = new URLSearchParams({ key: KEY, token: TOKEN, name, idList });
if (desc) params.append(“desc”, desc);
if (due) params.append(“due”, due);
const r = await fetch(`${TRELLO}/cards`, { method: “POST”, body: params });
const data = await r.json();
res.json({ id: data.id, name: data.name, url: data.shortUrl });
} catch (e) { res.status(500).json({ error: e.message }); }
});

app.put(”/cards/:id/move”, async (req, res) => {
try {
const { idList } = req.body;
const params = new URLSearchParams({ key: KEY, token: TOKEN, idList });
const r = await fetch(`${TRELLO}/cards/${req.params.id}`, { method: “PUT”, body: params });
const data = await r.json();
res.json({ id: data.id, name: data.name, url: data.shortUrl });
} catch (e) { res.status(500).json({ error: e.message }); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Trello backend rodando na porta ${PORT}`));
