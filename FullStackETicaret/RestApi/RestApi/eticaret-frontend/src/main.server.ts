import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { config } from './app/app.config.server';

// bootstrap fonksiyonu bir Promise dönmeli ve hata yakalamalıdır
const bootstrap = () => bootstrapApplication(App, config);

export default bootstrap;