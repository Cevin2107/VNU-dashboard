"use client";

import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { 
	LineChart, 
	Line, 
	XAxis, 
	YAxis,
	CartesianGrid,
	ResponsiveContainer,
	Area,
	AreaChart,
} from "recharts";

export default function GPAChart({data}: {
	data: { id: string; tenHocKy: string; tongket: number; tichluy: number }[];
}) {
	const chartConfig: ChartConfig = {
		tongket: {
			label: "GPA Học kỳ",
			color: "hsl(217, 91%, 60%)",
		},
		tichluy: {
			label: "GPA Tích lũy", 
			color: "hsl(280, 90%, 60%)",
		},
	};

	return (
		<div className="w-full h-[280px]">
			<ChartContainer config={chartConfig} className="w-full h-full">
				<ResponsiveContainer width="100%" height="100%">
					<AreaChart 
						data={data} 
						margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
					>
						<defs>
							<linearGradient id="colorTongket" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor={chartConfig.tongket.color} stopOpacity={0.3}/>
								<stop offset="95%" stopColor={chartConfig.tongket.color} stopOpacity={0}/>
							</linearGradient>
							<linearGradient id="colorTichluy" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor={chartConfig.tichluy.color} stopOpacity={0.3}/>
								<stop offset="95%" stopColor={chartConfig.tichluy.color} stopOpacity={0}/>
							</linearGradient>
						</defs>
						<CartesianGrid 
							strokeDasharray="3 3" 
							stroke="hsl(var(--border))" 
							opacity={0.3}
							vertical={false}
						/>
						<XAxis 
							dataKey="tenHocKy" 
							tickLine={false}
							axisLine={false}
							tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
							interval={0}
							angle={-15}
							textAnchor="end"
							height={60}
						/>
						<YAxis 
							domain={[0, 4]} 
							tickCount={5}
							tickLine={false}
							axisLine={false}
							tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
						/>
						<ChartTooltip 
							content={<ChartTooltipContent />}
							cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 1, strokeDasharray: '5 5' }}
						/>
						<ChartLegend 
							content={<ChartLegendContent />} 
							verticalAlign="top"
							height={36}
						/>
						<Area
							type="monotone"
							dataKey="tongket"
							stroke={chartConfig.tongket.color}
							strokeWidth={3}
							fill="url(#colorTongket)"
							dot={{ r: 4, strokeWidth: 2, fill: 'white' }}
							activeDot={{ r: 6, strokeWidth: 2 }}
						/>
						<Area
							type="monotone"
							dataKey="tichluy"
							stroke={chartConfig.tichluy.color}
							strokeWidth={3}
							fill="url(#colorTichluy)"
							dot={{ r: 4, strokeWidth: 2, fill: 'white' }}
							activeDot={{ r: 6, strokeWidth: 2 }}
						/>
					</AreaChart>
				</ResponsiveContainer>
			</ChartContainer>
		</div>
	);
}