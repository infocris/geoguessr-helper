var groups = [
  {
    name: "Nord",
    complementary: true,
    isos: "ar,au,bo,br,bw,cl,ec,id,ls,nz,pe,sz,uy,za"
    /*
    isos:
      "ad,al,ae,at,bd,be,bg,bt,ca,co,cz,de,dk,ee,es,fi,fr,gb," +
      "gh,gr,gt,hr,hu,ie,is,il,in,it,jo,jp,kg,kh,kr,lk,lt,lu,lv," +
      "me,mk,mn,mt,mx,my,nl,no,ph,pl,pt,ro,rs,ru,se,sg,si,sn,sk,th,tn,tr,ua,us"
      */
  },
  {
    name: "Equator.",
    isos: "br,co,ec,gh,gr,gt,ke,kh,id,in,lk,mx,my,ph,sg,sn,th,tr,ug"
  },
  {
    name: "Sud",
    isos: "ar,au,bo,br,bw,cl,ec,id,ls,nz,pe,sz,uy,za"
  },
  {
    name: "Africa",
    isos: "bw,gh,ke,ls,ng,sn,sz,tn,ug,za"
  },
  {
    name: "South-East Asia",
    isos: "id,ph,my"
  },
  {
    name: "Orient",
    isos: "bd,bt,id,in,jp,kg,kh,kr,lk,mn,my,ph,sg,th"
  },
  {
    name: "Europe",
    isos:
      "ad,al,at,bg,ch,cz,de,dk,ee,es,fi,fr,gb,gr,hr,hu,ie,it,is,lt,lu,lv,me,mk,mt,nl,no,pl,pt,ro,rs,ru,se,si,sk,ua"
  },
  {
    name: "Central",
    isos: "at,cz,hu,pl,sk,si"
  },
  {
    name: "Nordic",
    isos: "is,dk,ee,fi,no,se,lt,lv"
  },
  {
    name: "Mediterranean",
    isos: "al,il,it,gr,me,mk,pt,rs"
  },
  { name: "Latin America", isos: "ar,bo,br,cl,co,ec,gt,mx,pe,uy" },
  { name: "Кириллица", isos: "bg,kg,mk,mn,rs,ru,ua" },
  { name: "العربية", isos: "ae,jo,il,tn" },
  { name: "Other", isos: "bt,in,jp,kh,kr,il,lk,th" },
  { name: "English usage", isos: "bt,in,ke,lk,ls,my,ph,sg,sz,za" },
  { name: "Hispanic-sound", isos: "ph" },
  {
    name: "◄ Left-hand driving",
    /*complement: "Right ►",*/
    isos: "au,bd,bt,bw,gb,id,ie,in,ke,jp,lk,ls,my,nz,sg,sz,th,ug,za"
  },
  {
    name: "Right ►",
    complementary: true,
    isos: "au,bd,bt,bw,gb,id,ie,in,ke,jp,lk,ls,my,nz,sg,sz,th,ug,za"
  },
  {
    fig: { type: "car_plate", color: "white" },
    title: "White 🚗 Plate",
    isos:
      "ae,ar,au,bd,bg,br,cl,cz,ec,gh,gt,hr,ie,jo,ke,kh,kr,me,mk,mx,ng,nz,pe,sk,th,ug,uy,za"
  },
  {
    fig: { type: "car_plate" },
    title: "Yellow 🚗 Plate",
    isos: "bw,co,dk,gb,gh,ke,hu,il,jp,lk,lu,my,nl,ph,th,ua,ug"
  },
  {
    fig: { type: "car_plate", content: "front" },
    title: "Yellow Front Plate",
    isos: "au,co,gh,il,lu,nl"
  },
  {
    fig: { type: "car_plate", content: "back" },
    title: "Yellow Back Plate",
    isos: "co,gb,gh,il,jp,ke,lk,lu,nl,ug"
  },
  {
    fig: { type: "car_plate", color: "green", color2: "white" },
    title: "Green 🚗 Plate",
    isos: "bd,no,ph"
  },
  {
    fig: { type: "car_plate", color: "red", color2: "white" },
    title: "Red 🚗 Plate",
    isos: "bt"
  },
  {
    fig: { type: "car_plate", color: "black", color2: "white" },
    title: "Black 🚗 Plate",
    isos: "id,my,sg"
  },
  /*
        {
          name: "Red Vertical Stripe Car Plate",
          isos: "kg",
          style: { color: "red" }
        },
        */
  {
    title: "White car 🚗",
    fig: { type: "car", color: "white" },
    isos: "ae,bd,bo,br,bw,ca,cl,il,kh,ls,mk,my,pe,ph,ro,sz,ua,us"
  },
  {
    title: "Black car 🚗",
    fig: { type: "car", color: "black" },
    isos: "ar,id,jo,my,pe,ru,uy"
  },
  {
    title: "Blue car 🚗",
    fig: { type: "car", color: "blue" },
    isos: "ar,au,br,bg,cz,fi,fr,gr,hr,it,hu,mx,ro,th"
  },
  {
    title: "Red car 🚗",
    fig: { type: "car", color: "red" },
    isos: "gb,ua"
  },
  {
    title: "Blur Circle 🚗",
    image: "misc/blur-circle.png",
    isos: "au,dk,ie,lu,za"
  },
  {
    title: "Sky Glitches ☁️",
    image: "misc/glitch2.png",
    isos: "al,hr,kg,me,sn"
  },
  {
    title: "Blury Sky ☁️",
    image: "misc/sky-blur.png",
    isos: "au,it,gr,za"
  },
  {
    name: "Glitchy Blur 🚗",
    isos: "ar"
  },
  {
    name: "v1 cam",
    isos: "us,au,nz"
  },
  {
    image: "misc/mirror3.png",
    isos: "ae,bd,kg,gt,ng,ug"
  },
  {
    image: "misc/bar2.png",
    isos: "bd,ke,kg,gh,gt,mn,ng,sn"
  },
  {
    image: "misc/mirror.png",
    isos: "bd,mn"
  },
  {
    name: "Visible Antenna Car 📻",
    isos: "al,au,bg,br,co,cz,ec,fi,hr,il,lt,lv,me,pl,ro,ru,sk,ua"
  },
  {
    image: "car/antenna/pl.png",
    isos: "al,cz,hr,hu,me,ro,sk,si,pl"
  },
  {
    image: "car/antenna/cz.png",
    isos: "bg,cz,ro,sk"
  },
  {
    name: "Desertic",
    isos: "ar,bo,bw,cl,jo,pe,tr"
  },
  {
    name: "Tropical",
    isos: "br,ec,id,in,kh,lk,my,ph,th"
  },
  {
    name: "Dry",
    isos: "ae,il,jo,pe"
  },
  {
    name: "Snow",
    isos: "ad,at,bg,kg"
  },
  /*
  {
    name: "Sea",
    isos: "ec,ph,tn"
  },
  */
  {
    name: "Limited zone",
    isos: "ae,ec,il,in,kg,kr,ph,tn,uy"
  },
  {
    name: "Flat",
    isos: "be,br,ca,cz,ee,gb,hu,ie,kh,lt,lv,lu,mx,nl,pl,th,us"
  },
  {
    name: "Not flat",
    isos: "al,ad,bh,bo,ch,co,ec,hr,gr,it,ls,me,mk,mt,pe,pt,ro,rs,si,sk"
  },
  {
    name: "Montainous",
    isos: "ad,bh,bo,ch,jo,jp,me,mk,pe,si"
  },
  {
    fig: { type: "bollard", color: "white", front: 1 },
    isos: "al,ch,cz,de,ee,fi,gb,gr,hu,hr,il,it,lt,lv,lu,mk,pt,rs,se,sk"
  },
  {
    fig: { type: "bollard", color: "white", back: 1, circ: 1 },
    isos: "ch,de,ee,es,fi,gb,il,lv,lu,pt,se"
  },
  {
    fig: { type: "bollard_cz", front: 1 },
    isos: "cz,sk"
  },
  {
    fig: { type: "bollard", color: "red", back: 1 },
    isos: "al,gr,hu,hr,it,lt,mk,rs,se"
  },
  {
    fig: { type: "bollard", color: "gold", color2: "white", front: 1 },
    isos: "be,dk,is,uy"
  },
  {
    fig: { type: "bollard", color: "gold", back: 1, circ: 1 },
    isos: "ee,fi,lv"
  },
  {
    fig: { type: "bollard", color: "gold", front: 1 },
    isos: "ee,es,fi,lv"
  },
  {
    fig: { type: "bollard_ec2", front: 1 },
    isos: "ec"
  },
  {
    fig: { type: "bollard", color: "red", color2: "white", front: 1 },
    isos: "au,nl,tr"
  },
  {
    fig: { type: "bollard_pl", back: 1 },
    isos: "pl"
  },
  {
    fig: { type: "bollard_pl", front: 1 },
    isos: "nz,pl"
  },
  {
    fig: { type: "bollard", color: "red", color2: "white", front: 1, hat: 1 },
    isos: "at,me,rs,si"
  },
  {
    fig: { type: "bollard_rs", front: 1 },
    isos: "me,rs"
  },
  {
    fig: ["o", "black", "black"],
    isos: "al,hr,kg,se,th"
  },
  {
    fig: ["■", "red", "red"],
    isos: "al,at,au,ec,gr,hr,hu,it,kh,me,mn,mk,nl,nz,pl,pt,rs,si,tr"
  },
  {
    image: "bollard/fr.png",
    isos: "fr"
  },
  {
    image: "bollard/ad.png",
    isos: "ad"
  },
  {
    image: "bollard/is.png",
    isos: "is"
  },
  {
    svg: ["turn", "gold", "black"],
    isos: "br,fi,ie,is,no,pt"
  },
  {
    svg: ["turn", "black", "gold"],
    isos: "cl,co,ec,mx,nz,uy"
  },
  {
    svg: ["turn", "black", "#DFFF00"],
    isos: "co"
  },
  {
    svg: ["turn", "#DFFF00", "black"],
    isos: "tr"
  },
  {
    svg: ["turn", "white", "black"],
    isos: "al,ch,gb,gr,it,nz"
  },
  {
    svg: ["turn", "black", "white"],
    isos: "ca,ch,co,me,rs,si"
  },
  {
    svg: ["turn", "red", "white"],
    isos: "be,bg,bw,hr,lk,lt,lv,mk,pl,ro,si,sk,sz,tr"
  },
  {
    svg: ["turn", "red", "#DFFF00"],
    isos: "hr,me,sk"
  },
  {
    svg: ["turn", "white", "red"],
    isos: "at,ee,hu"
  },
  {
    svg: ["turn", "white", "#037bfc"],
    isos: "ad,fr"
  },
  {
    svg: ["turn", "yellow", "#037bfc"],
    isos: "se"
  },
  {
    svg: ["square", "black", "#ffcc00"],
    isos: "ar,br,cl,ec,uy"
  },
  {
    image: "nordic3.png",
    isos: "fi,se"
  },
  {
    image: "village.png",
    isos: "pl"
  },
  {
    image: "road/comb.png",
    isos: "ee,no"
  },
  {
    image: "road/uy.png",
    title: "Dashed Line inside 2 lines",
    isos: "ls,ph,uy,za"
  },
  {
    image: "road/europe.png",
    isos: "au,cl,gb,gh,id,ie,jp,lk,my,nz,ph,sn"
  },
  {
    image: "road/america.png",
    title: "Yellow Center Line",
    isos: "ar,bo,br,ca,cl,co,ec,fi,ke,kh,no,pe,ph,th,us,uy"
  },
  {
    image: "road/africa.png",
    isos: "bw,jo,ls,sz,za"
  },
  {
    image: "road/dk.png",
    isos: "dk"
  },
  {
    image: "road/no.png",
    isos: "be,no"
  },
  {
    image: "road/se.png",
    isos: "fi,se"
  },
  {
    image: "road/nz.png",
    isos: "nz"
  },
  {
    image: "road/ae.png",
    isos: "ae,il,ng,sg,za"
  },
  {
    svg: ["poll1", "black", "white"],
    isos: "ae,bh,lk,lv,mt,pe,th,uy"
  },
  {
    svg: ["poll1", "black", "gold"],
    isos: "co"
  },
  {
    image: "poll/ee.png",
    isos: "ee,fi"
  },
  {
    image: "poll/se.png",
    isos: "fi,se"
  },
  {
    image: "poll/no.png",
    isos: "no"
  },
  {
    image: "poll/hr.png",
    isos: "ch,hr,me,si"
  },
  {
    image: "poll/nl.png",
    isos: "be,nl,pl"
  },
  {
    image: "poll/lv.png",
    isos: "ee,lv,sk"
  },
  {
    image: "sign/pedestrian/be.png",
    isos: "be,mk,pl,rs,si"
  },
  {
    // 3
    image: "sign/pedestrian/3.png",
    isos: "ee,kg,lt,mn,ru,ua"
  },
  {
    // 4
    image: "sign/pedestrian/4.png",
    isos: "bg,no,se"
  },
  {
    // 5
    image: "sign/pedestrian/5.png",
    isos: "fr,fi,hr,it,lv,mk,nl,pt,ro,rs,si,sk"
  },
  {
    image: "sign/pedestrian/es.png",
    isos: "ch,es"
  },
  {
    image: "sign/stop/bg.png",
    isos: "bg"
  },
  {
    image: "sign/stop/mx.png",
    isos: "gt,mx"
  },
  {
    image: "sign/stop/co.png",
    isos: "ar,bo,br,cl,co,ec,pe,uy"
  },
  {
    image: "sign/nopriority/pl.png",
    isos: "fi,gr,is,lv,me,mk,pl,se,si"
  },
  {
    image: "sign/residential/at.svg",
    isos: "at,cz,de,ee,es,fi,lv,se,sk,rs"
  },
  {
    image: "sign/residential/ru.svg",
    isos: "ua,ru"
  },
  {
    title: "Painted tree",
    image: "misc/tree.png",
    isos: "kg,lt,ro,ru,ua"
  },
  {
    title: "Painted tree 2",
    image: "misc/tree2.png",
    isos: "in"
  },
  {
    image: "electrical/hu-like.png",
    isos: "hu,pl,ro"
  },
  {
    image: "electrical/lv-like.png",
    isos: "ee,jp,lk,lv,lt"
  },
  {
    image: "electrical/pl3.png",
    isos: "hu,pl"
  }
  /*
        {
          name: "Unsual deli",
          isos: "bg,fr,kh,kg,mn,mt,ro,th,ua"
        },
        {
          name: "Sunset",
          isos: "ar"
        },
        {
          name: "Scooters",
          isos: "kh,th"
        },
        {
          name: "Yellow tricolor",
          isos: "ar,mx,pe,uy"
        },
        {
          name: "Black tricolor",
          isos: "bo,cl,ec"
        },
        {
          name: "Yellow pedestrian border",
          isos: "bo,mx,pe"
        },
        {
          name: "Yellow pedestrian crossing",
          isos: "ch"
        }
        */
];
