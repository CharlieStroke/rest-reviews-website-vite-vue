<script setup lang="ts">
import { ref } from 'vue';
import ManagerReplyModal from './ManagerReplyModal.vue';

// Mock Data
const placeName = ref("DelyFull");

const metrics = ref([
  { id: '1', title: 'Índice de Gastronomía Estudiantil (IGE)', value: '4.8', max: '/ 5.0', icon: 'restaurant', color: 'orange-500' },
  { id: '2', title: 'Calidad de Alimentos', value: '92', max: '%', icon: 'thumb_up', color: 'emerald-500' },
  { id: '3', title: 'Servicio y Atención', value: '4.5', max: '/ 5.0', icon: 'person', color: 'blue-500' },
  { id: '4', title: 'Relación Precio-Calidad', value: '4.2', max: '/ 5.0', icon: 'payments', color: 'purple-500' },
]);

const pendingReviews = ref([
  {
    id: 'r1',
    author: 'Mateo Rivera',
    date: 'Hace 2 días',
    rating: 4.5,
    content: 'Increíble atención. Las chilaquiles verdes estaban en su punto exacto de picor. Sin duda, la mejor opción para desayunar entre clases pesadas.',
    status: 'pending'
  },
  {
    id: 'r2',
    author: 'Ana García',
    date: 'Hace 5 días',
    rating: 3.0,
    content: 'La comida es buena, pero tardaron más de 20 minutos en entregarme un agua de sabor.',
    status: 'pending'
  }
]);

const isReplyModalOpen = ref(false);
const selectedReview = ref<any>(null);

const openReplyModal = (review: any) => {
  selectedReview.value = review;
  isReplyModalOpen.value = true;
};

const handleSendReply = (payload: { reviewId: string, message: string }) => {
  console.log("Sending reply for review", payload.reviewId, ":", payload.message);
  const rev = pendingReviews.value.find(r => r.id === payload.reviewId);
  if (rev) {
    rev.status = 'replied';
  }
};

// Mock Establishment Profile Data
const isSavingProfile = ref(false);
const profileData = ref({
  name: 'DelyFull',
  category: 'Restaurante',
  bio: 'Comida saludable y antojitos 100% oaxaqueños (tlayudas, tacos, opciones veganas).',
  location: 'Campus Norte',
  images: [
    'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'
  ]
});

const saveProfile = () => {
  isSavingProfile.value = true;
  setTimeout(() => {
    isSavingProfile.value = false;
    placeName.value = profileData.value.name;
    // Show some success feedback mock
  }, 1000);
};

const triggerImageUpload = () => {
  // Mock image upload trigger
  console.log('Triggering image upload logic...');
};
</script>

