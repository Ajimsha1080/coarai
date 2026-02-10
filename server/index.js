const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
const brandRoutes = require('./routes/brand');
const campaignRoutes = require('./routes/campaign');
const intelligenceRoutes = require('./routes/intelligence');

app.use('/api/brand', brandRoutes);
app.use('/api/campaign', campaignRoutes);
app.use('/api/intelligence', intelligenceRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
