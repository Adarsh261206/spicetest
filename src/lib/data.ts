import heroTikka from "@/assets/dish-chicken-tikka.jpg";
import heroSpices from "@/assets/hero-spices.jpg";
import biryani from "@/assets/dish-biryani.jpg";
import butterChicken from "@/assets/dish-butter-chicken.jpg";
import paneerButterMasala from "@/assets/dish-paneer-butter-masala.jpg";
import masalaDosa from "@/assets/dish-masala-dosa.jpg";
import gulabJamun from "@/assets/dish-gulab-jamun.jpg";
import dalMakhani from "@/assets/dish-dal-makhani.jpg";
import choleBhature from "@/assets/dish-chole-bhature.jpg";
import samosa from "@/assets/dish-samosa.jpg";
import pavBhaji from "@/assets/dish-pav-bhaji.jpg";
import prawnCurry from "@/assets/dish-goan-prawn-curry.jpg";
import fishMoilee from "@/assets/dish-fish-moilee.jpg";
import roganJosh from "@/assets/dish-rogan-josh.jpg";
import dhokla from "@/assets/dish-dhokla.jpg";
import bengaliFish from "@/assets/dish-bengali-fish-curry.jpg";
import idliSambar from "@/assets/dish-idli-sambar.jpg";
import mangoLassi from "@/assets/dish-mango-lassi.jpg";
import masalaChai from "@/assets/dish-masala-chai.jpg";
import rasmalai from "@/assets/dish-rasmalai.jpg";
import laalMaas from "@/assets/dish-laal-maas.jpg";
import chocolateCake from "@/assets/dish-chocolate-cake.jpg";
import alooParatha from "@/assets/dish-aloo-paratha.jpg";
import pastaImg from "@/assets/recipe-pasta.jpg";
import saladImg from "@/assets/recipe-salad.jpg";
import bakingImg from "@/assets/recipe-baking.jpg";
import bowlImg from "@/assets/recipe-bowl.jpg";
import eggsImg from "@/assets/recipe-eggs.jpg";

import spiceCardamom from "@/assets/spice-cardamom.jpg";
import spiceStarAnise from "@/assets/spice-star-anise.jpg";
import spiceCinnamon from "@/assets/spice-cinnamon.jpg";
import spiceCumin from "@/assets/spice-cumin.jpg";
import spiceChilli from "@/assets/spice-red-chilli.jpg";
import spiceSaffron from "@/assets/spice-saffron.jpg";

import blogSpiceBox from "@/assets/blog-spice-box.jpg";
import blogDosaBatter from "@/assets/blog-dosa-batter.jpg";
import blogTomatoes from "@/assets/blog-tomatoes.jpg";

import creator3 from "@/assets/creator-3.jpg";

export const brand = {
  name: "Spice N Flavors",
  tagline: "Recipes, stories and traditions worth bringing to the table.",
  hero: {
    eyebrow: "Spice N Flavors",
    headline: "A world of flavor.",
    support: "Recipes, stories and traditions worth bringing to the table.",
    primaryCta: "Explore Recipes",
    secondaryCta: "Browse all recipes",
  },
  milestone: { value: "150+", label: "recipes & stories" },
  kitchenTip:
    "Wait for the oil to separate at the edge of the pan. Until that happens, a tomato base is not finished — whatever the timer says.",
};

export const images = {
  heroTikka,
  heroSpices,
  blogSpiceBox,
  blogDosaBatter,
  blogTomatoes,
  biryani,
  butterChicken,
  masalaDosa,
};

export type Spice = {
  name: string;
  notes: string;
  image: string;
  use: string;
};

