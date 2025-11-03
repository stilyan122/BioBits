import { Platform } from "react-native";

type KVS = {
  set: (k: string, v: string) => void | Promise<void>;
  getString: (k: string) => string | null | Promise<string | null>;
  delete: (k: string) => void | Promise<void>;
};

let storage: KVS;

if (Platform.OS === "web") {
  storage = {
    set: (k, v) => localStorage.setItem(k, v),
    getString: (k) => localStorage.getItem(k),
    delete: (k) => localStorage.removeItem(k),
  };
} else {
  const { MMKV } = require("react-native-mmkv");
  const mmkv = new MMKV({ id: "biobits" });
  storage = {
    set: (k, v) => mmkv.set(k, v),
    getString: (k) => mmkv.getString(k) ?? null,
    delete: (k) => mmkv.delete(k),
  };
}

export const setToken = (k: string, v: string) => storage.set(k, v);
export const getToken = (k: string) => storage.getString(k);
export const delToken = (k: string) => storage.delete(k);