import { useState, useMemo } from "react";

/* ═══════════════ TRAIN LINE COLORS (actual Tokyo metro colors) ═══════════════ */
const LINES = {
  "JR Yamanote":"#9ACD32","JR Chuo":"#F15A22","JR Keiyo":"#C9252F","JR Saikyo":"#00AC9B",
  "Metro Ginza":"#FF9500","Metro Marunouchi":"#F62E36","Metro Chiyoda":"#00BB85",
  "Metro Hanzomon":"#8F76D6","Metro Fukutoshin":"#9C5E31",
  "Toei Oedo":"#B6007A","Toei Asakusa":"#E85298",
  "Keio":"#DD0077","Odakyu":"#2B59C3","Seibu":"#36C",
  "Disney Bus":"#E7457B","Limousine Bus":"#0066B3","Walk":"#78716c",
};

/* ═══════════════ HOTEL ═══════════════ */
const HOTEL = { name:"Hotel Sunroute Plaza Shinjuku", addr:"2-3-1 Yoyogi, Shibuya-ku 151-0053", hrs:"24h" };

/* ═══════════════ FULL 9-DAY ITINERARY ═══════════════ */
const DAYS = [
  { id:"d1", date:"Fri 17 Apr", title:"Arrival Night", icon:"✈️",
    transport:"Haneda → Limousine Bus → Shinjuku on foot",
    warnings:["Keep the whole night in Shinjuku only","JINS & Fūunji are time-sensitive — do them first","If tired, cut Keio Mall and just grab 7-Eleven snacks"],
    stops:[
      { name:"Haneda Airport T3", area:"Haneda", cat:"Transit", addr:"Hanedakuko, Ota City 144-0041", hrs:"24h", note:"Land → immigration → limousine bus counter", transit:null },
      { name:"Hotel Sunroute Plaza", area:"Shinjuku", cat:"Hotel", addr:HOTEL.addr, hrs:"24h", note:"Drop bags, freshen up", transit:{ line:"Limousine Bus", from:"Haneda T3", to:"Shinjuku Busta", dur:"50 min · ¥2,800", walk:"3 min walk to hotel" }},
      { name:"JINS Subnade", area:"Shinjuku", cat:"Shopping", addr:"Subnade B1F, 1 Kabukicho 160-0021", hrs:"10:30AM–9:00PM", note:"Get glasses sorted. Ready in ~30 min", transit:{ line:"Walk", from:"Hotel", to:"Subnade", dur:"10 min walk north" }},
      { name:"Fūunji", area:"Shinjuku", cat:"Food", addr:"Hokuto Bldg 1F, 2-14-3 Yoyogi 151-0053", hrs:"11:00AM–3:00PM, 5:00PM–9:00PM", note:"⚠️ CASH ONLY. Bring ¥1,200+. Vending machine order. Queue moves fast", transit:{ line:"Walk", from:"Subnade", to:"Fūunji", dur:"10 min walk south" }},
      { name:"Keio Mall", area:"Shinjuku", cat:"Shopping", addr:"1-1 Nishishinjuku 160-0023", hrs:"10:00AM–10:00PM", note:"Optional browse if you have energy", transit:{ line:"Walk", from:"Fūunji", to:"Keio Mall", dur:"5 min walk" }},
      { name:"Don Quijote Shinjuku", area:"Shinjuku", cat:"Shopping", addr:"1-16-5 Kabukicho 160-0021", hrs:"24h", note:"Fallback if Keio Mall closed. Always open", transit:{ line:"Walk", from:"Keio Mall", to:"Don Quijote", dur:"7 min walk" }},
      { name:"7-Eleven (near hotel)", area:"Shinjuku", cat:"Convenience", addr:"2-8-3 Yoyogi 151-0053", hrs:"24h", note:"Snacks, drinks, supper backup", transit:{ line:"Walk", from:"—", to:"Hotel area", dur:"3 min walk" }},
    ]},

  { id:"d2", date:"Sat 18 Apr", title:"Shinjuku → Shibuya Shopping", icon:"🛍️",
    transport:"Shinjuku on foot → JR Yamanote to Shibuya → JR back",
    warnings:["Very full day — treat malls as browse, not deep shop","Group Shinjuku south/west first, hotel break, then east side","If energy drops, cut Marui Annex & Subnade first"],
    stops:[
      { name:"Sawamura Bakery", area:"Shinjuku", cat:"Breakfast", addr:"NEWoMan 2F, 5-24-55 Sendagaya 151-0051", hrs:"7:00AM–11:00PM", note:"French toast, bacon & eggs, fresh bread. Opens 7AM!", transit:null },
      { name:"Shinjuku Gyoen", area:"Shinjuku", cat:"Park", addr:"11 Naitomachi 160-0014", hrs:"9:00AM–6:00PM", note:"Yaezakura cherry blossoms 🌸. ¥500. No reservation needed this date", transit:{ line:"Walk", from:"Sawamura/NEWoMan", to:"Gyoen gate", dur:"10 min walk" }},
      { name:"Hachiko Statue", area:"Shibuya", cat:"Attraction", addr:"1 Dogenzaka 150-0043", hrs:"24h", note:"Quick photo at Hachiko Exit. Do with Crossing", transit:{ line:"JR Yamanote", from:"Shinjuku", to:"Shibuya", dur:"7 min · ¥160 · clockwise 3 stops" }},
      { name:"Shibuya Crossing", area:"Shibuya", cat:"Attraction", addr:"2-2-1 Dogenzaka 150-0043", hrs:"24h", note:"World's busiest crossing. Right outside station", transit:{ line:"Walk", from:"Hachiko", to:"Crossing", dur:"1 min" }},
      { name:"Lunch — Sushi no Midori", area:"Shibuya", cat:"Lunch", addr:"Mark City East 4F, 1-12-3 Dogenzaka 150-0043", hrs:"11:00AM–3:00PM, 5:00PM–9:00PM", note:"Take ticket number → shop while waiting. Best value sushi", transit:{ line:"Walk", from:"Crossing", to:"Mark City", dur:"3 min" }},
      { name:"SHIBUYA109", area:"Shibuya", cat:"Shopping", addr:"2-29-1 Dogenzaka 150-0043", hrs:"10:00AM–9:00PM", note:"10 floors fashion. WEGO on 7F. 120+ shops", transit:{ line:"Walk", from:"Crossing", to:"109", dur:"2 min" }},
      { name:"GU Shibuya", area:"Shibuya", cat:"Shopping", addr:"32-13 Udagawacho 150-0042", hrs:"11:00AM–9:00PM", note:"4 floors budget fashion", transit:{ line:"Walk", from:"109", to:"GU", dur:"5 min" }},
      { name:"Shibuya PARCO", area:"Shibuya", cat:"Shopping", addr:"15-1 Udagawacho 150-8377", hrs:"11:00AM–9:00PM", note:"Nintendo TOKYO, Pokémon Center, JUMP SHOP", transit:{ line:"Walk", from:"GU", to:"PARCO", dur:"3 min" }},
      { name:"MIYASHITA PARK", area:"Shibuya", cat:"Shopping", addr:"6-20-10 Jingumae 150-0001", hrs:"11:00AM–9:00PM", note:"Streetwear, rooftop park", transit:{ line:"Walk", from:"PARCO", to:"MIYASHITA", dur:"5 min" }},
      { name:"Cat Street", area:"Shibuya", cat:"Street", addr:"5-10 Jingumae 150-0001", hrs:"Varies", note:"Indie shops connecting Shibuya ↔ Harajuku", transit:{ line:"Walk", from:"MIYASHITA", to:"Cat Street", dur:"3 min" }},
      { name:"Mega Donki Shibuya", area:"Shibuya", cat:"Shopping", addr:"28-6 Udagawacho 150-0042", hrs:"24h", note:"Last Shibuya stop. Snacks, cosmetics, souvenirs", transit:{ line:"Walk", from:"Cat Street", to:"Mega Donki", dur:"5 min" }},
      { name:"NEWoMan Shinjuku", area:"Shinjuku", cat:"Shopping", addr:"4-1-6 Shinjuku 160-0022", hrs:"11:00AM–8:30PM", note:"Premium lifestyle. South-side cluster start", transit:{ line:"JR Yamanote", from:"Shibuya", to:"Shinjuku", dur:"7 min · ¥160" }},
      { name:"LUMINE 1 & 2", area:"Shinjuku", cat:"Shopping", addr:"1-1-5 Nishi-Shinjuku 160-0023", hrs:"11:00AM–9:00PM", note:"Trendy fashion", transit:{ line:"Walk", from:"NEWoMan", to:"LUMINE", dur:"3 min" }},
      { name:"Keio Dept Store", area:"Shinjuku", cat:"Shopping", addr:"1-1-4 Nishi-Shinjuku 160-8321", hrs:"10:00AM–8:00PM", note:"B1 food hall, premium brands", transit:{ line:"Walk", from:"LUMINE", to:"Keio", dur:"2 min" }},
      { name:"Takashimaya Times Square", area:"Shinjuku", cat:"Shopping", addr:"5-24-2 Sendagaya 151-8580", hrs:"10:30AM–7:30PM", note:"Massive. Multi-floor Hands store", transit:{ line:"Walk", from:"Keio", to:"Takashimaya", dur:"5 min" }},
      { name:"Southern Terrace", area:"Shinjuku", cat:"Walk", addr:"2-2-1 Yoyogi 151-8583", hrs:"24h", note:"Pretty walk back toward hotel for break", transit:{ line:"Walk", from:"Takashimaya", to:"Terrace", dur:"2 min" }},
      { name:"🏨 Hotel Break", area:"Shinjuku", cat:"Break", addr:HOTEL.addr, hrs:"—", note:"Rest, drop bags before east-side cluster", transit:{ line:"Walk", from:"Terrace", to:"Hotel", dur:"3 min" }},
      { name:"GU Shinjuku", area:"Shinjuku", cat:"Shopping", addr:"3-29-1 Shinjuku 160-0022", hrs:"10:00AM–10:00PM", note:"Bic Camera 7F. Largest GU in Shinjuku", transit:{ line:"Walk", from:"Hotel", to:"East Exit area", dur:"10 min" }},
      { name:"LUMINE EST", area:"Shinjuku", cat:"Shopping", addr:"3-38-1 Shinjuku 160-0022", hrs:"10:30AM–8:00PM", note:"Youth streetwear", transit:{ line:"Walk", from:"GU", to:"LUMINE EST", dur:"3 min" }},
      { name:"Isetan", area:"Shinjuku", cat:"Shopping", addr:"3-14-1 Shinjuku 160-0022", hrs:"10:00AM–8:00PM", note:"🔥 World-class dept store. B1 food hall is MUST-VISIT", transit:{ line:"Walk", from:"LUMINE EST", to:"Isetan", dur:"3 min" }},
      { name:"Marui Main", area:"Shinjuku", cat:"Shopping", addr:"3-30-13 Shinjuku 160-0022", hrs:"11:00AM–8:00PM", note:"Apple Store, pop-ups", transit:{ line:"Walk", from:"Isetan", to:"Marui", dur:"2 min" }},
      { name:"Marui Annex", area:"Shinjuku", cat:"Shopping", addr:"3-1-26 Shinjuku 160-0022", hrs:"11:00AM–8:00PM", note:"Cut if tired", transit:{ line:"Walk", from:"Marui Main", to:"Annex", dur:"3 min" }},
      { name:"Subnade", area:"Shinjuku", cat:"Shopping", addr:"1-22 Kabukicho 160-0021", hrs:"10:30AM–9:00PM", note:"Underground. JINS, Daiso, Zoff, Honeys. Cut if tired", transit:{ line:"Walk", from:"Annex", to:"Subnade", dur:"5 min" }},
      { name:"Dinner — Ginza Happo", area:"Shinjuku", cat:"Dinner", addr:"Oriental Wave Bldg 3F, 5-17-13 Shinjuku 160-0022", hrs:"11:30AM–10:00PM", note:"Japanese cuisine. Last seating ~8PM", transit:{ line:"Walk", from:"Subnade", to:"Restaurant", dur:"5 min" }},
    ]},

  { id:"d3", date:"Sun 19 Apr", title:"Harajuku → Akasaka", icon:"⚡",
    transport:"JR to Harajuku → Metro to Akasaka → back to Shinjuku",
    warnings:["Keep lunch in Harajuku, not Shibuya","HP Cafe is reservation-heavy — treat as visit stop unless booked","⚠️ SUN closures: Fūunji, Nonbei Yokocho, Sushi Iwase"],
    stops:[
      { name:"Breakfast at hotel", area:"Shinjuku", cat:"Breakfast", addr:HOTEL.addr, hrs:"—", note:"Keep simple before heading out", transit:null },
      { name:"Takeshita Dori", area:"Harajuku", cat:"Street", addr:"1-19 Jingumae 150-0001", hrs:"Varies", note:"Youth fashion, crepes, crazy styles", transit:{ line:"JR Yamanote", from:"Shinjuku", to:"Harajuku", dur:"5 min · ¥150 · 1 stop clockwise" }},
      { name:"WEGO Harajuku", area:"Harajuku", cat:"Shopping", addr:"1-5-10 Jingumae 150-0001", hrs:"10:30AM–8:00PM", note:"Flagship on Takeshita Dori. Affordable streetwear", transit:{ line:"Walk", from:"Takeshita Dori", to:"WEGO", dur:"2 min" }},
      { name:"Kiddyland", area:"Harajuku", cat:"Shopping", addr:"6-1-9 Jingumae 150-0001", hrs:"11:00AM–8:00PM", note:"Multi-floor character goods", transit:{ line:"Walk", from:"WEGO", to:"Kiddyland", dur:"5 min via Omotesando" }},
      { name:"Lunch — Tonkatsu Maisen", area:"Harajuku", cat:"Lunch", addr:"4-8-5 Jingumae 150-0001", hrs:"11:00AM–9:00PM", note:"🔥 Famous tonkatsu in converted bathhouse. ¥1,500-2,500", transit:{ line:"Walk", from:"Kiddyland", to:"Maisen", dur:"5 min" }},
      { name:"Harry Potter Shop", area:"Harajuku", cat:"Shopping", addr:"6-31-17 Jingumae 150-0001", hrs:"11:00AM–9:00PM", note:"🔥 Japan flagship! 2 floors, Butterbeer Bar", transit:{ line:"Walk", from:"Maisen", to:"HP Shop", dur:"5 min" }},
      { name:"Tokyu Plaza Harakado", area:"Harajuku", cat:"Shopping", addr:"6-31-21 Jingumae 150-0001", hrs:"11:00AM–9:00PM", note:"Right next door to HP Shop. Indie brands, rooftop", transit:{ line:"Walk", from:"HP Shop", to:"Harakado", dur:"1 min" }},
      { name:"HP Stairs & Time Turner", area:"Akasaka", cat:"Attraction", addr:"Akasaka Biz Tower, 5-3-1 Akasaka 107-6301", hrs:"24h", note:"Free photo spot", transit:{ line:"Metro Chiyoda", from:"Meiji-Jingumae (Harajuku)", to:"Akasaka (transfer Omotesando)", dur:"~20 min · ¥330" }},
      { name:"Harry Potter Mahou Dokoro", area:"Akasaka", cat:"Shopping", addr:"Akasaka Biz Tower 1F, 5-3-1 Akasaka 107-6301", hrs:"11:00AM–9:00PM", note:"Official Wizarding World store", transit:{ line:"Walk", from:"Stairs", to:"Shop", dur:"1 min (same building)" }},
      { name:"Harry Potter Cafe", area:"Akasaka", cat:"Cafe", addr:"Akasaka Biz Tower 1F, 5-3-1 Akasaka 107-0052", hrs:"11:00AM–5:00PM", note:"⚠️ Reservation-heavy. Treat as visit stop unless pre-booked", transit:{ line:"Walk", from:"Shop", to:"Cafe", dur:"1 min (same building)" }},
      { name:"Dinner — Shinjuku sushi (flexible)", area:"Shinjuku", cat:"Dinner", addr:"TBD", hrs:"TBD", note:"Still flexible. Numazuko, Sushizanmai, or Ganso Zushi", transit:{ line:"Metro Marunouchi", from:"Akasaka-mitsuke", to:"Shinjuku", dur:"15 min · ¥200" }},
    ]},

  { id:"d4", date:"Mon 20 Apr", title:"Tokyo Disneyland", icon:"🏰",
    transport:"Busta Shinjuku → Direct bus (50 min) or Train fallback",
    warnings:["Bus: buy ticket at Busta 4F on the day. Go by 6:30AM","Monday = weekday, tickets should be fine but don't sleep in","If bus full → JR to Tokyo Stn → Keiyo Line → Maihama (~40 min but long transfer walk)"],
    stops:[
      { name:"Busta Shinjuku", area:"Shinjuku", cat:"Transit", addr:"5-24-55 Sendagaya 151-0051", hrs:"5:00AM–12:00AM", note:"4F. Area A (Orange zone). ¥1,000 cash/card. Arrive by 6:30AM", transit:{ line:"Walk", from:"Hotel", to:"Busta", dur:"3 min" }},
      { name:"Tokyo Disneyland", area:"Urayasu", cat:"Theme Park", addr:"1-1 Maihama, Urayasu, Chiba 279-0031", hrs:"9:00AM–9:00PM", note:"📅 BOOKED ($151.90). Reach for Stars 6:40PM. Fireworks 8:45PM", transit:{ line:"Disney Bus", from:"Busta Shinjuku", to:"Tokyo Disneyland", dur:"~50 min · ¥1,000" }},
      { name:"Return bus to Shinjuku", area:"—", cat:"Transit", addr:"Disneyland bus stop", hrs:"Last ~9:10–9:30PM", note:"Pay on bus with Suica/PASMO/cash. Unreserved — first come first served", transit:{ line:"Disney Bus", from:"Tokyo Disneyland", to:"Busta Shinjuku", dur:"~50 min · ¥1,000" }},
    ]},

  { id:"d5", date:"Tue 21 Apr", title:"WB Studio Tour", icon:"⚡",
    transport:"Toei Oedo Line direct from Shinjuku → Toshimaen (20 min)",
    warnings:["Simplest route: Oedo Line direct. NO need to go via Ikebukuro","Allow 4-6 hours for the full studio tour","Wake 7AM for early entry"],
    stops:[
      { name:"Toshimaen Station", area:"Nerima", cat:"Transit", addr:"4-1-1 Nerima 176-0001", hrs:"Train hours", note:"Hogsmeade-themed station! Exit and walk 2 min", transit:{ line:"Toei Oedo", from:"Shinjuku-Nishiguchi", to:"Toshimaen", dur:"20 min · ~¥290" }},
      { name:"WB Studio Tour Tokyo", area:"Nerima", cat:"Theme Park", addr:"1-1-7 Kasugacho 179-0074", hrs:"Timed entry", note:"📅 BOOKED ($98). The Making of Harry Potter. Full day experience", transit:{ line:"Walk", from:"Toshimaen Stn", to:"Studio", dur:"2 min" }},
    ]},

  { id:"d6", date:"Wed 22 Apr", title:"Ginza → Tokyo Stn → Akihabara", icon:"🎌",
    transport:"Metro to Ginza → walk to Tokyo Stn → JR to Akihabara",
    warnings:["Kikanbo is near Kanda, not Ginza — eat it after Akihabara","⚠️ WED closures: Toyosu & Tsukiji","Nakano is optional evening add-on (5 min from Shinjuku)"],
    stops:[
      { name:"Hakuhinkan Toy Park", area:"Ginza", cat:"Shopping", addr:"8-8-11 Ginza 104-8132", hrs:"11:00AM–8:00PM", note:"Historic multi-floor toy store", transit:{ line:"Metro Marunouchi", from:"Shinjuku", to:"Ginza (transfer/walk)", dur:"~20 min · ¥210" }},
      { name:"GU Ginza Flagship", area:"Ginza", cat:"Shopping", addr:"5-7-7 Ginza 104-0061", hrs:"11:00AM–9:00PM", note:"5 floors! Same building as UNIQLO. Tax-free on 2F & 4F", transit:{ line:"Walk", from:"Hakuhinkan", to:"GU Ginza", dur:"5 min" }},
      { name:"UNIQLO Ginza Flagship", area:"Ginza", cat:"Shopping", addr:"6-9-5 Ginza 104-0061", hrs:"11:00AM–9:00PM", note:"12-storey. Exclusive designs", transit:{ line:"Walk", from:"GU", to:"UNIQLO", dur:"2 min (same building)" }},
      { name:"Tokyo Character Street", area:"Tokyo Station", cat:"Shopping", addr:"First Avenue B1F, 1-9-1 Marunouchi 100-0005", hrs:"10:00AM–8:30PM", note:"🔥 30+ character shops. Pokémon, Ghibli, Chiikawa, Sanrio", transit:{ line:"Walk", from:"Ginza area", to:"Tokyo Station Yaesu B1", dur:"~15 min walk or 1 Metro stop" }},
      { name:"Akihabara", area:"Akihabara", cat:"District", addr:"1 Sotokanda 101-0021", hrs:"Varies", note:"Anime, figures, electronics, Graniph (graphic tees)", transit:{ line:"JR Yamanote", from:"Tokyo", to:"Akihabara", dur:"4 min · ¥150 · 2 stops" }},
      { name:"Dinner — Kikanbo Ramen", area:"Kanda", cat:"Dinner", addr:"2-10-9 Kajicho 101-0044", hrs:"11:00AM–9:30PM", note:"Famous spicy miso. ⚠️ CASH vending machine. Near Kanda, not Ginza", transit:{ line:"Walk", from:"Akihabara", to:"Kanda area", dur:"10 min walk south" }},
    ],
    extras:[
      { name:"Nakano Broadway + Shimamura", note:"JR Chuo from Shinjuku 5 min. If evening is free" },
    ]},

  { id:"d7", date:"Thu 23 Apr", title:"Tokyo DisneySea", icon:"🌊",
    transport:"Busta Shinjuku → Direct bus (~40 min) or train fallback",
    warnings:["Same bus process as Monday — Busta 4F, Area A, ¥1,000","RUSH to Fantasy Springs first when park opens","Thursday is quietest — bus seats guaranteed"],
    stops:[
      { name:"Busta Shinjuku", area:"Shinjuku", cat:"Transit", addr:"5-24-55 Sendagaya 151-0051", hrs:"5:00AM–12:00AM", note:"Same as Monday. Go early by 6:30AM", transit:{ line:"Walk", from:"Hotel", to:"Busta", dur:"3 min" }},
      { name:"Tokyo DisneySea", area:"Urayasu", cat:"Theme Park", addr:"1-13 Maihama, Urayasu, Chiba 279-0036", hrs:"9:00AM–9:00PM", note:"📅 BOOKED ($151.90). RUSH FANTASY SPRINGS! 🏰", transit:{ line:"Disney Bus", from:"Busta Shinjuku", to:"Tokyo DisneySea", dur:"~40 min · ¥1,000" }},
    ]},

  { id:"d8", date:"Fri 24 Apr", title:"Asakusa → Ikebukuro", icon:"⛩️",
    transport:"Metro to Asakusa → train to Ikebukuro → JR back to Shinjuku",
    warnings:["In Ikebukuro, start east (Animate/Sunshine) then back to station","Dinner at Kani Douraku 6:30PM — watch the clock!","Namiki Yabu Soba closed THU but OPEN Friday ✅"],
    stops:[
      { name:"Nakamise Shopping Street", area:"Asakusa", cat:"Street", addr:"1-36-3 Asakusa 111-0032", hrs:"~9:00AM–7:00PM", note:"🔥 Japan's oldest shopping street. 90 shops. Go early!", transit:{ line:"Metro Ginza", from:"Shinjuku-Sanchome → Asakusa (transfer at Ueno)", to:"Asakusa", dur:"~30 min · ¥280" }},
      { name:"Shimamura Asakusa ROX", area:"Asakusa", cat:"Shopping", addr:"1-26-5 Asakusa 111-0032", hrs:"10:30AM–9:00PM", note:"Also Muji, Daiso, 3COINS, Loft, GU in same building", transit:{ line:"Walk", from:"Nakamise", to:"ROX", dur:"2 min" }},
      { name:"Lunch — Namiki Yabu Soba", area:"Asakusa", cat:"Lunch", addr:"2-11-9 Kaminarimon 111-0034", hrs:"11:00AM–7:30PM", note:"Classic old-school soba. No reservations. May queue", transit:{ line:"Walk", from:"ROX", to:"Yabu Soba", dur:"5 min" }},
      { name:"Animate Flagship", area:"Ikebukuro", cat:"Shopping", addr:"1-20-7 Higashi-Ikebukuro 170-0013", hrs:"10:00AM–9:00PM", note:"World's largest anime store. Start east-side cluster", transit:{ line:"Toei Asakusa", from:"Asakusa → Ikebukuro (via Ueno JR transfer)", to:"Ikebukuro", dur:"~35 min · ¥340" }},
      { name:"Otome Road", area:"Ikebukuro", cat:"Street", addr:"3 Higashi-Ikebukuro 170-0013", hrs:"Varies", note:"Anime / cosplay / doujin corridor", transit:{ line:"Walk", from:"Animate", to:"Otome Road", dur:"3 min" }},
      { name:"Sunshine City Gachapon", area:"Ikebukuro", cat:"Shopping", addr:"World Import Mart 3F, 3-1-3 Higashi-Ikebukuro 170-8630", hrs:"10:00AM–9:00PM", note:"🔥 3,000+ machines! Guinness Record. Bring ¥100 coins", transit:{ line:"Walk", from:"Otome Road", to:"Sunshine City", dur:"3 min" }},
      { name:"Tobu Dept Store", area:"Ikebukuro", cat:"Shopping", addr:"1-1-25 Nishi-Ikebukuro 171-8512", hrs:"10:00AM–8:00PM", note:"Station-side dept store. Toriton Sushi on 11F (optional snack)", transit:{ line:"Walk", from:"Sunshine", to:"Tobu", dur:"8 min back toward station" }},
      { name:"GU Ikebukuro", area:"Ikebukuro", cat:"Shopping", addr:"1-26-9 Minami-Ikebukuro 171-0022", hrs:"11:00AM–9:00PM", note:"3 floors. Quick stop if time", transit:{ line:"Walk", from:"Tobu", to:"GU", dur:"3 min" }},
      { name:"WEGO P'Parco", area:"Ikebukuro", cat:"Shopping", addr:"1-50-35 Higashi-Ikebukuro 171-0022", hrs:"11:00AM–9:00PM", note:"Last optional shop before leaving", transit:{ line:"Walk", from:"GU", to:"P'Parco", dur:"5 min" }},
      { name:"🏨 Hotel break", area:"Shinjuku", cat:"Break", addr:HOTEL.addr, hrs:"—", note:"Quick freshen up before dinner", transit:{ line:"JR Yamanote", from:"Ikebukuro", to:"Shinjuku", dur:"9 min · ¥170 · 5 stops" }},
      { name:"Dinner — Kani Douraku 6:30PM", area:"Shinjuku", cat:"Dinner", addr:"Theatre Bldg 8F, 3-14-20 Shinjuku 160-0022", hrs:"11:30AM–10:00PM", note:"🦀 Grilled crab legs! Full kaiseki course. Next to Isetan", transit:{ line:"Walk", from:"Hotel", to:"Restaurant", dur:"10 min" }},
    ],
    extras:[
      { name:"Pokémon Center MEGA", note:"Sunshine City alpa 2F. If extra time in Ikebukuro" },
    ]},

  { id:"d9", date:"Sat 25 Apr", title:"Departure Day", icon:"🧳",
    transport:"Shimokitazawa → Shinjuku → Limousine Bus to Haneda",
    warnings:["Flight at 10PM — you have all day for last shopping","Don Quijote is 24h for last-minute buys","Head to Busta by ~7PM latest for the airport bus"],
    stops:[
      { name:"Shimokitazawa vintage", area:"Shimokitazawa", cat:"Shopping", addr:"2-24-2 Kitazawa 155-0031", hrs:"11:00AM–9:00PM", note:"Tokyo's vintage capital. 2nd Street, indie boutiques", transit:{ line:"Odakyu", from:"Shinjuku", to:"Shimokitazawa", dur:"10 min · ¥160" }},
      { name:"Last Shinjuku shopping", area:"Shinjuku", cat:"Shopping", addr:"Various", hrs:"Varies", note:"Don Quijote (24h), Keio Mall, or anything you missed", transit:{ line:"Odakyu", from:"Shimokitazawa", to:"Shinjuku", dur:"10 min" }},
      { name:"Omoide Yokocho farewell dinner", area:"Shinjuku", cat:"Dinner", addr:"1-2 Nishishinjuku 160-0023", hrs:"Varies (many open late)", note:"Yakitori alley by West Exit. Cash only. ¥2-4k. Perfect last meal", transit:{ line:"Walk", from:"Hotel area", to:"West Exit", dur:"5 min" }},
      { name:"Haneda Airport T3", area:"Haneda", cat:"Transit", addr:"Hanedakuko, Ota City 144-0041", hrs:"24h", note:"✈️ Depart 10PM. Be at Busta by ~7PM", transit:{ line:"Limousine Bus", from:"Busta Shinjuku", to:"Haneda T3", dur:"~50 min · ¥2,800" }},
    ]},
];

