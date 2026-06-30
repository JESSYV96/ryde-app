import type { Router } from 'express';

import type { Env } from '../../shared/config/env';
import { AnalyzeVehiclePhotos } from './application/usecases/AnalyzeVehiclePhotos';
import { ClaudeVehicleImageAnalyzer } from './infrastructure/anthropic/ClaudeVehicleImageAnalyzer';
import { createVehicleRecognitionRouter } from './infrastructure/http/vehicleRecognitionController';

export interface VehicleRecognitionApi {
  routers: { vehicleRecognition: Router };
}

// API-side composition for the vehicle-recognition slice: wires the Claude
// vision adapter into the use case and the HTTP router.
export const buildVehicleRecognitionApi = (env: Env): VehicleRecognitionApi => {
  const analyzer = new ClaudeVehicleImageAnalyzer(env.anthropicApiKey);
  const analyzeVehiclePhotos = new AnalyzeVehiclePhotos(analyzer);

  return {
    routers: {
      vehicleRecognition: createVehicleRecognitionRouter(analyzeVehiclePhotos),
    },
  };
};
