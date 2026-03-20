<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/entities/user/model/authStore';
import { useRouter } from 'vue-router';
import { httpClient } from '@/shared/api/httpClient';

const authStore = useAuthStore();
const router = useRouter();

const bio = ref('');
const editingBio = ref(false);
const savingBio = ref(false);
const avatarUploading = ref(false);
const avatarUrl = ref<string | null>(null);
const reviews = ref<{ id: string; establishmentName: string; foodScore: number; serviceScore: number; priceScore: number; comment?: string; createdAt: string }[]>([]);
const loadingReviews = ref(true);
const error = ref<string | null>(null);

const userName = computed(() => authStore.user?.name || 'Usuario');
const userEmail = computed(() => authStore.user?.email || '');
const userRole = computed(() => authStore.user?.role || 'student');
const userInitials = computed(() => {
  const parts = userName.value.split(' ');
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return (parts[0][0] || '') + (parts[1][0] || '');
  }
  return (parts[0] || '').substring(0, 2).toUpperCase();
});

const roleBadge = computed(() => {
  const map: Record<string, string> = {
    student: 'Estudiante',
    manager: 'Encargado',
    admin: 'Administrador',
  };
  return map[userRole.value] || userRole.value;
});

const computeIGE = (food: number, service: number, price: number) => {
  return ((food * 0.5 + service * 0.3 + price * 0.2)).toFixed(1);
};

const fetchReviews = async () => {
  loadingReviews.value = true;
  try {
    const response = await httpClient.get('/api/reviews/me');
    reviews.value = response.data.data || [];
  } catch {
    reviews.value = [];
  } finally {
    loadingReviews.value = false;
  }
};

const saveBio = async () => {
  if (!authStore.user) return;
  savingBio.value = true;
  error.value = null;
  try {
    await httpClient.put(`/api/users/${authStore.user.id}`, { bio: bio.value });
    editingBio.value = false;
  } catch {
    error.value = 'No se pudo guardar la biografía.';
  } finally {
    savingBio.value = false;
  }
};

const handleAvatarChange = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file || !authStore.user) return;

  avatarUploading.value = true;
  error.value = null;
  try {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await httpClient.post('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    avatarUrl.value = response.data.data?.url || null;
  } catch {
    error.value = 'No se pudo subir la imagen.';
  } finally {
    avatarUploading.value = false;
  }
};

const logout = () => {
  authStore.logout();
  router.push('/login');
};

onMounted(() => {
  fetchReviews();
});
</script>

<template>
  <div class="p-8 max-w-4xl mx-auto space-y-6">
    <!-- Profile Card -->
    <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
      <div class="flex items-start gap-6">
        <!-- Avatar -->
        <div class="relative group shrink-0">
          <div
            v-if="avatarUrl"
            class="w-24 h-24 rounded-full bg-cover bg-center border-2 border-anahuac-orange"
            :style="{ backgroundImage: `url(${avatarUrl})` }"
          ></div>
          <div
            v-else
            class="w-24 h-24 rounded-full bg-anahuac-orange flex items-center justify-center text-3xl font-bold text-black"
          >
            {{ userInitials }}
          </div>
          <label
            class="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          >
            <span v-if="avatarUploading">...</span>
            <span v-else>Cambiar</span>
            <input type="file" accept="image/*" class="hidden" @change="handleAvatarChange" />
          </label>
        </div>

        <!-- User Info -->
        <div class="flex-1 min-w-0">
          <h1 class="text-2xl font-bold text-white mb-1">{{ userName }}</h1>
          <p class="text-white/50 text-sm mb-3">{{ userEmail }}</p>
          <span class="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-anahuac-orange/20 text-anahuac-orange">
            {{ roleBadge }}
          </span>
        </div>
      </div>

      <!-- Bio Section -->
      <div class="mt-6 pt-6 border-t border-white/10">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-sm font-semibold text-white/70 uppercase tracking-wider">Biografía</h3>
          <button
            v-if="!editingBio"
            class="text-anahuac-orange text-sm hover:underline"
            @click="editingBio = true"
          >
            Editar
          </button>
        </div>
        <div v-if="editingBio" class="space-y-3">
          <textarea
            v-model="bio"
            rows="3"
            placeholder="Cuéntanos sobre ti..."
            class="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/40 focus:outline-none focus:border-anahuac-orange transition-all resize-none"
          ></textarea>
          <div class="flex gap-2">
            <button
              class="px-4 py-2 bg-anahuac-orange text-white text-sm font-semibold rounded-xl hover:brightness-110 transition-all disabled:opacity-50"
              :disabled="savingBio"
              @click="saveBio"
            >
              {{ savingBio ? 'Guardando...' : 'Guardar' }}
            </button>
            <button
              class="px-4 py-2 text-white/50 text-sm hover:text-white transition-all"
              @click="editingBio = false"
            >
              Cancelar
            </button>
          </div>
        </div>
        <p v-else class="text-white/60 text-sm">
          {{ bio || 'Sin biografía aún. Haz clic en "Editar" para agregar una.' }}
        </p>
      </div>

      <div v-if="error" class="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
        {{ error }}
      </div>
    </div>

    <!-- Reviews History -->
    <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
      <h2 class="text-lg font-bold text-white mb-4">Historial de Reseñas</h2>

      <div v-if="loadingReviews" class="space-y-3">
        <div v-for="i in 3" :key="i" class="animate-pulse flex gap-4 p-4 bg-white/5 rounded-xl">
          <div class="h-4 bg-white/10 rounded w-1/4"></div>
          <div class="h-4 bg-white/10 rounded w-1/6"></div>
          <div class="h-4 bg-white/10 rounded w-1/3"></div>
        </div>
      </div>

      <div v-else-if="reviews.length === 0" class="text-center py-8">
        <p class="text-white/40 text-sm">No has escrito reseñas aún.</p>
        <router-link
          to="/establishments"
          class="inline-block mt-3 text-anahuac-orange text-sm hover:underline"
        >
          Ir a establecimientos
        </router-link>
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="review in reviews"
          :key="review.id"
          class="p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-all"
        >
          <div class="flex items-center justify-between mb-2">
            <span class="font-semibold text-white text-sm">{{ review.establishmentName || 'Establecimiento' }}</span>
            <span class="text-white/40 text-xs">{{ new Date(review.createdAt).toLocaleDateString('es-MX') }}</span>
          </div>
          <div class="flex gap-4 text-xs text-white/60 mb-2">
            <span>Comida: <strong class="text-white">{{ review.foodScore }}</strong></span>
            <span>Servicio: <strong class="text-white">{{ review.serviceScore }}</strong></span>
            <span>Precio: <strong class="text-white">{{ review.priceScore }}</strong></span>
            <span class="text-anahuac-orange font-semibold">IGE: {{ computeIGE(review.foodScore, review.serviceScore, review.priceScore) }}</span>
          </div>
          <p v-if="review.comment" class="text-white/50 text-sm">{{ review.comment }}</p>
        </div>
      </div>
    </div>

    <!-- Logout -->
    <button
      class="w-full py-3 text-red-400 border border-red-400/20 rounded-xl hover:bg-red-400/10 transition-all text-sm font-semibold"
      @click="logout"
    >
      Cerrar Sesión
    </button>
  </div>
</template>
