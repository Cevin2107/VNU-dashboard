import axios, { AxiosInstance, AxiosError } from "axios";
import {
    DanhSachHocKyResponse,
    DiemHocPhanResponse,
    DiemThiHocKyResponse,
    DiemTrungBinhHocKyResponse,
    LichThiResponse,
    LopDaoTaoResponse,
    SigninResponse,
    SinhVienResponse,
    ThoiKhoaBieuResponse,
    TongKetResponse,
} from "@/types/ResponseTypes";

const BASE_URL = "https://onevnu-mobile-api.vnu.edu.vn/api";
const REQUEST_TIMEOUT = 15000;

function fixSummerSem(danhSachHocKy: DanhSachHocKyResponse[]) {
    if (!Array.isArray(danhSachHocKy)) return;
    danhSachHocKy.forEach((hocKy) => {
        if (hocKy.ten === "2"){
            const l = danhSachHocKy.filter(hk => hk.nam === hocKy.nam);
            if (l.length > 2) {
                const id = l.map((hk) => Number(hk.id));
                if (Number(hocKy.id) === Math.max(...id)) {
                    hocKy.ten = "Hè";
                }
            }
        }
    });
}

export class ClientAPIHandler {
	accessToken: string | null = null;
	refreshToken: string | null = null;
	private client: AxiosInstance;
	private isRefreshing = false;

	constructor(
		accessToken: string | null = null,
		refreshToken: string | null = null
	) {
		this.accessToken = accessToken;
		this.refreshToken = refreshToken;

		this.client = axios.create({
			baseURL: BASE_URL,
			timeout: REQUEST_TIMEOUT,
		});

		// Dynamic Authorization header injector
		this.client.interceptors.request.use((config) => {
			if (this.accessToken && !config.headers.Authorization) {
				config.headers.Authorization = `Bearer ${this.accessToken}`;
			}
			return config;
		});

		// 401 Auto-refresh token & silent error recovery
		this.client.interceptors.response.use(
			(response) => response,
			async (error: AxiosError) => {
				const originalRequest = error.config as (typeof error.config & { _retry?: boolean }) | undefined;
				if (
					error.response?.status === 401 &&
					originalRequest &&
					!originalRequest.url?.includes("/auth/signin") &&
					!originalRequest.url?.includes("/auth/refreshtoken") &&
					!originalRequest._retry
				) {
					originalRequest._retry = true;
					if (this.refreshToken && !this.isRefreshing) {
						this.isRefreshing = true;
						try {
							const newTokens = await this.refreshtoken();
							this.isRefreshing = false;

							if (typeof window !== "undefined") {
								sessionStorage.setItem("accessToken", newTokens.accessToken);
								sessionStorage.setItem("refreshToken", newTokens.refreshToken);
								document.cookie = `accessToken=${newTokens.accessToken}; path=/; SameSite=Lax`;
								document.cookie = `refreshToken=${newTokens.refreshToken}; path=/; SameSite=Lax`;
							}

							originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
							return this.client(originalRequest);
						} catch {
							this.isRefreshing = false;
							if (typeof window !== "undefined") {
								sessionStorage.removeItem("accessToken");
								sessionStorage.removeItem("refreshToken");
								sessionStorage.removeItem("vnu-dashboard-auth");
								sessionStorage.removeItem("username");
								document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
								document.cookie = "refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
								window.dispatchEvent(new CustomEvent("authStateChanged"));
							}
							return Promise.reject(error);
						}
					}
				}
				return Promise.reject(error);
			}
		);
	}

	async signin(username: string, password: string): Promise<SigninResponse> {
		try {
			const response = await this.client.post<SigninResponse>(
				"/auth/signin",
				{ username, password }
			);
			this.accessToken = response.data.accessToken;
			this.refreshToken = response.data.refreshToken;
			return response.data;
		} catch (error: unknown) {
			if (axios.isAxiosError(error)) {
				const serverMsg = error.response?.data?.message;
				if (serverMsg) {
					throw new Error(serverMsg);
				}
			}
			throw new Error("Tài khoản hoặc mật khẩu không chính xác");
		}
	}

	async refreshtoken(): Promise<SigninResponse> {
		if (!this.refreshToken) {
			return Promise.reject(new Error("No refresh token available"));
		}

		const response = await this.client.post<SigninResponse>(
			"/auth/refreshtoken",
			{ refreshToken: this.refreshToken }
		);
		this.accessToken = response.data.accessToken;
		this.refreshToken = response.data.refreshToken;
		return response.data;
	}

	async getInfoSinhVien(): Promise<SinhVienResponse> {
		if (!this.accessToken) {
			throw new Error("No access token available");
		}
		const response = await this.client.get<SinhVienResponse>("/sinhvien");
		return response.data;
	}

