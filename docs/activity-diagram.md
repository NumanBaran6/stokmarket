# Activity Diyagramı — Sipariş Oluşturma Akışı

Bir bayinin haftalık siparişini oluştururken izlediği akış ve sistemin
yaptığı doğrulamalar (MOQ, stok, kimlik) aşağıda gösterilmiştir.

```mermaid
flowchart TD
    Start([Başla]) --> Login{Giriş yapıldı mı?}
    Login -->|Hayır| GoLogin[Giriş / Kayıt sayfasına yönlendir]
    GoLogin --> Login
    Login -->|Evet| Browse[Katalogu görüntüle / ara]
    Browse --> Add[Ürünü sepete ekle]
    Add --> MOQ{Miktar ≥ MOQ ?}
    MOQ -->|Hayır| Warn[Uyarı: minimum sipariş miktarı]
    Warn --> Add
    MOQ -->|Evet| More{Başka ürün eklenecek mi?}
    More -->|Evet| Browse
    More -->|Hayır| Day[Teslimat günü seç]
    Day --> DaySel{Gün seçildi mi?}
    DaySel -->|Hayır| Day
    DaySel -->|Evet| Confirm[Onay modalını aç]
    Confirm --> Submit[Siparişi backend'e gönder]

    Submit --> Validate{Backend doğrulaması\nMOQ + Stok}
    Validate -->|Geçersiz| Error[Hata mesajı göster]
    Error --> Day
    Validate -->|Geçerli| Price[VIP/standart fiyatı uygula]
    Price --> Invoice[Otomatik fatura no üret]
    Invoice --> Stock[Stokları düş]
    Stock --> Save[(Siparişi kaydet)]
    Save --> Show[Fatura detayını göster]
    Show --> End([Bitir])
```

## Akış Açıklaması

1. Kimlik doğrulama hem **frontend** (ProtectedRoute) hem **backend** (JWT middleware) tarafında yapılır.
2. **MOQ** kontrolü iki katmanda: kullanıcı arayüzünde miktar kutusu MOQ altına inmez, ayrıca backend de `quantity < product.moq` durumunu reddeder.
3. Fiyat **sunucu tarafında** kullanıcının `tier` değerine göre belirlenir (VIP indirimi istemciye bırakılmaz).
4. Sipariş başarıyla kaydedilince **stoklar düşülür** ve **fatura numarası** otomatik üretilir.
