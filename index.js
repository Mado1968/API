// 1. Carregar les variables d'entorn del fitxer .env
require('dotenv').config();

// 2. Importar les llibreries
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

// 3. Configuració de l'API
const app = express();
const port = 3000; // La nostra API s'executarà al port 3000

// 4. Configuració de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// 5. Middlewares (configuracions que s'executen abans de les rutes)
app.use(cors()); // Activa CORS per permetre crides des de Apidog/frontend
app.use(express.json()); // Permet que l'API entengui el format JSON a les peticions

// -----------------------------------------------------
// 6. DEFINICIÓ DE L'ENDPOINT (EL PUNT D'ACCÉS)
// -----------------------------------------------------
// Aquesta ruta ha de coincidir amb la que vas definir a Apidog
app.get('/api/persones', async (req, res) => {
  console.log("Rebuda una petició a /api/persones");

  try {
    // Fem la consulta a la taula 'persones' de Supabase per obtenir totes les files
    const { data, error } = await supabase
      .from('titanic') // El nom de la teva taula
      .select('*');     // '*' significa "totes les columnes"

    // Si Supabase retorna un error, l'enviem com a resposta
    if (error) {
      throw error;
    }

    // Si tot va bé, enviem les dades obtingudes amb un estat 200 (OK)
    res.status(200).json(data);

  } catch (error) {
    // Si hi ha qualsevol altre error, l'enviem com a resposta amb un estat 500
    res.status(500).json({ error: error.message });
  }
});

// 7. Iniciar el servidor
app.listen(port, () => {
  console.log(`🚀 Servidor d'API local funcionant a http://localhost:${port}`);
  console.log("Esperant peticions de Apidog...");
});