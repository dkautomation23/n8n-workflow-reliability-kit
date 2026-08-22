# Production deployment checklist

## До импорта

- [ ] Экспорт проверен в отдельной test/staging-инстанции.
- [ ] Выбраны только критичные workflow для `RELIABILITY_MONITORED_WORKFLOW_IDS`.
- [ ] Для каждого workflow зафиксирована ожидаемая частота успешных запусков.
- [ ] Создан отдельный alert endpoint, который не публикует execution payload в публичный канал.

## Настройка переменных

- [ ] `RELIABILITY_ALERT_WEBHOOK_URL` указывает на endpoint команды.
- [ ] `RELIABILITY_N8N_BASE_URL` соответствует текущей инстанции и не содержит пути к конкретному workflow.
- [ ] `RELIABILITY_N8N_API_KEY` создан отдельно и хранится только в n8n.
- [ ] `RELIABILITY_STALE_AFTER_MINUTES` больше нормального интервала workflow минимум в 2 раза.
- [ ] `RELIABILITY_MONITORED_WORKFLOW_IDS` содержит только числовые id через запятую.

## Приёмка

- [ ] `Error Intake` сохранён и выбран error workflow для каждого критичного процесса.
- [ ] `Smoke Test` запущен вручную и выдал один alert с execution context.
- [ ] Получатель может открыть execution и назвать последний выполненный node без дополнительного поиска.
- [ ] При нормальном запуске Heartbeat не создаёт alert.
- [ ] После искусственно устаревшего id Heartbeat создаёт один агрегированный alert.

## После активации

- [ ] Назначен owner для реакции на alert.
- [ ] Определено окно, в котором alert считается ожидаемым или игнорируется.
- [ ] Проверка smoke test добавлена в процедуру изменения alert-маршрута.
- [ ] Раз в квартал пересматривается список monitored workflow и пороги stale.
