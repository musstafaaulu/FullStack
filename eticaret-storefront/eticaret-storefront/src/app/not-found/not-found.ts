import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [],
  template: `
    <div class="nf-wrapper">
      <div class="nf-content">
        <div class="nf-code">404</div>
        <h1>Sayfa Bulunamadı</h1>
        <p>Aradığın sayfa taşınmış veya silinmiş olabilir.</p>
        <button class="nf-btn" (click)="goHome()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          </svg>
          Ana Sayfaya Dön
        </button>
      </div>
    </div>
  `,
  styles: [`
    .nf-wrapper {
      min-height: 100vh; display: flex; align-items: center; justify-content: center;
      background: #f8f9fc; font-family: 'DM Sans', sans-serif;
    }
    .nf-content { text-align: center; padding: 40px; }
    .nf-code {
      font-size: 120px; font-weight: 900; line-height: 1;
      background: linear-gradient(135deg, #6366f1, #a855f7);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      margin-bottom: 16px;
    }
    h1 { font-size: 28px; color: #1e293b; margin-bottom: 10px; font-weight: 800; }
    p  { color: #94a3b8; font-size: 16px; margin-bottom: 32px; }
    .nf-btn {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 14px 28px;
      background: linear-gradient(135deg, #6366f1, #a855f7);
      color: white; border: none; border-radius: 50px;
      font-size: 15px; font-weight: 700; cursor: pointer;
      font-family: 'DM Sans', sans-serif; transition: 0.2s;
    }
    .nf-btn:hover { opacity: 0.9; transform: translateY(-2px); }
  `]
})
export class NotFoundComponent {
  constructor(private router: Router) {}
  goHome() { this.router.navigate(['/home']); }
}