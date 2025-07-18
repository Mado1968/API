// 1. Carregar les variables d'entorn del fitxer .env
require('dotenv').config();

// 2. Importar les llibreries
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

// 3. Configuració de l'API
const app = express();
const port = 3000; // La nostra API s'executarà al port 3000
app.use(express.json());

// 4. Configuració de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// 5. Middlewares (configuracions que s'executen abans de les rutes)
app.use(cors()); // Activa CORS per permetre crides des de Apidog/frontend
app.use(express.json()); // Permet que l'API entengui el format JSON a les peticions
app.use(express.static('public')); // Servir fitxers estàtics

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/landing.html');
});

// -----------------------------------------------------
// 6. DEFINICIÓ DE L'ENDPOINT (EL PUNT D'ACCÉS)
// -----------------------------------------------------
// Aquesta ruta ha de coincidir amb la que vas definir a Apidog
app.get('/api/persones', async (req, res) => {
  console.log("Rebuda una petició a /api/persones");

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const startIndex = (page - 1) * limit;

  try {
    const { data, error, count } = await supabase
      .from('titanic')
      .select('*', { count: 'exact' })
      .range(startIndex, startIndex + limit - 1);

    if (error) {
      throw error;
    }

    res.status(200).json({
      total: count,
      page,
      limit,
      data,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST - Crear una nova persona
app.post('/api/persones', async (req, res) => {
  // req.body conté el JSON que envia el client (Apidog o el teu frontend)
  const novaPersona = req.body; 
  console.log("Rebuda petició per crear una nova persona:", novaPersona);

  // Validació bàsica (en un projecte real seria més complexa)
 // Validació corregida perquè coincideixi amb el teu JSON d'exemple
if (!novaPersona.name || !novaPersona.age) {
    return res.status(400).json({ error: "Falten les propietats 'name' o 'age'" });
}

  try {
    const { data, error } = await supabase
      .from('titanic')
      .insert(novaPersona)
      .select() // Important: retorna la fila que s'acaba de crear
      .single();

    if (error) throw error;

    // Retornem un estat 201 (Created) i les dades de la nova persona
    res.status(201).json(data);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 7. Iniciar el servidor
app.listen(port, () => {
  console.log(`🚀 Servidor d'API local funcionant a http://localhost:${port}`);
  console.log("Esperant peticions de Apidog...");
});

