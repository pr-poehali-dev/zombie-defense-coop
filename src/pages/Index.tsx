import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

type Weapon = {
  id: string;
  name: string;
  damage: number;
  fireRate: number;
  icon: string;
  level: number;
};

type Character = {
  id: string;
  name: string;
  health: number;
  maxHealth: number;
  weapon: Weapon;
  dashCooldown: number;
  dashReady: boolean;
};

type Zombie = {
  id: string;
  health: number;
  maxHealth: number;
  x: number;
  y: number;
  speed: number;
};

const WEAPONS: Record<string, Weapon> = {
  pistol: { id: 'pistol', name: 'Пистолет', damage: 15, fireRate: 500, icon: 'Crosshair', level: 1 },
  shotgun: { id: 'shotgun', name: 'Дробовик', damage: 50, fireRate: 1200, icon: 'Target', level: 1 },
  rifle: { id: 'rifle', name: 'Автомат', damage: 25, fireRate: 200, icon: 'Zap', level: 1 },
};

const Index = () => {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'shop' | 'gameover'>('menu');
  const [wave, setWave] = useState(1);
  const [score, setScore] = useState(0);
  const [currency, setCurrency] = useState(100);
  const [zombies, setZombies] = useState<Zombie[]>([]);
  const [characters, setCharacters] = useState<Character[]>([
    {
      id: 'p1',
      name: 'Солдат',
      health: 100,
      maxHealth: 100,
      weapon: WEAPONS.rifle,
      dashCooldown: 5000,
      dashReady: true,
    },
    {
      id: 'p2',
      name: 'Снайпер',
      health: 80,
      maxHealth: 80,
      weapon: WEAPONS.pistol,
      dashCooldown: 5000,
      dashReady: true,
    },
  ]);
  const [selectedCharacter, setSelectedCharacter] = useState(0);

  const spawnWave = useCallback(() => {
    const zombieCount = 5 + wave * 2;
    const newZombies: Zombie[] = [];
    for (let i = 0; i < zombieCount; i++) {
      newZombies.push({
        id: `z-${Date.now()}-${i}`,
        health: 30 + wave * 10,
        maxHealth: 30 + wave * 10,
        x: Math.random() > 0.5 ? 0 : 100,
        y: Math.random() * 100,
        speed: 0.5 + wave * 0.1,
      });
    }
    setZombies(newZombies);
  }, [wave]);

  useEffect(() => {
    if (gameState === 'playing' && zombies.length === 0) {
      setTimeout(() => {
        setGameState('shop');
        setCurrency((prev) => prev + wave * 50);
        toast.success(`Волна ${wave} пройдена! +${wave * 50}₽`);
      }, 2000);
    }
  }, [zombies.length, gameState, wave]);

  useEffect(() => {
    if (gameState === 'playing') {
      const interval = setInterval(() => {
        setZombies((prev) =>
          prev.map((z) => ({
            ...z,
            x: z.x < 50 ? z.x + z.speed : z.x - z.speed,
          }))
        );

        setCharacters((prev) => {
          const allDead = prev.every((c) => c.health <= 0);
          if (allDead) {
            setGameState('gameover');
            return prev;
          }
          return prev.map((char) => {
            const nearbyZombies = zombies.filter(
              (z) => Math.abs(z.x - 50) < 15 && Math.abs(z.y - (char.id === 'p1' ? 30 : 70)) < 15
            );
            if (nearbyZombies.length > 0 && char.health > 0) {
              return { ...char, health: Math.max(0, char.health - 0.5) };
            }
            return char;
          });
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [gameState, zombies]);

  const startGame = () => {
    setGameState('playing');
    setWave(1);
    setScore(0);
    setCurrency(100);
    setCharacters([
      {
        id: 'p1',
        name: 'Солдат',
        health: 100,
        maxHealth: 100,
        weapon: WEAPONS.rifle,
        dashCooldown: 5000,
        dashReady: true,
      },
      {
        id: 'p2',
        name: 'Снайпер',
        health: 80,
        maxHealth: 80,
        weapon: WEAPONS.pistol,
        dashCooldown: 5000,
        dashReady: true,
      },
    ]);
    spawnWave();
  };

  const nextWave = () => {
    setWave((prev) => prev + 1);
    setGameState('playing');
    setTimeout(spawnWave, 500);
  };

  const shootZombie = (zombieId: string) => {
    const char = characters[selectedCharacter];
    if (char.health <= 0) return;

    setZombies((prev) => {
      const updated = prev.map((z) => {
        if (z.id === zombieId) {
          const newHealth = z.health - char.weapon.damage;
          if (newHealth <= 0) {
            setScore((s) => s + 10);
            setCurrency((c) => c + 5);
            toast.success(`+10 очков!`);
          }
          return { ...z, health: Math.max(0, newHealth) };
        }
        return z;
      });
      return updated.filter((z) => z.health > 0);
    });
  };

  const dash = () => {
    const char = characters[selectedCharacter];
    if (char.dashReady && char.health > 0) {
      setCharacters((prev) =>
        prev.map((c, i) =>
          i === selectedCharacter ? { ...c, dashReady: false } : c
        )
      );
      toast.info('Рывок!');
      setTimeout(() => {
        setCharacters((prev) =>
          prev.map((c, i) =>
            i === selectedCharacter ? { ...c, dashReady: true } : c
          )
        );
      }, char.dashCooldown);
    }
  };

  const upgradeWeapon = (charIndex: number) => {
    const char = characters[charIndex];
    const cost = char.weapon.level * 100;
    if (currency >= cost) {
      setCurrency((prev) => prev - cost);
      setCharacters((prev) =>
        prev.map((c, i) =>
          i === charIndex
            ? {
                ...c,
                weapon: {
                  ...c.weapon,
                  level: c.weapon.level + 1,
                  damage: c.weapon.damage + 10,
                },
              }
            : c
        )
      );
      toast.success(`${char.name}: Оружие улучшено!`);
    }
  };

  const upgradeHealth = (charIndex: number) => {
    const cost = 150;
    if (currency >= cost) {
      setCurrency((prev) => prev - cost);
      setCharacters((prev) =>
        prev.map((c, i) =>
          i === charIndex
            ? {
                ...c,
                maxHealth: c.maxHealth + 20,
                health: Math.min(c.health + 50, c.maxHealth + 20),
              }
            : c
        )
      );
      toast.success(`${characters[charIndex].name}: +20 макс. HP`);
    }
  };

  const upgradeDash = (charIndex: number) => {
    const cost = 200;
    if (currency >= cost && characters[charIndex].dashCooldown > 2000) {
      setCurrency((prev) => prev - cost);
      setCharacters((prev) =>
        prev.map((c, i) =>
          i === charIndex
            ? { ...c, dashCooldown: c.dashCooldown - 1000 }
            : c
        )
      );
      toast.success(`${characters[charIndex].name}: Рывок -1сек`);
    }
  };

  if (gameState === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
        <Card className="p-8 md:p-12 bg-card/90 backdrop-blur-xl border-2 border-primary/30 max-w-2xl w-full shadow-2xl">
          <div className="text-center space-y-6">
            <h1 className="text-5xl md:text-7xl font-bold text-primary drop-shadow-[0_0_30px_rgba(220,38,38,0.5)]">
              ZOMBIE DEFENSE
            </h1>
            <p className="text-xl text-muted-foreground">
              Защита на двоих от волн зомби
            </p>
            <div className="grid grid-cols-2 gap-4 text-left py-6">
              <div className="flex items-center gap-3">
                <Icon name="Users" className="text-accent" size={24} />
                <span>2 персонажа</span>
              </div>
              <div className="flex items-center gap-3">
                <Icon name="Swords" className="text-destructive" size={24} />
                <span>3 типа оружия</span>
              </div>
              <div className="flex items-center gap-3">
                <Icon name="Zap" className="text-secondary" size={24} />
                <span>Рывок с КД</span>
              </div>
              <div className="flex items-center gap-3">
                <Icon name="TrendingUp" className="text-primary" size={24} />
                <span>Система улучшений</span>
              </div>
            </div>
            <Button
              onClick={startGame}
              size="lg"
              className="w-full text-xl py-6 bg-primary hover:bg-primary/80 shadow-lg hover:shadow-primary/50 transition-all"
            >
              <Icon name="Play" className="mr-2" size={24} />
              Начать игру
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (gameState === 'shop') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4 overflow-y-auto">
        <div className="max-w-6xl mx-auto py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-accent mb-2">Магазин улучшений</h1>
            <div className="flex items-center justify-center gap-4">
              <Badge variant="outline" className="text-lg px-4 py-2">
                Волна {wave}
              </Badge>
              <Badge variant="outline" className="text-lg px-4 py-2 bg-accent/20">
                Баланс: {currency}₽
              </Badge>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {characters.map((char, index) => (
              <Card
                key={char.id}
                className="p-6 bg-card/90 backdrop-blur-xl border-2 border-primary/30"
              >
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-primary mb-2">{char.name}</h3>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Здоровье</span>
                        <span>
                          {char.health}/{char.maxHealth}
                        </span>
                      </div>
                      <Progress value={(char.health / char.maxHealth) * 100} className="h-2" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {char.weapon.name} (Ур. {char.weapon.level}) — Урон: {char.weapon.damage}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={() => upgradeWeapon(index)}
                    disabled={currency < char.weapon.level * 100}
                    className="w-full"
                    variant="outline"
                  >
                    <Icon name="Crosshair" className="mr-2" size={18} />
                    Улучшить оружие ({char.weapon.level * 100}₽)
                  </Button>
                  <Button
                    onClick={() => upgradeHealth(index)}
                    disabled={currency < 150}
                    className="w-full"
                    variant="outline"
                  >
                    <Icon name="Heart" className="mr-2" size={18} />
                    Улучшить здоровье (150₽)
                  </Button>
                  <Button
                    onClick={() => upgradeDash(index)}
                    disabled={currency < 200 || char.dashCooldown <= 2000}
                    className="w-full"
                    variant="outline"
                  >
                    <Icon name="Zap" className="mr-2" size={18} />
                    Улучшить рывок (200₽)
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <Button
            onClick={nextWave}
            size="lg"
            className="w-full max-w-md mx-auto block text-xl py-6 bg-destructive hover:bg-destructive/80"
          >
            <Icon name="Skull" className="mr-2" size={24} />
            Следующая волна
          </Button>
        </div>
      </div>
    );
  }

  if (gameState === 'gameover') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-gray-900 flex items-center justify-center p-4">
        <Card className="p-8 md:p-12 bg-card/90 backdrop-blur-xl border-2 border-destructive/50 max-w-2xl w-full">
          <div className="text-center space-y-6">
            <Icon name="Skull" className="mx-auto text-destructive" size={80} />
            <h1 className="text-5xl font-bold text-destructive">GAME OVER</h1>
            <div className="space-y-2">
              <p className="text-2xl">Волна: {wave}</p>
              <p className="text-2xl">Очки: {score}</p>
            </div>
            <Button
              onClick={startGame}
              size="lg"
              className="w-full text-xl py-6"
            >
              <Icon name="RotateCcw" className="mr-2" size={24} />
              Начать заново
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const currentChar = characters[selectedCharacter];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-4">
            <Badge variant="outline" className="text-lg px-4 py-2">
              Волна {wave}
            </Badge>
            <Badge variant="outline" className="text-lg px-4 py-2">
              Очки: {score}
            </Badge>
            <Badge variant="outline" className="text-lg px-4 py-2 bg-accent/20">
              {currency}₽
            </Badge>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2 bg-destructive/20">
            <Icon name="Skull" className="mr-2" size={18} />
            Зомби: {zombies.length}
          </Badge>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {characters.map((char, index) => (
            <Card
              key={char.id}
              onClick={() => setSelectedCharacter(index)}
              className={`p-4 cursor-pointer transition-all ${
                selectedCharacter === index
                  ? 'bg-primary/20 border-primary border-2'
                  : 'bg-card/80 border-muted'
              } ${char.health <= 0 ? 'opacity-50' : ''}`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold">{char.name}</h3>
                {selectedCharacter === index && (
                  <Badge variant="default">Активен</Badge>
                )}
              </div>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>HP</span>
                    <span>
                      {Math.round(char.health)}/{char.maxHealth}
                    </span>
                  </div>
                  <Progress
                    value={(char.health / char.maxHealth) * 100}
                    className="h-2"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  {char.weapon.name} (Урон: {char.weapon.damage})
                </p>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    dash();
                  }}
                  disabled={!char.dashReady || char.health <= 0}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  <Icon name="Zap" className="mr-2" size={16} />
                  {char.dashReady ? 'Рывок' : 'Перезарядка...'}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-6 bg-card/80 backdrop-blur-xl border-2 border-primary/30 min-h-[400px] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-muted/20 to-muted/5" />
          
          <div className="relative">
            {characters.map((char, index) => (
              <div
                key={char.id}
                className={`absolute left-1/2 transform -translate-x-1/2 transition-all ${
                  char.health <= 0 ? 'opacity-30' : ''
                }`}
                style={{ top: `${index === 0 ? 30 : 70}%` }}
              >
                <div className="text-4xl">{index === 0 ? '🎖️' : '🎯'}</div>
                {selectedCharacter === index && (
                  <div className="absolute -top-2 -right-2">
                    <span className="text-2xl">👆</span>
                  </div>
                )}
              </div>
            ))}

            {zombies.map((zombie) => (
              <button
                key={zombie.id}
                onClick={() => shootZombie(zombie.id)}
                disabled={currentChar.health <= 0}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-110 disabled:cursor-not-allowed"
                style={{
                  left: `${zombie.x}%`,
                  top: `${zombie.y}%`,
                }}
              >
                <div className="relative">
                  <span className="text-4xl">🧟</span>
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-12">
                    <Progress
                      value={(zombie.health / zombie.maxHealth) * 100}
                      className="h-1"
                    />
                  </div>
                </div>
              </button>
            ))}

            {zombies.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <Icon name="CheckCircle" className="mx-auto text-accent" size={64} />
                  <p className="text-2xl font-bold text-accent">Волна зачищена!</p>
                </div>
              </div>
            )}
          </div>
        </Card>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          <p>Кликай по зомби чтобы стрелять! Переключай персонажей кликом по карточке.</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
