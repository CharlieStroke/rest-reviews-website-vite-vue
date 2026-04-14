import { ref, type Ref } from 'vue';
import { ReviewService } from '@/entities/review/api/ReviewService';
import type { MyReview } from '@/entities/review/model/types';

const SEEN_KEY = 'seen_manager_replies';

export function useMyReviews() {
  const deletingId = ref<string | null>(null);
  
  function getSeenReplies(): Record<string, boolean> {
    try { return JSON.parse(localStorage.getItem(SEEN_KEY) || '{}'); } catch { return {}; }
  }

  function isReplyNew(rev: MyReview): boolean {
    if (!rev.managerReply) return false;
    return !getSeenReplies()[rev.id];
  }

  function markRepliesSeen(reviews: MyReview[]) {
    const seen = getSeenReplies();
    for (const r of reviews) {
      if (r.managerReply) seen[r.id] = true;
    }
    localStorage.setItem(SEEN_KEY, JSON.stringify(seen));
  }

  function scheduleMarkSeen(reviews: Ref<MyReview[]>, delayMs = 3000) {
    if (typeof window !== 'undefined') {
      setTimeout(() => markRepliesSeen(reviews.value), delayMs);
    }
  }

  async function deleteReview(id: string, reviewsRef: Ref<MyReview[]>) {
    deletingId.value = id;
    try {
      await ReviewService.deleteReview(id);
      reviewsRef.value = reviewsRef.value.filter(r => r.id !== id);
      return true;
    } catch (e) {
      console.error('Error deleting review', e);
      return false;
    } finally {
      deletingId.value = null;
    }
  }

  return {
    deletingId,
    deleteReview,
    isReplyNew,
    scheduleMarkSeen,
    markRepliesSeen
  };
}
