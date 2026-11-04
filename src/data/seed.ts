import type { AllergenKey } from '../domain/allergens';
import type {
  Category,
  CatalogItem,
  Dish,
  DishTag,
  Drink,
  DrinkType,
  Guide,
  GuideTopic,
  Lang,
  RestaurantInfo,
  SpecValue,
} from '../domain/types';
import { RESTAURANT_NAME } from '../domain/types';
import { sourceHash } from '../domain/translation';
import type { WriteOp } from './repository';

// Optional sample content offered by the setup wizard, with hand-written translations.
// Producers are fictional examples, to be replaced by the restaurant's real references.

type Tr = Record<Lang, Record<string, string>>;

function withTr<T extends CatalogItem>(item: T, tr: Tr): T {
  return { ...item, tr: { ...tr, srcHash: sourceHash(item), status: 'ok', manual: false } };
}

const base = (id: string, order: number) => ({
  id,
  order,
  available: true,
  image: null,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  updatedBy: 'Dades d’exemple',
});

const categories: Category[] = [
  { id: 'cat-platets', name: 'Platets', color: 'blau', order: 0, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'cat-plats', name: 'Plats', color: 'verd', order: 1, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'cat-postres', name: 'Postres', color: 'rosa', order: 2, createdAt: Date.now(), updatedAt: Date.now() },
];

function dish(
  id: string,
  order: number,
  d: {
    name: string;
    categoryId: string;
    price: number;
    tags?: DishTag[];
    ingredients: string[];
    allergens: AllergenKey[];
    traces?: AllergenKey[];
    preparation: string;
    explanation: string;
    pairings?: string[];
  },
  tr: Tr,
): Dish {
  return withTr(
    {
      ...base(id, order),
      kind: 'dish',
      tags: [],
      traces: [],
      pairings: [],
      ...d,
    },
    tr,
  );
}

function drink(
  id: string,
  order: number,
  type: DrinkType,
  d: {
    name: string;
    producer: string;
    origin: string;
    abv: number | null;
    priceGlass?: number | null;
    priceBottle?: number | null;
    allergens?: AllergenKey[];
    servingTemp: string;
    tastingNotes: string;
    pairing: string;
    explanation: string;
    specs: Record<string, SpecValue>;
  },
  tr: Tr,
): Drink {
  return withTr(
    {
      ...base(id, order),
      kind: 'drink',
      type,
      priceGlass: null,
      priceBottle: null,
      allergens: [],
      traces: [],
      ...d,
    },
    tr,
  );
}

function guide(id: string, order: number, topic: GuideTopic, title: string, body: string, tr: Tr): Guide {
  return withTr({ ...base(id, order), kind: 'guide', topic, title, body }, tr);
}

