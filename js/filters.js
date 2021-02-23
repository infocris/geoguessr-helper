var groups = [
  {
    name: "Sud",
    complement: "Nord",
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
    name: "Nordic",
    isos: "is,dk,ee,fi,no,se,lt,lv"
  },
  { name: "Latin America", isos: "ar,bo,br,cl,co,ec,gt,mx,pe,uy" },
  { name: "Кириллица", isos: "bg,kg,mk,mn,rs,ru,ua" },
  { name: "Other", isos: "bt,in,jp,kh,kr,il,lk,th" },
  { name: "English usage", isos: "bt,in,ke,ls,my,ph,sg,sz,za" },
  { name: "Hispanic-sound", isos: "ph" },
  {
    name: "◄ Left-hand driving",
    complement: "Right ►",
    isos: "au,bd,bt,bw,gb,id,ie,in,ke,jp,lk,ls,my,nz,sg,sz,th,ug,za"
  },
  /*
        { name: "Latin", isos: "id,my,ph,sg" },
        */
  {
    name: "Yellow 🚗 Plate",
    isos: "co,dk,gb,ke,hu,il,jp,lk,lu,nl,ua,ug",
    complement: "no",
    style: { color: "#ffd900" }
  },
  {
    name: "Sign",
    image: "sign/nopriority/se.png",
    width: 16,
    isos: "fi,gr,is,lv,me,pl,se,si",
    complement: "no"
  },
  {
    name: "Yellow Center Line",
    isos: "fi,no",
    complement: "no",
    style: { color: "#ffd900" }
  },
  /*
        {
          name: "Red Vertical Stripe Car Plate",
          isos: "kg",
          style: { color: "red" }
        },
        */
  {
    name: "White 🚗",
    isos: "ae,bd,bo,br,bw,cl,il,kh,ls,my,pe,ph,sz"
  },
  {
    name: "Black 🚗",
    isos: "ar,id,jo,my,pe,uy"
  },
  {
    name: "Blue 🚗",
    isos: "ar,br,bg,cz,hr,hu,mx"
  },
  {
    name: "Red 🚗",
    isos: "gb,ua"
  },
  {
    name: "Blur Circle 🚗",
    isos: "au,dk,ie,za"
  },
  {
    name: "Glitchy Blur 🚗",
    isos: "ar"
  },
  {
    name: "Dashed Line inside 2 lines",
    isos: "ls,uy,za",
    style: { color: "#ffd900" }
  },
  { name: "Sky Glitches ☁️", isos: "al,hr,kg,me,sn" },
  { name: "Blury Sky ☁️", isos: "au,gr" },
  {
    name: "Mirrors",
    image: "misc/mirror2.png",
    width: 24,
    isos: "ae,bd,kg,gt,ng,ug",
    complement: "no"
  },
  {
    name: "Rear Bars",
    image: "misc/bar.png",
    width: 24,
    isos: "bd,ke,kg,gh,gt,mn,ng,sn",
    complement: "no"
  },
  {
    image: "misc/mirror.png",
    width: 24,
    isos: "bd,mn"
  },
  {
    name: "Visible Antenna Car 📻",
    isos: "al,au,bg,br,co,cz,ec,fi,hr,il,lt,lv,me,pl,ro,ru,sk,ua"
  },
  /*
        {
          name: "Tape Antenna Car",
          isos: "bg"
        },
        */
  {
    name: "Desertic",
    isos: "ar,jo,pe,tr"
  },
  /*
        {
          name: "Flat country",
          isos: "be,ee,hu,nl"
        },
        {
          name: "Montainous",
          isos: "al,ad,bo,it,me,mt,pe,pt,rs,si"
        },
        {
          name: "Rivers",
          isos: "al"
        },
        */
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
    isos: "au,tr"
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
    isos: "rs"
  },
  {
    fig: ["o", "black", "black"],
    isos: "al,hr,kg,se,th"
  },
  {
    fig: ["■", "red", "red"],
    isos: "ec,kh,mn,nz,pl"
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
    isos: "br,fi,ie,no,pt"
  },
  {
    svg: ["turn", "black", "gold"],
    isos: "cl,co,ec,mx,nz"
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
    isos: "al,ch,gr,it,nz"
  },
  {
    svg: ["turn", "black", "white"],
    isos: "ch,me,si"
  },
  {
    svg: ["turn", "red", "white"],
    isos: "be,bg,hr,lt,lv,mk,ro,si,tr"
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
    svg: ["del2", "green", "white"],
    isos: "pl"
  },
  {
    svg: ["poll1", "black", "white"],
    isos: "pe,uy"
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
    image: "road/dk.png",
    isos: "dk"
  },
  {
    image: "road/no.png",
    isos: "no"
  },
  {
    image: "road/se.png",
    isos: "fi,se"
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
    isos: "lv"
  },
  {
    image: "sign/pedestrian/be.png",
    isos: "be,pl,rs,si"
  },
  {
    image: "sign/pedestrian/lt.png",
    isos: "lt,ru,ua"
  },
  {
    image: "sign/pedestrian/se.png",
    isos: "bg,no,se"
  },
  {
    image: "sign/pedestrian/fi.png",
    isos: "fr,fi,hr,it,lv,nl,pt,ro,sk"
  },
  {
    image: "sign/pedestrian/es.png",
    isos: "ch,es"
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
