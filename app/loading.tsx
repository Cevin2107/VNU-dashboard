"use client";

import Image from "next/image";
import vnuLogo from "@/public/vnu_logo.png";
import { Sparkles, RefreshCw } from "lucide-react";

export default function Loading() {
	return (
		<div className="fixed inset-0 z-[3000] flex items-center justify-center bg-[#f2f0eb] p-4">
			<div className="surface-card bg-white rounded-3xl p-8 shadow-xl border border-slate-200/80 max-w-sm w-full text-center flex flex-col items-center gap-4">
				{/* Logo Container with glowing animated ring */}
				<div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-[#edebe9] border border-slate-200 shadow-inner">
					<Image
						src={vnuLogo}
						alt="VNU Logo"
						width={48}
						height={48}
						className="object-contain select-none animate-pulse"
						priority
					/>
					<div className="absolute -inset-1.5 rounded-2xl border-2 border-[#00754A]/30 border-t-[#00754A] animate-spin" />
				</div>

				{/* Text Info */}
				<div className="space-y-1 mt-1">
					<h2 className="text-base font-black text-[#006241] tracking-tight flex items-center justify-center gap-1.5">
						VNU Portal <Sparkles className="w-4 h-4 text-[#00754A]" />
					</h2>
					<p className="text-xs font-semibold text-slate-500 flex items-center justify-center gap-1.5 pt-0.5">
						<RefreshCw className="w-3.5 h-3.5 animate-spin text-[#00754A]" />
						<span>Đang tải dữ liệu VNU...</span>
					</p>
				</div>
			</div>
		</div>
	);
}