const dishes: Dish[] = [
  dish(
    'dish-pa-tomaquet',
    0,
    {
      name: 'Pa amb tomàquet',
      categoryId: 'cat-platets',
      price: 3.5,
      tags: ['vegetaria', 'vega'],
      ingredients: ['Pa de pagès', 'Tomàquet de penjar', 'Oli d’oliva verge extra', 'Sal', 'All (opcional)'],
      allergens: ['gluten'],
      preparation: 'Torrar el pa, fregar-hi el tomàquet madur partit per la meitat, amanir amb oli i sal al moment.',
      explanation:
        'El clàssic de la cuina catalana: pa de pagès torrat, fregat amb tomàquet madur i amanit amb oli d’oliva i sal. És l’acompanyament ideal per a embotits i formatges.',
    },
    {
      es: {
        name: 'Pan con tomate',
        explanation:
          'El clásico de la cocina catalana: pan de payés tostado, frotado con tomate maduro y aliñado con aceite de oliva y sal. Es el acompañamiento ideal para embutidos y quesos.',
        ingredients: 'Pan de payés\nTomate de colgar\nAceite de oliva virgen extra\nSal\nAjo (opcional)',
      },
      en: {
        name: 'Bread with tomato',
        explanation:
          'The Catalan classic: toasted country bread rubbed with ripe tomato and dressed with olive oil and salt. The perfect companion for cured meats and cheese.',
        ingredients: 'Country bread\nHanging tomatoes\nExtra virgin olive oil\nSalt\nGarlic (optional)',
      },
      fr: {
        name: 'Pain à la tomate',
        explanation:
          'Le grand classique catalan : pain de campagne grillé, frotté de tomate mûre et assaisonné d’huile d’olive et de sel. L’accompagnement idéal de la charcuterie et des fromages.',
        ingredients: 'Pain de campagne\nTomates à suspendre\nHuile d’olive vierge extra\nSel\nAil (facultatif)',
      },
    },
  ),
  dish(
    'dish-escalivada',
    1,
    {
      name: 'Escalivada amb anxoves',
      categoryId: 'cat-platets',
      price: 9.5,
      tags: ['temporada'],
      ingredients: ['Albergínia', 'Pebrot vermell', 'Ceba', 'Anxoves de l’Escala', 'Oli d’oliva'],
      allergens: ['peix'],
      preparation:
        'Escalivar les verdures a la brasa, pelar-les, tallar-les a tires i servir amb les anxoves i un raig d’oli.',
      explanation:
        'Verdures (albergínia, pebrot i ceba) cuites lentament a la brasa, pelades i servides a tires amb anxoves de l’Escala. Un plat de tradició pagesa amb gust fumat.',
      pairings: ['drink-vi-blanc'],
    },
    {
      es: {
        name: 'Escalivada con anchoas',
        explanation:
          'Verduras (berenjena, pimiento y cebolla) asadas lentamente a la brasa, peladas y servidas en tiras con anchoas de L’Escala. Un plato de tradición campesina con sabor ahumado.',
        ingredients: 'Berenjena\nPimiento rojo\nCebolla\nAnchoas de L’Escala\nAceite de oliva',
      },
      en: {
        name: 'Escalivada with anchovies',
        explanation:
          'Aubergine, red pepper and onion slow-roasted over embers, peeled and served in strips with L’Escala anchovies. A traditional country dish with a smoky flavour.',
        ingredients: 'Aubergine\nRed pepper\nOnion\nL’Escala anchovies\nOlive oil',
      },
      fr: {
        name: 'Escalivada aux anchois',
        explanation:
          'Aubergine, poivron rouge et oignon rôtis lentement sur la braise, pelés et servis en lanières avec des anchois de L’Escala. Un plat paysan traditionnel au goût fumé.',
        ingredients: 'Aubergine\nPoivron rouge\nOignon\nAnchois de L’Escala\nHuile d’olive',
      },
    },
  ),
  dish(
    'dish-croquetes',
    2,
    {
      name: 'Croquetes de rostit',
      categoryId: 'cat-platets',
      price: 8,
      tags: ['recomanat'],
      ingredients: ['Carn de rostit (pollastre i porc)', 'Llet', 'Farina', 'Mantega', 'Ou', 'Pa ratllat'],
      allergens: ['gluten', 'llet', 'ous'],
      preparation: 'Beixamel espessa amb la carn del rostit picada, reposar en fred, arrebossar i fregir a 180 °C.',
      explanation:
        'Croquetes casolanes fetes amb la carn del rostit tradicional, cremoses per dins i cruixents per fora.',
    },
    {
      es: {
        name: 'Croquetas de asado',
        explanation:
          'Croquetas caseras hechas con la carne del asado tradicional, cremosas por dentro y crujientes por fuera.',
        ingredients: 'Carne de asado (pollo y cerdo)\nLeche\nHarina\nMantequilla\nHuevo\nPan rallado',
      },
      en: {
        name: 'Roast meat croquettes',
        explanation: 'Homemade croquettes made with traditional roast meat: creamy inside and crispy outside.',
        ingredients: 'Roast meat (chicken and pork)\nMilk\nFlour\nButter\nEgg\nBreadcrumbs',
      },
      fr: {
        name: 'Croquettes de rôti',
        explanation:
          'Croquettes maison préparées avec la viande du rôti traditionnel, crémeuses à l’intérieur et croustillantes à l’extérieur.',
        ingredients: 'Viande rôtie (poulet et porc)\nLait\nFarine\nBeurre\nŒuf\nChapelure',
      },
    },
  ),
  dish(
    'dish-arros-negre',
    0,
    {
      name: 'Arròs negre',
      categoryId: 'cat-plats',
      price: 18.5,
      ingredients: ['Arròs', 'Sípia', 'Tinta de sípia', 'Fumet de peix', 'Sofregit', 'Allioli'],
      allergens: ['molluscs', 'peix', 'ous', 'crustacis'],
      preparation:
        'Sofregit amb la sípia, afegir l’arròs i la tinta, mullar amb fumet calent; 18 minuts. Servir amb allioli.',
      explanation:
        'Arròs mariner cuinat amb sípia i la seva tinta, que li dona el color negre i un gust intens de mar. S’acompanya d’allioli.',
      pairings: ['drink-vi-blanc'],
    },
    {
      es: {
        name: 'Arroz negro',
        explanation:
          'Arroz marinero cocinado con sepia y su tinta, que le da el color negro y un intenso sabor a mar. Se acompaña de alioli.',
        ingredients: 'Arroz\nSepia\nTinta de sepia\nFumet de pescado\nSofrito\nAlioli',
      },
      en: {
        name: 'Black rice',
        explanation:
          'Seafood rice cooked with cuttlefish and its ink, which gives it its black colour and an intense taste of the sea. Served with allioli (garlic mayonnaise).',
        ingredients: 'Rice\nCuttlefish\nCuttlefish ink\nFish stock\nSofrito\nAllioli',
      },
      fr: {
        name: 'Riz noir',
        explanation:
          'Riz de la mer cuisiné avec de la seiche et son encre, qui lui donne sa couleur noire et un goût intense de la mer. Servi avec de l’aïoli.',
        ingredients: 'Riz\nSeiche\nEncre de seiche\nFumet de poisson\nSofrito\nAïoli',
      },
    },
  ),
  dish(
    'dish-botifarra',
    1,
    {
      name: 'Botifarra amb mongetes',
      categoryId: 'cat-plats',
      price: 14,
      tags: ['senseGluten'],
      ingredients: ['Botifarra de porc', 'Mongetes del ganxet', 'All', 'Julivert', 'Oli d’oliva'],
      allergens: [],
      traces: ['sulfits'],
      preparation: 'Botifarra a la brasa; mongetes saltades amb all i julivert.',
      explanation:
        'Botifarra catalana feta a la brasa i acompanyada de mongetes saltades amb all i julivert. Un plat senzill i molt tradicional.',
      pairings: ['drink-vi-negre'],
    },
    {
      es: {
        name: 'Butifarra con judías',
        explanation:
          'Butifarra catalana a la brasa acompañada de judías salteadas con ajo y perejil. Un plato sencillo y muy tradicional.',
        ingredients: 'Butifarra de cerdo\nJudías del ganxet\nAjo\nPerejil\nAceite de oliva',
      },
      en: {
        name: 'Botifarra sausage with white beans',
        explanation:
          'Grilled Catalan pork sausage served with white beans sautéed with garlic and parsley. A simple, very traditional dish.',
        ingredients: 'Pork botifarra sausage\nGanxet white beans\nGarlic\nParsley\nOlive oil',
      },
      fr: {
        name: 'Botifarra aux haricots blancs',
        explanation:
          'Saucisse catalane grillée, servie avec des haricots blancs sautés à l’ail et au persil. Un plat simple et très traditionnel.',
        ingredients: 'Saucisse de porc botifarra\nHaricots ganxet\nAil\nPersil\nHuile d’olive',
      },
    },
  ),
  dish(
    'dish-crema-catalana',
    0,
    {
      name: 'Crema catalana',
      categoryId: 'cat-postres',
      price: 6,
      tags: ['vegetaria'],
      ingredients: ['Llet', 'Rovells d’ou', 'Sucre', 'Midó de blat de moro', 'Pell de llimona', 'Canyella'],
      allergens: ['llet', 'ous'],
      preparation:
        'Infusionar la llet amb llimona i canyella, lligar amb rovells i midó, refredar; cremar el sucre al moment.',
      explanation:
        'Crema de llet perfumada amb llimona i canyella, coberta amb una capa de sucre cremat cruixent. Les postres catalanes per excel·lència.',
    },
    {
      es: {
        name: 'Crema catalana',
        explanation:
          'Crema de leche perfumada con limón y canela, cubierta con una capa de azúcar quemado crujiente. El postre catalán por excelencia.',
        ingredients: 'Leche\nYemas de huevo\nAzúcar\nAlmidón de maíz\nPiel de limón\nCanela',
      },
      en: {
        name: 'Crema catalana',
        explanation:
          'Custard flavoured with lemon and cinnamon, topped with a crunchy layer of caramelised sugar. The quintessential Catalan dessert.',
        ingredients: 'Milk\nEgg yolks\nSugar\nCornflour\nLemon peel\nCinnamon',
      },
      fr: {
        name: 'Crème catalane',
        explanation:
          'Crème parfumée au citron et à la cannelle, recouverte d’une fine couche de sucre caramélisé croustillante. Le dessert catalan par excellence.',
        ingredients: 'Lait\nJaunes d’œufs\nSucre\nFécule de maïs\nZeste de citron\nCannelle',
      },
    },
  ),
];

