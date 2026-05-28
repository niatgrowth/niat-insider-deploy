# @niat/reviews-ui

Shared Q&A UI from **niatreviews**, consumed by **niatinsider-deploy** at `/reviews`.

## Usage (Insider)

```tsx
import { ReviewsUiProvider, AppChrome, ProspectiveHomePage } from '@niat/reviews-ui';
import '@niat/reviews-ui/styles.css';
```

Provide `ReviewsApiClient` + auth via `ReviewsUiProvider` (see `src/features/reviews/ReviewsShell.tsx`).

## Keeping niatreviews in sync

1. Edit components in `packages/reviews-ui/src/`.
2. Run Insider locally; verify `/reviews`.
3. Optionally point **niatreviews** at this package:

   ```json
   "@niat/reviews-ui": "file:../niatinsider-deploy/packages/reviews-ui"
   ```

## Path prefix

All in-app links use `basePath` (default `/reviews`) via `useReviewsUi().p('/questions')`.
