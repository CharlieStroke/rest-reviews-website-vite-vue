import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import EstablishmentsPage from './EstablishmentsPage.vue';
import { ReviewService } from '@/entities/review/api/ReviewService';

vi.mock('@/entities/review/api/ReviewService', () => ({
  ReviewService: { getEstablishments: vi.fn() },
}));
vi.mock('@/entities/user/model/authStore', () => ({
  useAuthStore: () => ({ userRole: 'student' }),
}));
vi.mock('vue-router', () => ({ useRouter: () => ({ push: vi.fn() }) }));

describe('EstablishmentsPage — error state', () => {
  beforeEach(() => vi.clearAllMocks());

  it('muestra botón de reintentar cuando falla la API', async () => {
    vi.mocked(ReviewService.getEstablishments).mockRejectedValue(new Error('fail'));
    const wrapper = mount(EstablishmentsPage);
    await new Promise((r) => setTimeout(r, 30));
    expect(wrapper.find('[data-testid="retry-btn"]').exists()).toBe(true);
  });

  it('no muestra establecimientos hardcodeados en estado de error', async () => {
    vi.mocked(ReviewService.getEstablishments).mockRejectedValue(new Error('fail'));
    const wrapper = mount(EstablishmentsPage);
    await new Promise((r) => setTimeout(r, 30));
    expect(wrapper.text()).not.toContain('DelyFull');
  });

  it('llama a getEstablishments de nuevo al hacer click en reintentar', async () => {
    vi.mocked(ReviewService.getEstablishments)
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce([]);
    const wrapper = mount(EstablishmentsPage);
    await new Promise((r) => setTimeout(r, 30));
    await wrapper.find('[data-testid="retry-btn"]').trigger('click');
    await new Promise((r) => setTimeout(r, 30));
    expect(ReviewService.getEstablishments).toHaveBeenCalledTimes(2);
  });
});
