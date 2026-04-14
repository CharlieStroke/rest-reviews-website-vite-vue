<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { ReviewService } from '@/entities/review/api/ReviewService';
import { PostService } from '@/entities/post/api/PostService';
import { useAuthStore } from '@/entities/user/model/authStore';
import { httpClient } from '@/shared/api/httpClient';
import type { Establishment, EstablishmentReview } from '@/entities/review/model/types';
import type { EstablishmentPost } from '@/entities/post/model/types';
import CreatePostModal from '@/features/create-post/ui/CreatePostModal.vue';
import ManagerReplyModal from '@/pages/dashboard/ui/ManagerReplyModal.vue';

const authStore = useAuthStore();

// ── State ──────────────────────────────────────────────────────────────────────
const establishment = ref<Establishment | null>(null);
const posts = ref<EstablishmentPost[]>([]);
const reviews = ref<EstablishmentReview[]>([]);
const loading = ref(true);
const reviewsLoading = ref(false);
const error = ref<string | null>(null);

// Pagination - reviews
const reviewPage = ref(1);
const reviewTotal = ref(0);
const REVIEW_PAGE_SIZE = 10;
const totalReviewPages = computed(() => Math.ceil(reviewTotal.value / REVIEW_PAGE_SIZE));

// Pagination - posts
const postPage = ref(1);
const postTotal = ref(0);
const POST_PAGE_SIZE = 10;
const totalPostPages = computed(() => Math.ceil(postTotal.value / POST_PAGE_SIZE));

// Search - reviews
const searchQuery = ref('');
const searchDate = ref('');
const filteredReviews = computed(() => {
  let list = reviews.value;
  const q = searchQuery.value.trim().toLowerCase();
  if (q) list = list.filter(r => r.comment?.toLowerCase().includes(q) || r.author?.toLowerCase().includes(q));
  if (searchDate.value) list = list.filter(r => r.createdAt.startsWith(searchDate.value));
  return list;
});
const paginatedReviews = computed(() => {
  const start = (reviewPage.value - 1) * REVIEW_PAGE_SIZE;
  return filteredReviews.value.slice(start, start + REVIEW_PAGE_SIZE);
});
watch([searchQuery, searchDate], () => { reviewPage.value = 1; });
const clearSearch = () => { searchQuery.value = ''; searchDate.value = ''; };

// ── Fetch ──────────────────────────────────────────────────────────────────────
const fetchAll = async () => {
  loading.value = true;
  error.value = null;
  try {
    const all = await ReviewService.getEstablishments();
    const mine = all.find(e => e.managerId === authStore.user?.id);
    if (!mine) {
      error.value = 'No tienes un establecimiento asignado. Contacta al administrador.';
      return;
    }
    establishment.value = mine;
    await Promise.all([loadPosts(mine.slug!), loadReviews(mine.slug!)]);
  } catch {
    error.value = 'Error al cargar el establecimiento.';
  } finally {
    loading.value = false;
  }
};

const loadPosts = async (slug: string, page = 1) => {
  const result = await PostService.getPosts(slug, page, POST_PAGE_SIZE);
  posts.value = result.data;
  postTotal.value = result.total;
  postPage.value = page;
};

const loadReviews = async (slug: string) => {
  reviewsLoading.value = true;
  try {
    const result = await ReviewService.getEstablishmentReviews(slug, 1, 200);
    reviews.value = result.data as any;
    reviewTotal.value = result.total;
  } finally {
    reviewsLoading.value = false;
  }
};

onMounted(fetchAll);

// ── Posts actions ──────────────────────────────────────────────────────────────
const postModalOpen = ref(false);
const editingPost = ref<EstablishmentPost | null>(null);

const openCreatePost = () => { editingPost.value = null; postModalOpen.value = true; };
const openEditPost = (post: EstablishmentPost) => { editingPost.value = post; postModalOpen.value = true; };

const onPostCreated = (post: EstablishmentPost) => {
  posts.value.unshift(post);
  postTotal.value++;
  postModalOpen.value = false;
};

const onPostUpdated = (updated: EstablishmentPost) => {
  const idx = posts.value.findIndex(p => p.id === updated.id);
  if (idx !== -1) posts.value[idx] = { ...posts.value[idx], ...updated };
  postModalOpen.value = false;
  editingPost.value = null;
};

const deletePost = async (postId: string) => {
  if (!establishment.value?.slug || !confirm('¿Eliminar esta publicación?')) return;
  await PostService.deletePost(establishment.value.slug, postId);
  posts.value = posts.value.filter(p => p.id !== postId);
  postTotal.value--;
};

