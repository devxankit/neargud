const TransitionGradient = () => {
    return (
        <div
            className="transition-gradient w-full h-12 -mt-8 mb-4"
            style={{
                background: 'linear-gradient(180deg, rgba(109, 40, 217, 0.05) 0%, rgba(248, 250, 252, 1) 100%)',
                pointerEvents: 'none',
            }}
        />
    );
};

export default TransitionGradient;
