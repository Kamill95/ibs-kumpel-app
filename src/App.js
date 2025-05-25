import React, { useState, useEffect } from 'react';
import './App.css'; // Stellen Sie sicher, dass diese CSS-Datei existiert oder Sie Stile direkt einfügen

// Hilfsfunktion zur Formatierung des Datums
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

function App() {
  // State-Variablen für Symptome und Speicherung
  const [symptom, setSymptom] = useState('');
  const [intensity, setIntensity] = useState('3'); // Standardintensität
  const [note, setNote] = useState('');
  const [entries, setEntries] = useState([]);
  const [filterDate, setFilterDate] = useState('');

  // Effekt zum Laden der Einträge aus dem lokalen Speicher beim Start
  useEffect(() => {
    const storedEntries = JSON.parse(localStorage.getItem('ibsKumpelEntries')) || [];
    setEntries(storedEntries);
  }, []);

  // Effekt zum Speichern der Einträge im lokalen Speicher bei Änderungen
  useEffect(() => {
    localStorage.setItem('ibsKumpelEntries', JSON.stringify(entries));
  }, [entries]);

  // PWA Service Worker Registrierung
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('Service Worker registriert mit Scope:', registration.scope);
        })
        .catch(error => {
          console.error('Service Worker Registrierung fehlgeschlagen:', error);
        });
    }
  }, []);

  // Handler für das Hinzufügen eines Eintrags
  const handleAddEntry = () => {
    if (!symptom.trim()) {
      alert('Bitte Symptom eingeben!');
      return;
    }

    const newEntry = {
      id: Date.now(), // Eindeutige ID
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      time: new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
      symptom: symptom.trim(),
      intensity: intensity,
      note: note.trim()
    };

    setEntries([...entries, newEntry]);
    // Felder zurücksetzen
    setSymptom('');
    setIntensity('3');
    setNote('');
  };

  // Handler für das Löschen eines Eintrags
  const handleDeleteEntry = (id) => {
    setEntries(entries.filter(entry => entry.id !== id));
  };

  // Einträge filtern basierend auf dem ausgewählten Datum
  const filteredEntries = filterDate
    ? entries.filter(entry => entry.date === filterDate)
    : entries;

  return (
    <div className="App">
      <header className="App-header">
        <h1>IBS Kumpel</h1>
        <p>Dein Begleiter bei Reizdarm-Symptomen</p>
      </header>

      <main>
        <section className="entry-form">
          <h2>Neuer Eintrag</h2>
          <div>
            <label htmlFor="symptom">Symptom:</label>
            <input
              id="symptom"
              type="text"
              value={symptom}
              onChange={(e) => setSymptom(e.target.value)}
              placeholder="z.B. Blähungen, Schmerz"
            />
          </div>
          <div>
            <label htmlFor="intensity">Intensität (1-5):</label>
            <input
              id="intensity"
              type="range"
              min="1"
              max="5"
              value={intensity}
              onChange={(e) => setIntensity(e.target.value)}
            />
            <span>{intensity}</span>
          </div>
          <div>
            <label htmlFor="note">Notiz:</label>
            <textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Zusätzliche Infos, z.B. was gegessen wurde"
            ></textarea>
          </div>
          <button onClick={handleAddEntry}>Eintrag hinzufügen</button>
        </section>

        <section className="entry-list">
          <h2>Deine Einträge</h2>
          <div className="filter-date-container">
            <label htmlFor="filterDate">Einträge filtern nach Datum:</label>
            <input
              id="filterDate"
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
            {filterDate && <button onClick={() => setFilterDate('')}>Filter löschen</button>}
          </div>

          {filteredEntries.length === 0 ? (
            <p>Noch keine Einträge vorhanden.</p>
          ) : (
            <ul>
              {filteredEntries.map((entry) => (
                <li key={entry.id}>
                  <p><strong>Datum:</strong> {formatDate(entry.date)}</p>
                  <p><strong>Uhrzeit:</strong> {entry.time}</p>
                  <p><strong>Symptom:</strong> {entry.symptom}</p>
                  <p><strong>Intensität:</strong> {entry.intensity}/5</p>
                  {entry.note && <p><strong>Notiz:</strong> {entry.note}</p>}
                  <button onClick={() => handleDeleteEntry(entry.id)}>Löschen</button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      <footer>
        <p>&copy; 2024 IBS Kumpel App</p>
      </footer>
    </div>
  );
}

export default App;