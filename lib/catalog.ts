export type ProductMedia = {
  src: string;
  alt: string;
  kind: "campaign" | "detail" | "front" | "back";
};

export type Product = {
  slug: string;
  name: string;
  type: string;
  price: number;
  tone: string;
  description: string;
  material: string;
  fit: string;
  availability: "Available" | "Made to order" | "Sold out";
  sizes: string[];
  media: ProductMedia[];
};

export const catalog: Product[] = [
  {
    slug: "scene-01-heavy-tee",
    name: "Scene 01 / Heavy Tee",
    type: "Heavyweight tee",
    price: 2490,
    tone: "cream",
    description: "The everyday uniform, cut with room to move. A dense cotton tee with a dropped shoulder and a clean, unbranded front.",
    material: "100% combed cotton · 240 GSM",
    fit: "Relaxed fit / dropped shoulder",
    availability: "Made to order",
    sizes: ["XS", "S", "M", "L", "XL"],
    media: [
      { src: "/images/wedrip-tee.png", alt: "Model wearing the Scene 01 heavy tee", kind: "campaign" },
      { src: "/images/wedrip-tee.png", alt: "Front view of the Scene 01 heavy tee", kind: "front" },
      { src: "/images/wedrip-tee.png", alt: "Back view placeholder for the Scene 01 heavy tee", kind: "back" },
    ],
  },
  {
    slug: "after-hours-box-hoodie",
    name: "After Hours / Box Hoodie",
    type: "Box-fit hoodie",
    price: 4290,
    tone: "blue",
    description: "Built for the part of the day that has no name. Heavyweight brushed fleece with a generous hood and a soft, structured hand-feel.",
    material: "100% cotton fleece · 420 GSM",
    fit: "Box fit / dropped shoulder",
    availability: "Made to order",
    sizes: ["XS", "S", "M", "L", "XL"],
    media: [
      { src: "/images/wedrip-hoodie.png", alt: "Model wearing the After Hours box hoodie", kind: "campaign" },
      { src: "/images/wedrip-hoodie.png", alt: "Front view of the After Hours box hoodie", kind: "front" },
      { src: "/images/wedrip-hoodie.png", alt: "Back view placeholder for the After Hours box hoodie", kind: "back" },
    ],
  },
  {
    slug: "studio-02-heavy-tee",
    name: "Studio 02 / Heavy Tee",
    type: "Heavyweight tee",
    price: 2490,
    tone: "orange",
    description: "A second study in shape and proportion. Relaxed through the body, finished with a wide rib neck and considered sleeve length.",
    material: "100% combed cotton · 240 GSM",
    fit: "Relaxed fit / wide rib neck",
    availability: "Available",
    sizes: ["XS", "S", "M", "L", "XL"],
    media: [{ src: "/images/wedrip-tee.png", alt: "Model wearing the Studio 02 heavy tee", kind: "campaign" }, { src: "/images/wedrip-tee.png", alt: "Front view of the Studio 02 heavy tee", kind: "front" }],
  },
  {
    slug: "no-fixed-address-hoodie",
    name: "No Fixed Address / Hoodie",
    type: "Box-fit hoodie",
    price: 4290,
    tone: "ink",
    description: "A familiar layer, made less familiar. Designed to feel lived-in from the first wear and keep its shape after the hundredth.",
    material: "100% cotton fleece · 420 GSM",
    fit: "Box fit / ribbed cuffs",
    availability: "Available",
    sizes: ["XS", "S", "M", "L", "XL"],
    media: [{ src: "/images/wedrip-hoodie.png", alt: "Model wearing the No Fixed Address hoodie", kind: "campaign" }, { src: "/images/wedrip-hoodie.png", alt: "Front view of the No Fixed Address hoodie", kind: "front" }],
  },
];

export const collection = { slug: "drop-001", name: "The Third Space", eyebrow: "DROP 001", description: "Limited objects for the places between scenes. Designed in Chennai, made to outlive the feed." };
export const findProduct = (slug: string) => catalog.find((product) => product.slug === slug);
export const formatPrice = (value: number) => `₹${value.toLocaleString("en-IN")}`;
