import { memo, useEffect, useLayoutEffect, useRef, useState, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import pdfjsWorkerUrl from "pdfjs-dist/legacy/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl;

const CanvasPdfPage = memo(function CanvasPdfPage({
  pdf,
  pageNum,
  width,
  defaultAspect,
  isVisible,
  epoch,
}) {
  const canvasRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [measuredAspect, setMeasuredAspect] = useState(null);
  const aspect = measuredAspect || defaultAspect;

  useEffect(() => {
    if (!isVisible || !pdf) return undefined;
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    let cancelled = false;
    let renderTask = null;
    let page = null;
    setLoaded(false);

    (async () => {
      try {
        page = await pdf.getPage(pageNum);
        if (cancelled) return;

        const base = page.getViewport({ scale: 1 });
        setMeasuredAspect(base.width / base.height);
        const viewport = page.getViewport({ scale: width / base.width });

        const isTouchDevice = !!window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
        const maxPixels = isTouchDevice ? 3000000 : 8000000;
        let outputScale = Math.min(window.devicePixelRatio || 1, 2);
        const wantedPixels = viewport.width * viewport.height * outputScale * outputScale;
        if (wantedPixels > maxPixels) {
          outputScale = Math.max(1, outputScale * Math.sqrt(maxPixels / wantedPixels));
        }

        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);

        const context = canvas.getContext("2d", { alpha: false });
        const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;

        renderTask = page.render({ canvasContext: context, viewport, transform });
        await renderTask.promise;
        if (!cancelled) setLoaded(true);
      } catch (err) {
        if (err?.name !== "RenderingCancelledException" && !cancelled) {
          console.error("PDF page render failed:", err);
        }
      }
    })();

    return () => {
      cancelled = true;
      if (renderTask) renderTask.cancel();
      if (page) page.cleanup();
      canvas.width = 0;
      canvas.height = 0;
      setLoaded(false);
    };
  }, [isVisible, pdf, pageNum, width, epoch]);

  return (
    <div
      data-page-num={pageNum}
      className="canvas-pdf-page"
      style={{ width, height: Math.round(width / aspect) }}
    >
      {isVisible && (
        <canvas
          ref={canvasRef}
          className={`canvas-pdf-canvas no-select${loaded ? " is-loaded" : ""}`}
        />
      )}
      {(!isVisible || !loaded) && (
        <div
          className={`canvas-pdf-page-placeholder${isVisible ? " is-loading" : ""}`}
        />
      )}
      <span className="canvas-pdf-page-badge">{pageNum}</span>
    </div>
  );
});

