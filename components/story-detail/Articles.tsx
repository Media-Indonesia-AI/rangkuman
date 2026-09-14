import type { StoryArticle } from "@/lib/api";
import { isUrl } from "@/lib/util/linkify";
import { cn } from "@/lib/utils";
import { SectionHeader, articleHref } from "./shared";

interface StoryArticlesProps {
  /** Articles from the featured story (each `EmbeddedStory.articles`).
   *  When empty / undefined the section is hidden — the caller
   *  guards on `featured?.articles?.length > 0` before mounting. */
  articles: StoryArticle[];
}

/** "Liputan Terkait" — source-linked article cards derived from the
 *  featured story's `articles[]`. Each card opens the article URL in
 *  a new tab (`articleHref` normalizes hostnames to `https://...`).
 *  Cards whose `source_url` fails `isUrl(...)` validation render as
 *  non-clickable `<div>`s so the hover affordance doesn't lie. */
export function Articles({ articles }: StoryArticlesProps) {
  return (
    <section aria-label="Liputan terkait">
      <SectionHeader
        title="Liputan Terkait"
        subtitle={`${articles.length} artikel tentang story ini`}
      />
      <ul className="rounded-lg border border-border-strong bg-bg-secondary/30 p-4">
        {articles.map((article, idx) => {
          // Verify the URL is an actual http(s) URL before mounting
          // an `<a>` — gates out empty values, bare hostnames that
          // haven't been normalized, and any malformed / hostile
          // scheme the wire might hand us.
          const hasSourceUrl = isUrl(article.source_url);
          const content = (
            <>
              <div className="mb-1 flex flex-wrap items-center gap-1.5 font-mono text-[9.5px] text-text-muted">
                <span className="text-text-faint">
                  {article.source_name}
                </span>
              </div>
              <h4
                className={cn(
                  "text-[13.5px] font-semibold leading-snug text-text-primary",
                  hasSourceUrl &&
                    "transition-colors group-hover:text-brand",
                )}
              >
                {article.title}
              </h4>
              {article.excerpt && (
                <p className="mt-1 line-clamp-2 text-[12px] leading-snug text-text-secondary">
                  {article.excerpt}
                </p>
              )}
            </>
          );
          return (
            <li
              key={`${article.title}::${article.source_url}`}
              className={cn(
                "py-2.5",
                idx < articles.length - 1 && "border-b border-border/60",
              )}
            >
              {hasSourceUrl ? (
                <a
                  href={articleHref(article.source_url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block"
                >
                  {content}
                </a>
              ) : (
                <div className="block">{content}</div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
