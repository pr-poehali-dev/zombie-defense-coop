import { useState, useEffect } from 'react';

type CharacterProps = {
  type: 'soldier' | 'sniper';
  isActive: boolean;
  health: number;
  maxHealth: number;
  isAttacking?: boolean;
};

const Character = ({ type, isActive, health, maxHealth, isAttacking }: CharacterProps) => {
  const [frame, setFrame] = useState(0);
  const isDead = health <= 0;

  useEffect(() => {
    if (isDead) return;
    const interval = setInterval(() => {
      setFrame((prev) => (prev + 1) % 4);
    }, 200);
    return () => clearInterval(interval);
  }, [isDead]);

  const getCharacterStyle = () => {
    if (isDead) return 'grayscale opacity-50';
    if (isAttacking) return 'animate-pulse';
    return '';
  };

  const walkAnimation = frame % 2 === 0 ? 'translate-y-[-2px]' : 'translate-y-[2px]';

  return (
    <div className={`relative transition-all ${getCharacterStyle()}`}>
      <div className={`transform ${!isDead && walkAnimation} transition-transform duration-200`}>
        {type === 'soldier' ? (
          <div className="relative">
            <div className="w-12 h-16 bg-gradient-to-b from-green-700 to-green-900 rounded-lg relative shadow-lg">
              <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-gradient-to-b from-amber-200 to-amber-300 rounded-full border-2 border-amber-400" />
              <div className="absolute top-10 left-2 w-2 h-6 bg-green-800 rounded" />
              <div className="absolute top-10 right-2 w-2 h-6 bg-green-800 rounded" />
              <div className="absolute bottom-0 left-1 w-3 h-4 bg-gray-800 rounded" />
              <div className="absolute bottom-0 right-1 w-3 h-4 bg-gray-800 rounded" />
              <div className="absolute top-8 -right-2 w-6 h-2 bg-gray-700 rounded">
                <div className="absolute right-0 w-3 h-1 bg-orange-500" />
              </div>
            </div>
          </div>
        ) : (
          <div className="relative">
            <div className="w-12 h-16 bg-gradient-to-b from-blue-700 to-blue-900 rounded-lg relative shadow-lg">
              <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-gradient-to-b from-amber-200 to-amber-300 rounded-full border-2 border-amber-400" />
              <div className="absolute top-10 left-2 w-2 h-6 bg-blue-800 rounded" />
              <div className="absolute top-10 right-2 w-2 h-6 bg-blue-800 rounded" />
              <div className="absolute bottom-0 left-1 w-3 h-4 bg-gray-800 rounded" />
              <div className="absolute bottom-0 right-1 w-3 h-4 bg-gray-800 rounded" />
              <div className="absolute top-6 -right-3 w-8 h-1.5 bg-gray-600 rounded">
                <div className="absolute right-0 w-2 h-2 bg-gray-800 rounded-full" />
              </div>
            </div>
          </div>
        )}
      </div>
      
      {isActive && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
          <div className="bg-primary text-white text-xs px-2 py-1 rounded-full shadow-lg animate-pulse">
            ACTIVE
          </div>
        </div>
      )}
      
      {isAttacking && (
        <div className="absolute top-1/2 -right-8 transform -translate-y-1/2">
          <div className="w-6 h-0.5 bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.8)] animate-fade-in" />
        </div>
      )}
      
      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-16">
        <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${
              health > maxHealth * 0.5 ? 'bg-green-500' : health > maxHealth * 0.25 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${(health / maxHealth) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default Character;
