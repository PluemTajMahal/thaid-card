import {
  Bell,
  Box,
  ChevronLeft,
  CheckSquare,
  ChevronRight,
  FileText,
  History,
  Home,
  IdCard,
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
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedSide, setExpandedSide] = useState("front");
  const [activeTab, setActiveTab] = useState("scan");
  const [bannerIndex, setBannerIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setBannerIndex((index) => (index + 1) % banners.length);
    }, 2800);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const phone = document.querySelector(".phone");
    if (!phone) return undefined;

    const DESIGN_WIDTH = 612;
    const fit = () => {
      const width = document.documentElement.clientWidth;
      phone.style.zoom = Math.min(width / DESIGN_WIDTH, 1) * 0.92;
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

  const rotateExpandedCard = () => {
    setExpandedSide((side) => (side === "front" ? "back" : "front"));
  };

  const showPreviousBanner = () => {
    setBannerIndex((index) => (index - 1 + banners.length) % banners.length);
  };

  const showNextBanner = () => {
    setBannerIndex((index) => (index + 1) % banners.length);
  };

  return (
    <>
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

        <button
          className={`card-shell ${isFlipped ? "is-flipped" : ""}`}
          type="button"
          aria-label="สลับด้านบัตร"
          aria-pressed={isFlipped}
          onClick={() => setIsFlipped((value) => !value)}
        >
          <span className="card-inner">
            <img className="card-face card-front" src={cardImages.front} alt="ด้านหน้าบัตรประชาชน" />
            <img className="card-face card-back" src={cardImages.back} alt="ด้านหลังบัตรประชาชน" />
          </span>
        </button>

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
              <img className="expanded-face expanded-back" src={cardImages.back} alt="ด้านหลังบัตรประชาชนขยาย" />
            </span>
          </button>
        </section>
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
