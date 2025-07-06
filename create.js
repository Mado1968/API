// AFEGEIX AQUEST BLOC NOU

// POST - Crear una nova persona
app.post('/api/persones', async (req, res) => {
  // req.body conté el JSON que envia el client (Apidog o el teu frontend)
  const novaPersona = req.body; 
  console.log("Rebuda petició per crear una nova persona:", novaPersona);

  // Validació bàsica (en un projecte real seria més complexa)
  if (!novaPersona.edad || !novaPersona.grup_edad) {
    return res.status(400).json({ error: "Falten les propietats 'edad' o 'grup_edad'" });
  }

  try {
    const { data, error } = await supabase
      .from('persones')
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