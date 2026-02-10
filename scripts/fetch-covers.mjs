import fs from "node:fs/promises";
import path from "node:path";
import { XMLParser } from "fast-xml-parser";
import "dotenv/config";

// Configuration
const COVERS_DIR = path.resolve("public/images/covers");
const MANIFEST_PATH = path.resolve("public/images/covers/.manifest.json");
const GAMES_JSON_PATH = path.resolve("src/data/games.json");
const BGG_SEARCH_URL = "https://boardgamegeek.com/xmlapi2/search";
const BGG_THING_URL = "https://boardgamegeek.com/xmlapi2/thing";
const BGG_API_KEY = process.env.BGG_API_KEY;
const RATE_LIMIT_MS = 1500; // 1.5 seconds between API calls
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 3000;

// Validate API key
if (!BGG_API_KEY) {
  console.warn("⚠️  Warning: BGG_API_KEY not found in environment.");
  console.warn("   Cover fetching will likely fail without authorization.");
  console.warn("   Add BGG_API_KEY to your .env file.\n");
}

// Polish to English name mappings for common games
const POLISH_TO_ENGLISH = {
  "7 cudów świata": "7 Wonders",
  "7 cudów świata pojedynek": "7 Wonders Duel",
  "azul witraże sintry": "Azul: Stained Glass of Sintra",
  "bitwa o rokugan": "Battle for Rokugan",
  "błyskawiczne zaklęcia": "Spell Smashers",
  "bunt na bounty": "Mutiny on the Bounty",
  "carcassonne podstawa": "Carcassonne",
  "catan osadnicy z catanu": "Catan",
  "cyklady": "Cyclades",
  "dixit": "Dixit",
  "dominion": "Dominion",
  "gloomhaven": "Gloomhaven",
  "gra o tron": "A Game of Thrones",
  "kamienie na szaniec": "Pandemic",
  "kaskadia": "Cascadia",
  "kolejka": "Ticket to Ride",
  "krew i honor": "Blood Rage",
  "królestwo bez granic": "Kingdom Builder",
  "lords of waterdeep": "Lords of Waterdeep",
  "łowcy potworów": "Monster Slaughter",
  "machi koro": "Machi Koro",
  "magia i miecz": "Mage Knight",
  "maracaibo": "Maracaibo",
  "mars: teraformacja": "Terraforming Mars",
  "odkrywcy i piraci": "Catan: Explorers & Pirates",
  "osadnicy": "Imperial Settlers",
  "pandemic": "Pandemic",
  "porto rico": "Puerto Rico",
  "root": "Root",
  "ruiny maracaibo": "Ruins of Arnak",
  "scythe": "Scythe",
  "smocza grota": "Wyrmspan",
  "splendor": "Splendor",
  "terraformacja marsa": "Terraforming Mars",
  "trzej muszkieterowie": "The Three Musketeers",
  "twilight imperium": "Twilight Imperium",
  "wing span": "Wingspan",
  "wingspan": "Wingspan",
  "wojownicy valhalli": "Champions of Midgard",
  "wojna o pierścień": "War of the Ring",
  "wyprawa na k2": "K2",
  "wyspa skye": "Isle of Skye",
  "zagubieni w kosmosie": "Galaxy Trucker",
  "zamki burgundii": "The Castles of Burgundy",
  "zamki szalonego króla ludwika": "Castles of Mad King Ludwig",
  "zombicide": "Zombicide",
};

/**
 * Delay execution for specified milliseconds
 */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Creates a URL-safe slug from game name
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
 * Normalizes game name for search (removes common prefixes/suffixes)
 */
function normalizeForSearch(name) {
  let normalized = name
    .toLowerCase()
    .replace(/\s*\(.*?\)\s*/g, "") // Remove parenthetical content
    .replace(/\s*-\s*edycja.*$/i, "") // Remove edition info
    .replace(/\s*:\s*.*$/i, "") // Remove subtitle after colon for base game search
    .trim();

  // Try Polish to English mapping
  const mapped = POLISH_TO_ENGLISH[normalized];
  if (mapped) {
    return mapped;
  }

  return name.trim();
}

/**
 * Fetches with retry logic and BGG authorization
 */
