import { AiAuditLog } from '../models/AiAuditLog.js';
import { hashPayload } from '../utils/textUtils.js';

export function auditLogger(req, res, next) {
  // Only audit AI generation and recommendation endpoints
  if (!req.path.startsWith('/api/ai') && !req.path.startsWith('/ai')) {
    return next();
  }

  const startTime = Date.now();
  const originalJson = res.json.bind(res);
  let responseData = null;

  res.json = function (body) {
    responseData = body;
    return originalJson(body);
  };

  res.on('finish', async () => {
    try {
      const latencyMs = Date.now() - startTime;
      const requestPayloadHash = hashPayload(req.body || {});
      const fallbackTriggered = responseData?.data?.fallbackTriggered || false;
      const tokensUsed = responseData?.data?.tokensUsed || { prompt: 0, completion: 0, total: 0 };

      await AiAuditLog.create({
        endpoint: req.originalUrl || req.path,
        userId: req.body?.userId || req.headers['x-user-id'] || 'user_anonymous',
        requestPayloadHash,
        tokensUsed,
        latencyMs,
        fallbackTriggered,
        statusCode: res.statusCode,
        error: responseData?.success === false ? (responseData?.error?.code || 'ERROR') : null,
        metadata: {
          mode: req.body?.mode || null,
          categoryFilter: req.body?.categoryFilter || null
        }
      });
    } catch (logErr) {
      console.error('[AuditLogger] Failed to write AI audit log to database:', logErr.message);
    }
  });

  next();
}
