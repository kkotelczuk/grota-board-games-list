export type IsoDateTimeString = string;

export type DifficultyKey = "easy" | "medium" | "hard" | "unknown";
export type DifficultyLevelEntity = {
  key: DifficultyKey;
  label: string;
};

export type GameEntity = {
  id: string | null;
  name: string;
  minPlayers: number | null;
  maxPlayers: number | null;
  playTime: string | null;
  weight: number | null;
  difficulty: DifficultyLevelEntity;
  language: string | null;
  owner: string | null;
  imageUrl: string | null;
  raw: Record<string, string | null>;
};

export type SyncRunStatus = "success" | "failed";
export type SyncRunEntity = {
  id: string;
  startedAt: IsoDateTimeString;
  finishedAt: IsoDateTimeString | null;
  status: SyncRunStatus;
  csvSourceUrl: string;
  errorMessage: string | null;
};

// API omits "unknown" from difficulty-levels endpoint; only known keys are exposed.
export type DifficultyLevelKeyDto = Exclude<DifficultyKey, "unknown">;

export type DifficultyLevelDto = {
  key: DifficultyLevelKeyDto;
  label: string;
};

// DTO hides the raw CSV payload present in the entity.
export type GameDto = Omit<GameEntity, "raw">;

export type SyncRunDto = Pick<
  SyncRunEntity,
  "id" | "startedAt" | "finishedAt" | "status" | "csvSourceUrl" | "errorMessage"
>;

export type PaginationMetaDto = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type GameSortKey =
  | "name_asc"
  | "name_desc"
  | "difficulty_asc"
  | "difficulty_desc"
  | "minPlayers_asc"
  | "minPlayers_desc";

export type ListGamesQueryDto = {
  q?: string;
  players?: number;
  difficulty?: DifficultyLevelKeyDto;
  sort?: GameSortKey;
  page?: number;
  pageSize?: number;
};

export type ListSyncRunsQueryDto = {
  page?: number;
  pageSize?: number;
};

export type GamesListResponseDto = {
  data: GameDto[];
  meta: PaginationMetaDto & { sort: GameSortKey };
};

export type DifficultyLevelsResponseDto = {
  data: DifficultyLevelDto[];
};

export type DifficultyLevelResponseDto = {
  data: DifficultyLevelDto;
};

export type SyncRunsListResponseDto = {
  data: SyncRunDto[];
  meta: PaginationMetaDto;
};

export type SyncRunResponseDto = {
  data: SyncRunDto;
};

export type CreateSyncRunCommand = {
  source: "workflow_dispatch";
};

export type CreateSyncRunResponseDto = SyncRunResponseDto;

// ============================================
// ViewModel Types (Frontend State Management)
// ============================================

/** Tryb widoku listy gier */
export type ViewMode = "grid" | "list";

/** Tryb motywu kolorystycznego */
export type ThemeMode = "light" | "dark";

/** Aktywne filtry listy gier */
export type ActiveFilters = {
  players?: number;
  difficulty?: DifficultyLevelKeyDto;
  sort: GameSortKey;
};

/** Chip filtra do wyświetlenia w UI */
export type FilterChip = {
  key: string;
  label: string;
  value: string;
};

/** Stan głównego kontenera gier */
export type GamesListViewModel = {
  games: GameDto[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  currentPage: number;
  totalPages: number;
  total: number;
};

/** Stan filtrów i wyszukiwania */
export type FiltersState = {
  searchQuery: string;
  activeFilters: ActiveFilters;
  isFilterPanelOpen: boolean;
};

/** Opcja sortowania z etykietą */
export type SortOptionLabel = {
  key: GameSortKey;
  label: string;
};

// ============================================
// Constants
// ============================================

/** Dostępne opcje sortowania */
export const SORT_OPTIONS: SortOptionLabel[] = [
  { key: "name_asc", label: "Nazwa (A-Z)" },
  { key: "name_desc", label: "Nazwa (Z-A)" },
  { key: "difficulty_asc", label: "Trudność (rosnąco)" },
  { key: "difficulty_desc", label: "Trudność (malejąco)" },
  { key: "minPlayers_asc", label: "Min. graczy (rosnąco)" },
  { key: "minPlayers_desc", label: "Min. graczy (malejąco)" },
] as const;

/** Mapowanie kluczy trudności na etykiety */
export const DIFFICULTY_LABELS: Record<DifficultyLevelKeyDto, string> = {
  easy: "Łatwy",
  medium: "Średni",
  hard: "Trudny",
} as const;

/** Domyślne wartości filtrów */
export const DEFAULT_FILTERS: ActiveFilters = {
  sort: "name_asc",
} as const;

/** Domyślny rozmiar strony dla paginacji */
export const DEFAULT_PAGE_SIZE = 30;

/** Maksymalny rozmiar strony */
export const MAX_PAGE_SIZE = 100;

/** Czas debounce dla wyszukiwania (ms) */
export const SEARCH_DEBOUNCE_MS = 300;
