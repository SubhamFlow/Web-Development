//add api keys in .env file
const GROQ_API_KEY = "your_api_key";
const PEXELS_API_KEY = "your_api_key";

async function getImageBase64(imagePrompt) {
    const query = encodeURIComponent(imagePrompt);
    const res = await fetch(`https://api.pexels.com/v1/search?query=${query}&per_page=1`, {
        headers: { "Authorization": PEXELS_API_KEY }
    });
    const data = await res.json();

    if (data.photos && data.photos.length > 0) {
        const imgRes = await fetch(data.photos[0].src.large);
        const blob = await imgRes.blob();
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(blob);
        });
    } else {
        //genrating random image
        const fallback = await fetch(`https://picsum.photos/800/600`);
        const blob = await fallback.blob();
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(blob);
        });
    }
}

async function download() {
    const prompt = document.getElementById("prompt").value.trim();
    if (!prompt) { alert("Type a prompt first!"); return; }

    const btn = document.querySelector("button");
    btn.textContent = "GENERATING...";
    btn.disabled = true;

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [{
                    role: "user",
                    content: `Create a PowerPoint presentation about: ${prompt}

Return ONLY raw JSON array, no markdown, no backticks:
[
  {
    "title": "Slide Title",
    "summary": "Provide a comprehensive 2-3 sentence overview of this topic.",
    "points": ["point 1", "point 2", "point 3"],
    "imagePrompt": "two words max"
  }
]

Make 6 slides. Keep imagePrompt to 2 words max. Keep points short (under 10 words each).`
                }],
                temperature: 0.7
            })
        });

        const data = await response.json();
        const slides = JSON.parse(data.choices[0].message.content);

        let pres = new PptxGenJS();
        pres.layout = "LAYOUT_16x9";

        const titleSlide = pres.addSlide();
        titleSlide.background = { color: "050505" };

        titleSlide.addShape(pres.shapes.RECTANGLE, {
            x: 0.5, y: 0.5, w: 9.0, h: 4.625,
            line: { color: "00f2ff", width: 1 },
            fill: { color: "0a0a0a", transparency: 10 }
        });

        titleSlide.addText(prompt.toUpperCase(), {
            x: 1.0, y: 1.8, w: 8.0, h: 1.2,
            fontSize: 42, bold: true, color: "00f2ff",
            fontFace: "Arial", align: "center",
            charSpacing: 4
        });

        titleSlide.addText("Subham Sutradhar", {
            x: 1.0, y: 3.0, w: 8.0, h: 0.4,
            fontSize: 12, color: "ffffff",
            fontFace: "Courier New", align: "center",
            bold: true
        });

        for (let i = 0; i < slides.length; i++) {
            const sd = slides[i];
            const slideEl = pres.addSlide();
            slideEl.background = { color: "050505" };

            btn.textContent = `Fetching image ${i + 1}/${slides.length}...`;
            const imgBase64 = await getImageBase64(sd.imagePrompt);

            slideEl.addShape(pres.shapes.RECTANGLE, {
                x: 0.2, y: 0.2, w: 9.6, h: 5.2,
                line: { color: "333333", width: 0.5 }
            });

            slideEl.addImage({
                data: imgBase64,
                x: 0.4, y: 0.4,
                w: 4.5, h: 4.8,
                sizing: { type: "cover", w: 4.5, h: 4.8 }
            });

            slideEl.addText(sd.title.toUpperCase(), {
                x: 5.1, y: 0.4, w: 4.5, h: 0.6,
                fontSize: 24, bold: true, color: "00f2ff",
                fontFace: "Arial"
            });

            slideEl.addText(sd.summary, {
                x: 5.1, y: 1.1, w: 4.4, h: 1.2,
                fontSize: 11, color: "cccccc",
                fontFace: "Segoe UI",
                wrap: true,
                align: "justify"
            });

            const bulletY = [2.6, 3.4, 4.2];

            sd.points.slice(0, 3).forEach((point, idx) => {
                slideEl.addShape(pres.shapes.RECTANGLE, {
                    x: 5.1, y: bulletY[idx], w: 4.4, h: 0.6,
                    fill: { color: "111111" },
                    line: { color: "00f2ff", width: 0.5 }
                });

                slideEl.addText(">", {
                    x: 5.2, y: bulletY[idx], w: 0.3, h: 0.6,
                    fontSize: 14, color: "00f2ff", bold: true,
                    valign: "middle"
                });

                slideEl.addText(point, {
                    x: 5.5, y: bulletY[idx], w: 4.0, h: 0.6,
                    fontSize: 11, color: "ffffff",
                    fontFace: "Segoe UI", valign: "middle"
                });
            });

            slideEl.addText(`PAGE NO. ${i + 1} // SEC. ${slides.length}`, {
                x: 7.5, y: 5.3, w: 2.2, h: 0.3,
                fontSize: 8, color: "666666",
                fontFace: "Courier New", align: "right"
            });
        }

        //front page of ppt
        await pres.writeFile({ fileName: `${prompt}_Design_V2.pptx` });

    } catch (err) {
        console.error(err);
        alert("Something went wrong! Check console.");
    }

    btn.textContent = "GENERATE PRESENTATION";
    btn.disabled = false;
}
