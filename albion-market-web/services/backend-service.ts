import axios, { AxiosRequestConfig } from "axios";
import { SpreadDto } from "./dto/spread.dto";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function getSpread(): Promise<SpreadDto[]> {
  return get("spread");
}

async function get(url: string, config?: AxiosRequestConfig) {
  const response = await axios.get(`${BACKEND_URL}/${url}`, config);

  return response.data;
}