<template>
  <div class="w-full max-w-7xl mx-auto px-6 lg:px-12 py-12 animate-fade-in relative">
    
    <!-- Hero Header -->
    <header class="mb-12">
      <div class="flex items-center gap-3 mb-2">
        <span class="material-symbols-outlined text-orange-500">storefront</span>
        <span class="text-orange-500 font-bold tracking-widest uppercase text-sm">Portal del Gerente</span>
      </div>
      <h1 class="text-4xl lg:text-5xl font-black text-white brand tracking-tight">
        Panel de Control: <span class="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-amber-500">{{ placeName }}</span>
      </h1>
      <p class="text-[#adaaad] mt-4 max-w-2xl text-lg">
        Analiza el rendimiento de tu establecimiento y conecta con nuestros leones mediante respuestas oficiales.
      </p>
    </header>

    <!-- Metrics Grid -->
    <section class="mb-16">
      <h2 class="text-2xl font-bold tracking-tight text-white mb-6 brand">Métricas Globales</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div 
          v-for="metric in metrics" 
          :key="metric.id"
          class="card-cream rounded-[1.5rem] p-6 shadow-sm flex flex-col gap-4 border border-outline-variant/10 relative overflow-hidden group hover:-translate-y-1 transition-transform"
        >
          <!-- Background Glow Effect for Hover -->
          <div :class="`absolute -top-10 -right-10 w-24 h-24 bg-${metric.color}/10 rounded-full blur-2xl group-hover:bg-${metric.color}/20 transition-colors`"></div>
          
          <div :class="`w-12 h-12 rounded-xl bg-white border border-${metric.color}/20 text-${metric.color} flex items-center justify-center shadow-sm`">
            <span class="material-symbols-outlined text-2xl" style="font-variation-settings: 'FILL' 1;">{{ metric.icon }}</span>
          </div>
          <div>
            <h3 class="text-[#525155] text-sm font-bold mb-1 uppercase">{{ metric.title }}</h3>
            <div class="flex items-baseline gap-1">
              <span class="text-3xl font-black text-[#0e0e10] brand">{{ metric.value }}</span>
              <span class="text-sm font-semibold text-[#8e8d91]">{{ metric.max }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Establishment Profile Edit Section -->
    <section class="mb-16">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold tracking-tight text-white brand">Perfil del Establecimiento</h2>
        <button 
          @click="saveProfile"
          :disabled="isSavingProfile"
          class="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-[0_4px_14px_rgba(249,115,22,0.3)] active:scale-95 disabled:opacity-50"
        >
          <span class="material-symbols-outlined text-sm" :class="isSavingProfile ? 'animate-spin' : ''">
            {{ isSavingProfile ? 'progress_activity' : 'save' }}
          </span>
          {{ isSavingProfile ? 'Guardando...' : 'Guardar Cambios' }}
        </button>
      </div>

      <div class="card-cream rounded-[1.5rem] p-8 shadow-xl border border-black/5">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          <!-- Text Data -->
          <div class="flex flex-col gap-6">
            <div>
              <label class="block text-xs font-bold uppercase tracking-widest text-[#525155] mb-2">Nombre del Local</label>
              <input v-model="profileData.name" type="text" class="w-full bg-white border border-black/10 rounded-xl px-4 py-3 text-[#0e0e10] font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-shadow" placeholder="Ej. DelyFull" />
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold uppercase tracking-widest text-[#525155] mb-2">Categoría</label>
                <select v-model="profileData.category" class="w-full bg-white border border-black/10 rounded-xl px-4 py-3 text-[#0e0e10] font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 transition-shadow appearance-none">
                  <option>Restaurante</option>
                  <option>Cafetería</option>
                  <option>Snacks</option>
                  <option>Comida Rápida</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold uppercase tracking-widest text-[#525155] mb-2">Ubicación</label>
                <input v-model="profileData.location" type="text" class="w-full bg-white border border-black/10 rounded-xl px-4 py-3 text-[#0e0e10] font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 transition-shadow" placeholder="Ej. Campus Norte" />
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold uppercase tracking-widest text-[#525155] mb-2">Biografía / Descripción</label>
              <textarea v-model="profileData.bio" rows="4" class="w-full bg-white border border-black/10 rounded-xl px-4 py-3 text-[#3f3f42] font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 transition-shadow resize-none" placeholder="Describe qué hace especial a tu comida..."></textarea>
            </div>
          </div>

          <!-- Media / Images -->
          <div class="flex flex-col gap-4">
            <label class="block text-xs font-bold uppercase tracking-widest text-[#525155]">Galería e Imágenes del Menú</label>
            <div class="grid grid-cols-2 gap-4">
              <div v-for="(img, idx) in profileData.images" :key="idx" class="relative rounded-xl overflow-hidden aspect-video group shadow-sm border border-black/5">
                <img :src="img" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <button class="absolute top-2 right-2 w-8 h-8 bg-red-500/90 text-white rounded-lg flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md">
                  <span class="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
              
              <!-- Upload Placeholder -->
              <button @click="triggerImageUpload" class="rounded-xl aspect-video border-2 border-dashed border-orange-500/30 bg-orange-50 hover:bg-orange-100/50 flex flex-col items-center justify-center gap-2 text-orange-500 transition-colors group">
                <span class="material-symbols-outlined text-3xl group-hover:-translate-y-1 transition-transform">add_photo_alternate</span>
                <span class="text-xs font-bold tracking-wide">Subir Imagen</span>
              </button>
            </div>
            <p class="text-xs text-[#adaaad] mt-2">
              Puedes subir hasta 6 imágenes de tu establecimiento o menú. Recomendado: 1920x1080px.
            </p>
          </div>

        </div>
      </div>
    </section>

    <!-- Reviews Management (API endpoints via form) -->
    <section>
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold tracking-tight text-white brand">Reseñas Pendientes de Respuesta</h2>
        <span class="bg-orange-500/20 text-orange-500 font-bold px-3 py-1 rounded-full text-sm">
          {{ pendingReviews.filter(r => r.status === 'pending').length }} pendientes
        </span>
      </div>

      <div class="grid grid-cols-1 gap-6">
        <div 
          v-for="review in pendingReviews" 
          :key="review.id"
          class="card-cream rounded-[1.5rem] p-6 shadow-sm border border-outline-variant/10"
        >
          <div class="flex justify-between items-start flex-col sm:flex-row gap-4 mb-4">
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold">
                {{ review.author.charAt(0) }}
              </div>
              <div>
                <p class="font-bold text-[#0e0e10] brand">{{ review.author }}</p>
                <p class="text-xs text-[#adaaad]">{{ review.date }}</p>
              </div>
            </div>
            
            <div class="flex items-center gap-1 bg-white px-3 py-1 rounded-full shadow-sm">
              <span class="material-symbols-outlined text-orange-500 text-sm" style="font-variation-settings: 'FILL' 1;">star</span>
              <span class="font-bold text-[#0e0e10] text-sm">{{ review.rating.toFixed(1) }}</span>
            </div>
          </div>
          
          <p class="text-[#3f3f42] mb-6">"{{ review.content }}"</p>
          
          <div class="flex justify-end">
            <button 
              v-if="review.status === 'pending'"
              @click="openReplyModal(review)"
              class="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold py-2 px-6 rounded-lg hover:brightness-110 active:scale-95 transition-all shadow-md"
            >
              <span class="material-symbols-outlined text-sm">reply</span>
              Responder
            </button>
            <div v-else class="flex items-center gap-2 text-emerald-600 font-bold text-sm bg-emerald-50 px-4 py-2 rounded-lg">
              <span class="material-symbols-outlined text-sm" style="font-variation-settings: 'FILL' 1;">check_circle</span>
              Respuesta enviada
            </div>
          </div>
        </div>

        <div v-if="pendingReviews.filter((r: any) => r.status === 'pending').length === 0" class="text-center py-12 card-cream rounded-[1.5rem] border border-dashed border-outline-variant/20">
          <span class="material-symbols-outlined text-5xl text-[#adaaad] mb-2">done_all</span>
          <p class="text-[#525155] font-bold">¡Todo al día!</p>
          <p class="text-sm text-[#adaaad]">No hay reseñas pendientes de respuesta.</p>
        </div>
      </div>
    </section>

    <ManagerReplyModal 
      :isOpen="isReplyModalOpen"
      :review="selectedReview"
      @close="isReplyModalOpen = false"
      @send="handleSendReply"
    />
  </div>
</template>