export const spices: Spice[] = [
  {
    name: "Cardamom",
    notes: "Aromatic · essential",
    image: spiceCardamom,
    use: "Bruise the pods before they go into rice or milk — whole pods release almost nothing.",
  },
  {
    name: "Star Anise",
    notes: "Sweet · liquorice · deep",
    image: spiceStarAnise,
    use: "One pod is enough for a whole biryani. Two and it stops tasting like biryani.",
  },
  {
    name: "Cinnamon",
    notes: "Woody · sweet · slow",
    image: spiceCinnamon,
    use: "Real cassia bark needs fat and time; it gives nothing to a quick tempering.",
  },
  {
    name: "Cumin",
    notes: "Earthy · toasted · grounding",
    image: spiceCumin,
    use: "Add to hot ghee first and wait for the crackle. That sound is the flavour leaving the seed.",
  },
  {
    name: "Red Chilli",
    notes: "Bright · smoky · bold",
    image: spiceChilli,
    use: "Kashmiri for colour, guntur for heat. Most gravies want both, in different amounts.",
  },
  {
    name: "Saffron",
    notes: "Delicate · floral · rare",
    image: spiceSaffron,
    use: "Soak in warm milk for ten minutes. Dry threads sprinkled on top are decoration, not flavour.",
  },
];

export type Contributor = {
  handle: string;
  name: string;
  specialty: string;
  bio: string;
  location: string;
  portrait: string;
  links: { label: string; href: string }[];
};

export const creators: Contributor[] = [
  {
    handle: "viya-sheth",
    name: "Viya Sheth",
    specialty: "Indian home cooking, spice work and slow gravies",
    bio: "Cooks and writes every recipe on Spice N Flavors herself — from Gujarati steamed breakfasts to Hyderabadi dum biryani. Obsessive about tempering, ratios and the moment oil separates at the edge of the pan.",
    location: "Ahmedabad, Gujarat",
    portrait: creator3,
    links: [{ label: "Instagram", href: "#" }],
  },
];

export const creator = creators[0];

export const creatorByHandle = (handle?: string) => creators.find((c) => c.handle === handle);

export type Recipe = {
  slug: string;
  title: string;
  blurb: string;
  intro: string;
  image: string;
  creator: string;
  cuisine: string;
  category: string;
  tags: string[];
  diet: string[];
  minutes: number;
  prep: number;
  cook: number;
  servings: number;
  difficulty: "Easy" | "Medium" | "Advanced";
  featured?: boolean;
  ingredients: { qty: number; unit: string; name: string }[];
  steps: { text: string; timer?: number }[];
  notes: string[];
  tips: string[];
  substitutions: { from: string; to: string }[];
  faqs: { q: string; a: string }[];
  nutrition: { label: string; value: string }[];
  story?: string;
};

export const categories = [
  "All",
  "Breakfast",
  "Starters",
  "Main Course",
  "Street Food",
  "Snacks",
  "Dessert",
  "Drinks",
  "Vegetarian",
  "Quick",
  "Festive",
];

export const quickFilters = [
  "Indian",
  "Vegetarian",
  "Chicken",
  "Quick",
  "Desserts",
  "Under 30 min",
];

export const popularSearches = [
  "Butter Chicken",
  "Biryani",
  "Paneer",
  "Dosa",
  "Chaat",
  "Under 30 min",
];

export type CuisineRegion = {
  slug: string;
  name: string;
  blurb: string;
  image: string;
};

export const cuisineRegions: CuisineRegion[] = [
  {
    slug: "north-indian",
    name: "North Indian",
    blurb: "Tandoor char, wheat breads and gravies built on browned onion and long-cooked tomato.",
    image: heroTikka,
  },
  {
    slug: "south-indian",
    name: "South Indian",
    blurb: "Fermented batters, coconut, tamarind and the daily rhythm of tempering in hot oil.",
    image: masalaDosa,
  },
  {
    slug: "gujarati",
    name: "Gujarati",
    blurb:
      "Steamed, lightly sweet and vegetarian by default — the lightest cooking in the country.",
    image: dhokla,
  },
  {
    slug: "punjabi",
    name: "Punjabi",
    blurb: "Butter, cream and slow-simmered dal, plus the breads that exist to mop them up.",
    image: dalMakhani,
  },
  {
    slug: "continental",
    name: "Continental",
    blurb:
      "Weeknight plates from outside the subcontinent, cooked with the same attention to the base.",
    image: pastaImg,
  },
  {
    slug: "desserts",
    name: "Desserts",
    blurb: "Milk reduced, chhena kneaded, syrup balanced — Indian sweets reward precision.",
    image: rasmalai,
  },
];

