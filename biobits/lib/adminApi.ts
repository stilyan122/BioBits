import { api } from "./api";

export type AdminUser = {
  id: string;
  email: string | null;
  userName: string | null;
  emailConfirmed: boolean;
  lockoutEnabled: boolean;
  roles: string[];
};

export type DnaLogRow = {
  id: number;
  userId: string;
  type: "clean" | "revcomp" | "transcribe" | "translate";
  input?: string | null;
  output?: string | null;
  metaJson?: string | null;
  createdAt: string;
};

export type QuizLogRow = {
  id: number;
  userId: string;
  score: number;
  total: number;
  avgMs: number;
  kind?: string | null;
  createdAt: string;
};

export type AdminStats = {
  users: number;
  dnaCount: number;
  quizCount: number;
  active7: number;
  avgQuizTime: number;
};

export const adminApi = {
  listUsers:  () => api.get<AdminUser[]>("/api/admin/users"),
  createUser: (email: string, password: string, role: "Admin" | "Student" = "Student") =>
    api.post("/api/admin/users", { Email: email, Password: password, Role: role }),
  setRole:    (userId: string, role: "Admin" | "Student") =>
    api.post(`/api/admin/users/${userId}/role`, role, {
      headers: { "Content-Type": "application/json" },
    }),
  deleteUser: (userId: string) => api.delete(`/api/admin/users/${userId}`),

  listDna: (userId?: string) =>
    api.get<DnaLogRow[]>("/api/admin/history/dna", { params: { userId } }),
  listQuiz: (userId?: string) =>
    api.get<QuizLogRow[]>("/api/admin/history/quiz", { params: { userId } }),
  delDna:  (id: number) => api.delete(`/api/admin/history/dna/${id}`),
  delQuiz: (id: number) => api.delete(`/api/admin/history/quiz/${id}`),

  stats: () => api.get<AdminStats>("/api/admin/stats"),
};