/* ═══════════════ HELPERS ═══════════════ */
function parseHrs(hrs){
  if(!hrs||hrs==="—"||hrs==="24h"||hrs==="Varies"||hrs.includes("Timed")||hrs.includes("Train"))return null;
  const m=hrs.match(/(\d{1,2}):(\d{2})(AM|PM)/gi);
  if(!m||m.length<2)return null;
  const to24=s=>{const p=s.match(/(\d{1,2}):(\d{2})(AM|PM)/i);if(!p)return 0;let h=+p[1],mi=+p[2];if(p[3].toUpperCase()==="PM"&&h!==12)h+=12;if(p[3].toUpperCase()==="AM"&&h===12)h=0;return h*60+mi;};
  return{open:to24(m[0]),close:to24(m[m.length-1])};
}

function getStatus(hrs){
  const p=parseHrs(hrs);if(!p)return"unknown";
  const now=new Date();const jst=new Date(now.getTime()+(now.getTimezoneOffset()+540)*60000);
  const min=jst.getHours()*60+jst.getMinutes();
  if(min>=p.open&&min<p.close){const left=p.close-min;return left<=60?"closing":"open";}
  return"closed";
}

const SC={open:"#10B981",closing:"#F59E0B",closed:"#EF4444",unknown:"#6B7280"};
const ST={open:"Open",closing:"Closing soon",closed:"Closed",unknown:""};

