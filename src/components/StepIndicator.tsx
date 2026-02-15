interface StepIndicatorProps {
    currentStep: number;
    totalSteps?: number;
}

export default function StepIndicator({ currentStep, totalSteps = 4 }: StepIndicatorProps) {
    return (
        <div className="flex gap-2 mb-6">
            {Array.from({ length: totalSteps }).map((_, index) => {
                const step = index + 1;
                const isActive = step <= currentStep;
                return (
                    <div
                        key={index}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${isActive ? 'bg-[var(--color-primary)]' : 'bg-white/10'}`}
                    />
                );
            })}
        </div>
    );
}
