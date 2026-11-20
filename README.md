# AFTERLIFE

Стартовый проект AFTERLIFE на React + TypeScript + Vite.

## Что включено
- адаптивная тёмная оболочка приложения;
- навигация по основным разделам продукта;
- базовая дизайн-система;
- переключение языков (ru/en/fr/es/de/pt/zh/ja/ko/ar);
- заготовка безопасного подключения Supabase через publishable key;
- модульная структура для дальнейшей разработки.

## Запуск
Требуется Node.js 20.19+ или 22.12+.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Проверки:
```bash
npm run typecheck
npm run build
```

## Supabase Auth

Раздел «Личность» использует passwordless-вход по одноразовой ссылке на email через Supabase Auth. Для локальной разработки скопируйте `.env.example` в `.env.local`. В Supabase Dashboard откройте Authentication → URL Configuration и добавьте `http://localhost:5173` в Redirect URLs. Для опубликованного приложения добавьте его точный HTTPS-домен. Никогда не помещайте secret/service_role key в клиентское приложение.

## Важно
Это начальный frontend foundation, а не готовая социальная сеть. Реальные Auth, таблицы,
RLS-политики, чаты, лента, миссии, инвентарь, админские операции и серверная игровая
экономика ещё не реализованы. Интерфейсные заглушки не выдают себя за работающий backend.

Не подключайте неизвестный Supabase-проект. Создайте отдельный проект AFTERLIFE.
Никогда не помещайте service_role/secret key в клиентские переменные `VITE_*`.
