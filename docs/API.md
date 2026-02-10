# API Specifications

## Authentication
`Authorization: Bearer <token>`

## Brands

### Create Brand
`POST /brand/create`
**Body**:
```json
{
  "name": "Acme Corp",
  "website": "https://acme.com",
  "industry": "Software"
}
```

### Get Brand Twin
`GET /brand/:id/twin`

### Update Brand Twin
`POST /brand/:id/twin`
**Body**:
```json
{
  "tone": "professional",
  "forbidden_terms": ["cheap", "free"],
  "compliance_rules": {...}
}
```

## Campaigns

### Create Campaign
`POST /campaign/create`
**Body**:
```json
{
  "brand_id": "uuid",
  "name": "Winter Sale",
  "budget": 5000,
  "risk_mode": "balanced",
  "target_audience": "Developers"
}
```

### Run Autopilot
`POST /autopilot/run`
**Body**:
```json
{
  "campaign_id": "uuid",
  "action": "optimize"
}
```

## Intelligence

### Classify Intent
`POST /intent/classify`
**Body**:
```json
{
  "query": "Best CRM software for small business"
}
```
**Response**:
```json
{
  "intent": "compare",
  "buying_stage": "consideration",
  "confidence": 0.95
}
```

### Influence Score
`GET /influence/score?brand_id=uuid`

### Live Answer Inject
`POST /answer/inject`
**Body**:
```json
{
  "user_prompt": "What are the top CRM tools?",
  "context": "..."
}
```
**Response**:
```json
{
  "injected_content": "Acme CRM is a top contender...",
  "position": "middle"
}
```
