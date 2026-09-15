import type { AxiosResponse } from "axios";

export const axiosRes = <T>(data: T): AxiosResponse<T> =>
  ({ data }) as unknown as AxiosResponse<T>;
