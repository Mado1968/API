// AFEGEIX AQUEST BLOC NOU AL TEU FITXER index.js

// GET - Obtenir UNA persona per la seva ID
app.get('/api/persones/:id', async (req, res) => {
  // Obtenim l'ID que ve a la URL (ex: /api/persones/3)
  const id = req.params.id;
  console.log(`Rebuda petició per a la persona amb ID: ${id}`);

  try {
    const { data, error } = await supabase
      .from('persones')
      .select('*')
      .eq('id', id) // <-- La clau: li diem que busqui on la columna 'id' sigui igual a l'ID rebut
      .single(); // <-- Important: diem que esperem només UN resultat, no un array

    if (error) throw error;

    if (data) {
      res.status(200).json(data);
    } else {
      // Si no es troba cap persona amb aquest ID
      res.status(404).json({ message: `No s'ha trobat cap persona amb l'ID ${id}` });
    }

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});