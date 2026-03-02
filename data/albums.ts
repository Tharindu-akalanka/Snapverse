export interface Image {
    id: string;
    src: string;
    alt: string;
    width: number;
    height: number;
}

export interface Album {
    slug: string;
    title: string;
    category: "Wedding" | "Pre-shoot" | "Birthday" | "Events" | "Commercial" | "Engagement" | "Graduation";
    location: string;
    year: string;
    coverImage: string;
    description: string;
    images: Image[];
}

const BASE = "/Images/Soucre images";

function imgs(folder: string, files: string[]): Image[] {
    return files.map((f, i) => ({
        id: String(i + 1),
        src: `${BASE}/${folder}/${f}`,
        alt: `${folder} - photo ${i + 1}`,
        width: 1200,
        height: 800,
    }));
}

export const albums: Album[] = [
    // ── FEATURED (f1–f6 — appear first on homepage) ──────────────────────────

    // f1
    {
        slug: "akarshana-birthday",
        title: "Akarshana's Birthday",
        category: "Birthday",
        location: "Sri Lanka",
        year: "2022",
        coverImage: `${BASE}/Birthday/f1 Akarshana/cover.webp`,
        description: "A colourful and celebratory birthday shoot for Akarshana, full of joy and energy.",
        images: imgs("Birthday/f1 Akarshana", [
            "3.webp", "4.webp", "5.webp", "6.webp", "7.webp",
            "8.webp", "9.webp", "10.webp", "11.webp", "12.webp", "13.webp", "14.webp",
            "15.webp", "16.webp", "17.webp", "18.webp", "19.webp", "20.webp", "21.webp", "22.webp", "23.webp",
        ]),
    },

    // f2
    {
        slug: "rashmi-birthday-22",
        title: "Rashmi's Birthday '22",
        category: "Birthday",
        location: "Sri Lanka",
        year: "2022",
        coverImage: `${BASE}/Birthday/f2 Rashmi 22/Cover.webp`,
        description: "Stunning birthday portraits for Rashmi capturing her personality and elegance.",
        images: imgs("Birthday/f2 Rashmi 22", [
            "1.webp", "3.webp", "4.webp", "5.webp", "6.webp", "7.webp",
            "8.webp", "9.webp", "10.webp", "11.webp", "12.webp", "13.webp", "14.webp", "15.webp",
        ]),
    },

    // f3
    {
        slug: "dimali-graduation",
        title: "Dimali's Graduation",
        category: "Graduation",
        location: "Sri Lanka",
        year: "2024",
        coverImage: `${BASE}/Graduation/f3 Dimali/cover.webp`,
        description: "Elegant graduation portraits for Dimali to mark this milestone occasion.",
        images: imgs("Graduation/f3 Dimali", [
            "DSC02518.webp", "DSC02519.webp", "DSC02522.webp",
            "DSC02523.webp", "DSC02528.webp", "DSC02544.webp", "DSC02545.webp",
            "DSC02560.webp", "DSC02583.webp", "DSC02590.webp", "DSC02592.webp", "DSC02602.webp",
        ]),
    },

    // f4 — (no folder renamed f4; using Rangana & Nayani Wedding as the 4th featured)
    {
        slug: "rangana-nayani-wedding",
        title: "Rangana & Nayani — Wedding Day",
        category: "Wedding",
        location: "Sri Lanka",
        year: "2025",
        coverImage: `${BASE}/Wedding/Rangana & Nayani/cover.webp`,
        description: "A beautiful and intimate wedding celebration capturing the love story of Rangana and Nayani.",
        images: imgs("Wedding/Rangana & Nayani", [
            "482321000_679008344697261_131808972194621210_n.webp",
            "483929610_679008338030595_7352651231288826891_n.webp",
            "484111405_679008654697230_3850656394505350127_n.webp",
            "484311763_679008354697260_908124958019103410_n.webp",
            "484374949_679008364697259_2988104790913301269_n.webp",
            "484433974_679008764697219_7531098119656406307_n.webp",
            "484447763_679009498030479_2040141707798720228_n.webp",
            "484460122_679008351363927_4557150232602146897_n.webp",
            "484587425_679008341363928_8194401949388021078_n.webp",
            "484790984_679008741363888_8735104689121156612_n.webp",
            "484793438_679008758030553_1312463059380814814_n.webp",
            "Untitled-1.webp",
        ]),
    },

    // f5
    {
        slug: "sagies-campu-ams-agm",
        title: "Sagies Campu AMS AGM",
        category: "Events",
        location: "Sri Lanka",
        year: "2024",
        coverImage: `${BASE}/Event/f5 Sagies Campu AMS AGM/cover.jpg`,
        description: "Professional event coverage of the Sagies Campu AMS Annual General Meeting.",
        images: imgs("Event/f5 Sagies Campu AMS AGM", [
            "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg", "7.jpg",
            "IMG_8940.jpg", "IMG_8965.jpg", "IMG_8970.jpg", "IMG_9030.jpg", "IMG_9062.jpg", "IMG_9092.jpg", "IMG_9097.jpg", "IMG_9102.jpg",
            "IMG_9110.jpg", "IMG_9133.jpg", "IMG_9158.jpg", "IMG_9160.jpg",
            "IMG_9173.jpg", "IMG_9178.jpg", "IMG_9180.jpg", "IMG_9189.jpg",
            "IMG_9204.jpg", "IMG_9208.jpg", "IMG_9210.jpg", "IMG_9213.jpg",
            "IMG_9218.jpg", "IMG_9219.jpg", "IMG_9227.jpg", "IMG_9230.jpg", "IMG_9235.jpg", "IMG_9258.jpg", "IMG_9285.jpg", "IMG_9286.jpg",
            "IMG_9293.jpg", "IMG_9309.jpg",
        ]),
    },

    // f6
    {
        slug: "dulmi-birthday-22",
        title: "Dulmi's Birthday '22",
        category: "Birthday",
        location: "Sri Lanka",
        year: "2022",
        coverImage: `${BASE}/Birthday/f6 Dulmi 22/cover.webp`,
        description: "Beautiful birthday portraits celebrating Dulmi's special day.",
        images: imgs("Birthday/f6 Dulmi 22", [
            "1.webp", "2.webp", "4.webp", "4 (2).webp",
            "11 (2).webp", "12.webp", "13.webp", "16.webp", "17.webp", "19.webp",
        ]),
    },

    // ── REMAINING PORTFOLIO ─────────────────────────────────────────────────

    // ── ENGAGEMENT ───────────────────────────────────────────────────────────
    {
        slug: "kaveesha-sandani-engagement",
        title: "Kaveesha & Sandani's Engagement",
        category: "Engagement",
        location: "Sri Lanka",
        year: "2025",
        coverImage: `${BASE}/Engagement/Kaveesha & Sandani/cover.webp`,
        description: "A joyful engagement session filled with love, laughter, and beautiful moments.",
        images: imgs("Engagement/Kaveesha & Sandani", [
            "482070160_677522081512554_6035617528123900604_n.webp",
            "482070723_677522054845890_2217751846142173280_n.webp",
            "482086833_677522061512556_4129434418737044553_n.webp",
            "482222105_677522138179215_909524530729318710_n.webp",
            "482223105_677522168179212_5267630945711048196_n.webp",
            "482223193_677522111512551_4347321601230003315_n.webp",
            "482228050_677521838179245_5170783730686918065_n.webp",
            "482228146_677522141512548_4740536162223396292_n.webp",
            "482239825_677522064845889_7626317857638046457_n.webp",
            "482250220_677522051512557_868051041788114874_n.webp",
        ]),
    },
    {
        slug: "lahiri-imalsha-engagement",
        title: "Lahiri & Imalsha's Engagement",
        category: "Engagement",
        location: "Sri Lanka",
        year: "2025",
        coverImage: `${BASE}/Engagement/Lahiri & Imalsha/cover.webp`,
        description: "Romantic engagement portraits capturing the tender moments between Lahiri and Imalsha.",
        images: imgs("Engagement/Lahiri & Imalsha", [
            "472389947_629304132992329_8868384915962861494_n.webp",
            "472391060_629304422992300_6662840184501692989_n.webp",
            "472480838_629304426325633_5933695409068568469_n.webp",
            "472570448_629304226325653_7515037510817478496_n.webp",
            "472571576_629304282992314_8291524921790146234_n.webp",
            "472880794_629304229658986_7412105604246354341_n.webp",
            "480568618_662752496322846_832368475933769125_n.webp",
            "480802210_662752486322847_5080719256568206562_n.webp",
            "480848445_662752742989488_1616244319714076159_n.webp",
            "480965370_662752752989487_1202111148956597802_n.webp",
            "481152334_662752489656180_7156316482861265439_n.webp",
        ]),
    },
    {
        slug: "rangana-nayani-engagement",
        title: "Rangana & Nayani's Engagement",
        category: "Engagement",
        location: "Sri Lanka",
        year: "2025",
        coverImage: `${BASE}/Engagement/Rangana & Nayani/cover.webp`,
        description: "Elegant engagement portraits celebrating the love of Rangana and Nayani.",
        images: imgs("Engagement/Rangana & Nayani", [
            "482057382_677508974847198_5569763753670594404_n.webp",
            "482083104_677509001513862_2089495571908001255_n.webp",
            "482216967_677509011513861_2930979035018257909_n.webp",
            "482218596_677509018180527_2599314724946263040_n.webp",
            "482221914_677508984847197_4910762785971315315_n.webp",
            "482222095_677509008180528_8522745648535834653_n.webp",
            "482229486_677508971513865_941645367037654834_n.webp",
            "482240451_677509014847194_461482966095847133_n.webp",
            "482242103_677509051513857_5469130090895714129_n.webp",
            "482242732_677509078180521_1171321058399453927_n.webp",
        ]),
    },


    // ── PRE-SHOOT ────────────────────────────────────────────────────────────
    {
        slug: "nipuna-subhashi-preshoot-1",
        title: "Nipuna & Subhashi — Pre-Shoot Session 1",
        category: "Pre-shoot",
        location: "Sri Lanka",
        year: "2025",
        coverImage: `${BASE}/Preeshoot/Nipuna & Subhashi session 1/cover.webp`,
        description: "First pre-wedding session for Nipuna and Subhashi, capturing their chemistry in stunning outdoor settings.",
        images: imgs("Preeshoot/Nipuna & Subhashi session 1", [
            "Untitle1d-1.webp",
            "Untitle3d-1.webp",
            "Untitled-1.webp",
            "Untitled0-2.webp",
            "_MG_3735.webp",
            "_MG_3739.webp",
            "_MG_3747.webp",
            "_MG_3749.webp",
            "_MG_3754.webp",
            "_MG_3760.webp",
            "_MG_3866 (1).webp",
            "_MG_3872 (1).webp",
            "_MG_3881 (1).webp",
            "_MG_39472.webp",
        ]),
    },
    {
        slug: "nipuna-subhashi-preshoot-2",
        title: "Nipuna & Subhashi — Pre-Shoot Session 2",
        category: "Pre-shoot",
        location: "Sri Lanka",
        year: "2025",
        coverImage: `${BASE}/Preeshoot/Nipuna & Subhashi session 2/cover.webp`,
        description: "A dreamy second pre-wedding session with golden hour magic.",
        images: imgs("Preeshoot/Nipuna & Subhashi session 2", [
            "482959468_678299374768158_4289101471547341233_n.webp",
            "482960101_678299314768164_4343058606420232354_n.webp",
            "482960839_678299388101490_1640007719951859121_n.webp",
            "482980922_678299371434825_3522758289479345118_n.webp",
            "482981085_678299418101487_3089285809266939903_n.webp",
            "482985093_678299328101496_2683374990518896806_n.webp",
            "482986751_678299448101484_250881028137398583_n.webp",
            "482987487_678299364768159_8850776931711702587_n.webp",
            "482988352_678299081434854_3679962293817069946_n.webp",
            "483660372_678299461434816_7502162895183914340_n.webp",
            "484066106_678299064768189_1191977757927396765_n.webp",
            "484289480_678299331434829_7836765942789303897_n.webp",
        ]),
    },

    // ── EVENTS ────────────────────────────────────────────────────────────────
    {
        slug: "uruma-kerum-concert-2023",
        title: "URUMA KERUM Live In Concert 2023",
        category: "Events",
        location: "Sri Lanka",
        year: "2023",
        coverImage: `${BASE}/Event/URUMA KERUM Live In Concert 2023/cover.webp`,
        description: "Dynamic coverage of the URUMA KERUM Live In Concert 2023.",
        images: imgs("Event/URUMA KERUM Live In Concert 2023", [
            "480741923_665507186047377_2478003723963674044_n.webp",
            "480981474_665506902714072_5133772762429469275_n.webp",
            "480983077_665506792714083_3558975508730267059_n.webp",
            "481028889_665506772714085_5678169406406401370_n.webp",
            "481174534_665506906047405_355983550935699137_n.webp",
            "481289307_665506929380736_4197914312780741099_n.webp",
        ]),
    },
    {
        slug: "urumabhisheka-2024",
        title: "Urumabhisheka 2024",
        category: "Events",
        location: "Sri Lanka",
        year: "2024",
        coverImage: `${BASE}/Event/Urumabhisheka 2024/cover.webp`,
        description: "Commemorating the Urumabhisheka 2024 ceremony with comprehensive event photography.",
        images: imgs("Event/Urumabhisheka 2024", [
            "482959841_678294754768620_1867895583792817923_n.webp",
            "482980132_678295108101918_3543808792802826913_n.webp",
            "482984438_678294731435289_7678561367327460412_n.webp",
            "482985089_678295018101927_1129829997154488271_n.webp",
            "482985544_678295014768594_3234451415078612158_n.webp",
            "483795044_678294764768619_6742337003877655200_n.webp",
            "484065263_678294951435267_7722202641560652184_n.webp",
            "484067927_678295068101922_7098748575534827412_n.webp",
            "484471706_678295104768585_5591917452214119960_n.webp",
        ]),
    },
    {
        slug: "urumaya-2022",
        title: "උරුමය රංගායතන වෙස් මංගල්‍යය 2022",
        category: "Events",
        location: "Sri Lanka",
        year: "2022",
        coverImage: `${BASE}/Event/උරුමය රංගායතන වෙස් මංගල්‍යය 2022/cover.webp`,
        description: "Vibrant coverage of the traditional cultural event — Urumaya Rangayana 2022.",
        images: imgs("Event/උරුමය රංගායතන වෙස් මංගල්‍යය 2022", [
            "475509089_645979464658129_4410160973952125586_n.webp",
            "475528065_645979394658136_8449253785784629373_n.webp",
            "475530266_645979311324811_4618246502765023606_n.webp",
            "475534757_645979407991468_6282111938088564734_n.webp",
            "475643681_645979221324820_9094118975382914774_n.webp",
            "475648540_645979347991474_5350606519633991104_n.webp",
            "475651834_645979234658152_7293293252039758489_n.webp",
            "475714791_645979351324807_1321219780198222979_n.webp",
            "475761972_645979284658147_4100693736083900587_n.webp",
            "475811734_645979241324818_6068196569286026869_n.webp",
            "475841352_645979471324795_4271529601357766956_n.webp",
            "475897221_645979271324815_6887592883325009961_n.webp",
            "475921495_645979411324801_90639437670403199_n.webp",
        ]),
    },

    // ── COMMERCIAL ───────────────────────────────────────────────────────────
    {
        slug: "monacar-international",
        title: "Monacar International",
        category: "Commercial",
        location: "Sri Lanka",
        year: "2024",
        coverImage: `${BASE}/Commercial/Monacar International/cover.webp`,
        description: "Professional commercial photography for Monacar International, showcasing their brand with elegance.",
        images: imgs("Commercial/Monacar International", [
            "DSC09703.webp",
            "DSC09741.webp",
            "DSC09745.webp",
            "DSC09746.webp",
            "DSC09748.webp",
            "DSC09778.webp",
            "DSC09782.webp",
            "DSC09783.webp",
        ]),
    },

    // ── BIRTHDAY (remaining) ──────────────────────────────────────────────────
    {
        slug: "olu-birthday",
        title: "Olu's Birthday",
        category: "Birthday",
        location: "Sri Lanka",
        year: "2023",
        coverImage: `${BASE}/Birthday/Olu/cover.webp`,
        description: "An elegant birthday portrait session for Olu, filled with warmth and radiance.",
        images: imgs("Birthday/Olu", [
            "1.webp", "3.webp", "4.webp", "5.webp", "6.webp", "7.webp",
            "8.webp", "9.webp", "10.webp", "11.webp", "12.webp", "13.webp", "14.webp",
            "15.webp", "16.webp", "17.webp", "18.webp", "19.webp", "20.webp",
        ]),
    },

    // ── GRADUATION (remaining) ────────────────────────────────────────────────
    {
        slug: "chameenu-graduation",
        title: "Chameenu's Graduation",
        category: "Graduation",
        location: "Sri Lanka",
        year: "2024",
        coverImage: `${BASE}/Graduation/Chameenu/cover.webp`,
        description: "Memorable graduation portraits celebrating Chameenu's academic achievement.",
        images: imgs("Graduation/Chameenu", [
            "IMG_9114.webp", "IMG_9123.webp", "IMG_9145.webp",
            "IMG_9153.webp", "IMG_9157.webp", "IMG_9160.webp", "IMG_9249.webp",
            "IMG_9261.webp", "IMG_9zz239.webp", "Untitled-1.webp",
        ]),
    },
    {
        slug: "hansi-graduation",
        title: "Hansi's Graduation",
        category: "Graduation",
        location: "Sri Lanka",
        year: "2024",
        coverImage: `${BASE}/Graduation/Hansi/cover.webp`,
        description: "A joyful graduation shoot for Hansi — celebrating a new chapter.",
        images: imgs("Graduation/Hansi", [
            "2.webp", "3.webp", "4.webp", "5.webp", "6.webp", "7.webp",
            "8.webp", "9.webp", "10.webp", "11-2.webp", "12.webp", "13.webp",
            "DSC01266.webp", "Untitled-1.webp",
        ]),
    },
];