export default function CanvasPdfViewer({ fileUrl, authToken }) {
  const [pdf, setPdf] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [defaultAspect, setDefaultAspect] = useState(0.773);
  const [scale, setScale] = useState(() => (window.innerWidth < 720 ? 1 : 1.3));
  const [containerWidth, setContainerWidth] = useState(0);
  const [visiblePages, setVisiblePages] = useState(() => new Set([1]));
  const [epoch, setEpoch] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState("1");

  const scrollRef = useRef(null);
  const visibleRef = useRef(new Set([1]));
  const zoomDebounceRef = useRef(null);
  const scrollRatioRef = useRef(0);
  const rafRef = useRef(0);

  useEffect(() => {
    if (!fileUrl) return undefined;
    let cancelled = false;
    setLoading(true);
    setError("");

    const loadingTask = pdfjsLib.getDocument({
      url: fileUrl,
      httpHeaders: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
      disableStream: true,
      disableAutoFetch: true,
      rangeChunkSize: 524288,
      isEvalSupported: false,
    });

    (async () => {
      try {
        const doc = await loadingTask.promise;
        if (cancelled) return;
        try {
          const first = await doc.getPage(1);
          const v = first.getViewport({ scale: 1 });
          if (!cancelled) setDefaultAspect(v.width / v.height);
        } catch {
        }
        if (cancelled) return;
        setPdf(doc);
        setNumPages(doc.numPages);
      } catch (err) {
        console.error("Failed to load PDF:", err);
        if (!cancelled) setError("Could not load this book's file.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      loadingTask.destroy?.();
    };
  }, [fileUrl, authToken, reloadKey]);

  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return undefined;
    setContainerWidth(Math.floor(root.clientWidth - 32));
    if (typeof ResizeObserver === "undefined") return undefined;
    const observer = new ResizeObserver((entries) => {
      const w = Math.floor(entries[0].contentRect.width);
      if (w > 0) setContainerWidth(w);
    });
    observer.observe(root);
    return () => observer.disconnect();
  }, [loading, error]);

  useEffect(() => {
    const root = scrollRef.current;
    if (!root || !numPages) return undefined;

    if (typeof IntersectionObserver === "undefined") {
      const firstPages = new Set([1, 2, 3]);
      visibleRef.current = firstPages;
      setVisiblePages(firstPages);
      return undefined;
    }

    const set = new Set();
    visibleRef.current = set;
    const observer = new IntersectionObserver(
      (entries) => {
        let changed = false;
        entries.forEach((entry) => {
          const n = Number(entry.target.dataset.pageNum);
          if (entry.isIntersecting) {
            if (!set.has(n)) {
              set.add(n);
              changed = true;
            }
          } else if (set.delete(n)) {
            changed = true;
          }
        });
        if (changed) setVisiblePages(new Set(set));
      },
      { root, rootMargin: "80% 0px", threshold: 0 }
    );
    root.querySelectorAll("[data-page-num]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [numPages, loading, error]);

  useEffect(() => {
    const onReturn = () => {
      if (document.visibilityState === "visible") setEpoch((e) => e + 1);
    };
    document.addEventListener("visibilitychange", onReturn);
    window.addEventListener("pageshow", onReturn);
    return () => {
      document.removeEventListener("visibilitychange", onReturn);
      window.removeEventListener("pageshow", onReturn);
    };
  }, []);

  useEffect(() => {
    setPageInput(String(currentPage));
  }, [currentPage]);

  useEffect(() => {
    return () => {
      clearTimeout(zoomDebounceRef.current);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const changeZoom = (delta) => {
    const root = scrollRef.current;
    if (root) scrollRatioRef.current = root.scrollTop / Math.max(1, root.scrollHeight);
    clearTimeout(zoomDebounceRef.current);
    zoomDebounceRef.current = setTimeout(
      () => setScale((s) => Math.min(2.6, Math.max(0.6, +(s + delta).toFixed(1)))),
      90
    );
  };

  useLayoutEffect(() => {
    const root = scrollRef.current;
    if (!root || !scrollRatioRef.current) return;
    root.scrollTop = scrollRatioRef.current * root.scrollHeight;
    scrollRatioRef.current = 0;
  }, [scale]);

  const handleScroll = useCallback(() => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      const root = scrollRef.current;
      if (!root) return;
      const rootTop = root.getBoundingClientRect().top;
      const limit = root.clientHeight / 3;
      const nums = Array.from(visibleRef.current).sort((a, b) => a - b);
      if (!nums.length) return;
      let current = nums[0];
      for (const n of nums) {
        const el = root.querySelector(`[data-page-num="${n}"]`);
        if (el && el.getBoundingClientRect().top - rootTop <= limit) current = n;
      }
      setCurrentPage(current);
    });
  }, []);

  useEffect(() => {
    handleScroll();
  }, [visiblePages, handleScroll]);

  const jumpToPage = useCallback(
    (e) => {
      e.preventDefault();
      const n = Math.min(numPages, Math.max(1, parseInt(pageInput, 10) || 1));
      const el = scrollRef.current?.querySelector(`[data-page-num="${n}"]`);
      el?.scrollIntoView({ behavior: "auto", block: "start" });
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
  if (error) {
    return (
      <div className="state-line error">
        <p style={{ margin: "0 0 12px" }}>{error}</p>
        <button type="button" onClick={() => setReloadKey((k) => k + 1)}>
          Try again
        </button>
      </div>
    );
  }

  const baseWidth = Math.max(240, Math.min(560, containerWidth || 560));
  const pageWidth = Math.round(baseWidth * scale);

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
        <button type="button" onClick={() => changeZoom(-0.2)} aria-label="Zoom out">
          −
        </button>
        <button type="button" onClick={() => changeZoom(0.2)} aria-label="Zoom in">
          +
        </button>
      </div>

      <div className="canvas-pdf-scroll" ref={scrollRef} onScroll={handleScroll} tabIndex={-1}>
        {Array.from({ length: numPages }, (_, i) => i + 1).map((n) => (
          <CanvasPdfPage
            key={n}
            pdf={pdf}
            pageNum={n}
            width={pageWidth}
            defaultAspect={defaultAspect}
            isVisible={visiblePages.has(n)}
            epoch={epoch}
          />
        ))}
      </div>
    </div>
  );
}
