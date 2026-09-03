export type ContentBlock =
    | { type: 'header'; content: string }
    | { type: 'text'; content: string }
    | { type: 'image'; url: string; caption?: string }
    | { type: 'video'; url: string };

export type BlockUploadingState = { [key: number]: boolean };