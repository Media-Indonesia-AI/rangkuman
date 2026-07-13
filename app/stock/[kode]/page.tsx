// import { getStockByKode, stocks } from "@/lib/mock/stocks";
// import { getRecapsForStock } from "@/lib/mock/recaps";

// `generateStaticParams` + `generateMetadata` were removed when the page
// stopped using mock stock data — they have no data source to enumerate or
// describe. With `output: "export"` they were required; see the build error
// shown to the user. Restore them (or fetch live data) when the live stock
// API is wired up.

export { default } from "./StockDetailPage";