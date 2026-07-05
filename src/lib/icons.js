// Tailwind & Svelte İçin Genişletilmiş Oyun, Yazılım ve UI İkon Deposu
import { 
  // Oyun & General
  Gamepad2, Gamepad, Joystick, Puzzle, Dice5, Trophy, Target, Crown, Award, Medal, Star, Heart, Flame, Zap, Sparkles, Ghost, Skull, Crosshair,
  // RPG / Fantasy / Savaş
  Swords, Sword, Shield, ShieldAlert, ShieldCheck, Wand2, Axe, Feather, Gem, Scroll, Key, Anvil, Compass, Map, Flag, Anchor, Mountain, Trees,
  // Bilim Kurgu / Uzay / Gelecek
  Rocket, Satellite, Orbit, Atom, Radar, Bot, Globe, Radio, Battery, Wifi, Binary,
  // Yazılım / Oyun Motoru / Donanım
  Terminal, Code, FileCode, Cpu, Bug, Wrench, Settings, Sliders, Layers, Box, Boxes, Braces, GitBranch, GitCommit, GitPullRequest, FolderGit2, Workflow, Lock, Monitor, Laptop, Server, Network,
  // UI & Aksiyon
  Bell, Eye, Search, Filter, Share2, Users, Briefcase, Archive, Gauge, Headphones, Keyboard, Speaker, Milestone, Footprints
} from 'lucide-svelte';

