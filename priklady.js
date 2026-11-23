// =========================================================
// zdroje-biblatex — ukázkové zdroje (hlavně knihy v různých podobách)
// Jen k prohlédnutí: student vidí, jak se vyplní formulář a jak vypadá záznam.
// Údaje ověřeny v Souborném katalogu ČR (knihovny.cz) a Open Library, 2026-11-23.
// extra = pole, která formulář nemá (překladatel, edice …); připojí se beze změny.
// =========================================================
const A = (last, first = '', inst = false) => ({ last, first, inst });

export const PRIKLADY = [
  { varianta: 'Kniha jednoho autora s podnázvem',
    tip: 'Podnázev (část za dvojtečkou) patří do zvláštního pole. První vydání se neuvádí.',
    type: 'book', values: { author: [A('Kosek', 'Jiří')], title: 'XML pro každého', subtitle: 'podrobný průvodce',
      location: 'Praha', publisher: 'Grada', year: '2000', isbn: '80-7169-860-1' } },

  { varianta: 'Více autorů, druhé vydání, překlad',
    tip: 'Každý autor na samostatný řádek. Vydání jen číslem (2). Překladatele lze doplnit polem translator.',
    type: 'book', values: { author: [A('Halliday', 'David'), A('Resnick', 'Robert'), A('Walker', 'Jearl')],
      title: 'Fyzika', edition: '2', location: 'Brno', publisher: 'VUTIUM', year: '2013', isbn: '978-80-214-4123-1' } },

  { varianta: 'Zahraniční kniha, čtyři autoři',
    tip: 'Název se nepřekládá. „3rd edition“ → vydání 3. Uveďte všechny autory, zkracování zařídí LaTeX.',
    type: 'book', values: { author: [A('Cormen', 'Thomas H.'), A('Leiserson', 'Charles E.'), A('Rivest', 'Ronald L.'), A('Stein', 'Clifford')],
      title: 'Introduction to Algorithms', edition: '3', location: 'Cambridge, MA', publisher: 'MIT Press', year: '2009',
      isbn: '978-0-262-03384-8' } },

  { varianta: 'Kapitola z knihy (autor kapitoly = autor knihy)',
    tip: 'Druh „Kapitola v knize“: název kapitoly + název knihy + strany kapitoly.',
    type: 'inbook', values: { author: [A('Cormen', 'Thomas H.'), A('Leiserson', 'Charles E.'), A('Rivest', 'Ronald L.'), A('Stein', 'Clifford')],
      title: 'Getting Started', booktitle: 'Introduction to Algorithms', edition: '3', location: 'Cambridge, MA',
      publisher: 'MIT Press', year: '2009', pages: '16-42', isbn: '978-0-262-03384-8' } },

  { varianta: 'Instituce jako autor',
    tip: 'U autora zaškrtněte „instituce“ — jinak LaTeX vysází „ÚŘAD, Český statistický“.',
    type: 'book', values: { author: [A('Český statistický úřad', '', true)], title: 'Statistická ročenka České republiky 2023',
      location: 'Praha', publisher: 'Český statistický úřad', year: '2023', isbn: '978-80-250-3427-9' } },

  { varianta: 'Beletrie — nové vydání starého díla',
    tip: 'Cituje se vydání, které máte v ruce (rok a nakladatel z tiráže), ne rok prvního vydání (1936).',
    type: 'book', values: { author: [A('Čapek', 'Karel')], title: 'Válka s Mloky', location: 'Praha', publisher: 'Fragment',
      year: '2010', isbn: '978-80-253-1078-6' } },

  { varianta: 'E-kniha (online)',
    tip: 'Médium „online“, adresa a datum, kdy jste knihu četli. ISBN e-knihy bývá jiné než u tištěné.',
    type: 'book', values: { author: [A('Čapek', 'Karel')], title: 'Válka s Mloky', location: 'Praha',
      publisher: 'Městská knihovna v Praze', year: '2018', isbn: '978-80-7587-101-5', howpublished: 'online',
      url: 'https://www.knihovny.cz/Record/bookport.535147298', urldate: '2026-11-23' } },

  { varianta: 'Audiokniha na CD',
    tip: 'Druh „Hudba, zvukový záznam“, médium CD.',
    type: 'music', values: { author: [A('Čapek', 'Karel')], title: 'Válka s mloky', howpublished: 'audiokniha; CD',
      location: 'Praha', publisher: 'Tympanum', year: '2021' } },

  { varianta: 'Antický filozof v překladu',
    tip: 'Autor má jen jedno jméno → jen pole „Příjmení“. Překladatele přidává pole translator (formulář ho zachová).',
    type: 'book', values: { author: [A('Platón')], title: 'Ústava', edition: '6', location: 'Praha', publisher: 'OIKOYMENH',
      year: '2017', isbn: '978-80-7298-230-1' },
    extra: { translator: '{Novotný, František}' } },

  { varianta: 'Latinské dílo v překladu, dva nakladatelé, edice',
    tip: 'Dvě místa a dva nakladatelé spojte slovem „and“. Edice (series) se píše jako další pole.',
    type: 'book', values: { author: [A('Newton', 'Isaac')], title: 'Matematické principy přírodní filozofie',
      subtitle: 'výbor z díla',
      location: 'Praha and Brno', publisher: 'Togga and Masarykova univerzita', year: '2020', isbn: '978-80-210-9558-8' },
    extra: { translator: '{Franek, Juraj and Durnová, Helena and Novotný, Jan and Svobodová, Jindřiška}',
             series: '{Fontes scientiae}' } },

  { varianta: 'Dílo bez autora: Bible',
    tip: 'Autor není → druh „Jiný zdroj“, záznam začíná názvem. V textu se cituje knihou a veršem, např. (Gn 1,1).',
    type: 'misc', values: { title: 'Bible', subtitle: 'Písmo svaté Starého a Nového zákona: český ekumenický překlad',
      location: 'Praha', publisher: 'Česká biblická společnost', year: '2017' },
    extra: { edition: '{20}' } },

  { varianta: 'Dílo bez autora v překladu: Epos o Gilgamešovi',
    tip: 'Starověký anonymní text → „Jiný zdroj“; překladatel je důležitý, uveďte ho.',
    type: 'misc', values: { title: 'Epos o Gilgamešovi', location: 'Praha', publisher: 'Garamond', year: '2018' },
    extra: { translator: '{Matouš, Lubor}', isbn: '{978-80-7407-427-1}' } },
];
