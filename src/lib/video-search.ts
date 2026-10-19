import { StockMediaItem } from "@/components/tools/text-to-video/AiTextToVideoStudio";

export async function searchLiveVideosClient(
  query: string,
  apiKey: string = ""
): Promise<StockMediaItem[]> {
  const cleanQuery = query.trim();
  if (!cleanQuery) return [];

  // 1. If user supplied a Pexels API key, search Pexels live!
  if (apiKey.trim()) {
    try {
      const pexelsRes = await fetch(
        `https://api.pexels.com/videos/search?query=${encodeURIComponent(cleanQuery)}&per_page=9&orientation=portrait`,
        {
          headers: {
            Authorization: apiKey.trim(),
          },
        }
      );
      if (pexelsRes.ok) {
        const data = await pexelsRes.json();
        if (data.videos && Array.isArray(data.videos)) {
          const formatted: StockMediaItem[] = data.videos
            .map((v: any) => {
              const file =
                v.video_files?.find((f: any) => f.quality === "hd" && f.width <= 1080) ||
                v.video_files?.find((f: any) => f.quality === "sd") ||
                v.video_files?.[0];

              return {
                id: `pexels-${v.id}`,
                category: "Pexels HD Video 🎬",
                name: `${cleanQuery.charAt(0).toUpperCase() + cleanQuery.slice(1)} Clip (${v.duration}s)`,
                keywords: [cleanQuery.toLowerCase()],
                url: file?.link || "",
                type: "video" as const,
                thumbnail: v.image,
                duration: v.duration,
              };
            })
            .filter((v: any) => Boolean(v.url));

          if (formatted.length > 0) {
            return formatted;
          }
        }
      }
    } catch (e: any) {
      console.warn("Pexels client search note:", e.message);
    }
  }

  // 2. Dynamic Free Web Video Search (Wikimedia Commons with origin=* open CORS)
  try {
    const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
      cleanQuery + " filemime:video/webm"
    )}&gsrnamespace=6&gsrlimit=15&prop=imageinfo&iiprop=url|mime|size|duration|thumburl&iiurlwidth=640&format=json&origin=*`;

    const wikiRes = await fetch(wikiUrl);
    if (wikiRes.ok) {
      const wikiData = await wikiRes.json();
      const pages = wikiData.query ? Object.values(wikiData.query.pages) : [];
      const badTerms = [
        "explosion", "terrorist", "arson", "killed", "dead", "attack", "war", "murder",
        "hamas", "shooting", "corpse", "crash", "accident", "kaza", "disaster", "tragedy",
        "death", "violence", "blood", "gun", "bomb", "combat", "wound", "injury", "weapon", "massacre",
        "speech", "interview", "press", "conference", "hearing", "question", "discusses", "trump",
        "biden", "obama", "vance", "senator", "president", "politician", "politics", "congress",
        "secretary", "cabinet", "investigation", "police", "court", "caught", "scam", "game show",
        "holzhauer", "randi", "ceremony", "medal", "funeral", "memorial", "debate", "briefing", "meeting", "lecture"
      ];

      const queryWords = cleanQuery.toLowerCase().split(/\s+/).filter((w) => w.length > 2);

      const wikiClips: StockMediaItem[] = (pages as any[])
        .filter((p) => {
          const info = p.imageinfo?.[0];
          if (!info || info.size > 25 * 1024 * 1024 || !info.url) return false;
          const titleLower = (p.title || "").toLowerCase();
          if (badTerms.some((t) => titleLower.includes(t))) return false;
          if (queryWords.length > 0 && !queryWords.some((w) => titleLower.includes(w))) return false;
          return true;
        })
        .map((p) => {
          const info = p.imageinfo[0];
          const cleanTitle = p.title
            .replace("File:", "")
            .replace(/\.[a-zA-Z0-9]+$/, "")
            .replace(/_/g, " ")
            .trim();
          return {
            id: `wiki-${p.pageid || Math.random()}`,
            category: `${cleanQuery.charAt(0).toUpperCase() + cleanQuery.slice(1)} Video 🎬`,
            name: cleanTitle.length > 36 ? cleanTitle.slice(0, 36) + "..." : cleanTitle,
            keywords: [cleanQuery.toLowerCase()],
            url: info.url,
            type: "video" as const,
            thumbnail: info.thumburl,
            duration: Math.round(info.duration || 10),
            sizeMb: (info.size / 1024 / 1024).toFixed(1),
          };
        });

      if (wikiClips.length > 0) {
        return wikiClips;
      }
    }
  } catch (e: any) {
    console.warn("Wiki video client search note:", e.message);
  }

  return [];
}
