"use client";
import { useEffect, useState } from "react";
import { ClientAPIHandler } from "@/lib/ClientAPIHandler";
import Image, { StaticImageData } from "next/image";
import { donVi, nganhDaoTao } from "@/lib/constants";
import GPAChart from "./components/GPAChart";
import SubjectScoreChart from "./components/SubjectScoreChart";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SubjectScore } from "@/types/SubjectTypes";
import { useRouter } from "next/navigation";

import HSB from "@/public/hsb.png";
import HUS from "@/public/hus.png";
import IS from "@/public/is.png";
import SIS from "@/public/sis.png";
import UEB from "@/public/ueb.png";
import UEd from "@/public/ued.png";
import UET from "@/public/uet.png";
import UL from "@/public/ul.png";
import ULIS from "@/public/ulis.png";
import UMP from "@/public/ump.png";
import USSH from "@/public/ussh.png";
import VJU from "@/public/vju.png";

const donViLogo: Record<string, StaticImageData> = {
  "1852a7e7-76b1-45ee-b04a-917179316777": SIS,
  "1201964a-3805-4e20-9827-4acff1b3eaf5": VJU,
  "ad4dfd9d-98d2-49c2-8a86-fdfcc2c5f1ea": UMP,
  "6dcfe8c0-67df-4496-a724-98427f0dd131": HSB,
  "9931d594-52fa-41d0-b029-ba8a6208fcb7": UL,
  "2a1ac6ac-0592-411d-ad25-3bae99f96480": IS,
  "83bfa49f-d454-43c2-9e05-7541e1dfd12b": UEd,
  "13cab74f-2162-4fe4-ad9b-f378fc3e15d5": UEB,
  "9457b76b-8472-41b3-a67f-8fd66fa2e3e1": UET,
  "3afe52a1-dcd5-45e3-b607-9efcb8d56289": ULIS,
  "6f27667c-1b50-4a23-895b-ab491c743340": USSH,
  "f88a778b-0a4d-4a3b-a8fa-d94a6b5ce6f8": HUS
}

interface HomeData {
  tongket: any;
  gpaTongKet: any[];
  svInfo: any;
  classData: any;
  subjectScoreCount: Record<SubjectScore, number>;
}