function LineTag({line}){
  const c=LINES[line]||"#78716c";
  return(<span style={{background:`${c}18`,color:c,border:`1px solid ${c}44`,padding:"2px 8px",borderRadius:20,fontSize:11,fontWeight:700,whiteSpace:"nowrap",display:"inline-flex",alignItems:"center",gap:4}}>
    <span style={{width:6,height:6,borderRadius:3,background:c,flexShrink:0}}/>
    {line}
  </span>);
}

/* ═══════════════ MAIN COMPONENT ═══════════════ */
export default function App(){
  const[dayIdx,setDayIdx]=useState(0);
  const[visited,setVisited]=useState({});
  const[search,setSearch]=useState("");
  const[expanded,setExpanded]=useState(null);
  const day=DAYS[dayIdx];

  const filtered=useMemo(()=>{
    if(!search.trim())return day.stops;
    const q=search.toLowerCase();
    return day.stops.filter(s=>[s.name,s.area,s.cat,s.addr,s.note,s.hrs].some(v=>v&&v.toLowerCase().includes(q)));
  },[day,search]);

  const progress=useMemo(()=>{
    const t=day.stops.length;const d=day.stops.filter(s=>visited[day.id+":"+s.name]).length;
    return{done:d,total:t,pct:t?Math.round(d/t*100):0};
  },[day,visited]);

  const nextStop=useMemo(()=>day.stops.find(s=>!visited[day.id+":"+s.name]),[day,visited]);

  const mapsUrl=(n,a)=>`https://maps.apple.com/?q=${encodeURIComponent(n+", "+a)}`;
  const dirUrl=(n,a)=>`https://maps.apple.com/?daddr=${encodeURIComponent(n+", "+a)}&dirflg=r`;

  return(
    <div style={{minHeight:"100vh",background:"#0c0a09",color:"#fafaf9",fontFamily:"'SF Pro Display',-apple-system,'Segoe UI',sans-serif"}}>

      {/* ═══ STICKY HEADER ═══ */}
      <div style={{background:"linear-gradient(180deg,#1c1917,#171412)",borderBottom:"1px solid #292524",position:"sticky",top:0,zIndex:100,padding:"12px 16px 8px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
          <div>
            <div style={{fontSize:9,letterSpacing:3,color:"#78716c",textTransform:"uppercase",fontWeight:700}}>Tokyo 2026</div>
            <div style={{fontSize:18,fontWeight:800,lineHeight:1.2}}>{day.icon} {day.date}</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:22,fontWeight:800,color:progress.pct===100?"#10B981":"#fbbf24",lineHeight:1}}>{progress.pct}%</div>
            <div style={{fontSize:10,color:"#78716c"}}>{progress.done}/{progress.total}</div>
          </div>
        </div>
        <div style={{height:3,background:"#292524",borderRadius:2,overflow:"hidden",marginBottom:8}}>
          <div style={{height:"100%",width:`${progress.pct}%`,background:progress.pct===100?"#10B981":"linear-gradient(90deg,#f59e0b,#fbbf24)",borderRadius:2,transition:"width 0.5s ease"}}/>
        </div>
        {/* Day tabs */}
        <div style={{display:"flex",gap:4,overflowX:"auto",paddingBottom:2,scrollbarWidth:"none"}}>
          {DAYS.map((d,i)=>{
            const sel=i===dayIdx;
            return(<button key={d.id} onClick={()=>{setDayIdx(i);setSearch("");setExpanded(null);}}
              style={{padding:"5px 10px",borderRadius:10,border:sel?"1px solid #fbbf24":"1px solid transparent",
                background:sel?"rgba(251,191,36,0.12)":"transparent",color:sel?"#fbbf24":"#57534e",
                fontSize:11,fontWeight:sel?700:500,whiteSpace:"nowrap",cursor:"pointer",flexShrink:0,
                transition:"all 0.2s"}}>
              {d.icon} {d.date.split(" ")[1]}
            </button>);
          })}
        </div>
      </div>

      <div style={{padding:"12px 12px 140px"}}>

        {/* ═══ TITLE + TRANSPORT ═══ */}
        <div style={{fontSize:16,fontWeight:700,marginBottom:2}}>{day.title}</div>
        <div style={{fontSize:11,color:"#78716c",marginBottom:12}}>🚃 {day.transport}</div>

        {/* ═══ WARNINGS ═══ */}
        {day.warnings.length>0&&(
          <div style={{background:"rgba(251,191,36,0.06)",border:"1px solid rgba(251,191,36,0.15)",borderRadius:14,padding:"10px 12px",marginBottom:12}}>
            <div style={{fontSize:11,fontWeight:700,color:"#fbbf24",marginBottom:4}}>⚠️ Keep in mind</div>
            {day.warnings.map((w,i)=><div key={i} style={{fontSize:11,color:"#fde68a",marginBottom:2,lineHeight:1.4}}>• {w}</div>)}
          </div>
        )}

        {/* ═══ NEXT STOP BANNER ═══ */}
        {nextStop&&(
          <button onClick={()=>setExpanded(expanded===nextStop.name?null:nextStop.name)}
            style={{width:"100%",background:"linear-gradient(135deg,rgba(16,185,129,0.08),rgba(16,185,129,0.03))",border:"1px solid rgba(16,185,129,0.25)",borderRadius:14,padding:"10px 12px",marginBottom:12,cursor:"pointer",textAlign:"left"}}>
            <div style={{fontSize:9,color:"#6ee7b7",fontWeight:700,textTransform:"uppercase",letterSpacing:2}}>▶ Next stop</div>
            <div style={{fontSize:15,fontWeight:700,color:"#ecfdf5",marginTop:2}}>{nextStop.name}</div>
            <div style={{fontSize:11,color:"#a7f3d0"}}>{nextStop.area} · {nextStop.hrs}</div>
          </button>
        )}

        {/* ═══ SEARCH ═══ */}
        <input type="text" placeholder="🔍 Search stops, areas, notes..." value={search} onChange={e=>setSearch(e.target.value)}
          style={{width:"100%",boxSizing:"border-box",padding:"10px 14px",borderRadius:12,border:"1px solid #292524",background:"#1c1917",color:"#fafaf9",fontSize:13,outline:"none",marginBottom:14}}/>

        {/* ═══ STOPS ═══ */}
        {filtered.map((s,i)=>{
          const key=day.id+":"+s.name;
          const done=!!visited[key];
          const isExp=expanded===s.name;
          const status=getStatus(s.hrs);
          const sc=SC[status];

          return(
            <div key={s.name+i}>
              {/* ── Transit connector ── */}
              {s.transit&&(
                <div style={{display:"flex",gap:8,padding:"3px 0 3px 18px",marginLeft:14}}>
                  <div style={{width:2,background:LINES[s.transit.line]||"#44403c",flexShrink:0,borderRadius:1}}/>
                  <div style={{padding:"4px 0",flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",marginBottom:1}}>
                      <LineTag line={s.transit.line}/>
                      <span style={{fontSize:11,color:"#a8a29e",fontWeight:600}}>{s.transit.dur}</span>
                    </div>
                    <div style={{fontSize:10,color:"#57534e"}}>{s.transit.from} → {s.transit.to}{s.transit.walk?" · "+s.transit.walk:""}</div>
                  </div>
                </div>
              )}

              {/* ── Stop card ── */}
              <div style={{background:done?"rgba(16,185,129,0.04)":"#1c1917",border:`1px solid ${done?"rgba(16,185,129,0.15)":isExp?"#57534e":"#292524"}`,
                borderRadius:14,marginBottom:3,overflow:"hidden",transition:"all 0.15s"}}>

                <div onClick={()=>setExpanded(isExp?null:s.name)}
                  style={{display:"flex",alignItems:"center",gap:8,padding:"10px 12px",cursor:"pointer"}}>

                  {/* Check circle */}
                  <div onClick={e=>{e.stopPropagation();setVisited(v=>({...v,[key]:!v[key]}));}}
                    style={{width:26,height:26,minWidth:26,borderRadius:8,
                      border:`2px solid ${done?"#10B981":"#44403c"}`,background:done?"#10B981":"transparent",
                      display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:"#fff",cursor:"pointer",transition:"all 0.15s"}}>
                    {done&&"✓"}
                  </div>

                  {/* Name + area */}
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:5}}>
                      <span style={{fontSize:13,fontWeight:600,textDecoration:done?"line-through":"none",opacity:done?0.45:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.name}</span>
                      {status!=="unknown"&&<span style={{width:6,height:6,borderRadius:3,background:sc,flexShrink:0}}/>}
                    </div>
                    <div style={{fontSize:10,color:"#57534e"}}>{s.area} · {s.cat}</div>
                  </div>

                  {status!=="unknown"&&<span style={{fontSize:9,color:sc,fontWeight:700,whiteSpace:"nowrap"}}>{ST[status]}</span>}
                  <div style={{fontSize:9,color:"#44403c",transition:"transform 0.2s",transform:isExp?"rotate(180deg)":"rotate(0)"}}>▼</div>
                </div>

                {/* ── Expanded panel ── */}
                {isExp&&(
                  <div style={{padding:"0 12px 12px",borderTop:"1px solid #292524"}}>
                    <div style={{fontSize:12,lineHeight:1.5,padding:"8px 0",color:"#d6d3d1"}}>{s.note}</div>
                    <div style={{fontSize:11,color:"#78716c",marginBottom:3}}>📍 {s.addr}</div>
                    <div style={{fontSize:11,color:"#78716c",marginBottom:3}}>🕐 {s.hrs}</div>
                    {status!=="unknown"&&<div style={{fontSize:11,color:sc,fontWeight:600,marginBottom:8}}>● {ST[status]}</div>}

                    {s.addr!=="TBD"&&s.addr!=="Various"&&s.cat!=="Break"&&(
                      <div style={{display:"flex",gap:6}}>
                        <a href={dirUrl(s.name,s.addr)} target="_blank" rel="noreferrer"
                          style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:4,background:"#292524",color:"#fafaf9",padding:"9px",borderRadius:10,textDecoration:"none",fontSize:12,fontWeight:600,border:"1px solid #44403c"}}>
                          🧭 Directions
                        </a>
                        <a href={mapsUrl(s.name,s.addr)} target="_blank" rel="noreferrer"
                          style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:4,background:"#292524",color:"#fafaf9",padding:"9px",borderRadius:10,textDecoration:"none",fontSize:12,fontWeight:600,border:"1px solid #44403c"}}>
                          📍 Map
                        </a>
                      </div>
                    )}

                    {/* Transit to next */}
                    {i<filtered.length-1&&filtered[i+1].transit&&(
                      <div style={{marginTop:8,background:"#0c0a09",borderRadius:10,padding:"8px 10px",border:"1px solid #292524"}}>
                        <div style={{fontSize:9,color:"#78716c",fontWeight:700,marginBottom:3,textTransform:"uppercase",letterSpacing:1}}>🚃 To next stop</div>
                        <div style={{display:"flex",alignItems:"center",gap:5,flexWrap:"wrap"}}>
                          <LineTag line={filtered[i+1].transit.line}/>
                          <span style={{fontSize:11,color:"#a8a29e"}}>{filtered[i+1].transit.from} → {filtered[i+1].transit.to}</span>
                        </div>
                        <div style={{fontSize:12,color:"#fbbf24",fontWeight:600,marginTop:3}}>{filtered[i+1].transit.dur}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* ═══ EXTRAS ═══ */}
        {day.extras&&day.extras.length>0&&(
          <div style={{marginTop:14,background:"#1c1917",border:"1px solid #292524",borderRadius:14,padding:"12px"}}>
            <div style={{fontSize:12,fontWeight:700,color:"#fbbf24",marginBottom:6}}>✨ If the day ends early</div>
            {day.extras.map((e,i)=>(
              <div key={i} style={{fontSize:11,color:"#a8a29e",marginBottom:3}}>• <strong style={{color:"#d6d3d1"}}>{e.name}</strong> — {e.note}</div>
            ))}
          </div>
        )}

        {/* ═══ HOTEL CARD ═══ */}
        <div style={{marginTop:14,background:"linear-gradient(135deg,#1c1917,#292524)",border:"1px solid #44403c",borderRadius:14,padding:"12px"}}>
          <div style={{fontSize:13,fontWeight:700,marginBottom:4}}>🏨 {HOTEL.name}</div>
          <div style={{fontSize:11,color:"#a8a29e"}}>{HOTEL.addr}</div>
          <a href={dirUrl(HOTEL.name,HOTEL.addr)} target="_blank" rel="noreferrer"
            style={{display:"inline-block",marginTop:6,fontSize:11,color:"#fbbf24",textDecoration:"none",fontWeight:600}}>
            🧭 Directions to hotel →
          </a>
        </div>

        {/* ═══ QUICK REFERENCE ═══ */}
        <div style={{marginTop:14,background:"#1c1917",border:"1px solid #292524",borderRadius:14,padding:"12px"}}>
          <div style={{fontSize:12,fontWeight:700,marginBottom:8}}>📋 Quick Reference</div>
          {[
            ["🆘 Emergency","110 (Police) · 119 (Fire/Ambulance)"],
            ["🏥 Tourist Help","03-5321-3077 (Eng)"],
            ["💴 Tax-Free","¥5,500+ at one store. Passport required"],
            ["🚃 Suica/PASMO","Tap in/out. Recharge at any station machine"],
            ["🎌 Key Phrases","Sumimasen (excuse me) · Arigatou (thanks) · Ikura? (how much?)"],
            ["🧳 Coin Lockers","¥400-700. Available at every major station"],
          ].map(([label,text],i)=>(
            <div key={i} style={{marginBottom:5}}>
              <span style={{fontSize:11,fontWeight:600,color:"#d6d3d1"}}>{label}</span>
              <span style={{fontSize:11,color:"#78716c",marginLeft:6}}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        *{-webkit-tap-highlight-color:transparent;box-sizing:border-box}
        ::-webkit-scrollbar{display:none}
        input::placeholder{color:#57534e}
      `}</style>
    </div>
  );
}