	async getDataLopDaoTao(
		id: string,
		guidDonVi: string,
		idBacDaoTao: string,
		idHeDaoTao: string,
		idNganhDaoTao: string,
		idNienKhoaDaoTao: string,
		idChuongTrinhDaoTao: string
	): Promise<LopDaoTaoResponse[]> {
		if (!this.accessToken) return [];
		try {
			const response = await this.client.get<LopDaoTaoResponse[]>("/sinhvien/getDataLopDaoTao", {
				params: {
					id,
					guidDonVi,
					idBacDaoTao,
					idHeDaoTao,
					idNganhDaoTao,
					idNienKhoaDaoTao,
					idChuongTrinhDaoTao,
				},
			});
			return response.data || [];
		} catch {
			return [];
		}
	}

	async getTongKetDenHienTai(): Promise<TongKetResponse[]> {
		if (!this.accessToken) return [];
		try {
			const response = await this.client.get<TongKetResponse[]>("/sinhvien/getTongKetDenHienTai");
			return response.data || [];
		} catch {
			return [];
		}
	}

	async getDanhSachHocKyTheoThoiKhoaBieu(): Promise<DanhSachHocKyResponse[]> {
		if (!this.accessToken) return [];
		try {
			const response = await this.client.get<DanhSachHocKyResponse[]>(
				"/sinhvien/getDanhSachHocKyTheoThoiKhoaBieu",
				{
					params: {
						kieuTruong: "TruongChinh",
						isTheoChuongTrinhDaoTao: "1",
					},
				}
			);
			const data = response.data || [];
			fixSummerSem(data);
			return data;
		} catch {
			return [];
		}
	}

	async getDanhSachHocKyTheoLichThi(): Promise<DanhSachHocKyResponse[]> {
		if (!this.accessToken) return [];
		try {
			const response = await this.client.get<DanhSachHocKyResponse[]>(
				"/sinhvien/getDanhSachHocKyTheoLichThi",
				{
					params: {
						kieuTruong: "TruongChinh",
						isTheoChuongTrinhDaoTao: "1",
					},
				}
			);
			const data = response.data || [];
			fixSummerSem(data);
			return data;
		} catch {
			return [];
		}
	}

	async getDanhSachHocKyTheoDiem(): Promise<DanhSachHocKyResponse[]> {
		if (!this.accessToken) return [];
		try {
			const response = await this.client.get<DanhSachHocKyResponse[]>(
				"/sinhvien/getDanhSachHocKyTheoDiem",
				{
					params: {
						kieuTruong: "TruongChinh",
						isTheoChuongTrinhDaoTao: "1",
					},
				}
			);
			const data = response.data || [];
			fixSummerSem(data);
			return data;
		} catch {
			return [];
		}
	}

	async getThoiKhoaBieuHocKy(idHocKy: string): Promise<ThoiKhoaBieuResponse[]> {
		if (!this.accessToken) return [];
		try {
			const response = await this.client.get<ThoiKhoaBieuResponse[]>(
				"/sinhvien/getThoiKhoaBieuHocKy",
				{
					params: {
						idHocKy,
						kieuTruong: "TruongChinh",
					},
				}
			);
			return response.data || [];
		} catch {
			return [];
		}
	}

	async getLichThiHocKy(idHocKy: string): Promise<LichThiResponse[]> {
		if (!this.accessToken) return [];
		try {
			const response = await this.client.get<LichThiResponse[]>(
				"/sinhvien/getLichThiHocKy",
				{
					params: {
						idHocKy,
						kieuTruong: "TruongChinh",
					},
				}
			);
			return response.data || [];
		} catch {
			return [];
		}
	}

	async getDiemThiHocKy(idHocKy: string): Promise<DiemThiHocKyResponse[]> {
		if (!this.accessToken) return [];
		try {
			const response = await this.client.get<DiemThiHocKyResponse[]>(
				"/sinhvien/getDiemThiHocKy",
				{
					params: {
						idHocKy,
						isTheoChuongTrinhDaoTao: "1",
						kieuTruong: "TruongChinh",
					},
				}
			);
			return response.data || [];
		} catch {
			return [];
		}
	}

	async getDiemHocPhanHocKy(idHocPhan: string, idHocKy: string): Promise<DiemHocPhanResponse[]> {
		if (!this.accessToken) return [];
		try {
			const response = await this.client.get<DiemHocPhanResponse[]>(
				"/sinhvien/getDiemHocPhanHocKy",
				{
					params: {
						idHocPhan,
						idHocKy,
						kieuTruong: "TruongChinh",
					},
				}
			);
			return response.data || [];
		} catch {
			return [];
		}
	}

	async getDiemTrungBinhHocKy(idHocKy: string): Promise<DiemTrungBinhHocKyResponse[]> {
		if (!this.accessToken) return [];
		try {
			const response = await this.client.get<DiemTrungBinhHocKyResponse[]>(
				"/sinhvien/getDiemTrungBinhHocKy",
				{
					params: {
						idHocKy,
						kieuTruong: "TruongChinh",
					},
				}
			);
			return response.data || [];
		} catch {
			return [];
		}
	}
}
