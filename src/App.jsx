import {
  Bell,
  Box,
  ChevronLeft,
  CheckSquare,
  ChevronRight,
  Delete,
  FileText,
  History,
  Home,
  IdCard,
  Lock,
  Maximize2,
  MessageCircle,
  Power,
  RotateCcw,
  ScanLine,
  Settings2,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";

const cardImages = {
  front: "/assets/id-card-front.png",
  back: "/assets/id-card-back.png",
};

// ตรา 8 ดวง: ตำแหน่งกล่อง (% ของบัตร) + ทิศเส้นแสง (dir 0=ซ้าย→ขวา, 1=ขวา→ซ้าย)
const SNAKE_SEALS = [
  { i: 0, x: 0.0, y: 11.28, w: 5.53, h: 26.16, dir: 0 },
  { i: 1, x: 15.57, y: 14.88, w: 20.02, h: 28.53, dir: 1 },
  { i: 2, x: 39.45, y: 7.58, w: 17.88, h: 31.75, dir: 0 },
  { i: 3, x: 72.61, y: 5.88, w: 19.85, h: 28.53, dir: 1 },
  { i: 4, x: 57.75, y: 33.74, w: 19.9, h: 28.53, dir: 0 },
  { i: 5, x: 35.65, y: 57.16, w: 19.9, h: 28.44, dir: 1 },
  { i: 6, x: 58.53, y: 83.13, w: 17.11, h: 16.87, dir: 0 },
  { i: 7, x: 9.15, y: 68.34, w: 17.88, h: 31.66, dir: 1 },
];

const services = [
  { icon: IdCard, label: "ตรวจสอบ\nคำขอ" },
  { icon: CheckSquare, label: "การรับรอง\nเอกสาร" },
  { icon: Box, label: "การแจ้ง\nย้ายที่อยู่" },
  { icon: History, label: "เร็วๆ นี้", muted: true },
];

const banners = [
  { src: "/assets/banner.png", alt: "สถิตอยู่ในใจตราบนิรันดร์" },
  { src: "/assets/banner-online.png", alt: "บริการทะเบียนออนไลน์" },
];

const tabs = [
  { id: "home", icon: Home, label: "หน้าแรก" },
  { id: "docs", icon: FileText, label: "เอกสาร" },
  { id: "scan", icon: ScanLine, label: "สแกน", scan: true },
  { id: "history", icon: History, label: "ประวัติ" },
  { id: "settings", icon: Settings2, label: "ตั้งค่า" },
];

function App() {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedSide, setExpandedSide] = useState("front");
  const [activeTab, setActiveTab] = useState("scan");
  const [bannerIndex, setBannerIndex] = useState(0);
  const [showSplash, setShowSplash] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [pin, setPin] = useState("");

  const PIN_LENGTH = 6;

  useEffect(() => {
    const timer = window.setInterval(() => {
      setBannerIndex((index) => (index + 1) % banners.length);
    }, 2800);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowSplash(false), 2600);
    return () => window.clearTimeout(timer);
  }, []);

  // เอฟเฟกต์ตราโฮโลแกรม: สีไหลเปลี่ยนต่อเนื่องเอง + เอียงเครื่องเร่ง/เลื่อนสี (เนียนด้วย lerp)
  useEffect(() => {
    if (!isUnlocked) return undefined;
    const root = document.documentElement;
    const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

    let tiltX = 0;
    let tiltY = 0;
    let smX = 0;
    let smY = 0;
    let raf = 0;

    const onOrient = (event) => {
      const gamma = clamp(event.gamma || 0, -45, 45);
      const beta = clamp((event.beta || 0) - 45, -45, 45);
      tiltX = (gamma / 45) * 90;
      tiltY = (beta / 45) * 45;
    };

    const onPointer = (event) => {
      tiltX = (event.clientX / window.innerWidth - 0.5) * 180;
      tiltY = (event.clientY / window.innerHeight - 0.5) * 90;
    };

    // rainbow เต็มสเปกตรัมในตราดวงเดียว (วน 0→360 ต่อเนื่องไม่มีรอยต่อ)
    const stops = [];
    for (let i = 0; i <= 12; i++) {
      stops.push(`hsl(${i * 30}, 90%, 28%) ${((i / 12) * 100).toFixed(1)}%`);
    }
    const rainbow = `linear-gradient(100deg, ${stops.join(", ")})`;
    // เส้นแสงอาทิตย์สะท้อนสีส้มอุ่น (ชั้นบนสุด)
    const sheen =
      "linear-gradient(100deg, transparent 34%," +
      " rgba(255,140,20,0.7) 42%, rgba(255,180,60,1) 47%," +
      " rgba(255,255,220,1) 50%, rgba(255,180,60,1) 53%," +
      " rgba(255,140,20,0.7) 58%, transparent 66%)";
    root.style.setProperty("--rainbow", rainbow);
    root.style.setProperty("--sheen", sheen);

    let prev = 0;
    const loop = (ts) => {
      const dt = Math.min(ts - prev, 50);
      prev = ts;
      smX += (tiltX - smX) * (1 - Math.pow(0.93, dt / 16.67));

      const flow = ts * 0.018 + smX * 1.5; // rainbow ไหลช้าๆ + เร่งด้วยการเอียง
      const sheenPos = ts * 0.05; // เส้นแสงวิ่งเร็วกว่า
      root.style.setProperty("--flow-fwd", `${flow}%`);
      root.style.setProperty("--flow-rev", `${-flow}%`);
      root.style.setProperty("--sheen-fwd", `${sheenPos % 200}%`);
      root.style.setProperty("--sheen-rev", `${200 - (sheenPos % 200)}%`);

      raf = window.requestAnimationFrame(loop);
    };
    raf = window.requestAnimationFrame(loop);

    window.addEventListener("deviceorientation", onOrient);
    window.addEventListener("pointermove", onPointer);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("deviceorientation", onOrient);
      window.removeEventListener("pointermove", onPointer);
    };
  }, [isUnlocked]);

  useEffect(() => {
    const phone = document.querySelector(".phone");
    if (!phone) return undefined;

    const DESIGN_WIDTH = 612;
    const fit = () => {
      const width = document.documentElement.clientWidth;
      phone.style.zoom = Math.min(width / DESIGN_WIDTH, 1);
    };

    fit();
    window.addEventListener("resize", fit);
    window.addEventListener("orientationchange", fit);
    return () => {
      window.removeEventListener("resize", fit);
      window.removeEventListener("orientationchange", fit);
    };
  }, []);

  const openExpanded = () => {
    setExpandedSide(isFlipped ? "back" : "front");
    setIsExpanded(true);
  };

  const closeExpanded = () => {
    setIsExpanded(false);
  };

  const FLIP_MS = 1000; // เวลาหมุนบัตร 1 วินาที

  const flipCard = () => {
    if (isFlipping) return; // กำลังหมุนอยู่ กดซ้ำไม่ได้
    setIsFlipping(true);
    setIsFlipped((value) => !value);
    window.setTimeout(() => setIsFlipping(false), FLIP_MS);
  };

  const rotateExpandedCard = () => {
    if (isFlipping) return;
    setIsFlipping(true);
    setExpandedSide((side) => (side === "front" ? "back" : "front"));
    window.setTimeout(() => setIsFlipping(false), FLIP_MS);
  };

  const showPreviousBanner = () => {
    setBannerIndex((index) => (index - 1 + banners.length) % banners.length);
  };

  const showNextBanner = () => {
    setBannerIndex((index) => (index + 1) % banners.length);
  };

  const openPin = () => {
    setPin("");
    setShowPin(true);
  };

  const closePin = () => {
    setShowPin(false);
    setPin("");
  };

  const enableMotion = () => {
    const D = window.DeviceOrientationEvent;
    if (D && typeof D.requestPermission === "function") {
      // iOS 13+ ต้องขอสิทธิ์จากการแตะของผู้ใช้
      D.requestPermission().catch(() => {});
    }
  };

  const pressDigit = (digit) => {
    setPin((current) => {
      if (current.length >= PIN_LENGTH) return current;
      const next = current + digit;
      if (next.length === PIN_LENGTH) {
        enableMotion();
        // mock: ใส่ครบ 6 หลักก็ปลดล็อก
        window.setTimeout(() => {
          setIsUnlocked(true);
          setShowPin(false);
          setPin("");
        }, 200);
      }
      return next;
    });
  };

  const pressBackspace = () => {
    setPin((current) => current.slice(0, -1));
  };

  return (
    <>
    {showSplash && (
      <div className="splash" role="status" aria-label="ThaiD">
        <img src="/assets/splash-full.png" alt="ThaiD" />
      </div>
    )}

    <main className="phone" aria-label="ThaiD React screen">
      <div className="scroll-area">
      <section className="hero">
        <header className="profile-row">
          <img className="avatar" src="/assets/avatar.png" alt="Profile" />
          <div className="profile-copy">
            <div className="greeting">
              <span>สวัสดี</span>
              <span className="online">ONLINE</span>
            </div>
            <h1>คุณ ธีรภัทร บัวชุม</h1>
          </div>

          <div className="header-actions">
            <button className="round-button" type="button" aria-label="แจ้งเตือน">
              <Bell size={28} />
            </button>
            <button className="round-button" type="button" aria-label="ออกจากระบบ">
              <Power size={29} />
            </button>
          </div>
        </header>

        <div className="card-zone">
          <button
            className={`card-shell ${isFlipped ? "is-flipped" : ""} ${isUnlocked ? "" : "is-locked"}`}
            type="button"
            aria-label={isUnlocked ? "สลับด้านบัตร" : "คลิกเพื่อแสดงข้อมูล"}
            aria-pressed={isFlipped}
            onClick={() => (isUnlocked ? flipCard() : openPin())}
          >
            <span className="card-inner">
              <img className="card-face card-front" src={cardImages.front} alt="ด้านหน้าบัตรประชาชน" />
              {isUnlocked && (
                <span className="holo-wrap" aria-hidden="true">
                  {SNAKE_SEALS.map((s) => (
                    <span
                      key={s.i}
                      className="snake-seal"
                      data-dir={s.dir}
                      style={{
                        left: `${s.x}%`,
                        top: `${s.y}%`,
                        width: `${s.w}%`,
                        height: `${s.h}%`,
                        WebkitMaskImage: `url(/assets/seal-${s.i}.png)`,
                        maskImage: `url(/assets/seal-${s.i}.png)`,
                      }}
                    />
                  ))}
                </span>
              )}
              <img className="card-face card-back" src={cardImages.back} alt="ด้านหลังบัตรประชาชน" />
            </span>
          </button>

          {!isUnlocked && (
            <button className="card-lock" type="button" onClick={openPin}>
              <span className="lock-badge">
                <Lock size={32} />
              </span>
              <span className="lock-text">คลิกเพื่อแสดงข้อมูล</span>
            </button>
          )}
        </div>

        <div className="quick-actions" aria-label="Card actions">
          <button className="circle-action" type="button" aria-label="ข้อมูลบุคคล">
            <UserRound size={24} />
          </button>
          <button className="expand-button" type="button" onClick={openExpanded}>
            <Maximize2 size={22} />
            <span>ขยายรูปบัตร</span>
          </button>
          <button
            className="circle-action"
            type="button"
            aria-label="รีเฟรชบัตร"
            onClick={() => setIsFlipped(false)}
          >
            <RotateCcw size={25} />
          </button>
        </div>
      </section>

      <section className="service-panel" aria-label="เมนูบริการ">
        <SectionHeader title="เมนูบริการ" />

        <div className="service-grid">
          {services.map(({ icon: Icon, label, muted }) => (
            <button className={`service-item ${muted ? "muted" : ""}`} type="button" key={label}>
              <span className="service-icon">
                <Icon size={43} />
              </span>
              <span>{label}</span>
            </button>
          ))}
        </div>

        <div className="carousel">
          <button className="side-tab left" type="button" aria-label="ก่อนหน้า" onClick={showPreviousBanner} />
          <div className="banner-viewport" aria-live="polite">
            <div className="banner-track" style={{ transform: `translateX(-${bannerIndex * 100}%)` }}>
              {banners.map((banner) => (
                <img src={banner.src} alt={banner.alt} key={banner.src} />
              ))}
            </div>
          </div>
          <button className="side-tab right" type="button" aria-label="ถัดไป" onClick={showNextBanner} />
        </div>
        <div className="dots" aria-label="สถานะแบนเนอร์">
          {banners.map((banner, index) => (
            <button
              className={index === bannerIndex ? "active" : ""}
              type="button"
              aria-label={`แสดงแบนเนอร์ ${index + 1}`}
              aria-current={index === bannerIndex}
              key={banner.src}
              onClick={() => setBannerIndex(index)}
            />
          ))}
        </div>
      </section>

      <section className="announcement-panel" aria-label="ประกาศทั้งหมด">
        <SectionHeader title="ประกาศทั้งหมด" />

        <article className="notice-card">
          <span className="notice-seal" aria-hidden="true" />
          <div className="notice-text">
            <h3>เชิญชวนผู้มีสิทธิเลือกตั้ง/ป...</h3>
            <p>กรมการปกครองขอเชิญชวนไปใช้สิทธิเลือกตั้ง ส.ส. และออก...</p>
          </div>
          <time dateTime="2025-02-06">6/02/25</time>
        </article>
      </section>
      </div>

      <button className="help-button" type="button" aria-label="ช่วยเหลือ">
        <MessageCircle size={43} />
      </button>

      <nav className="bottom-nav" aria-label="Bottom navigation">
        {tabs.map(({ id, icon: Icon, label, scan }) => (
          <button
            className={`nav-item ${activeTab === id ? "active" : ""} ${scan ? "scan-item" : ""}`}
            type="button"
            key={id}
            onClick={() => setActiveTab(id)}
          >
            {scan ? (
              <span className="scan-button">
                <Icon size={44} />
              </span>
            ) : (
              <Icon size={34} />
            )}
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </main>

      {isExpanded && (
        <section className="expanded-view" aria-label="ขยายรูปบัตร">
          <button className="overlay-button close-button" type="button" aria-label="ปิด" onClick={closeExpanded}>
            <ChevronLeft size={54} />
          </button>
          <button
            className="overlay-button rotate-button"
            type="button"
            aria-label="สลับด้านบัตร"
            onClick={rotateExpandedCard}
          >
            <RotateCcw size={42} />
          </button>
          <button
            className={`expanded-card ${expandedSide === "back" ? "show-back" : ""}`}
            type="button"
            aria-label="สลับด้านบัตรขยาย"
            aria-pressed={expandedSide === "back"}
            onClick={rotateExpandedCard}
          >
            <span className="expanded-card-inner">
              <img className="expanded-face expanded-front" src={cardImages.front} alt="ด้านหน้าบัตรประชาชนขยาย" />
              {isUnlocked && (
                <span className="holo-wrap" aria-hidden="true">
                  {SNAKE_SEALS.map((s) => (
                    <span
                      key={s.i}
                      className="snake-seal"
                      data-dir={s.dir}
                      style={{
                        left: `${s.x}%`,
                        top: `${s.y}%`,
                        width: `${s.w}%`,
                        height: `${s.h}%`,
                        WebkitMaskImage: `url(/assets/seal-${s.i}.png)`,
                        maskImage: `url(/assets/seal-${s.i}.png)`,
                      }}
                    />
                  ))}
                </span>
              )}
              <img className="expanded-face expanded-back" src={cardImages.back} alt="ด้านหลังบัตรประชาชนขยาย" />
            </span>
          </button>
        </section>
      )}

      {showPin && (
        <div className="pin-overlay" onClick={closePin}>
          <div className="pin-sheet" onClick={(event) => event.stopPropagation()}>
            <h2>ระบุรหัสผ่าน</h2>
            <div className="pin-dots">
              {Array.from({ length: PIN_LENGTH }).map((_, index) => (
                <span key={index} className={index < pin.length ? "filled" : ""} />
              ))}
            </div>
            <div className="pin-pad">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
                <button key={number} type="button" onClick={() => pressDigit(String(number))}>
                  {number}
                </button>
              ))}
              <span className="pin-spacer" />
              <button type="button" onClick={() => pressDigit("0")}>
                0
              </button>
              <button className="pin-back" type="button" aria-label="ลบ" onClick={pressBackspace}>
                <Delete size={30} />
              </button>
            </div>
            <button className="pin-forgot" type="button">
              ลืมรหัสผ่าน
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function SectionHeader({ title }) {
  return (
    <div className="section-heading">
      <h2>{title}</h2>
      <a href="#" onClick={(event) => event.preventDefault()}>
        <span>ทั้งหมด</span>
        <ChevronRight size={27} />
      </a>
    </div>
  );
}

export default App;
