<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ReviewService } from '@/entities/review/api/ReviewService';
import ReviewCard from '@/shared/ui/ReviewCard.vue';
import EditReviewForm from '@/features/review/ui/EditReviewForm.vue';
import EmptyState from '@/shared/ui/EmptyState.vue';
import IconButton from '@/shared/ui/IconButton.vue';
import Spinner from '@/shared/ui/Spinner.vue';
import Pagination from '@/widgets/pagination/ui/Pagination.vue';
import { useMyReviews } from '@/features/review/model/useMyReviews';
import { extractErrorMessage } from '@/shared/lib/extractError';
import type { MyReview } from '@/entities/review/model/types';

const reviews = ref<MyReview[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

const { deletingId, deleteReview, isReplyNew, scheduleMarkSeen } = useMyReviews();

const confirmDeleteId = ref<string | null>(null);
const editingId = ref<string | null>(null);

const handleDelete = async (id: string) => {
  const success = await deleteReview(id, reviews);
  if (success) {
    if (currentPage.value > totalPages.value && totalPages.value > 0) {
      currentPage.value = totalPages.value;
    }
    confirmDeleteId.value = null;
  }
};

const handleEditSuccess = (revId: string, updatedData: Partial<MyReview>) => {
  const index = reviews.value.findIndex(r => r.id === revId);
  if (index !== -1) {
    Object.assign(reviews.value[index]!, updatedData);
  }
  editingId.value = null;
};

const PAGE_SIZE = 5;
const currentPage = ref(1);

const totalPages = computed(() => Math.ceil(reviews.value.length / PAGE_SIZE));
const paginatedReviews = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE;
  return reviews.value.slice(start, start + PAGE_SIZE);
});

onMounted(async () => {
  try {
    reviews.value = await ReviewService.getMyReviews();
    scheduleMarkSeen(reviews);
  } catch (e: unknown) {
    error.value = extractErrorMessage(e, 'No se pudieron cargar tus reseñas.');
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">

    <!-- Header con CTA -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
      <div>
        <h2 class="text-3xl font-extrabold text-white">Mis Reseñas</h2>
        <p class="text-white/50 mt-1">Tus evaluaciones y respuestas.</p>
      </div>
      <RouterLink
        to="/establishments"
        class="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-black text-base px-7 py-4 rounded-2xl shadow-lg hover:shadow-orange-500/30 hover:-translate-y-0.5 transition-all duration-200 active:scale-95 whitespace-nowrap"
      >
        Evaluar ahora
      </RouterLink>
    </div>

    <!-- Skeleton -->
    <div v-if="loading" class="space-y-6">
      <div v-for="i in 2" :key="i" class="rounded-3xl bg-white/5 animate-pulse h-40"></div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center text-red-400 py-12">{{ error }}</div>

    <!-- Empty -->
    <div v-else-if="reviews.length === 0" class="rounded-3xl border border-white/10 bg-white/3">
      <EmptyState
        icon="rate_review"
        title="Aún no has escrito ninguna reseña."
        theme="light"
      >
        <template #actions>
          <RouterLink
            to="/establishments"
            class="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-black text-base px-8 py-4 rounded-2xl shadow-lg hover:shadow-orange-500/30 transition-all"
          >
            Evaluar ahora
          </RouterLink>
        </template>
      </EmptyState>
    </div>

    <div v-else>
      <div class="space-y-6">
        <ReviewCard
          v-for="rev in paginatedReviews"
          :key="rev.id"
          :review="rev"
          :show-author="false"
          :show-establishment="true"
          :show-sentiment="true"
        >
          <!-- Header actions: edit/delete -->
          <template #header-actions>
            <template v-if="editingId !== rev.id">
              <div class="flex items-center gap-2">
                <IconButton
                  icon="edit"
                  shape="square"
                  variant="ghost"
                  title="Editar reseña"
                  @click="editingId = rev.id"
                />
                <template v-if="confirmDeleteId !== rev.id">
                  <IconButton
                    icon="delete"
                    shape="square"
                    variant="danger"
                    title="Eliminar reseña"
                    @click="confirmDeleteId = rev.id"
                  />
                </template>
                <div v-else class="flex items-center gap-2">
                  <span class="text-xs text-white/50">¿Eliminar?</span>
                  <button
                    @click="handleDelete(rev.id)"
                    :disabled="deletingId === rev.id"
                    class="px-3 py-1.5 text-xs font-bold rounded-lg bg-red-500 hover:bg-red-400 text-white transition-colors disabled:opacity-50 flex items-center gap-1"
                  >
                    <Spinner v-if="deletingId === rev.id" size="xs" />
                    {{ deletingId === rev.id ? '…' : 'Sí' }}
                  </button>
                  <button @click="confirmDeleteId = null" class="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/10 hover:bg-white/20 text-white/60 transition-colors">
                    No
                  </button>
                </div>
              </div>
            </template>
          </template>

          <template #inline>
            <EditReviewForm
              v-if="editingId === rev.id"
              :review="rev"
              @cancel="editingId = null"
              @success="(data) => handleEditSuccess(rev.id, data)"
            />
          </template>

          <!-- Reply badge (new label) -->
          <template #reply-badge>
            <span v-if="isReplyNew(rev)" class="ml-1 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest bg-orange-500 text-white rounded-full animate-pulse">
              Nueva
            </span>
          </template>
        </ReviewCard>
      </div>

      <Pagination
        v-if="totalPages > 1"
        :current-page="currentPage"
        :total-pages="totalPages"
        variant="simple"
        theme="dark"
        class="mt-8"
        @update:current-page="currentPage = $event"
      />
    </div>
  </div>
</template>
