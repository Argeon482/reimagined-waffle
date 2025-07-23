const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  async generateTitle(content, fileType, language = 'auto') {
    try {
      let prompt;
      
      if (fileType === 'text') {
        prompt = this.createTextPrompt(content, language);
      } else if (fileType === 'image') {
        // For images, content would be base64 or we'd pass the image data
        prompt = this.createImagePrompt(language);
      } else {
        throw new Error('Unsupported file type for title generation');
      }

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const title = response.text().trim();
      
      // Clean up the title and ensure it's filename-safe
      return this.sanitizeFilename(title);
    } catch (error) {
      console.error('Error generating title with Gemini:', error);
      throw new Error('Failed to generate title');
    }
  }

  async generateTitleFromImage(imageBuffer, mimeType, language = 'auto') {
    try {
      const prompt = this.createImagePrompt(language);
      
      const imagePart = {
        inlineData: {
          data: imageBuffer.toString('base64'),
          mimeType: mimeType
        }
      };

      const result = await this.model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const title = response.text().trim();
      
      return this.sanitizeFilename(title);
    } catch (error) {
      console.error('Error generating title from image:', error);
      throw new Error('Failed to generate title from image');
    }
  }

  createTextPrompt(content, language) {
    const languageInstruction = language === 'auto' 
      ? 'The content may be in English or Spanish. Respond in the same language as the content.'
      : `Respond in ${language}.`;

    return `You are an AI assistant helping electrical project managers organize their files. 
    
Given the following text content from a project note, generate a concise, descriptive filename that captures the main topic or issue discussed. The filename should be:
- 3-8 words maximum
- Professional and clear
- Suitable for electrical/construction project context
- Without file extension (that will be added later)
- Use hyphens instead of spaces
- Avoid special characters except hyphens

${languageInstruction}

Content: "${content}"

Generate only the filename, nothing else:`;
  }

  createImagePrompt(language) {
    const languageInstruction = language === 'auto' 
      ? 'If there is any text visible in the image, respond in the same language. Otherwise, respond in English.'
      : `Respond in ${language}.`;

    return `You are an AI assistant helping electrical project managers organize their project photos.

Analyze this image and generate a concise, descriptive filename that captures what is shown. The filename should be:
- 3-8 words maximum
- Professional and clear
- Suitable for electrical/construction project context
- Without file extension (that will be added later)
- Use hyphens instead of spaces
- Avoid special characters except hyphens

Focus on identifying:
- Electrical components (panels, outlets, wiring, fixtures, etc.)
- Issues or problems visible
- Locations or areas
- Work being performed

${languageInstruction}

Generate only the filename, nothing else:`;
  }

  sanitizeFilename(filename) {
    // Remove quotes and clean up the filename
    let cleaned = filename.replace(/[""]/g, '').trim();
    
    // Replace spaces and underscores with hyphens
    cleaned = cleaned.replace(/[\s_]+/g, '-');
    
    // Remove any characters that aren't letters, numbers, or hyphens
    cleaned = cleaned.replace(/[^a-zA-Z0-9\-áéíóúñüÁÉÍÓÚÑÜ]/g, '');
    
    // Remove multiple consecutive hyphens
    cleaned = cleaned.replace(/-+/g, '-');
    
    // Remove leading/trailing hyphens
    cleaned = cleaned.replace(/^-+|-+$/g, '');
    
    // Ensure it's not empty and not too long
    if (!cleaned || cleaned.length === 0) {
      cleaned = 'project-file';
    }
    
    if (cleaned.length > 50) {
      cleaned = cleaned.substring(0, 50).replace(/-[^-]*$/, '');
    }
    
    return cleaned;
  }
}

module.exports = new GeminiService();