type MutationResult = Record<string, any>;

export function successResponse(message: string, extra: MutationResult = {}) {
    return { success: true, message, ...extra };
}

export function errorResponse(message: string, extra: MutationResult = {}) {
    return { success: false, message, ...extra };
}

export function withTryCatch<T extends (...args: any[]) => Promise<MutationResult>>(
    resolver: T,
    fallbackMessage: string,
    extraNullFields: MutationResult = {}
) {
    return async (...args: Parameters<T>): Promise<MutationResult> => {
        try {
            return await resolver(...args);
        } catch (error: any) {
            return errorResponse(error.message || fallbackMessage, extraNullFields);
        }
    };
}