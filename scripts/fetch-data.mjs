import fs from "node:fs/promises";
import path from "node:path";
import "dotenv/config";
import Papa from "papaparse";

const COVERS_DIR = path.resolve("public/images/covers");
const MANIFEST_PATH = path.resolve("public/images/covers/.manifest.json");

/**
 * Loads the covers manifest (contains bggId per slug from fetch-covers)
 */
async function loadCoversManifest() {
  try {
    const content = await fs.readFile(MANIFEST_PATH, "utf-8");
    return JSON.parse(content);
  } catch {
    return { covers: {} };
  }
}

/**
 * Creates a URL-safe slug from game name (must match fetch-covers.mjs)
 */
function createSlug(name) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, "") // Remove special chars
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with dashes
    .replace(/-+/g, "-") // Remove multiple dashes
    .slice(0, 100); // Limit length
}

/**
 * Checks if a cover file exists and returns its path
 */
async function findCoverPath(slug) {
  const extensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
  for (const ext of extensions) {
    try {
      await fs.access(path.join(COVERS_DIR, `${slug}${ext}`));
      return `/images/covers/${slug}${ext}`;
    } catch {
      // File doesn't exist, try next extension
    }
  }
  return null;
}

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

// First pass: parse basic game data
const rawGames = parsed.data
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
      csvImageUrl: row.Image || row["Image URL"] || row["Okładka"] || null,
      raw: row,
    };
  })
  .filter((game) => game.name.length > 0);

// Load covers manifest for BGG URLs (from fetch-covers)
const manifest = await loadCoversManifest();

// Second pass: add local cover paths and BGG URL
const games = await Promise.all(
  rawGames.map(async (game) => {
    const slug = createSlug(game.name);
    const localCoverPath = await findCoverPath(slug);
    const bggId =
      game.id ?? manifest.covers[slug]?.bggId ?? null;
    const bggUrl =
      bggId != null
        ? `https://boardgamegeek.com/boardgame/${bggId}`
        : null;

    return {
      ...game,
      // Prefer local cover, fall back to CSV image URL
      imageUrl: localCoverPath || game.csvImageUrl,
      // Keep track of whether we have a local cover
      hasLocalCover: !!localCoverPath,
      bggUrl,
    };
  }),
);

// Remove the temporary csvImageUrl field from output
const cleanGames = games.map(({ csvImageUrl, ...rest }) => rest);

const output = {
  updatedAt: new Date().toISOString(),
  games: cleanGames,
};

const outputPath = path.resolve("src/data/games.json");
await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.writeFile(outputPath, JSON.stringify(output, null, 2), "utf-8");

const gamesWithCovers = games.filter((g) => g.hasLocalCover).length;
console.log(`Saved ${cleanGames.length} games to ${outputPath}`);
console.log(`  - ${gamesWithCovers} games with local covers`);
console.log(`  - ${cleanGames.length - gamesWithCovers} games without covers (will use fallback)`);
