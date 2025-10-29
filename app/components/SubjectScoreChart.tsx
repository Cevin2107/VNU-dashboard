"use client";

import React from "react";
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, CartesianGrid } from "recharts";
import { SubjectScore } from "@/types/SubjectTypes";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";

function SubjectScoreChart({ data }: { data: Record<SubjectScore, number> }) {
	const chartConfig: ChartConfig = {
		[SubjectScore.A_plus]: {
			label: "A+",
			color: "hsl(262, 83%, 58%)",
		},
		[SubjectScore.A]: {
			label: "A",
			color: "hsl(217, 91%, 60%)",
		},
		[SubjectScore.B_plus]: {
			label: "B+",
			color: "hsl(142, 76%, 45%)",
		},
		[SubjectScore.B]: {
			label: "B",
			color: "hsl(173, 58%, 39%)",
		},
		[SubjectScore.C_plus]: {
			label: "C+",
			color: "hsl(45, 93%, 47%)",
		},
		[SubjectScore.C]: {
			label: "C",
			color: "hsl(32, 95%, 44%)",
		},
		[SubjectScore.D_plus]: {
			label: "D+",
			color: "hsl(25, 95%, 53%)",
		},
		[SubjectScore.D]: {
			label: "D",
			color: "hsl(16, 94%, 58%)",
		},
		[SubjectScore.F]: {
			label: "F",
			color: "hsl(0, 84%, 60%)",
		}
	};
	
	const chartData = Object.entries(data)
		.filter(([, value]) => value != 0)
		.map(([key, value]) => ({
			grade: chartConfig[key as SubjectScore].label,
			count: value,
			fill: chartConfig[key as SubjectScore].color
		}));

	const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { payload: { grade: string }; value: number }[] }) => {
		if (active && payload && payload.length) {
			return (
				<div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-[16px] p-4 shadow-xl border border-gray-200 dark:border-gray-700">
					<p className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1">
						Điểm {payload[0].payload.grade}
					</p>
					<p className="text-sm text-gray-600 dark:text-gray-400">
						Số môn học: <span className="font-bold text-gray-900 dark:text-white">{payload[0].value}</span>
					</p>
				</div>
			);
		}
		return null;
	};

	const CustomLegend = (props: { payload?: { color: string; value: string }[] }) => {
		const { payload } = props;
		return (
			<div className="flex flex-wrap justify-center gap-3 mt-4">
				{payload?.map((entry: { color: string; value: string }, index: number) => (
					<div key={`legend-${index}`} className="flex items-center gap-2">
						<div 
							className="w-3 h-3 rounded-sm shadow-sm" 
							style={{ backgroundColor: entry.color }}
						/>
						<span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
							{entry.value}
						</span>
					</div>
				))}
			</div>
		);
	};

	return (
		<div className="w-full h-[320px]">
			<ChartContainer config={chartConfig} className="w-full h-full">
				<ResponsiveContainer width="100%" height="100%">
					<BarChart 
						data={chartData}
						margin={{ top: 20, right: 20, bottom: 20, left: 0 }}
					>
						<CartesianGrid 
							strokeDasharray="3 3" 
							stroke="hsl(var(--border))" 
							opacity={0.2}
							vertical={false}
						/>
						<XAxis 
							dataKey="grade" 
							axisLine={false}
							tickLine={false}
							tick={{ fill: 'hsl(var(--foreground))', fontSize: 13, fontWeight: 600 }}
							dy={10}
						/>
						<YAxis 
							axisLine={false}
							tickLine={false}
							tick={{ fill: 'hsl(var(--foreground))', fontSize: 12, fontWeight: 500 }}
							allowDecimals={false}
						/>
						<Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
						<Legend content={<CustomLegend />} />
						<Bar 
							dataKey="count" 
							fill="hsl(var(--primary))"
							radius={[12, 12, 0, 0]}
							maxBarSize={60}
							animationDuration={800}
							animationEasing="ease-out"
						>
							{chartData.map((entry, index) => (
								<Bar 
									key={`bar-${index}`}
									dataKey="count"
									fill={entry.fill}
									radius={[12, 12, 0, 0]}
								/>
							))}
						</Bar>
					</BarChart>
				</ResponsiveContainer>
			</ChartContainer>
		</div>
	);
}

export default React.memo(SubjectScoreChart);