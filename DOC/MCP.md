# MCP Serverio Scenarijus: Automatinio Atsiliepimo Generavimas Su AI

## Aprašymas

Šiame scenarijuje MCP (Model Context Protocol) serveris veikia kaip tarpinė grandis tarp web aplikacijos bei dirbtinio intelekto (AI) sistemos. Mokytojui paspaudus mygtuką „Generuoti atsiliepimą“, mokinio suvesti rezultatai automatiškai siunčiami į MCP serverį, kuris perduoda duomenis pasirinktai AI sistemai (pvz., OpenAI GPT-4). AI grąžina personalizuotą, motyvuojantį atsiliepimo tekstą, matomą aplikacijoje.

---

## Architektūra

```mermaid
flowchart LR
    A[Web aplikacija] --POST JSON--> B[MCP serveris]
    B --API užklausa--> C[AI sistema (pvz., OpenAI GPT-4)]
    C --Atsakymas--> B
    B --Sugeneruotas tekstas--> A

## Duomenų užklausos pavyzdys

POST /generate-feedback
Content-Type: application/json

{
  "mokinio_vardas": "Jonas",
  "pamokos_pavadinimas": "Matematika",
  "pazymys": 9,
  "pasiekti_tikslai": ["Išmoko spręsti nelygybes", "Savarankiškai atliko užduotis"],
  "kompetencijos": ["Analitinė mąstysena", "Tikslumas"],
  "dorybės": ["Atsakomybė", "Kruopštumas"]
}

## Užklausos šablonas AI sistemai (prompt)
Sukurk draugišką ir motyvuojantį atsiliepimą mokiniui pagal šiuos duomenis:

Vardas: {{ mokinio_vardas }}
Pamoka: {{ pamokos_pavadinimas }}
Pažymys: {{ pazymys }}
Pasiekti tikslai: {{ pasiekti_tikslai }}
Kompetencijos: {{ kompetencijos }}
Dorybės: {{ dorybės }}

## Sugeneruoto atsiliepimo pavyzdys
Jonas puikiai pasirodė matematikos pamokoje! Gavęs 9 pažymį, jis puikiai įsisavino nelygybių sprendimo temą ir savarankiškai atliko užduotis. Jonas demonstravo stiprią analitinę mąstyseną bei tikslumą, o atsakomybė ir kruopštumas buvo aiškiai matomi jo darbuose. Sveikinu su puikiu pasiekimu ir linkiu toliau tobulėti!

## Privalumai
Viskas centralizuota MCP serveryje, frontend nereikia turėti prieigos prie AI raktų.
Paprastas ir greitas AI pritaikymas įvairiose švietimo aplikacijose.
Galima filtruoti ir formatuoti duomenis prieš siunčiant AI sistemai.

## Įgyvendinimo principas
Web aplikacijoje spaudžiamas mygtukas „Generuoti atsiliepimą“.
Frontendas siunčia užklausą į MCP serverį su mokinio duomenimis.
MCP serveris suformuoja ir išsiunčia užklausą AI sistemai.
AI sistema grąžina sugeneruotą atsiliepimą MCP serveriui.
MCP serveris perduoda generuotą tekstą atgal į web aplikaciją.
