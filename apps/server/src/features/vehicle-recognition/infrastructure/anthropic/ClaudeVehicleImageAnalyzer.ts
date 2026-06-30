import Anthropic from '@anthropic-ai/sdk';

import type { VehicleImage, VehicleImageAnalyzer } from '../../application/ports/VehicleImageAnalyzer';
import {
  emptyRecognizedVehicleDraft,
  type RecognizedVehicleDraft,
} from '../../domain/RecognizedVehicleDraft';

const MODEL = 'claude-opus-4-8';
const TOOL_NAME = 'record_vehicle';

const PROMPT = [
  'You are helping a car-rental company add a vehicle to its fleet from photos.',
  'Identify the vehicle in the image(s) and record its attributes with the record_vehicle tool.',
  'Only fill a field when you can read it confidently from the photos; otherwise set it to null.',
  'For year, return a 4-digit number or null. For licensePlate, transcribe the plate text exactly, or null if unreadable.',
].join(' ');

// A forced tool call is the most reliable way to get image-to-structured-data
// extraction on the GA Messages API: the model must return a `record_vehicle`
// tool call whose `input` already matches this schema, so no free-text parsing.
const RECORD_VEHICLE_TOOL: Anthropic.Tool = {
  name: TOOL_NAME,
  description: 'Record the recognized attributes of the vehicle shown in the photos.',
  input_schema: {
    type: 'object',
    properties: {
      make: { type: ['string', 'null'], description: 'Manufacturer, e.g. Toyota' },
      model: { type: ['string', 'null'], description: 'Model, e.g. Corolla' },
      year: { type: ['integer', 'null'], description: 'Model year (4 digits)' },
      color: { type: ['string', 'null'], description: 'Exterior color' },
      licensePlate: { type: ['string', 'null'], description: 'License plate text' },
    },
    required: ['make', 'model', 'year', 'color', 'licensePlate'],
  },
};

const SUPPORTED_MEDIA_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const;
type SupportedMediaType = (typeof SUPPORTED_MEDIA_TYPES)[number];

const toSupportedMediaType = (mediaType: string): SupportedMediaType =>
  (SUPPORTED_MEDIA_TYPES as readonly string[]).includes(mediaType)
    ? (mediaType as SupportedMediaType)
    : 'image/jpeg';

// Claude vision adapter implementing the VehicleImageAnalyzer port. Owns the
// Anthropic SDK call, prompt and extraction tool; the API key never leaves this
// server.
export class ClaudeVehicleImageAnalyzer implements VehicleImageAnalyzer {
  private readonly client: Anthropic;

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async analyze(images: VehicleImage[]): Promise<RecognizedVehicleDraft> {
    const imageBlocks = images.map(
      (image): Anthropic.ImageBlockParam => ({
        type: 'image',
        source: {
          type: 'base64',
          media_type: toSupportedMediaType(image.mediaType),
          data: image.base64,
        },
      })
    );

    const response = await this.client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      tools: [RECORD_VEHICLE_TOOL],
      tool_choice: { type: 'tool', name: TOOL_NAME },
      messages: [
        {
          role: 'user',
          content: [...imageBlocks, { type: 'text', text: PROMPT }],
        },
      ],
    });

    return this.parseDraft(response);
  }

  private parseDraft(response: Anthropic.Message): RecognizedVehicleDraft {
    const toolUse = response.content.find(
      (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use' && block.name === TOOL_NAME
    );
    if (!toolUse) {
      return emptyRecognizedVehicleDraft();
    }

    const input = toolUse.input as Partial<RecognizedVehicleDraft>;
    return {
      make: input.make ?? null,
      model: input.model ?? null,
      year: typeof input.year === 'number' ? input.year : null,
      color: input.color ?? null,
      licensePlate: input.licensePlate ?? null,
    };
  }
}
