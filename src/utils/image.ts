/**
 * 压缩图片
 * @param base64Str base64字符串
 * @param maxWidth 最大宽度
 * @param quality 压缩质量 0-1
 */
export async function compressImage(base64Str: string, maxWidth = 800, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = (maxWidth / width) * height;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = reject;
  });
}

/**
 * 生成缩略图
 */
export async function generateThumbnail(base64Str: string): Promise<string> {
  return compressImage(base64Str, 200, 0.6);
}

/**
 * 将 File 对象转为 base64
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}
