import axios from "axios";

export const api = axios.create({
    baseURL: (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1').replace(/\/+$/, ''),
    headers: {
        "Content-Type": "application/json",
    },
});