export const iconMap = {
  // --- OYUN & EĞLENCE ---
  gamepad: { component: Gamepad2, label: 'Gamepad', category: 'game arcade' },
  gamepad_old: { component: Gamepad, label: 'Retro Pad', category: 'game retro' },
  joystick: { component: Joystick, label: 'Joystick', category: 'game arcade simulator' },
  puzzle: { component: Puzzle, label: 'Puzzle / Logic', category: 'game puzzle' },
  dice: { component: Dice5, label: 'Dice / RPG', category: 'game tabletop rnd' },
  trophy: { component: Trophy, label: 'Trophy', category: 'game reward win' },
  target: { component: Target, label: 'Target / Aim', category: 'game shooter combat' },
  crown: { component: Crown, label: 'Crown / King', category: 'game rpg strategy' },
  award: { component: Award, label: 'Award', category: 'game achievement' },
  medal: { component: Medal, label: 'Medal', category: 'game achievement' },
  star: { component: Star, label: 'Star / Favorite', category: 'game general' },
  heart: { component: Heart, label: 'Heart / HP', category: 'game rpg health' },
  flame: { component: Flame, label: 'Flame / Fire', category: 'game action fast' },
  zap: { component: Zap, label: 'Lightning / Energy', category: 'game action power' },
  sparkles: { component: Sparkles, label: 'Sparkles / Magic', category: 'game fantasy' },
  ghost: { component: Ghost, label: 'Ghost / Horror', category: 'game horror retro' },
  skull: { component: Skull, label: 'Skull / Death', category: 'game horror combat' },
  crosshair: { component: Crosshair, label: 'Crosshair / FPS', category: 'game shooter fps' },

  // --- RPG / FANTASY / SAVAŞ ---
  swords: { component: Swords, label: 'Swords / Clash', category: 'rpg combat war' },
  sword: { component: Sword, label: 'Single Sword', category: 'rpg combat weapon' },
  shield: { component: Shield, label: 'Shield / Defense', category: 'rpg defense strategy' },
  shield_alert: { component: ShieldAlert, label: 'Shield Alert', category: 'rpg combat danger' },
  shield_check: { component: ShieldCheck, label: 'Shield Check', category: 'rpg defense safe' },
  wand: { component: Wand2, label: 'Magic Wand', category: 'rpg fantasy mage' },
  axe: { component: Axe, label: 'Axe / Barbarian', category: 'rpg combat weapon' },
  feather: { component: Feather, label: 'Feather / Speed', category: 'rpg adventure' },
  gem: { component: Gem, label: 'Gem / Loot', category: 'rpg reward currency' },
  scroll: { component: Scroll, label: 'Scroll / Lore', category: 'rpg fantasy quest' },
  key: { component: Key, label: 'Key / Unlock', category: 'rpg adventure puzzle' },
  anvil: { component: Anvil, label: 'Anvil / Crafting', category: 'rpg crafting sim' },
  compass: { component: Compass, label: 'Compass / Explore', category: 'adventure world' },
  map: { component: Map, label: 'World Map', category: 'adventure rpg world' },
  flag: { component: Flag, label: 'Checkpoint Flag', category: 'adventure racing' },
  anchor: { component: Anchor, label: 'Anchor / Naval', category: 'strategy naval sea' },
  mountain: { component: Mountain, label: 'Mountain / Terrain', category: 'world environment' },
  trees: { component: Trees, label: 'Forest / Nature', category: 'world environment' },

  // --- UZAY / BİLİM KURGU ---
  rocket: { component: Rocket, label: 'Rocket / Launch', category: 'scifi space speed' },
  satellite: { component: Satellite, label: 'Satellite', category: 'scifi space tech' },
  orbit: { component: Orbit, label: 'Orbit / Gravity', category: 'scifi space physics' },
  atom: { component: Atom, label: 'Atom / Science', category: 'scifi tech science' },
  radar: { component: Radar, label: 'Radar / Scan', category: 'scifi space strategy' },
  bot: { component: Bot, label: 'AI Bot / Mech', category: 'scifi robot future' },
  globe: { component: Globe, label: 'Globe / Planet', category: 'scifi world mmo' },
  radio: { component: Radio, label: 'Radio / Comm', category: 'scifi tech' },
  battery: { component: Battery, label: 'Battery / Power', category: 'scifi energy' },
  wifi: { component: Wifi, label: 'Signal / Online', category: 'tech online multiplayer' },
  binary: { component: Binary, label: 'Binary / Matrix', category: 'scifi cyberpunk code' },

  // --- MOTOR & YAZILIM (DEV) ---
  terminal: { component: Terminal, label: 'Terminal / CLI', category: 'dev engine code' },
  code: { component: Code, label: 'Source Code', category: 'dev programming' },
  file_code: { component: FileCode, label: 'Script File', category: 'dev programming' },
  cpu: { component: Cpu, label: 'CPU / Processor', category: 'dev engine system' },
  bug: { component: Bug, label: 'Bug / QA', category: 'dev testing qa' },
  wrench: { component: Wrench, label: 'Wrench / Fix', category: 'dev tools settings' },
  settings: { component: Settings, label: 'Settings / Gear', category: 'dev engine config' },
  sliders: { component: Sliders, label: 'Sliders / Balance', category: 'dev design balance' },
  layers: { component: Layers, label: 'Layers / Architecture', category: 'dev engine ui' },
  box: { component: Box, label: '3D Box / Mesh', category: 'dev 3d assets' },
  boxes: { component: Boxes, label: 'Modules / Prefabs', category: 'dev 3d engine' },
  braces: { component: Braces, label: 'JSON / Data', category: 'dev code data' },
  git_branch: { component: GitBranch, label: 'Git Branch', category: 'dev version git' },
  git_commit: { component: GitCommit, label: 'Git Commit', category: 'dev version git' },
  git_pull: { component: GitPullRequest, label: 'Git Pull Req', category: 'dev version git' },
  folder_git: { component: FolderGit2, label: 'Git Repository', category: 'dev version git' },
  workflow: { component: Workflow, label: 'Workflow / Pipeline', category: 'dev engine logic' },
  lock: { component: Lock, label: 'Lock / Security', category: 'dev auth' },
  monitor: { component: Monitor, label: 'Desktop / PC', category: 'platform pc' },
  laptop: { component: Laptop, label: 'Laptop / Dev PC', category: 'platform pc' },
  server: { component: Server, label: 'Server / Backend', category: 'dev backend mmo' },
  network: { component: Network, label: 'Network / Netcode', category: 'dev backend multiplayer' },

  // --- GENEL UI & SES/MÜZİK ---
  headphones: { component: Headphones, label: 'Audio / Sound', category: 'audio sfx music' },
  speaker: { component: Speaker, label: 'Speaker / SFX', category: 'audio sfx' },
  keyboard: { component: Keyboard, label: 'Keyboard / Controls', category: 'platform pc controls' },
  gauge: { component: Gauge, label: 'Gauge / FPS Performance', category: 'dev engine perf' },
  bell: { component: Bell, label: 'Notification', category: 'ui general' },
  eye: { component: Eye, label: 'Vision / Camera', category: 'dev engine camera' },
  search: { component: Search, label: 'Search / Inspect', category: 'ui general' },
  filter: { component: Filter, label: 'Filter / Sort', category: 'ui general' },
  share: { component: Share2, label: 'Share / Publish', category: 'ui release' },
  users: { component: Users, label: 'Team / Co-op', category: 'ui multiplayer team' },
  briefcase: { component: Briefcase, label: 'Publisher / Biz', category: 'biz marketing' },
  archive: { component: Archive, label: 'Archive / Backup', category: 'dev storage' },
  milestone: { component: Milestone, label: 'Roadmap Milestone', category: 'dev management' },
  footprints: { component: Footprints, label: 'Footprints / Steps', category: 'adventure tracking' }
};