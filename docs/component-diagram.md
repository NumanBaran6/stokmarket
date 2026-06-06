# Component (Bileşen) Diyagramı

React frontend'inin bileşen hiyerarşisi, context sağlayıcıları ve backend ile
ilişkisi aşağıda gösterilmiştir.

```mermaid
flowchart TD
    subgraph Frontend["🖥️ Frontend (React + Vite)"]
        main[main.jsx] --> Providers[AuthProvider / ToastProvider / CartProvider]
        Providers --> App[App.jsx + React Router]

        App --> Navbar
        App --> Footer
        App --> Routes{{Sayfalar}}

        Routes --> Catalog[CatalogPage]
        Routes --> Detail[ProductDetailPage]
        Routes --> Login[LoginPage]
        Routes --> Register[RegisterPage]
        Routes --> Cart[CartPage]
        Routes --> Orders[OrdersPage]
        Routes --> OrderDetail[OrderDetailPage]
        Routes --> Admin[AdminPage]

        Catalog --> ProductCard
        Catalog --> ReminderBanner
        Catalog --> Spinner
        Catalog --> EmptyState
        Cart --> Modal
        Admin --> Modal
        Admin --> FormField
        Orders --> StatusBadge
        Login --> FormField

        ProtectedRoute -.korur.-> Cart
        ProtectedRoute -.korur.-> Orders
        ProtectedRoute -.korur.-> Admin

        ProductCard --> CartCtx[(CartContext)]
        Navbar --> AuthCtx[(AuthContext)]
        Navbar --> CartCtx
    end

    subgraph API["🔌 API Katmanı"]
        Axios[axios.js + JWT interceptor]
    end

    subgraph Backend["⚙️ Backend (Express)"]
        Router[Routes] --> MW[Auth / Error Middleware]
        MW --> Controllers
        Controllers --> Models[(Mongoose Models)]
        Models --> DB[(MongoDB)]
    end

    Catalog & Cart & Admin & Login & Orders --> Axios
    Axios -->|HTTP /api| Router

    classDef ctx fill:#fef3c7,stroke:#d97706;
    class AuthCtx,CartCtx ctx;
```

## Bileşen Listesi (8+)

| Bileşen | Görev |
|---------|-------|
| `Navbar` | Üst menü, rol/giriş durumuna göre linkler, sepet rozeti |
| `Footer` | Alt bilgi |
| `ProtectedRoute` | Giriş/rol kontrolü (frontend koruma) |
| `ProductCard` | Ürün kartı, VIP fiyat rozeti, sepete ekle |
| `Modal` | Genel amaçlı popup (onay, form) |
| `Spinner` | Yükleniyor göstergesi |
| `Toast` (ToastContext) | Bildirim mesajları |
| `FormField` | Etiket + input + hata mesajı sarmalayıcı |
| `StatusBadge` | Sipariş durumu etiketi |
| `EmptyState` | Boş liste durumu |
| `ReminderBanner` | Haftalık sipariş hatırlatma afişi |
