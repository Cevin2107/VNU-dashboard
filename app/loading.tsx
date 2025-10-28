import { LoaderCircle } from "lucide-react";

export default function Loading() {
	return (
		<div className="flex items-center justify-center min-h-screen">
			<LoaderCircle className="w-8 h-8 text-primary animate-spin" />
		</div>
	);
}