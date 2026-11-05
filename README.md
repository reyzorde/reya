# REYA

**REYA** — futuristik 3D smart speaker ichidagi pixel-anime AI yordamchi.

## Xususiyatlar

- React Three Fiber bilan 3D metall speaker
- Pixel-art anime yuz (20+ kayfiyat)
- Idle rejim: raqamli soat + sana
- Active rejim: tinglash / o‘ylash / gapirish animatsiyalari
- Brauzer SpeechRecognition + SpeechSynthesis (TTS)
- O‘zbek / Rus / Ingliz
- Kayfiyat yoritishi (RGB ring)
- Matn orqali suhbat (mikrofon bo‘lmasa ham)

## O‘rnatish

```bash
npm install
npm run dev
```

Brauzerda ochiladi (odatda `http://localhost:5173`).

## Muhit o‘zgaruvchilari

`.env.example` ga qarang. **API kalitlarni hech qachon frontendga yoki GitHub’ga qo‘ymang.**

Hozirgi demo:
- **TTS / STT** — brauzer API
- **AI** — `src/lib/chat.ts` ichida sozlanadi (demo rejimda lokal fallback javoblar bor)

Production uchun backend proxy qo‘shing va kalitni faqat serverda saqlang.

## Loyiha tuzilmasi

```
src/
  components/reya/
    Speaker.tsx      # 3D speaker + ekran
    pixel.ts         # pixel yuz chizish
    emotions.ts      # kayfiyat + yoritish
    store.ts         # Zustand holat
    useVoice.ts      # mikrofon + TTS
  lib/chat.ts        # AI so‘rov
  App.tsx
```

## Foydalanish

1. **Hey Reya** — mikrofonga ruxsat bering (Chrome tavsiya etiladi)
2. Yoki pastga matn yozing
3. Kayfiyat tugmalari bilan yuzni sinab ko‘ring

## Cheklovlar

- Brauzer fon rejimida ishonchli wake-word yo‘q — faol tinglash tugmasi orqali
- Uzbek TTS sifati brauzerga bog‘liq
- Google Cloud STT / Gemini keyinchalik backend orqali ulanadi

## Litsenziya

MIT
