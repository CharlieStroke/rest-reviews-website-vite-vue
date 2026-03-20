<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ReviewService } from '@/entities/review/api/ReviewService';

const route = useRoute();
const router = useRouter();

const establishmentId = route.params.id as string;

const foodScore = ref(5);
const serviceScore = ref(5);
const priceScore = ref(5);
const comment = ref('');
const loading = ref(false);
const error = ref<string | null>(null);
const touched = ref(false);

const COMMENT_MIN = 20;
const COMMENT_MAX = 500;

const commentLength = computed(() => comment.value.length);
const commentTooShort = computed(() => touched.value && commentLength.value > 0 && commentLength.value < COMMENT_MIN);
const commentTooLong = computed(() => commentLength.value > COMMENT_MAX);
const commentValid = computed(() => commentLength.value === 0 || (commentLength.value >= COMMENT_MIN && commentLength.value <= COMMENT_MAX));

const scoreValid = (score: number) => score >= 1 && score <= 5;
const allScoresValid = computed(() => scoreValid(foodScore.value) && scoreValid(serviceScore.value) && scoreValid(priceScore.value));

const formValid = computed(() => allScoresValid.value && commentValid.value && !loading.value);

const localIGE = computed(() => {
  const food = foodScore.value * 0.5;
  const service = serviceScore.value * 0.3;
  const price = priceScore.value * 0.2;
  return (food + service + price).toFixed(1);
});

const commentCounterClass = computed(() => {
  if (commentTooLong.value) return 'text-red-400';
  if (commentTooShort.value) return 'text-amber-400';
  if (commentLength.value >= COMMENT_MIN) return 'text-emerald-400';
  return 'text-white/40';
});

const onCommentInput = () => {
  touched.value = true;
};

const submitReview = async () => {
  touched.value = true;
  if (!formValid.value) return;

  loading.value = true;
  error.value = null;
  try {
    const response = await ReviewService.create({
      establishmentId,
      foodScore: foodScore.value,
      serviceScore: serviceScore.value,
      priceScore: priceScore.value,
      comment: comment.value || undefined
    });
    alert(response.message || '¡Evaluación enviada con éxito!');
    router.push('/establishments');
  } catch (e: unknown) {
    const err = e as { response?: { status?: number; data?: { message?: string } } };
    if (err.response?.status === 409) {
      error.value = 'Ya has enviado una reseña para este establecimiento anteriormente. No puedes enviar otra.';
    } else {
      error.value = err.response?.data?.message || 'Hubo un error al enviar tu evaluación.';
    }
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="page-container">
    <div class="glass-panel form-card">
      <div class="form-header">
        <h2>Evaluar Establecimiento</h2>
        <router-link to="/establishments" class="btn-back">← Volver</router-link>
      </div>

      <form @submit.prevent="submitReview" class="review-form">
        <div class="score-group">
          <label>Calidad de la Comida (1-5)</label>
          <input type="range" v-model.number="foodScore" min="1" max="5" class="slider" />
          <span class="score-val">{{ foodScore }}</span>
        </div>

        <div class="score-group">
          <label>Servicio y Atención (1-5)</label>
          <input type="range" v-model.number="serviceScore" min="1" max="5" class="slider" />
          <span class="score-val">{{ serviceScore }}</span>
        </div>

        <div class="score-group">
          <label>Relación Calidad-Precio (1-5)</label>
          <input type="range" v-model.number="priceScore" min="1" max="5" class="slider" />
          <span class="score-val">{{ priceScore }}</span>
        </div>

        <div class="form-group">
          <label>Comentario (Opcional)</label>
          <textarea
            v-model="comment"
            rows="4"
            placeholder="¿Qué te pareció el lugar? (mínimo 20 caracteres si escribes algo)"
            :maxlength="COMMENT_MAX"
            @input="onCommentInput"
          ></textarea>
          <div class="comment-footer">
            <span v-if="commentTooShort" class="validation-msg text-amber-400">
              Mínimo {{ COMMENT_MIN }} caracteres
            </span>
            <span v-else-if="commentTooLong" class="validation-msg text-red-400">
              Máximo {{ COMMENT_MAX }} caracteres
            </span>
            <span v-else class="validation-msg">&nbsp;</span>
            <span :class="['char-counter', commentCounterClass]">
              {{ commentLength }}/{{ COMMENT_MAX }}
            </span>
          </div>
        </div>

        <div class="ige-preview">
          Cálculo IGE local: <strong>{{ localIGE }}</strong> / 5.0
        </div>

        <div v-if="error" class="error-msg">{{ error }}</div>

        <button type="submit" class="btn-primary" :disabled="!formValid">
          <span v-if="loading" class="loading-content">
            <span class="spinner"></span>
            Enviando...
          </span>
          <span v-else>Enviar Reseña</span>
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  padding: 2rem;
  display: flex;
  justify-content: center;
}
.form-card {
  width: 100%;
  max-width: 600px;
  padding: 2.5rem;
}
.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}
.btn-back {
  color: var(--text-secondary);
  font-size: 0.9rem;
}
.score-group {
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}
.score-group label {
  flex: 1;
  font-weight: 500;
}
.slider {
  flex: 2;
  accent-color: var(--primary-color);
}
.score-val {
  width: 30px;
  text-align: center;
  font-weight: bold;
  color: var(--primary-color);
  background: rgba(255,255,255,0.1);
  border-radius: 4px;
  padding: 0.2rem;
}
.form-group {
  margin-bottom: 1rem;
}
.form-group textarea {
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 0.75rem;
  color: white;
  resize: vertical;
  font-family: inherit;
  transition: border-color 0.2s;
}
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary-color);
}
.comment-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.4rem;
  font-size: 0.8rem;
}
.validation-msg {
  font-weight: 500;
}
.char-counter {
  font-variant-numeric: tabular-nums;
}
.ige-preview {
  margin: 1.5rem 0;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-left: 4px solid var(--primary-color);
  font-size: 1.1rem;
}
.error-msg {
  color: #ff4d4f;
  margin-bottom: 1rem;
  font-weight: 500;
  padding: 0.5rem;
  background: rgba(255, 77, 79, 0.1);
  border-radius: 4px;
}
.btn-primary {
  width: 100%;
  padding: 0.75rem 1.5rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-primary:hover:not(:disabled) {
  filter: brightness(1.1);
}
.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.loading-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}
.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
