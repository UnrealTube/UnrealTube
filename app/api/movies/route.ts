import { NextRequest, NextResponse } from "next/server";
import type { YTSMovie, YTSDetail } from "@/lib/movieSources";

// YTS public API — completely free, no API key required
// Docs: https://yts.mx/api
const YTS_BASE = "https://yts.mx/api/v2";

type SortBy = "year" | "rating" | "peers" | "seeds" | "download_count" | "like_count" | "date_added";
type OrderBy = "asc" | "desc";

async function yts(endpoint: string, params: Record<string, string> = {}): Promise<Response> {
  const p = new URLSearchParams({ limit: "20", ...params });
  return fetch(`${YTS_BASE}/${endpoint}?${p}`, {
    headers: { "User-Agent": "UnrealTube/1.0" },
    next: { revalidate: 3600 },
  });
}

// GET /api/movies
//   type=popular|trending|top_rated|search|genre|detail
//   q=...        (search query)
//   genre=action (YTS genre string)
//   page=1
//   id=123       (YTS movie id)
//   imdb=tt...   (IMDB id for detail)
export async function GET(req: NextRequest) {
  const sp    = req.nextUrl.searchParams;
  const type  = sp.get("type")  || "popular";
  const query = sp.get("q")     || "";
  const genre = sp.get("genre") || "";
  const page  = sp.get("page")  || "1";
  const id    = sp.get("id")    || "";

  try {
    if (type === "detail" && id)     return await handleDetail(id);
    if (type === "search" && query)  return await handleSearch(query, page);
    if (type === "genre" && genre)   return await handleGenre(genre, page);
    if (type === "trending")         return await handleList(page, "peers",      "desc");
    if (type === "top_rated")        return await handleList(page, "rating",     "desc");
    /* popular */                    return await handleList(page, "download_count", "desc");
  } catch (e) {
    console.error("YTS error", e);
    return NextResponse.json({ movies: [], totalPages: 1 });
  }
}

async function handleList(page: string, sortBy: SortBy, orderBy: OrderBy) {
  const res = await yts("list_movies.json", {
    page,
    sort_by: sortBy,
    order_by: orderBy,
    limit: "20",
  });
  return parseList(res);
}

async function handleSearch(query: string, page: string) {
  const res = await yts("list_movies.json", {
    query_term: query,
    page,
    limit: "20",
  });
  return parseList(res);
}

async function handleGenre(genre: string, page: string) {
  const res = await yts("list_movies.json", {
    genre,
    page,
    sort_by: "rating",
    order_by: "desc",
    limit: "20",
  });
  return parseList(res);
}

async function handleDetail(id: string) {
  const res = await yts("movie_details.json", {
    movie_id: id,
    with_cast: "true",
    with_images: "true",
  });
  if (!res.ok) return NextResponse.json({ movie: null });
  const data = await res.json();
  if (data.status !== "ok") return NextResponse.json({ movie: null });
  const movie: YTSDetail = data.data?.movie;
  return NextResponse.json({ movie });
}

async function parseList(res: Response): Promise<NextResponse> {
  if (!res.ok) return NextResponse.json({ movies: [], totalPages: 1 });
  const data = await res.json();
  if (data.status !== "ok") return NextResponse.json({ movies: [], totalPages: 1 });

  const movieData = data.data;
  const movies: YTSMovie[] = movieData?.movies ?? [];
  const total: number = movieData?.movie_count ?? 0;
  const limit: number = movieData?.limit ?? 20;
  const totalPages = Math.min(Math.ceil(total / limit), 50); // cap at 50 pages

  return NextResponse.json({ movies, totalPages });
}
