# Endpoints à Vérifier et Supprimer si Inexistants

## ⚠️ CRITÈRES DE VÉRIFICATION
Un endpoint existe SEULEMENT si on peut trouver sa documentation sur https://docs.dataforseo.com/v3/

---

## 🔍 SERP API - Nouveaux Endpoints

### Google AI Mode (2 endpoints) - **À VÉRIFIER**
- ❓ `/v3/serp/google/ai_mode/languages` 
- ❓ `/v3/serp/google/ai_mode/live/advanced`
- **Fichiers**: `serp-google-ai-mode-*.tool.ts`
- **Docs**: https://docs.dataforseo.com/v3/serp/google/ai_mode/

### Google News (1 endpoint) - **À VÉRIFIER**
- ❓ `/v3/serp/google/news/live/advanced`
- **Fichier**: `serp-google-news-live-advanced.tool.ts`
- **Docs**: https://docs.dataforseo.com/v3/serp/google/news/

### Google Maps (1 endpoint) - **À VÉRIFIER**
- ❓ `/v3/serp/google/maps/live/advanced`
- **Fichier**: `serp-google-maps-live-advanced.tool.ts`
- **Docs**: https://docs.dataforseo.com/v3/serp/google/maps/

### Google Images (1 endpoint) - **À VÉRIFIER**
- ❓ `/v3/serp/google/images/live/advanced`
- **Fichier**: `serp-google-images-live-advanced.tool.ts`
- **Docs**: https://docs.dataforseo.com/v3/serp/google/images/

### YouTube Languages (1 endpoint) - **À VÉRIFIER**
- ❓ `/v3/serp/youtube/languages`
- **Fichier**: `serp-youtube-languages-list.tool.ts`
- **Docs**: https://docs.dataforseo.com/v3/serp/youtube/

---

## 🔍 Keywords Data API - Nouveaux Endpoints

### Google Ads (3 endpoints) - **À VÉRIFIER**
- ❓ `/v3/keywords_data/google_ads/keywords_for_site/live`
- ❓ `/v3/keywords_data/google_ads/keywords_for_keywords/live`
- ❓ `/v3/keywords_data/google_ads/ad_traffic_by_keywords/live`
- **Fichiers**: `google-ads-*.tool.ts`
- **Docs**: https://docs.dataforseo.com/v3/keywords_data/google_ads/

### Google Trends (1 endpoint) - **À VÉRIFIER**
- ❓ `/v3/keywords_data/google_trends/locations`
- **Fichier**: `google-trends-locations.tool.ts`
- **Docs**: https://docs.dataforseo.com/v3/keywords_data/google_trends/

---

## 🔍 OnPage API - Nouveaux Endpoints (12 endpoints)

### Task Management - **À VÉRIFIER**
- ❓ `/v3/on_page/task_post`
- ❓ `/v3/on_page/tasks_ready`
- **Fichiers**: `onpage-task-*.tool.ts`
- **Docs**: https://docs.dataforseo.com/v3/on_page/

### Analysis Endpoints - **À VÉRIFIER**
- ❓ `/v3/on_page/summary/:id`
- ❓ `/v3/on_page/pages/:id`
- ❓ `/v3/on_page/resources/:id`
- ❓ `/v3/on_page/links/:id`
- ❓ `/v3/on_page/redirect_chains/:id`
- ❓ `/v3/on_page/non_indexable/:id`
- ❓ `/v3/on_page/duplicate_tags/:id`
- ❓ `/v3/on_page/duplicate_content/:id`
- ❓ `/v3/on_page/keyword_density/:id`
- ❓ `/v3/on_page/microdata/:id`
- **Fichiers**: `onpage-*.tool.ts`
- **Docs**: https://docs.dataforseo.com/v3/on_page/

---

## 🔍 AI Optimization API - Nouveaux Endpoints

### LLM Mentions (7 endpoints) - **DÉJÀ CORRIGÉ PARTIELLEMENT**
- ❓ `/v3/ai_optimization/llm_mentions/locations_and_languages`
- ❓ `/v3/ai_optimization/llm_mentions/filters`
- ✅ `/v3/ai_optimization/llm_mentions/search/live` (corrigé)
- ❓ `/v3/ai_optimization/llm_mentions/top_pages/live`
- ❓ `/v3/ai_optimization/llm_mentions/top_domains/live`
- ❓ `/v3/ai_optimization/llm_mentions/aggregated_metrics/live`
- ❓ `/v3/ai_optimization/llm_mentions/cross_aggregated_metrics/live`
- **Fichiers**: `llm-mentions-*.ts`
- **Docs**: https://docs.dataforseo.com/v3/ai_optimization/llm_mentions/

### ChatGPT (2 endpoints restants) - **À VÉRIFIER**
- ❓ `/v3/ai_optimization/chat_gpt/llm_responses/models`
- ✅ `/v3/ai_optimization/chat_gpt/llm_responses/live` (corrigé)
- **Fichiers**: `chatgpt-llm-responses-*.ts`
- **Docs**: https://docs.dataforseo.com/v3/ai_optimization/chat_gpt/

---

## 📋 ACTION REQUISE

1. **Vérifier chaque endpoint** sur docs.dataforseo.com
2. **Si l'endpoint N'EXISTE PAS** → Supprimer le fichier
3. **Si l'endpoint EXISTE mais paramètres incorrects** → Corriger le schéma
4. **Mettre à jour** les modules correspondants

---

## ✅ Endpoints CONFIRMÉS (déjà existants avant)

- ✅ SERP: Google Organic, YouTube Organic/Video Info/Comments/Subtitles
- ✅ Keywords Data: Google Ads Search Volume, Google Trends Explore/Categories
- ✅ OnPage: Content Parsing, Instant Pages, Lighthouse (Live endpoints)
- ✅ DataForSEO Labs: Google (tous les outils existants)
- ✅ Backlinks API: (tous les outils existants)

