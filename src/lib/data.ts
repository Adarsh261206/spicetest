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

import journalSpiceBox from "@/assets/journal-spice-box.jpg";
import journalDosaBatter from "@/assets/journal-dosa-batter.jpg";
import journalTomatoes from "@/assets/journal-tomatoes.jpg";

import creator3 from "@/assets/creator-3.jpg";

export const brand = {
  name: "Spice N Flavors",
  tagline: "Recipes, stories and traditions worth bringing to the table.",
  hero: {
    eyebrow: "Spice N Flavors",
    headline: "A world of flavor.",
    support: "Recipes, stories and traditions worth bringing to the table.",
    primaryCta: "Explore Recipes",
    secondaryCta: "Enter the Journal",
  },
  milestone: { value: "134", label: "recipes & stories" },
  kitchenTip:
    "Wait for the oil to separate at the edge of the pan. Until that happens, a tomato base is not finished — whatever the timer says.",
};

export const images = {
  heroTikka,
  heroSpices,
  journalSpiceBox,
  journalDosaBatter,
  journalTomatoes,
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

export const creatorByHandle = (_handle?: string) => creators[0];

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

export const recipes: Recipe[] = [
  {
    slug: "chicken-tikka",
    title: "Chicken Tikka",
    blurb:
      "Yoghurt-and-spice marinated chicken, charred hard at the edges and still soft in the middle.",
    intro:
      "Chicken tikka lives or dies on two things: a marinade with enough acidity to work through the meat, and heat aggressive enough to char before the inside dries out. Everything else is detail.",
    image: heroTikka,
    creator: "viya-sheth",
    cuisine: "North Indian",
    category: "Starters",
    tags: ["Chicken", "Grill", "Party"],
    diet: ["Non-veg", "High protein", "Gluten-free"],
    minutes: 65,
    prep: 25,
    cook: 40,
    servings: 4,
    difficulty: "Medium",
    featured: true,
    ingredients: [
      { qty: 800, unit: "g", name: "boneless chicken thigh, cut into 4cm pieces" },
      { qty: 200, unit: "g", name: "thick hung curd" },
      { qty: 2, unit: "tbsp", name: "ginger garlic paste" },
      { qty: 1, unit: "tbsp", name: "Kashmiri chilli powder" },
      { qty: 1, unit: "tsp", name: "garam masala" },
      { qty: 1, unit: "tsp", name: "roasted cumin powder" },
      { qty: 1, unit: "tbsp", name: "gram flour, dry roasted" },
      { qty: 2, unit: "tbsp", name: "mustard oil" },
      { qty: 1, unit: "", name: "lemon, juiced" },
      { qty: 1.5, unit: "tsp", name: "salt" },
    ],
    steps: [
      {
        text: "Cut the chicken into even pieces and score each one twice. Rub with lemon juice, half the salt and the ginger garlic paste, then leave for 20 minutes — this first, thinner marinade is what actually gets inside the meat.",
        timer: 20,
      },
      {
        text: "Whisk the hung curd until smooth, then beat in the chilli powder, garam masala, cumin, roasted gram flour and mustard oil. It should coat a spoon thickly; a runny marinade slides off in the heat and burns on the tray instead of the chicken.",
      },
      {
        text: "Fold the chicken through and refrigerate. Four hours is good, overnight is better. Any longer and the acid starts breaking the surface into mush.",
      },
      {
        text: "Thread onto skewers with a finger of space between pieces. Crowded skewers steam. Heat the oven to its maximum with the grill element on, or get a charcoal grill white-hot.",
      },
      {
        text: "Cook 8 minutes on the top shelf, turn, and cook another 6. You are looking for blackened edges and a dry, tight surface — not an even golden colour.",
        timer: 14,
      },
      {
        text: "Brush with melted butter, put it back under the heat for 2 minutes, then rest for 5 before serving with mint chutney and raw onion.",
        timer: 5,
      },
    ],
    notes: [
      "Thigh, not breast. Breast is dry by the time the outside chars, and no marinade fixes that.",
      "Hung curd matters more than any spice here. Regular curd carries too much water and the marinade never clings.",
      "If the pieces are wet going onto the skewer, wipe the excess off. Wet chicken steams grey before it browns.",
    ],
    tips: [
      "A tablespoon of roasted gram flour tightens the marinade and stops it splitting under high heat.",
      "No grill? Sear in a smoking cast iron pan in two batches, then finish in the oven.",
      "For a smoky finish, put a lit piece of charcoal in a steel bowl among the cooked pieces, pour over a spoon of ghee, and cover for two minutes.",
    ],
    substitutions: [
      { from: "Mustard oil", to: "Neutral oil plus a pinch of mustard powder" },
      { from: "Hung curd", to: "Greek yoghurt, strained for 20 minutes" },
      { from: "Chicken thigh", to: "Paneer or firm tofu — halve the marination time" },
    ],
    faqs: [
      {
        q: "Why is my tikka pale instead of charred?",
        a: "The oven is not hot enough or the tray is too low. Tikka needs direct radiant heat close to the element, not a moderate bake.",
      },
      {
        q: "Can I marinate it for two days?",
        a: "No. Past about 12 hours the yoghurt and lemon start breaking down the surface protein and the texture turns soft and grainy.",
      },
      {
        q: "How do I get the restaurant red colour?",
        a: "Kashmiri chilli, not food colour. It carries colour without much heat, so you can use a full tablespoon.",
      },
    ],
    nutrition: [
      { label: "Calories", value: "410 kcal" },
      { label: "Protein", value: "44 g" },
      { label: "Carbs", value: "6 g" },
      { label: "Fat", value: "23 g" },
    ],
    story:
      "In the dhaba we never timed it. You knew tikka was ready when the fat started dripping and hissing on the coals below.",
  },
  {
    slug: "hyderabadi-chicken-biryani",
    title: "Hyderabadi Chicken Biryani",
    blurb:
      "Raw marinated chicken layered under par-cooked rice and sealed to cook in its own steam.",
    intro:
      "This is kacchi biryani — the chicken goes in raw. That means the timing of the rice and the timing of the meat have to meet in the middle, which is the whole skill of the dish.",
    image: biryani,
    creator: "viya-sheth",
    cuisine: "Hyderabadi",
    category: "Main Course",
    tags: ["Chicken", "Rice", "Festive"],
    diet: ["Non-veg", "High protein"],
    minutes: 85,
    prep: 30,
    cook: 55,
    servings: 6,
    difficulty: "Advanced",
    ingredients: [
      { qty: 1, unit: "kg", name: "bone-in chicken, cut into large pieces" },
      { qty: 750, unit: "g", name: "aged basmati rice" },
      { qty: 300, unit: "g", name: "thick curd" },
      { qty: 3, unit: "", name: "onions, thinly sliced and fried to deep brown" },
      { qty: 2, unit: "tbsp", name: "ginger garlic paste" },
      { qty: 2, unit: "tsp", name: "Kashmiri chilli powder" },
      { qty: 1, unit: "tsp", name: "turmeric" },
      { qty: 1, unit: "tbsp", name: "biryani masala" },
      { qty: 1, unit: "handful", name: "mint and coriander, chopped" },
      { qty: 1, unit: "pinch", name: "saffron soaked in 60ml warm milk" },
      { qty: 60, unit: "ml", name: "ghee" },
    ],
    steps: [
      {
        text: "Marinate the chicken with curd, ginger garlic paste, chilli, turmeric, biryani masala, half the fried onions, half the herbs and plenty of salt. Leave it at least an hour, ideally four.",
        timer: 60,
      },
      {
        text: "Soak the rice for 30 minutes, then boil in heavily salted water with whole spices until it is 70% done — the grain should snap when pressed, with a hard white core still visible.",
        timer: 6,
      },
      {
        text: "Spread the marinated chicken in a heavy pot in one even layer. Do not brown it, do not stir it. Layer the drained rice on top.",
      },
      {
        text: "Scatter the remaining onions and herbs, pour over the saffron milk and ghee, then seal the lid with dough or foil so no steam escapes.",
      },
      {
        text: "Cook on high for 5 minutes to build steam, then on the lowest possible heat, over a tawa if you have one, for 35 minutes.",
        timer: 35,
      },
      {
        text: "Rest sealed for 10 minutes off the heat. Open it at the table and lift from the bottom with a flat spoon so the layers stay intact.",
        timer: 10,
      },
    ],
    notes: [
      "Aged basmati only. New rice absorbs too much water and collapses under dum.",
      "The pot should be wide rather than tall. Deep pots leave the top rice dry and the bottom chicken swimming.",
      "If your lid is loose, a rope of chapati dough around the rim costs two minutes and saves the dish.",
    ],
    tips: [
      "Fry the onions until genuinely dark brown, not golden. Their sweetness is the backbone of the flavour.",
      "Salt the rice water like pasta water. It is the only chance the grain gets to be seasoned.",
      "A tawa under the pot spreads the flame and stops the base catching.",
    ],
    substitutions: [
      { from: "Chicken", to: "Mutton on the bone — increase dum time to 60 minutes" },
      { from: "Saffron", to: "A pinch of turmeric in warm milk, for colour only" },
      { from: "Ghee", to: "Butter, though the aroma is noticeably flatter" },
    ],
    faqs: [
      {
        q: "My rice is cooked but the chicken is not.",
        a: "The pieces were too large or the heat too low. Cut chicken no bigger than 6cm for kacchi biryani, and give it 5 full minutes on high before dropping the flame.",
      },
      {
        q: "Can I use a pressure cooker?",
        a: "You can, without the weight, on the lowest heat. But dum is about slow, gentle steam — a cooker tends to give you soft rice and hard edges.",
      },
      {
        q: "Why is my biryani wet at the bottom?",
        a: "Too much curd, or the chicken was not drained of its marinade. The meat should be coated, not sitting in liquid.",
      },
    ],
    nutrition: [
      { label: "Calories", value: "690 kcal" },
      { label: "Protein", value: "38 g" },
      { label: "Carbs", value: "78 g" },
      { label: "Fat", value: "24 g" },
    ],
    story:
      "The old cooks judged dum by smell alone. When the steam changed from raw rice to something toasted, the pot came off the fire.",
  },
  {
    slug: "butter-chicken",
    title: "Butter Chicken",
    blurb: "Grilled chicken folded into a tomato gravy rounded off with butter and a little cream.",
    intro:
      "Butter chicken is a tomato dish more than a cream dish. Cook the tomatoes properly and you need very little cream at the end; skip that step and no amount of dairy will rescue it.",
    image: butterChicken,
    creator: "viya-sheth",
    cuisine: "Punjabi",
    category: "Main Course",
    tags: ["Chicken", "Comfort"],
    diet: ["Non-veg", "Gluten-free"],
    minutes: 55,
    prep: 20,
    cook: 35,
    servings: 4,
    difficulty: "Medium",
    ingredients: [
      { qty: 700, unit: "g", name: "chicken thigh, marinated and grilled as for tikka" },
      { qty: 900, unit: "g", name: "ripe tomatoes, roughly chopped" },
      { qty: 6, unit: "cloves", name: "garlic" },
      { qty: 3, unit: "cm", name: "ginger" },
      { qty: 30, unit: "g", name: "cashews" },
      { qty: 80, unit: "g", name: "butter" },
      { qty: 1, unit: "tsp", name: "Kashmiri chilli powder" },
      { qty: 1, unit: "tsp", name: "garam masala" },
      { qty: 1, unit: "tbsp", name: "kasuri methi, crushed" },
      { qty: 60, unit: "ml", name: "cream" },
      { qty: 1, unit: "tsp", name: "sugar" },
    ],
    steps: [
      {
        text: "Simmer the tomatoes with garlic, ginger, cashews and a cup of water until completely collapsed and the raw smell has gone.",
        timer: 20,
      },
      {
        text: "Blend until very smooth, then pass through a sieve. Skipping the sieve is the difference between a restaurant gravy and a home one.",
      },
      {
        text: "Return to the pan with the chilli powder and cook on medium, stirring often, until the purée darkens and butter-coloured oil pools at the edge. This takes longer than you expect and is the single most important step.",
        timer: 12,
      },
      {
        text: "Drop in the butter a piece at a time, swirling rather than stirring, so it emulsifies into the gravy instead of floating on top.",
      },
      {
        text: "Add the grilled chicken with any resting juices, the sugar and a splash of water. Simmer 5 minutes so the meat takes on the sauce.",
        timer: 5,
      },
      {
        text: "Off the heat, crush the kasuri methi between your palms into the pan and stir in the cream. Both are finishing touches — boiling them dulls the first and splits the second.",
      },
    ],
    notes: [
      "The chicken should be cooked separately and charred. Poaching raw chicken in the gravy gives you a different, blander dish.",
      "Sugar is not optional if your tomatoes are sharp. A teaspoon rounds the acid without making it sweet.",
      "Kasuri methi is the flavour most people cannot place. Do not leave it out.",
    ],
    tips: [
      "Cashews thicken more gently than cream and keep the colour bright.",
      "If the gravy splits, take it off the heat and whisk in a spoon of cold butter.",
      "Make the gravy a day ahead; it improves overnight and the chicken can go in at the last minute.",
    ],
    substitutions: [
      { from: "Cream", to: "Full-fat milk reduced by half, or extra cashew paste" },
      { from: "Cashews", to: "Blanched almonds, skins removed" },
      { from: "Chicken", to: "Grilled paneer or roasted cauliflower" },
    ],
    faqs: [
      {
        q: "Why is my butter chicken orange rather than deep red?",
        a: "Under-cooked tomato base. Colour deepens as the purée reduces and the oil separates — that stage is not decorative.",
      },
      {
        q: "Can I skip the sieve?",
        a: "You can, but tomato skin and cashew grit stay behind and the sauce will feel rough on the tongue.",
      },
    ],
    nutrition: [
      { label: "Calories", value: "620 kcal" },
      { label: "Protein", value: "40 g" },
      { label: "Carbs", value: "18 g" },
      { label: "Fat", value: "42 g" },
    ],
  },
  {
    slug: "paneer-butter-masala",
    title: "Paneer Butter Masala",
    blurb: "Soft paneer in a cashew-thickened tomato gravy, kept on the gentle side of rich.",
    intro:
      "The trick with paneer is restraint. It needs about ninety seconds in the sauce — long enough to warm through, short enough to stay soft rather than rubbery.",
    image: paneerButterMasala,
    creator: "viya-sheth",
    cuisine: "Punjabi",
    category: "Main Course",
    tags: ["Paneer", "Comfort"],
    diet: ["Vegetarian", "Gluten-free"],
    minutes: 45,
    prep: 15,
    cook: 30,
    servings: 4,
    difficulty: "Easy",
    ingredients: [
      { qty: 400, unit: "g", name: "paneer, cut into 2cm cubes" },
      { qty: 700, unit: "g", name: "tomatoes, chopped" },
      { qty: 40, unit: "g", name: "cashews, soaked" },
      { qty: 1, unit: "", name: "onion, sliced" },
      { qty: 2, unit: "tbsp", name: "ginger garlic paste" },
      { qty: 60, unit: "g", name: "butter" },
      { qty: 1, unit: "tsp", name: "Kashmiri chilli powder" },
      { qty: 1, unit: "tsp", name: "garam masala" },
      { qty: 1, unit: "tbsp", name: "kasuri methi" },
      { qty: 50, unit: "ml", name: "cream" },
    ],
    steps: [
      {
        text: "Soften the paneer: cover the cubes with hot salted water for 10 minutes while you build the gravy. Straight-from-the-fridge paneer stays squeaky no matter how good the sauce is.",
        timer: 10,
      },
      {
        text: "Cook onion in half the butter until translucent, add ginger garlic paste and fry until it stops smelling raw, then add tomatoes and cashews and simmer until soft.",
        timer: 15,
      },
      { text: "Blend smooth and strain back into the pan." },
      {
        text: "Cook the purée with chilli powder on medium heat until it thickens and the fat separates at the rim.",
        timer: 8,
      },
      {
        text: "Whisk in the remaining butter, drain the paneer and slide it in. Two minutes, no more, then finish with crushed kasuri methi, garam masala and cream off the heat.",
        timer: 2,
      },
    ],
    notes: [
      "Soaking paneer in hot water is the single upgrade that changes this dish at home.",
      "Do not brown the paneer first unless you want a firmer, chewier texture — it is a different dish.",
    ],
    tips: [
      "Add a pinch of sugar if the tomatoes are sour.",
      "Leftover gravy freezes well; add fresh paneer when reheating.",
    ],
    substitutions: [
      { from: "Paneer", to: "Firm tofu, pressed and soaked the same way" },
      { from: "Cream", to: "Coconut cream, for a vegan version with butter swapped for oil" },
      { from: "Cashews", to: "Melon seeds (magaz) or almond paste" },
    ],
    faqs: [
      {
        q: "My paneer went rubbery. Why?",
        a: "It boiled. Paneer tightens the moment the sauce simmers hard around it — add it at the very end over low heat.",
      },
      {
        q: "Can I make this without cream?",
        a: "Yes. Increase the cashews to 60g; the gravy will be slightly less glossy but just as rich.",
      },
    ],
    nutrition: [
      { label: "Calories", value: "540 kcal" },
      { label: "Protein", value: "22 g" },
      { label: "Carbs", value: "20 g" },
      { label: "Fat", value: "40 g" },
    ],
  },
  {
    slug: "masala-dosa",
    title: "Masala Dosa",
    blurb: "Fermented rice and dal batter cooked thin and crisp, folded around soft spiced potato.",
    intro:
      "A dosa is two skills stacked: a batter that has fermented properly, and a pan at exactly the right temperature. Neither can be hurried and neither can be faked.",
    image: masalaDosa,
    creator: "viya-sheth",
    cuisine: "South Indian",
    category: "Breakfast",
    tags: ["Fermented", "Street Food"],
    diet: ["Vegetarian", "Vegan", "Gluten-free"],
    minutes: 50,
    prep: 20,
    cook: 30,
    servings: 4,
    difficulty: "Medium",
    ingredients: [
      { qty: 300, unit: "g", name: "idli rice" },
      { qty: 100, unit: "g", name: "urad dal" },
      { qty: 1, unit: "tsp", name: "fenugreek seeds" },
      { qty: 500, unit: "g", name: "potatoes, boiled and roughly crushed" },
      { qty: 2, unit: "", name: "onions, sliced" },
      { qty: 1, unit: "tsp", name: "mustard seeds" },
      { qty: 1, unit: "sprig", name: "curry leaves" },
      { qty: 0.5, unit: "tsp", name: "turmeric" },
      { qty: 2, unit: "", name: "green chillies, slit" },
      { qty: 2, unit: "tbsp", name: "sesame oil" },
    ],
    steps: [
      {
        text: "Soak rice separately from the urad dal and fenugreek for 5 hours. Grind the dal first to a light, airy paste, then the rice to a fine but faintly gritty one, and combine by hand.",
      },
      {
        text: "Ferment 8–14 hours somewhere warm. It is ready when the volume has clearly risen and the surface is domed and bubbly, not when the clock says so.",
      },
      {
        text: "For the filling, crackle mustard seeds in oil, add curry leaves, chillies and onions and cook until soft, then fold in turmeric and the crushed potato with a splash of water. Keep it coarse.",
        timer: 10,
      },
      {
        text: "Heat a flat pan until a droplet of water skitters and vanishes. Wipe with an onion half dipped in oil — this seasons the surface and stops sticking.",
      },
      {
        text: "Pour a ladle in the centre and spread outward in one continuous spiral. Drizzle oil at the edges and cook until the base is lacy and deep gold; a dosa is only turned if it is plain, never if it is filled.",
        timer: 3,
      },
      {
        text: "Spoon potato along the middle, fold, and serve immediately with coconut chutney and sambar.",
      },
    ],
    notes: [
      "Cold kitchens kill fermentation. In winter, keep the batter in the oven with only the light on.",
      "The pan must cool slightly between dosas — wipe it with a damp cloth or the batter sets before you can spread it.",
      "Batter thickness matters more than technique. It should pour like thin cream.",
    ],
    tips: [
      "A spoon of cooked rice in the grinder gives a crisper dosa.",
      "Day-three batter makes better dosas than day-one batter, though poorer idlis.",
      "Salt after fermentation in very warm climates; it slows the culture down.",
    ],
    substitutions: [
      { from: "Idli rice", to: "Short-grain parboiled rice" },
      { from: "Sesame oil", to: "Any neutral oil, though the aroma changes" },
    ],
    faqs: [
      {
        q: "My batter did not rise.",
        a: "Almost always temperature. Below 22°C the wild yeast on the urad dal barely works — see the journal piece on dosa fermentation.",
      },
      {
        q: "Why does my dosa stick?",
        a: "The pan was either too cool or not seasoned. Heat it fully, rub with oil, then bring it down slightly before pouring.",
      },
    ],
    nutrition: [
      { label: "Calories", value: "380 kcal" },
      { label: "Protein", value: "9 g" },
      { label: "Carbs", value: "62 g" },
      { label: "Fat", value: "11 g" },
    ],
    story:
      "On the Kerala coast the batter jar sits out on the counter all year. You learn to read it by smell — sour is fine, sharp is too far.",
  },
  {
    slug: "gulab-jamun",
    title: "Gulab Jamun",
    blurb: "Milk-solid dumplings fried slow and low, then left to drink warm cardamom syrup.",
    intro:
      "Gulab jamun goes wrong in the frying, not the mixing. Low oil and patience give you a jamun cooked to the centre; hot oil gives you a browned shell around raw khoya.",
    image: gulabJamun,
    creator: "viya-sheth",
    cuisine: "Desserts",
    category: "Dessert",
    tags: ["Festive", "Sweet"],
    diet: ["Vegetarian"],
    minutes: 45,
    prep: 15,
    cook: 30,
    servings: 6,
    difficulty: "Medium",
    ingredients: [
      { qty: 200, unit: "g", name: "khoya (milk solids), grated" },
      { qty: 40, unit: "g", name: "plain flour" },
      { qty: 1, unit: "pinch", name: "baking soda" },
      { qty: 2, unit: "tbsp", name: "milk, as needed" },
      { qty: 400, unit: "g", name: "sugar" },
      { qty: 400, unit: "ml", name: "water" },
      { qty: 4, unit: "pods", name: "green cardamom, bruised" },
      { qty: 1, unit: "tsp", name: "rose water" },
      { qty: 500, unit: "ml", name: "ghee or oil, for frying" },
    ],
    steps: [
      {
        text: "Boil sugar, water and cardamom for 6 minutes to a syrup with no thread — it should feel slightly sticky, not stringy. Add rose water off the heat and keep it warm.",
        timer: 6,
      },
      {
        text: "Knead khoya, flour and soda with just enough milk to make a smooth, soft dough. Work it for two minutes until no grain remains, then stop; over-kneading toughens it.",
      },
      {
        text: "Roll into crack-free balls. Any surface crack becomes a split jamun in the oil.",
      },
      {
        text: "Heat the ghee to a low 130°C. Slide the balls in and let them sit undisturbed until they float, then stir gently and fry 10–12 minutes until evenly deep brown.",
        timer: 12,
      },
      {
        text: "Drain briefly and drop straight into the warm — never hot, never cold — syrup. Leave at least 2 hours; they roughly double as they drink.",
        timer: 120,
      },
    ],
    notes: [
      "Frying temperature is everything: too hot and the middle stays raw and hard.",
      "Warm jamun into warm syrup. A temperature clash makes them shrink and go dense.",
    ],
    tips: [
      "A teaspoon of semolina in the dough helps them hold shape.",
      "If a test ball breaks apart in the oil, knead in a little more flour.",
    ],
    substitutions: [
      { from: "Khoya", to: "Full-fat milk powder with 2 tbsp cream and a little ghee" },
      { from: "Rose water", to: "A few strands of saffron in the syrup" },
    ],
    faqs: [
      {
        q: "Why are my jamuns hard in the centre?",
        a: "Fried too fast. The outside sets before heat reaches the middle. Drop the temperature and extend the time.",
      },
      {
        q: "Can I make them ahead?",
        a: "Yes, they keep three days in syrup at room temperature and improve on day two.",
      },
    ],
    nutrition: [
      { label: "Calories", value: "290 kcal" },
      { label: "Protein", value: "4 g" },
      { label: "Carbs", value: "44 g" },
      { label: "Fat", value: "11 g" },
    ],
  },
  {
    slug: "dal-makhani",
    title: "Dal Makhani",
    blurb: "Black urad slow-simmered until creamy, finished with butter rather than cream.",
    intro:
      "Dal makhani is a time recipe, not an ingredients recipe. The list is short; the difference between good and remarkable is two extra hours over a very low flame.",
    image: dalMakhani,
    creator: "viya-sheth",
    cuisine: "Punjabi",
    category: "Main Course",
    tags: ["Slow cooked", "Comfort"],
    diet: ["Vegetarian", "Gluten-free"],
    minutes: 180,
    prep: 20,
    cook: 160,
    servings: 6,
    difficulty: "Medium",
    ingredients: [
      { qty: 250, unit: "g", name: "whole black urad dal, soaked overnight" },
      { qty: 60, unit: "g", name: "red kidney beans, soaked overnight" },
      { qty: 400, unit: "g", name: "tomato purée" },
      { qty: 2, unit: "tbsp", name: "ginger garlic paste" },
      { qty: 100, unit: "g", name: "butter" },
      { qty: 1, unit: "tsp", name: "Kashmiri chilli powder" },
      { qty: 1, unit: "tsp", name: "garam masala" },
      { qty: 50, unit: "ml", name: "cream" },
    ],
    steps: [
      {
        text: "Pressure cook the soaked dal and beans with salt until completely soft — a grain should collapse between two fingers with no resistance.",
        timer: 40,
      },
      {
        text: "Separately cook the tomato purée with ginger garlic paste, chilli and half the butter until it darkens and the oil comes away at the sides.",
        timer: 15,
      },
      {
        text: "Combine and simmer uncovered on the lowest heat, stirring every ten minutes and mashing lightly against the side of the pan. Two hours is the minimum for that natural creaminess.",
        timer: 120,
      },
      {
        text: "Finish with the remaining butter, garam masala and a swirl of cream. Adjust with hot water — it thickens as it stands.",
      },
    ],
    notes: [
      "The creaminess should come from broken-down dal, not dairy. Cream added early just masks an under-cooked pot.",
      "Stir from the bottom. Urad sticks and scorches without warning.",
    ],
    tips: [
      "Make it a day ahead. Reheated dal makhani is measurably better.",
      "A smoked charcoal finish (dhungar) gives it the tandoor edge dhabas have.",
    ],
    substitutions: [
      { from: "Butter", to: "Ghee, for a nuttier finish" },
      { from: "Cream", to: "Cashew paste for a vegan version, with oil in place of butter" },
    ],
    faqs: [
      {
        q: "Can I shortcut the simmer?",
        a: "Not really. You can blend a ladle of dal to fake the texture, but the deep flavour only comes from long, slow reduction.",
      },
    ],
    nutrition: [
      { label: "Calories", value: "430 kcal" },
      { label: "Protein", value: "18 g" },
      { label: "Carbs", value: "38 g" },
      { label: "Fat", value: "24 g" },
    ],
  },
  {
    slug: "chole-bhature",
    title: "Chole Bhature",
    blurb:
      "Dark, tea-stained chickpea curry with fried bread that puffs the moment it hits the oil.",
    intro:
      "The colour of good chole comes from tea and slow-cooked onion, not from chilli. The bhature comes from a dough left long enough to relax and a pan of genuinely hot oil.",
    image: choleBhature,
    creator: "viya-sheth",
    cuisine: "North Indian",
    category: "Main Course",
    tags: ["Street Food", "Weekend"],
    diet: ["Vegetarian"],
    minutes: 95,
    prep: 30,
    cook: 65,
    servings: 4,
    difficulty: "Medium",
    ingredients: [
      { qty: 250, unit: "g", name: "dried chickpeas, soaked overnight" },
      { qty: 2, unit: "bags", name: "black tea" },
      { qty: 2, unit: "", name: "onions, finely chopped" },
      { qty: 3, unit: "", name: "tomatoes, puréed" },
      { qty: 2, unit: "tsp", name: "chole masala" },
      { qty: 1, unit: "tsp", name: "amchur (dry mango powder)" },
      { qty: 300, unit: "g", name: "plain flour" },
      { qty: 3, unit: "tbsp", name: "curd" },
      { qty: 1, unit: "tsp", name: "sugar" },
      { qty: 500, unit: "ml", name: "oil, for frying" },
    ],
    steps: [
      {
        text: "Pressure cook the chickpeas with the tea bags and salt until soft enough to crush easily. Remove the bags — the liquid should be dark and the chickpeas stained through.",
        timer: 35,
      },
      {
        text: "Make the bhatura dough: flour, curd, sugar, salt and warm water, kneaded soft and left covered for at least 2 hours. Rushing this gives you flat, tough bread.",
        timer: 120,
      },
      {
        text: "Brown the onions properly — 12 minutes at least — then add tomato purée and chole masala and cook until the fat separates.",
        timer: 12,
      },
      {
        text: "Add the chickpeas with a cup of their cooking liquid and simmer until the gravy clings. Finish with amchur for sourness.",
        timer: 20,
      },
      {
        text: "Roll the bhature to an even 4mm and slide into hot oil. Press the centre gently with a slotted spoon and it will balloon in seconds. Turn once, drain, serve hot.",
        timer: 2,
      },
    ],
    notes: [
      "Uneven rolling is the main reason bhature refuse to puff — a thin patch lets the steam escape.",
      "Oil below 180°C gives you a greasy, heavy bread instead of a hollow one.",
    ],
    tips: [
      "A spoonful of semolina in the dough makes them crisper at the edge.",
      "Chole tastes better the next day; the bhature must be made to order.",
    ],
    substitutions: [
      { from: "Amchur", to: "Lemon juice, added off the heat" },
      {
        from: "Tea bags",
        to: "A small piece of black cardamom and a bay leaf, for colour and depth",
      },
    ],
    faqs: [
      {
        q: "Can I use tinned chickpeas?",
        a: "Yes, but you lose the tea-stained colour and the cooking liquid that thickens the gravy. Add a strong brewed tea to compensate.",
      },
    ],
    nutrition: [
      { label: "Calories", value: "720 kcal" },
      { label: "Protein", value: "20 g" },
      { label: "Carbs", value: "96 g" },
      { label: "Fat", value: "28 g" },
    ],
  },
  {
    slug: "punjabi-samosa",
    title: "Punjabi Samosa",
    blurb: "Coarse potato and pea filling in a blistered, short pastry that stays crisp for hours.",
    intro:
      "A samosa shell should shatter, not bend. That comes from a stiff dough with plenty of fat rubbed in, and from frying twice as slowly as instinct suggests.",
    image: samosa,
    creator: "viya-sheth",
    cuisine: "North Indian",
    category: "Snacks",
    tags: ["Street Food", "Party"],
    diet: ["Vegetarian", "Vegan"],
    minutes: 75,
    prep: 35,
    cook: 40,
    servings: 6,
    difficulty: "Medium",
    ingredients: [
      { qty: 300, unit: "g", name: "plain flour" },
      { qty: 60, unit: "g", name: "ghee or oil, for the dough" },
      { qty: 1, unit: "tsp", name: "ajwain (carom seeds)" },
      { qty: 500, unit: "g", name: "potatoes, boiled and hand-crushed" },
      { qty: 100, unit: "g", name: "green peas" },
      { qty: 1, unit: "tbsp", name: "coriander seeds, crushed" },
      { qty: 1, unit: "tsp", name: "amchur" },
      { qty: 1, unit: "tsp", name: "garam masala" },
      { qty: 500, unit: "ml", name: "oil, for frying" },
    ],
    steps: [
      {
        text: "Rub the ghee into the flour with ajwain and salt until it holds shape when squeezed. Add cold water sparingly and knead to a stiff dough. Rest 30 minutes.",
        timer: 30,
      },
      {
        text: "Cook the peas with crushed coriander seeds, then fold through the crushed potato with amchur and garam masala. Hand-crushed, never mashed — texture is the point.",
      },
      {
        text: "Roll each dough ball into an oval, cut in half, form a cone with a little water and fill. Seal firmly; a gap lets oil in and the filling out.",
      },
      {
        text: "Fry at a low 130°C for 12 minutes until pale and blistered, then raise the heat and fry 3 more minutes until deep gold.",
        timer: 15,
      },
    ],
    notes: [
      "The low first fry is what makes the pastry flaky and bubbled. Hot oil from the start gives a smooth, hard shell.",
      "Let the filling cool fully before shaping or the steam softens the pastry from inside.",
    ],
    tips: [
      "Shape them all before you start frying; the oil temperature needs your full attention.",
      "They freeze raw beautifully — fry from frozen, adding four minutes.",
    ],
    substitutions: [
      { from: "Green peas", to: "Paneer and cashew, for a richer filling" },
      { from: "Amchur", to: "Anardana (pomegranate seed powder)" },
    ],
    faqs: [
      {
        q: "Why do my samosas blister unevenly?",
        a: "That blistering is a good sign. Smooth, glassy shells usually mean not enough fat was rubbed into the flour.",
      },
    ],
    nutrition: [
      { label: "Calories", value: "310 kcal" },
      { label: "Protein", value: "6 g" },
      { label: "Carbs", value: "40 g" },
      { label: "Fat", value: "14 g" },
    ],
  },
  {
    slug: "pav-bhaji",
    title: "Pav Bhaji",
    blurb:
      "Mixed vegetables mashed down on a hot griddle with butter, chilli and a lot of pressure.",
    intro:
      "Pav bhaji is not a vegetable curry. It is vegetables cooked past the point of holding shape, mashed hard on the tawa until everything becomes one thing.",
    image: pavBhaji,
    creator: "viya-sheth",
    cuisine: "Maharashtrian",
    category: "Street Food",
    tags: ["Street Food", "Quick"],
    diet: ["Vegetarian"],
    minutes: 45,
    prep: 15,
    cook: 30,
    servings: 4,
    difficulty: "Easy",
    ingredients: [
      { qty: 3, unit: "", name: "potatoes, boiled" },
      { qty: 150, unit: "g", name: "cauliflower, finely chopped" },
      { qty: 100, unit: "g", name: "green peas" },
      { qty: 2, unit: "", name: "onions, finely chopped" },
      { qty: 4, unit: "", name: "tomatoes, chopped" },
      { qty: 1, unit: "", name: "capsicum, chopped" },
      { qty: 2, unit: "tbsp", name: "pav bhaji masala" },
      { qty: 100, unit: "g", name: "butter" },
      { qty: 8, unit: "", name: "pav buns" },
    ],
    steps: [
      {
        text: "Cook onions in butter on a wide pan until soft, add capsicum, then tomatoes, and cook until the tomatoes give up all their liquid and turn jammy.",
        timer: 12,
      },
      {
        text: "Add pav bhaji masala and fry it in the fat for a full minute — this wakes the blend up and removes the raw edge.",
      },
      {
        text: "Add the boiled potatoes, cauliflower and peas with a cup of water and mash continuously with a masher, scraping the base as you go, for at least 10 minutes.",
        timer: 10,
      },
      {
        text: "Finish with more butter and lemon. Split the pav, toast cut-side down in butter and a spoon of the bhaji until the edges catch.",
        timer: 3,
      },
    ],
    notes: [
      "Cook the tomatoes far longer than feels necessary. Undercooked tomato makes the bhaji taste sharp and thin.",
      "Mash while it cooks, not after. Constant contact with the hot pan is where the flavour builds.",
    ],
    tips: [
      "A grated beetroot deepens the colour without changing the taste.",
      "Keep some bhaji chunky if you like texture, but authentic street versions are almost smooth.",
    ],
    substitutions: [
      { from: "Pav", to: "Any soft white roll, split and griddled in butter" },
      {
        from: "Butter",
        to: "Oil for a lighter version, though it will taste noticeably less like pav bhaji",
      },
    ],
    faqs: [
      {
        q: "Which vegetables should not go in?",
        a: "Anything that keeps its bite. Carrots and beans need to be chopped tiny and cooked to collapse or they sit awkwardly in the mash.",
      },
    ],
    nutrition: [
      { label: "Calories", value: "520 kcal" },
      { label: "Protein", value: "12 g" },
      { label: "Carbs", value: "64 g" },
      { label: "Fat", value: "24 g" },
    ],
  },
  {
    slug: "goan-prawn-curry",
    title: "Goan Prawn Curry",
    blurb: "Fresh coconut and Kashmiri chilli ground to a paste, sharpened with tamarind.",
    intro:
      "Prawns need ninety seconds. Everything else in this curry — the grinding, the simmering, the balancing of tamarind against coconut — happens before they go anywhere near the pot.",
    image: prawnCurry,
    creator: "viya-sheth",
    cuisine: "Goan",
    category: "Main Course",
    tags: ["Seafood", "Coastal", "Quick"],
    diet: ["Non-veg", "Gluten-free", "High protein"],
    minutes: 35,
    prep: 15,
    cook: 20,
    servings: 4,
    difficulty: "Easy",
    ingredients: [
      { qty: 500, unit: "g", name: "prawns, shelled and deveined" },
      { qty: 150, unit: "g", name: "fresh grated coconut" },
      { qty: 6, unit: "", name: "dried Kashmiri chillies" },
      { qty: 1, unit: "tsp", name: "cumin seeds" },
      { qty: 1, unit: "tsp", name: "coriander seeds" },
      { qty: 0.5, unit: "tsp", name: "turmeric" },
      { qty: 1, unit: "walnut-sized ball", name: "tamarind, soaked" },
      { qty: 1, unit: "", name: "onion, sliced" },
      { qty: 2, unit: "", name: "green chillies, slit" },
    ],
    steps: [
      {
        text: "Grind coconut, soaked chillies, cumin, coriander, turmeric and tamarind with a little water into a very smooth, brick-red paste. Grit here stays grit in the final curry.",
      },
      {
        text: "Soften the onion in oil, add the paste and cook on medium for 8 minutes until it darkens slightly and smells cooked rather than raw.",
        timer: 8,
      },
      {
        text: "Add water to a pourable consistency, season, and simmer 5 minutes. Taste now — this is the last chance to balance salt, sour and heat.",
        timer: 5,
      },
      {
        text: "Slide in the prawns and green chillies, cook 90 seconds until they just curl and turn opaque, then take the pan off the heat. They will finish in the residual heat.",
      },
    ],
    notes: [
      "Kashmiri chillies give the colour this curry is known for without making it punishingly hot.",
      "Fresh coconut, not desiccated. Desiccated has lost its oil and the curry tastes flat and dusty.",
    ],
    tips: [
      "Rest the curry 10 minutes before serving; the paste settles and the flavour rounds out.",
      "Prawn shells simmered in the water for 10 minutes make a stock worth using here.",
    ],
    substitutions: [
      { from: "Prawns", to: "Kingfish steaks, cooked 4 minutes a side" },
      { from: "Tamarind", to: "Kokum, for a cleaner, more Goan sourness" },
    ],
    faqs: [
      {
        q: "Can I make the base ahead?",
        a: "Yes — the masala base keeps three days refrigerated. Add prawns only when you are ready to serve.",
      },
      {
        q: "My prawns are rubbery.",
        a: "They were in the pan too long. Take them off while they still look slightly underdone.",
      },
    ],
    nutrition: [
      { label: "Calories", value: "340 kcal" },
      { label: "Protein", value: "28 g" },
      { label: "Carbs", value: "10 g" },
      { label: "Fat", value: "21 g" },
    ],
  },
  {
    slug: "kerala-fish-moilee",
    title: "Kerala Fish Moilee",
    blurb: "White fish poached in gentle coconut milk with curry leaves, ginger and green chilli.",
    intro:
      "Moilee is the quiet end of Kerala cooking — pale, delicate and easy to ruin by boiling. Keep the pan just below a simmer and the coconut milk stays silky.",
    image: fishMoilee,
    creator: "viya-sheth",
    cuisine: "Kerala",
    category: "Main Course",
    tags: ["Seafood", "Coastal"],
    diet: ["Non-veg", "Gluten-free"],
    minutes: 35,
    prep: 15,
    cook: 20,
    servings: 4,
    difficulty: "Easy",
    ingredients: [
      { qty: 600, unit: "g", name: "firm white fish, cut into steaks" },
      { qty: 400, unit: "ml", name: "thin coconut milk" },
      { qty: 150, unit: "ml", name: "thick coconut milk" },
      { qty: 2, unit: "", name: "onions, sliced" },
      { qty: 3, unit: "cm", name: "ginger, julienned" },
      { qty: 4, unit: "", name: "green chillies, slit" },
      { qty: 2, unit: "sprigs", name: "curry leaves" },
      { qty: 0.5, unit: "tsp", name: "turmeric" },
      { qty: 1, unit: "", name: "tomato, sliced into rounds" },
    ],
    steps: [
      { text: "Rub the fish with turmeric and salt and leave for 10 minutes.", timer: 10 },
      {
        text: "Cook onions, ginger, chillies and curry leaves in coconut oil until completely soft but with no colour at all. Browning here would change the whole character of the dish.",
        timer: 8,
      },
      { text: "Pour in the thin coconut milk and bring to the barest simmer." },
      {
        text: "Lay the fish in a single layer, add the tomato rounds, and poach for 8 minutes without stirring. Shake the pan instead.",
        timer: 8,
      },
      {
        text: "Take the pan off the heat, pour in the thick coconut milk and swirl. It must not boil after this point or it will split.",
      },
    ],
    notes: [
      "Two grades of coconut milk are not fussiness: the thin one cooks, the thick one finishes.",
      "Turning fish steaks breaks them. Move the pan, not the fish.",
    ],
    tips: [
      "A teaspoon of vinegar at the end lifts the whole dish.",
      "Serve with appam or plain rice; anything spiced competes with it.",
    ],
    substitutions: [
      { from: "White fish", to: "Prawns, poached for 2 minutes" },
      { from: "Coconut oil", to: "Any neutral oil, though the aroma is central here" },
    ],
    faqs: [
      {
        q: "My coconut milk split.",
        a: "It boiled. Once thick coconut milk goes in, the pan should never bubble again.",
      },
    ],
    nutrition: [
      { label: "Calories", value: "380 kcal" },
      { label: "Protein", value: "32 g" },
      { label: "Carbs", value: "9 g" },
      { label: "Fat", value: "25 g" },
    ],
  },
  {
    slug: "rogan-josh",
    title: "Rogan Josh",
    blurb: "Slow-braised lamb stained deep red with Kashmiri chilli and finished with fennel.",
    intro:
      "The red in rogan josh comes from chilli and long cooking, not tomato — there is none in the traditional version. What you are building is colour from fat, and depth from time.",
    image: roganJosh,
    creator: "viya-sheth",
    cuisine: "Kashmiri",
    category: "Main Course",
    tags: ["Slow cooked", "Festive"],
    diet: ["Non-veg", "Gluten-free", "High protein"],
    minutes: 120,
    prep: 20,
    cook: 100,
    servings: 6,
    difficulty: "Advanced",
    ingredients: [
      { qty: 1, unit: "kg", name: "lamb shoulder on the bone, cut into large pieces" },
      { qty: 200, unit: "g", name: "curd, whisked" },
      { qty: 3, unit: "tbsp", name: "Kashmiri chilli powder" },
      { qty: 2, unit: "tsp", name: "fennel powder" },
      { qty: 1, unit: "tsp", name: "dry ginger powder (sonth)" },
      { qty: 4, unit: "pods", name: "black cardamom" },
      { qty: 1, unit: "", name: "cinnamon stick" },
      { qty: 80, unit: "ml", name: "mustard oil" },
      { qty: 1, unit: "pinch", name: "asafoetida" },
    ],
    steps: [
      {
        text: "Heat mustard oil until it smokes, then cool slightly — this removes its raw pungency. Add the whole spices and asafoetida and let them bloom.",
      },
      {
        text: "Brown the lamb hard in batches. Crowding the pot steams the meat and you lose the base of the whole braise.",
        timer: 12,
      },
      {
        text: "Lower the heat, return all the lamb, and add the whisked curd a spoon at a time, stirring constantly so it does not split.",
      },
      {
        text: "Stir in the chilli powder, fennel and dry ginger, add hot water to barely cover, and simmer covered on the lowest heat for 80 minutes until the meat gives at a spoon.",
        timer: 80,
      },
      {
        text: "Uncover and reduce until oil rises red to the surface. That layer is the dish's signature and its readiness signal.",
        timer: 15,
      },
    ],
    notes: [
      "Bone-in lamb. The marrow and collagen are where the body of the gravy comes from.",
      "Add curd off a rolling boil and never all at once, or you will be straining a curdled sauce.",
    ],
    tips: [
      "Fennel powder goes in with the chilli, not at the end — it needs heat to open up.",
      "Rogan josh is better the next day, once the fat has been skimmed and the flavours settled.",
    ],
    substitutions: [
      { from: "Lamb shoulder", to: "Goat, adding 30 minutes to the braise" },
      { from: "Mustard oil", to: "Ghee, common in restaurant versions" },
    ],
    faqs: [
      {
        q: "Is there really no tomato or onion?",
        a: "Not in the Kashmiri Pandit version. Restaurant recipes add both, which makes a good curry — just a different one.",
      },
    ],
    nutrition: [
      { label: "Calories", value: "560 kcal" },
      { label: "Protein", value: "42 g" },
      { label: "Carbs", value: "7 g" },
      { label: "Fat", value: "40 g" },
    ],
  },
  {
    slug: "khaman-dhokla",
    title: "Khaman Dhokla",
    blurb: "Steamed gram flour squares, sponge-light, finished with a sweet mustard tempering.",
    intro:
      "Dhokla is a chemistry recipe. The batter must go into a steamer that is already at full steam, within seconds of the eno hitting it — everything else is preparation.",
    image: dhokla,
    creator: "viya-sheth",
    cuisine: "Gujarati",
    category: "Snacks",
    tags: ["Steamed", "Quick"],
    diet: ["Vegetarian", "Vegan", "Gluten-free"],
    minutes: 30,
    prep: 12,
    cook: 18,
    servings: 4,
    difficulty: "Easy",
    ingredients: [
      { qty: 200, unit: "g", name: "gram flour (besan)" },
      { qty: 1, unit: "tbsp", name: "semolina" },
      { qty: 1, unit: "tbsp", name: "lemon juice" },
      { qty: 1, unit: "tsp", name: "sugar" },
      { qty: 1, unit: "tsp", name: "eno fruit salt" },
      { qty: 1, unit: "tsp", name: "mustard seeds" },
      { qty: 2, unit: "", name: "green chillies, slit" },
      { qty: 1, unit: "sprig", name: "curry leaves" },
      { qty: 2, unit: "tbsp", name: "sugar, for the tempering syrup" },
    ],
    steps: [
      {
        text: "Whisk besan, semolina, lemon juice, sugar, salt and water into a smooth batter the thickness of pancake batter. Beat it for two minutes to get air in.",
      },
      { text: "Get the steamer to full, rolling steam and grease the tin before you go further." },
      {
        text: "Stir in the eno, watch the batter foam, and pour immediately into the tin. Any hesitation here and you get a dense slab.",
      },
      {
        text: "Steam 15 minutes until a skewer comes out clean. Cool 10 minutes before cutting or it will tear.",
        timer: 15,
      },
      {
        text: "Crackle mustard seeds in oil with chillies and curry leaves, add half a cup of water and the sugar, boil for a minute, then spoon over the cut dhokla so it soaks in.",
      },
    ],
    notes: [
      "The tempering syrup is what keeps dhokla moist. Dry tempering leaves it crumbly by the second hour.",
      "Old besan gives a bitter edge; smell it before you start.",
    ],
    tips: [
      "A pinch of turmeric is for colour only — too much makes it taste medicinal.",
      "Cut with a plastic knife or an oiled blade to keep clean edges.",
    ],
    substitutions: [
      { from: "Eno", to: "3/4 tsp baking soda with an extra tablespoon of lemon juice" },
      {
        from: "Semolina",
        to: "An extra tablespoon of besan, though the crumb is slightly tighter",
      },
    ],
    faqs: [
      {
        q: "Why did my dhokla sink in the middle?",
        a: "Either the steamer was not hot enough or the batter waited after the eno went in. Both let the bubbles collapse before the structure sets.",
      },
    ],
    nutrition: [
      { label: "Calories", value: "230 kcal" },
      { label: "Protein", value: "10 g" },
      { label: "Carbs", value: "30 g" },
      { label: "Fat", value: "8 g" },
    ],
  },
  {
    slug: "shorshe-maach",
    title: "Shorshe Maach",
    blurb: "Bengali fish in a raw mustard gravy, pungent, quick and unapologetically sharp.",
    intro:
      "Mustard turns bitter when it is over-ground or over-cooked. Grind it with a green chilli and a pinch of salt, cook it briefly, and it stays sharp rather than acrid.",
    image: bengaliFish,
    creator: "viya-sheth",
    cuisine: "Bengali",
    category: "Main Course",
    tags: ["Seafood", "Quick"],
    diet: ["Non-veg", "Gluten-free"],
    minutes: 30,
    prep: 15,
    cook: 15,
    servings: 4,
    difficulty: "Medium",
    ingredients: [
      { qty: 600, unit: "g", name: "rohu or any firm river fish, cut into steaks" },
      { qty: 3, unit: "tbsp", name: "yellow and black mustard seeds, soaked" },
      { qty: 4, unit: "", name: "green chillies" },
      { qty: 0.5, unit: "tsp", name: "turmeric" },
      { qty: 1, unit: "tsp", name: "nigella seeds (kalonji)" },
      { qty: 4, unit: "tbsp", name: "mustard oil" },
    ],
    steps: [
      {
        text: "Rub the fish with turmeric and salt, then shallow fry in smoking mustard oil for 2 minutes a side. Take it out while it is still underdone.",
        timer: 4,
      },
      {
        text: "Grind the soaked mustard seeds with two green chillies, a pinch of salt and very little water into a fine paste. Strain it if your grinder is not powerful.",
      },
      {
        text: "In the same oil, crackle nigella seeds, add the mustard paste with a cup of water and cook for just 4 minutes — long enough to lose the raw edge, short enough to stay pungent.",
        timer: 4,
      },
      {
        text: "Return the fish with the remaining slit chillies, simmer 4 minutes, then finish with a spoon of raw mustard oil off the heat.",
        timer: 4,
      },
    ],
    notes: [
      "Salt in the grinder is the traditional guard against bitterness. So is the green chilli.",
      "Raw mustard oil poured over at the end is a Bengali signature — do not skip it.",
    ],
    tips: [
      "Soak the mustard seeds for at least 20 minutes; dry grinding makes them harsh.",
      "Serve with plain rice only. This gravy needs a neutral partner.",
    ],
    substitutions: [
      { from: "Rohu", to: "Salmon or mackerel, both of which hold up to the mustard" },
      { from: "Mustard seeds", to: "2 tbsp kasundi (Bengali mustard sauce), added off the heat" },
    ],
    faqs: [
      {
        q: "Why is my gravy bitter?",
        a: "Over-ground or over-boiled mustard. Both release the bitter compounds. Keep the grinding short and the simmer brief.",
      },
    ],
    nutrition: [
      { label: "Calories", value: "390 kcal" },
      { label: "Protein", value: "34 g" },
      { label: "Carbs", value: "5 g" },
      { label: "Fat", value: "26 g" },
    ],
  },
  {
    slug: "idli-sambar",
    title: "Idli & Sambar",
    blurb:
      "Steamed rice cakes with a tamarind and toor dal stew built on fresh-ground sambar powder.",
    intro:
      "Idli is judged by touch. Press one gently and it should spring back completely — anything dense means the batter was under-fermented or over-stirred before steaming.",
    image: idliSambar,
    creator: "viya-sheth",
    cuisine: "South Indian",
    category: "Breakfast",
    tags: ["Fermented", "Comfort"],
    diet: ["Vegetarian", "Vegan", "Gluten-free"],
    minutes: 45,
    prep: 20,
    cook: 25,
    servings: 4,
    difficulty: "Medium",
    ingredients: [
      { qty: 400, unit: "g", name: "idli rice" },
      { qty: 150, unit: "g", name: "urad dal" },
      { qty: 200, unit: "g", name: "toor dal" },
      { qty: 1, unit: "walnut-sized ball", name: "tamarind" },
      { qty: 2, unit: "tbsp", name: "sambar powder" },
      { qty: 1, unit: "", name: "drumstick, cut into batons" },
      { qty: 1, unit: "", name: "onion, quartered" },
      { qty: 1, unit: "tsp", name: "mustard seeds" },
      { qty: 1, unit: "sprig", name: "curry leaves" },
    ],
    steps: [
      {
        text: "Soak rice and urad dal separately for 5 hours, grind the dal to a fluffy paste and the rice fine, then combine, salt lightly and ferment 10 hours.",
      },
      {
        text: "Fold the risen batter once, gently. Stirring knocks out the gas that makes idlis light.",
      },
      {
        text: "Grease the moulds, fill three-quarters full and steam 10 minutes. Test with a skewer, then wait 3 minutes before unmoulding or they tear.",
        timer: 10,
      },
      {
        text: "For the sambar, cook toor dal until soft, add tamarind water, vegetables and sambar powder, and simmer until the drumstick is tender.",
        timer: 20,
      },
      {
        text: "Temper mustard seeds and curry leaves in oil and pour over. Serve immediately — idlis harden as they cool.",
      },
    ],
    notes: [
      "Idli batter wants a slightly thicker grind than dosa batter, and it must not be over-salted before fermenting.",
      "Sambar should taste of tamarind first and spice second. Adjust the sour before the salt.",
    ],
    tips: [
      "Fenugreek in the urad dal helps both fermentation and softness.",
      "Leftover idlis are better fried in ghee with podi than reheated in a steamer.",
    ],
    substitutions: [
      { from: "Drumstick", to: "Pumpkin, carrot or okra" },
      {
        from: "Sambar powder",
        to: "Coriander, chilli and a little fenugreek, dry roasted and ground",
      },
    ],
    faqs: [
      {
        q: "Can I use dosa batter for idli?",
        a: "It works but the idlis will be flatter. Dosa batter is thinner and slightly more fermented.",
      },
    ],
    nutrition: [
      { label: "Calories", value: "410 kcal" },
      { label: "Protein", value: "16 g" },
      { label: "Carbs", value: "72 g" },
      { label: "Fat", value: "6 g" },
    ],
  },
  {
    slug: "aloo-paratha",
    title: "Aloo Paratha",
    blurb: "Soft wheat flatbread stuffed with spiced potato and cooked on a tawa with ghee.",
    intro:
      "The whole battle is keeping the filling in. Dry the potato properly, roll from the centre outwards, and stop pressing the moment you feel resistance.",
    image: alooParatha,
    creator: "viya-sheth",
    cuisine: "North Indian",
    category: "Breakfast",
    tags: ["Breads", "Comfort"],
    diet: ["Vegetarian"],
    minutes: 40,
    prep: 20,
    cook: 20,
    servings: 4,
    difficulty: "Easy",
    ingredients: [
      { qty: 300, unit: "g", name: "wholewheat flour" },
      { qty: 4, unit: "", name: "potatoes, boiled and cooled completely" },
      { qty: 1, unit: "", name: "green chilli, minced" },
      { qty: 1, unit: "tsp", name: "amchur" },
      { qty: 1, unit: "tsp", name: "roasted cumin powder" },
      { qty: 1, unit: "handful", name: "coriander, chopped" },
      { qty: 4, unit: "tbsp", name: "ghee" },
    ],
    steps: [
      {
        text: "Knead a soft dough with warm water and rest it 20 minutes. Stiff dough tears around the filling.",
        timer: 20,
      },
      {
        text: "Grate the cooled potatoes rather than mashing them, then mix with chilli, amchur, cumin, coriander and salt. Warm potato releases water and ruins the stuffing.",
      },
      {
        text: "Flatten a dough ball, place a generous mound of filling in the centre, gather the edges over the top and pinch closed. Flatten with your palm first, then roll gently.",
      },
      {
        text: "Cook on a hot tawa, one minute a side dry, then add ghee and press the edges with a cloth until brown spots appear all over.",
        timer: 4,
      },
    ],
    notes: [
      "Equal weight of dough and filling is the ratio to aim for once you are confident.",
      "Roll from the centre out and rotate the paratha rather than the pin.",
    ],
    tips: [
      "A paratha that leaks is still delicious. Scrape the tawa and carry on.",
      "Serve with plain curd, white butter and pickle — nothing else needed.",
    ],
    substitutions: [
      { from: "Potato", to: "Grated cauliflower, squeezed dry, or crumbled paneer" },
      { from: "Ghee", to: "Oil or butter, though ghee is what gives the smell" },
    ],
    faqs: [
      {
        q: "How do I stop the filling bursting out?",
        a: "Cool potatoes, no lumps, and roll with even, light pressure. Most bursts happen because one big chunk pushes through the dough.",
      },
    ],
    nutrition: [
      { label: "Calories", value: "390 kcal" },
      { label: "Protein", value: "9 g" },
      { label: "Carbs", value: "58 g" },
      { label: "Fat", value: "14 g" },
    ],
  },
  {
    slug: "laal-maas",
    title: "Laal Maas",
    blurb: "Rajasthani mutton cooked in a fierce Mathania chilli paste with garlic and ghee.",
    intro:
      "Laal maas is a hunter's dish: few ingredients, no vegetables, and heat used as a flavour rather than a dare. Soaking the chillies is what keeps it red instead of brutal.",
    image: laalMaas,
    creator: "viya-sheth",
    cuisine: "Rajasthani",
    category: "Main Course",
    tags: ["Slow cooked", "Spicy"],
    diet: ["Non-veg", "Gluten-free", "High protein"],
    minutes: 100,
    prep: 20,
    cook: 80,
    servings: 4,
    difficulty: "Advanced",
    ingredients: [
      { qty: 800, unit: "g", name: "mutton on the bone" },
      { qty: 15, unit: "", name: "dried Mathania or Kashmiri chillies, soaked" },
      { qty: 12, unit: "cloves", name: "garlic" },
      { qty: 150, unit: "g", name: "curd" },
      { qty: 80, unit: "g", name: "ghee" },
      { qty: 2, unit: "", name: "onions, sliced" },
      { qty: 2, unit: "tsp", name: "coriander powder" },
      { qty: 1, unit: "piece", name: "charcoal, for smoking" },
    ],
    steps: [
      {
        text: "Grind the soaked chillies with the garlic into a smooth, thick paste. Soaking for 30 minutes takes the harshness off without losing the colour.",
      },
      {
        text: "Brown the onions in ghee, add the mutton and sear on high until the pieces are coloured all over.",
        timer: 10,
      },
      {
        text: "Lower the heat, whisk the curd with the chilli paste and coriander powder, and add it slowly, stirring until the ghee separates.",
        timer: 12,
      },
      {
        text: "Add hot water, cover and cook on the lowest heat until the meat pulls from the bone.",
        timer: 60,
      },
      {
        text: "Smoke it: place a bowl inside the pot with a red-hot piece of charcoal, pour over a spoon of ghee, cover for 3 minutes and remove.",
        timer: 3,
      },
    ],
    notes: [
      "Mathania chillies are red and mild-hot; regular hot chilli powder gives a completely different, harsher dish.",
      "Ghee is not optional here. Oil cannot carry this much chilli.",
    ],
    tips: [
      "Whole garlic cloves left in the gravy sweeten and soften as it cooks.",
      "If it is too hot, a spoon of curd stirred in at the table is the traditional fix.",
    ],
    substitutions: [
      { from: "Mutton", to: "Lamb shoulder, reducing the braise by 15 minutes" },
      { from: "Mathania chillies", to: "Kashmiri chillies plus two hot dried chillies" },
    ],
    faqs: [
      {
        q: "Is the charcoal smoking necessary?",
        a: "Not technically, but it is the difference between a red mutton curry and laal maas.",
      },
    ],
    nutrition: [
      { label: "Calories", value: "610 kcal" },
      { label: "Protein", value: "45 g" },
      { label: "Carbs", value: "8 g" },
      { label: "Fat", value: "45 g" },
    ],
  },
  {
    slug: "rasmalai",
    title: "Rasmalai",
    blurb: "Fresh chhena discs simmered in syrup, then rested in reduced saffron milk.",
    intro:
      "Rasmalai is two separate exercises: making chhena that stays tender, and reducing milk far enough that it coats a spoon. Neither is difficult; both are unforgiving of impatience.",
    image: rasmalai,
    creator: "viya-sheth",
    cuisine: "Desserts",
    category: "Dessert",
    tags: ["Festive", "Sweet"],
    diet: ["Vegetarian", "Gluten-free"],
    minutes: 70,
    prep: 25,
    cook: 45,
    servings: 6,
    difficulty: "Advanced",
    ingredients: [
      { qty: 2, unit: "litres", name: "full-fat milk, for the chhena" },
      { qty: 3, unit: "tbsp", name: "lemon juice" },
      { qty: 200, unit: "g", name: "sugar" },
      { qty: 1, unit: "litre", name: "full-fat milk, for the rabri" },
      { qty: 1, unit: "pinch", name: "saffron" },
      { qty: 4, unit: "pods", name: "cardamom, crushed" },
      { qty: 2, unit: "tbsp", name: "pistachios, slivered" },
    ],
    steps: [
      {
        text: "Boil the 2 litres of milk, take it off the heat, wait a minute, then add lemon juice a spoon at a time until the whey runs clear and greenish.",
      },
      {
        text: "Strain through muslin, rinse under cold water to stop the acidity, and hang for 30 minutes. Too much water left in and the discs disintegrate; too little and they turn hard.",
        timer: 30,
      },
      {
        text: "Knead the chhena on a plate with the heel of your hand for 8 minutes until it is completely smooth and slightly greasy to touch. This is the whole recipe.",
        timer: 8,
      },
      {
        text: "Shape into flat discs, drop into boiling sugar syrup and cook covered for 12 minutes. They will swell to nearly double.",
        timer: 12,
      },
      {
        text: "Meanwhile reduce the other litre of milk by half with saffron and cardamom, stirring so it does not catch.",
        timer: 25,
      },
      {
        text: "Squeeze the discs gently, slide them into the warm rabri and chill for at least 4 hours before serving with pistachios.",
      },
    ],
    notes: [
      "Cow's milk sets a softer chhena than buffalo milk. Use the softest milk you can get.",
      "Add lemon juice off the boil. Boiling acid gives you rubbery paneer, not chhena.",
    ],
    tips: [
      "If a test disc breaks in the syrup, knead the batch another two minutes.",
      "The rabri thickens further in the fridge; keep it looser than looks right.",
    ],
    substitutions: [
      { from: "Lemon juice", to: "Vinegar, diluted 1:1 with water" },
      { from: "Saffron", to: "Rose water added off the heat" },
    ],
    faqs: [
      {
        q: "My discs collapsed in the syrup.",
        a: "The chhena had too much moisture or was under-kneaded. Hang it longer, then knead until it feels like soft dough.",
      },
    ],
    nutrition: [
      { label: "Calories", value: "320 kcal" },
      { label: "Protein", value: "12 g" },
      { label: "Carbs", value: "42 g" },
      { label: "Fat", value: "12 g" },
    ],
  },
  {
    slug: "masala-chai",
    title: "Masala Chai",
    blurb: "Strong tea boiled with ginger, cardamom and milk until the colour turns.",
    intro:
      "Good chai is a boiling schedule, not a recipe. The water and spices first, the tea next, the milk last — and each stage needs to actually boil.",
    image: masalaChai,
    creator: "viya-sheth",
    cuisine: "North Indian",
    category: "Drinks",
    tags: ["Quick", "Everyday"],
    diet: ["Vegetarian"],
    minutes: 10,
    prep: 3,
    cook: 7,
    servings: 2,
    difficulty: "Easy",
    ingredients: [
      { qty: 250, unit: "ml", name: "water" },
      { qty: 3, unit: "cm", name: "ginger, crushed" },
      { qty: 3, unit: "pods", name: "green cardamom, bruised" },
      { qty: 2, unit: "tsp", name: "strong CTC tea" },
      { qty: 250, unit: "ml", name: "full-fat milk" },
      { qty: 2, unit: "tsp", name: "sugar" },
    ],
    steps: [
      {
        text: "Boil the water with crushed ginger and cardamom for 3 minutes. Spices need water and time; they give nothing to milk.",
        timer: 3,
      },
      {
        text: "Add the tea and boil hard for 1 minute until the liquid turns deep mahogany.",
        timer: 1,
      },
      {
        text: "Pour in the milk and sugar and bring it to a rise three times, pulling the pan off each time it climbs. Those three rises are what makes chai taste boiled rather than steeped.",
        timer: 3,
      },
      { text: "Strain from a height into cups so it aerates on the way down." },
    ],
    notes: [
      "CTC tea, not leaf tea. Delicate leaves are wasted at this temperature.",
      "Adding spices with the milk is the most common mistake — the flavour never comes out.",
    ],
    tips: [
      "Crush ginger with the flat of a knife rather than grating; grated ginger clouds the chai.",
      "One clove is plenty for two cups. Two is a cough syrup.",
    ],
    substitutions: [
      { from: "Full-fat milk", to: "Oat milk, added off the boil so it does not split" },
      { from: "Sugar", to: "Jaggery, dissolved after the milk to avoid curdling" },
    ],
    faqs: [
      {
        q: "Why is my chai bitter?",
        a: "The tea boiled too long. One hard minute is enough before the milk goes in.",
      },
    ],
    nutrition: [
      { label: "Calories", value: "130 kcal" },
      { label: "Protein", value: "5 g" },
      { label: "Carbs", value: "16 g" },
      { label: "Fat", value: "5 g" },
    ],
  },
  {
    slug: "mango-lassi",
    title: "Mango Lassi",
    blurb: "Ripe alphonso blended with thick curd, cardamom and just enough ice.",
    intro:
      "A lassi should be drinkable, not a smoothie. Curd carries the mango; if you need sugar, the fruit was not ripe enough.",
    image: mangoLassi,
    creator: "viya-sheth",
    cuisine: "North Indian",
    category: "Drinks",
    tags: ["Quick", "Summer"],
    diet: ["Vegetarian", "Gluten-free"],
    minutes: 8,
    prep: 8,
    cook: 0,
    servings: 2,
    difficulty: "Easy",
    ingredients: [
      { qty: 2, unit: "", name: "ripe alphonso mangoes, chopped" },
      { qty: 250, unit: "g", name: "thick chilled curd" },
      { qty: 80, unit: "ml", name: "cold milk" },
      { qty: 1, unit: "pinch", name: "cardamom powder" },
      { qty: 1, unit: "tbsp", name: "pistachios, slivered" },
    ],
    steps: [
      {
        text: "Chill everything first. A room-temperature lassi needs ice, and ice waters it down.",
      },
      {
        text: "Blend mango, curd, milk and cardamom for 30 seconds only. Over-blending warms the curd and thins the texture.",
      },
      { text: "Taste before sweetening. Pour over ice and top with pistachios." },
    ],
    notes: [
      "Fibrous mangoes need straining. Alphonso and kesar do not.",
      "Thick curd, not drinking yoghurt — the body of the lassi comes from the dairy.",
    ],
    tips: [
      "A pinch of salt makes the mango taste more like itself.",
      "Frozen mango works well out of season.",
    ],
    substitutions: [
      { from: "Curd", to: "Greek yoghurt thinned with a little water" },
      { from: "Milk", to: "Coconut water, for a lighter drink" },
    ],
    faqs: [
      {
        q: "Can I make it ahead?",
        a: "A few hours in the fridge is fine. Whisk before serving; it separates slightly.",
      },
    ],
    nutrition: [
      { label: "Calories", value: "240 kcal" },
      { label: "Protein", value: "8 g" },
      { label: "Carbs", value: "34 g" },
      { label: "Fat", value: "8 g" },
    ],
  },
  {
    slug: "eggless-chocolate-cake",
    title: "Eggless Chocolate Cake",
    blurb: "A one-bowl bake leavened by vinegar and soda, damp-crumbed and deeply cocoa-forward.",
    intro:
      "Without eggs the structure comes from an acid–alkali reaction, which means the batter starts working the moment it is mixed. Have the tin greased and the oven hot before you begin.",
    image: chocolateCake,
    creator: "viya-sheth",
    cuisine: "Baking",
    category: "Dessert",
    tags: ["Baking", "Festive"],
    diet: ["Vegetarian", "Eggless"],
    minutes: 50,
    prep: 15,
    cook: 35,
    servings: 8,
    difficulty: "Easy",
    ingredients: [
      { qty: 200, unit: "g", name: "plain flour" },
      { qty: 45, unit: "g", name: "cocoa powder" },
      { qty: 200, unit: "g", name: "caster sugar" },
      { qty: 1, unit: "tsp", name: "baking soda" },
      { qty: 240, unit: "ml", name: "buttermilk or thinned curd" },
      { qty: 90, unit: "ml", name: "neutral oil" },
      { qty: 1, unit: "tbsp", name: "vinegar" },
      { qty: 1, unit: "tsp", name: "vanilla" },
      { qty: 120, unit: "ml", name: "hot coffee" },
    ],
    steps: [
      { text: "Heat the oven to 180°C and line the tin. Do this first; the batter will not wait." },
      { text: "Whisk the dry ingredients together thoroughly so the soda is evenly distributed." },
      {
        text: "Stir in buttermilk, oil and vanilla until just combined, then the vinegar, then the hot coffee last. The batter will look alarmingly thin — that is correct.",
      },
      {
        text: "Pour in and bake 32–35 minutes until a skewer comes out with a few damp crumbs, not clean.",
        timer: 34,
      },
      {
        text: "Cool in the tin for 10 minutes, then on a rack. It slices best the next day.",
        timer: 10,
      },
    ],
    notes: [
      "Hot coffee blooms the cocoa. You will not taste coffee; you will taste more chocolate.",
      "Do not open the oven in the first 20 minutes — an eggless crumb collapses easily.",
    ],
    tips: [
      "Weigh the flour. A heavy cup is the difference between damp and dry here.",
      "The cake keeps three days wrapped, and improves overnight.",
    ],
    substitutions: [
      { from: "Buttermilk", to: "Plant milk with a teaspoon of lemon juice, for a vegan cake" },
      { from: "Coffee", to: "Boiling water, with slightly less chocolate depth" },
    ],
    faqs: [
      {
        q: "Why did it sink in the middle?",
        a: "Under-baked or the oven door opened early. The reaction sets fast and falls faster.",
      },
    ],
    nutrition: [
      { label: "Calories", value: "340 kcal" },
      { label: "Protein", value: "5 g" },
      { label: "Carbs", value: "52 g" },
      { label: "Fat", value: "13 g" },
    ],
  },
  {
    slug: "herbed-tomato-pasta",
    title: "Slow Tomato & Herb Pasta",
    blurb: "A continental weeknight plate built on tomatoes cooked down for a full half hour.",
    intro:
      "This is the same principle as an Indian tomato base, on a different plate: cook the tomatoes until they stop tasting raw, and the sauce needs almost nothing else.",
    image: pastaImg,
    creator: "viya-sheth",
    cuisine: "Continental",
    category: "Main Course",
    tags: ["Quick", "Comfort"],
    diet: ["Vegetarian"],
    minutes: 40,
    prep: 10,
    cook: 30,
    servings: 4,
    difficulty: "Easy",
    ingredients: [
      { qty: 800, unit: "g", name: "ripe tomatoes, halved" },
      { qty: 6, unit: "cloves", name: "garlic, sliced" },
      { qty: 60, unit: "ml", name: "olive oil" },
      { qty: 400, unit: "g", name: "spaghetti" },
      { qty: 1, unit: "handful", name: "basil" },
      { qty: 1, unit: "tsp", name: "chilli flakes" },
      { qty: 40, unit: "g", name: "hard cheese, grated" },
    ],
    steps: [
      {
        text: "Cook the garlic gently in olive oil until it turns pale gold, no further — burnt garlic will define the whole sauce.",
        timer: 3,
      },
      {
        text: "Add the tomatoes cut side down with a good pinch of salt and cook on medium for 25 minutes, crushing them as they soften, until the sauce darkens and oil pools at the edge.",
        timer: 25,
      },
      {
        text: "Boil the pasta one minute short of the packet time and keep a mug of the water.",
        timer: 9,
      },
      {
        text: "Toss the pasta into the sauce with a splash of the cooking water and stir hard for a minute so the starch binds it. Finish with basil, chilli and cheese.",
      },
    ],
    notes: [
      "Tinned tomatoes work but need the same half hour. The clock does not shorten because the tin is open.",
      "Salt the pasta water properly; it is the only seasoning the pasta itself gets.",
    ],
    tips: [
      "A parmesan rind dropped in the sauce adds savour.",
      "Leftover sauce is excellent on toast with an egg.",
    ],
    substitutions: [
      { from: "Hard cheese", to: "Nutritional yeast, for a vegan plate" },
      { from: "Basil", to: "Coriander stems, if that is what is in the fridge" },
    ],
    faqs: [
      {
        q: "Should I peel the tomatoes?",
        a: "Not necessary if you crush and cook them long enough — the skins break down. Pass the sauce through a sieve if you want it silky.",
      },
    ],
    nutrition: [
      { label: "Calories", value: "540 kcal" },
      { label: "Protein", value: "16 g" },
      { label: "Carbs", value: "78 g" },
      { label: "Fat", value: "18 g" },
    ],
  },
  {
    slug: "kachumber-chaat-salad",
    title: "Kachumber Chaat Salad",
    blurb:
      "Cucumber, onion and tomato cut fine, dressed at the last second with lime and chaat masala.",
    intro:
      "Kachumber is only good for about ten minutes. Salt draws water out of cucumber fast, so cut everything ahead and dress it as it reaches the table.",
    image: saladImg,
    creator: "viya-sheth",
    cuisine: "North Indian",
    category: "Snacks",
    tags: ["Quick", "Fresh"],
    diet: ["Vegan", "Vegetarian", "Gluten-free"],
    minutes: 12,
    prep: 12,
    cook: 0,
    servings: 4,
    difficulty: "Easy",
    ingredients: [
      { qty: 2, unit: "", name: "cucumbers, finely diced" },
      { qty: 2, unit: "", name: "tomatoes, deseeded and diced" },
      { qty: 1, unit: "", name: "red onion, finely diced" },
      { qty: 1, unit: "", name: "green chilli, minced" },
      { qty: 1, unit: "tsp", name: "chaat masala" },
      { qty: 1, unit: "", name: "lime, juiced" },
      { qty: 1, unit: "handful", name: "coriander and mint" },
      { qty: 2, unit: "tbsp", name: "roasted peanuts, crushed" },
    ],
    steps: [
      {
        text: "Dice everything to the same small size — a kachumber should be eaten with a spoon.",
      },
      { text: "Deseed the tomatoes, otherwise the salad turns into a puddle within minutes." },
      {
        text: "Dress with lime, chaat masala and salt only when you are ready to serve, then scatter the peanuts on top.",
      },
    ],
    notes: [
      "Salt last. Salting early collapses the cucumber.",
      "Chaat masala already contains salt and black salt; taste before adding more.",
    ],
    tips: [
      "Cold cucumbers make a noticeably better salad.",
      "Roasted peanuts add the crunch this needs.",
    ],
    substitutions: [
      { from: "Peanuts", to: "Crushed papdi or sev, added right at the end" },
      { from: "Chaat masala", to: "Roasted cumin powder with a pinch of black salt" },
    ],
    faqs: [
      {
        q: "Can I make it in advance?",
        a: "Cut everything up to two hours ahead and keep it cold, but do not dress it until serving.",
      },
    ],
    nutrition: [
      { label: "Calories", value: "110 kcal" },
      { label: "Protein", value: "3 g" },
      { label: "Carbs", value: "12 g" },
      { label: "Fat", value: "5 g" },
    ],
  },
  {
    slug: "masala-omelette",
    title: "Masala Omelette",
    blurb: "Eggs beaten with onion, chilli and coriander, cooked hot and folded fast.",
    intro:
      "An Indian omelette is not a French one. It wants high heat, browned edges and enough onion that the inside stays juicy.",
    image: eggsImg,
    creator: "viya-sheth",
    cuisine: "North Indian",
    category: "Breakfast",
    tags: ["Quick", "High protein"],
    diet: ["Non-veg", "High protein", "Gluten-free"],
    minutes: 12,
    prep: 6,
    cook: 6,
    servings: 2,
    difficulty: "Easy",
    ingredients: [
      { qty: 4, unit: "", name: "eggs" },
      { qty: 1, unit: "", name: "onion, finely chopped" },
      { qty: 1, unit: "", name: "green chilli, minced" },
      { qty: 1, unit: "handful", name: "coriander, chopped" },
      { qty: 0.25, unit: "tsp", name: "turmeric" },
      { qty: 1, unit: "tbsp", name: "butter or ghee" },
    ],
    steps: [
      {
        text: "Beat the eggs with salt and turmeric for a full 30 seconds — properly beaten eggs cook more evenly and taste lighter.",
      },
      {
        text: "Fold in the onion, chilli and coriander at the last moment so they do not weep into the mixture.",
      },
      {
        text: "Get the pan hot, add butter, and pour in. Let the base set undisturbed for 40 seconds, then lift the edges and tilt so the raw egg runs underneath.",
        timer: 2,
      },
      {
        text: "Fold once and slide out while the centre is still soft; it carries on cooking on the plate.",
      },
    ],
    notes: [
      "Chopped onion should be fine, not chunky, or the omelette tears when you fold it.",
      "A pinch of besan in the egg makes it hold together in a heavier, dhaba-style omelette.",
    ],
    tips: [
      "Serve on buttered toast with green chutney.",
      "Cold butter added at the end keeps it glossy.",
    ],
    substitutions: [
      { from: "Butter", to: "Mustard oil, for a sharper street-stall flavour" },
      { from: "Coriander", to: "Spring onion greens" },
    ],
    faqs: [
      {
        q: "Why is my omelette watery?",
        a: "The onion sat in the beaten egg too long and released liquid. Mix it in just before cooking.",
      },
    ],
    nutrition: [
      { label: "Calories", value: "260 kcal" },
      { label: "Protein", value: "18 g" },
      { label: "Carbs", value: "5 g" },
      { label: "Fat", value: "19 g" },
    ],
  },
  {
    slug: "chana-chaat-bowl",
    title: "Chana Chaat Bowl",
    blurb: "Cold chickpeas with tamarind, mint chutney and enough acid to wake the whole bowl up.",
    intro:
      "Chaat is balance made visible: sour, sweet, hot, salt and crunch, all present at once. Get the tamarind and lime right and the rest falls into place.",
    image: bowlImg,
    creator: "viya-sheth",
    cuisine: "North Indian",
    category: "Snacks",
    tags: ["Street Food", "Quick", "High protein"],
    diet: ["Vegan", "Vegetarian", "High protein"],
    minutes: 20,
    prep: 20,
    cook: 0,
    servings: 2,
    difficulty: "Easy",
    ingredients: [
      { qty: 400, unit: "g", name: "cooked chickpeas, cooled" },
      { qty: 1, unit: "", name: "potato, boiled and cubed" },
      { qty: 1, unit: "", name: "onion, finely chopped" },
      { qty: 3, unit: "tbsp", name: "tamarind chutney" },
      { qty: 3, unit: "tbsp", name: "mint coriander chutney" },
      { qty: 1, unit: "tsp", name: "chaat masala" },
      { qty: 1, unit: "", name: "lime" },
      { qty: 1, unit: "handful", name: "sev" },
    ],
    steps: [
      { text: "Make sure the chickpeas and potato are properly cold. Warm chaat tastes muddy." },
      {
        text: "Toss chickpeas, potato and onion with both chutneys and the chaat masala, tasting as you go.",
      },
      {
        text: "Squeeze over the lime, check the sour-salt balance one last time, and top with sev just before eating so it stays crisp.",
      },
    ],
    notes: [
      "Sev goes on at the table. Thirty seconds early and it is already softening.",
      "Both chutneys are needed — one sweet-sour, one sharp and green. One alone is unbalanced.",
    ],
    tips: [
      "Pomegranate seeds add sweetness and stop it feeling heavy.",
      "Leftover chutneys freeze in ice cube trays.",
    ],
    substitutions: [
      { from: "Sev", to: "Crushed papdi or roasted peanuts" },
      { from: "Tamarind chutney", to: "Date syrup with a squeeze of lime" },
    ],
    faqs: [
      {
        q: "Can I use tinned chickpeas?",
        a: "Yes. Rinse them well and dry them; tinned brine dulls the chutneys.",
      },
    ],
    nutrition: [
      { label: "Calories", value: "360 kcal" },
      { label: "Protein", value: "14 g" },
      { label: "Carbs", value: "58 g" },
      { label: "Fat", value: "8 g" },
    ],
  },
  {
    slug: "atta-jaggery-cookies",
    title: "Atta & Jaggery Cookies",
    blurb: "Wholewheat cookies with ghee and jaggery, short and sandy rather than chewy.",
    intro:
      "Ghee behaves differently from butter: it has no water, so there is no steam and no chew. What you get instead is a cookie that crumbles cleanly, the way a nankhatai should.",
    image: bakingImg,
    creator: "viya-sheth",
    cuisine: "Baking",
    category: "Dessert",
    tags: ["Baking", "Everyday"],
    diet: ["Vegetarian", "Eggless"],
    minutes: 35,
    prep: 15,
    cook: 20,
    servings: 12,
    difficulty: "Easy",
    ingredients: [
      { qty: 200, unit: "g", name: "wholewheat flour" },
      { qty: 120, unit: "g", name: "ghee, soft but not melted" },
      { qty: 120, unit: "g", name: "jaggery powder" },
      { qty: 0.5, unit: "tsp", name: "cardamom powder" },
      { qty: 0.25, unit: "tsp", name: "baking soda" },
      { qty: 2, unit: "tbsp", name: "milk, if needed" },
    ],
    steps: [
      {
        text: "Beat the ghee and jaggery until pale and fluffy, a good 4 minutes. This is where the lightness comes from, since there is no egg.",
        timer: 4,
      },
      {
        text: "Fold in the flour, cardamom and soda until it just holds together. Add milk only if it refuses to come together.",
      },
      {
        text: "Rest the dough 15 minutes so the atta hydrates, then roll into balls and flatten slightly.",
        timer: 15,
      },
      {
        text: "Bake at 170°C for 16–18 minutes. They will still feel soft — they firm up completely as they cool.",
        timer: 17,
      },
    ],
    notes: [
      "Take them out looking underdone. Ghee cookies harden dramatically on the rack.",
      "Jaggery powder dissolves better than chopped blocks and keeps the texture even.",
    ],
    tips: [
      "Press a pistachio into each before baking.",
      "They keep two weeks in a tin and get sandier over time.",
    ],
    substitutions: [
      { from: "Jaggery", to: "Light brown sugar, for a slightly cleaner sweetness" },
      { from: "Ghee", to: "Softened butter, giving a chewier cookie" },
    ],
    faqs: [
      {
        q: "My dough is crumbly and will not roll.",
        a: "That is normal for atta and ghee. Press it firmly in your palm; add milk a teaspoon at a time only if it still refuses.",
      },
    ],
    nutrition: [
      { label: "Calories", value: "180 kcal" },
      { label: "Protein", value: "2 g" },
      { label: "Carbs", value: "22 g" },
      { label: "Fat", value: "10 g" },
    ],
  },
];

export const recipeBySlug = (slug: string) => recipes.find((r) => r.slug === slug);
export const recipesByCreator = (handle: string) => recipes.filter((r) => r.creator === handle);
export const featuredRecipe = recipes.find((r) => r.featured) ?? recipes[0]!;

export const popularSlugs = [
  "chicken-tikka",
  "hyderabadi-chicken-biryani",
  "butter-chicken",
  "paneer-butter-masala",
  "masala-dosa",
  "gulab-jamun",
];

export const popularRecipes = popularSlugs
  .map((s) => recipeBySlug(s))
  .filter((r): r is Recipe => Boolean(r));

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
    image: journalSpiceBox,
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
    image: journalDosaBatter,
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
    image: journalTomatoes,
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
    image: journalSpiceBox,
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
    image: journalSpiceBox,
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
export const cuisines = Array.from(new Set(recipes.map((r) => r.cuisine))).sort();

export const about = {
  headline: "Cooking is how we remember.",
  paragraphs: [
    "Spice N Flavors is a place for recipes that work, stories worth reading and food traditions worth passing on.",
    "We care about the details that turn a recipe from a list of ingredients into something you will actually want to cook again — the ratio that holds, the step that matters, the note you only learn the third time you make a dish.",
    "From everyday Indian cooking to dishes that deserve a little more time, every recipe is built around flavor, technique and the joy of sharing food.",
  ],
};
