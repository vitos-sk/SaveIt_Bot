// Minimal compatibility layer.
// The bot now uses universal flow (ucat_/utskip_), but some modules still import from `./linkHandler`.

export { extractUrlsFromMessage } from "./link/extractUrls";
export {
  cancelWaitingTitle,
  handleCategorySelection,
  handleSkipTitle,
  handleSkipTitleCallback,
} from "./link/legacyCompat";

