import QRCode from 'qrcode';

export interface QRCodeOptions {
  size?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

export class QRCodeGenerator {
  private baseUrl: string;

  constructor() {
    this.baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : process.env.NEXT_PUBLIC_BASE_URL || 'https://dishdisplay.com';
  }

  /**
   * Generate a QR code URL for a restaurant menu
   */
  getMenuUrl(restaurantId: string): string {
    return `${this.baseUrl}/menu/${restaurantId}`;
  }

  /**
   * Generate QR code as data URL (base64 image)
   */
  async generateDataURL(
    restaurantId: string, 
    options: QRCodeOptions = {}
  ): Promise<string> {
    const url = this.getMenuUrl(restaurantId);
    
    const qrOptions = {
      width: options.size || 256,
      margin: options.margin || 2,
      color: {
        dark: options.color?.dark || '#000000',
        light: options.color?.light || '#FFFFFF',
      },
      errorCorrectionLevel: options.errorCorrectionLevel || 'M' as const,
    };

    try {
      return await QRCode.toDataURL(url, qrOptions);
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  /**
   * Generate QR code as SVG string
   */
  async generateSVG(
    restaurantId: string, 
    options: QRCodeOptions = {}
  ): Promise<string> {
    const url = this.getMenuUrl(restaurantId);
    
    const qrOptions = {
      width: options.size || 256,
      margin: options.margin || 2,
      color: {
        dark: options.color?.dark || '#000000',
        light: options.color?.light || '#FFFFFF',
      },
      errorCorrectionLevel: options.errorCorrectionLevel || 'M' as const,
    };

    try {
      return await QRCode.toString(url, { 
        type: 'svg',
        ...qrOptions 
      });
    } catch (error) {
      console.error('Error generating QR code SVG:', error);
      throw new Error('Failed to generate QR code SVG');
    }
  }

  /**
   * Download QR code as PNG file
   */
  async downloadPNG(
    restaurantId: string, 
    filename?: string,
    options: QRCodeOptions = {}
  ): Promise<void> {
    try {
      const dataUrl = await this.generateDataURL(restaurantId, options);
      
      // Create download link
      const link = document.createElement('a');
      link.download = filename || `menu-qr-${restaurantId}.png`;
      link.href = dataUrl;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading QR code:', error);
      throw error;
    }
  }

  /**
   * Download QR code as SVG file
   */
  async downloadSVG(
    restaurantId: string, 
    filename?: string,
    options: QRCodeOptions = {}
  ): Promise<void> {
    try {
      const svg = await this.generateSVG(restaurantId, options);
      
      // Create blob and download link
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.download = filename || `menu-qr-${restaurantId}.svg`;
      link.href = url;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Cleanup
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading QR code SVG:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const qrCodeGenerator = new QRCodeGenerator();
