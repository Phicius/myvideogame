const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Chemin vers db.json
const dbPath = path.join(__dirname, 'src', 'models', 'db.json');

// Fonction pour lire la BDD
function readDb() {
  const data = fs.readFileSync(dbPath, 'utf8');
  return JSON.parse(data);
}

// Fonction pour écrire la BDD
function writeDb(db) {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

// GET /gameRooms - Liste toutes les salles
app.get('/gameRooms', (req, res) => {
  try {
    const db = readDb();
    res.json(db.gameRooms || []);
  } catch (error) {
    console.error('Erreur lecture gameRooms:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /gameRooms/:id - Récupère une salle spécifique
app.get('/gameRooms/:id', (req, res) => {
  try {
    const db = readDb();
    const room = db.gameRooms.find((r) => r.id === req.params.id);
    if (room) {
      res.json(room);
    } else {
      res.status(404).json({ error: 'Salle non trouvée' });
    }
  } catch (error) {
    console.error('Erreur GET gameRooms/:id:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /gameRooms - Crée une nouvelle salle
app.post('/gameRooms', (req, res) => {
  try {
    const db = readDb();
    const newRoom = req.body;
    db.gameRooms.push(newRoom);
    writeDb(db);
    console.log(`✅ Salle créée: ${newRoom.id}`);
    res.status(201).json(newRoom);
  } catch (error) {
    console.error('Erreur POST gameRooms:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /gameRooms/:id - Met à jour une salle
app.put('/gameRooms/:id', (req, res) => {
  try {
    const db = readDb();
    const index = db.gameRooms.findIndex((r) => r.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Salle non trouvée' });
    }
    db.gameRooms[index] = { ...db.gameRooms[index], ...req.body };
    writeDb(db);
    console.log(`✅ Salle mise à jour: ${req.params.id}`);
    res.json(db.gameRooms[index]);
  } catch (error) {
    console.error('Erreur PUT gameRooms/:id:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE /gameRooms/:id - Supprime une salle
app.delete('/gameRooms/:id', (req, res) => {
  try {
    const db = readDb();
    const index = db.gameRooms.findIndex((r) => r.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Salle non trouvée' });
    }
    const deleted = db.gameRooms.splice(index, 1);
    writeDb(db);
    console.log(`✅ Salle supprimée: ${req.params.id}`);
    res.json(deleted[0]);
  } catch (error) {
    console.error('Erreur DELETE gameRooms/:id:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /pokemons - Liste tous les pokemons
app.get('/pokemons', (req, res) => {
  try {
    const db = readDb();
    res.json(db.pokemons || []);
  } catch (error) {
    console.error('Erreur GET pokemons:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /pokemons/:id - Récupère un pokemon spécifique
app.get('/pokemons/:id', (req, res) => {
  try {
    const db = readDb();
    const pokemon = db.pokemons.find((p) => p.id === req.params.id);
    if (pokemon) {
      res.json(pokemon);
    } else {
      res.status(404).json({ error: 'Pokemon non trouvé' });
    }
  } catch (error) {
    console.error('Erreur GET pokemons/:id:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🎮 Serveur API en écoute sur http://localhost:${PORT}`);
  console.log(`📊 BDD: ${dbPath}`);
});
