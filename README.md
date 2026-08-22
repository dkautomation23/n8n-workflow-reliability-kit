# n8n Workflow Reliability Kit

Я собрал этот kit для n8n-разработчиков и небольших automation-агентств, у которых workflow уже живут в production. Это не библиотека шаблонов: здесь три практичных production-паттерна, которые помогают быстрее увидеть падение, не пропустить «молчащий» workflow и проверить канал алертов до инцидента.

## Что внутри

| Workflow | Решает проблему | Когда нужен |
| --- | --- | --- |
| `01-error-intake.json` | Нормализует контекст падения и отправляет его в alert endpoint | Любой workflow с риском внешней зависимости, API или credential failure |
| `02-heartbeat-monitor.json` | Ищет workflow, которые не дали успешного запуска в заданный интервал | Schedule/webhook-процессы, где опасна «тихая» остановка |
| `03-reliability-smoke-test.json` | Создаёт контролируемое падение | При настройке и после изменений alert-маршрута |

Все три workflow импортируются отдельно. В export нет credentials, приватных endpoint, email или chat ID.

## Быстрый старт

1. Импортируй все JSON из папки `workflows/` в n8n.
2. В n8n создай variables из таблицы ниже. Секретные значения создаёшь и вводишь только ты.
3. Открой `Reliability Kit — Error Intake`, сохрани и выбери его как **Error Workflow** в настройках рабочих workflow, которые должны присылать ошибки.
4. Настрой `Reliability Kit — Heartbeat Monitor`: перечисли id критичных workflow, сохрани и активируй его.
5. Запусти `Reliability Kit — Smoke Test` вручную. В endpoint должен прийти один alert с контролируемой ошибкой.

Если smoke test не дал alert, не активируй heartbeat: сначала разберись с маршрутом доставки по [troubleshooting guide](docs/troubleshooting.md).

## Конфигурация

| Переменная n8n | Пример формата | Для чего нужна |
| --- | --- | --- |
| `RELIABILITY_ALERT_WEBHOOK_URL` | `https://<your-alert-endpoint>` | Принимает POST с JSON-алертом. Это может быть внутренний relay или gateway выбранного канала. |
| `RELIABILITY_N8N_BASE_URL` | `https://<your-n8n-host>` | Базовый адрес той же n8n-инстанции для Heartbeat Monitor. |
| `RELIABILITY_N8N_API_KEY` | `<create-in-n8n-settings>` | Ключ n8n Public API с минимально необходимым доступом для чтения execution. |
| `RELIABILITY_STALE_AFTER_MINUTES` | `60` | Через сколько минут после последнего успешного запуска workflow считается «молчащим». |
| `RELIABILITY_MONITORED_WORKFLOW_IDS` | `12,34,56` | Список id критичных workflow через запятую. |

Не записывай значения из этой таблицы в JSON-export, README, issue или commit. Variables отделяют конфигурацию инстанса от переносимых workflow.

## Контракт alert payload

Error Intake отправляет единый JSON с полями:

```json
{
  "event": "n8n.execution.failed",
  "severity": "error",
  "detectedAt": "ISO-8601 timestamp",
  "workflow": { "id": "workflow id", "name": "workflow name" },
  "execution": { "id": "execution id", "url": "execution link", "lastNodeExecuted": "node name" },
  "error": { "message": "error message", "stack": "stack or null" },
  "runbook": "first diagnostic action"
}
```

Heartbeat отправляет один агрегированный payload только если нашёл хотя бы один stale workflow. При отсутствии проблем он не генерирует шум.

Полная схема и границы ответственности — в [architecture](docs/architecture.md).

## Production checklist

Перед активацией пройди [deployment checklist](docs/deployment-checklist.md). Минимальный критерий готовности:

- [ ] Smoke test даёт ровно один понятный alert.
- [ ] В alert видны workflow, execution и последний выполненный node.
- [ ] Для каждой критичной автоматизации есть owner и ожидаемая частота запусков.
- [ ] Порог stale настроен выше нормального интервала workflow минимум в 2 раза.
- [ ] В alert payload нет пользовательских данных, headers и credential values.

## Что намеренно не включено

Я не добавлял адаптеры под Slack, Telegram или PagerDuty. Generic webhook не привязывает kit к одному вендору: подменяешь один transport-слой и сохраняешь одинаковый диагностический контракт для команды и клиентов.

Также kit не заменяет мониторинг инфраструктуры, бэкапы n8n и процесс incident response. Он закрывает прикладной уровень надёжности workflow.

## Нужен аудит production-автоматизаций?

Если у тебя уже есть n8n в production и нужны диагностика слабых мест, нормальная обработка падений или наблюдаемость без лишнего стека — открой issue с обезличенным описанием контура. Я посмотрю на архитектуру и предложу следующий технический шаг.

## License

MIT. Используй, адаптируй, улучшай — но перед импортом всегда проверяй конфигурацию в своей инстанции.