const drinks: Drink[] = [
  drink(
    'drink-vi-negre',
    0,
    'vi',
    {
      name: 'Negre de l’Empordà (exemple)',
      producer: 'Celler d’exemple',
      origin: 'D.O. Empordà',
      abv: 14,
      priceGlass: 4.5,
      priceBottle: 22,
      allergens: ['sulfits'],
      servingTemp: '16–18 °C',
      tastingNotes: 'Fruita vermella madura, notes torrades i espècies. Boca amable amb tanins suaus.',
      pairing: 'Carns a la brasa, botifarra, formatges curats.',
      explanation:
        'Vi negre de l’Empordà, la zona vinícola del nord de Girona, fet amb garnatxa i carinyena. Afruitat, amb un toc de fusta i fàcil de beure.',
      specs: {
        estil: 'Negre',
        varietats: ['Garnatxa', 'Carinyena'],
        anyada: 2021,
        crianca: '10 mesos en bóta de roure',
        elaboracio: 'Ecològic',
      },
    },
    {
      es: {
        explanation:
          'Vino tinto del Empordà, la zona vinícola del norte de Girona, elaborado con garnacha y cariñena. Afrutado, con un toque de madera y fácil de beber.',
      },
      en: {
        explanation:
          'Red wine from the Empordà, the wine region in the north of the Girona province, made from Grenache and Carignan. Fruity, with a hint of oak and easy to drink.',
      },
      fr: {
        explanation:
          'Vin rouge de l’Empordà, la région viticole du nord de Gérone, élaboré à partir de grenache et de carignan. Fruité, avec une touche boisée et facile à boire.',
      },
    },
  ),
  drink(
    'drink-vi-blanc',
    1,
    'vi',
    {
      name: 'Blanc de garnatxa blanca (exemple)',
      producer: 'Celler d’exemple',
      origin: 'D.O. Empordà',
      abv: 13,
      priceGlass: 4,
      priceBottle: 19,
      allergens: ['sulfits'],
      servingTemp: '8–10 °C',
      tastingNotes: 'Fruita blanca, flors i un final salí. Fresc i amb bona acidesa.',
      pairing: 'Arrossos, peix, verdures a la brasa.',
      explanation:
        'Vi blanc fresc de garnatxa blanca, amb aromes de fruita blanca i un record de mar. Molt bo amb arrossos i peix.',
      specs: {
        estil: 'Blanc',
        varietats: ['Garnatxa blanca'],
        anyada: 2023,
        crianca: 'Jove, sense criança',
        elaboracio: 'Convencional',
      },
    },
    {
      es: {
        explanation:
          'Vino blanco fresco de garnacha blanca, con aromas de fruta blanca y un recuerdo de mar. Muy bueno con arroces y pescado.',
      },
      en: {
        explanation:
          'Fresh white wine made from white Grenache, with aromas of white fruit and a hint of the sea. Excellent with rice dishes and fish.',
      },
      fr: {
        explanation:
          'Vin blanc frais de grenache blanc, aux arômes de fruits blancs avec une note marine. Parfait avec les riz et le poisson.',
      },
    },
  ),
  drink(
    'drink-cava',
    2,
    'vi',
    {
      name: 'Escumós brut nature (exemple)',
      producer: 'Celler d’exemple',
      origin: 'Penedès',
      abv: 11.5,
      priceGlass: 5,
      priceBottle: 24,
      allergens: ['sulfits'],
      servingTemp: '6–8 °C',
      tastingNotes: 'Bombolla fina, notes de brioix i poma verda. Sec i elegant.',
      pairing: 'Aperitiu, entrants, postres no gaire dolces.',
      explanation:
        'Vi escumós elaborat pel mètode tradicional, amb la segona fermentació a l’ampolla. Sec, amb bombolla fina i molt refrescant.',
      specs: {
        estil: 'Escumós',
        varietats: ['Macabeu', 'Xarel·lo', 'Parellada'],
        crianca: '18 mesos en rima',
        elaboracio: 'Convencional',
      },
    },
    {
      es: {
        explanation:
          'Vino espumoso elaborado por el método tradicional, con la segunda fermentación en botella. Seco, con burbuja fina y muy refrescante.',
      },
      en: {
        explanation:
          'Sparkling wine made by the traditional method, with the second fermentation in the bottle. Dry, with fine bubbles and very refreshing.',
      },
      fr: {
        explanation:
          'Vin effervescent élaboré selon la méthode traditionnelle, avec seconde fermentation en bouteille. Sec, à bulles fines et très rafraîchissant.',
      },
    },
  ),
  drink(
    'drink-ipa',
    0,
    'cervesa',
    {
      name: 'IPA artesana (exemple)',
      producer: 'Cerveseria d’exemple',
      origin: 'Girona',
      abv: 6.2,
      priceBottle: 4.5,
      allergens: ['gluten'],
      servingTemp: '6–8 °C',
      tastingNotes: 'Cítrics i fruita tropical, amargor marcada i final sec.',
      pairing: 'Croquetes, plats especiats, formatges forts.',
      explanation:
        'Cervesa artesana d’estil IPA, molt aromàtica gràcies al llúpol: notes de cítrics i fruita tropical i una amargor agradable.',
      specs: { estil: 'IPA', format: 'Ampolla', ibu: 55, artesana: true },
    },
    {
      es: {
        explanation:
          'Cerveza artesana de estilo IPA, muy aromática gracias al lúpulo: notas cítricas y de fruta tropical y un amargor agradable.',
      },
      en: {
        explanation:
          'Craft IPA-style beer, very aromatic thanks to the hops: citrus and tropical fruit notes with a pleasant bitterness.',
      },
      fr: {
        explanation:
          'Bière artisanale de style IPA, très aromatique grâce au houblon : notes d’agrumes et de fruits tropicaux, avec une amertume agréable.',
      },
    },
  ),
  drink(
    'drink-lager',
    1,
    'cervesa',
    {
      name: 'Lager de barril (exemple)',
      producer: 'Cerveseria d’exemple',
      origin: 'Catalunya',
      abv: 5,
      priceGlass: 3,
      allergens: ['gluten'],
      servingTemp: '4–6 °C',
      tastingNotes: 'Cereal, lleugerament amarga i molt refrescant.',
      pairing: 'Tapes, fregits, aperitiu.',
      explanation: 'Cervesa rossa de barril, lleugera i refrescant. La més demanada per acompanyar l’aperitiu.',
      specs: { estil: 'Lager', format: 'Barril', ibu: 20, artesana: false },
    },
    {
      es: { explanation: 'Cerveza rubia de barril, ligera y refrescante. La más pedida para acompañar el aperitivo.' },
      en: { explanation: 'Light, refreshing draught lager. The most popular choice with appetisers.' },
      fr: { explanation: 'Bière blonde pression, légère et rafraîchissante. La plus demandée pour l’apéritif.' },
    },
  ),
  drink(
    'drink-ratafia',
    0,
    'licor',
    {
      name: 'Ratafia (exemple)',
      producer: 'Destil·leria d’exemple',
      origin: 'Girona',
      abv: 25,
      priceGlass: 4,
      servingTemp: 'Fresca o amb gel',
      tastingNotes: 'Nou verda, herbes aromàtiques i espècies; dolça i amb final amarg.',
      pairing: 'Sobretaula, postres de xocolata.',
      explanation:
        'Licor tradicional de les comarques gironines fet amb nous verdes i herbes aromàtiques macerades en alcohol. Es pren com a digestiu després dels àpats.',
      specs: {
        categoria: 'Ratafia',
        envelliment: 'Repòs de mínim 1 any',
        servei: 'Sola, en got petit, fresca o amb un glaçó.',
      },
    },
    {
      es: {
        explanation:
          'Licor tradicional de las comarcas de Girona elaborado con nueces verdes y hierbas aromáticas maceradas en alcohol. Se toma como digestivo después de las comidas.',
      },
      en: {
        explanation:
          'Traditional liqueur from the Girona area made with green walnuts and aromatic herbs macerated in alcohol. Enjoyed as a digestif after meals.',
      },
      fr: {
        explanation:
          'Liqueur traditionnelle de la région de Gérone, préparée avec des noix vertes et des herbes aromatiques macérées dans l’alcool. Se boit en digestif après le repas.',
      },
    },
  ),
];

