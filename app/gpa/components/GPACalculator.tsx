"use client";

import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ClientAPIHandler } from "@/lib/ClientAPIHandler";

type CalculationMode = "current-semester" | "cumulative" | "academic-year" | "custom-semesters" | "desired-gpa";

interface SemesterData {
	id: string;
	ten: string;
	nam: string;
	gpa: number;
	credits: number;
}

export default function GPACalculator() {
	const [mode, setMode] = useState<CalculationMode>("cumulative");
	const [loading, setLoading] = useState(false);
	const [semesters, setSemesters] = useState<SemesterData[]>([]);
	const [selectedSemesterId, setSelectedSemesterId] = useState<string>("");
	const [selectedSemesterIds, setSelectedSemesterIds] = useState<string[]>([]);
	const [result, setResult] = useState<any>(null);
	const [desiredGPA, setDesiredGPA] = useState<string>("3.5");
	const [remainingCredits, setRemainingCredits] = useState<string>("30");

	useEffect(() => {
		loadSemesters();
	}, []);

	const loadSemesters = async () => {
		try {
			const accessToken = sessionStorage.getItem("accessToken");
			const refreshToken = sessionStorage.getItem("refreshToken");
			if (!accessToken) return;

			const apiHandler = new ClientAPIHandler(accessToken, refreshToken);
			const danhSachHocKy = await apiHandler.getDanhSachHocKyTheoDiem();
			
			// Fetch GPA for each semester
			const semestersWithGPA = await Promise.all(
				danhSachHocKy.map(async (hk: { id: string; ten: string; nam: string }) => {
					try {
						const gpaData = await apiHandler.getDiemTrungBinhHocKy(hk.id);
						const diemData = await apiHandler.getDiemThiHocKy(hk.id);
						
						const gpa = gpaData && gpaData.length > 0 
							? parseFloat(gpaData[0].diemTrungBinhHe4_HocKy) 
							: 0;
						
						const credits = diemData.reduce((sum: number, d: { soTinChi: string }) => sum + (parseFloat(d.soTinChi) || 0), 0);
						
						return {
							id: hk.id,
							ten: hk.ten,
							nam: hk.nam,
							gpa,
							credits
						};
					} catch {
						return {
							id: hk.id,
							ten: hk.ten,
							nam: hk.nam,
							gpa: 0,
							credits: 0
						};
					}
				})
			);

			setSemesters(semestersWithGPA.filter((s: SemesterData) => s.gpa > 0));
		} catch (error) {
			console.error("Error loading semesters:", error);
		}
	};

	const calculateGPA = () => {
		setLoading(true);
		setTimeout(() => {
			let calculationResult: {
				type: string;
				gpa?: string;
				totalCredits?: number;
				semesters?: number;
				details?: unknown[];
				years?: { year: string; gpa: string; credits: number; semesters: number }[];
				requiredGPA?: number;
				remainingCredits?: number;
			} | null = null;

			switch (mode) {
				case "cumulative":
					calculationResult = calculateCumulativeGPA();
					break;
				case "current-semester":
					calculationResult = calculateCurrentSemesterGPA();
					break;
				case "academic-year":
					calculationResult = calculateAcademicYearGPA();
					break;
				case "custom-semesters":
					calculationResult = calculateCustomSemestersGPA();
					break;
				case "desired-gpa":
					calculationResult = calculateDesiredGPA();
					break;
			}

			setResult(calculationResult);
			setLoading(false);
		}, 500);
	};

	const calculateCumulativeGPA = () => {
		const totalCredits = semesters.reduce((sum, s) => sum + s.credits, 0);
		const weightedSum = semesters.reduce((sum, s) => sum + (s.gpa * s.credits), 0);
		const gpa = totalCredits > 0 ? weightedSum / totalCredits : 0;

		return {
			type: "cumulative",
			gpa: gpa.toFixed(2),
			totalCredits,
			semesters: semesters.length,
			details: semesters.map(s => ({
				name: `HK ${s.ten}/${s.nam}`,
				gpa: s.gpa.toFixed(2),
				credits: s.credits
			}))
		};
	};

	const calculateCurrentSemesterGPA = () => {
		if (!selectedSemesterId) return null;
		const semester = semesters.find(s => s.id === selectedSemesterId);
		if (!semester) return null;

		return {
			type: "current-semester",
			gpa: semester.gpa.toFixed(2),
			credits: semester.credits,
			name: `Học kỳ ${semester.ten} năm học ${semester.nam}`
		};
	};

	const calculateAcademicYearGPA = () => {
		const yearGroups = new Map<string, SemesterData[]>();
		semesters.forEach(s => {
			if (!yearGroups.has(s.nam)) {
				yearGroups.set(s.nam, []);
			}
			yearGroups.get(s.nam)!.push(s);
		});

		const yearGPAs = Array.from(yearGroups.entries()).map(([year, semList]) => {
			const totalCredits = semList.reduce((sum, s) => sum + s.credits, 0);
			const weightedSum = semList.reduce((sum, s) => sum + (s.gpa * s.credits), 0);
			const gpa = totalCredits > 0 ? weightedSum / totalCredits : 0;

			return {
				year,
				gpa: gpa.toFixed(2),
				credits: totalCredits,
				semesters: semList.length
			};
		});

		return {
			type: "academic-year",
			years: yearGPAs.sort((a, b) => b.year.localeCompare(a.year))
		};
	};

	const calculateCustomSemestersGPA = () => {
		if (selectedSemesterIds.length === 0) return null;
		
		const selectedSems = semesters.filter(s => selectedSemesterIds.includes(s.id));
		const totalCredits = selectedSems.reduce((sum, s) => sum + s.credits, 0);
		const weightedSum = selectedSems.reduce((sum, s) => sum + (s.gpa * s.credits), 0);
		const gpa = totalCredits > 0 ? weightedSum / totalCredits : 0;

		return {
			type: "custom-semesters",
			gpa: gpa.toFixed(2),
			totalCredits,
			selectedCount: selectedSems.length,
			details: selectedSems.map(s => ({
				name: `HK ${s.ten}/${s.nam}`,
				gpa: s.gpa.toFixed(2),
				credits: s.credits
			}))
		};
	};

	const calculateDesiredGPA = () => {
		const target = parseFloat(desiredGPA);
		const remaining = parseFloat(remainingCredits);
		
		if (isNaN(target) || isNaN(remaining) || remaining <= 0) return null;

		const currentCredits = semesters.reduce((sum, s) => sum + s.credits, 0);
		const currentWeightedSum = semesters.reduce((sum, s) => sum + (s.gpa * s.credits), 0);
		const currentGPA = currentCredits > 0 ? currentWeightedSum / currentCredits : 0;

		const totalCreditsAfter = currentCredits + remaining;
		const requiredWeightedSum = target * totalCreditsAfter;
		const neededWeightedSum = requiredWeightedSum - currentWeightedSum;
		const neededGPA = neededWeightedSum / remaining;

		const isPossible = neededGPA <= 4.0 && neededGPA >= 0;

		return {
			type: "desired-gpa",
			currentGPA: currentGPA.toFixed(2),
			currentCredits,
			targetGPA: target.toFixed(2),
			remainingCredits: remaining,
			neededGPA: neededGPA.toFixed(2),
			isPossible,
			message: isPossible 
				? `Bạn cần đạt GPA trung bình ${neededGPA.toFixed(2)} trong ${remaining} tín chỉ còn lại`
				: neededGPA > 4.0 
					? "Không thể đạt được - GPA cần đạt vượt quá 4.0"
					: "Không thể đạt được - GPA cần đạt âm"
		};
	};

	const toggleSemesterSelection = (semesterId: string) => {
		setSelectedSemesterIds(prev => 
			prev.includes(semesterId) 
				? prev.filter(id => id !== semesterId)
				: [...prev, semesterId]
		);
	};

	return (
		<div className="space-y-5">
			{/* Control Card - Dashboard Style */}
			<div className="bg-white dark:bg-gray-800 rounded-[24px] p-6 shadow-xl border border-gray-100 dark:border-gray-700">
				<div className="pb-4 mb-5 border-b border-gray-100 dark:border-gray-700">
					<h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
						<div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-[14px] flex items-center justify-center shadow-lg shadow-blue-500/30">
							<span className="text-white text-xl">🎯</span>
						</div>
						Tính toán GPA
					</h2>
				</div>
				<div className="space-y-5">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{/* Mode Selection */}
						<div className="space-y-2">
							<Label className="text-sm font-bold text-gray-900 dark:text-white">Chức năng</Label>
							<Select value={mode} onValueChange={(v) => setMode(v as CalculationMode)}>
								<SelectTrigger className="h-11 font-medium shadow-sm">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="cumulative">📊 GPA tích lũy</SelectItem>
									<SelectItem value="current-semester">📅 GPA một kỳ</SelectItem>
									<SelectItem value="academic-year">📚 GPA năm học</SelectItem>
									<SelectItem value="custom-semesters">✅ GPA tự chọn</SelectItem>
									<SelectItem value="desired-gpa">🎯 GPA cần đạt</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{/* Conditional Inputs */}
						{mode === "current-semester" && (
							<div className="space-y-2 md:col-span-2 lg:col-span-1">
								<Label className="text-sm font-bold text-gray-900 dark:text-white">Chọn học kỳ</Label>
								<Select value={selectedSemesterId} onValueChange={setSelectedSemesterId}>
									<SelectTrigger className="h-11 font-medium shadow-sm">
										<SelectValue placeholder="Chọn học kỳ" />
									</SelectTrigger>
									<SelectContent>
										{semesters.map(s => (
											<SelectItem key={s.id} value={s.id}>Học kỳ {s.ten} - {s.nam}</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						)}

						{mode === "desired-gpa" && (
							<>
								<div className="space-y-2">
									<Label className="text-sm font-bold text-gray-900 dark:text-white">GPA mục tiêu</Label>
									<Input 
										type="number" 
										step="0.01" 
										min="0" 
										max="4" 
										value={desiredGPA}
										onChange={(e) => setDesiredGPA(e.target.value)}
										placeholder="3.5"
										className="h-11 font-medium shadow-sm"
									/>
								</div>
								<div className="space-y-2">
									<Label className="text-sm font-bold text-gray-900 dark:text-white">Tín chỉ còn lại</Label>
									<Input 
										type="number" 
										step="1" 
										min="1" 
										value={remainingCredits}
										onChange={(e) => setRemainingCredits(e.target.value)}
										placeholder="30"
										className="h-11 font-medium shadow-sm"
									/>
								</div>
							</>
						)}

						{/* Calculate Button */}
						<div className={`space-y-2 ${mode === "current-semester" || mode === "desired-gpa" ? "lg:col-span-1" : "md:col-span-2 lg:col-span-2"}`}>
							<Label className="text-sm font-bold text-gray-900 dark:text-white opacity-0">Action</Label>
							<Button 
								onClick={calculateGPA} 
								disabled={loading}
								className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all font-bold text-base"
							>
								{loading ? "⏳ Đang tính..." : "✨ Tính toán"}
							</Button>
						</div>
					</div>

					{/* Custom Semesters Selection */}
					{mode === "custom-semesters" && (
						<div className="pt-6 border-t-2 border-gray-200 dark:border-gray-700">
							<Label className="text-sm font-bold text-gray-900 dark:text-white mb-4 block">Chọn các học kỳ</Label>
							<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
								{semesters.map(s => (
									<div key={s.id} className="flex items-center gap-2 p-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border border-gray-200 dark:border-gray-700">
										<Checkbox 
											checked={selectedSemesterIds.includes(s.id)}
											onCheckedChange={() => toggleSemesterSelection(s.id)}
											id={s.id}
										/>
										<Label htmlFor={s.id} className="text-sm cursor-pointer font-semibold">
											HK {s.ten}/{s.nam}
										</Label>
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Results Card - Dashboard Style */}
			{result && (
				<div className="bg-white dark:bg-gray-800 rounded-[24px] p-6 shadow-xl border border-gray-100 dark:border-gray-700">
					<div className="pb-4 mb-5 border-b border-gray-100 dark:border-gray-700">
						<h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
							<div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-[14px] flex items-center justify-center shadow-lg shadow-green-500/30">
								<span className="text-white text-xl">📊</span>
							</div>
							Kết quả
						</h2>
					</div>
					<div>
						{result.type === "cumulative" && (
							<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
								{/* Main GPA Card */}
								<div className="lg:col-span-2 group relative overflow-hidden bg-gradient-to-br from-blue-500 to-purple-500 rounded-[20px] p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
									<div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
									<div className="relative">
										<div className="text-sm font-semibold text-white/80 mb-2 uppercase tracking-wide">GPA Tích lũy</div>
										<div className="text-6xl font-black text-white mb-4 drop-shadow-lg">{result.gpa}</div>
										<div className="flex items-center gap-2 text-white/90">
											<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
											</svg>
											<span className="text-sm font-semibold">{result.semesters} học kỳ</span>
										</div>
									</div>
								</div>
								
								{/* Stats Card */}
								<div className="space-y-4">
									<div className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-[20px] p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 dark:border-gray-700">
										<div className="absolute -top-10 -right-10 w-24 h-24 bg-gradient-to-br from-green-400/10 to-emerald-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
										<div className="relative flex items-center gap-3">
											<div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-[14px] flex items-center justify-center shadow-md shadow-green-500/30 flex-shrink-0">
												<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
												</svg>
											</div>
											<div className="flex-1">
												<p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-0.5">Tổng tín chỉ</p>
												<p className="text-3xl font-black text-gray-900 dark:text-white">{result.totalCredits}</p>
											</div>
										</div>
									</div>
								</div>
							</div>
						)}

						{result.type === "current-semester" && (
							<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
								{/* Main GPA Card */}
								<div className="group relative overflow-hidden bg-gradient-to-br from-green-500 to-emerald-500 rounded-[20px] p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
									<div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
									<div className="relative">
										<div className="text-sm font-semibold text-white/80 mb-2 uppercase tracking-wide">{result.name}</div>
										<div className="text-6xl font-black text-white mb-4 drop-shadow-lg">{result.gpa}</div>
									</div>
								</div>
								
								{/* Credits Card */}
								<div className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-[20px] p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 dark:border-gray-700">
									<div className="absolute -top-10 -right-10 w-24 h-24 bg-gradient-to-br from-blue-400/10 to-cyan-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
									<div className="relative flex items-center gap-3">
										<div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-[14px] flex items-center justify-center shadow-md shadow-blue-500/30 flex-shrink-0">
											<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
											</svg>
										</div>
										<div className="flex-1">
											<p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-0.5">Tín chỉ</p>
											<p className="text-3xl font-black text-gray-900 dark:text-white">{result.credits}</p>
										</div>
									</div>
								</div>
							</div>
						)}

						{result.type === "academic-year" && (
							<div className="space-y-4">
								{result.years?.map((year: { year: string; gpa: string; credits: number; semesters: number }) => (
									<div key={year.year} className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-[20px] p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 dark:border-gray-700">
										<div className="absolute -top-10 -right-10 w-24 h-24 bg-gradient-to-br from-purple-400/10 to-pink-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
										<div className="relative flex items-center justify-between">
											<div className="flex items-center gap-3">
												<div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-[14px] flex items-center justify-center shadow-md shadow-purple-500/30 flex-shrink-0">
													<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
													</svg>
												</div>
												<div>
													<p className="text-lg font-black text-gray-900 dark:text-white">Năm học {year.year}</p>
													<p className="text-sm font-semibold text-gray-600 dark:text-gray-400">{year.semesters} học kỳ • {year.credits} tín chỉ</p>
												</div>
											</div>
											<div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-purple-600 to-pink-600">{year.gpa}</div>
										</div>
									</div>
								))}
							</div>
						)}

						{result.type === "custom-semesters" && (
							<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
								<div className="group relative overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 rounded-[20px] p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
									<div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
									<div className="relative">
										<div className="text-sm font-semibold text-white/80 mb-2 uppercase tracking-wide">GPA {result.selectedCount} kỳ đã chọn</div>
										<div className="text-6xl font-black text-white mb-4 drop-shadow-lg">{result.gpa}</div>
									</div>
								</div>
								
								<div className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-[20px] p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 dark:border-gray-700">
									<div className="absolute -top-10 -right-10 w-24 h-24 bg-gradient-to-br from-purple-400/10 to-pink-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
									<div className="relative flex items-center gap-3">
										<div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-[14px] flex items-center justify-center shadow-md shadow-purple-500/30 flex-shrink-0">
											<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
											</svg>
										</div>
										<div className="flex-1">
											<p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-0.5">Tổng tín chỉ</p>
											<p className="text-3xl font-black text-gray-900 dark:text-white">{result.totalCredits}</p>
										</div>
									</div>
								</div>
							</div>
						)}

						{result.type === "desired-gpa" && (
							<div className="space-y-4">
								{/* Message Card */}
								<div className={`group relative overflow-hidden rounded-[20px] p-6 shadow-lg border-2 ${
									result.isPossible 
										? "bg-gradient-to-br from-green-500 to-emerald-500 border-green-400" 
										: "bg-gradient-to-br from-red-500 to-rose-500 border-red-400"
								}`}>
									<div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
									<div className="relative">
										<div className="text-lg font-black text-white mb-2">
											{result.message}
										</div>
										{result.isPossible && (
											<div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
												<span className="text-sm font-semibold text-white/90">GPA cần đạt:</span>
												<span className="text-2xl font-black text-white">{result.neededGPA}</span>
											</div>
										)}
									</div>
								</div>
								
								{/* Stats Cards */}
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-[20px] p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 dark:border-gray-700">
										<div className="absolute -top-10 -right-10 w-24 h-24 bg-gradient-to-br from-blue-400/10 to-cyan-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
										<div className="relative flex items-center gap-3">
											<div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-[14px] flex items-center justify-center shadow-md shadow-blue-500/30 flex-shrink-0">
												<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
												</svg>
											</div>
											<div className="flex-1">
												<p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-0.5">GPA hiện tại</p>
												<p className="text-3xl font-black text-gray-900 dark:text-white">{result.currentGPA}</p>
												<p className="text-sm font-semibold text-gray-600 dark:text-gray-400">{result.currentCredits} tín chỉ</p>
											</div>
										</div>
									</div>
									
									<div className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-[20px] p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 dark:border-gray-700">
										<div className="absolute -top-10 -right-10 w-24 h-24 bg-gradient-to-br from-purple-400/10 to-pink-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
										<div className="relative flex items-center gap-3">
											<div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-[14px] flex items-center justify-center shadow-md shadow-purple-500/30 flex-shrink-0">
												<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
												</svg>
											</div>
											<div className="flex-1">
												<p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-0.5">Mục tiêu</p>
												<p className="text-3xl font-black text-gray-900 dark:text-white">{result.targetGPA}</p>
												<p className="text-sm font-semibold text-gray-600 dark:text-gray-400">{result.remainingCredits} tín chỉ còn lại</p>
											</div>
										</div>
									</div>
								</div>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
