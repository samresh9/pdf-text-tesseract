import express from "express";
import { Request, Response, Application } from "express";
import Tesseract, { createWorker, createScheduler } from "tesseract.js";
import { writeFileSync } from "fs";
import multer from "multer";
import pdf2img from "pdf-img-convert";

const app: Application = express();
app.use(express.static("public"));
const port = 5000;

//multer to store the pdf
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/pdf");
  },
  filename: function (req, file, cb) {
    return cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage: multer.memoryStorage() });

//initialize tesseract worker
let tesseractWorkers: Tesseract.Worker[] = [];
async function initializeTesseractWorkers(workerCount: number) {
  try {
    const workers = await Promise.all(
      Array(workerCount)
        .fill(null)
        .map(async () => {
          const worker = await createWorker("eng", 1, { cachePath: "." });
          return worker;
        })
    );

    tesseractWorkers = workers;
    console.log("Tesseract workers initialized successfully");
  } catch (error) {
    console.error("Error initializing Tesseract workers:", error);
  }
}

async function convertToImg(path: Buffer) {
  const pdfArray = await pdf2img.convert(path, {
    //scales the img
    scale: 3,
  });
  // buffers of images
  const buffers = pdfArray.map((uint8Array) => Buffer.from(uint8Array));
  // convert buffers to image
  /*
  const filenames: string[] = [];
  for (let i = 0; i < pdfArray.length; i++) {
    const picName = "public/img/output" + i + ".png";
    console.log(i);
    writeFileSync(picName, pdfArray[i]); //writeFile
    filenames.push(picName);
  }
  console.log(filenames); */
  return buffers;
}

//ocr function
async function performOCR(imgBuffers: Buffer[], filename: string | null) {
  const scheduler = createScheduler();
  tesseractWorkers.forEach((worker) => {
    scheduler.addWorker(worker);
  });

  const jobs = imgBuffers.map((buffer) =>
    scheduler.addJob("recognize", buffer)
  );
  const results = await Promise.all(jobs);
  await scheduler.terminate();
  //join all text
  const allText = results.map((result) => result.data.text).join("\n");
  writeFileSync(`public/results/${filename}`, allText);
  //terminate worker
  tesseractWorkers.forEach(async (worker) => {
    await worker.terminate();
  });
  console.log("Tesseract worker terminated");
  //initialize worker
  await initializeTesseractWorkers(4);
}

app.post(
  "/",
  upload.single("pdf-file"),
  async (req: Request, res: Response) => {
    try {
      await initializeTesseractWorkers(4);
      if (req.file) {
        let buffers = [];
        const whitelist = [
          "image/png",
          "image/jpeg",
          "image/jpg",
          "image/webp",
        ];
        if (whitelist.includes(req.file.mimetype)) {
          buffers.push(req.file.buffer);
        } else {
          const imgBuffers = await convertToImg(req.file.buffer);
          buffers = imgBuffers;
        }
        if (buffers != null) {
          //   const worker = await createWorker("eng");
          const statTime = Date.now();
          const resultFileName = `result_${Date.now()}.txt`;
          // const psm = PSM.AUTO;
          await performOCR(buffers, resultFileName);
          console.log(Date.now() - statTime);
          res.sendFile(`public/results/${resultFileName}`, { root: "./" });
        }
        return;
      }
      res.json({ error: "empty file" });
      return;
    } catch (err) {
      console.log(err);
    }
  }
);
// app.post("/file", (req, res) => {
//   res.sendFile("public/img/output0.png", { root: "./" });
// });

app.listen(port, () => {
  console.log(`Listening to port ${port}`);
});
