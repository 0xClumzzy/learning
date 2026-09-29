import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { initTopicData, getInitError } from './composables/useTopicData';
import './styles/main.css';

async function bootstrap() {
  /* initTopicData() records failures on getInitError() rather than throwing,
     so the app still mounts when the API server is unreachable. The UI
     reads getInitError() to explain the empty dashboard. */
  await initTopicData();
  const initError = getInitError();
  if (initError) {
    console.error(`[peaches] Could not load topic data: ${initError}`);
  }

  const app = createApp(App);
  app.use(router);
  app.mount('#app');
}

bootstrap().catch((err) => {
  // Last-resort guard: a failure this early should surface, not white-screen.
  console.error('[peaches] bootstrap failed:', err);
});
