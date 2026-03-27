import type { CharacterInfo } from '@/types';

interface CharacterProps {
  info: CharacterInfo;
  unlockedPowers?: any[];
  season?: string; // 'water' | 'fire' | 'cosmos' | 'shadow'
}

const stateToStage: Record<string, number> = {
  sleeping: 0, resting: 1, awake: 2, energized: 3, powered: 4, legendary: 5,
};

// Season CSS overrides via inline style injection
const SEASON_STYLES: Record<string, React.CSSProperties> = {
  water: {}, // default - no override needed
  fire: {
    '--sp-main-bg': 'linear-gradient(160deg,rgba(255,180,100,0.95),rgba(255,100,50,0.85),rgba(200,50,0,0.75))',
    '--sp-aura-c': 'rgba(255,100,30,0.3)',
    '--sp-gnd-c': 'rgba(255,100,0,0.4)',
    '--sp-orb-bg': 'radial-gradient(circle at 35% 30%,#ffffff,#ffaa44 25%,#ff4400 55%,#ff8800 80%,#330000 100%)',
    '--sp-glow': '0 0 25px rgba(255,100,0,0.9),0 0 50px rgba(255,60,0,0.4)',
    '--sp-eye-c': 'radial-gradient(circle at 40% 35%,#ffaa44,#883300)',
  } as any,
  cosmos: {
    '--sp-main-bg': 'linear-gradient(160deg,rgba(180,150,255,0.95),rgba(120,80,240,0.85),rgba(60,20,160,0.75))',
    '--sp-aura-c': 'rgba(124,77,255,0.3)',
    '--sp-gnd-c': 'rgba(100,50,255,0.4)',
    '--sp-orb-bg': 'radial-gradient(circle at 35% 30%,#ffffff,#cc88ff 25%,#7c4dff 55%,#aa00ff 80%,#1a0044 100%)',
    '--sp-glow': '0 0 25px rgba(124,77,255,0.9),0 0 50px rgba(170,0,255,0.4)',
    '--sp-eye-c': 'radial-gradient(circle at 40% 35%,#cc88ff,#4400cc)',
  } as any,
  shadow: {
    '--sp-main-bg': 'linear-gradient(160deg,rgba(150,160,170,0.95),rgba(80,100,110,0.85),rgba(30,40,50,0.75))',
    '--sp-aura-c': 'rgba(80,100,120,0.3)',
    '--sp-gnd-c': 'rgba(50,70,90,0.4)',
    '--sp-orb-bg': 'radial-gradient(circle at 35% 30%,#ccddee,#778899 25%,#445566 55%,#334455 80%,#111122 100%)',
    '--sp-glow': '0 0 25px rgba(80,100,120,0.9),0 0 50px rgba(50,70,90,0.4)',
    '--sp-eye-c': 'radial-gradient(circle at 40% 35%,#aabbcc,#334455)',
  } as any,
};

