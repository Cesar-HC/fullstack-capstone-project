require('dotenv').config();
const express = require('express');
const natural = require("natural");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.post('/sentiment', (req, res) => {
    try {
        const { sentence } = req.query;

        if (!sentence) {
            return res.status(400).json({ error: "Sentence parameter is missing" });
        }

        const Analyzer = natural.SentimentAnalyzer;
        const stemmer = natural.PorterStemmer;
        const analyzer = new Analyzer("English", stemmer, "afinn");

        const analysisResult = analyzer.getSentiment(sentence.split(' '));

        let sentiment = "neutral";
        if (analysisResult < 0) {
            sentiment = "negative";
        } else if (analysisResult > 0.33) {
            sentiment = "positive";
        }

        res.status(200).json({ sentimentScore: analysisResult, sentiment: sentiment });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Error performing sentiment analysis" });
    }
});

app.listen(port, () => {
    console.log(`Sentiment Analysis Server running on port ${port}`);
});