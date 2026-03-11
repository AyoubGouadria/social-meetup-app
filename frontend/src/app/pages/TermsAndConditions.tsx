import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';

export default function TermsAndConditions() {
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
          <h1 className="text-2xl font-bold">Allgemeine Geschäftsbedingungen (AGB)</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 prose prose-gray dark:prose-invert">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-8">
          <p className="text-sm text-red-800 dark:text-red-200 mb-2">
            <strong>🚨 ACHTUNG - RECHTLICHER HINWEIS:</strong>
          </p>
          <p className="text-sm text-red-800 dark:text-red-200 mb-0">
            Dies ist ein TEMPLATE. AGBs müssen von einem Fachanwalt für IT-Recht geprüft und 
            an Ihr spezifisches Geschäftsmodell angepasst werden. Unpassende AGBs können unwirksam 
            sein und in Abmahnungen resultieren. Kosten für anwaltliche Prüfung: €1.500-€3.000.
          </p>
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-400 mb-8">
          <p><strong>Geltungsbereich:</strong> Deutschland</p>
          <p><strong>Version:</strong> 1.0</p>
          <p><strong>Stand:</strong> Februar 2026</p>
        </div>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">§ 1 Geltungsbereich und Vertragsgegenstand</h2>
          
          <h3 className="text-lg font-medium mb-3 mt-6">1.1 Anbieter</h3>
          <p className="text-gray-700 dark:text-gray-300">
            Diese Allgemeinen Geschäftsbedingungen (AGB) regeln die Nutzung der Plattform "Meetly" 
            (im Folgenden "Plattform"), die von <strong className="text-red-600">[FIRMENNAME]</strong> 
            (im Folgenden "Anbieter" oder "wir") betrieben wird.
          </p>

          <h3 className="text-lg font-medium mb-3 mt-6">1.2 Leistungsbeschreibung</h3>
          <p className="text-gray-700 dark:text-gray-300">
            Meetly ist eine soziale Plattform, die es Nutzern ermöglicht:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li>Profile zu erstellen und zu verwalten</li>
            <li>Veranstaltungen zu erstellen, zu finden und daran teilzunehmen</li>
            <li>Mit anderen Nutzern in Kontakt zu treten</li>
            <li>In Event-Chatrooms zu kommunizieren</li>
            <li>Beitrittsanfragen zu versenden und zu bearbeiten</li>
          </ul>

          <h3 className="text-lg font-medium mb-3 mt-6">1.3 Geltung</h3>
          <p className="text-gray-700 dark:text-gray-300">
            Diese AGB gelten für alle Verträge zwischen dem Anbieter und den Nutzern über die 
            Nutzung der Plattform. Abweichende, entgegenstehende oder ergänzende AGB des Nutzers 
            werden nicht Vertragsbestandteil, es sei denn, ihrer Geltung wird ausdrücklich zugestimmt.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">§ 2 Vertragsschluss und Registrierung</h2>

          <h3 className="text-lg font-medium mb-3 mt-6">2.1 Registrierungsvoraussetzungen</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Die Nutzung der Plattform erfordert eine Registrierung. Zur Registrierung berechtigt sind:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li>Natürliche Personen, die das 18. Lebensjahr vollendet haben</li>
            <li>Geschäftsfähige Personen</li>
            <li>Personen mit Wohnsitz in Deutschland oder der EU</li>
          </ul>

          <h3 className="text-lg font-medium mb-3 mt-6">2.2 Registrierungsprozess</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Bei der Registrierung sind folgende Pflichtangaben zu machen:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li>Name</li>
            <li>E-Mail-Adresse</li>
            <li>Passwort</li>
            <li>Stadt</li>
            <li>Sprachen</li>
            <li>Bestätigung der Volljährigkeit (18+)</li>
          </ul>

          <h3 className="text-lg font-medium mb-3 mt-6">2.3 Vertragsschluss</h3>
          <p className="text-gray-700 dark:text-gray-300">
            Mit dem Absenden der Registrierung gibt der Nutzer ein verbindliches Angebot zum 
            Abschluss eines Nutzungsvertrags ab. Der Anbieter nimmt dieses Angebot durch die 
            Freischaltung des Zugangs an. Mit der Freischaltung kommt der Nutzungsvertrag zustande.
          </p>

          <h3 className="text-lg font-medium mb-3 mt-6">2.4 Wahrheitsgemäße Angaben</h3>
          <p className="text-gray-700 dark:text-gray-300">
            Der Nutzer verpflichtet sich, bei der Registrierung wahre, vollständige und aktuelle 
            Angaben zu machen und diese bei Änderungen unverzüglich zu aktualisieren.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">§ 3 Nutzungsrechte und Pflichten</h2>

          <h3 className="text-lg font-medium mb-3 mt-6">3.1 Nutzungsberechtigung</h3>
          <p className="text-gray-700 dark:text-gray-300">
            Der Nutzer erhält ein nicht-exklusives, nicht-übertragbares, jederzeit widerrufbares 
            Recht zur Nutzung der Plattform im Rahmen dieser AGB.
          </p>

          <h3 className="text-lg font-medium mb-3 mt-6">3.2 Verbotene Handlungen</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Der Nutzer verpflichtet sich, folgende Handlungen zu unterlassen:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li>Verbreitung illegaler, beleidigender, bedrohlicher, obszöner oder diffamierender Inhalte</li>
            <li>Verstoß gegen Persönlichkeitsrechte, Urheberrechte oder sonstige Rechte Dritter</li>
            <li>Spam, Werbung oder kommerzielle Nutzung ohne Zustimmung</li>
            <li>Verbreitung von Viren, Malware oder schädlichem Code</li>
            <li>Umgehung technischer Schutzmaßnahmen</li>
            <li>Automatisierte Zugriffe (Bots, Scraping) ohne Erlaubnis</li>
            <li>Erstellung mehrerer Accounts ohne berechtigten Grund</li>
            <li>Weitergabe der Zugangsdaten an Dritte</li>
            <li>Belästigung, Stalking oder Diskriminierung anderer Nutzer</li>
          </ul>

          <h3 className="text-lg font-medium mb-3 mt-6">3.3 Inhalteverantwortung</h3>
          <p className="text-gray-700 dark:text-gray-300">
            Der Nutzer ist für alle von ihm hochgeladenen, geteilten oder anderweitig übermittelten 
            Inhalte (Texte, Bilder, Videos) selbst verantwortlich und stellt den Anbieter von allen 
            Ansprüchen Dritter frei, die aus einer Rechtsverletzung durch diese Inhalte resultieren.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">§ 4 Rechte an Nutzerinhalten</h2>

          <h3 className="text-lg font-medium mb-3 mt-6">4.1 Eingeräumte Rechte</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Der Nutzer räumt dem Anbieter für die Dauer der Nutzung folgende Rechte an den 
            hochgeladenen Inhalten ein:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li>Recht zur Speicherung und Anzeige auf der Plattform</li>
            <li>Recht zur Vervielfältigung zu Backup-Zwecken</li>
            <li>Recht zur Anzeige für andere Nutzer gemäß Privatsphäre-Einstellungen</li>
          </ul>

          <h3 className="text-lg font-medium mb-3 mt-6">4.2 Keine Übertragung von Eigentumsrechten</h3>
          <p className="text-gray-700 dark:text-gray-300">
            Der Nutzer behält alle Eigentumsrechte an seinen Inhalten. Die Einräumung der Rechte 
            erfolgt unentgeltlich und endet mit der Löschung der Inhalte oder Beendigung des 
            Nutzungsvertrags.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">§ 5 Datenschutz</h2>
          <p className="text-gray-700 dark:text-gray-300">
            Die Verarbeitung personenbezogener Daten erfolgt ausschließlich nach Maßgabe der 
            Datenschutzerklärung, die unter <a href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">diesem Link</a> abrufbar ist.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">§ 6 Verfügbarkeit und Änderungen</h2>

          <h3 className="text-lg font-medium mb-3 mt-6">6.1 Verfügbarkeit</h3>
          <p className="text-gray-700 dark:text-gray-300">
            Der Anbieter strebt eine hohe Verfügbarkeit der Plattform an, übernimmt jedoch keine 
            Garantie für eine ununterbrochene oder fehlerfreie Verfügbarkeit. Insbesondere können 
            Wartungsarbeiten, technische Störungen oder höhere Gewalt zu vorübergehenden 
            Beeinträchtigungen führen.
          </p>

          <h3 className="text-lg font-medium mb-3 mt-6">6.2 Änderungen der Plattform</h3>
          <p className="text-gray-700 dark:text-gray-300">
            Der Anbieter behält sich das Recht vor, die Plattform jederzeit zu ändern, zu erweitern 
            oder einzustellen. Bei wesentlichen Änderungen werden Nutzer rechtzeitig informiert.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">§ 7 Sperrung und Löschung</h2>

          <h3 className="text-lg font-medium mb-3 mt-6">7.1 Sperrung bei Verstößen</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Der Anbieter ist berechtigt, den Account eines Nutzers vorübergehend zu sperren oder 
            dauerhaft zu löschen, wenn:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
            <li>Der Nutzer gegen diese AGB verstößt</li>
            <li>Der Nutzer gegen geltendes Recht verstößt</li>
            <li>Der Nutzer Rechte Dritter verletzt</li>
            <li>Der begründete Verdacht auf betrügerische Aktivitäten besteht</li>
          </ul>

          <h3 className="text-lg font-medium mb-3 mt-6">7.2 Kontolöschung durch Nutzer</h3>
          <p className="text-gray-700 dark:text-gray-300">
            Der Nutzer kann sein Konto jederzeit in den Einstellungen löschen. Die Löschung erfolgt 
            gemäß DSGVO innerhalb von 30 Tagen. Details zur Datenlöschung finden sich in der 
            Datenschutzerklärung.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">§ 8 Haftung</h2>

          <h3 className="text-lg font-medium mb-3 mt-6">8.1 Haftung des Anbieters</h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Der Anbieter haftet unbeschränkt für Vorsatz und grobe Fahrlässigkeit sowie für 
            Schäden aus der Verletzung des Lebens, des Körpers oder der Gesundheit.
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Bei leichter Fahrlässigkeit haftet der Anbieter nur bei Verletzung wesentlicher 
            Vertragspflichten (Kardinalpflichten). In diesem Fall ist die Haftung auf den 
            vertragstypischen, vorhersehbaren Schaden begrenzt.
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            Für den Verlust von Daten haftet der Anbieter nur, soweit dieser Verlust durch 
            angemessene Datensicherungsmaßnahmen des Nutzers nicht vermeidbar gewesen wäre.
          </p>

          <h3 className="text-lg font-medium mb-3 mt-6">8.2 Haftung für Nutzerinhalte</h3>
          <p className="text-gray-700 dark:text-gray-300">
            Der Anbieter haftet nicht für Inhalte, die von Nutzern erstellt, hochgeladen oder 
            geteilt werden. Der Anbieter macht sich diese Inhalte nicht zu eigen.
          </p>

          <h3 className="text-lg font-medium mb-3 mt-6">8.3 Haftung für Links</h3>
          <p className="text-gray-700 dark:text-gray-300">
            Der Anbieter haftet nicht für Inhalte externer Links, die von Nutzern geteilt werden.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">§ 9 Laufzeit und Kündigung</h2>

          <h3 className="text-lg font-medium mb-3 mt-6">9.1 Vertragslaufzeit</h3>
          <p className="text-gray-700 dark:text-gray-300">
            Der Nutzungsvertrag wird auf unbestimmte Zeit geschlossen.
          </p>

          <h3 className="text-lg font-medium mb-3 mt-6">9.2 Ordentliche Kündigung</h3>
          <p className="text-gray-700 dark:text-gray-300">
            Beide Parteien können den Vertrag jederzeit ohne Einhaltung einer Frist kündigen. 
            Die Kündigung durch den Nutzer erfolgt durch Löschung des Accounts in den Einstellungen.
          </p>

          <h3 className="text-lg font-medium mb-3 mt-6">9.3 Außerordentliche Kündigung</h3>
          <p className="text-gray-700 dark:text-gray-300">
            Das Recht zur außerordentlichen Kündigung aus wichtigem Grund bleibt unberührt.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">§ 10 Änderungen der AGB</h2>

          <h3 className="text-lg font-medium mb-3 mt-6">10.1 Änderungsrecht</h3>
          <p className="text-gray-700 dark:text-gray-300">
            Der Anbieter behält sich vor, diese AGB zu ändern, soweit dies erforderlich ist 
            (z.B. bei Gesetzesänderungen, neuen Funktionen oder Rechtsprechung).
          </p>

          <h3 className="text-lg font-medium mb-3 mt-6">10.2 Benachrichtigung</h3>
          <p className="text-gray-700 dark:text-gray-300">
            Über Änderungen werden Nutzer mindestens 30 Tage vor Inkrafttreten per E-Mail informiert. 
            Widerspricht der Nutzer der Änderung nicht innerhalb von 30 Tagen, gelten die neuen AGB 
            als angenommen. Der Nutzer wird in der Änderungsmitteilung auf sein Widerspruchsrecht 
            und die Bedeutung der Frist hingewiesen.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">§ 11 Schlussbestimmungen</h2>

          <h3 className="text-lg font-medium mb-3 mt-6">11.1 Anwendbares Recht</h3>
          <p className="text-gray-700 dark:text-gray-300">
            Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts 
            (CISG) und der Kollisionsnormen des internationalen Privatrechts.
          </p>

          <h3 className="text-lg font-medium mb-3 mt-6">11.2 Gerichtsstand</h3>
          <p className="text-gray-700 dark:text-gray-300">
            Gerichtsstand ist, soweit gesetzlich zulässig, <strong className="text-red-600">[Stadt eintragen, z.B. München]</strong>.
          </p>

          <h3 className="text-lg font-medium mb-3 mt-6">11.3 Salvatorische Klausel</h3>
          <p className="text-gray-700 dark:text-gray-300">
            Sollten einzelne Bestimmungen dieser AGB unwirksam oder undurchführbar sein oder werden, 
            berührt dies die Wirksamkeit der übrigen Bestimmungen nicht. Die unwirksame Bestimmung 
            ist durch eine wirksame zu ersetzen, die dem wirtschaftlichen Zweck der unwirksamen am 
            nächsten kommt.
          </p>
        </section>

        <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
              <strong>📧 Kontakt</strong>
            </p>
            <p className="text-sm text-blue-800 dark:text-blue-200 mb-0">
              Bei Fragen zu diesen AGB kontaktieren Sie uns bitte unter: 
              <a href="mailto:legal@meetly.de" className="underline ml-1">legal@meetly.de</a>
            </p>
          </div>
        </div>

        <div className="mt-8 text-sm text-gray-600 dark:text-gray-400">
          <p className="mb-0"><strong>Stand:</strong> Februar 2026 | <strong>Version:</strong> 1.0</p>
        </div>
      </div>
    </div>
  );
}
