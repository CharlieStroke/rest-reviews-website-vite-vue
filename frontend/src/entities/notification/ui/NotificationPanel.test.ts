import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import NotificationPanel from './NotificationPanel.vue';

vi.mock('../model/notificationStore', () => ({
  useNotificationStore: () => ({
    notifications: [
      { id: '1', type: 'manager_reply', isRead: false, createdAt: new Date().toISOString(), reviewId: 'r1' },
      { id: '2', type: 'like', isRead: true, createdAt: new Date().toISOString(), reviewId: 'r2' },
      { id: '3', type: 'unknown_type', isRead: false, createdAt: new Date().toISOString(), reviewId: 'r3' },
    ],
    markAsRead: vi.fn(),
  }),
}));

vi.mock('vue-router', () => ({ useRouter: () => ({ push: vi.fn() }) }));

describe('NotificationPanel', () => {
  beforeEach(() => setActivePinia(createPinia()));

  it('muestra mensaje correcto para manager_reply', () => {
    const wrapper = mount(NotificationPanel);
    expect(wrapper.text()).toContain('El gerente respondió tu reseña');
  });

  it('muestra mensaje correcto para like', () => {
    const wrapper = mount(NotificationPanel);
    expect(wrapper.text()).toContain('A alguien le gustó tu reseña');
  });

  it('muestra mensaje genérico para tipo desconocido', () => {
    const wrapper = mount(NotificationPanel);
    expect(wrapper.text()).toContain('Nueva notificación');
  });

  it('usa ícono favorite para notificación de like', () => {
    const wrapper = mount(NotificationPanel);
    const icons = wrapper.findAll('.material-symbols-outlined');
    expect(icons.map((i) => i.text())).toContain('favorite');
  });
});
