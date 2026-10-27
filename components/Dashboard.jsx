"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Droplets,
  Sprout,
  Calendar,
  Sun,
  Moon,
  Wind,
  Volume2,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Globe,
  MapPin,
  CloudRain,
  Navigation,
  ExternalLink,
  Settings,
} from "lucide-react";

const SINDH_LOCATIONS = {
  Sukkur: {
    lat: 27.7052,
    lng: 68.8574,
    canal: "Sukkur Barrage • Rohri & Nara Canal Command",
    soil: "Alluvial Silt Loam (Kacho & Pacco Plains)",
  },
  Larkana: {
    lat: 27.557,
    lng: 68.2028,
    canal: "Sukkur Barrage • Rice & Dadu Canal Command",
    soil: "Heavy Clay Loam (Paddy Belt)",
  },
  Sanghar: {
    lat: 26.0436,
    lng: 68.948,
    canal: "Nara Canal & Jamrao Canal Command",
    soil: "Sandy Clay Loam (Cotton & Wheat Core Zone)",
  },
  Badin: {
    lat: 24.6558,
    lng: 68.8383,
    canal: "Kotri Barrage • Akram Wah & Fuleli Command",
    soil: "Coastal Deltaic Loam (Sugarcane & Rice Zone)",
  },
  Mirpurkhas: {
    lat: 25.5276,
    lng: 69.0159,
    canal: "Jamrao & Mithrao Canal Command",
    soil: "Fertile Loam (Sindhri Mango & Cotton Belt)",
  },
  Hyderabad: {
    lat: 25.396,
    lng: 68.3578,
    canal: "Kotri Barrage • Rohri Lower & Fuleli Canal",
    soil: "Rich Indus Alluvial Loam (Tandojam Agro Zone)",
  },
};

