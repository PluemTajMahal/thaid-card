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

// ตรา 8 ดวง เรียงตามลำดับงู (มาสก์รายดวง seal-0..7.png)
const SNAKE_SEALS = [0, 1, 2, 3, 4, 5, 6, 7];

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

    let tiltX = 0; // ออฟเซ็ตไล่สีจากการเอียง (ซ้าย-ขวา)
    let tiltY = 0; // (หน้า-หลัง)
    let smX = 0; // smooth tilt
    let smY = 0;
    let t = 0; // เวลาเดินคลื่นสี
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

    const loop = () => {
      t += 0.006; // ช้าๆ
      smX += (tiltX - smX) * 0.07;
      smY += (tiltY - smY) * 0.07;
      // คลื่นสี+แสง ไล่ทีละดวงตามลำดับงู (แต่ละดวง offset ตาม index)
      const seals = document.querySelectorAll(".snake-seal");
      seals.forEach((el) => {
        const j = Number(el.dataset.i);
        const p = t - j * 0.62 + smX * 0.012;
        const hue = p * 64; // สีเลื่อนไล่ทีละดวง
        const f = p - Math.floor(p);
        const light = Math.exp(-(((f - 0.5) / 0.13) ** 2) / 2); // แสงวิ่งผ่านทีละดวง
        el.style.setProperty("--h", `${hue}deg`);
        el.style.setProperty("--b", (0.8 + 0.55 * light).toFixed(3));
      });
      raf = window.requestAnimationFrame(loop);
    };
    loop();

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
                  {SNAKE_SEALS.map((j) => (
                    <span
                      key={j}
                      className="snake-seal"
                      data-i={j}
                      style={{
                        WebkitMaskImage: `url(/assets/seal-${j}.png)`,
                        maskImage: `url(/assets/seal-${j}.png)`,
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
                  {SNAKE_SEALS.map((j) => (
                    <span
                      key={j}
                      className="snake-seal"
                      data-i={j}
                      style={{
                        WebkitMaskImage: `url(/assets/seal-${j}.png)`,
                        maskImage: `url(/assets/seal-${j}.png)`,
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