// ── Edit establishment profile ─────────────────────────────────────────────────
const editProfileOpen = ref(false);
const editForm = ref({ description: '', openingHours: '', locationDetails: '' });

const openEditProfile = () => {
  editForm.value = {
    description: establishment.value?.description ?? '',
    openingHours: establishment.value?.openingHours ?? '',
    locationDetails: establishment.value?.locationDetails ?? '',
  };
  editProfileOpen.value = true;
};

const saveProfile = async () => {
  if (!establishment.value) return;
  await httpClient.put(`/api/establishments/${establishment.value.id}`, editForm.value);
  establishment.value = { ...establishment.value, ...editForm.value };
  editProfileOpen.value = false;
};

// ── Reply modal ────────────────────────────────────────────────────────────────
const replyModalOpen = ref(false);
const selectedReview = ref<any>(null);

const openReplyModal = (review: any) => { selectedReview.value = review; replyModalOpen.value = true; };
const handleReplySent = (updated: { reviewId: string; reply: string }) => {
  const rev = reviews.value.find((r: any) => r.id === updated.reviewId) as any;
  if (rev) { rev.managerReply = updated.reply; rev.managerReplyAt = new Date().toISOString(); }
  replyModalOpen.value = false;
  selectedReview.value = null;
};

// ── Helpers ────────────────────────────────────────────────────────────────────
const pendingCount = computed(() => reviews.value.filter((r: any) => !r.managerReply).length);

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });

const avgRating = (r: any) => ((r.foodScore + r.serviceScore + r.priceScore) / 3).toFixed(1);

const sentimentBadge = (s: string | null) => {
  if (s === 'positive') return 'bg-emerald-100 text-emerald-700';
  if (s === 'negative') return 'bg-red-100 text-red-600';
  return 'bg-gray-100 text-gray-500';
};
const sentimentLabel = (s: string | null) => {
  if (s === 'positive') return 'Positivo';
  if (s === 'negative') return 'Negativo';
  return 'Neutral';
};
</script>

