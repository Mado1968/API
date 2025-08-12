// 1. Carregar les variables d'entorn del fitxer .env
require('dotenv').config();

// 2. Importar les llibreries
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');

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
// 6. DEFINICIÓ DELS ENDPOINTS (PUNTS D'ACCÉS)
// -----------------------------------------------------

// GET - Obtenir TOTES les persones (Públic)
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

// GET - Obtenir UNA persona per la seva ID (Públic)
app.get('/api/persones/:id', async (req, res) => {
  const id = req.params.id;
  console.log(`Rebuda petició per a la persona amb ID: ${id}`);

  try {
    const { data, error } = await supabase
      .from('titanic')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (data) {
      res.status(200).json(data);
    } else {
      res.status(404).json({ message: `No s'ha trobat cap persona amb l'ID ${id}` });
    }

  } catch (error) {
    if (error.code === 'PGRST116') { // Supabase code for "single() on 0 rows"
        return res.status(404).json({ message: `No s'ha trobat cap persona amb l'ID ${id}` });
    }
    res.status(500).json({ error: error.message });
  }
});

// -----------------------------------------------------
// 7. ENDPOINTS D'AUTENTICACIÓ
// -----------------------------------------------------

// POST /api/login - Per iniciar sessió i obtenir un token
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email i contrasenya són obligatoris.' });
    }

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return res.status(401).json({ error: error.message });
        }

        // Supabase successful login returns a session object with an access_token
        const token = data.session.access_token; 
        console.log("Sending token:", token); // Add this line for debugging
        res.status(200).json({ token }); // Send only the token back
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
});

// -----------------------------------------------------
// 8. MIDDLEWARE D'AUTENTICACIÓ I RUTES PROTEGIDES
// -----------------------------------------------------

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extreu el token de "Bearer TOKEN"

    if (token == null) return res.sendStatus(401); // Si no hi ha token, no autoritzat

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Token invàlid o expirat.' });
        req.user = user; // Guardem l'usuari a la petició per a ús futur
        next(); // El token és vàlid, continuem
    });
};

// POST - Crear una nova persona (Ruta protegida)
app.post('/api/persones', authenticateToken, async (req, res) => {
  // req.body conté el JSON que envia el client (Apidog o el teu frontend)
  const novaPersona = req.body; 
  console.log("Rebuda petició per crear una nova persona:", novaPersona);
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

// PUT - Actualitzar una persona (Ruta protegida)
app.put('/api/persones/:id', authenticateToken, async (req, res) => {
  const id = req.params.id;
  const updatedInfo = req.body;
  console.log(`(Usuari: ${req.user.email}) vol actualitzar la persona amb ID: ${id}`);

  try {
    const { data, error } = await supabase
      .from('titanic')
      .update(updatedInfo)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Esborrar una persona (Ruta protegida)
app.delete('/api/persones/:id', authenticateToken, async (req, res) => {
  const id = req.params.id;
  console.log(`(Usuari: ${req.user.email}) vol esborrar la persona amb ID: ${id}`);

  try {
    const { data, error } = await supabase
      .from('titanic')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({ message: 'Persona esborrada correctament', deleted: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 9. Iniciar el servidor
app.listen(port, () => {
  console.log(`🚀 Servidor d'API local funcionant a http://localhost:${port}`);
  console.log("Esperant peticions de Apidog...");
});
