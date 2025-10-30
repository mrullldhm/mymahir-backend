const express = require('express');
const router = express.Router();

router.get('/', (req, res) => res.send('All blog posts'));
router.get('/:id', (req, res) => res.send(`Currently viewing blog post id: ${req.params.id}`));
module.exports = router;