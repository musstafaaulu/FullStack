import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './product-detail.html',
  styleUrls: ['./product-detail.css']
})
export class ProductDetailComponent implements OnInit {
  product: any = null;
  comments: any[] = [];
  relatedProducts: any[] = [];
  isLoading: boolean = true;
  currentUser: any = null;
  cartCount: number = 0;
  addedToCart: boolean = false;
  quantity: number = 1;
  selectedImage: string = '';
  isWishlisted: boolean = false;
  activeTab: 'description' | 'comments' = 'description';

  newComment = { text: '', rating: 5 };
  submittingComment: boolean = false;
  commentSuccess: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService
  ) {}

  ngOnInit() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) this.currentUser = JSON.parse(savedUser);
    this.updateCartCount();

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) this.loadProduct(+id);
    });
  }

  loadProduct(id: number) {
    this.isLoading = true;
    window.scrollTo({ top: 0 });
    this.dataService.getProductById(id).subscribe({
      next: (res: any) => {
        const raw = res?.data || res;

        // ✅ Tüm alanları güvenli şekilde al
        this.product = {
          id:          raw?.id || id,
          name:        raw?.name || 'Ürün',
          description: raw?.description || '',
          price:       raw?.price || 0,
          stock:       raw?.stock ?? 0,
          category:    raw?.category || raw?.categoryName || 'Genel',
          brandName:   raw?.brandName || raw?.brand || '',
          imageUrl:    raw?.imageUrl || raw?.img || `https://picsum.photos/seed/${id}/600/600`,
        };

        this.selectedImage = this.product.imageUrl;

        const wishlist = JSON.parse(localStorage.getItem('nexus_wishlist') || '[]');
        this.isWishlisted = wishlist.includes(id);

        this.isLoading = false;
        this.loadComments(id);
        this.loadRelated();
      },
      error: () => {
        this.isLoading = false;
        this.router.navigate(['/home']);
      }
    });
  }

  loadComments(productId: number) {
    this.dataService.getCommentsByProduct(productId).subscribe({
      next: (res: any) => {
        const raw = res?.data || res || [];
        // ✅ Her yorumu güvenli şekilde normalize et
        this.comments = (Array.isArray(raw) ? raw : []).map((c: any) => ({
          ...c,
          rating:    typeof c.rating === 'number' ? c.rating : 5,
          text:      c.text || c.content || '',
          userName:  c.userName || c.user?.fullName || 'Kullanıcı',
          userId:    typeof c.userId === 'number' ? c.userId : 0,
          createdAt: c.createdAt || null,
        }));
      },
      error: () => { this.comments = []; }
    });
  }

  loadRelated() {
    this.dataService.getProducts('?pageSize=8').subscribe({
      next: (res: any) => {
        const data = res?.data;
        let items: any[] = [];
        if (data?.items) items = data.items;
        else if (Array.isArray(data)) items = data;
        else if (Array.isArray(res)) items = res;

        this.relatedProducts = items
          .filter((p: any) => p.id !== this.product?.id)
          .slice(0, 4)
          .map((p: any) => ({
            ...p,
            imageUrl: p.imageUrl || p.img || `https://picsum.photos/seed/${p.id}/300/300`
          }));
      },
      error: () => { this.relatedProducts = []; }
    });
  }

  addToCart() {
    if (!this.product) return;
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find((item: any) => item.id === this.product.id);
    if (existing) existing.quantity += this.quantity;
    else cart.push({ ...this.product, quantity: this.quantity });
    localStorage.setItem('cart', JSON.stringify(cart));
    this.updateCartCount();
    this.addedToCart = true;
    setTimeout(() => this.addedToCart = false, 2000);
  }

  toggleWishlist() {
    const wishlist = JSON.parse(localStorage.getItem('nexus_wishlist') || '[]');
    const idx = wishlist.indexOf(this.product.id);
    if (idx === -1) wishlist.push(this.product.id);
    else wishlist.splice(idx, 1);
    localStorage.setItem('nexus_wishlist', JSON.stringify(wishlist));
    this.isWishlisted = !this.isWishlisted;
  }

  shareProduct() {
    if (navigator.share) {
      navigator.share({ title: this.product.name, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  }

  submitComment() {
    if (!this.currentUser) { this.router.navigate(['/login']); return; }
    if (!this.newComment.text.trim()) return;
    this.submittingComment = true;

    this.dataService.addComment({
      productId: this.product.id,
      text:      this.newComment.text,
      rating:    this.newComment.rating
    }).subscribe({
      next: () => {
        this.submittingComment = false;
        this.commentSuccess    = true;
        this.newComment        = { text: '', rating: 5 };
        setTimeout(() => this.commentSuccess = false, 3000);
      },
      error: () => { this.submittingComment = false; }
    });
  }

  setRating(star: number) { this.newComment.rating = star; }

  get stars(): number[] { return [1, 2, 3, 4, 5]; }

  get avgRating(): number {
    if (!this.comments.length) return 0;
    const sum = this.comments.reduce((s, c) => s + (c.rating || 0), 0);
    return Math.round((sum / this.comments.length) * 10) / 10;
  }

  getRatingCount(star: number): number {
    return this.comments.filter(c => c.rating === star).length;
  }

  getRatingPercent(star: number): number {
    if (!this.comments.length) return 0;
    return Math.round((this.getRatingCount(star) / this.comments.length) * 100);
  }

  // ✅ userId null/string güvenli renk üretici
  getAvatarColor(userId: any): string {
    const n = typeof userId === 'number' ? userId : 1;
    return `hsl(${(n * 47) % 360}, 60%, 55%)`;
  }

  increaseQty() {
    if (this.quantity < (this.product?.stock || 99)) this.quantity++;
  }

  decreaseQty() {
    if (this.quantity > 1) this.quantity--;
  }

  updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    this.cartCount = cart.reduce((acc: number, item: any) => acc + item.quantity, 0);
  }

  goBack()                { this.router.navigate(['/home']); }
  goToProduct(id: number) { this.router.navigate(['/product', id]); }
}