export default function HomeContent() {
  const router = useRouter();
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Lấy tokens từ sessionStorage
        const accessToken = sessionStorage.getItem("accessToken");
        const refreshToken = sessionStorage.getItem("refreshToken");

        if (!accessToken) {
          console.log("No access token, but WelcomeGuard should handle this");
          return;
        }

        const apiHandler = new ClientAPIHandler(accessToken, refreshToken);

        const tongket = (await apiHandler.getTongKetDenHienTai())[0];
        const svInfo = await apiHandler.getInfoSinhVien();
        const classData = (await apiHandler.getDataLopDaoTao(
          svInfo.idLopDaoTao,
          svInfo.guidDonVi,
          svInfo.idBacDaoTao,
          svInfo.idHeDaoTao,
          svInfo.idNganhDaoTao,
          svInfo.idNienKhoaDaoTao,
          svInfo.idChuongTrinhDaoTao
        ))[0];

        const danhSachHocKy = await apiHandler.getDanhSachHocKyTheoDiem();
        const gpaTongKet: any[] = [];
        const subjectScoreCount: Record<SubjectScore, number> = {
          [SubjectScore.A_plus]: 0,
          [SubjectScore.A]: 0,
          [SubjectScore.B_plus]: 0,
          [SubjectScore.B]: 0,
          [SubjectScore.C_plus]: 0,
          [SubjectScore.C]: 0,
          [SubjectScore.D_plus]: 0,
          [SubjectScore.D]: 0,
          [SubjectScore.F]: 0
        };

        for (const hocKy of danhSachHocKy) {
          const tongket = (await apiHandler.getDiemTrungBinhHocKy(hocKy.id))[0];
          const diemHocKy = await apiHandler.getDiemThiHocKy(hocKy.id);
          diemHocKy.forEach((diem) => {
            subjectScoreCount[diem.diemHeChu] += 1;
          });
          gpaTongKet.push({
            id: hocKy.id,
            tenHocKy: `Học kỳ ${hocKy.ten} năm học ${hocKy.nam}`,
            tongket: Number.parseFloat(tongket.diemTrungBinhHe4_HocKy),
            tichluy: Number.parseFloat(tongket.diemTrungBinhHe4_TichLuyDenHocKyHienTai)
          });
        }
        gpaTongKet.sort((a, b) => Number(a.id) - Number(b.id));

        setData({
          tongket,
          svInfo,
          classData,
          gpaTongKet,
          subjectScoreCount
        });
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Có lỗi xảy ra khi tải dữ liệu");
        // WelcomeGuard sẽ xử lý redirect nếu cần
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (loading) {
    return <div className="w-full space-y-2 mr-2 mt-2 mb-2"></div>;
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
          <div className="text-center">
            <div className="text-red-400 text-6xl mb-4">⚠️</div>
            <h2 className="text-red-700 dark:text-red-300 text-xl font-semibold mb-2">Có lỗi xảy ra</h2>
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const { tongket, gpaTongKet, svInfo, classData, subjectScoreCount } = data;

  return (
  <div className="w-full space-y-2 mr-2 mt-2 mb-2">
      {/* Welcome Header */}
      <div className="text-center mb-2">
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-1 tracking-tight">
          Xin chào, {svInfo.hoVaTen.split(' ').pop()}! 👋
        </h1>
        <p className="text-base md:text-lg text-gray-600 dark:text-gray-400">Chúc bạn một ngày tốt lành</p>
      </div>

      {/* Stats Cards */}
      <div className="flex flex-col md:flex-row gap-3 mb-2">
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl p-2 md:p-3 shadow-xl border border-white/20 dark:border-gray-700/30 flex-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Số kỳ đã học</p>
              <p className="text-gray-900 dark:text-gray-100 text-2xl md:text-3xl font-bold">{tongket.soKyDaHoc}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl p-2 md:p-3 shadow-xl border border-white/20 dark:border-gray-700/30 flex-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Điểm TB tích lũy</p>
              <p className="text-gray-900 dark:text-gray-100 text-xl md:text-2xl font-bold">{tongket.diemTrungBinhHe4TichLuy}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl p-2 md:p-3 shadow-xl border border-white/20 dark:border-gray-700/30 flex-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Tín chỉ tích lũy</p>
              <p className="text-gray-900 dark:text-gray-100 text-xl md:text-2xl font-bold">{tongket.tongSoTinChiTichLuy}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Student Info Card */}
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl p-2 md:p-3 shadow-xl border border-white/20 dark:border-gray-700/30 mb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">Thông tin sinh viên</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="space-y-1">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Họ và tên</p>
                  <p className="text-gray-900 dark:text-gray-100 font-semibold">{svInfo.hoVaTen}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Đơn vị</p>
                  <p className="text-gray-900 dark:text-gray-100 font-semibold">{donVi.find((dv) => dv.guid === svInfo.guidDonVi)?.tenDonVi}</p>
                </div>
              </div>
              <div className="space-y-1">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Ngành học</p>
                  <p className="text-gray-900 dark:text-gray-100 font-semibold">{nganhDaoTao.find((ndt) => ndt.id === svInfo.idNganhDaoTao && ndt.guidDonVi === svInfo.guidDonVi)?.ten}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Lớp khóa học</p>
                  <p className="text-gray-900 dark:text-gray-100 font-semibold">{classData.ten} {classData.ten !== classData.tenVietTat && `(${classData.tenVietTat})`}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="ml-3">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-white/70 dark:bg-gray-700/70 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30 dark:border-gray-600/30 shadow-lg">
              <Image
                src={donViLogo[svInfo.guidDonVi]}
                width={40}
                height={40}
                alt="Logo"
                className="rounded-xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl p-2 md:p-3 shadow-xl border border-white/20 dark:border-gray-700/30 flex-1">
          <h3 className="text-lg md:text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">Điểm GPA theo học kỳ</h3>
          <GPAChart data={gpaTongKet} />
        </div>

        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl p-2 md:p-3 shadow-xl border border-white/20 dark:border-gray-700/30 flex-1">
          <h3 className="text-lg md:text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">Thống kê điểm môn học</h3>
          <SubjectScoreChart data={subjectScoreCount} />
        </div>
      </div>
    </div>
  );
}
