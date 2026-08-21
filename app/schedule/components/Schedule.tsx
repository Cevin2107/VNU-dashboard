'use client';

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
	Dialog, 
	DialogClose, 
	DialogContent, 
	DialogFooter, 
	DialogTitle, 
	DialogTrigger 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckedState } from "@radix-ui/react-checkbox";
import { RefreshCw, Calendar, Download, Clock, HelpCircle, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { toCalendar } from "@/lib/to_ical";
import Timetable from "./Timetable";
import GoogleSyncModal from "./GoogleSyncModal";
import { ThoiKhoaBieuResponse } from "@/types/ResponseTypes";
import { defaultPeriodTime, PeriodTime } from "@/lib/constants";
import { saveCustomPeriodTime } from "../actions";
import { useRouter } from "next/navigation";
import { ClientAPIHandler } from "@/lib/ClientAPIHandler";

export default function Schedule({ data, customPeriodTime = defaultPeriodTime }: { data: { id: string, tenHocKy: string }[], customPeriodTime?: PeriodTime[] }) {
	const router = useRouter();
	const [loading, setLoading] = useState<boolean>(false);
	const [selectedId, setSelectedId] = useState<string>("");
	const [currentHocKy, setCurrentHocKy] = useState<ThoiKhoaBieuResponse[] | null>(null);
	const [periodTime, setPeriodTime] = useState<PeriodTime[]>(customPeriodTime);
	const [exportOpen, setExportOpen] = useState<boolean>(false);
	const [startDate, setStartDate] = useState<Date | undefined>(undefined);
	const [totalWeeks, setTotalWeeks] = useState<number>(15);
	const [exportError, setExportError] = useState<string | null>(null);
	const [save, setSave] = useState<CheckedState>(false);
	const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

	useEffect(() => {
		if (data && data.length > 0 && !selectedId) {
			const sortedSemesters = [...data].sort((a, b) => Number(b.id) - Number(a.id));
			const currentSemester = sortedSemesters[0];
			handleSemesterChange(currentSemester.id);
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data]);

	function handleCustomPeriodTime() {
		if (save) {
			saveCustomPeriodTime(periodTime);
		}
	}
	
	function handleResetPeriodTime() {
		const newPeriodTime = defaultPeriodTime.map(period => ({ ...period }));
		setPeriodTime(newPeriodTime);
		saveCustomPeriodTime(defaultPeriodTime);
	}

	function handleExport() {
		setExportError(null);
		if (!startDate) {
			setExportError("Vui lòng chọn ngày bắt đầu học kỳ.");
			return;
		}
		try {
			const icsContent = toCalendar(currentHocKy!, startDate, totalWeeks, periodTime);
			
			const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
			const link = document.createElement('a');
			link.href = URL.createObjectURL(blob);
			link.download = `thoikhoabieu_${selectedId}.ics`;
			document.body.appendChild(link);
			link.click();
			URL.revokeObjectURL(link.href);
			document.body.removeChild(link);
			
			setExportOpen(false);
		} catch (err: unknown) {
			console.error("Export error:", err);
			setExportError("Đã xảy ra lỗi khi tạo file lịch .ics");
		}
	}

	async function handleSemesterChange(id: string) {
		setLoading(true);
		setCurrentHocKy(null);
		try {
			const accessToken = sessionStorage.getItem("accessToken");
			const refreshToken = sessionStorage.getItem("refreshToken");

			if (!accessToken) {
				router.replace("/login");
				return;
			}

			const apiHandler = new ClientAPIHandler(accessToken, refreshToken);
			const schedule = await apiHandler.getThoiKhoaBieuHocKy(id);
			setCurrentHocKy(schedule);
			setSelectedId(id);
		} finally {
			setLoading(false);
		}
	}

	function handleRefresh() {
		setIsRefreshing(true);
		router.refresh();
		setTimeout(() => {
			setIsRefreshing(false);
		}, 1000);
	}

	return (
		<div className="w-full min-h-screen px-3 sm:px-6 md:px-8 py-4 sm:py-6 pt-18 sm:pt-20 bg-[#f2f0eb]">
			{/* Starbucks Controls Header */}
			<div className="surface-card p-4 sm:p-6 mb-4 sm:mb-6 rounded-2xl sm:rounded-3xl border border-slate-200/80">
				<div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3.5 sm:gap-4">
					
					{/* Title & Semester Selector */}
					<div className="flex items-center gap-3 sm:gap-4 flex-1 w-full md:w-auto">
						<div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#006241] rounded-2xl flex items-center justify-center text-white font-bold flex-shrink-0 shadow-md">
							<Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
						</div>
						<div className="flex-1 min-w-0">
							<h1 className="text-lg sm:text-xl md:text-2xl font-black text-[#006241] tracking-tight">Thời Khóa Biểu</h1>
							<Select onValueChange={handleSemesterChange} value={selectedId || undefined}>
								<SelectTrigger className="w-full max-w-sm rounded-full border border-slate-200 bg-white text-xs font-bold py-1.5 sm:py-2 mt-0.5 sm:mt-1 focus:ring-2 focus:ring-[#00754A]">
									<SelectValue placeholder="Chọn học kỳ..." />
								</SelectTrigger>
								<SelectContent className="rounded-2xl border border-slate-200">
									{data.map((hocKy) => (
										<SelectItem key={hocKy.id} value={hocKy.id} className="text-xs font-bold py-2">
											{hocKy.tenHocKy}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					{/* Action Pill Buttons */}
					{currentHocKy && (
						<div className="flex flex-wrap items-center gap-2 sm:gap-2.5 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
							<Button 
								onClick={handleRefresh}
								disabled={isRefreshing}
								className="btn-pill text-[11px] sm:text-xs font-bold bg-[#00754A] hover:bg-[#006241] text-white px-3.5 sm:px-4 py-2 h-9 sm:h-10 shadow-xs active:scale-95 flex-1 sm:flex-initial justify-center"
							>
								<RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
								{isRefreshing ? 'Đang tải...' : 'Làm mới'}
							</Button>

							{/* Google Calendar Direct Sync Modal */}
							<GoogleSyncModal 
								schedule={currentHocKy} 
								semesterId={selectedId} 
								periodTime={periodTime} 
							/>

							{/* Custom Period Dialog */}
							<Dialog>
								<DialogTrigger asChild>
									<Button className="btn-pill text-[11px] sm:text-xs font-bold bg-[#1E3932] hover:bg-slate-900 text-white px-3.5 sm:px-4 py-2 h-9 sm:h-10 shadow-xs active:scale-95 flex-1 sm:flex-initial justify-center">
										<Clock className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
										Giờ tiết học
									</Button>
								</DialogTrigger>
								<DialogContent className="w-[calc(100vw-2rem)] max-w-md rounded-2xl sm:rounded-3xl bg-white border border-slate-200 p-5 sm:p-6">
									<DialogTitle className="text-sm sm:text-base font-black text-[#006241] flex items-center gap-2">
										<Clock className="w-4 h-4 text-[#00754A]" /> Đổi Thời Gian Tiết Học
									</DialogTitle>
									<Separator className="my-2.5 bg-slate-200" />
									<div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
										<div className="grid grid-cols-3 gap-2 font-bold text-xs text-slate-500">
											<span>Tiết</span>
											<span>Bắt đầu</span>
											<span>Kết thúc</span>
										</div>
										{periodTime.map((period, index) => (
											<div key={index} className="grid grid-cols-3 gap-2 items-center">
												<Label className="text-xs font-bold text-slate-700">
													Tiết {index + 1}
												</Label>
												<Input
													type="time"
													value={period.start}
													onChange={(e) => {
														const newPeriodTime = [...periodTime];
														newPeriodTime[index].start = e.target.value;
														setPeriodTime(newPeriodTime);
													}}
													className="px-2 py-1 text-xs border border-slate-200 rounded-lg"
												/>
												<Input
													type="time"
													value={period.end}
													onChange={(e) => {
														const newPeriodTime = [...periodTime];
														newPeriodTime[index].end = e.target.value;
														setPeriodTime(newPeriodTime);
													}}
													className="px-2 py-1 text-xs border border-slate-200 rounded-lg"
												/>
											</div>
										))}
									</div>
									<div className="flex items-center space-x-2 pt-2">
										<Checkbox checked={save} onCheckedChange={setSave} className="rounded border-slate-300" />
										<Label className="text-xs font-medium text-slate-600">Lưu cấu hình làm mặc định</Label>
									</div>
									<DialogFooter className="gap-2 mt-4 flex-row justify-end">
										<Button className="btn-pill bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white px-4" onClick={handleResetPeriodTime}>
											Mặc định
										</Button>
										<DialogClose asChild>
											<Button className="btn-pill text-xs font-bold bg-[#00754A] hover:bg-[#006241] text-white px-4" onClick={handleCustomPeriodTime}>
												Lưu thay đổi
											</Button>
										</DialogClose>
									</DialogFooter>
								</DialogContent>
							</Dialog>

							{/* ICS Calendar Export Popover */}
							<Popover open={exportOpen} onOpenChange={setExportOpen}>
								<PopoverTrigger asChild>
									<Button className="btn-pill text-[11px] sm:text-xs font-bold bg-[#00754A] hover:bg-[#006241] text-white px-3.5 sm:px-4 py-2 h-9 sm:h-10 shadow-xs active:scale-95 flex-1 sm:flex-initial justify-center">
										<Download className="w-3.5 h-3.5 mr-1.5" />
										Xuất file .ics
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-80 p-5 space-y-4 rounded-2xl bg-white border border-slate-200 shadow-xl" align="end">
									<div className="space-y-1">
										<h3 className="font-black text-sm text-[#006241] flex items-center gap-1.5">
											<Sparkles className="w-4 h-4 text-[#00754A]" /> Xuất Lịch Sang Calendar
										</h3>
										<p className="text-[11px] text-slate-500">Tạo file `.ics` tương thích Google / Apple Calendar</p>
									</div>
									
									<div className="space-y-3">
										<div className="space-y-1">
											<Label className="text-xs font-bold text-slate-700">Ngày bắt đầu học kỳ</Label>
											<DatePicker date={startDate} setDate={setStartDate} className="text-xs border border-slate-200 rounded-full w-full" />
										</div>
										<div className="space-y-1">
											<Label className="text-xs font-bold text-slate-700">Số tuần học</Label>
											<Input 
												type="number" 
												min={1} 
												max={30} 
												value={totalWeeks} 
												onChange={(e) => setTotalWeeks(Number.parseInt(e.target.value) || 15)} 
												className="rounded-full text-xs border border-slate-200"
											/>
										</div>
									</div>

									{exportError && (
										<div className="text-rose-600 text-xs bg-rose-50 p-2.5 rounded-lg border border-rose-200 font-medium">
											{exportError}
										</div>
									)}

									<Button onClick={handleExport} className="btn-pill w-full text-xs font-bold bg-[#00754A] hover:bg-[#006241] text-white py-2">
										Tải File (.ics)
									</Button>
								</PopoverContent>
							</Popover>

							<Tooltip>
								<TooltipTrigger>
									<HelpCircle className="w-5 h-5 text-slate-400 hover:text-slate-600 transition-colors ml-1" />
								</TooltipTrigger>
								<TooltipContent side="bottom" className="rounded-lg text-xs font-medium max-w-xs">
									File `.ics` cho phép đồng bộ thời khóa biểu trực tiếp vào Google Calendar, Apple Calendar hoặc Outlook.
								</TooltipContent>
							</Tooltip>
						</div>
					)}
				</div>
			</div>

			{/* Timetable View */}
			{loading ? (
				<div className="flex flex-col items-center justify-center h-[50vh] surface-card p-8">
					<div className="w-10 h-10 border-3 border-[#00754A]/30 border-t-[#00754A] rounded-full animate-spin mb-3" />
					<p className="text-xs font-bold text-slate-500 animate-pulse">Đang tải thời khóa biểu...</p>
				</div>
			) : currentHocKy && currentHocKy.length > 0 ? (
				<Timetable data={currentHocKy} periodTime={periodTime} />
			) : (
				<div className="flex flex-col items-center justify-center h-[40vh] surface-card p-6 text-center">
					<Calendar className="w-10 h-10 text-slate-400 mb-2 opacity-60" />
					<h3 className="font-bold text-sm text-slate-700">Chưa có thông tin thời khóa biểu</h3>
					<p className="text-xs text-slate-500 mt-1 max-w-sm">Chọn học kỳ khác hoặc thử làm mới dữ liệu từ cổng thông tin VNU.</p>
				</div>
			)}
		</div>
	);
}