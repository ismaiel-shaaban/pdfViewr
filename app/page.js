"use client";
import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import "pdfjs-dist/web/pdf_viewer.css";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function Home() {
  const pdfRef = useRef(null);
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pagesRendered, setPagesRendered] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const loadPdf = async () => {
      try {
        console.log("Loading PDF from: /files/menue.pdf");
        const pdfUrl = "/files/menue_compressed.pdf";
        const loadingTask = pdfjsLib.getDocument(pdfUrl);

        loadingTask.promise
          .then((pdf) => {
            console.log(`PDF loaded successfully with ${pdf.numPages} pages`);
            setPdfDoc(pdf);
            setTotalPages(pdf.numPages);

            // Render the first three pages immediately
            renderPages(pdf, 1, 3);
            setPagesRendered(4);
            setLoading(false);
          })
          .catch((err) => {
            console.error("Error loading PDF:", err);
            setError(`Failed to load the PDF: ${err.message}`);
            setLoading(false);
          });
      } catch (err) {
        console.error("Error fetching PDF:", err);
        setError(`An error occurred while fetching the PDF: ${err.message}`);
        setLoading(false);
      }
    };

    loadPdf();
  }, []);

  const renderPage = async (pdf, pageNum) => {
    try {
      const page = await pdf.getPage(pageNum);
      console.log(`Rendering page ${pageNum}`);
      const viewport = page.getViewport({ scale: 1 });

      const canvas = document.createElement("canvas");
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const context = canvas.getContext("2d");
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      await page.render(renderContext).promise;
      console.log(`Page ${pageNum} rendered successfully`);

      // Append the canvas to the container
      containerRef.current.appendChild(canvas);
      console.log(`Canvas for page ${pageNum} appended to container`);
    } catch (err) {
      console.error(`Error rendering page ${pageNum}:`, err);
    }
  };

  // Function to render multiple pages
  const renderPages = async (pdf, start, end) => {
    for (let i = start; i <= end; i++) {
      await renderPage(pdf, i);
    }
  };

  const handleScroll = () => {
    if (pdfDoc && pagesRendered <= totalPages) {
      const container = containerRef.current;
      if (
        container.scrollTop + container.clientHeight >=
        container.scrollHeight - 100
      ) {
        console.log("Scroll event detected");
        renderPage(pdfDoc, pagesRendered);
        setPagesRendered((prev) => prev + 1);
      }
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [pagesRendered, totalPages]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      {loading && 
      <div className="w-full h-[100vh] flex justify-center items-center">
        <img className="w-[500px]" src={'/files/WhatsApp Image 2024-10-01 at 1.04.25 AM.jpeg'} alt=""/>
      </div>
      
      }
      {/* {error && <p>{error}</p>} */}
  
      <div
        ref={containerRef}
        className=" overflow-y-auto w-full flex-col items-center"
        style={{ height: "100vh"}}
      ></div>
    </main>
  );
}