async function fetchWithRetry(url, retries = MAX_RETRIES) {
  const headers = {};
  if (BGG_API_KEY) {
    headers["Authorization"] = `Bearer ${BGG_API_KEY}`;
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, { headers });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response;
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }
      console.log(`  Retry ${attempt + 1}/${retries} after error: ${error.message}`);
      await delay(RETRY_DELAY_MS);
    }
  }
}

/**
 * Searches BGG for a game and returns the best match ID
 */
async function searchBggGame(gameName) {
  const searchName = normalizeForSearch(gameName);
  const searchUrl = `${BGG_SEARCH_URL}?query=${encodeURIComponent(searchName)}&type=boardgame&exact=0`;

  try {
    const response = await fetchWithRetry(searchUrl);
    const xmlText = await response.text();

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
    });
    const result = parser.parse(xmlText);

    if (!result.items || !result.items.item) {
      // Try with original name if normalized search failed
      if (searchName !== gameName.trim()) {
        const fallbackUrl = `${BGG_SEARCH_URL}?query=${encodeURIComponent(gameName.trim())}&type=boardgame&exact=0`;
        const fallbackResponse = await fetchWithRetry(fallbackUrl);
        const fallbackXml = await fallbackResponse.text();
        const fallbackResult = parser.parse(fallbackXml);

        if (!fallbackResult.items || !fallbackResult.items.item) {
          return null;
        }

        const items = Array.isArray(fallbackResult.items.item)
          ? fallbackResult.items.item
          : [fallbackResult.items.item];
        return items[0]?.["@_id"] || null;
      }
      return null;
    }

    const items = Array.isArray(result.items.item)
      ? result.items.item
      : [result.items.item];

    // Return the first (best) match
    return items[0]?.["@_id"] || null;
  } catch (error) {
    console.log(`  BGG search error for "${gameName}": ${error.message}`);
    return null;
  }
}

/**
 * Fetches game details from BGG and returns the image URL
 */
async function getBggGameImage(bggId) {
  const thingUrl = `${BGG_THING_URL}?id=${bggId}`;

  try {
    const response = await fetchWithRetry(thingUrl);
    const xmlText = await response.text();

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
    });
    const result = parser.parse(xmlText);

    if (!result.items || !result.items.item) {
      return null;
    }

    const item = Array.isArray(result.items.item)
      ? result.items.item[0]
      : result.items.item;

    // Prefer full image over thumbnail
    return item.image || item.thumbnail || null;
  } catch (error) {
    console.log(`  BGG thing error for ID ${bggId}: ${error.message}`);
    return null;
  }
}

/**
 * Downloads an image and saves it locally
 */
async function downloadImage(imageUrl, outputPath) {
  try {
    const response = await fetchWithRetry(imageUrl);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Determine file extension from URL or content type
    let ext = ".jpg";
    const urlExt = imageUrl.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i);
    if (urlExt) {
      ext = urlExt[1].toLowerCase() === "jpeg" ? ".jpg" : `.${urlExt[1].toLowerCase()}`;
    }

    const finalPath = outputPath.replace(/\.[^.]+$/, ext);
    await fs.writeFile(finalPath, buffer);

    return path.basename(finalPath);
  } catch (error) {
    console.log(`  Download error: ${error.message}`);
    return null;
  }
}

/**
 * Loads the manifest file or returns empty manifest
 */
async function loadManifest() {
  try {
    const content = await fs.readFile(MANIFEST_PATH, "utf-8");
    return JSON.parse(content);
  } catch {
    return {
      version: 1,
      lastUpdated: null,
      covers: {},
      failed: {},
    };
  }
}

/**
 * Saves the manifest file
 */
async function saveManifest(manifest) {
  manifest.lastUpdated = new Date().toISOString();
  await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2), "utf-8");
}

/**
 * Checks if a cover file exists
 */
async function coverExists(slug) {
  const extensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
  for (const ext of extensions) {
    try {
      await fs.access(path.join(COVERS_DIR, `${slug}${ext}`));
      return true;
    } catch {
      // File doesn't exist, try next extension
    }
  }
  return false;
}

/**
 * Main function to fetch all covers
 */
