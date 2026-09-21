# Sanjeevani Setu — Backend Setup

This is the API server + database for the project. It's separate from the
website files (`index.html`, `checker.html`, etc.) because the backend needs
to run with Node.js, while the website can be opened directly in a browser.

## What's in this folder

- `server.js` — the Express API server (all the routes/endpoints)
- `db.js` — sets up the SQLite database and creates the tables
- `package.json` — lists the two libraries this project depends on
- `sanjeevani.db` — the actual database file. It's created automatically
  the first time you run the server — you will NOT see it until then.

## How to run it (do this once per teammate's laptop)

1. Install [Node.js](https://nodejs.org) if you don't have it (LTS version).
2. Open a terminal in this `server` folder.
3. Install the dependencies:
   ```
   npm install
   ```
4. Start the server:
   ```
   npm start
   ```
5. You should see:
   ```
   Seeded 4 sample doctors.
   Sanjeevani Setu API running at http://localhost:3000
   ```
6. Leave this terminal running. Now open `checker.html` in your browser as
   before — it will automatically start talking to this server.

## Testing it without the frontend

You can check the API works on its own by visiting these in a browser
while the server is running:

- http://localhost:3000/api/doctors — should show a list of 3 doctors
  (the 4th, Dr. Suresh Rao, is marked unavailable and won't appear)
- http://localhost:3000/api/stats/regions — will be empty until you submit
  a symptom check from `checker.html`

## For your judge demo

Mention that SQLite (a single file, `sanjeevani.db`) was chosen deliberately
for rapid development — for a real multi-clinic deployment, this would move
to PostgreSQL or MongoDB Atlas, which the code is structured to make an easy
swap, since only `db.js` would need to change.