const guides: Guide[] = [
  guide(
    'guide-fires',
    0,
    'girona',
    'Les Fires de Girona',
    'Les Fires de Sant Narcís són la festa major de Girona i se celebren a finals d’octubre, al voltant del 29, dia de Sant Narcís, patró de la ciutat. Durant uns deu dies hi ha concerts, atraccions, sardanes, castells, gegants i parades per tota la ciutat.\n\nDiu la llegenda que, durant un setge, del sepulcre de Sant Narcís en van sortir mosques que van fer fugir l’exèrcit enemic. Per això la mosca és un dels símbols de Girona.',
    {
      es: {
        title: 'Las Ferias de Girona',
        body: 'Las Ferias de Sant Narcís son la fiesta mayor de Girona y se celebran a finales de octubre, alrededor del día 29, festividad de San Narciso, patrón de la ciudad. Durante unos diez días hay conciertos, atracciones, sardanas, castells, gigantes y puestos por toda la ciudad.\n\nCuenta la leyenda que, durante un asedio, del sepulcro de San Narciso salieron moscas que hicieron huir al ejército enemigo. Por eso la mosca es uno de los símbolos de Girona.',
      },
      en: {
        title: 'The Girona Fair (Fires de Girona)',
        body: 'The Fires de Sant Narcís are Girona’s main festival, held at the end of October around the 29th, the feast day of Saint Narcissus, the city’s patron saint. For about ten days there are concerts, funfair rides, sardana dancing, human towers (castells), giant figures and stalls all over the city.\n\nLegend has it that during a siege, flies came out of Saint Narcissus’s tomb and drove the enemy army away. That is why the fly is one of the symbols of Girona.',
      },
      fr: {
        title: 'Les Foires de Gérone',
        body: 'Les Foires de Sant Narcís sont la grande fête de Gérone. Elles ont lieu fin octobre, autour du 29, jour de la Saint-Narcisse, saint patron de la ville. Pendant une dizaine de jours, il y a des concerts, des manèges, des sardanes, des tours humaines (castells), des géants et des stands dans toute la ville.\n\nLa légende raconte que, pendant un siège, des mouches sortirent du tombeau de saint Narcisse et firent fuir l’armée ennemie. C’est pourquoi la mouche est l’un des symboles de Gérone.',
      },
    },
  ),
  guide(
    'guide-temps-flors',
    1,
    'girona',
    'Temps de Flors',
    'Temps de Flors és una exposició de flors que omple Girona cada mes de maig. Durant uns deu dies, patis, monuments, carrers i racons del Barri Vell es decoren amb instal·lacions florals, i molts espais normalment tancats obren les portes al públic.\n\nConsell: és molt concorregut, val la pena anar-hi d’hora al matí.',
    {
      es: {
        title: 'Temps de Flors',
        body: 'Temps de Flors es una exposición de flores que llena Girona cada mes de mayo. Durante unos diez días, patios, monumentos, calles y rincones del Barrio Antiguo se decoran con instalaciones florales, y muchos espacios normalmente cerrados abren sus puertas al público.\n\nConsejo: hay mucha gente; vale la pena ir temprano por la mañana.',
      },
      en: {
        title: 'Temps de Flors (Flower Festival)',
        body: 'Temps de Flors is a flower show that fills Girona every May. For about ten days, courtyards, monuments, streets and corners of the Old Quarter are decorated with floral installations, and many places that are usually closed open their doors to the public.\n\nTip: it gets very busy, so it is worth going early in the morning.',
      },
      fr: {
        title: 'Temps de Flors (Festival des fleurs)',
        body: 'Temps de Flors est une exposition florale qui envahit Gérone chaque année en mai. Pendant une dizaine de jours, cours intérieures, monuments, rues et recoins de la vieille ville sont décorés d’installations florales, et de nombreux lieux habituellement fermés ouvrent leurs portes au public.\n\nConseil : il y a beaucoup de monde, mieux vaut y aller tôt le matin.',
      },
    },
  ),
  guide(
    'guide-lleona',
    2,
    'cultura',
    'El cul de la lleona',
    'Al peu de les escales de Sant Feliu hi ha una columna amb una lleona de pedra que s’abraça a la columna. La tradició diu que qui li fa un petó al cul i la toca esdevé un bon gironí i tornarà a Girona.',
    {
      es: {
        title: 'El culo de la leona',
        body: 'Al pie de las escaleras de Sant Feliu hay una columna con una leona de piedra abrazada a ella. La tradición dice que quien le da un beso en el trasero y la toca se convierte en un buen gerundense y volverá a Girona.',
      },
      en: {
        title: 'The lioness’s bottom',
        body: 'At the foot of the Sant Feliu steps there is a column with a stone lioness hugging it. Tradition says that whoever kisses her bottom and touches her becomes a true Gironan and will come back to Girona.',
      },
      fr: {
        title: 'Les fesses de la lionne',
        body: 'Au pied des escaliers de Sant Feliu se trouve une colonne avec une lionne de pierre qui l’enlace. La tradition veut que celui qui lui embrasse les fesses et la touche devienne un vrai Géronais et revienne à Gérone.',
      },
    },
  ),
];

