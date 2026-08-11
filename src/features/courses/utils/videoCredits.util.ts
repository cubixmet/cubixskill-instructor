export interface VideoCreditCalculation {
  originalSizeMb: number;
  adaptiveStreaming: boolean;
  estimatedStreamingMb: number;
  totalStorageMb: number;
  baseStorageCredits: number;
  transcodingCredits: number;
  totalCreditsRequired: number;
}

export const calculateVideoCredits = (
  sizeMb: number,
  adaptiveStreaming: boolean
): VideoCreditCalculation => {
  if (sizeMb <= 0) {
    return {
      originalSizeMb: 0,
      adaptiveStreaming,
      estimatedStreamingMb: 0,
      totalStorageMb: 0,
      baseStorageCredits: 0,
      transcodingCredits: 0,
      totalCreditsRequired: 0,
    };
  }

  // Base storage credit: 1 credit per 100MB
  const baseStorageCredits = Math.max(1, Math.ceil(sizeMb / 100));

  if (!adaptiveStreaming) {
    return {
      originalSizeMb: sizeMb,
      adaptiveStreaming: false,
      estimatedStreamingMb: 0,
      totalStorageMb: sizeMb,
      baseStorageCredits,
      transcodingCredits: 0,
      totalCreditsRequired: baseStorageCredits,
    };
  }

  // Adaptive Streaming generates multi-quality renditions (~2.8x additional storage)
  const estimatedStreamingMb = Math.round(sizeMb * 2.8);
  const totalStorageMb = sizeMb + estimatedStreamingMb;
  const totalStorageCredits = Math.ceil(totalStorageMb / 100);
  const transcodingCredits = Math.max(2, Math.ceil(sizeMb / 250));
  const totalCreditsRequired = totalStorageCredits + transcodingCredits;

  return {
    originalSizeMb: sizeMb,
    adaptiveStreaming: true,
    estimatedStreamingMb,
    totalStorageMb,
    baseStorageCredits,
    transcodingCredits,
    totalCreditsRequired,
  };
};
