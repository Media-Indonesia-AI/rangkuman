/**
 * Barrel for the API client. Existing call sites import from
 * `@/lib/api` and get the `api` runtime object plus all types.
 *
 * Types live in `lib/api/types/<category>/` — auth, stocks, market,
 * story, error — and are re-exported here so consumer imports stay flat:
 *
 *   import { api, type InterestRate, type TopStockItem } from "@/lib/api";
 */
export { api, API_BASE_URL } from "./client";

// Error
export type { ApiError } from "./types/error";

// Auth
export type {
  LoginRequest,
  RegisterRequest,
  RegisterResponse,
  RegisterResponseUser,
} from "./types/auth";

// Stocks
export type {
  CompositeChartPoint,
  CompositeChartResponse,
  ForeignStockFlow,
  ForeignStocksResponse,
  IndexMoverItem,
  IndexMoverResponse,
  KeyMetrics,
  RelatedStock,
  StockHistoricalPoint,
  StockHistoricalResponse,
  StockTrendingItem,
  StocksTrendingResponse,
  StockTrendingSource,
  TickerInformation,
  TickerItem,
  TickersResponse,
  TopStockGroup,
  TopStockGroupType,
  TopStockItem,
  TopStocksResponse,
} from "./types/stocks";

// Market
export type {
  ExchangeRateChartPoint,
  ExchangeRateChartResponse,
  InterestRate,
} from "./types/market";

// Sectors
export type {
  Sector,
  SectorStock,
  SectorsResponse,
} from "./types/sectors";

// Story
export type {
  TrendingArticle,
  TrendingMedia,
  TrendingSentiment,
  TrendingStoriesResponse,
  TrendingStory,
  StoryArticle,
  StoryFilter,
  StoryItem,
  StoryListResponse,
  StoryResponse,
  StorySentiment,
  StoryTopic,
  TopicResponse,
} from "./types/story";

// Headline detail
export type {
  EmbeddedStory,
  HeadlineDetail,
  HeadlineDetailResponse,
  HeadlineKeyword,
  HeadlineLast7DaysItem,
  HeadlinesLast7DaysResponse,
  MultiDateStoriesResponse,
} from "./types/headline";

// Market Mood
export type {
  MarketMood,
  MarketMoodLabel,
  MarketMoodResponse,
} from "./types/moods";
export {
  factorSentimentColors,
  labelToSentiment,
  sentimentConfig,
} from "./types/moods";