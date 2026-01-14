import { useState, useEffect } from 'react';

type ZombieProps = {
  health: number;
  maxHealth: number;
  onClick: () => void;
  disabled?: boolean;
};

const Zombie = ({ health, maxHealth, onClick, disabled }: ZombieProps) => {
  const [frame, setFrame] = useState(0);
  const [isHit, setIsHit] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((prev) => (prev + 1) % 4);
    }, 250);
    return () => clearInterval(interval);
  }, []);

  const handleClick = () => {
    if (!disabled) {
      setIsHit(true);
      onClick();
      setTimeout(() => setIsHit(false), 100);
    }
  };

  const walkAnimation = frame % 2 === 0 ? 'translate-x-[2px]' : 'translate-x-[-2px]';
  const armAnimation = frame < 2 ? 'rotate-12' : '-rotate-12';

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`relative transition-all hover:scale-110 ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-crosshair'} ${
        isHit ? 'scale-95' : ''
      }`}
    >
      <div className={`transform ${walkAnimation} transition-transform duration-200`}>
        <div className="relative">
          <div className="w-14 h-18 bg-gradient-to-b from-green-500 via-green-600 to-green-700 rounded-lg relative shadow-xl border-2 border-green-800">
            <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-9 h-9 bg-gradient-to-b from-green-400 to-green-600 rounded-full border-2 border-green-700">
              <div className="absolute top-2 left-2 w-2 h-2 bg-red-600 rounded-full" />
              <div className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full" />
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-1 bg-gray-900 rounded" />
            </div>
            
            <div className={`absolute top-11 left-0 w-2 h-7 bg-green-600 rounded origin-top transform ${armAnimation} transition-transform`} />
            <div className={`absolute top-11 right-0 w-2 h-7 bg-green-600 rounded origin-top transform ${armAnimation} transition-transform`} />
            
            <div className="absolute bottom-0 left-1 w-3 h-5 bg-green-700 rounded" />
            <div className="absolute bottom-0 right-1 w-3 h-5 bg-green-700 rounded" />
            
            <div className="absolute top-12 left-1/2 transform -translate-x-1/2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-3 bg-gray-800 opacity-30"
                  style={{ left: `${i * 3}px`, top: `${i * 2}px` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-20">
        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all"
            style={{ width: `${(health / maxHealth) * 100}%` }}
          />
        </div>
      </div>

      {isHit && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-red-500 font-bold text-xl animate-ping">💥</div>
        </div>
      )}
    </button>
  );
};

export default Zombie;
