const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const AiService = require('../services/aiService');

router.post('/create', (req, res) => {
    const { brand_id, name, budget, risk_mode } = req.body;
    const campaign = {
        id: uuidv4(),
        brand_id,
        name,
        budget,
        risk_mode,
        status: 'active'
    };
    res.json({ success: true, campaign });
});

router.post('/autopilot/run', async (req, res) => {
    const { campaign_id, action, current_state } = req.body;

    // REAL AI CALL
    // We construct a mock state if not provided
    const state = current_state || { budget: 5000, goal: 'Conversion', risk: 'Balanced' };

    const optimizations = await AiService.optimizeCampaign(state);

    res.json({
        success: true,
        message: `Autopilot executed action: ${action}`,
        optimizations: optimizations
    });
});

module.exports = router;
