import axios, { AxiosError } from "axios";
import https from "https";
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

export class ClientAPIHandler {
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
		if (!this.accessToken) {
			throw new Error("No access token available");
		}

		const response = await axios.get<SinhVienResponse>(
			"/sinhvien",
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

	async getDataLopDaoTao(
		id: string,
		guidDonVi: string,
		idBacDaoTao: string,
		idHeDaoTao: string,
		idNganhDaoTao: string,
		idNienKhoaDaoTao: string,
		idChuongTrinhDaoTao: string
	): Promise<LopDaoTaoResponse[]> {
		if (!this.accessToken) {
			throw new Error("No access token available");
		}

		const response = await axios.get("/sinhvien/getDataLopDaoTao", {
			params: {
				id: id,
				guidDonVi: guidDonVi,
				idBacDaoTao: idBacDaoTao,
				idHeDaoTao: idHeDaoTao,
				idNganhDaoTao: idNganhDaoTao,
				idNienKhoaDaoTao: idNienKhoaDaoTao,
				idChuongTrinhDaoTao: idChuongTrinhDaoTao,
			},
			headers: {
				Authorization: `Bearer ${this.accessToken}`,
				"User-Agent": USERAGENT
			},
			baseURL: BASE_URL,
			httpsAgent: this.agent,
		});
		return response.data;
	}

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

