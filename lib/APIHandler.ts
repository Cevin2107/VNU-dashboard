import axios, { AxiosError } from "axios";
import https from "https";
import { unstable_cache } from 'next/cache';
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
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { logoutAction } from "@/app/actions";

const BASE_URL = "https://onevnu-mobile-api.vnu.edu.vn/api";
const USERAGENT = "Dart/3.6 (dart:io)";

function fixSummerSem(danhSachHocKy: DanhSachHocKyResponse[]) {
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

export class APIHandler {
	accessToken: string | null = null;
	refreshToken: string | null = null;
	agent = new https.Agent({
		rejectUnauthorized: false, // Disable SSL verification
	});

	constructor(
		accessToken: string | null = null,
		refreshToken: string | null = null
	) {
		this.accessToken = accessToken;
		this.refreshToken = refreshToken;
	}

	async signin(username: string, password: string): Promise<SigninResponse> {
		const response = await axios.post<SigninResponse>(
			"/auth/signin",
			{
				username,
				password,
			},
			{
				baseURL: BASE_URL,
				httpsAgent: this.agent,
				headers: {
					"User-Agent": USERAGENT,
				},
			}
		);
		this.accessToken = response.data.accessToken;
		this.refreshToken = response.data.refreshToken;

		return response.data;
	}

	async refreshtoken(): Promise<SigninResponse> {
		if (this.refreshToken) {
			const response = await axios.post<SigninResponse>(
				"/auth/refreshtoken",
				{
					refreshToken: this.refreshToken,
				},
				{
					baseURL: BASE_URL,
					httpsAgent: this.agent,
					headers: {
						"User-Agent": USERAGENT,
					},
				}
			);
			this.accessToken = response.data.accessToken;
			this.refreshToken = response.data.refreshToken;

			return response.data;
		}

		return Promise.reject(new Error("No refresh token available"));
	}

	async getInfoSinhVien(): Promise<SinhVienResponse> {
		const getCachedInfo = unstable_cache(
			async (token: string) => {
				const response = await axios.get<SinhVienResponse>(
					"/sinhvien",
					{
						headers: {
							Authorization: `Bearer ${token}`,
							"User-Agent": USERAGENT
						},
						baseURL: BASE_URL,
						httpsAgent: this.agent,
					}
				);
				return response.data;
			},
			["user-info"],
			{
				tags: ["user-data"],
				revalidate: 3600, // 1 hour
			}
		);

		if (!this.accessToken) {
			throw new Error("No access token available");
		}

		return await getCachedInfo(this.accessToken);
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
		const getCachedLopDaoTao = unstable_cache(
			async (token: string,
				_id: string,
				_guidDonVi: string,
				_idBacDaoTao: string,
				_idHeDaoTao: string,
				_idNganhDaoTao: string,
				_idNienKhoaDaoTao: string,
				_idChuongTrinhDaoTao: string
			) => {
				const response = await axios.get("/sinhvien/getDataLopDaoTao", {
					params: {
						id: _id,
						guidDonVi: _guidDonVi,
						idBacDaoTao: _idBacDaoTao,
						idHeDaoTao: _idHeDaoTao,
						idNganhDaoTao: _idNganhDaoTao,
						idNienKhoaDaoTao: _idNienKhoaDaoTao,
						idChuongTrinhDaoTao: _idChuongTrinhDaoTao,
					},
					headers: {
						Authorization: `Bearer ${token}`,
						"User-Agent": USERAGENT
					},
					baseURL: BASE_URL,
					httpsAgent: this.agent,
				});
				return response.data;
			},
			["user-lopdaotao"],
			{
				tags: ["user-data"],
				revalidate: 3600, // 1 hour
			}
		);

		if (!this.accessToken) {
			throw new Error("No access token available");
		}

		return await getCachedLopDaoTao(this.accessToken, id, guidDonVi, idBacDaoTao, idHeDaoTao, idNganhDaoTao, idNienKhoaDaoTao, idChuongTrinhDaoTao);
	}

	// Realtime version (no cache) of getTongKetDenHienTai
	async getTongKetDenHienTai(): Promise<TongKetResponse[]> {
		if (!this.accessToken) {
			throw new Error("No access token available");
		}

		const response = await axios.get<TongKetResponse[]>(
			"/sinhvien/getTongKetDenHienTai",
			{
				headers: {
					Authorization: `Bearer ${this.accessToken}`,
					"User-Agent": USERAGENT
				},
				baseURL: BASE_URL,
				httpsAgent: this.agent,
			}
		);
		return response.data;
	}

	// Realtime version (no cache) of getDanhSachHocKyTheoThoiKhoaBieu
	async getDanhSachHocKyTheoThoiKhoaBieu(): Promise<DanhSachHocKyResponse[]> {
		if (!this.accessToken) {
			throw new Error("No access token available");
		}

		const response = await axios.get<DanhSachHocKyResponse[]>(
			"/sinhvien/getDanhSachHocKyTheoThoiKhoaBieu",
			{
				params: {
					kieuTruong: "TruongChinh",
					isTheoChuongTrinhDaoTao: "1",
				},
				headers: {
					Authorization: `Bearer ${this.accessToken}`,
					"User-Agent": USERAGENT
				},
				baseURL: BASE_URL,
				httpsAgent: this.agent,
			}
		);
		fixSummerSem(response.data);
		return response.data;
	}

	// Realtime version (no cache) of getDanhSachHocKyTheoLichThi
	async getDanhSachHocKyTheoLichThi(): Promise<DanhSachHocKyResponse[]> {
		if (!this.accessToken) {
			throw new Error("No access token available");
		}

		const response = await axios.get<DanhSachHocKyResponse[]>(
			"/sinhvien/getDanhSachHocKyTheoLichThi",
			{
				params: {
					kieuTruong: "TruongChinh",
					isTheoChuongTrinhDaoTao: "1",
				},
				headers: {
					Authorization: `Bearer ${this.accessToken}`,
					"User-Agent": USERAGENT
				},
				baseURL: BASE_URL,
				httpsAgent: this.agent,
			}
		);
		fixSummerSem(response.data);
		return response.data;
	}

	// Realtime version (no cache) of getDanhSachHocKyTheoDiem
	async getDanhSachHocKyTheoDiem(): Promise<DanhSachHocKyResponse[]> {
		if (!this.accessToken) {
			throw new Error("No access token available");
		}

		const response = await axios.get<DanhSachHocKyResponse[]>(
			"/sinhvien/getDanhSachHocKyTheoDiem",
			{
				params: {
					kieuTruong: "TruongChinh",
					isTheoChuongTrinhDaoTao: "1",
				},
				headers: {
					Authorization: `Bearer ${this.accessToken}`,
					"User-Agent": USERAGENT
				},
				baseURL: BASE_URL,
				httpsAgent: this.agent,
			}
		);
		fixSummerSem(response.data);
		return response.data;
	}

	// Realtime version (no cache) of getThoiKhoaBieuHocKy
	async getThoiKhoaBieuHocKy(
		idHocKy: string
	): Promise<ThoiKhoaBieuResponse[]> {
		if (!this.accessToken) {
			throw new Error("No access token available");
		}

		const response = await axios.get<ThoiKhoaBieuResponse[]>(
			"/sinhvien/getThoiKhoaBieuHocKy",
			{
				params: {
					idHocKy: idHocKy,
					kieuTruong: "TruongChinh",
				},
				headers: {
					Authorization: `Bearer ${this.accessToken}`,
					"User-Agent": USERAGENT
				},
				baseURL: BASE_URL,
				httpsAgent: this.agent,
			}
		);
		return response.data;
	}

	// Realtime version (no cache) of getLichThiHocKy
	async getLichThiHocKy(idHocKy: string): Promise<LichThiResponse[]> {
		if (!this.accessToken) {
			throw new Error("No access token available");
		}

		const response = await axios.get<LichThiResponse[]>(
			"/sinhvien/getLichThiHocKy",
			{
				params: {
					idHocKy: idHocKy,
					kieuTruong: "TruongChinh",
				},
				headers: {
					Authorization: `Bearer ${this.accessToken}`,
					"User-Agent": USERAGENT
				},
				baseURL: BASE_URL,
				httpsAgent: this.agent,
			}
		);
		return response.data;
	}

	// Realtime version (no cache) of getDiemThiHocKy
	async getDiemThiHocKy(idHocKy: string): Promise<DiemThiHocKyResponse[]> {
		if (!this.accessToken) {
			throw new Error("No access token available");
		}

		const response = await axios.get<DiemThiHocKyResponse[]>(
			"/sinhvien/getDiemThiHocKy",
			{
				params: {
					idHocKy: idHocKy,
					isTheoChuongTrinhDaoTao: "1",
					kieuTruong: "TruongChinh",
				},
				headers: {
					Authorization: `Bearer ${this.accessToken}`,
					"User-Agent": USERAGENT
				},
				baseURL: BASE_URL,
				httpsAgent: this.agent,
			}
		);
		return response.data;
	}

	// Realtime version (no cache) of getDiemHocPhanHocKy
	async getDiemHocPhanHocKy(
		idHocPhan: string,
		idHocKy: string
	): Promise<DiemHocPhanResponse[]> {
		if (!this.accessToken) {
			throw new Error("No access token available");
		}

		const response = await axios.get<DiemHocPhanResponse[]>(
			"/sinhvien/getDiemHocPhanHocKy",
			{
				params: {
					idHocPhan: idHocPhan,
					idHocKy: idHocKy,
					kieuTruong: "TruongChinh",
				},
				headers: {
					Authorization: `Bearer ${this.accessToken}`,
					"User-Agent": USERAGENT
				},
				baseURL: BASE_URL,
				httpsAgent: this.agent,
			}
		);
		return response.data;
	}

	// Realtime version (no cache) of getDiemTrungBinhHocKy
	async getDiemTrungBinhHocKy(
		idHocKy: string
	): Promise<DiemTrungBinhHocKyResponse[]> {
		if (!this.accessToken) {
			throw new Error("No access token available");
		}

		const response = await axios.get<DiemTrungBinhHocKyResponse[]>(
			"/sinhvien/getDiemTrungBinhHocKy",
			{
				params: {
					idHocKy: idHocKy,
					kieuTruong: "TruongChinh",
				},
				headers: {
					Authorization: `Bearer ${this.accessToken}`,
					"User-Agent": USERAGENT
				},
				baseURL: BASE_URL,
				httpsAgent: this.agent,
			}
		);
		return response.data;
	}
}

export async function withAuth<T>(callback: (apiHandler: APIHandler) => Promise<T>) {
	const cookieStore = await cookies();
	const accessToken = cookieStore.get("accessToken")?.value;
	const refreshToken = cookieStore.get("refreshToken")?.value;
	const remember = cookieStore.get("remember")?.value === "true";

	if (!accessToken) {
		redirect("/welcome");
	}
	
	const apiHandler = new APIHandler(accessToken, refreshToken);
	try {
		return callback(apiHandler);
	} catch (error) {
		if (error instanceof AxiosError &&  error.status === 401 && remember) {
			const {accessToken, refreshToken} = await apiHandler.refreshtoken();
			cookieStore.set("accessToken", accessToken);
			cookieStore.set("refreshToken", refreshToken);
			return callback(apiHandler);
		}
		// maybe the refresh token also expired
		// if cant refresh, logout
		logoutAction();
		throw error;
	}
}