const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// Mock Data Store
const brands = {};
const twins = {};

router.post('/create', (req, res) => {
    const { name, website, industry } = req.body;
    const id = uuidv4();
    brands[id] = { id, name, website, industry };
    res.json({ success: true, brand: brands[id] });
});

router.get('/:id/twin', (req, res) => {
    const { id } = req.params;
    const twin = twins[id] || {
        tone: 'neutral',
        forbidden_terms: [],
        compliance_rules: {}
    };
    res.json(twin);
});

router.post('/:id/twin', (req, res) => {
    const { id } = req.params;
    const { tone, forbidden_terms, compliance_rules } = req.body;
    twins[id] = { tone, forbidden_terms, compliance_rules };
    res.json({ success: true, twin: twins[id] });
});

module.exports = router;
