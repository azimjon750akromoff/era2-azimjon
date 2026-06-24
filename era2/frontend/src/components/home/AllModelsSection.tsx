import { useRef, useState } from "react";
import { m } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useCarouselBounds } from "@/shared/lib/use-carousel-bounds";
import { useDragScroll } from "@/shared/lib/use-drag-scroll";
import { aiPhotos, aiArt, aiVideo, aiLandscapes } from "@/entities/generation";

const allImages = [...aiPhotos.slice(0, 3), ...aiArt.slice(0, 2), ...aiLandscapes.slice(0, 2), ...aiVideo.slice(0, 3), ...aiPhotos.slice(3, 5), ...aiArt.slice(2, 4)];

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { show: { transition: { staggerChildren: 0.08 } } };

const imageTools = [
  { name: "Текст в изображение", sub: "Text to Image" },
  { name: "Изображение в изображение", sub: "Image to Image" },
  { name: "Генерация аватаров", sub: "AI Avatars" },
  { name: "Генерация логотипов", sub: "Logo Generation" },
  { name: "Арт и иллюстрации", sub: "Art & Illustrations" },
  { name: "Фотореализм", sub: "Photorealism" },
  { name: "Стикеры и эмодзи", sub: "Stickers & Emoji" },
];

const videoTools = [
  { name: "Текст в видео", sub: "Text to Video" },
  { name: "Изображение в видео", sub: "Image to Video" },
  { name: "Контроль движения", sub: "Motion Control" },
  { name: "Видео с аудио", sub: "Video with Audio" },
  { name: "Анимация персонажей", sub: "Character Animation" },
  { name: "Кинематографичные сцены", sub: "Cinematic Scenes" },
  { name: "Короткие клипы", sub: "Short Clips" },
];

export function AllModelsSection() {
  const [tab, setTab] = useState<"image" | "video">("image");
  const tools = tab === "image" ? imageTools : videoTools;

  const scrollerRef = useRef<HTMLDivElement>(null);
  const { canPrev, canNext, scrollBy, scrollToStart } = useCarouselBounds(scrollerRef, [tab]);
  const dragHandlers = useDragScroll(scrollerRef, canPrev || canNext);

  const handleTabChange = (next: "image" | "video") => {
    if (next === tab) return;
    setTab(next);
    scrollToStart();
  };

  return (
    <m.section
      className="max-w-[1200px] mx-auto px-4"
      style={{ padding: "80px 0" }}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      variants={stagger}
    >
      <m.div variants={fadeUp} className="text-center mb-8">
        <h2 className="text-2xl md:text-[32px] font-bold mb-3">Все инструменты в одной подписке</h2>
        <p className="text-base text-muted-foreground">
          Создавайте контент и тренды на базе лучших ИИ
        </p>
      </m.div>

      <m.div variants={fadeUp} className="flex justify-center mb-8">
        <div className="inline-flex gap-1 p-1 rounded-xl bg-muted/50 dark:bg-[rgba(255,255,255,0.06)]">
          <button
            type="button"
            onClick={() => handleTabChange("image")}
            className={cn("px-5 py-2 rounded-[8px] text-sm cursor-pointer", tab === "image" ? "text-foreground font-medium" : "text-muted-foreground")}
            style={tab === "image" ? { background: "linear-gradient(135deg, hsl(var(--primary)), #ff7a3d)" } : undefined}
          >
            Инструменты изображений
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("video")}
            className={cn("px-5 py-2 rounded-[8px] text-sm cursor-pointer", tab === "video" ? "text-foreground font-medium" : "text-muted-foreground")}
            style={tab === "video" ? { background: "linear-gradient(135deg, hsl(var(--primary)), #ff7a3d)" } : undefined}
          >
            Инструменты видео
          </button>
        </div>
      </m.div>

      <m.div variants={fadeUp} className="relative group">
        <button
          type="button"
          aria-label="Предыдущие инструменты"
          onClick={() => scrollBy(-1)}
          disabled={!canPrev}
          className={cn(
            "hidden lg:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-[rgba(0,0,0,0.6)] border border-[rgba(255,255,255,0.1)] items-center justify-center text-white transition-opacity hover:bg-[#E85420] hover:border-[#E85420]",
            canPrev ? "opacity-0 group-hover:opacity-100 cursor-pointer" : "opacity-0 pointer-events-none",
          )}
        >
          <ChevronLeft size={16} />
        </button>

        <div
          ref={scrollerRef}
          {...dragHandlers}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory select-none cursor-grab active:cursor-grabbing"
          style={{ scrollPaddingLeft: 16 }}
        >
          {tools.map((tool, i) => (
            <div
              key={tool.name}
              className="snap-start shrink-0 w-[220px] rounded-2xl overflow-hidden cursor-pointer hover:brightness-110 transition-[filter]"
              style={{ border: "1px solid var(--seo-card-border)" }}
            >
              <img
                src={allImages[i % allImages.length]}
                alt=""
                loading="lazy"
                draggable={false}
                className="h-[140px] w-full object-cover pointer-events-none"
              />
              <div className="p-3" style={{ background: "var(--seo-card-bg)" }}>
                <p className="text-sm font-semibold" style={{ color: "var(--seo-heading)" }}>{tool.name}</p>
                <p className="text-xs mt-0.5" style={{ color: "var(--seo-text-muted)" }}>{tool.sub}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          aria-label="Следующие инструменты"
          onClick={() => scrollBy(1)}
          disabled={!canNext}
          className={cn(
            "hidden lg:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-[rgba(0,0,0,0.6)] border border-[rgba(255,255,255,0.1)] items-center justify-center text-white transition-opacity hover:bg-[#E85420] hover:border-[#E85420]",
            canNext ? "opacity-0 group-hover:opacity-100 cursor-pointer" : "opacity-0 pointer-events-none",
          )}
        >
          <ChevronRight size={16} />
        </button>
      </m.div>
    </m.section>
  );
}