const CROPS_DATABASE = {
  wheat: {
    season: "Rabi",
    seasonBadge: "Rabi (Winter • Nov–Apr)",
    icon: "🌾",
    names: {
      en: "Wheat (ڪڻڪ / گندم)",
      ur: "گندم (Wheat)",
      sd: "ڪڻڪ (Wheat)",
    },
    varieties: "TD-1, Kiran-95, Benazir, Imdad, Mehran",
    stage: "Crown Root Initiation (CRI) — Day 24",
    steps: {
      seeding: {
        window: "Nov 01 – Nov 25",
        badge: "Drill Sowing",
        detail:
          "Use 50–55 kg certified seed/acre (TD-1 or Kiran-95). Treat seed with Tebuconazole @ 1.5g/kg. Drill at 1.5–2 inch depth with 9-inch row spacing after laser land leveling.",
      },
      irrigation: {
        window: "4–5 Irrigations (Total)",
        badge: "1st Kor: Day 21",
        detail:
          "1st critical irrigation (Kor) at Day 21–25 (CRI stage). 2nd at Tillering (Day 45), 3rd at Booting (Day 75), 4th at Milk stage (Day 100). Skip irrigation if >12mm rain is forecast.",
      },
      fertilizer: {
        window: "Basal + 2 Splits",
        badge: "NPK + Zinc",
        detail:
          "Basal: 1.5 bags DAP + 1 bag SOP per acre at seeding. 1st Irrigation: 1 bag Urea + 10kg Zinc Sulfate (33%). 2nd Irrigation: 1 bag Urea before booting.",
      },
      harvesting: {
        window: "March 25 – April 15",
        badge: "Moisture < 14%",
        detail:
          "Harvest when stems turn golden-yellow and grain cracks firmly between teeth (<14% moisture). Stack sheaves on elevated dry bunds if rain clouds appear.",
      },
      thresher: {
        window: "April 01 – April 25",
        badge: "550–600 RPM",
        detail:
          "Set wheat thresher drum speed to 550–600 RPM with 18mm concave clearance to prevent broken grains. Never thresh damp sheaves after rain; sun-dry to 12% moisture.",
      },
    },
    aiResponse:
      "Sukkur & Sanghar Wheat Advisory: Night temperatures are 14°C—optimal for tillering. Apply 1st Kor irrigation on Day 21 unless live radar indicates >10mm rainfall within 48 hours.",
  },
  cotton: {
    season: "Kharif",
    seasonBadge: "Kharif (Summer • Apr–Nov)",
    icon: "☁️",
    names: {
      en: "Cotton (ڪپهه / کپاس)",
      ur: "کپاس (Cotton)",
      sd: "ڪپهه (Cotton)",
    },
    varieties: "Sindh-1, Cris-134, IUB-13, FH-142 (Bt)",
    stage: "Boll Opening & Final Picking Stage",
    steps: {
      seeding: {
        window: "April 15 – May 20",
        badge: "Bed-Furrow",
        detail:
          "Sow 6–8 kg delinted seed/acre on 2.5 ft ridges (Bed planting) to save 30% canal water and protect roots from monsoon waterlogging.",
      },
      irrigation: {
        window: "6–8 Irrigations",
        badge: "Drainage Critical",
        detail:
          "First irrigation 30–35 days after sowing; subsequent waterings every 12–15 days. Immediately drain standing rain water within 24 hours.",
      },
      fertilizer: {
        window: "Basal + 3 Splits",
        badge: "Boron + Potash",
        detail:
          "1.5 bags DAP + 1 bag SOP basal; 2.5 bags Urea in 3 splits. Spray 2% SOP + Boron @ 300g/acre at peak flowering.",
      },
      harvesting: {
        window: "Sept 15 – Nov 20",
        badge: "Dew-Free Picking",
        detail:
          "Start picking after 10:00 AM once morning dew evaporates. Pick clean dry lint into cotton cloth sheets.",
      },
      thresher: {
        window: "Nov 15 – Dec 05",
        badge: "Stalk Shredder",
        detail:
          "Run a tractor-mounted Cotton Stalk Shredder/Rotavator immediately after final picking to crush leftover bolls and destroy Pink Bollworm larvae.",
      },
    },
    aiResponse:
      "Sanghar & Mirpurkhas Cotton Advisory: Pick open bolls immediately before any forecast rain shower to prevent lint grade discoloration.",
  },
  rice: {
    season: "Kharif",
    seasonBadge: "Kharif (Monsoon • May–Nov)",
    icon: "🌱",
    names: {
      en: "Rice / Paddy (چانور / چاول)",
      ur: "چاول / دھان (Rice)",
      sd: "چانور / ساريون (Rice)",
    },
    varieties: "IRRI-6, Kainat-1121, Super Basmati, Hybrid Arize",
    stage: "Grain Maturity & Paddy Threshing Phase",
    steps: {
      seeding: {
        window: "May 15 – June 25",
        badge: "Nursery + Transplant",
        detail:
          "Raise nursery (Bejaro) in May using 6–8 kg seed/acre for IRRI-6. Transplant 25–30 day old seedlings at 8x8 inch spacing.",
      },
      irrigation: {
        window: "Continuous Ponding",
        badge: "2–3 Inch Standing",
        detail:
          "Maintain 2–3 inches standing canal water for first 30 days, then alternate wetting and drying. Drain field 15 days before harvest.",
      },
      fertilizer: {
        window: "Basal + 2 Splits",
        badge: "Zinc Mandatory",
        detail:
          "1.5 bags DAP basal + 2 bags Urea split + 10 kg Zinc Sulfate (33%) at Day 12 to prevent Khaira disease in Upper Sindh.",
      },
      harvesting: {
        window: "Oct 15 – Nov 20",
        badge: "85% Golden Panicles",
        detail:
          "Harvest when 85% of panicle grains turn golden straw-colored and grain moisture is 20–22%.",
      },
      thresher: {
        window: "Oct 20 – Nov 25",
        badge: "Paddy Thresher 450 RPM",
        detail:
          "Use axial-flow Paddy Thresher at 400–450 RPM within 24 hours of cutting. Sun-dry paddy on tarpaulins to 12–13% moisture.",
      },
    },
    aiResponse:
      "Larkana & Badin Rice Advisory: Keep tarpaulins ready during paddy threshing. Residual soil moisture (34%) is ideal for Dubari Chickpea sowing.",
  },
  sugarcane: {
    season: "Kharif",
    seasonBadge: "Perennial / Annual (Sept & Feb)",
    icon: "🎋",
    names: {
      en: "Sugarcane (ڪمند / گنا)",
      ur: "گنا / کماد (Sugarcane)",
      sd: "ڪمند (Sugarcane)",
    },
    varieties: "Thatta-10, SPF-234, NIA-2012, Th-2109",
    stage: "Grand Sucrose Maturity & Crushing Phase",
    steps: {
      seeding: {
        window: "Sept–Oct or Feb–Mar",
        badge: "3-Budded Setts",
        detail:
          "Plant 30,000–35,000 three-budded healthy cane setts (100–120 Maunds/acre) in 4-foot deep trenches treated with fungicide.",
      },
      irrigation: {
        window: "16–20 Irrigations",
        badge: "Stop 18d Pre-Harvest",
        detail:
          "Irrigate every 10–12 days in summer and 20–25 days in winter. Stop irrigation 18 days before harvesting to maximize sucrose recovery.",
      },
      fertilizer: {
        window: "Basal + 3 Splits + Earthing",
        badge: "High Potash",
        detail:
          "2 bags DAP + 2 bags SOP at planting. Apply 3.5 bags Urea in 3 splits before July, followed by earthing-up to prevent lodging.",
      },
      harvesting: {
        window: "Nov 25 – March 15",
        badge: "Ground-Level Cut",
        detail:
          "Harvest flush with ground level using sharp Tokas to promote vigorous ratoon sprouting.",
      },
      thresher: {
        window: "24-Hr Mill Delivery",
        badge: "Trash Mulcher",
        detail:
          "Deliver cane to Sugar Mills within 24 hours of cutting. Run a Tractor Trash Mulcher in the field instead of burning cane trash.",
      },
    },
    aiResponse:
      "Badin & Shaheed Benazirabad Sugarcane Advisory: Withhold irrigation now to boost Brix sucrose reading.",
  },
  mustard: {
    season: "Rabi",
    seasonBadge: "Rabi (Oilseed • Oct–Mar)",
    icon: "🌼",
    names: {
      en: "Mustard / Sarsoon (سرنهن / سرسوں)",
      ur: "سرسوں / رایا (Mustard)",
      sd: "سرنهن / رايو (Mustard)",
    },
    varieties: "Sindh Raya, Toria, Super Canola, Mehran Raya",
    stage: "Rosette & Early Flowering Initiation",
    steps: {
      seeding: {
        window: "Oct 10 – Nov 20",
        badge: "2–3 kg Seed/Acre",
        detail:
          "Drill 2–3 kg seed/acre mixed with dry sand at 1.5 ft row spacing. Ideal low-water cash crop for tail-end canal commands.",
      },
      irrigation: {
        window: "2–3 Irrigations Only",
        badge: "Low Water Need",
        detail:
          "1st irrigation at 30 days (branching), 2nd at flowering, and 3rd at pod filling.",
      },
      fertilizer: {
        window: "Basal + 1st Water",
        badge: "Sulfur Boosts Oil",
        detail:
          "1 bag DAP + 10kg Bentonite Sulfur at sowing + 1 bag Urea at first irrigation to increase oil content by 4%.",
      },
      harvesting: {
        window: "Feb 20 – March 20",
        badge: "75% Yellow Pods",
        detail:
          "Cut crop in early morning hours when 75% of pods turn golden-yellow to prevent pod shattering.",
      },
      thresher: {
        window: "March 01 – March 28",
        badge: "Low-Speed 400 RPM",
        detail:
          "Cure bundles for 5 days on clean threshing floor, then run through a fine-sieve Mustard Thresher at 380–420 RPM.",
      },
    },
    aiResponse:
      "Mirpurkhas & Khairpur Mustard Advisory: Scout for Aphids during cloudy spells and apply sulfur with first irrigation.",
  },
  chickpea: {
    season: "Rabi",
    seasonBadge: "Rabi (Dubari • Oct–Mar)",
    icon: "🫘",
    names: {
      en: "Chickpea / Gram (چڻا / چنا)",
      ur: "چنا / گرام (Chickpea)",
      sd: "چڻا (Chickpea / Dubari)",
    },
    varieties: "DG-92, Sanyasi, Chhola, Kabuli",
    stage: "Residual Moisture Vegetative Growth",
    steps: {
      seeding: {
        window: "Oct 25 – Nov 30",
        badge: "Residual Paddy Moisture",
        detail:
          "Drill 35–40 kg seed/acre directly into residual moisture (Dubari) of harvested rice fields in Larkana & Jacobabad.",
      },
      irrigation: {
        window: "0–1 Irrigation",
        badge: "No Flowering Water",
        detail:
          "Grows on sub-surface moisture & winter dew. Never irrigate during open flowering or roots will wilt.",
      },
      fertilizer: {
        window: "Basal Only",
        badge: "1 Bag DAP",
        detail:
          "Apply 1 bag DAP per acre at drilling + 10kg starter Urea; fixes atmospheric nitrogen naturally.",
      },
      harvesting: {
        window: "March 15 – April 05",
        badge: "Brown Dry Pods",
        detail:
          "Harvest when leaves turn reddish-brown and pods rattle dryly.",
      },
      thresher: {
        window: "March 25 – April 15",
        badge: "Wide Concave 450 RPM",
        detail:
          "Sun-dry harvested heaps for 5 days, then thresh using a wide-clearance Pulse/Gram Thresher at 450 RPM.",
      },
    },
    aiResponse:
      "Larkana & Jacobabad Gram Advisory: Residual paddy moisture is optimal right now. Do not irrigate if winter showers are forecast.",
  },
};

