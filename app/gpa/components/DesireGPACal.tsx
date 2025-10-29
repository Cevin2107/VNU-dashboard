"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

function calculateRequiredGPA(credit: number, gpa: number, totalCredit: number, targetGPA: number): number {
	const requiredGPA = ((targetGPA * totalCredit) - (gpa * credit)) / (totalCredit - credit);
	return Number.parseFloat(requiredGPA.toFixed(2));
}

export default function DesireGPACal({credit, gpa}: {
	credit: number;
	gpa: number;
}) {
	const [targetGPA, setTargetGPA] = useState<number>(0);
	const [totalCredit, setTotalCredit] = useState<number>(0);
	const [requiredGPA, setRequiredGPA] = useState<number>(0);
	const [remainingCredits, setRemainingCredits] = useState<number>(0);

	function handleClick() {
		const result = calculateRequiredGPA(credit, gpa, totalCredit, targetGPA);
		setRequiredGPA(result);
		setRemainingCredits(totalCredit - credit);
	}

	return (
		<div className="bg-white dark:bg-gray-800 rounded-[24px] p-6 shadow-xl mb-6 border border-gray-100 dark:border-gray-700">
			<h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
				<div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-[14px] flex items-center justify-center shadow-lg shadow-blue-500/30">
					<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
					</svg>
				</div>
				Tính GPA cần đạt
			</h2>
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<div className="space-y-4">
					<div className="flex flex-col space-y-2">
						<Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Số tín chỉ đã đạt:</Label>
						<div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-[14px] border border-blue-200 dark:border-blue-700">
							<span className="text-base text-gray-900 dark:text-gray-100 font-bold">{credit}</span>
						</div>
					</div>
					<div className="flex flex-col space-y-2">
						<Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Tổng số tín chỉ:</Label>
						<Input
							type="number"
							placeholder="Nhập tổng số tín chỉ..."
							className="rounded-[14px] text-base border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-900 py-3"
							onInput={(e) =>
								setTotalCredit(Number.parseInt(e.currentTarget.value)) 
							}
						/>
					</div>
					<div className="flex flex-col space-y-2">
						<Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Điểm trung bình tích lũy:</Label>
						<div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-[14px] border border-purple-200 dark:border-purple-700">
							<span className="text-base text-gray-900 dark:text-gray-100 font-bold">{gpa}</span>
						</div>
					</div>
					<div className="flex flex-col space-y-2">
						<Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Điểm trung bình cần đạt:</Label>
						<Input
							type="number"
							step="0.01"
							placeholder="Nhập GPA mục tiêu..."
							className="rounded-[14px] text-base border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-900 py-3"
							onInput={(e) =>
								setTargetGPA(Number.parseFloat(e.currentTarget.value.replaceAll(",", ".")))
							}
						/>
					</div>
				</div>
				
				<div className="flex flex-col justify-between">
					<div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-[18px] border-2 border-dashed border-blue-300 dark:border-blue-700">
						<div className="text-center">
							<p className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-semibold">Kết quả</p>
							<div className="text-5xl font-black text-gray-900 dark:text-white mb-2">
								{isNaN(requiredGPA) ? "--" : requiredGPA}
							</div>
							<p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
								cho <span className="font-bold text-blue-600 dark:text-blue-400">{remainingCredits > 0 ? remainingCredits : "--"}</span> tín chỉ còn lại
							</p>
						</div>
					</div>
					<Button 
						className="w-full mt-4 rounded-[14px] bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 py-6 text-base font-bold shadow-lg hover:shadow-xl transition-all duration-300" 
						onClick={handleClick}
					>
						Tính GPA cần thiết
					</Button>
				</div>
			</div>
		</div>
	);
}