export function Character({ info, season = 'water' }: CharacterProps) {
  const stage = stateToStage[info.state] ?? 0;
  const seasonStyle = SEASON_STYLES[season] || {};

  // Season-aware CSS class suffix
  const sc = season !== 'water' ? ` sp-${season}` : '';

  return (
    <div className="spirit-host" style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', ...seasonStyle }}>

      {/* STAGE 0 - DORMANT */}
      {stage === 0 && (
        <div className="sp0">
          <div className="sp0-orb-out"/>
          <div className="sp0-orb-mid"/>
          <div className={`sp0-orb${sc}`}>
            <div className="sp0-hi"/>
            <div className="sp0-eye-l"/>
            <div className="sp0-eye-r"/>
          </div>
          <div className="sp0-zzz">ᴢ</div>
          <div className="sp0-zzz2">ᴢ</div>
          <div className="sp0-gnd"/>
        </div>
      )}

      {/* STAGE 1 - ORB */}
      {stage === 1 && (
        <div className="sp1">
          <div className="sp1-go"/>
          <div className="sp1-gm"/>
          <div className={`sp1-orb${sc}`}><div className="sp1-hi"/></div>
          <div className="sp1-p sp1-p1"/><div className="sp1-p sp1-p2"/>
          <div className="sp1-p sp1-p3"/><div className="sp1-p sp1-p4"/>
          <div className="sp1-gnd"/>
        </div>
      )}

      {/* STAGE 2 - WISP */}
      {stage === 2 && (
        <div className="sp2">
          <div className="sp2-aura"/>
          <div className="sp2-body">
            <div className={`sp2-main${sc}`}/>
            <div className="sp2-wl"/><div className="sp2-wr"/>
            <div className="sp2-el"><div className="sp2-eye-inner"><div className="sp2-eli"/><div className="sp2-elp"/><div className="sp2-elh"/></div></div>
            <div className="sp2-er"><div className="sp2-eye-inner-r"><div className="sp2-eri"/><div className="sp2-erp"/><div className="sp2-erh"/></div></div>
            <div className="sp2-mouth"/>
          </div>
          <div className="sp2-gnd"/>
        </div>
      )}

      {/* STAGE 3 - GALAXY */}
      {stage === 3 && (
        <div className="sp3">
          <div className="sp3-aura"/>
          <div className="sp3-body">
            <div className={`sp3-main${sc}`}/>
            <div className="sp3-star sp3-s1"/><div className="sp3-star sp3-s2"/>
            <div className="sp3-star sp3-s3"/><div className="sp3-star sp3-s4"/><div className="sp3-star sp3-s5"/>
            <div className="sp3-el"><div className="sp3-eye-inner"><div className="sp3-eli"/><div className="sp3-elp"/><div className="sp3-elh"/></div></div>
            <div className="sp3-er"><div className="sp3-eye-inner-r"><div className="sp3-eri"/><div className="sp3-erp"/><div className="sp3-erh"/></div></div>
            <div className="sp3-smile"/>
          </div>
          <div className="sp3-gnd"/>
        </div>
      )}

      {/* STAGE 4 - DIVINE */}
      {stage === 4 && (
        <div className="sp4">
          <div className="sp4-bg"/>
          <div className="sp4-halo" style={{ transform: 'translateX(-50%)' }}/>
          <div className="sp4-halo2" style={{ transform: 'translateX(-50%)' }}/>
          <div className="sp4-sL"/><div className="sp4-sR"/>
          <div className={`sp4-body${sc}`}/>
          <div className="sp4-hair"/>
          <div className="sp4-head">
            <div className="sp4-el"><div className="sp4-eye-inner"><div className="sp4-eli"/><div className="sp4-elp"/><div className="sp4-elh"/></div></div>
            <div className="sp4-er"><div className="sp4-eye-inner-r"><div className="sp4-eri"/><div className="sp4-erp"/><div className="sp4-erh"/></div></div>
            <div className="sp4-gem"/><div className="sp4-smile"/>
          </div>
          <div className="sp4-gnd"/>
        </div>
      )}

      {/* STAGE 5 - ULTIMATE */}
      {stage === 5 && (
        <div className="sp5">
          <div className="sp5-ao"/>
          <div className="sp5-ro" style={{ transform: 'translateX(-50%)' }}>
            <div className="sp5-gem1"/><div className="sp5-gem2"/>
            <div className="sp5-gem3"/><div className="sp5-gem4"/>
          </div>
          <div className="sp5-ri" style={{ transform: 'translateX(-50%)' }}/>
          <div className="sp5-sL"/><div className="sp5-sR"/>
          <div className={`sp5-body${sc}`}><div className="sp5-sash"/></div>
          <div className="sp5-hair"/>
          <div className="sp5-head">
            <div className="sp5-el"><div className="sp5-eye-inner"><div className="sp5-eli"/><div className="sp5-elp"/><div className="sp5-elh"/></div></div>
            <div className="sp5-er"><div className="sp5-eye-inner-r"><div className="sp5-eri"/><div className="sp5-erp"/><div className="sp5-erh"/></div></div>
            <div className="sp5-smile"/>
          </div>
          <div className="sp5-crown"/>
          <div className="sp5-spark sp5-sp1"/><div className="sp5-spark sp5-sp2"/>
          <div className="sp5-spark sp5-sp3"/><div className="sp5-spark sp5-sp4"/>
          <div className="sp5-panL">SYSTEM: MAX<br/>SOUL: 100%</div>
          <div className="sp5-panR">STATUS: DIVINE<br/>POWER: ∞</div>
          <div className="sp5-gnd"/>
        </div>
      )}
    </div>
  );
}