function info(): RestaurantInfo {
  return {
    name: RESTAURANT_NAME,
    tagline: 'Repositori pel treballador',
    address: '',
    phone: '',
    email: '',
    web: '',
    instagram: '',
    hours: 'Dimarts a diumenge: 13:00–16:00 i 20:00–23:00\nDilluns: tancat',
    wifiSsid: '',
    wifiPassword: '',
    history: '',
    sections: [
      {
        title: 'Normes de la casa',
        body: 'Informeu sempre de les al·lèrgies a cuina abans de passar la comanda.\nEls plats es poden adaptar segons disponibilitat.',
      },
    ],
    updatedAt: Date.now(),
  };
}

/** Write operations that load the sample content (restaurant info is merged, not replaced). */
export function sampleDataOps(currentInfo: RestaurantInfo | null): WriteOp[] {
  const sample = info();
  const mergedInfo: RestaurantInfo = currentInfo
    ? {
        ...sample,
        ...Object.fromEntries(
          Object.entries(currentInfo).filter(([, v]) => v !== '' && !(Array.isArray(v) && !v.length)),
        ),
      }
    : sample;
  return [
    ...categories.map((c): WriteOp => ({ type: 'set', path: `categories/${c.id}`, data: c })),
    ...dishes.map((d): WriteOp => ({ type: 'set', path: `dishes/${d.id}`, data: d })),
    ...drinks.map((d): WriteOp => ({ type: 'set', path: `drinks/${d.id}`, data: d })),
    ...guides.map((g): WriteOp => ({ type: 'set', path: `guides/${g.id}`, data: g })),
    { type: 'set', path: 'info/restaurant', data: mergedInfo },
  ];
}
