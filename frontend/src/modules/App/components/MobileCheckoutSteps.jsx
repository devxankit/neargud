import { FiCheck } from "react-icons/fi";

const MobileCheckoutSteps = ({ currentStep, totalSteps = 2 }) => {
  const stepLabels = ["Shipping", "Payment"];
  
  return (
    <div className="flex items-center justify-between w-full max-w-sm mx-auto py-2">
      {Array.from({ length: totalSteps }, (_, index) => {
        const step = index + 1;
        const isCompleted = step < currentStep;
        const isCurrent = step === currentStep;

        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                  isCompleted
                    ? "gradient-green text-white shadow-sm"
                    : isCurrent
                    ? "gradient-green text-white shadow-glow-green scale-110"
                    : "bg-gray-100 text-gray-400 border border-gray-200"
                }`}>
                {isCompleted ? <FiCheck className="text-base" /> : step}
              </div>
              <span
                className={`text-[10px] font-bold mt-1.5 uppercase tracking-wider transition-colors duration-300 ${
                  isCurrent
                    ? "text-primary-600"
                    : isCompleted
                    ? "text-gray-500"
                    : "text-gray-300"
                }`}>
                {stepLabels[index]}
              </span>
            </div>
            
            {step < totalSteps && (
              <div className="flex-1 mx-4 -mt-5">
                <div className="h-0.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ease-out ${
                      isCompleted ? "w-full gradient-green" : "w-0"
                    }`}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MobileCheckoutSteps;
