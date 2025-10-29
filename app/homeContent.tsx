"use client";
import { useEffect, useState } from "react";
import { ClientAPIHandler } from "@/lib/ClientAPIHandler";
import Image, { StaticImageData } from "next/image";
import { donVi, nganhDaoTao } from "@/lib/constants";
import GPAChart from "./components/GPAChart";
import SubjectScoreChart from "./components/SubjectScoreChart";
import { SubjectScore } from "@/types/SubjectTypes";
import { useRouter } from "next/navigation";
import { DatePicker } from "@/components/ui/date-picker";
import { ThoiKhoaBieuResponse, TongKetResponse, SinhVienResponse, LopDaoTaoResponse, DiemTrungBinhHocKyResponse, DiemThiHocKyResponse } from "@/types/ResponseTypes";

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
  tongket: TongKetResponse;
  gpaTongKet: { id: string; tenHocKy: string; tongket: number; tichluy: number }[];
  svInfo: SinhVienResponse;
  classData: LopDaoTaoResponse;
  subjectScoreCount: Record<SubjectScore, number>;
  currentSemesterGPA: number | null;
  fullSchedule: ThoiKhoaBieuResponse[];
}

export default function HomeContent() {
  const router = useRouter();
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [displaySchedule, setDisplaySchedule] = useState<ThoiKhoaBieuResponse[]>([]);

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

        // Fetch dữ liệu cơ bản song song (parallel)
        const [tongket, svInfo, danhSachHocKy, danhSachHocKyTKB] = await Promise.all([
          apiHandler.getTongKetDenHienTai().then(res => res[0]),
          apiHandler.getInfoSinhVien(),
          apiHandler.getDanhSachHocKyTheoDiem(),
          apiHandler.getDanhSachHocKyTheoThoiKhoaBieu()
        ]);

        // Fetch class data
        const classData = (await apiHandler.getDataLopDaoTao(
          svInfo.idLopDaoTao,
          svInfo.guidDonVi,
          svInfo.idBacDaoTao,
          svInfo.idHeDaoTao,
          svInfo.idNganhDaoTao,
          svInfo.idNienKhoaDaoTao,
          svInfo.idChuongTrinhDaoTao
        ))[0];

        // Tối ưu: Chỉ lấy 3 học kỳ gần nhất cho dashboard (đủ để vẽ chart)
        const recentSemesters = danhSachHocKy.slice(-3);
        
        // Fetch GPA và điểm song song cho các học kỳ gần nhất
        const semesterDataPromises = recentSemesters.map(async (hocKy: { id: string; ten: string; nam: string }) => {
          const [tongketHocKy, diemHocKy] = await Promise.all([
            apiHandler.getDiemTrungBinhHocKy(hocKy.id).then(res => res[0]),
            apiHandler.getDiemThiHocKy(hocKy.id)
          ]);
          return { hocKy, tongketHocKy, diemHocKy };
        });

        const semesterResults = await Promise.all(semesterDataPromises);

        const gpaTongKet: { id: string; tenHocKy: string; tongket: number; tichluy: number }[] = [];
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

        // Process kết quả
        semesterResults.forEach(({ hocKy, tongketHocKy, diemHocKy }) => {
          diemHocKy.forEach((diem) => {
            subjectScoreCount[diem.diemHeChu] += 1;
          });
          gpaTongKet.push({
            id: hocKy.id,
            tenHocKy: `Học kỳ ${hocKy.ten} năm học ${hocKy.nam}`,
            tongket: Number.parseFloat(tongketHocKy.diemTrungBinhHe4_HocKy),
            tichluy: Number.parseFloat(tongketHocKy.diemTrungBinhHe4_TichLuyDenHocKyHienTai)
          });
        });
        gpaTongKet.sort((a, b) => Number(a.id) - Number(b.id));

        // Lấy thời khóa biểu học kỳ hiện tại và filter lịch hôm nay
        let fullSchedule: ThoiKhoaBieuResponse[] = [];
        let currentSemesterIdFromSchedule: string | null = null;
        let currentSemesterGPA = null;
        
        try {
          if (danhSachHocKyTKB.length > 0) {
            // Lấy học kỳ có ID cao nhất (học kỳ hiện tại)
            const sortedSemesters = [...danhSachHocKyTKB].sort((a, b) => Number(b.id) - Number(a.id));
            const currentSemester = sortedSemesters[0];
            currentSemesterIdFromSchedule = currentSemester.id;
            
            const thoiKhoaBieu = await apiHandler.getThoiKhoaBieuHocKy(currentSemester.id);
            fullSchedule = thoiKhoaBieu;
            
            // Lấy ngày hôm nay (0 = Chủ nhật, 1 = Thứ 2, ..., 6 = Thứ 7)
            const today = new Date().getDay();
            
            // API trả về ngayTrongTuan là số string: "1" = Thứ 2, "2" = Thứ 3, ...
            // "0" hoặc "7" = Chủ nhật
            const dayToApiMap: Record<number, string> = {
              0: "0", // Chủ nhật
              1: "1", // Thứ 2
              2: "2", // Thứ 3
              3: "3", // Thứ 4
              4: "4", // Thứ 5
              5: "5", // Thứ 6
              6: "6"  // Thứ 7
            };
          }
        } catch (err) {
          console.error("Error fetching schedule:", err);
        }

        // Lấy GPA của kỳ hiện tại song song (nếu có)
        if (currentSemesterIdFromSchedule) {
          try {
            const semesterWithGrades = danhSachHocKy.find(hk => hk.id === currentSemesterIdFromSchedule);
            
            if (semesterWithGrades) {
              const currentSemesterGPAData = await apiHandler.getDiemTrungBinhHocKy(currentSemesterIdFromSchedule);
              
              if (currentSemesterGPAData && currentSemesterGPAData.length > 0) {
                const gpaValue = Number.parseFloat(currentSemesterGPAData[0].diemTrungBinhHe4_HocKy);
                if (!isNaN(gpaValue) && gpaValue > 0) {
                  currentSemesterGPA = gpaValue;
                }
              }
            }
          } catch (err) {
            console.error("Error fetching current semester GPA:", err);
          }
        }

        setData({
          tongket,
          svInfo,
          classData,
          gpaTongKet,
          subjectScoreCount,
          currentSemesterGPA,
          fullSchedule
        });
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Có lỗi xảy ra khi tải dữ liệu");
        setData({
          tongket: { soKyDaHoc: 0, diemTrungBinhHe4TichLuy: "0", tongSoTinChiTichLuy: "0" },
          svInfo: {} as SinhVienResponse,
          classData: {} as LopDaoTaoResponse,
          gpaTongKet: [],
          subjectScoreCount: {
            [SubjectScore.A_plus]: 0,
            [SubjectScore.A]: 0,
            [SubjectScore.B_plus]: 0,
            [SubjectScore.B]: 0,
            [SubjectScore.C_plus]: 0,
            [SubjectScore.C]: 0,
            [SubjectScore.D_plus]: 0,
            [SubjectScore.D]: 0,
            [SubjectScore.F]: 0
          },
          currentSemesterGPA: null,
          fullSchedule: []
        } as HomeData);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  // Filter schedule khi selectedDate thay đổi
  useEffect(() => {
    if (!data?.fullSchedule || !selectedDate) return;

    // API trả về ngayTrongTuan là số string: "1" = Thứ 2, "2" = Thứ 3, ...
    const dayToApiMap: Record<number, string> = {
      0: "0", // Chủ nhật (có thể là "0" hoặc "7")
      1: "1", // Thứ 2
      2: "2", // Thứ 3
      3: "3", // Thứ 4
      4: "4", // Thứ 5
      5: "5", // Thứ 6
      6: "6"  // Thứ 7
    };

    const dayNameMap: Record<number, string> = {
      0: "Chủ nhật",
      1: "Thứ 2", 
      2: "Thứ 3",
      3: "Thứ 4",
      4: "Thứ 5",
      5: "Thứ 6",
      6: "Thứ 7"
    };

    const selectedDay = selectedDate.getDay();
    const apiDayValue = dayToApiMap[selectedDay];
    
    const filtered = data.fullSchedule
      .filter(item => item.ngayTrongTuan === apiDayValue || (selectedDay === 0 && item.ngayTrongTuan === "7"))
      .sort((a, b) => Number(a.tietBatDau) - Number(b.tietBatDau));
    
    setDisplaySchedule(filtered);
    console.log("Ngày đã chọn:", selectedDate.toLocaleDateString("vi-VN"), "-", dayNameMap[selectedDay], `(API value: ${apiDayValue})`, "- Số môn:", filtered.length);
  }, [selectedDate, data?.fullSchedule]);

  if (loading) {
    return <div className="w-full space-y-2 mr-2 mt-2 mb-2"></div>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 dark:from-gray-900 dark:via-blue-950/30 dark:to-indigo-950/20">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 text-lg font-medium animate-pulse">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-3xl p-8 shadow-2xl">
          <div className="text-center">
            <div className="text-red-400 text-6xl mb-4">⚠️</div>
            <h2 className="text-red-700 dark:text-red-300 text-xl font-semibold mb-2">Có lỗi xảy ra</h2>
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const { tongket, gpaTongKet, svInfo, classData, subjectScoreCount, currentSemesterGPA } = data;

  return (
  <div className="w-full min-h-screen px-4 md:px-6 py-3 pt-16 bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 dark:from-gray-900 dark:via-blue-950/30 dark:to-indigo-950/20">
      
      {/* Student Info Card - Simple & Clean */}
      <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-[24px] p-6 md:p-7 shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50 mb-6 border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-16 h-16 bg-white dark:bg-gray-700 rounded-[18px] flex items-center justify-center p-3 shadow-lg shadow-gray-300/50 dark:shadow-gray-900/50 flex-shrink-0 border border-gray-100 dark:border-gray-600">
              <Image
                src={donViLogo[svInfo.guidDonVi]}
                width={48}
                height={48}
                alt="Logo"
                className="object-contain"
              />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                Xin chào, {svInfo.hoVaTen}! 👋
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">MSV: {svInfo.maSinhVien}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full md:w-auto">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-[14px] px-4 py-2.5 border border-blue-100 dark:border-blue-800/30">
              <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-0.5">Đơn vị</p>
              <p className="text-sm text-gray-900 dark:text-white font-bold truncate">{donVi.find((dv) => dv.guid === svInfo.guidDonVi)?.tenDonVi}</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-[14px] px-4 py-2.5 border border-purple-100 dark:border-purple-800/30">
              <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-0.5">Ngành</p>
              <p className="text-sm text-gray-900 dark:text-white font-bold truncate">{nganhDaoTao.find((ndt) => ndt.id === svInfo.idNganhDaoTao && ndt.guidDonVi === svInfo.guidDonVi)?.ten}</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-[14px] px-4 py-2.5 border border-green-100 dark:border-green-800/30 col-span-2 md:col-span-1">
              <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-0.5">Lớp</p>
              <p className="text-sm text-gray-900 dark:text-white font-bold truncate">{classData.ten}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards - Inline với Icon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-4 mb-6">
        {/* Card 1: Số kỳ đã học */}
        <div className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-[20px] p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 dark:border-gray-700">
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-gradient-to-br from-blue-400/10 to-cyan-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-[14px] flex items-center justify-center shadow-md shadow-blue-500/30 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-0.5">Kỳ đã học</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{tongket.soKyDaHoc}</p>
            </div>
          </div>
        </div>

        {/* Card 2: Điểm TB tích lũy */}
        <div className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-[20px] p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 dark:border-gray-700">
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-gradient-to-br from-purple-400/10 to-pink-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-[14px] flex items-center justify-center shadow-md shadow-purple-500/30 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-0.5">GPA tích lũy</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{tongket.diemTrungBinhHe4TichLuy}</p>
            </div>
          </div>
        </div>

        {/* Card 3: Tín chỉ tích lũy */}
        <div className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-[20px] p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 dark:border-gray-700">
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-gradient-to-br from-green-400/10 to-emerald-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-[14px] flex items-center justify-center shadow-md shadow-green-500/30 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-0.5">Tín chỉ</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{tongket.tongSoTinChiTichLuy}</p>
            </div>
          </div>
        </div>

        {/* Card 4: GPA kỳ hiện tại */}
        <div className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-[20px] p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 dark:border-gray-700">
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-gradient-to-br from-amber-400/10 to-orange-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-[14px] flex items-center justify-center shadow-md shadow-amber-500/30 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-0.5">GPA kỳ này</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">
                {currentSemesterGPA ? currentSemesterGPA.toFixed(2) : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="bg-white dark:bg-gray-800 rounded-[24px] p-6 shadow-xl mb-6 border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-5 gap-4 pb-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex flex-col gap-1.5">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-[14px] flex items-center justify-center shadow-lg shadow-blue-500/30">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              Lịch học
            </h2>
            {selectedDate && (
              <p className="text-sm text-gray-600 dark:text-gray-400 ml-14 font-medium">
                {selectedDate.toLocaleDateString("vi-VN", { 
                  weekday: "long", 
                  year: "numeric", 
                  month: "long", 
                  day: "numeric" 
                })}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedDate(new Date())}
              className="px-5 py-2.5 text-sm font-semibold bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-[14px] transition-all duration-300 shadow-md shadow-blue-500/30 hover:shadow-lg hover:shadow-blue-500/40 hover:-translate-y-0.5"
            >
              Hôm nay
            </button>
            <DatePicker 
              date={selectedDate} 
              setDate={setSelectedDate}
              className="text-sm font-semibold border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-[14px] transition-all duration-300 shadow-sm"
            />
          </div>
        </div>
        {displaySchedule && displaySchedule.length > 0 ? (
          <div className="space-y-4">
            {displaySchedule.map((schedule, index) => (
              <div key={index}>
                <div className="group relative overflow-hidden bg-gray-50 dark:bg-gray-700/50 rounded-[18px] p-5 border border-gray-100 dark:border-gray-600 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-[14px] flex items-center justify-center shadow-md shadow-indigo-500/30 flex-shrink-0">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base text-gray-900 dark:text-gray-100 mb-3">
                        {schedule.tenHocPhan}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-[10px] flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <span className="truncate font-medium">{schedule.giangVien1 || "Chưa có thông tin"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-[10px] flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <span className="font-medium">Tiết {schedule.tietBatDau} - {schedule.tietKetThuc}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-[10px] flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <span className="truncate font-medium">{schedule.diaChi} - {schedule.tenPhong}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-[10px] flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                          </div>
                          <span className="font-medium">Nhóm {schedule.nhom}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Separator between schedule items */}
                {index < displaySchedule.length - 1 && (
                  <div className="my-4 relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-white dark:bg-gray-800 px-3 text-xs text-gray-400">•</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-[24px] flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-4xl">📅</span>
            </div>
            <p className="text-base font-semibold text-gray-600 dark:text-gray-400">
              Ngày này không có lịch học
            </p>
          </div>
        )}
      </div>

      {/* Charts - Apple style */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-[28px] p-6 shadow-lg shadow-blue-500/10 dark:shadow-blue-500/5 hover:shadow-xl transition-all duration-500 border border-white/20 dark:border-gray-700/50">
          <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-5 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-[14px] flex items-center justify-center shadow-lg shadow-blue-500/30">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            Điểm GPA theo học kỳ
          </h3>
          <GPAChart data={gpaTongKet} />
        </div>

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-[28px] p-6 shadow-lg shadow-purple-500/10 dark:shadow-purple-500/5 hover:shadow-xl transition-all duration-500 border border-white/20 dark:border-gray-700/50">
          <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent mb-5 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-[14px] flex items-center justify-center shadow-lg shadow-purple-500/30">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
            </div>
            Thống kê điểm môn học
          </h3>
          <SubjectScoreChart data={subjectScoreCount} />
        </div>
      </div>
    </div>
  );
}
