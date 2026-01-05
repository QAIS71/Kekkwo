import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, Upload, Download, Share2, Rocket, Sparkles, 
  ShieldCheck, RefreshCw, Image as ImageIcon, Globe, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_KEY = ""; // Environment handles the key

const translations = {
  ar: { 
    title: "سيلفي الفضاء الواقعي", 
    start: "إقلاع الآن", 
    loading: "جاري المعالجة المدارية...", 
    regions: ["الشرق الأوسط", "أوروبا", "أفريقيا", "آسيا", "الأمريكتين"],
    desc: "محاكاة واقعية 100% داخل مقصورة ISS"
  },
  en: { 
    title: "Realistic Space Selfie", 
    start: "Launch Now", 
    loading: "Orbital Processing...", 
    regions: ["Middle East", "Europe", "Africa", "Asia", "Americas"],
    desc: "100% Realistic simulation inside ISS Cupola"
  },
  zh: { title: "写实太空自拍", start: "立即发射", loading: "轨道处理中...", regions: ["中东", "欧洲", "非洲", "亚洲", "美洲"], desc: "ISS舱内100%真实模拟" },
  hi: { title: "यथार्थवादी अंतरिक्ष सेल्फी", start: "अभी लॉन्च करें", loading: "कक्षीय प्रसंस्करण...", regions: ["मध्य पूर्व", "यूरोप", "अफ्रीका", "एशिया", "अमेरिका"], desc: "ISS के अंदर 100% वास्तविक सिमुलेशन" },
  es: { title: "Selfie Espacial Realista", start: "Lanzar ahora", loading: "Procesamiento orbital...", regions: ["Medio Oriente", "Europa", "África", "Asia", "Américas"], desc: "Simulación 100% realista dentro de la ISS" },
  fr: { title: "Selfie Spatial Réaliste", start: "Lancer maintenant", loading: "Traitement orbital...", regions: ["Moyen-Orient", "Europe", "Afrique", "Asie", "Amériques"], desc: "Simulation 100% réaliste dans l'ISS" },
  ru: { title: "Реалистичное космическое селفي", start: "Запустить сейчас", loading: "Орбитальная обработка...", regions: ["Ближний Восток", "Европа", "Африка", "Азия", "Америка"], desc: "100% реалистичная симуляция внутри МКС" },
  ja: { title: "リアルな宇宙セルフィー", start: "今すぐ起動", loading: "軌道処理中...", regions: ["中東", "欧州", "アフリカ", "アジア", "アメリカ"], desc: "ISS内部の100%リアルなシミュレーション" },
  ko: { title: "사실적인 우주 셀카", start: "지금 발사", loading: "궤도 처리 중...", regions: ["중동", "유럽", "아프리카", "아시아", "아메리카"], desc: "ISS 내부의 100% 사실적인 시뮬레이션" }
};

