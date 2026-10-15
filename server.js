const express = require('express');
const multer = require('multer');
const ffmpegPath = require('ffmpeg-static');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const app = express();
const PORT = Number(process.env.PORT || 3000);
const upload = multer({ dest: os.tmpdir(), limits: { fileSize: 250 * 1024 * 1024 } });
app.disable('x-powered-by');
app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'Kiran Creations MP4 converter' }));
app.post('/api/convert', upload.single('video'), (req, res) => {
  if (!req.file) return res.status(400).send('ভিডিও ফাইল পাওয়া যায়নি।');
  if (!ffmpegPath || !fs.existsSync(ffmpegPath)) {
    fs.unlink(req.file.path, () => {});
    return res.status(500).send('FFmpeg পাওয়া যায়নি। npm install আবার চালান।');
  }
  const output = path.join(os.tmpdir(), `kiran-wedding-${Date.now()}-${Math.random().toString(16).slice(2)}.mp4`);
  const args = ['-y', '-i', req.file.path, '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '21', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-c:a', 'aac', '-b:a', '160k', '-ac', '2', output];
  const proc = spawn(ffmpegPath, args, { windowsHide: true });
  let err = '';
  proc.stderr.on('data', chunk => { err += chunk.toString(); if (err.length > 12000) err = err.slice(-12000); });
  proc.on('error', e => cleanup(500, 'FFmpeg চালানো যায়নি: ' + e.message));
  proc.on('close', code => {
    fs.unlink(req.file.path, () => {});
    if (code !== 0 || !fs.existsSync(output)) return cleanup(500, 'MP4 তৈরি হয়নি। আবার চেষ্টা করুন।');
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', 'attachment; filename="Kiran-Creations-Wedding-Invitation.mp4"');
    const stream = fs.createReadStream(output);
    stream.on('error', () => { if (!res.headersSent) res.status(500); res.end(); });
    stream.on('close', () => fs.unlink(output, () => {}));
    stream.pipe(res);
  });
  function cleanup(status, message) { fs.unlink(req.file.path, () => {}); fs.unlink(output, () => {}); if (!res.headersSent) res.status(status).send(message); }
});
app.use(express.static(__dirname));
app.listen(PORT, '127.0.0.1', () => {
  console.log(`\nKiran Creations Wedding Video Maker চালু হয়েছে: http://localhost:${PORT}`);
  console.log('এই উইন্ডোটি খোলা রাখুন। বন্ধ করলে সার্ভার বন্ধ হবে।\n');
});