export type Collection = {
  slug: string;
  name: string;
  count: number;
  cover: string;
  thumbs: string[];
  mood: string;
};

export const collections: Collection[] = [
  {
    slug: "weeknight-indian",
    name: "Weeknight Indian",
    count: 18,
    cover: paneerButterMasala,
    thumbs: [masalaChai, alooParatha, bowlImg],
    mood: "On the table in 45",
  },
  {
    slug: "sunday-biryani",
    name: "Sunday Biryani",
    count: 9,
    cover: biryani,
    thumbs: [roganJosh, laalMaas, mangoLassi],
    mood: "Worth the long cook",
  },
  {
    slug: "festival-sweets",
    name: "Festival Sweets",
    count: 14,
    cover: gulabJamun,
    thumbs: [rasmalai, chocolateCake, bakingImg],
    mood: "Diwali and after",
  },
  {
    slug: "street-food-at-home",
    name: "Street Food at Home",
    count: 16,
    cover: pavBhaji,
    thumbs: [samosa, choleBhature, bowlImg],
    mood: "Chaat, pav and fry-ups",
  },
  {
    slug: "everyday-vegetarian",
    name: "Everyday Vegetarian",
    count: 27,
    cover: dhokla,
    thumbs: [paneerButterMasala, saladImg, dalMakhani],
    mood: "No meat, no compromise",
  },
  {
    slug: "coastal-and-coconut",
    name: "Coastal & Coconut",
    count: 11,
    cover: prawnCurry,
    thumbs: [fishMoilee, bengaliFish, idliSambar],
    mood: "From the two coasts",
  },
  {
    slug: "breakfast-table",
    name: "The Breakfast Table",
    count: 13,
    cover: idliSambar,
    thumbs: [masalaDosa, alooParatha, eggsImg],
    mood: "Mornings worth waking for",
  },
  {
    slug: "slow-sunday",
    name: "Slow Sunday Cooking",
    count: 8,
    cover: dalMakhani,
    thumbs: [roganJosh, biryani, laalMaas],
    mood: "Three hours, one pot",
  },
];

export const collectionBySlug = (slug: string) => collections.find((c) => c.slug === slug);

export type Article = {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  readingTime: number;
  image: string;
  author: string;
  featured?: boolean;
  body: { heading?: string; text: string }[];
};

