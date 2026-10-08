import CombinedPage from "../_combined/CombinedPage";
import { shareMetadata } from "../_combined/share";

// The page as it will be shared: full title, summary and card
// (../_combined/share.ts).
export const metadata = shareMetadata("/lab/combined/");

export default function Page() {
  return <CombinedPage />;
}
