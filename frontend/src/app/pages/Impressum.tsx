import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';

export default function Impressum() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold">Impressum</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 prose prose-gray dark:prose-invert">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-8">
          <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-0">
            ⚠️ <strong>WICHTIG:</strong> Bitte füllen Sie dieses Impressum mit Ihren echten Firmendaten aus. 
            Ein fehlendes oder unvollständiges Impressum kann Abmahnungen und Bußgelder bis zu €50.000 nach sich ziehen.
          </p>
        </div>

        <h2 className="text-xl font-semibold mb-4">Angaben gemäß § 5 TMG</h2>
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg mb-6">
          <p className="mb-2">
            <strong className="text-red-600">[FIRMENNAME HIER EINTRAGEN]</strong>
          </p>
          <p className="mb-2">
            <strong className="text-red-600">[Rechtsform: z.B. GmbH, UG (haftungsbeschränkt), GbR]</strong>
          </p>
          <p className="mb-2">
            <strong className="text-red-600">[Straße und Hausnummer]</strong>
          </p>
          <p className="mb-2">
            <strong className="text-red-600">[PLZ und Ort]</strong>
          </p>
          <p className="mb-0">Deutschland</p>
        </div>

        <h3 className="text-lg font-medium mb-3">Kontakt</h3>
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg mb-6">
          <p className="mb-2">
            Telefon: <strong className="text-red-600">[+49 (0) XXX XXXXXXX]</strong>
          </p>
          <p className="mb-2">
            E-Mail: <a href="mailto:kontakt@meetly.de" className="text-blue-600 dark:text-blue-400 hover:underline">
              kontakt@meetly.de
            </a>
          </p>
          <p className="mb-0">
            Website: <a href="https://www.meetly.de" className="text-blue-600 dark:text-blue-400 hover:underline">
              www.meetly.de
            </a>
          </p>
        </div>

        <h3 className="text-lg font-medium mb-3">Handelsregister</h3>
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg mb-6">
          <p className="mb-2">
            Registergericht: <strong className="text-red-600">[z.B. Amtsgericht München]</strong>
          </p>
          <p className="mb-0">
            Registernummer: <strong className="text-red-600">[z.B. HRB 123456]</strong>
          </p>
        </div>

        <h3 className="text-lg font-medium mb-3">Umsatzsteuer-Identifikationsnummer</h3>
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg mb-6">
          <p className="mb-0">
            Umsatzsteuer-Identifikationsnummer gemäß § 27a Umsatzsteuergesetz:<br />
            <strong className="text-red-600">DE [XXXXXXXXXXX]</strong>
          </p>
        </div>

        <h3 className="text-lg font-medium mb-3">Geschäftsführung</h3>
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg mb-6">
          <p className="mb-0">
            <strong className="text-red-600">[Name(n) des/der Geschäftsführer(s)]</strong>
          </p>
        </div>

        <h3 className="text-lg font-medium mb-3">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h3>
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg mb-6">
          <p className="mb-2">
            <strong className="text-red-600">[Vor- und Nachname]</strong>
          </p>
          <p className="mb-0">
            <strong className="text-red-600">[Vollständige Adresse]</strong>
          </p>
        </div>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">EU-Streitschlichtung</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: 
            <a 
              href="https://ec.europa.eu/consumers/odr/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline ml-1"
            >
              https://ec.europa.eu/consumers/odr/
            </a>
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            Unsere E-Mail-Adresse finden Sie oben im Impressum.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Verbraucherstreitbeilegung / Universalschlichtungsstelle</h2>
          <p className="text-gray-700 dark:text-gray-300">
            Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer 
            Verbraucherschlichtungsstelle teilzunehmen.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Haftung für Inhalte</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten 
            nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als 
            Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde 
            Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige 
            Tätigkeit hinweisen.
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den 
            allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch 
            erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei 
            Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend 
            entfernen.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Haftung für Links</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen 
            Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. 
            Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der 
            Seiten verantwortlich.
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße 
            überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar. 
            Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete 
            Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von 
            Rechtsverletzungen werden wir derartige Links umgehend entfernen.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Urheberrecht</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen 
            dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art 
            der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen 
            Zustimmung des jeweiligen Autors bzw. Erstellers.
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch 
            gestattet. Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden 
            die Urheberrechte Dritter beachtet. Insbesondere werden Inhalte Dritter als solche 
            gekennzeichnet. Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam werden, 
            bitten wir um einen entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen werden 
            wir derartige Inhalte umgehend entfernen.
          </p>
        </section>

        <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400">
          <p><strong>Quelle:</strong> Impressum-Generator von eRecht24</p>
          <p className="mb-0"><strong>Stand:</strong> Februar 2026</p>
        </div>
      </div>
    </div>
  );
}
