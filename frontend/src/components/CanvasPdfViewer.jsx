import { useEffect, useRef, useState, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl;

function CanvasPdfPage({ pdf, pageNum, scale, watermarkLines, scrollRoot }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [aspect, setAspect] = useState(0.773);

  useEffect(() => {
    const el = wrapRef.current;
    const root = scrollRoot?.current;
    if (!el || !root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setVisible(entry.isIntersecting);
        });
      },
      { root, rootMargin: "900px 0px", threshold: 0.01 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [scrollRoot]);

  useEffect(() => {
    if (!visible || !pdf) return;
    let cancelled = false;
    setLoaded(false);

    (async () => {
      const page = await pdf.getPage(pageNum);
      if (cancelled) return;
      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current;
      if (!canvas) return;

      setAspect(viewport.width / viewport.height);

      const outputScale = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(viewport.width * outputScale);
      canvas.height = Math.floor(viewport.height * outputScale);

      const context = canvas.getContext("2d");
      const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;

      try {
        await page.render({ canvasContext: context, viewport, transform }).promise;
      } catch (err) {
        if (err?.name !== "RenderingCancelledException") console.error(err);
        return;
      }
      if (cancelled) return;

      if (watermarkLines?.length) {
        context.save();
        context.globalAlpha = 0.1;
        context.fillStyle = "#1a1a1a";
        context.font = `${16 * outputScale}px sans-serif`;
        context.translate(canvas.width / 2, canvas.height / 2);
        context.rotate(-Math.PI / 6);
        const text = watermarkLines.join("   ·   ");
        for (let y = -canvas.height; y < canvas.height; y += 90 * outputScale) {
          for (let x = -canvas.width; x < canvas.width; x += 340 * outputScale) {
            context.fillText(text, x, y);
          }
        }
        context.restore();
      }

      setLoaded(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [visible, pdf, pageNum, scale, watermarkLines]);

  return (
    <div
      ref={wrapRef}
      data-page-num={pageNum}
      className="canvas-pdf-page"
      style={{ width: Math.round(560 * scale), aspectRatio: aspect }}
    >
      {visible ? (
        <canvas
          ref={canvasRef}
          className={`canvas-pdf-canvas no-select${loaded ? " is-loaded" : ""}`}
        />
      ) : (
        <div className="canvas-pdf-page-placeholder" />
      )}
      {!loaded && <div className="canvas-pdf-page-placeholder canvas-pdf-page-placeholder--over" />}
      <span className="canvas-pdf-page-badge">{pageNum}</span>
    </div>
  );
}

export default function CanvasPdfViewer({ fileUrl, authToken, watermarkLines }) {
  const [pdf, setPdf] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.3);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState("1");
  const scrollRef = useRef(null);
  const zoomDebounceRef = useRef(null);

  useEffect(() => {
    if (!fileUrl) return;
    let cancelled = false;
    setLoading(true);
    setError("");

    const loadingTask = pdfjsLib.getDocument({
      url: fileUrl,
      httpHeaders: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
    });

    loadingTask.promise
      .then((doc) => {
        if (cancelled) return;
        setPdf(doc);
        setNumPages(doc.numPages);
      })
      .catch((err) => {
        console.error("Failed to load PDF:", err);
        if (!cancelled) setError("Could not load this book's file.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      loadingTask.destroy?.();
    };
  }, [fileUrl, authToken]);

  useEffect(() => {
    return () => {
      pdf?.destroy?.();
    };
  }, [pdf]);

  useEffect(() => {
    setPageInput(String(currentPage));
  }, [currentPage]);

  const setScaleDebounced = useCallback((updater) => {
    clearTimeout(zoomDebounceRef.current);
    zoomDebounceRef.current = setTimeout(() => setScale(updater), 90);
  }, []);
  const zoomOut = () => setScaleDebounced((s) => Math.max(0.6, +(s - 0.2).toFixed(1)));
  const zoomIn = () => setScaleDebounced((s) => Math.min(2.6, +(s + 0.2).toFixed(1)));

  const handleScroll = useCallback(() => {
    const root = scrollRef.current;
    if (!root) return;
    const rootTop = root.getBoundingClientRect().top;
    let closest = 1;
    let closestDist = Infinity;
    root.querySelectorAll("[data-page-num]").forEach((el) => {
      const dist = Math.abs(el.getBoundingClientRect().top - rootTop);
      if (dist < closestDist) {
        closestDist = dist;
        closest = Number(el.dataset.pageNum);
      }
    });
    setCurrentPage(closest);
  }, []);

  const jumpToPage = useCallback(
    (e) => {
      e.preventDefault();
      const n = Math.min(numPages, Math.max(1, parseInt(pageInput, 10) || 1));
      const el = scrollRef.current?.querySelector(`[data-page-num="${n}"]`);
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    [numPages, pageInput]
  );

  useEffect(() => {
    function onKeyDown(e) {
      const root = scrollRef.current;
      if (!root) return;
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      switch (e.key) {
        case "ArrowDown":
          root.scrollBy({ top: 120, behavior: "smooth" });
          e.preventDefault();
          break;
        case "ArrowUp":
          root.scrollBy({ top: -120, behavior: "smooth" });
          e.preventDefault();
          break;
        case "PageDown":
        case " ":
          root.scrollBy({ top: root.clientHeight * 0.9, behavior: "smooth" });
          e.preventDefault();
          break;
        case "PageUp":
          root.scrollBy({ top: -root.clientHeight * 0.9, behavior: "smooth" });
          e.preventDefault();
          break;
        case "Home":
          root.scrollTo({ top: 0, behavior: "smooth" });
          e.preventDefault();
          break;
        case "End":
          root.scrollTo({ top: root.scrollHeight, behavior: "smooth" });
          e.preventDefault();
          break;
        default:
          break;
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  if (loading) return <p className="state-line">Loading book…</p>;
  if (error) return <p className="state-line error">{error}</p>;

  return (
    <div className="canvas-pdf-viewer">
      <div className="canvas-pdf-toolbar">
        <form className="canvas-pdf-page-jump" onSubmit={jumpToPage}>
          <span>Page</span>
          <input
            type="text"
            inputMode="numeric"
            value={pageInput}
            onChange={(e) => setPageInput(e.target.value)}
          />
          <span>of {numPages}</span>
        </form>
        <span className="canvas-pdf-toolbar-sep" />
        <button type="button" onClick={zoomOut} aria-label="Zoom out">
          −
        </button>
        <button type="button" onClick={zoomIn} aria-label="Zoom in">
          +
        </button>
      </div>

      <div className="canvas-pdf-scroll" ref={scrollRef} onScroll={handleScroll} tabIndex={-1}>
        {Array.from({ length: numPages }, (_, i) => i + 1).map((n) => (
          <CanvasPdfPage
            key={n}
            pdf={pdf}
            pageNum={n}
            scale={scale}
            watermarkLines={watermarkLines}
            scrollRoot={scrollRef}
          />
        ))}
      </div>
    </div>
  );
}