export const articles: Article[] = [
  {
    slug: "spice-box-you-actually-use",
    title: "How to Build a Spice Box You Actually Use",
    category: "Kitchen Tips",
    excerpt:
      "Most spice racks are archaeology. A working masala dabba holds nine things and gets opened every day.",
    readingTime: 6,
    image: blogSpiceBox,
    author: "viya-sheth",
    featured: true,
    body: [
      {
        text: "Open most home spice cupboards and you find twenty-two jars, four of them duplicates, and a garam masala bought in 2019. Open a working kitchen's masala dabba and you find nine compartments, all of them half empty, all of them refilled every few weeks. The difference is not discipline. It is that the second cook decided what they actually cook.",
      },
      {
        heading: "The nine that earn their place",
        text: "Mustard seeds, cumin seeds, turmeric, Kashmiri chilli powder, coriander powder, whole dried red chillies, hing, ajwain and garam masala. That set covers a tempering for any dal, the base of most North Indian gravies and a South Indian tadka without opening a second container.",
      },
      {
        heading: "Whole over ground, with two exceptions",
        text: "Whole spices keep their oils for months; ground ones lose most of their aroma in six to eight weeks. The exceptions are turmeric and chilli, which are almost always bought ground and used for colour as much as flavour. Everything else is better bought whole and ground in small batches.",
      },
      {
        heading: "Buy small, refill often",
        text: "A 500g bag of cumin is not a saving if 400g of it goes stale. Buy the quantity you will finish in two months, keep the rest of the stock sealed away from the stove, and refill the dabba from it. Heat and light above a hob will age a spice faster than time will.",
      },
      {
        heading: "Test before you trust",
        text: "Crush a pinch between your fingers and smell. If you have to work to find the aroma, the spice is no longer doing anything for your food, and doubling the quantity will not fix it — you will only add dust and bitterness.",
      },
    ],
  },
  {
    slug: "why-dosa-batter-isnt-fermenting",
    title: "Why Your Dosa Batter Isn't Fermenting",
    category: "Cooking Guides",
    excerpt:
      "Nine times out of ten it is temperature, not technique. The other time it is the salt going in too early.",
    readingTime: 8,
    image: blogDosaBatter,
    author: "viya-sheth",
    body: [
      {
        text: "Fermentation is biology, and biology has conditions. A dosa batter rises because wild yeast and lactic acid bacteria on the urad dal multiply and produce gas. If the batter is flat after twelve hours, one of those conditions was missing.",
      },
      {
        heading: "Temperature is almost always the answer",
        text: "The culture works well between 26°C and 32°C. Below 22°C it slows to almost nothing. In a cold kitchen, put the batter in the oven with only the light on, or in a closed cupboard with a bowl of hot water beside it. Do not put it near a running flame; too warm and it sours before it rises.",
      },
      {
        heading: "Salt, and when to add it",
        text: "In warm climates salt is traditionally added before fermentation because it keeps the culture in check. In a cold kitchen the same salt can stall a struggling batter entirely. If your batter has failed twice, try adding salt after it has risen.",
      },
      {
        heading: "The grind matters more than people admit",
        text: "Urad dal should be ground until it is light and holds a peak — that aeration is the starting point of the rise. If your grinder heats the batter above blood temperature, you are killing the culture at the first step. Grind in bursts and add cold water.",
      },
      {
        heading: "How to read a finished batter",
        text: "It should have risen visibly, domed slightly, and smell pleasantly sour like yoghurt. Sharp, alcoholic or acetic smells mean it went too far. Over-fermented batter still makes good dosas — thin it and cook hot — but it will make heavy idlis.",
      },
    ],
  },
  {
    slug: "cooking-tomatoes-longer",
    title: "The Case for Cooking Tomatoes Longer",
    category: "Ingredient Stories",
    excerpt:
      "The single biggest improvement most home gravies can make costs nothing but ten more minutes.",
    readingTime: 5,
    image: blogTomatoes,
    author: "viya-sheth",
    body: [
      {
        text: "Ask a professional what separates a home gravy from a restaurant one and the answer is rarely an ingredient. It is that the restaurant cooked its tomato base for thirty minutes and you cooked yours for eight.",
      },
      {
        heading: "What is actually happening",
        text: "Raw tomato is water, acid and volatile compounds that taste green. Cooking drives off the water, concentrates the sugars and breaks the cell walls so the fat can carry the flavour. Until that water is gone, the fat and the tomato stay separate — which is why the oil visibly pools at the edge only when the base is genuinely done.",
      },
      {
        heading: "Reading the pan",
        text: "Watch the colour: bright red darkens to brick. Watch the texture: loose purée becomes a paste that holds a line when you drag a spoon through it. Watch the edges: a rim of clear, coloured oil appears. That last sign is the one every Indian recipe means when it says bhuno until the oil separates.",
      },
      {
        heading: "If you are short on time",
        text: "Use a wider pan. Evaporation is a surface-area problem, and a kadai reduces a tomato base in half the time a deep pot takes. Salt early to draw water out, and resist adding more liquid until the base is done.",
      },
    ],
  },
  {
    slug: "temper-spices-without-burning",
    title: "How to Temper Spices Without Burning Them",
    category: "Cooking Guides",
    excerpt:
      "A tadka is over in forty seconds. The order the spices go in is the entire technique.",
    readingTime: 4,
    image: heroSpices,
    author: "viya-sheth",
    body: [
      {
        text: "Tempering is the fastest step in Indian cooking and the easiest to ruin. Everything goes into hot fat, everything cooks in under a minute, and one wrong sequence gives you a bitter pan you cannot rescue.",
      },
      {
        heading: "The order",
        text: "Mustard seeds first — they need the highest heat and tell you when the oil is ready by popping. Then cumin and other seeds. Then dried chillies and curry leaves, which burn in seconds. Ground spices, hing and garlic go last, off the heat if necessary; they scorch almost instantly.",
      },
      {
        heading: "Judging the oil",
        text: "Drop in one mustard seed. If it sinks and sits, the oil is cold. If it sizzles and pops within two seconds, it is ready. If it darkens immediately, the oil is too hot — take the pan off for a moment.",
      },
      {
        heading: "What burnt tastes like",
        text: "Burnt cumin is acrid and lingers; burnt hing is sulphurous; burnt garlic makes everything taste of ash. None of them can be diluted out. Start the tadka again — it costs two minutes and a spoon of oil.",
      },
    ],
  },
  {
    slug: "garam-masala-vs-curry-powder",
    title: "The Difference Between Garam Masala and Curry Powder",
    category: "Ingredient Stories",
    excerpt:
      "One is a finishing blend of warm spices. The other is a colonial-era shortcut. They are not interchangeable.",
    readingTime: 5,
    image: spiceCardamom,
    author: "viya-sheth",
    body: [
      {
        text: "Garam masala means warm spice blend, and warm here refers to the body rather than heat. Cardamom, cinnamon, clove, black pepper, bay and mace — aromatic, sweet, and completely without chilli or turmeric.",
      },
      {
        heading: "How each is used",
        text: "Garam masala goes in at the end, often off the heat, because its aromatics are volatile. Curry powder — a British export blend built on turmeric, coriander and fenugreek — is used at the start, as a base. Swapping one for the other puts the wrong spice in the wrong stage of the dish.",
      },
      {
        heading: "There is no single garam masala",
        text: "Every region and most families have their own. Punjabi blends lean on cumin and coriander; Kashmiri ones on fennel and ginger; Bengali garam masala is often just cardamom, cinnamon and clove. Buying one jar labelled garam masala and expecting it to suit every recipe is the source of a lot of disappointment.",
      },
      {
        heading: "Make a small batch",
        text: "Dry roast the whole spices separately, since they toast at different rates, cool them completely, and grind. Make enough for a month. It will not taste like the jar, and that is the point.",
      },
    ],
  },
  {
    slug: "restaurant-style-char-on-chicken",
    title: "How to Get Restaurant-Style Char on Chicken",
    category: "Kitchen Tips",
    excerpt: "Char is a dry-surface problem. Nothing browns until the water has left.",
    readingTime: 6,
    image: heroTikka,
    author: "viya-sheth",
    body: [
      {
        text: "A tandoor works at around 400°C, which is roughly double what a domestic oven manages. You cannot match the temperature, but you can match the conditions that matter: a dry surface, direct radiant heat and space around each piece.",
      },
      {
        heading: "Dry the surface",
        text: "Wipe excess marinade off before the chicken goes on the skewer. A wet coating has to boil off before browning starts, and by then the inside is overcooked.",
      },
      {
        heading: "Get the heat close",
        text: "Use the top shelf under a grill element, not the middle of a fan oven. Radiant heat from above chars the surface while the interior is still catching up — which is exactly what you want.",
      },
      {
        heading: "Leave gaps",
        text: "Pieces touching each other trap steam between them. A finger of space on the skewer is the difference between charred and grey.",
      },
      {
        heading: "Finish with smoke",
        text: "The dhungar method — hot charcoal in a small bowl, a spoonful of ghee, lid on for two minutes — adds the one thing a home oven genuinely cannot: the smell of live fire.",
      },
    ],
  },
  {
    slug: "basmati-rice-stay-separate",
    title: "What Makes Basmati Rice Stay Separate",
    category: "Cooking Guides",
    excerpt:
      "Age, soaking and salt. Rinsing helps, but it is not the thing most people think it is.",
    readingTime: 5,
    image: biryani,
    author: "viya-sheth",
    body: [
      {
        text: "Separate grains are a starch problem. Basmati has less amylopectin than short-grain rice, which is why it can stay distinct at all — but handling decides whether it actually does.",
      },
      {
        heading: "Age matters",
        text: "Rice aged a year or more has drier grains that absorb water slowly and elongate rather than swell. New-season basmati cooks faster and turns sticky, which is why biryani recipes insist on aged rice.",
      },
      {
        heading: "Rinse, then soak",
        text: "Rinse until the water runs nearly clear to remove loose surface starch, then soak for 20 to 30 minutes. Soaked grains cook evenly from the outside in; unsoaked ones split at the ends while the middle is still hard.",
      },
      {
        heading: "Cook it like pasta",
        text: "For biryani, boil in a large volume of well-salted water and drain at 70 percent. The excess water carries the released starch away with it, which is exactly what an absorption method cannot do.",
      },
      {
        heading: "Then leave it alone",
        text: "Stirring cooked rice breaks grains and releases starch. Fluff with a fork or a flat spoon, from the edges, once.",
      },
    ],
  },
  {
    slug: "storing-whole-spices",
    title: "How to Store Whole Spices",
    category: "Kitchen Tips",
    excerpt:
      "Heat, light and air are what age a spice. The shelf above your hob fails all three tests.",
    readingTime: 4,
    image: spiceCinnamon,
    author: "viya-sheth",
    body: [
      {
        text: "Spices do not spoil in the way food spoils. They fade. The volatile oils that carry aroma evaporate, and what is left is colour and a vague woodiness. Storage is simply about slowing that down.",
      },
      {
        heading: "Away from the stove",
        text: "The most convenient shelf is usually the worst one. Every time you cook, the spices above the hob get warm and the oils escape faster. A drawer at counter height is better in every way except reach.",
      },
      {
        heading: "Airtight, opaque, small",
        text: "Glass is fine if it is kept in the dark; steel is better. Whatever the container, it should be roughly the size of the contents — a half-empty jar is mostly air, and air oxidises.",
      },
      {
        heading: "Grind small",
        text: "Ground spices last six to eight weeks at best. Grinding a fortnight's worth at a time sounds fussy and takes ninety seconds. It is the difference most people notice immediately.",
      },
    ],
  },
];

export const articleBySlug = (slug: string) => articles.find((a) => a.slug === slug);
export const featuredArticle = articles.find((a) => a.featured) ?? articles[0]!;

export const diets = ["Vegetarian", "Vegan", "Non-veg", "Gluten-free", "High protein", "Eggless"];
export const difficulties = ["Easy", "Medium", "Advanced"];
export const cuisines = [
  "North Indian",
  "South Indian",
  "Punjabi",
  "Gujarati",
  "Bengali",
  "Goan",
  "Kerala",
  "Hyderabadi",
  "Mughlai",
  "Continental",
];

export const about = {
  headline: "Cooking is how we remember.",
  paragraphs: [
    "Spice N Flavors is a place for recipes that work, stories worth reading and food traditions worth passing on.",
    "We care about the details that turn a recipe from a list of ingredients into something you will actually want to cook again — the ratio that holds, the step that matters, the note you only learn the third time you make a dish.",
    "From everyday Indian cooking to dishes that deserve a little more time, every recipe is built around flavor, technique and the joy of sharing food.",
  ],
};