async function fetchCovers() {
  console.log("🎲 Board Game Cover Fetcher\n");

  // Ensure output directory exists
  await fs.mkdir(COVERS_DIR, { recursive: true });

  // Load games
  let games;
  try {
    const gamesContent = await fs.readFile(GAMES_JSON_PATH, "utf-8");
    const gamesData = JSON.parse(gamesContent);
    games = gamesData.games || [];
  } catch (error) {
    console.error(`Error loading games.json: ${error.message}`);
    console.log("Skipping cover fetch - games.json not available.");
    return;
  }

  console.log(`Found ${games.length} games\n`);

  // Load manifest
  const manifest = await loadManifest();

  // Stats
  let cached = 0;
  let downloaded = 0;
  let failed = 0;
  let skippedFailed = 0;

  for (let i = 0; i < games.length; i++) {
    const game = games[i];
    const slug = createSlug(game.name);

    process.stdout.write(`[${i + 1}/${games.length}] ${game.name.slice(0, 50).padEnd(50)} `);

    // Check if already in manifest and cover exists
    if (manifest.covers[slug]) {
      const exists = await coverExists(slug);
      if (exists) {
        console.log("✓ cached");
        cached++;
        continue;
      }
    }

    // Check if previously failed (skip to avoid repeated API calls)
    if (manifest.failed[slug]) {
      const failedAt = new Date(manifest.failed[slug].failedAt);
      const daysSinceFail = (Date.now() - failedAt.getTime()) / (1000 * 60 * 60 * 24);

      // Only retry after 7 days
      if (daysSinceFail < 7) {
        console.log("⏭ skipped (previously failed)");
        skippedFailed++;
        continue;
      }
    }

    // Check if file already exists on disk (manual addition)
    if (await coverExists(slug)) {
      const existingEntry = manifest.covers[slug];
      let bggId = existingEntry?.bggId;
      if (!bggId) {
        await delay(RATE_LIMIT_MS);
        bggId = await searchBggGame(game.name);
      }
      manifest.covers[slug] = {
        gameName: game.name,
        ...(bggId && { bggId }),
        fetchedAt: new Date().toISOString(),
        source: "existing",
      };
      console.log(bggId ? "✓ found existing (+ BGG link)" : "✓ found existing");
      cached++;
      continue;
    }

    // Rate limit
    await delay(RATE_LIMIT_MS);

    // Search for game on BGG
    const bggId = await searchBggGame(game.name);
    if (!bggId) {
      console.log("✗ not found on BGG");
      manifest.failed[slug] = {
        gameName: game.name,
        failedAt: new Date().toISOString(),
        reason: "not_found",
      };
      failed++;
      continue;
    }

    // Additional delay before fetching details
    await delay(RATE_LIMIT_MS);

    // Get image URL
    const imageUrl = await getBggGameImage(bggId);
    if (!imageUrl) {
      console.log(`✗ no image (BGG ID: ${bggId})`);
      manifest.failed[slug] = {
        gameName: game.name,
        bggId,
        failedAt: new Date().toISOString(),
        reason: "no_image",
      };
      failed++;
      continue;
    }

    // Download image
    const filename = await downloadImage(imageUrl, path.join(COVERS_DIR, `${slug}.jpg`));
    if (!filename) {
      console.log("✗ download failed");
      manifest.failed[slug] = {
        gameName: game.name,
        bggId,
        imageUrl,
        failedAt: new Date().toISOString(),
        reason: "download_failed",
      };
      failed++;
      continue;
    }

    // Success!
    console.log(`✓ downloaded (BGG ID: ${bggId})`);
    manifest.covers[slug] = {
      gameName: game.name,
      bggId,
      filename,
      fetchedAt: new Date().toISOString(),
      source: "bgg",
    };

    // Remove from failed if previously failed
    delete manifest.failed[slug];
    downloaded++;

    // Save manifest periodically
    if (downloaded % 10 === 0) {
      await saveManifest(manifest);
    }
  }

  // Final save
  await saveManifest(manifest);

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("Summary:");
  console.log(`  ✓ Cached:     ${cached}`);
  console.log(`  ✓ Downloaded: ${downloaded}`);
  console.log(`  ⏭ Skipped:    ${skippedFailed}`);
  console.log(`  ✗ Failed:     ${failed}`);
  console.log("=".repeat(60));
}

// Run the script
fetchCovers().catch((error) => {
  console.error("\n❌ Fatal error:", error.message);
  // Don't exit with error code - build should continue with fallbacks
  process.exit(0);
});
