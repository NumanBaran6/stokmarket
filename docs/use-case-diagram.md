# Use-Case Diyagramı

Numan Gıda'da iki temel aktör vardır: **Bayi (Manav/Perakendeci)** ve **Yönetici (Toptancı)**.
Ziyaretçi (giriş yapmamış kullanıcı) yalnızca katalogu görüntüleyebilir.

```mermaid
flowchart LR
    %% Aktörler
    Ziyaretci(["👤 Ziyaretçi"])
    Bayi(["🛒 Bayi (Perakendeci)"])
    Admin(["👑 Yönetici (Toptancı)"])

    %% Use-case'ler
    UC1(["Katalogu görüntüle / ara"])
    UC2(["Kayıt ol"])
    UC3(["Giriş yap"])
    UC4(["Ürünü sepete ekle (MOQ)"])
    UC5(["Teslimat günü seç"])
    UC6(["Sipariş oluştur + fatura al"])
    UC7(["Siparişlerini görüntüle"])
    UC8(["Siparişi iptal et"])
    UC9(["VIP fiyatından yararlan"])
    UC10(["Ürün/kategori yönet (CRUD)"])
    UC11(["Tüm siparişleri görüntüle"])
    UC12(["Sipariş durumunu güncelle"])

    %% Ziyaretçi
    Ziyaretci --- UC1
    Ziyaretci --- UC2
    Ziyaretci --- UC3

    %% Bayi
    Bayi --- UC1
    Bayi --- UC4
    Bayi --- UC5
    Bayi --- UC6
    Bayi --- UC7
    Bayi --- UC8
    Bayi --- UC9

    %% Admin
    Admin --- UC10
    Admin --- UC11
    Admin --- UC12
    Admin --- UC1

    classDef actor fill:#1f6feb,stroke:#1a5fd0,color:#fff;
    class Ziyaretci,Bayi,Admin actor;
```

## Aktör Yetkileri

| Use-Case | Ziyaretçi | Bayi | Yönetici |
|----------|:---------:|:----:|:--------:|
| Katalogu görüntüle / ara | ✅ | ✅ | ✅ |
| Kayıt / Giriş | ✅ | – | – |
| Sepete ekle, sipariş oluştur | – | ✅ | – |
| VIP fiyat | – | ✅ (VIP) | – |
| Kendi siparişlerini görüntüle/iptal | – | ✅ | – |
| Ürün/Kategori CRUD | – | – | ✅ |
| Tüm siparişler + durum güncelleme | – | – | ✅ |
