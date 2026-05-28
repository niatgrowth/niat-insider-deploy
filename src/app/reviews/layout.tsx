import RequireSessionServer from '@/components/RequireSessionServer';
import ReviewsShell from '@/features/reviews/ReviewsShell';

export default function ReviewsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireSessionServer fallbackFrom="/reviews">
      <ReviewsShell>{children}</ReviewsShell>
    </RequireSessionServer>
  );
}