export default function Dashboard() {
  const [theme, setTheme] = useState("dark");
  const [lang, setLang] = useState("en");
  const [seasonFilter, setSeasonFilter] = useState("ALL");
  const [selectedCrop, setSelectedCrop] = useState("wheat");
  const [district, setDistrict] = useState("Sukkur");
  const [coords, setCoords] = useState({ lat: 27.7052, lng: 68.8574 });
  const [weather, setWeather] = useState({
    temp: 28.4,
    humidity: 44,
    windSpeed: 12.5,
    rainProb: 10,
    simulatedStorm: false,
  });
  const [voiceState, setVoiceState] = useState("idle");

  const currentCrop = CROPS_DATABASE[selectedCrop];
  const locInfo = SINDH_LOCATIONS[district] || SINDH_LOCATIONS.Sukkur;

  useEffect(() => {
    const html = document.documentElement;
    if (theme === "light") {
      html.classList.remove("dark");
      html.classList.add("light");
    } else {
      html.classList.remove("light");
      html.classList.add("dark");
    }
  }, [theme]);

  useEffect(() => {
    async function loadWeather() {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m&hourly=precipitation_probability&forecast_days=2`
        );
        if (res.ok) {
          const data = await res.json();
          const probs = data.hourly?.precipitation_probability?.slice(0, 12) || [10];
          setWeather((prev) =>
            prev.simulatedStorm
              ? prev
              : {
                  ...prev,
                  temp: data.current?.temperature_2m ?? 28.4,
                  humidity: data.current?.relative_humidity_2m ?? 44,
                  windSpeed: data.current?.wind_speed_10m ?? 12.5,
                  rainProb: Math.max(...probs, 0),
                }
          );
        }
      } catch {
        // Fallback default telemetry
      }
    }
    loadWeather();
  }, [coords]);

  const handleLiveGps = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => {
          setCoords({ lat: 25.4251, lng: 68.5368 });
        }
      );
    }
  };

  const toggleRainAlertSimulation = () => {
    setWeather((prev) => {
      const nextStorm = !prev.simulatedStorm;
      return nextStorm
        ? {
            temp: 22.0,
            humidity: 86,
            windSpeed: 38.0,
            rainProb: 88,
            simulatedStorm: true,
          }
        : {
            temp: 28.4,
            humidity: 44,
            windSpeed: 12.5,
            rainProb: 10,
            simulatedStorm: false,
          };
    });
  };

  const isStormAlert = weather.rainProb >= 50 || weather.windSpeed >= 30;

  return (
    <div
      dir={lang === "en" ? "ltr" : "rtl"}
      className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-slate-950"
    >
      {/* Top Bar with Dark/Light Mode + Language Toggle */}
      <header className="sticky top-0 z-30 border-b border-emerald-900/50 bg-slate-950/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-800 shadow-lg">
              <Sprout className="h-6 w-6 text-slate-950" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-emerald-400">
                AgriSync AI
              </h1>
              <p className="text-xs text-slate-400">
                Sindh Smart Agriculture, Live Land GPS & Weather Intelligence
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Dark / Light Mode Toggle */}
            <button
              type="button"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-bold text-amber-300 hover:border-emerald-500"
            >
              {theme === "dark" ? (
                <>
                  <Sun className="h-4 w-4" /> Light Mode (Field Sun)
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4" /> Dark Mode (Night)
                </>
              )}
            </button>

            {/* 3-Way Language Switcher */}
            <div className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900/90 p-1">
              <Globe className="mx-1.5 h-4 w-4 text-emerald-400" />
              {[
                { code: "en", label: "English" },
                { code: "ur", label: "اردو" },
                { code: "sd", label: "سنڌي" },
              ].map((item) => (
                <button
                  key={item.code}
                  onClick={() => setLang(item.code)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    lang === item.code
                      ? "bg-emerald-500 text-slate-950 shadow-md"
                      : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-6">
        {/* Live GPS Map + Real-Time Weather & Rain Alerts */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-extrabold text-white">
                Live GPS Land Tracker & Weather Alert Radar
              </h2>
              <p className="text-xs text-slate-400">
                Pinpoint your Sindh farm coordinates, SIDA canal command, and
                upcoming rain/thresher alerts
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleLiveGps}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3.5 py-2 text-xs font-extrabold text-slate-950 hover:bg-emerald-400"
              >
                <Navigation className="h-3.5 w-3.5" /> Detect My Live GPS Land
              </button>
              <button
                type="button"
                onClick={toggleRainAlertSimulation}
                className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/50 bg-amber-950/50 px-3.5 py-2 text-xs font-bold text-amber-300"
              >
                <CloudRain className="h-3.5 w-3.5" /> Simulate Rain Alert
              </button>
              <a
                href={`https://www.google.com/maps?q=${coords.lat},${coords.lng}&z=16&t=k`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-emerald-400"
              >
                Open in Google Maps <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* Dynamic Rain / Thresher Alert Banner */}
          <div
            className={`rounded-2xl border p-4 transition-all ${
              isStormAlert
                ? "border-red-500 bg-red-950/60"
                : "border-emerald-500/40 bg-emerald-950/30"
            }`}
          >
            <p
              className={`text-sm font-extrabold uppercase ${
                isStormAlert ? "text-red-300" : "text-emerald-300"
              }`}
            >
              {isStormAlert
                ? `🚨 URGENT SINDH RAIN & WIND ALERT (${weather.rainProb}% Rain Prob • ${weather.windSpeed} km/h Wind)`
                : "✅ CLEAR AGRO-WEATHER WINDOW — SAFE FOR SEEDING, IRRIGATION & THRESHER"}
            </p>
            <p className="mt-1 text-xs text-slate-200">
              {isStormAlert
                ? "IMMEDIATE ACTION: 1) Stop all Wheat/Paddy Thresher operations & cover grain heaps with tarpaulins. 2) Close canal watercourse turn (Nakko). 3) Delay Urea & pesticide sprays."
                : "No rain expected in the next 48 hours. Optimal field conditions for seed drilling, canal irrigation, and operating grain threshers."}
            </p>
          </div>

          {/* Interactive Google Maps / OSM Embed + Weather Telemetry */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/75 p-4 lg:col-span-7 space-y-3">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-bold text-emerald-400">
                  Sindh District Pins:
                </span>
                {Object.keys(SINDH_LOCATIONS).map((dist) => (
                  <button
                    key={dist}
                    onClick={() => {
                      setDistrict(dist);
                      setCoords({
                        lat: SINDH_LOCATIONS[dist].lat,
                        lng: SINDH_LOCATIONS[dist].lng,
                      });
                    }}
                    className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${
                      district === dist
                        ? "border-emerald-500 bg-emerald-500/20 text-emerald-300"
                        : "border-slate-800 bg-slate-950 text-slate-400"
                    }`}
                  >
                    {dist}
                  </button>
                ))}
              </div>

              <iframe
                title="Sindh Farm Satellite Map"
                width="100%"
                height="310"
                className="rounded-2xl border border-slate-800"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                  coords.lng - 0.04
                }%2C${coords.lat - 0.03}%2C${coords.lng + 0.04}%2C${
                  coords.lat + 0.03
                }&layer=mapnik&marker=${coords.lat}%2C${coords.lng}`}
              />
            </div>

            <div className="space-y-4 lg:col-span-5">
              <div className="rounded-3xl border border-slate-800 bg-slate-900/75 p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold uppercase text-emerald-400">
                    Identified Land Telemetry
                  </span>
                  <span className="font-mono text-xs text-amber-300">
                    {coords.lat.toFixed(4)}°N, {coords.lng.toFixed(4)}°E
                  </span>
                </div>
                <p className="text-lg font-extrabold text-white">
                  {district} Canal Command
                </p>
                <p className="text-xs text-emerald-300">{locInfo.canal}</p>
                <p className="text-xs text-amber-300">Soil: {locInfo.soil}</p>
              </div>

              <div className="rounded-3xl border border-slate-800 bg-slate-900/75 p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold uppercase text-sky-400">
                    Live Weather Telemetry
                  </span>
                  <span className="rounded-full bg-sky-500/20 px-2.5 py-0.5 text-xs font-bold text-sky-300">
                    {weather.rainProb}% Rain Prob
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                    <span className="text-[11px] text-slate-400">Temp</span>
                    <p className="mt-1 text-lg font-extrabold text-white">
                      {weather.temp}°C
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                    <span className="text-[11px] text-slate-400">Humidity</span>
                    <p className="mt-1 text-lg font-extrabold text-emerald-400">
                      {weather.humidity}%
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                    <span className="text-[11px] text-slate-400">Wind</span>
                    <p className="mt-1 text-lg font-extrabold text-amber-300">
                      {weather.windSpeed} km/h
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Seasons & Multi-Crop 5-Stage Lifecycle (Seeding, Irrigation, Fertilizer, Harvest, Thresher) */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-xl font-extrabold text-white">
                Seasons & Complete Crop Guide (Seeding to Thresher)
              </h3>
              <p className="text-xs text-emerald-400">{currentCrop.stage}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {["ALL", "Rabi", "Kharif"].map((s) => (
                <button
                  key={s}
                  onClick={() => setSeasonFilter(s)}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-bold ${
                    seasonFilter === s
                      ? "bg-amber-500 text-slate-950"
                      : "border border-slate-700 bg-slate-900 text-slate-300"
                  }`}
                >
                  {s === "ALL" ? "All Seasons" : `${s} Season`}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {Object.keys(CROPS_DATABASE)
              .filter(
                (k) =>
                  seasonFilter === "ALL" ||
                  CROPS_DATABASE[k].season === seasonFilter
              )
              .map((cropKey) => (
                <button
                  key={cropKey}
                  onClick={() => setSelectedCrop(cropKey)}
                  className={`rounded-xl border px-3.5 py-2 text-xs font-semibold ${
                    selectedCrop === cropKey
                      ? "border-emerald-500 bg-emerald-500/20 text-emerald-300"
                      : "border-slate-800 bg-slate-900 text-slate-400"
                  }`}
                >
                  {CROPS_DATABASE[cropKey].icon}{" "}
                  {CROPS_DATABASE[cropKey].names[lang]}
                </button>
              ))}
          </div>

          {/* 5 Operational Cards: Seeding, Irrigation, Fertilizer, Harvesting, Thresher */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              { key: "seeding", label: "1. Seeding & Sowing" },
              { key: "irrigation", label: "2. Irrigation Schedule" },
              { key: "fertilizer", label: "3. Fertilizer & Care" },
              { key: "harvesting", label: "4. Harvesting Guide" },
              { key: "thresher", label: "5. Thresher & Post-Harvest" },
            ].map((item) => {
              const stepObj = currentCrop.steps[item.key];
              return (
                <div
                  key={item.key}
                  className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-emerald-400">
                        {item.label}
                      </span>
                      <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-semibold text-amber-300">
                        {stepObj.badge}
                      </span>
                    </div>
                    <p className="mt-2.5 text-base font-extrabold text-white">
                      {stepObj.window}
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-slate-300">
                      {stepObj.detail}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
