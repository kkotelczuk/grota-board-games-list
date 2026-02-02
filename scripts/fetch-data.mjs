import fs from "node:fs/promises";
import path from "node:path";
import "dotenv/config";
import Papa from "papaparse";

const csvUrl = process.env.CSV_URL;

if (!csvUrl) {
  throw new Error("Missing CSV_URL in environment (.env).");
}

const toInt = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number.parseInt(String(value), 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const toFloat = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number.parseFloat(String(value).replace(",", "."));
  return Number.isNaN(parsed) ? null : parsed;
};

const parsePlayers = (value) => {
  if (value === undefined || value === null || value === "") {
    return { min: null, max: null };
  }

  const raw = String(value).trim();
  if (!raw) return { min: null, max: null };

  const numbers =
    raw.match(/\d+/g)?.map((num) => Number.parseInt(num, 10)) || [];
  if (numbers.length === 0) return { min: null, max: null };

  if (raw.includes("+")) {
    return { min: numbers[0], max: null };
  }

  if (raw.includes("-") || raw.includes(",")) {
    return { min: numbers[0], max: numbers[1] ?? numbers[0] };
  }

  return { min: numbers[0], max: numbers[0] };
};

const mapDifficulty = (weight) => {
  if (weight === null) return { key: "unknown", label: "Nieznany" };
  if (weight >= 3.5) return { key: "hard", label: "Trudny" };
  if (weight >= 2.0) return { key: "medium", label: "Średni" };
  return { key: "easy", label: "Łatwy" };
};

const response = await fetch(csvUrl);
if (!response.ok) {
  throw new Error(
    `CSV download failed: ${response.status} ${response.statusText}`,
  );
}

const csvText = await response.text();
const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });

const games = parsed.data
  .map((row) => {
    const name =
      row["Nazwa gry"] ||
      row.Name ||
      row.Title ||
      row["Nazwa"] ||
      row["Tytuł"] ||
      row["Game"] ||
      "";
    const weight = toFloat(
      row["BGG Trudność"] || row.Weight || row["Waga"] || row["Weight"],
    );
    const difficulty = mapDifficulty(weight);
    const playersValue = row["Ilość graczy"] || row.Players || row["Players"];
    const players = parsePlayers(playersValue);

    return {
      id: row.Id || row.ID || row["BGG ID"] || row["BggId"] || null,
      name: String(name).trim(),
      minPlayers:
        players.min ??
        toInt(
          row.MinPlayers ||
            row["Min Players"] ||
            row["Min"] ||
            row["Min graczy"],
        ),
      maxPlayers:
        players.max ??
        toInt(
          row.MaxPlayers ||
            row["Max Players"] ||
            row["Max"] ||
            row["Max graczy"],
        ),
      playTime:
        row["Długość gry(min)"] ||
        row.PlayTime ||
        row["Czas"] ||
        row["Play Time"] ||
        null,
      weight,
      difficulty,
      language: row["Język"] || null,
      owner: row["Własność"] || null,
      imageUrl: row.Image || row["Image URL"] || row["Okładka"] || null,
      raw: row,
    };
  })
  .filter((game) => game.name.length > 0);

const output = {
  updatedAt: new Date().toISOString(),
  games,
};

const outputPath = path.resolve("src/data/games.json");
await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.writeFile(outputPath, JSON.stringify(output, null, 2), "utf-8");

console.log(`Saved ${games.length} games to ${outputPath}`);
