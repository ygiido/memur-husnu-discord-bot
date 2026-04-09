# 🤖 Discord Moderasyon ve Araç Botu

Bu proje, güncel **Discord.js v14** kütüphanesi kullanılarak geliştirilmiş, modüler yapıya (Command Handler) sahip temel bir Discord botudur. Slash (`/`) komutlarıyla çalışır ve sunucu yönetimini kolaylaştırmayı amaçlar.

## 🚀 Özellikler

* **Modern Altyapı:** Discord.js v14 ve Slash (/) komut desteği.
* **Modüler Tasarım:** Her komut `commands` klasörü altında ayrı dosyalarda barındırılır.
* **Güvenlik:** Yetki gerektiren komutlar (`ban`, `duyur`) sadece ilgili yetkiye sahip yöneticiler tarafından görülebilir ve kullanılabilir.

## 🛠️ Komutlar

* `/yaz [mesaj]` - Bota istediğiniz bir mesajı, botun kendi ağzından kanala yazdırır.
* `/duyur [kanal] [mesaj]` - Belirtilen kanala `@everyone` etiketi atarak profesyonel bir duyuru mesajı gönderir. (Sadece Yöneticiler).
* `/rolekle [kullanıcı] [rol]` - Sunucudaki bir üyeye hızlıca rol atamanızı sağlar.
* `/ban [kullanıcı] [sebep]` - Kuralları ihlal eden bir üyeyi belirtilen sebeple sunucudan uzaklaştırır.

## 💻 Teknolojiler

* [Node.js](https://nodejs.org/)
* [Discord.js (v14)](https://discord.js.org/)
