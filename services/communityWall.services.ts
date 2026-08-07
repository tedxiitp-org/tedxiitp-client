import { api } from "@/lib/axios";
import { CommunityWallNoteBackend } from "@/types/communityWall";

const unwrapNotes = (payload: unknown): CommunityWallNoteBackend[] => {
    if (Array.isArray(payload)) {
        return payload as CommunityWallNoteBackend[];
    }
    if (payload && typeof payload === "object") {
        const obj = payload as Record<string, unknown>;
        if (Array.isArray(obj.data)) return obj.data as CommunityWallNoteBackend[];
        if (Array.isArray(obj.notes)) return obj.notes as CommunityWallNoteBackend[];
    }
    console.warn("Unexpected /api/community-wall response shape:", payload);
    return [];
};

const unwrapNote = (payload: unknown): CommunityWallNoteBackend => {
    if (payload && typeof payload === "object") {
        const obj = payload as Record<string, unknown>;
        if (obj.data && typeof obj.data === "object" && !Array.isArray(obj.data)) {
            return obj.data as CommunityWallNoteBackend;
        }
        if (obj.note && typeof obj.note === "object") {
            return obj.note as CommunityWallNoteBackend;
        }
    }
    return payload as CommunityWallNoteBackend;
};

export const getCommunityWallNotes = async (sort: "new" | "top" = "new"): Promise<CommunityWallNoteBackend[]> => {
    const res = await api.get(`/api/community-wall?sort=${sort}`);
    return unwrapNotes(res.data);
};

export const createCommunityWallNote = async (data: {
    username: string;
    message: string;
    color?: string;
    rotation?: number;
}): Promise<CommunityWallNoteBackend> => {
    const res = await api.post("/api/community-wall", data);
    return unwrapNote(res.data);
};

export const likeCommunityWallNote = async (id: string): Promise<CommunityWallNoteBackend> => {
    const res = await api.patch(`/api/community-wall/${id}/like`);
    return unwrapNote(res.data);
};

export const unlikeCommunityWallNote = async (id: string): Promise<CommunityWallNoteBackend> => {
    const res = await api.patch(`/api/community-wall/${id}/unlike`);
    return unwrapNote(res.data);
};