<template>
  <div class="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">

    <!-- Loading -->
    <div v-if="loading" class="space-y-6">
      <div class="h-10 bg-white/5 rounded-2xl w-2/3 animate-pulse"></div>
      <div class="h-40 bg-white/5 rounded-3xl animate-pulse"></div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="flex flex-col items-center justify-center py-24 text-center gap-4">
      <span class="material-symbols-outlined text-5xl text-amber-400" style="font-variation-settings: 'FILL' 1;">store_mall_directory</span>
      <h2 class="text-xl font-black text-white brand">Sin establecimiento asignado</h2>
      <p class="text-[#adaaad] text-sm">{{ error }}</p>
    </div>

    <template v-else-if="establishment">

      <!-- ══════════════════════════════════════════════════════════════════════
           PERFIL DEL ESTABLECIMIENTO
      ══════════════════════════════════════════════════════════════════════════ -->
      <section class="mb-10">
        <div class="flex items-center justify-between mb-6">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="material-symbols-outlined text-orange-500">storefront</span>
              <span class="text-orange-500 text-xs font-bold uppercase tracking-widest">Mi Establecimiento</span>
            </div>
            <h1 class="text-3xl md:text-4xl font-black text-white brand tracking-tight">{{ establishment.name }}</h1>
          </div>
          <button
            @click="openEditProfile"
            class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[#adaaad] hover:text-white hover:border-white/20 transition-colors text-sm font-semibold"
          >
            <span class="material-symbols-outlined text-base">edit</span>
            Editar perfil
          </button>
        </div>

        <div class="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
          <div v-if="establishment.category" class="flex items-center gap-2">
            <span class="px-3 py-1 bg-orange-500/10 text-orange-500 text-xs font-bold uppercase rounded-full border border-orange-500/20 tracking-wider">
              {{ establishment.category }}
            </span>
          </div>
          <p v-if="establishment.description" class="text-[#adaaad]">{{ establishment.description }}</p>
          <p v-else class="text-[#adaaad]/50 text-sm italic">Sin descripción. Edita el perfil para añadir una.</p>

          <div class="flex flex-wrap gap-6 pt-2">
            <div v-if="establishment.openingHours" class="flex items-center gap-2 text-sm text-[#adaaad]">
              <span class="material-symbols-outlined text-orange-500 text-base">schedule</span>
              {{ establishment.openingHours }}
            </div>
            <div v-if="establishment.locationDetails" class="flex items-center gap-2 text-sm text-[#adaaad]">
              <span class="material-symbols-outlined text-orange-500 text-base">location_on</span>
              {{ establishment.locationDetails }}
            </div>
          </div>

          <!-- Galería -->
          <div v-if="establishment.galleryUrls?.length" class="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-2">
            <img
              v-for="(url, i) in establishment.galleryUrls"
              :key="i"
              :src="url"
              class="w-full aspect-square object-cover rounded-xl"
            />
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════════════════════════════
           PUBLICACIONES
      ══════════════════════════════════════════════════════════════════════════ -->
      <section class="mb-12">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-white brand tracking-tight">Publicaciones</h2>
          <button
            @click="openCreatePost"
            class="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-sm shadow-md hover:brightness-110 active:scale-95 transition-all"
          >
            <span class="material-symbols-outlined text-base">add</span>
            Nueva publicación
          </button>
        </div>

        <div v-if="posts.length === 0" class="text-center py-12 border border-dashed border-white/10 rounded-3xl">
          <span class="material-symbols-outlined text-5xl text-[#adaaad]/40 block mb-2">campaign</span>
          <p class="text-[#adaaad] font-bold">Sin publicaciones todavía</p>
          <p class="text-sm text-[#adaaad]/60 mt-1">Comparte novedades o el menú del día con los estudiantes.</p>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="post in posts"
            :key="post.id"
            class="bg-white/5 border border-white/10 rounded-3xl p-6"
          >
            <div class="flex justify-between items-start mb-3">
              <p class="text-xs text-[#adaaad]">{{ formatDate(post.createdAt) }}</p>
              <div class="flex items-center gap-2">
                <button @click="openEditPost(post)" class="text-[#adaaad] hover:text-white transition-colors">
                  <span class="material-symbols-outlined text-base">edit</span>
                </button>
                <button @click="deletePost(post.id)" class="text-[#adaaad] hover:text-red-400 transition-colors">
                  <span class="material-symbols-outlined text-base">delete</span>
                </button>
              </div>
            </div>

            <p class="text-[#f9f5f8] mb-4 whitespace-pre-wrap">{{ post.content }}</p>

            <div v-if="post.imageUrls?.length" class="grid gap-2" :class="post.imageUrls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'">
              <img
                v-for="(url, i) in post.imageUrls"
                :key="i"
                :src="url"
                class="w-full rounded-2xl object-cover max-h-64"
              />
            </div>
          </div>

          <!-- Paginación posts -->
          <div v-if="totalPostPages > 1" class="flex items-center justify-between pt-2">
            <button
              :disabled="postPage === 1"
              @click="loadPosts(establishment!.slug!, postPage - 1)"
              class="flex items-center gap-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-white disabled:opacity-40 hover:bg-white/10 transition-colors"
            >
              <span class="material-symbols-outlined" style="font-size:16px;">arrow_back_ios</span>
              Anterior
            </button>
            <span class="text-sm text-[#adaaad]">{{ postPage }} / {{ totalPostPages }}</span>
            <button
              :disabled="postPage === totalPostPages"
              @click="loadPosts(establishment!.slug!, postPage + 1)"
              class="flex items-center gap-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-white disabled:opacity-40 hover:bg-white/10 transition-colors"
            >
              Siguiente
              <span class="material-symbols-outlined" style="font-size:16px;">arrow_forward_ios</span>
            </button>
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════════════════════════════
           RESEÑAS DE ESTUDIANTES
      ══════════════════════════════════════════════════════════════════════════ -->
      <section>
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-white brand tracking-tight">Reseñas de Estudiantes</h2>
          <div class="flex items-center gap-3">
            <span v-if="pendingCount > 0" class="bg-orange-500/20 text-orange-500 font-bold px-3 py-1 rounded-full text-sm">
              {{ pendingCount }} sin responder
            </span>
            <span v-else class="bg-emerald-500/10 text-emerald-400 font-bold px-3 py-1 rounded-full text-sm flex items-center gap-1">
              <span class="material-symbols-outlined text-sm" style="font-variation-settings: 'FILL' 1;">done_all</span>
              Todo respondido
            </span>
          </div>
        </div>

        <!-- Búsqueda -->
        <div class="flex flex-col sm:flex-row gap-3 mb-6">
          <div class="relative flex-1">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#adaaad]" style="font-size:18px;">search</span>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar por comentario o usuario..."
              class="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-black/10 text-sm text-[#0e0e10] placeholder:text-[#adaaad] focus:outline-none focus:ring-2 focus:ring-orange-500/30"
            />
          </div>
          <input v-model="searchDate" type="date" class="px-4 py-2.5 rounded-xl bg-white border border-black/10 text-sm text-[#0e0e10] focus:outline-none focus:ring-2 focus:ring-orange-500/30" />
          <button
            v-if="searchQuery || searchDate"
            @click="clearSearch"
            class="px-4 py-2.5 rounded-xl bg-white border border-black/10 text-sm font-bold text-[#525155] hover:bg-black/5 transition-colors flex items-center gap-1"
          >
            <span class="material-symbols-outlined" style="font-size:16px;">close</span>
            Limpiar
          </button>
        </div>

        <div v-if="reviewsLoading" class="space-y-4">
          <div v-for="i in 3" :key="i" class="h-36 bg-white/5 rounded-2xl animate-pulse"></div>
        </div>

        <div v-else-if="reviews.length === 0" class="text-center py-16 bg-white/5 rounded-3xl border border-dashed border-white/10">
          <span class="material-symbols-outlined text-5xl text-[#adaaad]/40 mb-2 block">rate_review</span>
          <p class="text-[#adaaad] font-bold">Sin reseñas todavía</p>
        </div>

        <div v-else-if="filteredReviews.length === 0" class="text-center py-12 bg-white/5 rounded-3xl border border-dashed border-white/10">
          <span class="material-symbols-outlined text-4xl text-[#adaaad]/40 mb-2 block">search_off</span>
          <p class="text-[#adaaad] font-bold">Sin resultados</p>
        </div>

        <div v-else class="space-y-5">
          <div
            v-for="review in paginatedReviews"
            :key="review.id"
            class="card-cream rounded-[1.5rem] p-6 shadow-sm border border-black/5"
          >
            <div class="flex justify-between items-start flex-col sm:flex-row gap-4 mb-4">
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold flex-shrink-0">
                  {{ (review.author ?? '?').charAt(0).toUpperCase() }}
                </div>
                <div>
                  <p class="font-bold text-[#0e0e10] brand">{{ review.author ?? 'Estudiante' }}</p>
                  <p class="text-xs text-[#adaaad]">{{ formatDate(review.createdAt) }}</p>
                </div>
              </div>
              <div class="flex items-center gap-2 flex-wrap">
                <span :class="['px-2 py-0.5 rounded-full text-xs font-bold', sentimentBadge((review as any).sentiment)]">
                  {{ sentimentLabel((review as any).sentiment) }}
                </span>
                <div class="flex items-center gap-1 bg-white px-3 py-1 rounded-full shadow-sm border border-black/5">
                  <span class="material-symbols-outlined text-orange-500 text-sm" style="font-variation-settings: 'FILL' 1;">star</span>
                  <span class="font-bold text-[#0e0e10] text-sm">{{ avgRating(review) }}</span>
                </div>
              </div>
            </div>

            <div class="flex gap-4 mb-3 flex-wrap">
              <span class="text-xs text-[#adaaad]">Comida: <strong class="text-[#0e0e10]">{{ review.foodScore }}/5</strong></span>
              <span class="text-xs text-[#adaaad]">Servicio: <strong class="text-[#0e0e10]">{{ review.serviceScore }}/5</strong></span>
              <span class="text-xs text-[#adaaad]">Precio: <strong class="text-[#0e0e10]">{{ review.priceScore }}/5</strong></span>
            </div>

            <p class="text-[#3f3f42] mb-4">"{{ review.comment }}"</p>

            <div v-if="(review as any).managerReply" class="mt-3 p-4 bg-orange-50 rounded-xl border border-orange-100">
              <div class="flex items-center gap-2 mb-2">
                <span class="material-symbols-outlined text-orange-500 text-sm" style="font-variation-settings: 'FILL' 1;">storefront</span>
                <span class="text-xs font-bold text-orange-600 uppercase tracking-wide">Respuesta del establecimiento</span>
              </div>
              <p class="text-sm text-[#3f3f42]">{{ (review as any).managerReply }}</p>
            </div>

            <div v-else class="flex justify-end mt-2">
              <button
                @click="openReplyModal(review)"
                class="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold py-2 px-6 rounded-lg hover:brightness-110 active:scale-95 transition-all shadow-md text-sm"
              >
                <span class="material-symbols-outlined text-sm">reply</span>
                Responder
              </button>
            </div>
          </div>

          <!-- Paginación reseñas -->
          <div v-if="Math.ceil(filteredReviews.length / REVIEW_PAGE_SIZE) > 1" class="flex items-center justify-between pt-4">
            <button
              :disabled="reviewPage === 1"
              @click="reviewPage--"
              class="flex items-center gap-1 px-4 py-2 rounded-xl bg-white border border-black/10 text-sm font-bold text-[#0e0e10] disabled:opacity-40 hover:bg-black/5 transition-colors"
            >
              <span class="material-symbols-outlined" style="font-size:16px;">arrow_back_ios</span>
              Anterior
            </button>
            <span class="text-sm text-[#adaaad] font-bold">
              Página {{ reviewPage }} de {{ Math.ceil(filteredReviews.length / REVIEW_PAGE_SIZE) }}
              <span class="text-[#adaaad]/60 font-normal ml-1">({{ filteredReviews.length }} resultados)</span>
            </span>
            <button
              :disabled="reviewPage === Math.ceil(filteredReviews.length / REVIEW_PAGE_SIZE)"
              @click="reviewPage++"
              class="flex items-center gap-1 px-4 py-2 rounded-xl bg-white border border-black/10 text-sm font-bold text-[#0e0e10] disabled:opacity-40 hover:bg-black/5 transition-colors"
            >
              Siguiente
              <span class="material-symbols-outlined" style="font-size:16px;">arrow_forward_ios</span>
            </button>
          </div>
        </div>
      </section>
    </template>

    <!-- Modals -->
    <CreatePostModal
      :isOpen="postModalOpen"
      :slug="establishment?.slug ?? ''"
      :editPost="editingPost"
      @close="postModalOpen = false; editingPost = null"
      @created="onPostCreated"
      @updated="onPostUpdated"
    />

    <ManagerReplyModal
      :isOpen="replyModalOpen"
      :review="selectedReview"
      @close="replyModalOpen = false; selectedReview = null"
      @sent="handleReplySent"
    />

    <!-- Edit Profile Modal -->
    <div v-if="editProfileOpen" class="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div class="absolute inset-0 bg-[#0e0e10]/80 backdrop-blur-xl" @click="editProfileOpen = false"></div>
      <div class="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div class="px-8 py-6 border-b border-black/5 bg-[#FAF9F6] flex items-center justify-between">
          <h3 class="text-xl font-bold text-[#0e0e10] brand">Editar Perfil</h3>
          <button @click="editProfileOpen = false" class="w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/5 text-[#adaaad] transition-colors">
            <span class="material-symbols-outlined text-xl">close</span>
          </button>
        </div>
        <div class="p-8 space-y-5">
          <div>
            <label class="text-xs font-bold text-orange-500 uppercase tracking-widest block mb-2">Descripción</label>
            <textarea v-model="editForm.description" rows="4" class="w-full bg-[#FAF9F6] border border-black/10 rounded-xl px-4 py-3 text-[#0e0e10] focus:outline-none focus:border-orange-500 resize-none text-sm"></textarea>
          </div>
          <div>
            <label class="text-xs font-bold text-orange-500 uppercase tracking-widest block mb-2">Horario</label>
            <input v-model="editForm.openingHours" type="text" placeholder="Lunes a Viernes: 8:00 AM - 6:00 PM" class="w-full bg-[#FAF9F6] border border-black/10 rounded-xl px-4 py-3 text-[#0e0e10] focus:outline-none focus:border-orange-500 text-sm" />
          </div>
          <div>
            <label class="text-xs font-bold text-orange-500 uppercase tracking-widest block mb-2">Ubicación</label>
            <input v-model="editForm.locationDetails" type="text" placeholder="Frente al edificio A, planta baja" class="w-full bg-[#FAF9F6] border border-black/10 rounded-xl px-4 py-3 text-[#0e0e10] focus:outline-none focus:border-orange-500 text-sm" />
          </div>
        </div>
        <div class="px-8 py-5 border-t border-black/5 bg-[#FAF9F6] flex justify-end gap-3">
          <button @click="editProfileOpen = false" class="px-6 py-2.5 rounded-full text-sm font-semibold text-[#525155] hover:bg-black/5 transition-colors">Cancelar</button>
          <button @click="saveProfile" class="px-8 py-2.5 rounded-full text-sm font-bold bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md hover:brightness-110 transition-all">Guardar</button>
        </div>
      </div>
    </div>

  </div>
</template>
