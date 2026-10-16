import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const SPECIES_SEED_DATA = [
  {
    commonName: 'Monarch Butterfly',
    scientificName: 'Danaus plexippus',
    family: 'Nymphalidae',
    description: 'An iconic migratory butterfly renowned for its bright orange wings laced with black veins and white margin spots. Famous for multi-generational transcontinental migrations across North America.',
    habitat: 'Meadows, prairies, agricultural borders, and milkweed patches.',
    diet: 'Adults feed on floral nectar; caterpillars feed exclusively on milkweed (Asclepias spp.).',
    lifecycle: 'Complete metamorphosis: egg, 5 caterpillar instars, chrysalis, adult. Exhibits seasonal reproductive diapause.',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
    conservationStatus: 'Endangered (IUCN)'
  },
  {
    commonName: 'Western Honeybee',
    scientificName: 'Apis mellifera',
    family: 'Apidae',
    description: 'A eusocial pollinator vital to global ecosystems and agriculture. Lives in complex perennial colonies governed by a queen, female workers, and male drones.',
    habitat: 'Temperate forests, orchards, grasslands, and managed apiaries.',
    diet: 'Nectar and pollen processed into honey and royal jelly within hexagonal wax combs.',
    lifecycle: 'Egg, larva, pupa, adult. Caste determination driven by larval diet and royal jelly feeding duration.',
    imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80',
    conservationStatus: 'Data Deficient'
  },
  {
    commonName: 'Seven-Spotted Ladybug',
    scientificName: 'Coccinella septempunctata',
    family: 'Coccinellidae',
    description: 'A beneficial predatory beetle featuring bold scarlet wing covers punctuated by seven black spots. Widely utilized as an organic biological control agent against crop aphids.',
    habitat: 'Gardens, meadows, deciduous woodlands, and agricultural fields.',
    diet: 'Voracious predator of aphids, whiteflies, scale insects, and mites.',
    lifecycle: 'Eggs laid on aphid-infested leaves hatch into alligator-shaped larvae before pupating on foliage.',
    imageUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80',
    conservationStatus: 'Least Concern'
  },
  {
    commonName: 'European Praying Mantis',
    scientificName: 'Mantis religiosa',
    family: 'Mantidae',
    description: 'A master of camouflage and ambush predation, equipped with spiked raptorial forelegs and a highly mobile triangular head capable of turning 180 degrees.',
    habitat: 'Tall grass prairies, sunny meadows, forest edges, and shrubland.',
    diet: 'Carnivorous diet consisting of crickets, flies, moths, caterpillars, and occasionally small vertebrates.',
    lifecycle: 'Incomplete metamorphosis: overwintering as egg ootheca, followed by nymph stages and winged adult.',
    imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80',
    conservationStatus: 'Least Concern'
  },
  {
    commonName: 'Common Green Darner',
    scientificName: 'Anax junius',
    family: 'Aeshnidae',
    description: 'One of North America’s largest and fastest dragonflies, recognizable by a brilliant green thorax and sky-blue abdomen in mature males. Capable of remarkable autumn migrations.',
    habitat: 'Ponds, slow-moving streams, marshes, and freshwater wetlands.',
    diet: 'Aerial interceptor feeding on mosquitoes, midges, bees, butterflies, and small dragonflies.',
    lifecycle: 'Hemimetabolous: Aquatic nymph lives as a fierce underwater predator before emerging as an aerial adult.',
    imageUrl: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=600&q=80',
    conservationStatus: 'Least Concern'
  },
  {
    commonName: 'Common Eastern Firefly',
    scientificName: 'Photinus pyralis',
    family: 'Lampyridae',
    description: 'A nocturnal bioluminescent beetle known as the big dipper firefly. Males produce characteristic J-shaped upward flash patterns at dusk to attract females.',
    habitat: 'Moist lawns, forest edges, floodplains, and wetland meadows.',
    diet: 'Adults rarely feed; predatory larvae feed underground on snails, slugs, and subterranean earthworms.',
    lifecycle: 'Eggs, predatory glow-worm larvae (overwintering in soil), subterranean pupae, and short-lived adults.',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    conservationStatus: 'Least Concern'
  },
  {
    commonName: 'Atlas Moth',
    scientificName: 'Attacus atlas',
    family: 'Saturniidae',
    description: 'One of the largest Lepidopterans on Earth by wing surface area. Features striking rusty-brown wings with triangular translucent fenestrae and snake-like wingtip markings.',
    habitat: 'Tropical and subtropical rainforests across Southeast Asia.',
    diet: 'Adults lack functional mouthparts and do not feed; caterpillars consume cinnamon and citrus leaves.',
    lifecycle: 'Large spiky caterpillar spins an extensive brownish silk cocoon before emerging for 1-2 weeks of adult life.',
    imageUrl: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?auto=format&fit=crop&w=600&q=80',
    conservationStatus: 'Not Evaluated'
  },
  {
    commonName: 'Blue Morpho Butterfly',
    scientificName: 'Morpho peleides',
    family: 'Nymphalidae',
    description: 'Famed for the iridescent cobalt-blue sheen of its upper wings, caused by microscopic structural scales that diffract light. The undersides bear cryptically patterned brown eyespots.',
    habitat: 'Neotropical rainforest understory and sunlit forest gaps.',
    diet: 'Adults sip fermenting tree sap, rotting fruit, and mud minerals; larvae feed on legume leaves.',
    lifecycle: 'Egg, reddish-brown tufted caterpillar, smooth green pupa, and fluttering canopy adult.',
    imageUrl: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=600&q=80',
    conservationStatus: 'Least Concern'
  },
  {
    commonName: 'Hercules Beetle',
    scientificName: 'Dynastes hercules',
    family: 'Scarabaeidae',
    description: 'A massive rhinoceros beetle exhibiting extreme sexual dimorphism. Males boast enormous thoracic and cephalic horns used in sparring contests over mates.',
    habitat: 'Rainforests and cloud forests of Central and South America.',
    diet: 'Adults feed on ripe fallen fruit; grubs feed on decomposing heartwood of rotting logs.',
    lifecycle: 'Larval stage lasts up to two years reaching sizes up to 140 grams before pupation.',
    imageUrl: 'https://images.unsplash.com/photo-1579202673506-ca3ce28943ef?auto=format&fit=crop&w=600&q=80',
    conservationStatus: 'Least Concern'
  },
  {
    commonName: 'Periodical Cicada',
    scientificName: 'Magicicada septendecim',
    family: 'Cicadidae',
    description: 'Notable for its synchronized mass emergence every 17 years. Features jet-black bodies, vivid red eyes, and orange wing veins, filling forests with deafening choruses.',
    habitat: 'Eastern deciduous forests and mature suburban woodlots.',
    diet: 'Nymphs feed on xylem fluids from subterranean tree roots; adults feed sparingly on plant sap.',
    lifecycle: '17 underground nymphal instars culminating in synchronized mass climb, molt, reproduction, and death.',
    imageUrl: 'https://images.unsplash.com/photo-1598188306155-25e400eb5078?auto=format&fit=crop&w=600&q=80',
    conservationStatus: 'Least Concern'
  },
  {
    commonName: 'Luna Moth',
    scientificName: 'Actias luna',
    family: 'Saturniidae',
    description: 'An ethereal pale green silk moth bearing elongated trailing hindwing tails and distinct pinkish margins. Adults are active only after midnight and do not feed.',
    habitat: 'Deciduous hardwood forests containing birch, walnut, hickory, and sweetgum.',
    diet: 'Adults live on stored caterpillar lipids; larvae feed on broadleaf hardwood foliage.',
    lifecycle: 'Single or double brooded depending on latitude; pupates in leaf-wrapped silk cocoons on the forest floor.',
    imageUrl: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=600&q=80',
    conservationStatus: 'Least Concern'
  },
  {
    commonName: 'Common Blue Damselfly',
    scientificName: 'Enallagma cyathigerum',
    family: 'Coenagrionidae',
    description: 'A slender, delicate zygopteran with electric blue and black banding along its narrow abdomen. Unlike dragonflies, folds its wings parallel to its body at rest.',
    habitat: 'Lakes, ponds, canals, and slow rivers with abundant emergent vegetation.',
    diet: 'Nymphs eat daphnia, mosquito larvae; adults catch gnats, midges, and small flying insects.',
    lifecycle: 'Female oviposits underwater into submerged plants; aquatic nymphs emerge in late spring.',
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
    conservationStatus: 'Least Concern'
  },
  {
    commonName: 'Emerald Ash Borer',
    scientificName: 'Agrilus planipennis',
    family: 'Buprestidae',
    description: 'An invasive jewel beetle with metallic emerald-green elytra. Larval feeding galleries disrupt ash tree vascular transport, causing widespread canopy dieback.',
    habitat: 'Native to East Asia; invasive across North American ash forests (Fraxinus spp.).',
    diet: 'Larvae consume inner bark phloem and cambium; adults feed harmlessly on ash foliage.',
    lifecycle: 'Females lay eggs in bark crevices; larvae chew serpentine S-shaped galleries before overwintering.',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    conservationStatus: 'Critically Endangered (native range)'
  },
  {
    commonName: 'Black Carpenter Ant',
    scientificName: 'Camponotus pennsylvanicus',
    family: 'Formicidae',
    description: 'A large, matte-black wood-nesting ant. Does not consume wood but hollows out damp timber to create satellite galleries for queen rearing and brood care.',
    habitat: 'Dead logs, stumps, hollow trees, and structural timber with moisture damage.',
    diet: 'Omnivorous: collects honeydew from aphids, feeds on plant juices, dead insects, and kitchen sugars.',
    lifecycle: 'Winged reproductive alates swarm in spring; newly mated queen establishes colony founding chamber.',
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
    conservationStatus: 'Least Concern'
  },
  {
    commonName: 'Yellowjacket Wasp',
    scientificName: 'Vespula vulgaris',
    family: 'Vespidae',
    description: 'A social predatory wasp identified by vivid yellow and black abdominal banding. Known for building enclosed paper nests in subterranean cavities or sheltered eaves.',
    habitat: 'Woodlands, meadows, pastures, and human-modified urban gardens.',
    diet: 'Hunts caterpillars, flies, and beetle grubs for larvae; adults consume nectar and ripe fruits.',
    lifecycle: 'Mated queens overwinter underground; solitary queens initiate annual paper combs each spring.',
    imageUrl: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=600&q=80',
    conservationStatus: 'Least Concern'
  },
  {
    commonName: 'Giant Water Bug',
    scientificName: 'Lethocerus americanus',
    family: 'Belostomatidae',
    description: 'Also known as the "toe-biter", this formidable aquatic hemipteran captures prey using raptorial front legs and injects digestive enzymes through a piercing beak.',
    habitat: 'Freshwater marshes, weed-choked ponds, irrigation ditches, and slow streams.',
    diet: 'Ambush predator of tadpoles, minnows, frogs, snails, and aquatic invertebrates.',
    lifecycle: 'Females glue clutches of eggs to emergent reeds; nymphs undergo 5 aquatic molts.',
    imageUrl: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=600&q=80',
    conservationStatus: 'Least Concern'
  },
  {
    commonName: 'Common Field Grasshopper',
    scientificName: 'Chorthippus brunneus',
    family: 'Acrididae',
    description: 'An agile, ground-dwelling herbivorous insect with enlarged hind legs adapted for jumping. Males produce short clicking stridulation songs by rubbing legs against wing veins.',
    habitat: 'Dry grasslands, railway verges, heathlands, and sunny sand dunes.',
    diet: 'Strictly herbivorous, feeding on a wide variety of grasses, fescues, and herbaceous plants.',
    lifecycle: 'Overwinters as subterranean egg pods; nymphs emerge in spring and mature through five instars.',
    imageUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80',
    conservationStatus: 'Least Concern'
  },
  {
    commonName: 'True Katydid',
    scientificName: 'Pterophylla camellifolia',
    family: 'Tettigoniidae',
    description: 'A nocturnal arboreal bush cricket with leaf-like broad green wings that mimic deciduous tree foliage. Produces the loud, repetitive "Katy-did, Katy-didn\'t" mating song.',
    habitat: 'Deciduous forest canopies, especially oak, hickory, and maple trees.',
    diet: 'Chews the leaves of broadleaf deciduous trees; rarely causes structural damage.',
    lifecycle: 'Eggs inserted into crevices of tree bark; nymphs climb into canopy to feed until autumn frost.',
    imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80',
    conservationStatus: 'Least Concern'
  },
  {
    commonName: 'Painted Lady Butterfly',
    scientificName: 'Vanessa cardui',
    family: 'Nymphalidae',
    description: 'The most widespread butterfly species globally, found on every continent except Antarctica and South America. Known for irruptive migrations across continents and deserts.',
    habitat: 'Open country, thistle fields, dunes, alpine meadows, and road verges.',
    diet: 'Larvae feed on over 300 plant species including thistles, mallows, and legumes; adults feed on nectar.',
    lifecycle: 'Continuous breeding along migratory routes; caterpillars construct loose silken tents on leaf surfaces.',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
    conservationStatus: 'Least Concern'
  },
  {
    commonName: 'European Stag Beetle',
    scientificName: 'Lucanus cervus',
    family: 'Lucanidae',
    description: 'Europe\'s largest terrestrial beetle. Males possess majestic antler-like jaws used to grapple rivals during twilight courtship battles on oak boughs.',
    habitat: 'Old-growth broadleaf woodlands, parks, hedgerows, and oak pastures with decaying wood.',
    diet: 'Adults drink tree sap and fallen fruit juice; larvae feed for 3-6 years on rotting oak stumps.',
    lifecycle: 'Protracted subterranean larval phase in dead wood, followed by pupation in earthen cocoon cells.',
    imageUrl: 'https://images.unsplash.com/photo-1579202673506-ca3ce28943ef?auto=format&fit=crop&w=600&q=80',
    conservationStatus: 'Near Threatened'
  },
  {
    commonName: 'Buff-Tailed Bumblebee',
    scientificName: 'Bombus terrestris',
    family: 'Apidae',
    description: 'A stout, cold-tolerant bumblebee with black and yellow bands and a distinctive buff or dirty-white tail tip. Key pollinator of greenhouse tomatoes and early spring wildflowers.',
    habitat: 'Gardens, farmland hedges, coastal dunes, and woodland glades.',
    diet: 'Nectar and pollen harvested through buzz pollination (sonication) from deep floral tubes.',
    lifecycle: 'Annual colony cycle founded by a solitary fertilized queen nesting in abandoned rodent burrows.',
    imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80',
    conservationStatus: 'Least Concern'
  },
  {
    commonName: 'Zebra Longwing Butterfly',
    scientificName: 'Heliconius charithonia',
    family: 'Nymphalidae',
    description: 'The official state butterfly of Florida, characterized by elongated velvety-black wings adorned with bold yellow stripes. Roosts communally in groups under large leaves at night.',
    habitat: 'Tropical hammocks, forest margins, citrus groves, and botanical gardens.',
    diet: 'One of the few butterflies that digests pollen as well as nectar, extending its lifespan to 6+ months.',
    lifecycle: 'Caterpillars feed on passionflower vines (Passiflora), sequestering toxic glycosides for chemical defense.',
    imageUrl: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=600&q=80',
    conservationStatus: 'Least Concern'
  },
  {
    commonName: 'House Cricket',
    scientificName: 'Acheta domesticus',
    family: 'Gryllidae',
    description: 'A light yellowish-brown cricket with three dark transverse bands on its head. Known for its pleasant melodic evening chirps produced by stridulating wing tegmina.',
    habitat: 'Pastures, compost heaps, refuse sites, and warm crevices inside buildings.',
    diet: 'Omnivorous scavenger: grains, seedlings, decaying vegetable matter, and small organic debris.',
    lifecycle: 'Gradual metamorphosis: females use long ovipositor to bury clutches of eggs in damp substrate.',
    imageUrl: 'https://images.unsplash.com/photo-1598188306155-25e400eb5078?auto=format&fit=crop&w=600&q=80',
    conservationStatus: 'Least Concern'
  },
  {
    commonName: 'Common Water Strider',
    scientificName: 'Gerris lacustris',
    family: 'Gerridae',
    description: 'An aquatic bug that walks effortlessly on the water surface film using hydrophobic micro-hair leg pads that distribute body weight and exploit surface tension.',
    habitat: 'Calm surfaces of ponds, lake bays, marsh pools, and slow-moving streams.',
    diet: 'Scavenger and predator that detects ripples made by terrestrial insects trapped on the water surface.',
    lifecycle: 'Eggs laid under floating leaves; nymphs develop through five wingless instars before flight maturation.',
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
    conservationStatus: 'Least Concern'
  },
  {
    commonName: 'Robber Fly',
    scientificName: 'Efferia aestuans',
    family: 'Asilidae',
    description: 'An aggressive aerial predator featuring large bulging compound eyes, a bearded face (mystax), and strong bristly legs designed to grasp flying prey mid-air.',
    habitat: 'Sunny open fields, sandy clearings, garden fences, and shrub borders.',
    diet: 'Ambush hunter that immobilizes flies, beetles, dragonflies, and wasps with paralyzing saliva.',
    lifecycle: 'Females deposit eggs in soil or plant stems; subterranean larvae prey on soil-dwelling beetle larvae.',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    conservationStatus: 'Least Concern'
  },
  {
    commonName: 'Eastern Tiger Swallowtail',
    scientificName: 'Papilio glaucus',
    family: 'Papilionidae',
    description: 'A large, majestic swallowtail with bright yellow wings framed by black tiger stripes. Females occur in both yellow and dark, Batesian mimetic black morphs.',
    habitat: 'Deciduous woodlands, river valleys, forest clearings, orchards, and gardens.',
    diet: 'Adults drink nectar from milkweed, phlox, and lilac; caterpillars feed on magnolia and tulip tree leaves.',
    lifecycle: 'Larvae mimic bird droppings when young, developing prominent false eyespots on the thorax before pupating.',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
    conservationStatus: 'Least Concern'
  },
  {
    commonName: 'Red-Tailed Bumblebee',
    scientificName: 'Bombus lapidarius',
    family: 'Apidae',
    description: 'A striking European bumblebee with a velvety jet-black thorax and abdomen ending in an intense crimson-orange tail. An active pollinator in temperate agricultural valleys.',
    habitat: 'Farmland margins, open meadows, urban gardens, and coastal grasslands.',
    diet: 'Collects nectar and pollen primarily from bird\'s-foot trefoil, clovers, knapweed, and thistles.',
    lifecycle: 'Fertilized queen awakens in early spring, establishing an underground nest of 100-300 workers.',
    imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80',
    conservationStatus: 'Least Concern'
  },
  {
    commonName: 'Giant Leopard Moth',
    scientificName: 'Hypercompe scribonia',
    family: 'Erebidae',
    description: 'A spectacular nocturnal tiger moth featuring snowy-white forewings patterned with iridescent hollow black rings and blue-black thoracic spots.',
    habitat: 'Woodlands, damp fields, meadows, and suburban gardens.',
    diet: 'Adults do not feed; the "woolly bear" caterpillar feeds on honeysuckle, dandelions, and cherries.',
    lifecycle: 'Dense black bristly caterpillar exhibits bright red bands when curled defensively, pupating in silk leaf litter.',
    imageUrl: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?auto=format&fit=crop&w=600&q=80',
    conservationStatus: 'Least Concern'
  },
  {
    commonName: 'Common Green Lacewing',
    scientificName: 'Chrysoperla carnea',
    family: 'Chrysopidae',
    description: 'A delicate insect with pale green bodies, golden eyes, and gossamer-fine transparent wings. Its predatory larvae are nicknamed "aphid lions".',
    habitat: 'Agricultural fields, orchards, parks, and deciduous woodland canopies.',
    diet: 'Adults feed on pollen and honeydew; larvae consume aphids, thrips, and spider mites.',
    lifecycle: 'Females lay eggs on individual silken stalks to prevent sibling cannibalism upon hatching.',
    imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80',
    conservationStatus: 'Least Concern'
  },
  {
    commonName: 'Golden Tortoise Beetle',
    scientificName: 'Charidotella sexpunctata',
    family: 'Chrysomelidae',
    description: 'A small leaf beetle capable of altering its dorsal carapace color from brilliant mirrored metallic gold to reddish-bronze with black spots by manipulating fluid beneath its cuticle.',
    habitat: 'Roadside ditches, forest edges, and gardens with morning glories and bindweeds.',
    diet: 'Exclusively consumes foliage of Convolvulaceae (sweet potato, morning glory, bindweed).',
    lifecycle: 'Larvae carry a shield of cast skins and fecal matter above their backs for defense against ants.',
    imageUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80',
    conservationStatus: 'Least Concern'
  }
];

export async function main() {
  console.log('[Seed] Starting species taxonomy seeding...');

  let createdCount = 0;
  for (const species of SPECIES_SEED_DATA) {
    await prisma.species.upsert({
      where: { id: createdCount + 1 },
      update: species,
      create: species,
    });
    createdCount++;
  }

  console.log(`[Seed] Successfully seeded ${createdCount} insect species.`);
}

if (require.main === module) {
  main()
    .catch((e) => {
      console.error('[Seed Error]:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
