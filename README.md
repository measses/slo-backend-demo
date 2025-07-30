# SLO Backend Test Project

Bu proje, SLO (Service Level Objectives) takibi için basit bir HTTP servisi sağlar.

## Özellikler

- Express.js tabanlı HTTP servisi
- Prometheus ile uyumlu metrikler
- Bilinçli gecikme oluşturan endpoint
- SLO takibi için gözlenebilirlik

## Endpoints

| Route | Açıklama |
|-------|----------|
| `/` | Hızlı dönen endpoint (200 OK, ~10ms) |
| `/slow` | Bilinçli olarak gecikmeli (~1–2 saniye delay) |
| `/metrics` | Prometheus'un scrape ettiği endpoint (prom-client) |

## Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Servisi başlat
npm start
```

## Metrikler

Servis aşağıdaki metrikleri sağlar:

- `http_request_duration_seconds`: HTTP isteklerinin süresini ölçer (saniye cinsinden)
- `http_requests_total`: Toplam HTTP istek sayısını sayar
- Ayrıca Node.js default metrikleri

Bu metrikler Prometheus tarafından `/metrics` endpoint'inden toplanabilir.
