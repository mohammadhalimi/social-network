// app/lib/uploadStory.ts
export async function uploadStoryMedia(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('media', file); // ✅ تغییر از 'file' به 'media'

    const response = await fetch('http://localhost:4000/upload-story-media', {
        // ✅ تغییر از '/upload-story' به '/upload-story-media'
        method: 'POST',
        credentials: 'include',
        body: formData,
    });

    if (!response.ok) {
        // ✅ خواندن پیام خطای واقعی از سرور
        let errorMessage = 'خطا در آپلود فایل استوری';
        try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
            // اگر پاسخ JSON نبود، همان پیام پیش‌فرض
        }
        throw new Error(errorMessage);
    }

    const data = await response.json();
    return data.url;
}