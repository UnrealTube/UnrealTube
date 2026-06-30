// Film embed sources + YTS data types — no API key needed

export interface MovieSource {
  id: string;
  name: string;
  shortName: string;
  color: string;
  embedByImdb: (imdbId: string) => string;
  embedByYts: (imdbId: string) => string;
}

export const MOVIE_SOURCES: MovieSource[] = [
  {
    id: "vidsrc",
    name: "VidSrc",
    shortName: "VidSrc",
    color: "#FF6B35",
    embedByImdb: (id) => `https://vidsrc.to/embed/movie/${id}`,
    embedByYts:  (id) => `https://vidsrc.to/embed/movie/${id}`,
  },
  {
    id: "embedsu",
    name: "Embed.su",
    shortName: "Embed.su",
    color: "#00D4FF",
    embedByImdb: (id) => `https://embed.su/embed/movie/${id}`,
    embedByYts:  (id) => `https://embed.su/embed/movie/${id}`,
  },
  {
    id: "multiembed",
    name: "MultiEmbed",
    shortName: "MultiEmbed",
    color: "#8B5CF6",
    embedByImdb: (id) => `https://multiembed.mov/?video_id=${id}&imdb=1`,
    embedByYts:  (id) => `https://multiembed.mov/?video_id=${id}&imdb=1`,
  },
  {
    id: "smashystream",
    name: "SmashyStream",
    shortName: "Smashy",
    color: "#F59E0B",
    embedByImdb: (id) => `https://player.smashy.stream/movie/${id}`,
    embedByYts:  (id) => `https://player.smashy.stream/movie/${id}`,
  },
];

// YTS genres (string-based, not numeric like TMDB)
export interface Genre { id: string; trName: string; }

export const GENRES: Genre[] = [
  { id: "",            trName: "Tümü"        },
  { id: "action",      trName: "Aksiyon"     },
  { id: "adventure",   trName: "Macera"      },
  { id: "animation",   trName: "Animasyon"   },
  { id: "comedy",      trName: "Komedi"      },
  { id: "crime",       trName: "Suç"         },
  { id: "documentary", trName: "Belgesel"    },
  { id: "drama",       trName: "Dram"        },
  { id: "family",      trName: "Aile"        },
  { id: "fantasy",     trName: "Fantastik"   },
  { id: "history",     trName: "Tarih"       },
  { id: "horror",      trName: "Korku"       },
  { id: "music",       trName: "Müzik"       },
  { id: "mystery",     trName: "Gizem"       },
  { id: "romance",     trName: "Romantik"    },
  { id: "sci-fi",      trName: "Bilim Kurgu" },
  { id: "thriller",    trName: "Gerilim"     },
  { id: "war",         trName: "Savaş"       },
  { id: "western",     trName: "Western"     },
];

// YTS movie shape (subset of full API response)
export interface YTSMovie {
  id: number;
  title: string;
  title_english: string;
  title_long: string;
  imdb_code: string;
  year: number;
  rating: number;
  runtime: number;
  genres: string[];
  summary: string;
  description_full: string;
  language: string;
  background_image: string;
  background_image_original: string;
  small_cover_image: string;
  medium_cover_image: string;
  large_cover_image: string;
}

export interface YTSDetail extends YTSMovie {
  cast?: { name: string; character_name: string; url_small_image: string }[];
}

/** Genre list as comma-separated display string */
export function genreLabel(genres: string[]): string {
  return genres.slice(0, 3).join(", ");
}
