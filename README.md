# Dfunkt - Ny funktionärslista för Konglig Datasktionen

Dfunkt håller koll på roller, mandat och personer. Roller har sina beskrivningar och emailaddresser, mandat har en sträckningstid, en person, och en roll, och personer är personer.

Dfunkt är ännu i ett tidigt stadium, men just nu listar den datan den har och man kan lägga till de olika sakerna.

## Usage (rest api)

 * `GET /roles/list` listar alla roller, och deras senaste mandat.
 * `GET /roles/:RoleId/list` listar en specifik roll, och alla mandat på den (som nånsin varit ever).

## Roadmap, I guess

 * Oh right, byta till Postregsql, right? Tror den kör SQLite3 i bakgrunden nu.

## Installation

    npm install
    npm start

Och sen kan du öppna `localhost:5000` i webbläsarn.
