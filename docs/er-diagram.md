# Veritabanı ER Diyagramı (Entity-Relationship)

Numan Gıda veritabanı MongoDB üzerinde Mongoose şemaları ile modellenmiştir.
Aşağıdaki ER diyagramı modelleri ve aralarındaki ilişkileri gösterir.

```mermaid
erDiagram
    USER ||--o{ ORDER : "verir (customer)"
    CATEGORY ||--o{ PRODUCT : "içerir (category)"
    PRODUCT ||--o{ ORDER_ITEM : "yer alır"
    ORDER ||--|{ ORDER_ITEM : "kalemlerden oluşur"

    USER {
        ObjectId _id PK
        string name
        string email UK "benzersiz"
        string password "bcrypt hash"
        string shopName
        string phone
        string role "admin | customer"
        string tier "standard | vip"
        date createdAt
        date updatedAt
    }

    CATEGORY {
        ObjectId _id PK
        string name UK "benzersiz"
        string description
        date createdAt
    }

    PRODUCT {
        ObjectId _id PK
        string name
        string description
        ObjectId category FK "-> CATEGORY"
        number price "standart fiyat"
        number vipPrice "VIP bayi fiyatı (ops.)"
        string unit "koli/paket/adet"
        number moq "minimum sipariş miktarı"
        number stock
        string imageUrl
        boolean isActive
    }

    ORDER {
        ObjectId _id PK
        ObjectId customer FK "-> USER"
        number totalAmount
        string deliveryDay "teslimat günü"
        string invoiceNumber UK "otomatik fatura no"
        string note
        string status "beklemede..teslim edildi"
        date createdAt
    }

    ORDER_ITEM {
        ObjectId product FK "-> PRODUCT"
        string name "anlık ürün adı"
        string unit
        number quantity
        number priceAtOrder "sipariş anı fiyatı"
    }
```

## İlişkiler (ref / populate)

| İlişki | Açıklama | Mongoose |
|--------|----------|----------|
| `Product.category` → `Category` | Her ürün bir kategoriye aittir | `ref: 'Category'` + `populate` |
| `Order.customer` → `User` | Her sipariş bir bayiye aittir | `ref: 'User'` + `populate` |
| `Order.items[].product` → `Product` | Sipariş kalemleri ürünlere bağlıdır | `ref: 'Product'` |

> **Not:** `ORDER_ITEM`, `Order` dokümanı içine gömülü (embedded) bir alt-şemadır.
> Sipariş anındaki fiyat (`priceAtOrder`) saklanır; böylece ürün fiyatı sonradan
> değişse bile geçmiş faturalar değişmez.
