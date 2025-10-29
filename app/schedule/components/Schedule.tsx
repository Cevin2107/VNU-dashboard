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
} from "@/components/ui/popover"
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
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DatePicker } from "@/components/ui/date-picker";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckedState } from "@radix-ui/react-checkbox";
import { BadgeQuestionMark } from "lucide-react";
import { useState } from "react";
import { toCalendar } from "@/lib/to_ical";
import Timetable from "./Timetable";
import { ThoiKhoaBieuResponse } from "@/types/ResponseTypes";
import { defaultPeriodTime, PeriodTime } from "@/lib/constants";
import { getScheduleFromSemester, saveCustomPeriodTime } from "../actions";

export default function Schedule({ data, customPeriodTime = defaultPeriodTime}: { data: { id: string, tenHocKy: string }[], customPeriodTime?: PeriodTime[] }) {
	const [loading, setLoading] = useState<boolean>(false);
	const [selectedId, setSelectedId] = useState<string>("");
	const [currentHocKy, setCurrentHocKy] = useState<ThoiKhoaBieuResponse[] | null>(null);
	const [periodTime, setPeriodTime] = useState<PeriodTime[]>(customPeriodTime);
	const [exportOpen, setExportOpen] = useState<boolean>(false);
	const [startDate, setStartDate] = useState<Date | undefined>(undefined);
	const [totalWeeks, setTotalWeeks] = useState<number>(1);
	const [exportError, setExportError] = useState<string | null>(null);
	const [save, setSave] = useState<CheckedState>(false);

	function handleCustomPeriodTime() {
		if (save) {
			saveCustomPeriodTime(periodTime);
		}
		console.log(periodTime)
	}
	
	function handleResetPeriodTime() {
		const newPeriodTime = defaultPeriodTime.map(period => ({ ...period }));
		setPeriodTime(newPeriodTime); // Create new objects to force re-render wtf!!!!!!!!!
		saveCustomPeriodTime(defaultPeriodTime);
	}

	function handleExport() {
		setExportError(null);
		if (!startDate) {
			setExportError("Vui lòng chọn ngày bắt đầu và kết thúc học kỳ hợp lệ.");
			return;
		}
		try {
			const icsContent = toCalendar(currentHocKy!, startDate, totalWeeks, periodTime);
			
			// Create blob and download
			const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
			const link = document.createElement('a');
			link.href = URL.createObjectURL(blob);
			link.download = `thoikhoabieu_${selectedId}.ics`;
			document.body.appendChild(link);
			link.click();
			URL.revokeObjectURL(link.href);
			document.body.removeChild(link);
			
			setExportOpen(false);
		} catch {
			setExportError("Đã xảy ra lỗi khi xuất thời khóa biểu. Vui lòng thử lại sau.");
		}
	}

	// if i change id before fetching schedule, timetable will render first
	// while currentHocKy is null
	async function handleSemesterChange(id: string) {
		setLoading(true);
		setCurrentHocKy(null);
		setCurrentHocKy(await getScheduleFromSemester(id));
		setLoading(false);
		setSelectedId(id);
	}

	return (
		<div className="w-full min-h-screen px-4 md:px-6 py-3 pt-16 bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 dark:from-gray-900 dark:via-blue-950/30 dark:to-indigo-950/20">
			{/* Page Header */}
			<div className="mb-6">
				<h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
					Thời Khóa Biểu 📅
				</h1>
				<p className="text-sm text-gray-600 dark:text-gray-400">
					Xem và quản lý lịch học theo tuần
				</p>
			</div>

			<div className="bg-white dark:bg-gray-800 rounded-[24px] p-6 shadow-xl mb-6 border border-gray-100 dark:border-gray-700">
				<Select onValueChange={handleSemesterChange}>
					<SelectTrigger className="w-full rounded-[14px] border-2 border-gray-200 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 transition-colors text-base py-6">
						<SelectValue placeholder="Chọn học kỳ" />
					</SelectTrigger>
					<SelectContent>
						{data.map((hocKy) => (
							<SelectItem key={hocKy.id} value={hocKy.id}>
								{hocKy.tenHocKy}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				{currentHocKy && (
					<div className="flex flex-wrap items-center gap-3 mt-6">
						<Dialog>
							<DialogTrigger asChild>
								<Button className="rounded-[14px] text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-5 py-2.5">
									⏰ Đổi thời gian tiết học
								</Button>
							</DialogTrigger>
							<DialogContent className="max-w-md rounded-[24px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
								<DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
									Đổi thời gian tiết học
								</DialogTitle>
								<Separator className="bg-gray-200 dark:bg-gray-700" />
								<div className="space-y-3">
									<div className="grid grid-cols-3 gap-2 font-bold text-xs text-gray-700 dark:text-gray-300">
										<Label></Label>
										<Label>Bắt đầu</Label>
										<Label>Kết thúc</Label>
									</div>
									{periodTime.map((period, index) => (
										<div key={index} className="grid grid-cols-3 gap-2 items-center">
											<Label className="text-xs font-medium">
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
												className="px-2 py-1 text-xs glass-input border border-gray-300 dark:border-gray-600 rounded-lg"
											/>
											<Input
												type="time"
												value={period.end}
												onChange={(e) => {
													const newPeriodTime = [...periodTime];
													newPeriodTime[index].end = e.target.value;
													setPeriodTime(newPeriodTime);
												}}
												className="px-2 py-1 text-xs glass-input border border-gray-300 dark:border-gray-600 rounded-lg"
											/>
										</div>
									))}
								</div>
								<div className="flex items-center space-x-2">
									<Checkbox checked={save} onCheckedChange={setSave} className="border border-gray-300 dark:border-gray-600 rounded"/>
									<Label className="text-xs">Lưu thời gian biểu đã sửa</Label>
								</div>
								<DialogFooter className="gap-2">
									<Button className="bg-red-600 hover:bg-red-700 rounded-[14px] text-sm font-semibold" onClick={handleResetPeriodTime}>
										Đặt lại mặc định
									</Button>
									<DialogClose asChild>
										<Button className="rounded-[14px] text-sm font-semibold bg-blue-600 hover:bg-blue-700" onClick={handleCustomPeriodTime}>
											Xác nhận
										</Button>
									</DialogClose>
								</DialogFooter>
							</DialogContent>
						</Dialog>
						<Popover open={exportOpen} onOpenChange={setExportOpen}>
							<PopoverTrigger asChild>
								<Button className="rounded-[14px] text-sm font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 px-5 py-2.5">
									📤 Xuất thời khóa biểu
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-full p-4 space-y-4 rounded-[18px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700" align="start">
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2 w-full">
										<Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Ngày bắt đầu học kì</Label>
										<DatePicker date={startDate} setDate={setStartDate} className="text-sm border-2 border-gray-200 dark:border-gray-600 hover:border-green-500 dark:hover:border-green-500 w-full justify-between rounded-[14px]" />
									</div>
									<div className="space-y-2 w-full">
										<Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Số tuần học</Label>
										<Input type="number" 
											min={1} max={99} step={1} 
											value={totalWeeks} 
											onChange={(e) => { setTotalWeeks(Number.parseInt(e.target.value)) }} 
											className="rounded-[14px] text-sm border-2 border-gray-200 dark:border-gray-600"
										/>
									</div>
								</div>
								{exportError && (
									<div className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-[14px] border border-red-200 dark:border-red-800">
										{exportError}
									</div>
								)}
								<Button onClick={handleExport} className="w-full rounded-[14px] text-sm font-semibold bg-green-600 hover:bg-green-700">Xuất file .ics</Button>
							</PopoverContent>
						</Popover>
						<Tooltip>
							<TooltipTrigger>
								<BadgeQuestionMark className="hover:text-blue-600 dark:hover:text-blue-400 w-6 h-6 text-gray-500 dark:text-gray-400"/>
							</TooltipTrigger>
							<TooltipContent align="start" side="right" className="rounded-[14px] text-sm max-w-xs">
								Xuất file .ics có thể import vào các ứng dụng lịch như Google Calendar, Apple Calendar, Outlook, etc...
							</TooltipContent>
						</Tooltip>
					</div>
				)}
			</div>
			{currentHocKy ? (
				<ScrollArea className="h-[calc(100vh-14rem)] w-full rounded-[24px] [&>[data-slot=scroll-area-scrollbar]]:hidden">
					<Timetable data={currentHocKy!} periodTime={periodTime}/>
				</ScrollArea>
			) : loading && (
				<div className="flex items-center justify-center h-[calc(100vh-14rem)] bg-white dark:bg-gray-800 rounded-[24px] border border-gray-100 dark:border-gray-700">
					<div className="flex flex-col items-center gap-4">
						<div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
						<span className="text-base font-semibold text-gray-600 dark:text-gray-400">Đang tải thời khóa biểu...</span>
					</div>
				</div>
			)}
		</div>
	);
}