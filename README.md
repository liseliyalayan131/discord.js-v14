# DJSV14-ALTYAPI

Bu proje, Discord.js v14 ve MongoDB kullanılarak yapılmış boş bir Discord bot altyapısıdır. İçerisinde sadece emoji, ban, kick gibi temel komutlar bulunmaktadır.

## Kurulum

Projenin yerel olarak nasıl kurulacağını burada anlatabilirsiniz.

1. İlk olarak, projeyi klonlayın:

```bash
git clone https://github.com/emreconf/djs-altyapi.git
```

2. Daha sonra, gerekli paketleri yükleyin:

```bash
npm install
```

3. `example.env` dosyasını `.env` adıyla değiştirin. Ardından dosyayı düzenleyerek MongoDB URI ve bot token gibi gizli bilgilerinizi ekleyin:

```plaintext
BOT_TOKEN=your_bot_token_here
MONGO_URI=your_mongodb_uri_here
```

---

## Kullanım

Projenin nasıl kullanılacağını ve nasıl katkıda bulunabileceğinizi burada açıklayabilirsiniz.

```bash
npm start
```

Botunuz artık çalışır durumda olmalıdır. Discord sunucunuzda botunuzun komutlarını kullanabilirsiniz.

---

## Katkıda Bulunma

1. Bu projeyi forklayın (https://github.com/emreconf/djs-altyapi/fork)
2. Yeni bir dal oluşturun (git checkout -b ozellik/düzeltme)
3. Değişikliklerinizi uygulayın (git add .)
4. Değişikliklerinizi commit edin (git commit -m 'Yaptığınız değişikliklerin açıklaması')
5. Dalınıza push yapın (git push origin ozellik/düzeltme)
6. Bir pull isteği oluşturun

---

## Destek

Herhangi bir sorunuz veya geri bildiriminiz varsa, [Discord sunucumuza](https://discord.gg/harmoni) katılabilir veya [Instagram](https://instagram.com/emreconf) üzerinden bize ulaşabilirsiniz.


## Lisans

Bu proje [MIT License] ile lisanslanmıştır. Detaylar için `LICENSE` dosyasına bakınız.
