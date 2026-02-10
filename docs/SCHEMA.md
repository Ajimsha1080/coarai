# Database Schema

## Users
- `id`: UUID (PK)
- `email`: VARCHAR
- `password_hash`: VARCHAR
- `role`: ENUM('admin', 'advertiser', 'viewer')
- `created_at`: TIMESTAMP

## Brands
- `id`: UUID (PK)
- `user_id`: UUID (FK)
- `name`: VARCHAR
- `website`: VARCHAR
- `industry`: VARCHAR
- `created_at`: TIMESTAMP

## BrandTwinProfiles
- `id`: UUID (PK)
- `brand_id`: UUID (FK)
- `tone_voice`: JSONB
- `forbidden_terms`: TEXT[]
- `compliance_rules`: JSONB
- `knowledge_base_ref`: UUID (Vector DB Collection ID)
- `updated_at`: TIMESTAMP

## Campaigns
- `id`: UUID (PK)
- `brand_id`: UUID (FK)
- `name`: VARCHAR
- `budget_monthly`: DECIMAL
- `risk_mode`: ENUM('safe', 'balanced', 'aggressive')
- `status`: ENUM('active', 'paused', 'completed')
- `created_at`: TIMESTAMP

## PromptTargets
- `id`: UUID (PK)
- `campaign_id`: UUID (FK)
- `keyword`: VARCHAR
- `target_intent`: ENUM('learn', 'compare', 'decide', 'buy')
- `bid_amount`: DECIMAL

## AIModelResponses
- `id`: UUID (PK)
- `prompt_log_id`: UUID
- `model_name`: VARCHAR (e.g., 'gpt-4', 'gemini-1.5')
- `response_text`: TEXT
- `brand_mentioned`: BOOLEAN
- `rank_position`: INTEGER
- `sentiment_score`: DECIMAL
- `created_at`: TIMESTAMP

## InfluenceScores
- `id`: UUID (PK)
- `brand_id`: UUID (FK)
- `score`: DECIMAL (0-100)
- `model_breakdown`: JSONB
- `date`: DATE

## Budgets
- `id`: UUID (PK)
- `campaign_id`: UUID (FK)
- `total_spend`: DECIMAL
- `remaining_budget`: DECIMAL
- `currency`: VARCHAR

## Conversions
- `id`: UUID (PK)
- `campaign_id`: UUID (FK)
- `user_session_id`: VARCHAR
- `event_type`: ENUM('click', 'view', 'purchase')
- `value`: DECIMAL
- `timestamp`: TIMESTAMP
