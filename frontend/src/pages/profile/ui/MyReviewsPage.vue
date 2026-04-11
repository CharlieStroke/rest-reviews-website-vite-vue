<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ReviewService } from '@/entities/review/api/ReviewService';
import type { MyReview } from '@/entities/review/model/types';

const reviews = ref<MyReview[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

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
  } catch (e: any) {
    error.value = e.response?.data?.message || 'No se pudieron cargar tus reseñas.';
  } finally {
    loading.value = false;
  }
});

const sentimentColor = (s?: string | null) => {
  if (s === 'positive') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
  if (s === 'negative') return 'text-red-400 bg-red-500/10 border-red-500/20';
  return 'text-white/40 bg-white/5 border-white/10';
};
const sentimentLabel = (s?: string | null) => {
  if (s === 'positive') return 'Positiva';
  if (s === 'negative') return 'Negativa';
  if (s === 'neutral') return 'Neutral';
  return null;
};

const scoreColor = (score: number) => {
  if (score >= 4) return 'text-emerald-400';
  if (score >= 3) return 'text-amber-400';
  return 'text-red-400';
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' });
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">

    <!-- Header con CTA -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
      <div>
        <h2 class="text-3xl font-extrabold text-white">Mis Reseñas</h2>
        <p class="text-white/50 mt-1">Tus evaluaciones y respuestas de los gerentes.</p>
      </div>
      <RouterLink
        to="/establishments"
        class="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-black text-base px-7 py-4 rounded-2xl shadow-lg hover:shadow-orange-500/30 hover:-translate-y-0.5 transition-all duration-200 active:scale-95 whitespace-nowrap"
      >
        <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">star</span>
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
    <div v-else-if="reviews.length === 0" class="rounded-3xl p-14 text-center border border-white/10 bg-white/3">
      <span class="material-symbols-outlined text-5xl text-white/20 mb-4 block">rate_review</span>
      <p class="text-white/50 font-medium mb-6">Aún no has escrito ninguna reseña.</p>
      <RouterLink
        to="/establishments"
        class="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-black text-base px-8 py-4 rounded-2xl shadow-lg hover:shadow-orange-500/30 transition-all"
      >
        <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">star</span>
        Evaluar ahora
      </RouterLink>
    </div>

    <div v-else>
      <div class="space-y-6">
        <div v-for="rev in paginatedReviews" :key="rev.id" class="glass-effect p-6 md:p-8 rounded-3xl shadow-lg border border-white/10 bg-[#12161D] transition-transform hover:-translate-y-1">

          <!-- Header -->
          <div class="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-5">
            <div class="flex-1 min-w-0">
              <h3 class="text-xl font-bold text-white truncate">{{ rev.establishmentName || 'Establecimiento' }}</h3>
              <p class="text-white/40 text-xs mt-1">{{ formatDate(rev.createdAt) }}</p>
            </div>

            <!-- 3 score badges -->
            <div class="flex gap-2 shrink-0">
              <div class="flex flex-col items-center justify-center p-2 rounded-lg bg-black/40 border border-white/5 w-16">
                <span class="font-bold text-lg" :class="scoreColor(rev.foodScore)">{{ rev.foodScore }}</span>
                <span class="text-[9px] uppercase text-white/50 font-semibold tracking-wider">Comida</span>
              </div>
              <div class="flex flex-col items-center justify-center p-2 rounded-lg bg-black/40 border border-white/5 w-16">
                <span class="font-bold text-lg" :class="scoreColor(rev.serviceScore)">{{ rev.serviceScore }}</span>
                <span class="text-[9px] uppercase text-white/50 font-semibold tracking-wider">Servicio</span>
              </div>
              <div class="flex flex-col items-center justify-center p-2 rounded-lg bg-black/40 border border-white/5 w-16">
                <span class="font-bold text-lg" :class="scoreColor(rev.priceScore)">{{ rev.priceScore }}</span>
                <span class="text-[9px] uppercase text-white/50 font-semibold tracking-wider">Precio</span>
              </div>
            </div>
          </div>

          <!-- Sentiment badge -->
          <div v-if="sentimentLabel(rev.sentiment)" class="mb-3">
            <span class="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full border" :class="sentimentColor(rev.sentiment)">
              <span class="material-symbols-outlined text-xs" style="font-size:13px">psychology</span>
              {{ sentimentLabel(rev.sentiment) }}
            </span>
          </div>

          <!-- Title -->
          <p v-if="rev.title" class="text-white font-semibold text-base mb-2">{{ rev.title }}</p>

          <!-- Body -->
          <div v-if="rev.comment" class="p-4 bg-white/5 rounded-2xl border border-white/5 mb-4">
            <p class="text-white/80 leading-relaxed text-sm md:text-base">"{{ rev.comment }}"</p>
          </div>

          <!-- Evidence image -->
          <div v-if="rev.imageUrl" class="mb-4">
            <img :src="rev.imageUrl" class="rounded-2xl max-h-56 object-cover border border-white/10" alt="Evidencia" />
          </div>

          <!-- Manager Reply -->
          <div v-if="rev.managerReply" class="mt-4 p-5 rounded-2xl bg-[#FAF9F6] border border-orange-500/30 shadow-inner relative overflow-hidden">
            <div class="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
            <div class="flex items-center gap-2 mb-2">
              <span class="material-symbols-outlined text-orange-500 text-base">reply</span>
              <span class="text-xs font-extrabold text-orange-500 uppercase tracking-wider">Respuesta del Gerente</span>
            </div>
            <p class="text-sm text-[#333] leading-relaxed ml-7">{{ rev.managerReply }}</p>
          </div>

        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-center gap-3 mt-8">
        <button
          @click="currentPage--"
          :disabled="currentPage === 1"
          class="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-white disabled:opacity-30 hover:bg-white/10 transition-colors flex items-center justify-center"
        >
          <span class="material-symbols-outlined text-lg">chevron_left</span>
        </button>
        <span class="text-white/60 text-sm font-medium">{{ currentPage }} / {{ totalPages }}</span>
        <button
          @click="currentPage++"
          :disabled="currentPage === totalPages"
          class="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-white disabled:opacity-30 hover:bg-white/10 transition-colors flex items-center justify-center"
        >
          <span class="material-symbols-outlined text-lg">chevron_right</span>
        </button>
      </div>
    </div>
  </div>
</template>
