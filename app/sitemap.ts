import type { MetadataRoute } from "next";
import { CALCS } from "@/lib/calculators";
import { POSTS } from "@/lib/posts";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const urls: MetadataRoute.Sitemap = [
    { url: SITE.url, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE.url}/calculators`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE.url}/states`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE.url}/blog`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE.url}/find-a-deck-builder`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE.url}/pricing`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE.url}/methodology`, changeFrequency: "yearly", priority: 0.5 },
  ];
  for (const c of CALCS) urls.push({ url: `${SITE.url}/calculators/${c.slug}`, changeFrequency: "monthly", priority: 0.8 });
  // State presets remain useful in the calculator, but the available dataset
  // only supports a typical frost-depth prompt, not 50 independently sourced
  // permit guides. Do not ask search engines to index near-duplicate pages.
  for (const p of POSTS) urls.push({ url: `${SITE.url}/blog/${p.slug}`, lastModified: p.date, changeFrequency: "yearly", priority: 0.6 });
  return urls;
}
