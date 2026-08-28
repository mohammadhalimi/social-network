// app/lib/upload.ts

export const uploadPostMedia = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('media', file);

    try {
        const response = await fetch('http://localhost:4000/upload-post-media', {
            method: 'POST',
            credentials: 'include',
            body: formData,
        });

        if (!response.ok) {
            let errorMessage = 'خطا در آپلود فایل';
            
            try {
                const error = await response.json();
                
                if (response.status === 413) {
                    errorMessage = 'حجم فایل انتخابی بیش از حد مجاز (حداکثر ۵۰ مگابایت) است. لطفاً فایل کوچکتری انتخاب کنید.';
                } else if (error.error?.includes('فرمت')) {
                    errorMessage = 'فرمت فایل پشتیبانی نمی‌شود. فقط تصاویر (JPG, PNG, WEBP) و ویدیوها (MP4, WebM) مجاز هستند.';
                } else if (error.error) {
                    errorMessage = error.error;
                }
            } catch (e) {
                errorMessage = 'خطا در ارتباط با سرور';
            }
            
            throw new Error(errorMessage);
        }

        const data = await response.json();
        return data.url;
    } catch (error: any) {
        if (error.message === 'Failed to fetch' || error.message.includes('fetch')) {
            throw new Error('خطا در ارتباط با سرور. لطفاً اتصال اینترنت خود را بررسی کنید.');
        }
        throw error;
    }
};