const App = () => {
  const [lang, setLang] = useState('ar');
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [finalResult, setFinalResult] = useState(null);
  const [regionIndex, setRegionIndex] = useState(0);
  const [step, setStep] = useState(0);

  const t = translations[lang] || translations['en'];
  const fileInputRef = useRef(null);

  useEffect(() => {
    const userLang = navigator.language.split('-')[0];
    if (translations[userLang]) setLang(userLang);
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setFinalResult(null);
    }
  };

  const generateImage = async () => {
    if (!selectedImage) return;
    setIsProcessing(true);
    setStep(0);

    const stepInterval = setInterval(() => setStep(s => (s < 3 ? s + 1 : s)), 2000);

    try {
      const reader = new FileReader();
      const base64Promise = new Promise(r => {
        reader.onload = () => r(reader.result.split(',')[1]);
        reader.readAsDataURL(selectedImage);
      });
      const base64Data = await base64Promise;

      // البرومبت المطور لإظهار المقصورة بشكل أكبر وواقعية مذهلة
      const prompt = `A wide-angle, hyper-realistic 8K photograph taken inside the International Space Station's Cupola module. The camera shows a large portion of the module's interior structure, including control panels and metal framing. In the center, a high-tech tablet or digital frame is floating in zero-G, clearly displaying the person's face from the attached image. Through the massive wrap-around windows, the Earth is visible in stunning detail over ${t.regions[regionIndex]}, with glowing atmosphere and city lights. The lighting is cinematic, with natural blueish Earth-shine reflecting off the interior metal and the person's digital face. 100% real photography style, zero AI artifacts, looks like a NASA leak.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }, { inlineData: { mimeType: selectedImage.type, data: base64Data } }]
          }],
          generationConfig: { responseModalities: ['TEXT', 'IMAGE'] }
        })
      });

      const result = await response.json();
      const generatedImg = result.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;

      if (generatedImg) {
        setFinalResult(`data:image/png;base64,${generatedImg}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      clearInterval(stepInterval);
      setIsProcessing(false);
    }
  };

  return (
    <div className={`min-h-screen bg-[#050508] text-white overflow-x-hidden ${lang === 'ar' ? 'rtl font-sans' : 'ltr font-sans'}`} style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
      {/* Premium Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 blur-[150px] rounded-full"></div>
      </div>

      <nav className="relative z-10 border-b border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Rocket className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-black tracking-tighter uppercase">SpaceSelfie <span className="text-blue-500">PRO</span></h1>
          </motion.div>
          
          <div className="flex items-center gap-4 bg-white/5 p-1 rounded-full border border-white/10">
            <Globe className="w-4 h-4 text-white/40 mr-2 ml-2" />
            <select value={lang} onChange={(e) => setLang(e.target.value)} className="bg-transparent text-xs font-bold border-none outline-none cursor-pointer py-1 pr-4">
              {Object.keys(translations).map(l => <option key={l} value={l} className="bg-[#101015]">{l.toUpperCase()}</option>)}
            </select>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Input */}
          <div className="lg:col-span-5 space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <h2 className="text-4xl font-black mb-2">{t.title}</h2>
              <p className="text-white/40 text-lg">{t.desc}</p>
            </motion.div>

            <div className="bg-[#0a0a0f]/80 border border-white/10 rounded-[32px] p-8 backdrop-blur-sm space-y-8">
              {/* Uploader */}
              <div className="space-y-4">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative group aspect-square max-w-[280px] mx-auto rounded-[40px] border-2 border-dashed transition-all cursor-pointer overflow-hidden ${
                    previewUrl ? 'border-blue-500 bg-blue-500/5' : 'border-white/10 hover:border-white/30'
                  }`}
                >
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                  {previewUrl ? (
                    <img src={previewUrl} className="w-full h-full object-cover" alt="User" />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                      <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Camera className="w-8 h-8 text-white/20" />
                      </div>
                      <span className="text-xs font-black uppercase tracking-[0.2em] text-white/30">Upload Portrait</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Region */}
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase text-white/20 tracking-[0.3em] text-center">Orbital Vector</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {t.regions.map((name, i) => (
                    <button 
                      key={i} 
                      onClick={() => setRegionIndex(i)}
                      className={`px-4 py-2 rounded-full text-[11px] font-bold transition-all border ${
                        regionIndex === i ? 'bg-white text-black border-white shadow-xl' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={generateImage}
                disabled={!selectedImage || isProcessing}
                className="w-full group relative py-5 rounded-2xl font-black text-lg overflow-hidden transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-400"></div>
                <div className="relative flex items-center justify-center gap-3">
                  {isProcessing ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Rocket className="w-6 h-6" />}
                  {isProcessing ? t.loading : t.start}
                </div>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center justify-between px-4 py-4 bg-white/5 rounded-2xl border border-white/5">
              <div className="flex items-center gap-2 opacity-40">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Encrypted</span>
              </div>
              <div className="flex items-center gap-2 opacity-40">
                <ImageIcon className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">8K HDR</span>
              </div>
            </div>
          </div>

          {/* Right Column: Viewer */}
          <div className="lg:col-span-7">
            <div className="sticky top-32">
              <div className="relative aspect-[16/10] lg:aspect-square bg-black rounded-[40px] border border-white/10 overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)]">
                <AnimatePresence mode="wait">
                  {isProcessing ? (
                    <motion.div 
                      key="loading"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="absolute inset-0 flex flex-col items-center justify-center bg-[#050508] z-20"
                    >
                      <div className="relative w-24 h-24 mb-8">
                        <div className="absolute inset-0 border-4 border-blue-500/10 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-blue-500 animate-pulse" />
                      </div>
                      <p className="text-xl font-black tracking-widest uppercase animate-pulse">{t.loading}</p>
                    </motion.div>
                  ) : finalResult ? (
                    <motion.div key="result" initial={{ scale: 1.1, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="h-full relative group">
                      <img src={finalResult} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt="Space Selfie" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent p-8 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex gap-4">
                          <button 
                            onClick={() => {const a=document.createElement('a'); a.href=finalResult; a.download='ISS_Selfie.png'; a.click();}}
                            className="flex-1 py-4 bg-white text-black rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-blue-50 transition"
                          >
                            <Download className="w-5 h-5" /> DOWNLOAD 8K
                          </button>
                          <button className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center hover:bg-white/20 transition">
                            <Share2 className="w-6 h-6" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center space-y-4">
                      <Globe className="w-24 h-24 text-white/5 opacity-20" />
                      <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20">Orbital Signal Standby</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>

              {/* Ad Slot */}
              <div className="mt-8 h-24 bg-gradient-to-r from-blue-900/10 via-white/5 to-blue-900/10 border border-white/5 rounded-3xl flex items-center justify-center">
                <span className="text-white/20 text-[10px] font-black tracking-[0.5em] uppercase">ADVERTISEMENT SPACE</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-20 py-12 border-t border-white/5 opacity-30 text-center">
        <p className="text-[10px] font-bold tracking-[0.3em] uppercase">SpaceOS Global Visual Engine v3.0</p>
      </footer>
    </div>
  );
};

export default App;

