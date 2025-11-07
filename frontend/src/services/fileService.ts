export const fileService = {
  async upload(file: File): Promise<{ url: string; name: string; size: number; type: string }> {
    // Mock file upload - in real app, would upload to cloud storage
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    return {
      url: `mock-url-${Date.now()}-${file.name}`,
      name: file.name,
      size: file.size,
      type: file.type,
    };
  },

  validateFile(file: File, options: { maxSize?: number; allowedTypes?: string[] } = {}): string | null {
    const maxSize = options.maxSize || 10 * 1024 * 1024; // 10MB default
    const allowedTypes = options.allowedTypes || ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];

    if (file.size > maxSize) {
      return `File size must be less than ${maxSize / 1024 / 1024}MB`;
    }

    if (!allowedTypes.includes(file.type)) {
      return `File type must be one of: ${allowedTypes.join(', ')}`;
    }

    return null;
  },
};
