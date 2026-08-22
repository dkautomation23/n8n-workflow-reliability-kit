# Troubleshooting

| Симптом | Вероятная причина | Что проверить первым |
| --- | --- | --- |
| Smoke test завершился ошибкой, alert не пришёл | `Error Intake` не выбран как error workflow или нет endpoint | Открой настройки Smoke Test и Error Intake; проверь наличие `RELIABILITY_ALERT_WEBHOOK_URL`. |
| При падении нет `workflow` или `execution` в alert | Ошибка была создана вручную без стандартного контекста | Открой execution Error Intake и сравни исходный item с контрактом в README. |
| Heartbeat падает до API-запроса | Не заполнена одна из `RELIABILITY_` variables | Прочитай сообщение узла `Validate Reliability Variables`; он перечисляет отсутствующие значения. |
| Heartbeat всегда создаёт alert | Порог слишком мал, id workflow неверный или workflow не даёт successful execution | Сравни id и последний successful execution, затем увеличь `RELIABILITY_STALE_AFTER_MINUTES`. |
| Heartbeat не создаёт alert для нужного workflow | Workflow не добавлен в monitored list или API вернул неполную историю | Проверь `RELIABILITY_MONITORED_WORKFLOW_IDS` и увеличь limit/разбей monitoring на группы. |
| Alert пришёл дважды | Один workflow отправляет сообщение сам и одновременно использует Error Intake | Оставь один источник production-алерта для одного типа события. |

## Правило диагностики

Не начинай с повторного запуска. Сначала зафиксируй три факта: что было входом, на каком node оборвалось выполнение и доступна ли внешняя зависимость. Retry без причины часто создаёт дубликаты, повторные списания или повреждённые данные.
