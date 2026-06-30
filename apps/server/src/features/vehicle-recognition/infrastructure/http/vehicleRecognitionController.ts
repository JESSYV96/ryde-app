import { Router } from 'express';

import type { AnalyzeVehiclePhotos } from '../../application/usecases/AnalyzeVehiclePhotos';
import type { VehicleImage } from '../../application/ports/VehicleImageAnalyzer';

interface AnalyzeVehicleBody {
  images?: VehicleImage[];
}

// Inbound HTTP adapter for vehicle photo recognition. Accepts base64 photos from
// the mobile app, delegates to the use case, and returns a pre-fill draft. The
// photos are not persisted server-side — they only live in the mobile app.
export const createVehicleRecognitionRouter = (
  analyzeVehiclePhotos: AnalyzeVehiclePhotos
): Router => {
  const router = Router();

  router.post('/vehicle-recognition', async (req, res) => {
    try {
      const body = req.body as AnalyzeVehicleBody;
      const images = body.images ?? [];
      if (images.length === 0) {
        res.status(400).json({ error: 'At least one photo is required' });
        return;
      }

      const draft = await analyzeVehiclePhotos.execute(images);
      res.json(draft);
    } catch (error) {
      res.status(502).json({ error: (error as Error).message });
    }
  });

  return router;
};
