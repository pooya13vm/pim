"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Step2Section from "./StepTwo/page";

type Kind = "wearable" | "collectable";
type ImageItem = { id: string; dataUrl: string; name: string; size: number };

type Step1Draft = {
  sku: string;
  productName: string;
  quantity: number;
  cost: number;
  kind: Kind;
  artist: string;
  images: { dataUrl: string; name: string; size: number; isMain: boolean }[];
};

const DRAFT_KEY = "productDraft";

export default function AddProductStepOne() {
  // ---- form state
  const [sku, setSku] = useState("");
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [cost, setCost] = useState("");
  const [kind, setKind] = useState<Kind>("wearable");
  const [artist, setArtist] = useState("");

  // ---- images (local only, as DataURL)
  const [images, setImages] = useState<ImageItem[]>([]);
  const [mainImageId, setMainImageId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ---- progressive reveal (Section 2 under the form)
  const [showExtraSection, setShowExtraSection] = useState(false);

  const artistOptions = useMemo(
    () => ["—", "Unknown", "Local Artist", "Guest Artist", "Curated"],
    []
  );

  const router = useRouter();
  const openFilePicker = () => fileInputRef.current?.click();

  // ---------- load draft on mount (so fields persist when navigating back)
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw);

      // انعطاف: اگر قبلاً step1 نداشتیم، از ریشه بخوان
      const s1: Partial<Step1Draft> =
        (draft && draft.step1) || draft || ({} as Step1Draft);

      if (!s1) return;

      if (typeof s1.sku === "string") setSku(s1.sku);
      if (typeof s1.productName === "string") setProductName(s1.productName);
      if (typeof s1.quantity !== "undefined")
        setQuantity(String(s1.quantity ?? ""));
      if (typeof s1.cost !== "undefined") setCost(String(s1.cost ?? ""));
      if (s1.kind) setKind(s1.kind);
      if (typeof s1.artist === "string") setArtist(s1.artist);

      const restoredImgs: ImageItem[] = Array.isArray(s1.images)
        ? s1.images.map((im) => ({
            id: crypto.randomUUID(),
            dataUrl: im.dataUrl,
            name: im.name ?? "",
            size: im.size ?? 0,
          }))
        : [];

      setImages(restoredImgs);

      // تعیین عکس اصلی
      const mainSrc =
        (Array.isArray(s1.images) &&
          s1.images.find((x) => x.isMain)?.dataUrl) ||
        restoredImgs[0]?.dataUrl;
      const main = restoredImgs.find((r) => r.dataUrl === mainSrc);
      setMainImageId(main ? main.id : restoredImgs[0]?.id ?? null);
    } catch {
      // ignore
    }
  }, []);

  const onClickCancel = () => {
    // پاک کردن درفت از حافظه
    try {
      sessionStorage.removeItem(DRAFT_KEY);
    } catch {}

    // ریست کل فیلدها به حالت اولیه
    setSku("");
    setProductName("");
    setQuantity("");
    setCost("");
    setKind("wearable");
    setArtist("");
    setImages([]);
    setMainImageId(null);
    setShowExtraSection(false); // بستن سکشن جدید

    // خالی‌کردن ورودی فایل
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ---------- file helpers ----------
  const fileToDataURL = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleFiles = async (files: FileList | null) => {
    if (!files || !files.length) return;

    const arr = Array.from(files);
    const dataUrls = await Promise.all(arr.map((f) => fileToDataURL(f)));
    const newItems: ImageItem[] = arr.map((f, i) => ({
      id: crypto.randomUUID(),
      dataUrl: dataUrls[i],
      name: f.name,
      size: f.size,
    }));

    setImages((prev) => {
      const merged = [...prev, ...newItems];
      if (!mainImageId && merged.length) setMainImageId(merged[0].id);
      return merged;
    });

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ---------- computed ----------
  const mainImage = useMemo(() => {
    if (!images.length) return null;
    return images.find((i) => i.id === mainImageId) ?? images[0];
  }, [images, mainImageId]);

  const setMain = (id: string) => setMainImageId(id);

  // ---------- persist & reveal next section ----------
  const onClickNext = () => {
    // ذخیره‌ی درفت مثل قبل (بدون شرط ولیدیشن)
    const step1: Step1Draft = {
      sku: sku.trim(),
      productName: productName.trim(),
      quantity: Number(quantity),
      cost: Number(cost),
      kind,
      artist,
      images: images.map((img) => ({
        dataUrl: img.dataUrl,
        name: img.name,
        size: img.size,
        isMain: mainImage ? img.id === mainImage.id : false,
      })),
    };

    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      const existing = raw ? JSON.parse(raw) : {};

      const merged = {
        ...existing,
        sku: step1.sku,
        productName: step1.productName,
        quantity: step1.quantity,
        cost: step1.cost,
        kind: step1.kind,
        artist: step1.artist,
        images: step1.images,
        step1,
        step: 1,
        updatedAt: Date.now(),
      };

      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(merged));
    } catch {
      // ignore
    }

    // به‌جای رفتن به صفحه‌ی بعد، سکشن جدید را نشان بده
    setShowExtraSection(true);
  };

  // ---------- UI ----------
  return (
    <main className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Add Product page</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* LEFT: fields */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 text-gray-800">SKU</label>
              <input
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block mb-2 text-gray-800">Product name</label>
              <input
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block mb-2 text-gray-800">Quantity</label>
              <input
                type="number"
                min={0}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block mb-2 text-gray-800">Cost</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 select-none">
                  $
                </span>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  className="w-full border rounded pl-7 pr-3 py-2"
                />
              </div>
            </div>
          </div>

          {/* kind radios */}
          <div className="mt-6 flex items-center gap-6">
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="kind"
                className="h-4 w-4"
                checked={kind === "wearable"}
                onChange={() => setKind("wearable")}
              />
              <span>Wearable</span>
            </label>

            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="kind"
                className="h-4 w-4"
                checked={kind === "collectable"}
                onChange={() => setKind("collectable")}
              />
              <span>Collectable</span>
            </label>
          </div>

          {/* artist select */}
          <div className="mt-6">
            <label className="block mb-2 text-gray-800">Artist name</label>
            <select
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              {artistOptions.map((a) => (
                <option key={a} value={a === "—" ? "" : a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* RIGHT: Main image + thumbs */}
        <section className="flex flex-col">
          <label className="mb-2 text-gray-800 font-medium">Main image</label>

          {/* big preview area */}
          <div
            className={`relative flex-1 min-h-[260px] border rounded-lg flex items-center justify-center select-none overflow-hidden`}
            onClick={images.length === 0 ? openFilePicker : undefined}
            role={images.length === 0 ? "button" : undefined}
            tabIndex={images.length === 0 ? 0 : -1}
            onKeyDown={(e) =>
              images.length === 0 && e.key === "Enter"
                ? openFilePicker()
                : undefined
            }
          >
            {mainImage ? (
              <>
                <img
                  src={mainImage.dataUrl}
                  alt="Main preview"
                  className="w-full h-full object-contain"
                />
                <span className="absolute top-2 left-2 text-xs bg-white/80 px-2 py-1 rounded">
                  Main image
                </span>
              </>
            ) : (
              <span className="text-base text-gray-600">
                Main image — use “+” to add
              </span>
            )}
          </div>

          {/* thumbnails row + plus tile */}
          <div className="mt-3 flex items-center gap-3 flex-wrap">
            {images.map((img) => (
              <button
                type="button"
                key={img.id}
                onClick={() => setMain(img.id)}
                className="relative w-16 h-16 border rounded-md overflow-hidden flex items-center justify-center"
                title="Select as main image"
              >
                <img
                  src={img.dataUrl}
                  alt="thumb"
                  className="w-full h-full object-cover"
                />
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 translate-y-1/2 bg-white rounded-full px-1">
                  <input
                    type="radio"
                    name="main-image"
                    className="h-4 w-4 align-middle"
                    checked={mainImage?.id === img.id}
                    onChange={() => setMain(img.id)}
                    aria-label="Set as main image"
                  />
                </span>
              </button>
            ))}

            {/* plus tile */}
            <button
              type="button"
              onClick={openFilePicker}
              className="w-16 h-16 border rounded-md flex items-center justify-center text-2xl leading-none hover:bg-gray-50"
              aria-label="Add image"
              title="Add image"
            >
              +
            </button>
          </div>

          {/* hidden input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </section>
      </div>

      {/* --- NEW: Extra Section shows under the form, above the footer --- */}
      {showExtraSection && (
        <section className="mt-8 p-4 ">
          <Step2Section />
        </section>
      )}

      {/* footer */}
      <div className="mt-8 flex justify-end gap-3">
        <button
          type="button"
          onClick={onClickCancel}
          className="px-6 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>

        {/* Next همیشه فعال است */}
        <button
          type="button"
          onClick={onClickNext}
          className="px-6 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          {showExtraSection ? "Save" : "Next"}
        </button>
      </div>

      {/* HIDE number input spinners for all number inputs in this component */}
      <style jsx>{`
        /* Chrome, Safari, Edge, Opera */
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        /* Firefox */
        input[type="number"] {
          -moz-appearance: textfield;
        }
      `}</style>
    </main>
  );
}
