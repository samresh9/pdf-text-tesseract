import { createWorker ,PSM} from "tesseract.js";

(async () => {
  const worker = await createWorker("eng+nep", 1, {
    logger: (m) => console.log(m), // Add logger here
  });
   await worker.setParameters({
     tessedit_pageseg_mode: PSM.AUTO_OSD,
   });
  const {
    data: { text },
  } = await worker.recognize(
    "nepali.png"
  );
  console.log(text);
  await worker.terminate();
})();
