// `generateMetadata` was removed when the page stopped using mock
// story data — there's no static list to enumerate (live data is
// fetched client-side via `useListStory`). `app/story/[id]/page.tsx`
// is a thin route entry that re-exports the client component from
// `./StoryDetailView` — same pattern as `app/stock/[kode]/page.tsx`.

export { default } from "./StoryDetailView";
